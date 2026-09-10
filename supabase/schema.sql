-- ============================================================================
-- KnowPass Institutional Knowledge Management Platform
-- PostgreSQL Database Schema & Seed Migrations (Compatible with Supabase)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Foreign key referencing auth.users in Supabase
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'TECHNICIAN', 'ADMIN')),
    department VARCHAR(255) NOT NULL,
    year_of_study VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    know_points INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    contributions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Knowledge Entries Table
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    knowledge_type VARCHAR(100) NOT NULL,
    department VARCHAR(255) NOT NULL,
    year_of_study VARCHAR(100) DEFAULT 'All Levels',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    views INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    verified_by VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    resources JSONB DEFAULT '{"files": [], "youtube": null, "github": null}'::jsonb,
    status VARCHAR(50) DEFAULT 'APPROVED' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Entry Upvotes Table
CREATE TABLE IF NOT EXISTS public.entry_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(entry_id, user_id)
);

-- 5. Create Entry Comments Table
CREATE TABLE IF NOT EXISTS public.entry_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Lab Equipment Wiki Table
CREATE TABLE IF NOT EXISTS public.lab_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPERATIONAL' CHECK (status IN ('OPERATIONAL', 'MAINTENANCE DUE', 'CALIBRATION REQUIRED')),
    technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    technician_name VARCHAR(255) NOT NULL,
    last_maintenance DATE DEFAULT CURRENT_DATE,
    next_maintenance DATE,
    image_url TEXT,
    common_issues JSONB DEFAULT '[]'::jsonb,
    maintenance_steps TEXT[] DEFAULT '{}',
    vendor_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Placement Insights Table
CREATE TABLE IF NOT EXISTS public.placement_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    batch_year VARCHAR(100) NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    ctc_range VARCHAR(255) NOT NULL,
    rounds_count INTEGER DEFAULT 4,
    rounds_data JSONB DEFAULT '[]'::jsonb,
    questions_asked TEXT[] DEFAULT '{}',
    top_tips TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Mentorship Sessions Table
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_type VARCHAR(255) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    agenda TEXT,
    status VARCHAR(50) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_department ON public.knowledge_entries(department);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON public.knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON public.knowledge_entries USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_upvotes ON public.knowledge_entries(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_knowpoints ON public.profiles(know_points DESC);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public.lab_equipment(category);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;

-- 11. Base Public Read & Write RLS Policies
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public read on knowledge entries" ON public.knowledge_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on knowledge entries" ON public.knowledge_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on knowledge_entries" ON public.knowledge_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on knowledge_entries" ON public.knowledge_entries FOR DELETE USING (true);
CREATE POLICY "Allow public read on lab equipment" ON public.lab_equipment FOR SELECT USING (true);
CREATE POLICY "Allow public insert on lab_equipment" ON public.lab_equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on lab_equipment" ON public.lab_equipment FOR UPDATE USING (true);
CREATE POLICY "Allow public read on placement insights" ON public.placement_insights FOR SELECT USING (true);
CREATE POLICY "Allow public insert on placement_insights" ON public.placement_insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on mentorship_sessions" ON public.mentorship_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on mentorship_sessions" ON public.mentorship_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on entry_comments" ON public.entry_comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on entry_comments" ON public.entry_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on entry_upvotes" ON public.entry_upvotes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on entry_upvotes" ON public.entry_upvotes FOR INSERT WITH CHECK (true);
