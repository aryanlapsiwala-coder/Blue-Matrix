import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const unverified = '33333333-3333-4333-8333-333333333333';
const legacy = '44444444-4444-4444-8444-444444444444';
const legacyProfile = '55555555-5555-4555-8555-555555555555';
const entry = '66666666-6666-4666-8666-666666666666';

async function asUser(id, operation, role = 'authenticated') {
  await db.exec('BEGIN');
  try {
    await db.exec(`SET LOCAL ROLE ${role}`);
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [id || '']);
    const result = await operation();
    await db.exec('COMMIT');
    return result;
  } catch (error) { await db.exec('ROLLBACK'); throw error; }
}
const profile = (id) => asUser(id, () => db.query('SELECT public.ensure_own_profile() AS profile'));

before(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;`);
  const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
  await db.exec(schema.replace(/^CREATE EXTENSION.*;$/gm, ''));
  await db.exec('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated');
  for (const [id, email, confirmed, role] of [[owner, 'owner@example.com', true, 'ALUMNI'], [other, 'other@example.com', true, 'ADMIN'], [unverified, 'pending@example.com', false, 'STUDENT'], [legacy, 'legacy@example.com', true, 'STUDENT']]) {
    await db.query('INSERT INTO auth.users VALUES ($1, $2, $3, $4)', [id, email, confirmed ? '2026-09-11' : null, JSON.stringify({ name: 'Same Name', role })]);
  }
  await db.query("INSERT INTO public.profiles (id, name, email, role, department) VALUES ($1, 'Legacy Admin', 'legacy@example.com', 'ADMIN', 'IT')", [legacyProfile]);
  const migration = await readFile(new URL('../supabase/migrations/20260911_email_verification_comments.sql', import.meta.url), 'utf8');
  await db.exec(migration);
  await db.exec(migration); // Reapplying must preserve data and not duplicate policies.
  await profile(owner); await profile(other);
  await db.query("INSERT INTO public.knowledge_entries (id, title, category, knowledge_type, department, author_name, author_role, summary, content) VALUES ($1, 'Post', 'Notes', 'Notes', 'IT', 'Author', 'STUDENT', 'Summary', 'Content')", [entry]);
});
after(() => db.close());

test('profile creation requires a verified account and preserves existing identities', async () => {
  await assert.rejects(profile(unverified), /Verify your email/);
  await assert.rejects(asUser(null, () => db.query('SELECT public.ensure_own_profile()'), 'anon'), /permission denied/);
  const existing = (await profile(legacy)).rows[0].profile;
  assert.equal(existing.id, legacyProfile);
  assert.equal(existing.auth_id, legacy);
  assert.equal(existing.role, 'ADMIN');
  await asUser(legacy, () => db.query("INSERT INTO public.profiles (id, email, name, role, department) VALUES ($1, 'legacy@example.com', 'Legacy Admin', 'ADMIN', 'IT') ON CONFLICT (email) DO UPDATE SET name = excluded.name, role = excluded.role", [legacyProfile]));
  assert.equal((await profile(other)).rows[0].profile.role, 'STUDENT');
  assert.equal((await profile(owner)).rows[0].profile.role, 'ALUMNI');
});

test('profile editing still works, but clients cannot reassign account identity or role', async () => {
  await asUser(owner, () => db.query("INSERT INTO public.profiles (id, email, name, role, department) VALUES ($1, 'owner@example.com', 'Updated Name', 'ALUMNI', 'IT') ON CONFLICT (email) DO UPDATE SET name = excluded.name, role = excluded.role", [owner]));
  assert.equal((await profile(owner)).rows[0].profile.name, 'Updated Name');
  await assert.rejects(asUser(owner, () => db.query("UPDATE public.profiles SET role = 'ADMIN' WHERE id = $1", [owner])), /identity and role/);
  await assert.rejects(asUser(owner, () => db.query('UPDATE public.profiles SET auth_id = $1 WHERE id = $2', [other, owner])), /identity and role/);
  const result = await asUser(other, () => db.query("UPDATE public.profiles SET name = 'Impersonated' WHERE id = $1 RETURNING id", [owner]));
  assert.equal(result.rows.length, 0);
});

test('comment identity is stamped by the database and only the owner can edit or delete', async () => {
  const inserted = await asUser(owner, () => db.query('INSERT INTO public.entry_comments (entry_id, text, auth_user_id, user_name, user_role) VALUES ($1, $2, $3, $4, $5) RETURNING *', [entry, '  First comment  ', other, 'Forged author', 'ADMIN']));
  const comment = inserted.rows[0];
  assert.equal(comment.auth_user_id, owner);
  assert.equal(comment.user_name, 'Updated Name');
  assert.equal(comment.text, 'First comment');
  await assert.rejects(asUser(owner, () => db.query('UPDATE public.entry_comments SET auth_user_id = $1 WHERE id = $2', [other, comment.id])), /identity/);
  await assert.rejects(asUser(owner, () => db.query("UPDATE public.entry_comments SET text = ' ' WHERE id = $1", [comment.id])), /characters/);
  const unauthorizedEdit = await asUser(other, () => db.query("UPDATE public.entry_comments SET text = 'Changed by other' WHERE id = $1 RETURNING id", [comment.id]));
  const unauthorizedDelete = await asUser(other, () => db.query('DELETE FROM public.entry_comments WHERE id = $1 RETURNING id', [comment.id]));
  assert.equal(unauthorizedEdit.rows.length, 0);
  assert.equal(unauthorizedDelete.rows.length, 0);
  await assert.rejects(asUser(null, () => db.query('INSERT INTO public.entry_comments (entry_id, text) VALUES ($1, $2)', [entry, 'Anonymous']), 'anon'));
  const updated = await asUser(owner, () => db.query('UPDATE public.entry_comments SET text = $1 WHERE id = $2 RETURNING *', ['Edited comment', comment.id]));
  assert.equal(updated.rows[0].text, 'Edited comment');
  const reloaded = await asUser(other, () => db.query('SELECT text FROM public.entry_comments WHERE id = $1', [comment.id]));
  assert.equal(reloaded.rows[0].text, 'Edited comment');
  await asUser(owner, () => db.query('DELETE FROM public.entry_comments WHERE id = $1', [comment.id]));
  assert.equal((await db.query('SELECT id FROM public.entry_comments WHERE id = $1', [comment.id])).rows.length, 0);
});

test('legacy comments without an account ID cannot be claimed using a display name', async () => {
  await db.exec('ALTER TABLE public.entry_comments DISABLE TRIGGER stamp_comment_author');
  const { rows } = await db.query("INSERT INTO public.entry_comments (entry_id, user_name, user_role, text) VALUES ($1, 'Same Name', 'STUDENT', 'Legacy comment') RETURNING id", [entry]);
  await db.exec('ALTER TABLE public.entry_comments ENABLE TRIGGER stamp_comment_author');
  const result = await asUser(other, () => db.query('DELETE FROM public.entry_comments WHERE id = $1 RETURNING id', [rows[0].id]));
  assert.equal(result.rows.length, 0);
});

test('account removal preserves the comment without leaving transferable ownership', async () => {
  const { rows } = await asUser(other, () => db.query('INSERT INTO public.entry_comments (entry_id, text) VALUES ($1, $2) RETURNING id', [entry, 'Retained after account removal']));
  await db.query('DELETE FROM auth.users WHERE id = $1', [other]);
  const saved = (await db.query('SELECT auth_user_id, text FROM public.entry_comments WHERE id = $1', [rows[0].id])).rows[0];
  assert.equal(saved.auth_user_id, null);
  assert.equal(saved.text, 'Retained after account removal');
});
