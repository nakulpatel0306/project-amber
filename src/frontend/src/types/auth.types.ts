import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'candidate' | 'employer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  years_experience: number | null;

  // Big Five scores
  openness_score: number | null;
  conscientiousness_score: number | null;
  extraversion_score: number | null;
  agreeableness_score: number | null;
  neuroticism_score: number | null;

  // Derived scores
  culture_fit_score: number | null;
  work_style_score: number | null;
  communication_score: number | null;
  values_score: number | null;
  top_traits: string[] | null;

  assessment_status: 'not_started' | 'in_progress' | 'completed';
  assessment_completed_at: string | null;

  // Preferences
  preferred_work_style: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null;
  preferred_company_size: 'startup' | 'small' | 'medium' | 'large' | 'any' | null;
  salary_expectation_min: number | null;
  salary_expectation_max: number | null;

  created_at: string;
  updated_at: string;
}

export interface Employer {
  id: string;
  user_id: string;
  company_name: string;
  company_website: string | null;
  company_logo_url: string | null;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
  industry: string | null;
  description: string | null;
  location: string | null;

  culture_values: string[] | null;

  // Culture quiz scores
  openness_preference: number | null;
  conscientiousness_preference: number | null;
  extraversion_preference: number | null;
  agreeableness_preference: number | null;
  neuroticism_preference: number | null;

  culture_quiz_completed: boolean;

  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;

  // Notification preferences
  email_updates: boolean;
  email_matches: boolean;
  email_messages: boolean;
  email_newsletter: boolean;

  // Privacy settings
  profile_visible: boolean;
  show_salary_expectation: boolean;

  // UI preferences
  theme: string;

  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  full_name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}
