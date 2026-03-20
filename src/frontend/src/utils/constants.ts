// Amber Platform Constants

export const APP_NAME = 'Amber Project';
export const APP_DESCRIPTION = 'Culture-first job matching platform';

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Auth
export const AUTH_STORAGE_KEY = 'amber-auth';
export const THEME_STORAGE_KEY = 'amber-theme';

// Culture values options for employers
export const CULTURE_VALUES = [
  { id: 'innovation', label: 'Innovation', description: 'We push boundaries and embrace new ideas' },
  { id: 'transparency', label: 'Transparency', description: 'Open communication and honest feedback' },
  { id: 'collaboration', label: 'Collaboration', description: 'Team success over individual glory' },
  { id: 'autonomy', label: 'Autonomy', description: 'Trust and independence in how work gets done' },
  { id: 'growth', label: 'Growth', description: 'Continuous learning and development' },
  { id: 'impact', label: 'Impact', description: 'Making a meaningful difference' },
  { id: 'balance', label: 'Work-Life Balance', description: 'Respecting boundaries and personal time' },
  { id: 'diversity', label: 'Diversity & Inclusion', description: 'Celebrating different perspectives' },
  { id: 'customer', label: 'Customer Focus', description: 'Putting users and customers first' },
  { id: 'excellence', label: 'Excellence', description: 'High standards and quality craftsmanship' },
  { id: 'agility', label: 'Agility', description: 'Adapting quickly to change' },
  { id: 'integrity', label: 'Integrity', description: 'Doing the right thing, always' },
] as const;

// Big Five personality traits
export const BIG_FIVE_TRAITS = [
  { id: 'openness', label: 'Openness', description: 'Curiosity, creativity, and openness to new experiences' },
  { id: 'conscientiousness', label: 'Conscientiousness', description: 'Organization, dependability, and self-discipline' },
  { id: 'extraversion', label: 'Extraversion', description: 'Energy, assertiveness, and sociability' },
  { id: 'agreeableness', label: 'Agreeableness', description: 'Cooperation, trust, and helpfulness' },
  { id: 'neuroticism', label: 'Emotional Stability', description: 'Calmness, resilience, and emotional control' },
] as const;

// Work style options
export const WORK_STYLES = [
  { id: 'remote', label: 'Remote', description: 'Work from anywhere' },
  { id: 'hybrid', label: 'Hybrid', description: 'Mix of remote and office' },
  { id: 'onsite', label: 'On-site', description: 'Work from the office' },
  { id: 'flexible', label: 'Flexible', description: 'Choose what works for you' },
] as const;

// Company size options (startup-focused)
export const COMPANY_SIZES = [
  { id: '1-10', label: '1-10 employees', description: 'Early stage startup' },
  { id: '11-50', label: '11-50 employees', description: 'Growing startup' },
  { id: '51-200', label: '51-200 employees', description: 'Scaling company' },
] as const;

// Job sectors / categories for employer role creation
export const JOB_SECTORS = [
  { id: 'product_management', label: 'Product Management' },
  { id: 'software_engineering', label: 'Software Development' },
  { id: 'ui_development', label: 'UI/UX Development' },
  { id: 'ml_engineering', label: 'ML/AI Engineering' },
  { id: 'data_science', label: 'Data Science' },
  { id: 'devops', label: 'DevOps / Infrastructure' },
  { id: 'investing', label: 'Investing & Finance' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'sales', label: 'Sales' },
  { id: 'design', label: 'Design' },
  { id: 'operations', label: 'Operations' },
  { id: 'hr', label: 'Human Resources' },
  { id: 'consulting', label: 'Consulting' },
  { id: 'legal', label: 'Legal' },
  { id: 'other', label: 'Other' },
] as const;

// Employment types
export const EMPLOYMENT_TYPES = [
  { id: 'full_time', label: 'Full-time' },
  { id: 'part_time', label: 'Part-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
] as const;

// Application statuses
export const APPLICATION_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'text-stone-500' },
  { id: 'reviewing', label: 'Under Review', color: 'text-amber-500' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'text-blue-500' },
  { id: 'interview', label: 'Interview', color: 'text-purple-500' },
  { id: 'rejected', label: 'Rejected', color: 'text-red-500' },
  { id: 'accepted', label: 'Accepted', color: 'text-green-500' },
] as const;

// Match score weights
export const MATCH_WEIGHTS = {
  TRAIT_ALIGNMENT: 0.4,  // 40%
  CULTURE_FIT: 0.3,      // 30%
  ANSWER_QUALITY: 0.3,   // 30%
} as const;

// Assessment configuration
export const ASSESSMENT_CONFIG = {
  CANDIDATE: {
    BIG_FIVE_QUESTIONS: 25,
    CREATIVE_SCENARIOS: 5,
    TOTAL_QUESTIONS: 30,
    ESTIMATED_MINUTES: 15,
  },
  EMPLOYER: {
    CULTURE_QUESTIONS: 15,
    VALUES_TO_SELECT: 5,
    ESTIMATED_MINUTES: 10,
  },
} as const;
