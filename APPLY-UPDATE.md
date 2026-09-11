# Blue Matrix: email codes and comment controls

This update contains only the two requested features: email verification codes for registration/sign-in, and editing/deleting your own comments. It extends the existing KnowPass React/Supabase app.

## What users will see

- Sign-in asks for an email address, sends a code, then opens the account after Supabase verifies it. This is passwordless email-code sign-in. Existing accounts use their existing email address.
- Registration keeps the existing profile fields and shows email verification before onboarding. Resend has a countdown; invalid/expired codes and delivery failures show errors.
- Your comments have Edit and Delete controls. Editing offers Save/Cancel and an edited label. Deletion asks for confirmation. Changes persist in the database and remain correct after reopening the post.
- Production login no longer accepts simulated roles or locally fabricated sessions. Existing valid Supabase sessions can still resume normally.

## Apply the code

Prepared against GitHub main commit `281734fab14ca89b7e014fdca68b963ef568290e`, including the latest contribution/error-boundary fixes.

The download includes `email-comments.patch` and a `changed-files` directory containing the complete updated files. Use the patch against your existing repository so Git can detect conflicting edits.

From a clean checkout of Blue-Matrix, create a branch and apply the patch (replace the example download path):

```bash
git switch -c email-verification-comments
git apply --check /path/to/download/email-comments.patch
git apply /path/to/download/email-comments.patch
npm ci
npm test
npm run build
```

If the patch check reports conflicts, merge those changes with the newer repository version before proceeding. The `changed-files` folder is also provided for reviewing individual files.

## Supabase setup — required before publishing

1. In the project's SQL Editor, run `supabase/migrations/20260911_email_verification_comments.sql`. It builds on the existing `supabase/schema.sql`; do not rerun the original schema on an existing database. For an empty project, run the schema first, then the migration.
2. In Authentication, keep the Email provider enabled and turn on Confirm Email. Enable new-user signups for registration.
3. In Email Templates, paste `supabase/templates/email-code.html` into both **Confirm signup** and **Magic Link**. A suitable subject is `Your KnowPass verification code`. The `{{ .Token }}` placeholder must remain exactly as provided. [Supabase email OTP documentation](https://supabase.com/docs/guides/auth/auth-email-passwordless).
4. Configure a working custom SMTP sender for public users. Supabase's default sender is restricted to project team addresses and is unsuitable for general signups. If your project already has working custom SMTP, retain it. [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).
5. Keep the Site URL set to `https://blue-matrix-ten.vercel.app`. The app accepts numeric codes of 6–10 digits and uses the expiration enforced by Supabase.

The website already uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Keep these configured in Vercel for the same Supabase project. Never put an SMTP password or Supabase service-role key in a `VITE_` variable.

## Publish and confirm delivery

After the SQL and email settings are ready, push the branch and merge the reviewed update using an account with repository write access. Publish through your existing Vercel project.

Check with two accounts: register and receive a real email code; reject an incorrect code; verify the correct code; sign out and sign in again; post a comment, edit it, reload, delete it, and reload again. The second account should see no edit/delete controls for the first account's comment.

## Existing data and verification limits

The migration preserves profile IDs, roles, posts and existing database comments. It links profiles only after the account's email is verified. Profile identity and comment ownership are protected by database rules, while existing profile editing remains supported.

Older comments often stored only a display name and no account ID. Their authors cannot be established safely from a name alone. Those comments remain visible and read-only; comments with a trusted stored account/profile link receive ownership. Old browser-only comment caches are no longer merged into database results, so deleted comments do not reappear.

Validation completed: all 14 automated tests passed, and the Vite production build succeeded. The tests exercise real PostgreSQL row permissions in PGlite, code verification responses, authentication state, and the React sign-in/registration/comment controls. They do not send live email or apply changes to the hosted Supabase/Vercel project. Complete the live delivery check after setup.
