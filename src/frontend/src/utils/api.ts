const API_BASE_URL = "http://localhost:8000";

// ============ Assessment Types ============

export interface Question {
  id: number;
  question: string;
  type: string;
  category: string;
  options: string[];
}

export interface StartAssessmentRequest {
  name: string;
  email: string;
}

export interface StartAssessmentResponse {
  candidate_id: number;
  current_question: number;
  total_questions: number;
  question: Question;
  message: string;
}

export interface SubmitAnswerRequest {
  candidate_id: number;
  question_id: number;
  answer: string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  next_question: Question | null;
  current_question: number;
  total_questions: number;
  is_complete: boolean;
  message: string;
}

export interface AssessmentResults {
  candidate_id: number;
  name: string;
  culture_fit_score: number;
  work_style_score: number;
  communication_score: number;
  values_score: number;
  top_traits: string[];
  explanation: string;
}

// ============ Candidate Types ============

export interface Candidate {
  id: number;
  name: string;
  email: string;
  culture_fit_score: number | null;
  work_style_score: number | null;
  communication_score: number | null;
  values_score: number | null;
  top_traits: string[] | null;
  assessment_status: string | null;
}

// ============ Feedback Types ============

export interface FeedbackRequest {
  message: string;
  user_type?: string;
  page?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

// ============ Assessment API ============

export async function startAssessment(
  request: StartAssessmentRequest
): Promise<StartAssessmentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/assessment/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function submitAnswer(
  request: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/assessment/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getAssessmentResults(
  candidateId: number
): Promise<AssessmentResults> {
  const response = await fetch(
    `${API_BASE_URL}/api/assessment/results/${candidateId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getQuestion(questionId: number): Promise<Question> {
  const response = await fetch(
    `${API_BASE_URL}/api/assessment/question/${questionId}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// ============ Candidates API ============

export async function getCandidates(): Promise<Candidate[]> {
  const response = await fetch(`${API_BASE_URL}/api/candidates`);

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getCandidate(candidateId: number): Promise<Candidate> {
  const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// ============ Feedback API ============

export async function submitFeedback(
  request: FeedbackRequest
): Promise<FeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

// ============ Health Check ============

export interface ServiceHealth {
  status: "operational" | "degraded" | "down";
  latency_ms?: number;
}

export interface HealthResponse {
  status: "operational" | "degraded" | "down";
  timestamp: string;
  services: {
    api: ServiceHealth;
    database: ServiceHealth;
    supabase: ServiceHealth;
    matching_engine: ServiceHealth;
    auth: ServiceHealth;
  };
}

export async function healthCheck(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

// ============ Matching Types ============

export interface MatchBreakdown {
  openness_fit: number;
  conscientiousness_fit: number;
  extraversion_fit: number;
  agreeableness_fit: number;
  neuroticism_fit: number;
  work_style_fit: number;
  values_alignment?: number;
  role_fit?: number;
}

export interface MatchResult {
  candidate_id: string;
  role_id: string;
  trait_match_score: number;
  culture_match_score: number;
  overall_match_score: number;
  breakdown: MatchBreakdown;
}

export interface CandidateMatchResult {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  trait_match_score: number;
  culture_match_score: number;
  overall_match_score: number;
  breakdown: MatchBreakdown;
}

export interface RoleMatchResult {
  role_id: string;
  role_title: string;
  employer_name: string;
  trait_match_score: number;
  culture_match_score: number;
  overall_match_score: number;
  breakdown: MatchBreakdown;
}

// ============ Matching API ============

export async function calculateMatch(
  candidateId: string,
  roleId: string
): Promise<MatchResult> {
  const response = await fetch(`${API_BASE_URL}/api/matching/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      role_id: roleId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getCandidatesForRole(
  roleId: string
): Promise<CandidateMatchResult[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/matching/candidates/${roleId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getRolesForCandidate(
  candidateId: string
): Promise<RoleMatchResult[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/matching/roles/${candidateId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function batchCalculateForRole(
  roleId: string
): Promise<{ success: boolean; candidates_scored: number }> {
  const response = await fetch(
    `${API_BASE_URL}/api/matching/batch-calculate/${roleId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getEmployerCandidates(): Promise<
  Array<CandidateMatchResult & { headline?: string }>
> {
  const response = await fetch(
    `${API_BASE_URL}/api/matching/employer-candidates`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}
