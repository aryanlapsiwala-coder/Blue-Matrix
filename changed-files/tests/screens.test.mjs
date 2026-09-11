import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

const temporary = await mkdtemp(resolve('tests/.screens-'));
after(() => rm(temporary, { recursive: true, force: true }));
const preventDefault = () => {};
const mocks = {
  useAuth: 'export const useAuth = () => globalThis.__auth;',
  authService: 'export const demoEnabled = false; export const DEMO_USERS = {}; export const authService = new Proxy({}, {get: (_, key) => (...args) => globalThis.__authService[key](...args)});',
  knowledgeService: 'export const knowledgeService = new Proxy({}, {get: (_, key) => (...args) => globalThis.__knowledge[key](...args)});',
  supabaseClient: 'export const supabase = null; export const isSupabaseConfigured = false;',
  OnboardingModal: 'export const OnboardingModal = () => null;',
  GlobalDnsCloudModal: 'export const GlobalDnsCloudModal = () => null;',
  'interactive-dot-background': 'export const InteractiveDotBackground = () => null;',
};
async function component(path, name) {
  const outfile = resolve(temporary, `${name}.mjs`);
  await build({ entryPoints: [resolve(path)], outfile, bundle: true, platform: 'node', format: 'esm',
    external: ['react', 'react-dom', 'react-router-dom'], alias: { '@': resolve('src') },
    plugins: [{ name: 'isolated-services', setup(builder) {
      builder.onResolve({ filter: /./ }, (args) => {
        const key = args.path.split('/').at(-1).replace(/\.(jsx?|tsx?)$/, '');
        return mocks[key] ? { path: key, namespace: 'mock' } : undefined;
      });
      builder.onLoad({ filter: /.*/, namespace: 'mock' }, (args) => ({ contents: mocks[args.path], loader: 'js' }));
    } }],
  });
  return (await import(pathToFileURL(outfile)))[name];
}
function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
}
function reset() {
  globalThis.localStorage = memoryStorage();
  globalThis.sessionStorage = memoryStorage();
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  globalThis.__auth = {};
}
async function render(Component, props = {}) {
  let tree;
  await act(async () => { tree = Renderer.create(React.createElement(MemoryRouter, { future: { v7_startTransition: true, v7_relativeSplatPath: true } }, React.createElement(Component, props))); });
  return tree;
}
const screenText = (tree) => JSON.stringify(tree.toJSON());
const buttons = (tree, label) => tree.root.findAllByType('button').filter((button) => button.children.join('') === label);

test('sign-in stays on verification after an invalid code, then continues after a valid code', async () => {
  reset(); let verified = false;
  globalThis.__auth = {
    login: async ({ email }) => ({ email, requiresVerification: true }),
    verifyEmail: async ({ token }) => { if (token !== '654321') throw new Error('Invalid or expired code'); verified = true; },
  };
  const Login = await component('src/pages/Login.jsx', 'Login');
  const tree = await render(Login);
  try {
    await act(async () => tree.root.findByProps({ id: 'login-email' }).props.onChange({ target: { value: 'member@example.com' } }));
    await act(async () => tree.root.findByType('form').props.onSubmit({ preventDefault }));
    assert.equal(verified, false);
    assert.match(screenText(tree), /Verify your email/);
    assert.equal(buttons(tree, 'ADMIN').length, 0);
    await act(async () => tree.root.findByProps({ id: 'email-code' }).props.onChange({ target: { value: '123456' } }));
    await act(async () => tree.root.findByType('form').props.onSubmit({ preventDefault }));
    assert.match(screenText(tree), /Invalid or expired code/);
    assert.equal(verified, false);
    await act(async () => tree.root.findByProps({ id: 'email-code' }).props.onChange({ target: { value: '654321' } }));
    await act(async () => tree.root.findByType('form').props.onSubmit({ preventDefault }));
    assert.equal(verified, true);
  } finally { act(() => tree.unmount()); }
});

test('registration requires the email code before onboarding', async () => {
  reset(); let verified = false;
  globalThis.__auth = { register: async ({ email }) => ({ email, requiresVerification: true }), verifyEmail: async () => { verified = true; return { name: 'New Student' }; } };
  const Register = await component('src/pages/Register.jsx', 'Register');
  const tree = await render(Register);
  try {
    for (const [name, value] of [['name', 'New Student'], ['email', 'new@example.com'], ['rollNumber', '2026-123']]) {
      await act(async () => tree.root.findByProps({ name }).props.onChange({ target: { name, value } }));
    }
    await act(async () => tree.root.findByType('form').props.onSubmit({ preventDefault }));
    assert.equal(verified, false);
    assert.match(screenText(tree), /Verify your email/);
    await act(async () => tree.root.findByProps({ id: 'email-code' }).props.onChange({ target: { value: '123456' } }));
    await act(async () => tree.root.findByType('form').props.onSubmit({ preventDefault }));
    assert.equal(verified, true);
    assert.equal(tree.root.findAllByProps({ id: 'email-code' }).length, 0);
  } finally { act(() => tree.unmount()); }
});

test('comment controls use account IDs, preserve failed changes, and persist edits/deletions', async () => {
  reset(); let failDelete = true; let lastSaved;
  let rows = [{ id: 'one', authUserId: 'owner', user: 'Same Name', role: 'STUDENT', text: 'My comment', time: 'Today' },
    { id: 'two', authUserId: 'other', user: 'Same Name', role: 'STUDENT', text: 'Other comment', time: 'Today' }];
  globalThis.__knowledge = {
    getComments: async () => rows,
    editComment: async (_, id, text) => { rows = rows.map((row) => row.id === id ? { ...row, text, edited: true } : row); return rows.find((row) => row.id === id); },
    deleteComment: async (_, id) => { if (failDelete) throw new Error('Connection lost. Please try again.'); rows = rows.filter((row) => row.id !== id); },
  };
  const Thread = await component('src/components/common/CommentThread.jsx', 'CommentThread');
  const tree = await render(Thread, { entryId: 'post', authUserId: 'owner', onCommentsChange: (_, value) => { lastSaved = value; } });
  try {
    assert.equal(buttons(tree, 'Edit').length, 1);
    assert.equal(buttons(tree, 'Delete').length, 1);
    await act(async () => buttons(tree, 'Edit')[0].props.onClick());
    await act(async () => tree.root.findByProps({ 'aria-label': 'Edit comment' }).props.onChange({ target: { value: 'Edited by owner' } }));
    await act(async () => tree.root.findAllByType('form')[0].props.onSubmit({ preventDefault }));
    assert.match(screenText(tree), /Edited by owner/);
    assert.equal(lastSaved[0].edited, true);
    await act(async () => buttons(tree, 'Delete')[0].props.onClick());
    assert.match(screenText(tree), /Delete this comment/);
    await act(async () => buttons(tree, 'Delete')[0].props.onClick());
    assert.match(screenText(tree), /Connection lost/);
    assert.equal(lastSaved.length, 2);
    failDelete = false;
    await act(async () => buttons(tree, 'Delete')[0].props.onClick());
    assert.equal(lastSaved.length, 1);
    assert.match(screenText(tree), /Other comment/);
    assert.doesNotMatch(screenText(tree), /Edited by owner/);
  } finally { act(() => tree.unmount()); }
  const reloaded = await render(Thread, { entryId: 'post', authUserId: 'owner', onCommentsChange() {} });
  assert.doesNotMatch(screenText(reloaded), /Edited by owner/);
  act(() => reloaded.unmount());
});

test('auth context ignores cached fake sessions and only accepts the completed verification', async () => {
  reset();
  localStorage.setItem('knowpass_user', JSON.stringify({ role: 'ADMIN' }));
  localStorage.setItem('knowpass_access_token', 'old_fake_token');
  globalThis.__authService = {
    getCurrentUser: async () => null,
    login: async () => ({ email: 'member@example.com', requiresVerification: true }),
    register: async () => ({ email: 'member@example.com', requiresVerification: true }),
    verifyEmail: async () => ({ id: 'profile', authId: 'owner', emailVerified: true, role: 'STUDENT' }),
    logout: async () => {},
  };
  const Provider = await component('src/context/AuthContext.jsx', 'AuthProvider');
  const { AuthContext } = await import(pathToFileURL(resolve(temporary, 'AuthProvider.mjs')));
  let context; let tree;
  function Observe() { context = React.useContext(AuthContext); return null; }
  await act(async () => { tree = Renderer.create(React.createElement(Provider, null, React.createElement(Observe))); });
  try {
    assert.equal(context.isAuthenticated, false);
    await act(async () => context.login({ email: 'member@example.com' }));
    assert.equal(context.isAuthenticated, false);
    await act(async () => context.register({ email: 'member@example.com' }));
    assert.equal(context.isAuthenticated, false);
    await act(async () => context.verifyEmail({ email: 'member@example.com', token: '123456' }));
    assert.equal(context.isAuthenticated, true);
    await act(async () => context.switchRole('ADMIN'));
    assert.equal(context.role, 'STUDENT');
    await act(async () => context.logout());
    assert.equal(context.isAuthenticated, false);
  } finally { act(() => tree.unmount()); }
});
