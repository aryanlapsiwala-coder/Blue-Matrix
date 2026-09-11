-- Apply after schema.sql, before deploying the email-code/comment update.
-- Existing accounts, profile IDs and comments are retained. Safe to run again.
BEGIN;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('STUDENT', 'ALUMNI', 'FACULTY', 'TECHNICIAN', 'ADMIN'));

-- Resolve a profile only after Supabase has verified the account's email.
CREATE OR REPLACE FUNCTION public.ensure_own_profile()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  account auth.users%ROWTYPE;
  member public.profiles%ROWTYPE;
  metadata jsonb;
BEGIN
  SELECT * INTO account FROM auth.users WHERE id = auth.uid();
  IF account.id IS NULL OR account.email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Verify your email before continuing';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(account.id::text, 0));
  metadata := COALESCE(account.raw_user_meta_data, '{}'::jsonb);
  SELECT * INTO member FROM public.profiles p
    WHERE p.auth_id = account.id OR (p.auth_id IS NULL AND
      (p.id = account.id OR lower(p.email) = lower(account.email)))
    ORDER BY (p.auth_id = account.id) DESC NULLS LAST, p.created_at LIMIT 1;
  IF member.id IS NULL THEN
    INSERT INTO public.profiles (id, auth_id, email, name, role, department, year_of_study, bio, know_points, badges)
    VALUES (account.id, account.id, account.email,
      COALESCE(NULLIF(btrim(metadata->>'name'), ''), split_part(account.email, '@', 1)),
      CASE WHEN metadata->>'role' IN ('STUDENT', 'ALUMNI', 'FACULTY') THEN metadata->>'role' ELSE 'STUDENT' END,
      COALESCE(NULLIF(metadata->>'department', ''), 'General'), metadata->>'year_of_study',
      COALESCE(metadata->>'bio', ''), 50,
      CASE WHEN metadata->>'kyc_status' = 'VERIFIED' THEN ARRAY['Pioneer', 'KYC Verified'] ELSE ARRAY['Pioneer'] END)
      RETURNING * INTO member;
  ELSE
    UPDATE public.profiles SET auth_id = account.id, email = account.email
      WHERE id = member.id RETURNING * INTO member;
  END IF;
  RETURN to_jsonb(member);
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_own_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_own_profile() TO authenticated;

-- Keep the profile identity used by authentication and comment attribution trustworthy.
-- Existing profile upserts can still change display details, including the avatar.
CREATE OR REPLACE FUNCTION public.own_verified_email()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT email FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL;
$$;
REVOKE ALL ON FUNCTION public.own_verified_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.own_verified_email() TO authenticated;

-- Resolve the verified email without granting clients access to auth.users.
CREATE OR REPLACE FUNCTION public.protect_profile_identity()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE account_email text;
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.auth_id IS DISTINCT FROM OLD.auth_id
      OR NEW.email IS DISTINCT FROM OLD.email OR NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Profile account identity and role cannot be changed here';
    END IF;
  ELSE
    account_email := public.own_verified_email();
    IF account_email IS NULL THEN RAISE EXCEPTION 'Verify your email first'; END IF;
    IF NEW.auth_id IS NOT NULL AND NEW.auth_id <> auth.uid() THEN RAISE EXCEPTION 'Invalid profile owner'; END IF;
    NEW.auth_id := auth.uid();
    NEW.email := account_email;
    IF NEW.role NOT IN ('STUDENT', 'ALUMNI', 'FACULTY') AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE auth_id = auth.uid() AND id = NEW.id AND role = NEW.role
    ) THEN RAISE EXCEPTION 'This account role must be assigned by an administrator'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_profile_identity ON public.profiles;
CREATE TRIGGER protect_profile_identity BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_identity();
DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth_id = (SELECT auth.uid()));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth_id = (SELECT auth.uid())) WITH CHECK (auth_id = (SELECT auth.uid()));

ALTER TABLE public.entry_comments ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.entry_comments ADD COLUMN IF NOT EXISTS updated_at timestamptz;
DROP TRIGGER IF EXISTS stamp_comment_author ON public.entry_comments;
UPDATE public.entry_comments SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE public.entry_comments ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.entry_comments ALTER COLUMN updated_at SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_owner ON public.entry_comments(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_comments_entry_created ON public.entry_comments(entry_id, created_at);

-- Only recover ownership from stored profile IDs, never from a matching display name.
UPDATE public.entry_comments c SET auth_user_id = a.id
FROM public.profiles p JOIN auth.users a ON a.id = COALESCE(p.auth_id, p.id)
WHERE c.user_id = p.id AND c.auth_user_id IS NULL AND a.email_confirmed_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.stamp_comment_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE member public.profiles%ROWTYPE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.ensure_own_profile();
    SELECT * INTO member FROM public.profiles WHERE auth_id = auth.uid();
    NEW.auth_user_id := auth.uid();
    NEW.user_id := member.id;
    NEW.user_name := member.name;
    NEW.user_role := member.role;
    NEW.created_at := now();
    NEW.updated_at := NEW.created_at;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.entry_id IS DISTINCT FROM OLD.entry_id
      OR (NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id AND NOT
        (NEW.auth_user_id IS NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = OLD.auth_user_id)))
      OR (NEW.user_id IS DISTINCT FROM OLD.user_id AND NOT
        (NEW.user_id IS NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = OLD.user_id)))
      OR NEW.user_name IS DISTINCT FROM OLD.user_name OR NEW.user_role IS DISTINCT FROM OLD.user_role
      OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Comment identity cannot be changed';
    END IF;
    NEW.updated_at := now();
  END IF;
  NEW.text := btrim(NEW.text);
  IF NEW.text IS NULL OR char_length(NEW.text) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'Comments must contain 1 to 2000 characters';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.stamp_comment_author() FROM PUBLIC;
CREATE TRIGGER stamp_comment_author BEFORE INSERT OR UPDATE ON public.entry_comments
  FOR EACH ROW EXECUTE FUNCTION public.stamp_comment_author();

ALTER TABLE public.entry_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on entry_comments" ON public.entry_comments;
DROP POLICY IF EXISTS "Allow public insert on entry_comments" ON public.entry_comments;
DROP POLICY IF EXISTS "Read comments" ON public.entry_comments;
DROP POLICY IF EXISTS "Insert own comments" ON public.entry_comments;
DROP POLICY IF EXISTS "Edit own comments" ON public.entry_comments;
DROP POLICY IF EXISTS "Delete own comments" ON public.entry_comments;
CREATE POLICY "Read comments" ON public.entry_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own comments" ON public.entry_comments FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = (SELECT auth.uid()));
CREATE POLICY "Edit own comments" ON public.entry_comments FOR UPDATE TO authenticated
  USING (auth_user_id = (SELECT auth.uid())) WITH CHECK (auth_user_id = (SELECT auth.uid()));
CREATE POLICY "Delete own comments" ON public.entry_comments FOR DELETE TO authenticated
  USING (auth_user_id = (SELECT auth.uid()));

COMMIT;
