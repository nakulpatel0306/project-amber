// Supabase Database Types
// This file can be auto-generated using: npx supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'candidate' | 'employer'
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'candidate' | 'employer'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'candidate' | 'employer'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          user_id: string
          headline: string | null
          bio: string | null
          location: string | null
          linkedin_url: string | null
          github_url: string | null
          portfolio_url: string | null
          years_experience: number | null
          openness_score: number | null
          conscientiousness_score: number | null
          extraversion_score: number | null
          agreeableness_score: number | null
          neuroticism_score: number | null
          culture_fit_score: number | null
          work_style_score: number | null
          communication_score: number | null
          values_score: number | null
          top_traits: string[] | null
          assessment_status: 'not_started' | 'in_progress' | 'completed'
          assessment_completed_at: string | null
          preferred_work_style: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null
          preferred_company_size: 'startup' | 'small' | 'medium' | 'large' | 'any' | null
          salary_expectation_min: number | null
          salary_expectation_max: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          headline?: string | null
          bio?: string | null
          location?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          years_experience?: number | null
          openness_score?: number | null
          conscientiousness_score?: number | null
          extraversion_score?: number | null
          agreeableness_score?: number | null
          neuroticism_score?: number | null
          culture_fit_score?: number | null
          work_style_score?: number | null
          communication_score?: number | null
          values_score?: number | null
          top_traits?: string[] | null
          assessment_status?: 'not_started' | 'in_progress' | 'completed'
          assessment_completed_at?: string | null
          preferred_work_style?: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null
          preferred_company_size?: 'startup' | 'small' | 'medium' | 'large' | 'any' | null
          salary_expectation_min?: number | null
          salary_expectation_max?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          headline?: string | null
          bio?: string | null
          location?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          years_experience?: number | null
          openness_score?: number | null
          conscientiousness_score?: number | null
          extraversion_score?: number | null
          agreeableness_score?: number | null
          neuroticism_score?: number | null
          culture_fit_score?: number | null
          work_style_score?: number | null
          communication_score?: number | null
          values_score?: number | null
          top_traits?: string[] | null
          assessment_status?: 'not_started' | 'in_progress' | 'completed'
          assessment_completed_at?: string | null
          preferred_work_style?: 'remote' | 'hybrid' | 'onsite' | 'flexible' | null
          preferred_company_size?: 'startup' | 'small' | 'medium' | 'large' | 'any' | null
          salary_expectation_min?: number | null
          salary_expectation_max?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      employers: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_website: string | null
          company_logo_url: string | null
          company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          industry: string | null
          description: string | null
          location: string | null
          culture_values: string[] | null
          openness_preference: number | null
          conscientiousness_preference: number | null
          extraversion_preference: number | null
          agreeableness_preference: number | null
          neuroticism_preference: number | null
          culture_quiz_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_website?: string | null
          company_logo_url?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          industry?: string | null
          description?: string | null
          location?: string | null
          culture_values?: string[] | null
          openness_preference?: number | null
          conscientiousness_preference?: number | null
          extraversion_preference?: number | null
          agreeableness_preference?: number | null
          neuroticism_preference?: number | null
          culture_quiz_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_website?: string | null
          company_logo_url?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          industry?: string | null
          description?: string | null
          location?: string | null
          culture_values?: string[] | null
          openness_preference?: number | null
          conscientiousness_preference?: number | null
          extraversion_preference?: number | null
          agreeableness_preference?: number | null
          neuroticism_preference?: number | null
          culture_quiz_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          employer_id: string
          title: string
          description: string | null
          requirements: string[] | null
          nice_to_have: string[] | null
          location: string | null
          work_style: 'remote' | 'hybrid' | 'onsite' | null
          salary_min: number | null
          salary_max: number | null
          employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | null
          required_openness_min: number | null
          required_openness_max: number | null
          required_conscientiousness_min: number | null
          required_conscientiousness_max: number | null
          required_extraversion_min: number | null
          required_extraversion_max: number | null
          required_agreeableness_min: number | null
          required_agreeableness_max: number | null
          required_neuroticism_min: number | null
          required_neuroticism_max: number | null
          status: 'draft' | 'active' | 'paused' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          description?: string | null
          requirements?: string[] | null
          nice_to_have?: string[] | null
          location?: string | null
          work_style?: 'remote' | 'hybrid' | 'onsite' | null
          salary_min?: number | null
          salary_max?: number | null
          employment_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | null
          required_openness_min?: number | null
          required_openness_max?: number | null
          required_conscientiousness_min?: number | null
          required_conscientiousness_max?: number | null
          required_extraversion_min?: number | null
          required_extraversion_max?: number | null
          required_agreeableness_min?: number | null
          required_agreeableness_max?: number | null
          required_neuroticism_min?: number | null
          required_neuroticism_max?: number | null
          status?: 'draft' | 'active' | 'paused' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employer_id?: string
          title?: string
          description?: string | null
          requirements?: string[] | null
          nice_to_have?: string[] | null
          location?: string | null
          work_style?: 'remote' | 'hybrid' | 'onsite' | null
          salary_min?: number | null
          salary_max?: number | null
          employment_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | null
          required_openness_min?: number | null
          required_openness_max?: number | null
          required_conscientiousness_min?: number | null
          required_conscientiousness_max?: number | null
          required_extraversion_min?: number | null
          required_extraversion_max?: number | null
          required_agreeableness_min?: number | null
          required_agreeableness_max?: number | null
          required_neuroticism_min?: number | null
          required_neuroticism_max?: number | null
          status?: 'draft' | 'active' | 'paused' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          candidate_id: string
          role_id: string
          status: 'pending' | 'reviewing' | 'shortlisted' | 'interview' | 'rejected' | 'accepted'
          trait_match_score: number | null
          culture_match_score: number | null
          answer_score: number | null
          overall_match_score: number | null
          behavioral_questions: Json | null
          behavioral_answers: Json | null
          cover_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          role_id: string
          status?: 'pending' | 'reviewing' | 'shortlisted' | 'interview' | 'rejected' | 'accepted'
          trait_match_score?: number | null
          culture_match_score?: number | null
          answer_score?: number | null
          overall_match_score?: number | null
          behavioral_questions?: Json | null
          behavioral_answers?: Json | null
          cover_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          role_id?: string
          status?: 'pending' | 'reviewing' | 'shortlisted' | 'interview' | 'rejected' | 'accepted'
          trait_match_score?: number | null
          culture_match_score?: number | null
          answer_score?: number | null
          overall_match_score?: number | null
          behavioral_questions?: Json | null
          behavioral_answers?: Json | null
          cover_note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      coffee_chats: {
        Row: {
          id: string
          application_id: string | null
          candidate_id: string
          employer_id: string
          status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'
          scheduled_at: string | null
          meeting_link: string | null
          notes: string | null
          employer_feedback: string | null
          employer_rating: number | null
          candidate_feedback: string | null
          candidate_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id?: string | null
          candidate_id: string
          employer_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'
          scheduled_at?: string | null
          meeting_link?: string | null
          notes?: string | null
          employer_feedback?: string | null
          employer_rating?: number | null
          candidate_feedback?: string | null
          candidate_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string | null
          candidate_id?: string
          employer_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'
          scheduled_at?: string | null
          meeting_link?: string | null
          notes?: string | null
          employer_feedback?: string | null
          employer_rating?: number | null
          candidate_feedback?: string | null
          candidate_rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          assessment_type: 'candidate_personality' | 'employer_culture'
          responses: Json
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_type: 'candidate_personality' | 'employer_culture'
          responses: Json
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_type?: 'candidate_personality' | 'employer_culture'
          responses?: Json
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          feedback_type: 'bug_report' | 'feature_request' | 'general' | 'satisfaction'
          message: string
          page: string | null
          rating: number | null
          status: 'new' | 'reviewed' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          feedback_type: 'bug_report' | 'feature_request' | 'general' | 'satisfaction'
          message: string
          page?: string | null
          rating?: number | null
          status?: 'new' | 'reviewed' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          feedback_type?: 'bug_report' | 'feature_request' | 'general' | 'satisfaction'
          message?: string
          page?: string | null
          rating?: number | null
          status?: 'new' | 'reviewed' | 'resolved'
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_updates: boolean
          email_matches: boolean
          email_messages: boolean
          email_newsletter: boolean
          profile_visible: boolean
          show_salary_expectation: boolean
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_updates?: boolean
          email_matches?: boolean
          email_messages?: boolean
          email_newsletter?: boolean
          profile_visible?: boolean
          show_salary_expectation?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_updates?: boolean
          email_matches?: boolean
          email_messages?: boolean
          email_newsletter?: boolean
          profile_visible?: boolean
          show_salary_expectation?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
