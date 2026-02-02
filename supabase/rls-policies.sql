-- Amber Platform Row Level Security Policies
-- Run this AFTER schema.sql in Supabase SQL Editor

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CANDIDATES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Candidates can view own data" ON public.candidates;
CREATE POLICY "Candidates can view own data"
  ON public.candidates FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employers can view candidates with completed assessments" ON public.candidates;
CREATE POLICY "Employers can view candidates with completed assessments"
  ON public.candidates FOR SELECT
  USING (
    assessment_status = 'completed'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'employer'
    )
  );

DROP POLICY IF EXISTS "Candidates can update own data" ON public.candidates;
CREATE POLICY "Candidates can update own data"
  ON public.candidates FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can insert own data" ON public.candidates;
CREATE POLICY "Candidates can insert own data"
  ON public.candidates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- EMPLOYERS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Employers can view own data" ON public.employers;
CREATE POLICY "Employers can view own data"
  ON public.employers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can view employer public info" ON public.employers;
CREATE POLICY "Candidates can view employer public info"
  ON public.employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'candidate'
    )
  );

DROP POLICY IF EXISTS "Employers can update own data" ON public.employers;
CREATE POLICY "Employers can update own data"
  ON public.employers FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employers can insert own data" ON public.employers;
CREATE POLICY "Employers can insert own data"
  ON public.employers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ROLES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active roles" ON public.roles;
CREATE POLICY "Anyone can view active roles"
  ON public.roles FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Employers can view own roles" ON public.roles;
CREATE POLICY "Employers can view own roles"
  ON public.roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employers
      WHERE employers.id = employer_id AND employers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can insert roles" ON public.roles;
CREATE POLICY "Employers can insert roles"
  ON public.roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employers
      WHERE employers.id = employer_id AND employers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can update own roles" ON public.roles;
CREATE POLICY "Employers can update own roles"
  ON public.roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employers
      WHERE employers.id = employer_id AND employers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can delete own roles" ON public.roles;
CREATE POLICY "Employers can delete own roles"
  ON public.roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.employers
      WHERE employers.id = employer_id AND employers.user_id = auth.uid()
    )
  );

-- ============================================
-- APPLICATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Candidates can view own applications" ON public.applications;
CREATE POLICY "Candidates can view own applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.candidates
      WHERE candidates.id = candidate_id AND candidates.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can view applications for their roles" ON public.applications;
CREATE POLICY "Employers can view applications for their roles"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roles
      JOIN public.employers ON employers.id = roles.employer_id
      WHERE roles.id = role_id AND employers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Candidates can insert applications" ON public.applications;
CREATE POLICY "Candidates can insert applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidates
      WHERE candidates.id = candidate_id AND candidates.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Candidates can update own applications" ON public.applications;
CREATE POLICY "Candidates can update own applications"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.candidates
      WHERE candidates.id = candidate_id AND candidates.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can update applications for their roles" ON public.applications;
CREATE POLICY "Employers can update applications for their roles"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.roles
      JOIN public.employers ON employers.id = roles.employer_id
      WHERE roles.id = role_id AND employers.user_id = auth.uid()
    )
  );

-- ============================================
-- COFFEE_CHATS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Candidates can view own coffee chats" ON public.coffee_chats;
CREATE POLICY "Candidates can view own coffee chats"
  ON public.coffee_chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.candidates
      WHERE candidates.id = candidate_id AND candidates.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can view own coffee chats" ON public.coffee_chats;
CREATE POLICY "Employers can view own coffee chats"
  ON public.coffee_chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employers
      WHERE employers.id = employer_id AND employers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can insert coffee chats" ON public.coffee_chats;
CREATE POLICY "Employers can insert coffee chats"
  ON public.coffee_chats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employers
      WHERE employers.id = employer_id AND employers.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Participants can update coffee chats" ON public.coffee_chats;
CREATE POLICY "Participants can update coffee chats"
  ON public.coffee_chats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.candidates
      WHERE candidates.id = candidate_id AND candidates.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.employers
      WHERE employers.id = employer_id AND employers.user_id = auth.uid()
    )
  );

-- ============================================
-- USER_SETTINGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- QUESTIONS POLICIES (Read-only for all authenticated users)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.questions;
CREATE POLICY "Authenticated users can view questions"
  ON public.questions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- ASSESSMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessments;
CREATE POLICY "Users can view own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
CREATE POLICY "Users can insert own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON public.assessments;
CREATE POLICY "Users can update own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- ASSESSMENT_RESPONSES POLICIES
-- ============================================
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can view own assessment responses"
  ON public.assessment_responses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can insert own assessment responses"
  ON public.assessment_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can update own assessment responses"
  ON public.assessment_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FEEDBACK POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================
-- IMPORTANT: Run these commands to enable avatar uploads
-- First, create the bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Then create the policies:
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
