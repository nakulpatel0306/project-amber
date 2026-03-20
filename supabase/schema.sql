-- Amber Platform Database Schema
-- Run this in the Supabase SQL Editor BEFORE rls-policies.sql.
--
-- This file creates all tables, indexes, triggers, and functions for the
-- Amber platform. Tables are organized as follows:
--   - profiles: Extends auth.users with role and onboarding state
--   - candidates: Personality scores, preferences, and assessment tracking
--   - employers: Company info, culture values, and OCEAN preferences
--   - roles: Job listings with personality requirement ranges
--   - applications: Candidate-role matches with computed scores
--   - coffee_chats: Informal interview scheduling and feedback
--   - questions: Assessment question definitions with trait scoring
--   - assessments: Assessment session tracking
--   - assessment_responses: Individual question answers
--   - feedback: User-submitted bug reports and feature requests
--   - user_settings: Notification, privacy, and theme preferences
--
-- A trigger on auth.users automatically creates profile, settings, and
-- role-specific records when a new user signs up.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  role TEXT CHECK (role IN ('candidate', 'employer')),  -- NULL until user chooses
  email_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add phone_number column if it doesn't exist (for existing databases)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
  END IF;
END $$;

-- ============================================
-- CANDIDATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  years_experience INTEGER,

  -- Big Five trait scores (0-100)
  openness_score INTEGER,
  conscientiousness_score INTEGER,
  extraversion_score INTEGER,
  agreeableness_score INTEGER,
  neuroticism_score INTEGER,

  -- Derived scores
  culture_fit_score INTEGER,
  work_style_score INTEGER,
  communication_score INTEGER,
  values_score INTEGER,
  top_traits TEXT[],

  assessment_status TEXT CHECK (assessment_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  assessment_completed_at TIMESTAMPTZ,

  -- Supplementary assessment data (JSONB columns for each assessment type)
  visual_perception_data JSONB,
  cognitive_patterns_data JSONB,
  situational_judgment_data JSONB,
  work_values_data JSONB,

  -- Profile setup progress tracking
  setup_step INTEGER DEFAULT 0,  -- 0=not started, 1=basic, 2=preferences, 3=links, 4=complete
  setup_completed_at TIMESTAMPTZ,

  -- Preferences
  preferred_work_style TEXT CHECK (preferred_work_style IN ('remote', 'hybrid', 'onsite', 'flexible')),
  preferred_company_size TEXT CHECK (preferred_company_size IN ('startup', 'small', 'medium', 'large', 'any')),
  salary_expectation_min INTEGER,
  salary_expectation_max INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- EMPLOYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_logo_url TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200')),
  industry TEXT,
  description TEXT,
  location TEXT,
  linkedin_url TEXT,

  -- Culture values (top 5 selected from predefined list)
  culture_values TEXT[],

  -- Culture quiz scores
  openness_preference INTEGER,
  conscientiousness_preference INTEGER,
  extraversion_preference INTEGER,
  agreeableness_preference INTEGER,
  neuroticism_preference INTEGER,

  culture_quiz_completed BOOLEAN DEFAULT FALSE,

  -- Profile setup progress tracking
  setup_step INTEGER DEFAULT 0,  -- 0=not started, 1=company, 2=details, 3=links, 4=complete
  setup_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- ROLES TABLE (Job Listings)
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  nice_to_have TEXT[],
  location TEXT,
  work_style TEXT CHECK (work_style IN ('remote', 'hybrid', 'onsite')),
  salary_min INTEGER,
  salary_max INTEGER,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),

  -- Personality requirements (ideal ranges)
  required_openness_min INTEGER,
  required_openness_max INTEGER,
  required_conscientiousness_min INTEGER,
  required_conscientiousness_max INTEGER,
  required_extraversion_min INTEGER,
  required_extraversion_max INTEGER,
  required_agreeableness_min INTEGER,
  required_agreeableness_max INTEGER,
  required_neuroticism_min INTEGER,
  required_neuroticism_max INTEGER,

  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'closed')) DEFAULT 'draft',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,

  status TEXT CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interview', 'rejected', 'accepted')) DEFAULT 'pending',

  -- Match scores (calculated)
  trait_match_score INTEGER,
  culture_match_score INTEGER,
  answer_score INTEGER,
  overall_match_score INTEGER,

  -- AI-generated behavioral questions and answers
  behavioral_questions JSONB,
  behavioral_answers JSONB,

  cover_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(candidate_id, role_id)
);

-- ============================================
-- COFFEE_CHATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.coffee_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,

  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')) DEFAULT 'pending',

  scheduled_at TIMESTAMPTZ,
  meeting_link TEXT,
  notes TEXT,

  -- Feedback after chat
  employer_feedback TEXT,
  employer_rating INTEGER CHECK (employer_rating >= 1 AND employer_rating <= 5),
  candidate_feedback TEXT,
  candidate_rating INTEGER CHECK (candidate_rating >= 1 AND candidate_rating <= 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUESTIONS TABLE (Assessment Questions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_code TEXT UNIQUE NOT NULL,  -- e.g., 'c1', 'c2', 'e1', 'e2'
  question_type TEXT CHECK (question_type IN ('candidate', 'employer', 'visual_perception', 'cognitive_patterns', 'situational_judgment', 'work_values')) NOT NULL,
  question_format TEXT CHECK (question_format IN ('scenario', 'metaphor', 'tradeoff', 'ranking', 'reflection', 'slider', 'visual')) NOT NULL,
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  description TEXT,
  options JSONB,  -- Array of options with id, text, description, traitScores
  slider_config JSONB,  -- For slider questions: min, max, minLabel, maxLabel, trait
  traits TEXT[],  -- Array of trait names this question measures
  display_order INTEGER,  -- Order in which to display the question
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSESSMENTS TABLE (Assessment Sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_type TEXT CHECK (assessment_type IN ('candidate_personality', 'employer_culture', 'visual_perception', 'cognitive_patterns', 'situational_judgment', 'work_values')) NOT NULL,

  responses JSONB,  -- Final compiled responses (populated on completion)

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSESSMENT_RESPONSES TABLE (Individual Answers)
-- ============================================
CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_code TEXT NOT NULL REFERENCES public.questions(question_code),

  -- Single JSONB column for all answer types:
  -- Slider: {"value": 75}
  -- Multiple choice: {"selected": "option_a"}
  -- Ranking: {"order": ["a", "c", "b", "d"]}
  -- Reflection: {"text": "My response..."}
  answer JSONB NOT NULL,

  answered_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one response per question per assessment
  UNIQUE(assessment_id, question_code)
);

-- ============================================
-- FEEDBACK TABLE (System Feedback)
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  feedback_type TEXT CHECK (feedback_type IN ('bug_report', 'feature_request', 'general', 'satisfaction')) NOT NULL,
  message TEXT NOT NULL,
  page TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  status TEXT CHECK (status IN ('new', 'reviewed', 'resolved')) DEFAULT 'new',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Notification preferences
  email_updates BOOLEAN DEFAULT TRUE,
  email_matches BOOLEAN DEFAULT TRUE,
  email_messages BOOLEAN DEFAULT TRUE,
  email_newsletter BOOLEAN DEFAULT FALSE,

  -- Privacy settings
  profile_visible BOOLEAN DEFAULT TRUE,
  show_salary_expectation BOOLEAN DEFAULT FALSE,

  -- UI preferences
  theme TEXT DEFAULT 'amber-light',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_assessment_status ON public.candidates(assessment_status);
CREATE INDEX IF NOT EXISTS idx_employers_user_id ON public.employers(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_employer_id ON public.roles(employer_id);
CREATE INDEX IF NOT EXISTS idx_roles_status ON public.roles(status);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_role_id ON public.applications(role_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_coffee_chats_candidate_id ON public.coffee_chats(candidate_id);
CREATE INDEX IF NOT EXISTS idx_coffee_chats_employer_id ON public.coffee_chats(employer_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_type ON public.questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_question_code ON public.questions(question_code);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON public.assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_user_id ON public.assessment_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_question_code ON public.assessment_responses(question_code);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON public.candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employers_updated_at ON public.employers;
CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON public.employers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coffee_chats_updated_at ON public.coffee_chats;
CREATE TRIGGER update_coffee_chats_updated_at
  BEFORE UPDATE ON public.coffee_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile (role is NULL until user chooses, unless provided via email signup)
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'role'  -- Only set if explicitly provided
  );

  -- Create user settings with defaults
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  -- Create role-specific record only if role was provided (email signup with role)
  IF NEW.raw_user_meta_data->>'role' = 'candidate' THEN
    INSERT INTO public.candidates (user_id)
    VALUES (NEW.id);
  ELSIF NEW.raw_user_meta_data->>'role' = 'employer' THEN
    INSERT INTO public.employers (user_id, company_name)
    VALUES (NEW.id, 'My Company');
  END IF;
  -- For OAuth users without role, candidate/employer record created after role selection

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
