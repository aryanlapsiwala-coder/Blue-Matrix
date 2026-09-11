import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmailAuth } from '../src/services/emailAuth.js';

test('requesting a sign-in code never creates an account or grants a session', async () => {
  let sent;
  const auth = createEmailAuth({ auth: { signInWithOtp: async (args) => { sent = args; return { error: null }; } } });
  const result = await auth.requestCode({ email: ' Member@Example.com ' });
  assert.equal(sent.email, 'member@example.com');
  assert.equal(sent.options.shouldCreateUser, false);
  assert.deepEqual(result, { email: 'member@example.com', requiresVerification: true });
});

test('registration sends profile metadata but cannot self-assign an administrator role', async () => {
  let sent;
  const auth = createEmailAuth({ auth: { signInWithOtp: async (args) => { sent = args; return { error: null }; } } });
  const result = await auth.requestCode({ email: 'new@example.com', profile: { name: ' New Member ', role: 'ADMIN', rollNumber: '2026-1' } });
  assert.equal(sent.options.shouldCreateUser, true);
  assert.equal(sent.options.data.role, 'STUDENT');
  assert.equal(sent.options.data.roll_number, '2026-1');
  assert.equal(result.user, undefined);
  assert.equal(result.session, undefined);
});

test('delivery failures and unconfigured authentication remain errors', async () => {
  await assert.rejects(createEmailAuth(null).requestCode({ email: 'new@example.com' }), /unavailable/);
  const auth = createEmailAuth({ auth: { signInWithOtp: async () => ({ error: new Error('Rate limit reached') }) } });
  await assert.rejects(auth.requestCode({ email: 'new@example.com' }), /Rate limit/);
});

test('incomplete, expired and unverified codes cannot sign a user in', async () => {
  const auth = createEmailAuth({ auth: { verifyOtp: async () => ({ error: new Error('expired') }) } });
  await assert.rejects(auth.verifyCode({ email: 'new@example.com', token: '123' }), /complete/);
  await assert.rejects(auth.verifyCode({ email: 'new@example.com', token: '123456' }), /expired/);
  const unverified = createEmailAuth({ auth: { verifyOtp: async () => ({ data: { session: { access_token: 'token', user: {} } } }) } });
  await assert.rejects(unverified.verifyCode({ email: 'new@example.com', token: '123456' }), /did not complete/);
});

test('only a Supabase-verified email session is returned', async () => {
  const session = { access_token: 'verified-token', user: { id: 'owner', email_confirmed_at: '2026-09-11' } };
  const auth = createEmailAuth({ auth: { verifyOtp: async (args) => {
    assert.deepEqual(args, { email: 'new@example.com', token: '123456', type: 'email' });
    return { data: { session }, error: null };
  } } });
  assert.equal(await auth.verifyCode({ email: 'New@Example.com', token: ' 123456 ' }), session);
});
