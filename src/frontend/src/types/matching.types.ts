import type { OCEANScores } from '../lib/compatibilityScoring';

/* ------------------------------------------------------------------ */
/*  Core entity types                                                  */
/* ------------------------------------------------------------------ */

export interface CandidateData {
  id: string;
  user_id: string;
  openness_score: number;
  conscientiousness_score: number;
  extraversion_score: number;
  agreeableness_score: number;
  neuroticism_score: number;
  top_traits: string[];
  work_style: string | null;
  headline: string | null;
  location: string | null;
  archetype_name: string | null;
  archetype_key: string | null;
  visual_perception_data: unknown;
  work_values_data: unknown;
  situational_judgment_data: unknown;
  cognitive_patterns_data: unknown;
}

export interface EmployerData {
  id: string;
  user_id: string;
  company_name: string;
  openness_preference: number;
  conscientiousness_preference: number;
  extraversion_preference: number;
  agreeableness_preference: number;
  neuroticism_preference: number;
  culture_values: string[];
  description: string;
  industry: string;
  company_size: string;
  location: string;
  logo_url: string | null;
  company_website?: string;
}

export interface RoleData {
  id: string;
  title: string;
  description: string;
  location: string;
  work_style: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  required_openness_min: number | null;
  required_openness_max: number | null;
  required_conscientiousness_min: number | null;
  required_conscientiousness_max: number | null;
  required_extraversion_min: number | null;
  required_extraversion_max: number | null;
  required_agreeableness_min: number | null;
  required_agreeableness_max: number | null;
  required_neuroticism_min: number | null;
  required_neuroticism_max: number | null;
  employers: {
    id: string;
    company_name: string;
    description: string;
    company_size: string;
    industry: string;
    location: string;
    culture_values: string[];
    openness_preference: number;
    conscientiousness_preference: number;
    extraversion_preference: number;
    agreeableness_preference: number;
    neuroticism_preference: number;
    company_website?: string;
  };
}

export interface RoleOption {
  id: string;
  title: string;
  work_style: string | null;
  required_openness_min: number | null;
  required_openness_max: number | null;
  required_conscientiousness_min: number | null;
  required_conscientiousness_max: number | null;
  required_extraversion_min: number | null;
  required_extraversion_max: number | null;
  required_agreeableness_min: number | null;
  required_agreeableness_max: number | null;
  required_neuroticism_min: number | null;
  required_neuroticism_max: number | null;
}

/* ------------------------------------------------------------------ */
/*  Match result types                                                 */
/* ------------------------------------------------------------------ */

export interface MatchResult {
  role: RoleData;
  traitMatchScore: number;
  cultureMatchScore: number;
  overallMatchScore: number;
  employerArchetype: { name: string; key: string; description?: string };
  breakdown: {
    opennessFit: number;
    conscientiousnessFit: number;
    extraversionFit: number;
    agreeablenessFit: number;
    neuroticismFit: number;
    workStyleFit: number;
    valuesFit: number;
    roleFit?: number;
  };
  highlightPills: string[];
}

export interface CandidateResult {
  candidateId: string;
  name: string;
  headline: string;
  location: string;
  workStyle: string;
  archetype: { name: string; key: string; description?: string; strengths: string[] };
  overallScore: number;
  traitScore: number;
  cultureScore: number;
  workStyleFit: number;
  breakdown: {
    opennessFit: number;
    conscientiousnessFit: number;
    extraversionFit: number;
    agreeablenessFit: number;
    neuroticismFit: number;
  };
  candidateOcean: OCEANScores;
}

export interface EmberInsights {
  ember_message?: string;
  strengths?: string[];
  growth_areas?: string[];
  tips?: string[];
}

/* ------------------------------------------------------------------ */
/*  Match detail (modal / deep dive)                                   */
/* ------------------------------------------------------------------ */

export interface DimensionAnalysis {
  name: string;
  candidate_score: number;
  employer_preference: number;
  fit_score: number;
  gap: number;
  direction: string;
}

export interface MatchDetailData {
  id: string;
  name: string;
  subtitle?: string;
  archetype?: { name: string; key: string; description?: string };
  overallScore: number;
  traitScore: number;
  cultureScore: number;
  workStyleScore: number;
  communicationScore: number;
  dimensionAnalysis?: DimensionAnalysis[];
  insights?: { category: string; message: string; trait_related?: string; score_impact?: string }[];
  emberSummary?: string;
  emberRecommendation?: string;
}

/* ------------------------------------------------------------------ */
/*  Saved matches / pipeline                                           */
/* ------------------------------------------------------------------ */

export interface SavedMatch {
  id: string;
  user_id: string;
  target_type: 'role' | 'candidate';
  role_id: string | null;
  employer_id: string | null;
  candidate_id: string | null;
  match_score: number | null;
  notes: string | null;
  status: PipelineTab;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  View state types                                                   */
/* ------------------------------------------------------------------ */

export type GalleryView = 'grid' | 'carousel';
export type PageView = 'gallery' | 'deepdive';
export type PipelineTab = 'saved' | 'pending' | 'connected';
export type SortOption = 'score' | 'culture' | 'workstyle' | 'recent';
