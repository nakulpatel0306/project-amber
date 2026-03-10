"""
Amber Backend API

FastAPI server for the Amber culture-first job matching platform.
This is the main entry point that defines all API routes, middleware, and
request/response models. Routes are organized into sections:
  - Health checks
  - Authentication
  - Assessment (personality quiz flow)
  - Candidate management (employer-facing)
  - Matching and compatibility scoring
  - Ember agent (AI personality analysis)
  - Coffee chats (informal interviews)
  - Feedback
  - Stripe payments
"""

import os
import re
import time
import pathlib
import collections
import httpx
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from db.database import (
    init_database,
    create_candidate,
    get_candidate,
    get_candidate_by_email,
    get_all_candidates_with_scores,
    save_assessment_response,
    get_assessment_responses,
    get_assessment_session,
    complete_assessment,
    save_scores,
    get_scores,
    save_feedback,
    get_all_feedback,
)
from engine.compatibility import (
    CandidateOCEAN,
    EmployerPreferences,
    RoleRequirements,
    calculate_compatibility,
)
from agent.ember_agent import (
    run_ember_analysis,
    run_ember_employer_analysis,
    determine_archetype,
    CandidateOCEAN as EmberCandidateOCEAN,
)
from db.supabase_client import (
    get_candidate_by_id as get_supabase_candidate,
    get_candidate_by_user_id,
    get_employer_by_id,
    get_employer_by_user_id,
    get_role,
    get_all_candidates_with_scores as get_supabase_candidates,
    get_all_active_roles,
    get_roles_by_employer_id,
    upsert_application,
    get_application,
    get_applications_for_role,
    get_applications_for_candidate,
    create_coffee_chat,
    get_coffee_chats_for_candidate,
    get_coffee_chats_for_employer,
    update_coffee_chat,
    get_coffee_chat_by_id,
    create_connection,
    get_connections_for_user,
    get_connection_by_id,
    update_connection,
    get_connection_between,
    create_meet_invite,
    update_meet_invite,
    get_meet_invite_by_connection,
    get_coffee_chat_by_connection,
)
from engine.questions import get_question, get_all_questions, get_total_questions
from engine.scoring import calculate_scores, get_score_explanation
from auth import (
    AuthMiddleware,
    require_auth,
    require_role,
    AuthUser,
    get_current_user_dependency,
    check_email_in_profiles,
)
from auth.supabase_auth import is_auth_configured

# Initialize the local SQLite database (used for the assessment flow in development)
init_database()

app = FastAPI(
    title="Amber API",
    description="Culture-first job matching platform",
    version="1.0.0"
)

# CORS: Allow requests from the frontend dev servers and Tauri desktop app.
# Update these origins for production deployments.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1420",    # Tauri dev server
        "http://localhost:5173",    # Vite dev server (default)
        "http://localhost:3000",    # Alternative dev server
        "http://tauri.localhost",   # Tauri production
        "tauri://localhost"         # Tauri protocol
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT authentication middleware (only active when SUPABASE_JWT_SECRET is set).
# In development mode (no secret configured), all routes are accessible without auth.
# Public endpoints like assessment and auth are always excluded from auth checks.
app.add_middleware(
    AuthMiddleware,
    exclude_paths=["/", "/health", "/docs", "/redoc", "/openapi.json"],
    exclude_prefixes=["/api/assessment/", "/api/auth/", "/api/logo", "/api/stripe/webhook"],  # Assessment, auth, logo, and Stripe webhook endpoints are public
)


# ============ Request/Response Models ============

class StartAssessmentRequest(BaseModel):
    name: str
    email: str


class StartAssessmentResponse(BaseModel):
    candidate_id: int
    current_question: int
    total_questions: int
    question: dict
    message: str


class SubmitAnswerRequest(BaseModel):
    candidate_id: int
    question_id: int
    answer: str


class SubmitAnswerResponse(BaseModel):
    success: bool
    next_question: Optional[dict]
    current_question: int
    total_questions: int
    is_complete: bool
    message: str


class AssessmentResultsResponse(BaseModel):
    candidate_id: int
    name: str
    culture_fit_score: int
    work_style_score: int
    communication_score: int
    values_score: int
    top_traits: List[str]
    explanation: str


class CandidateResponse(BaseModel):
    id: int
    name: str
    email: str
    culture_fit_score: Optional[int]
    work_style_score: Optional[int]
    communication_score: Optional[int]
    values_score: Optional[int]
    top_traits: Optional[List[str]]
    assessment_status: Optional[str]


class FeedbackRequest(BaseModel):
    message: str
    user_type: Optional[str] = "candidate"
    page: Optional[str] = "unknown"


class FeedbackResponse(BaseModel):
    success: bool
    message: str


class CheckEmailRequest(BaseModel):
    email: str


class CheckEmailResponse(BaseModel):
    exists: bool
    message: str


# ============ Coffee Chat Request/Response Models ============

class CreateCoffeeChatRequest(BaseModel):
    candidate_id: str
    employer_id: str
    role_id: Optional[str] = None
    message: Optional[str] = None
    initiated_by: str  # 'candidate' or 'employer'


class ScheduleCoffeeChatRequest(BaseModel):
    scheduled_at: str  # ISO datetime
    meeting_link: Optional[str] = None


class CoffeeChatFeedbackRequest(BaseModel):
    rating: int  # 1-5
    feedback: Optional[str] = None


# ============ Matching Request/Response Models ============

class CalculateMatchRequest(BaseModel):
    candidate_id: str
    role_id: str


class MatchBreakdown(BaseModel):
    openness_fit: int
    conscientiousness_fit: int
    extraversion_fit: int
    agreeableness_fit: int
    neuroticism_fit: int
    work_style_fit: int
    values_alignment: Optional[int] = None
    role_fit: Optional[int] = None


class MatchResult(BaseModel):
    candidate_id: str
    role_id: str
    trait_match_score: int
    culture_match_score: int
    overall_match_score: int
    breakdown: dict


class CandidateMatchResult(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_email: str
    trait_match_score: int
    culture_match_score: int
    overall_match_score: int
    breakdown: dict


class RoleMatchResult(BaseModel):
    role_id: str
    role_title: str
    employer_name: str
    trait_match_score: int
    culture_match_score: int
    overall_match_score: int
    breakdown: dict


# ============ Health Check Endpoints ============

@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "status": "ok",
        "message": "Amber API",
        "version": "1.0.0",
        "auth_enabled": is_auth_configured()
    }


@app.get("/health")
async def health():
    """Detailed health check with real service probes"""
    import time
    from datetime import datetime, timezone
    from db.database import get_connection
    from db.supabase_client import get_supabase

    services: dict = {}

    # API – if we got here it's up
    services["api"] = {"status": "operational", "latency_ms": 1}

    # Database (SQLite)
    try:
        t0 = time.perf_counter()
        conn = get_connection()
        conn.execute("SELECT 1")
        conn.close()
        latency = round((time.perf_counter() - t0) * 1000)
        services["database"] = {"status": "operational", "latency_ms": latency}
    except Exception:
        services["database"] = {"status": "down", "latency_ms": 0}

    # Supabase
    try:
        t0 = time.perf_counter()
        client = get_supabase()
        if client is None:
            services["supabase"] = {"status": "degraded", "latency_ms": 0}
        else:
            # lightweight probe – list 0 rows from any table
            client.table("candidates").select("id").limit(1).execute()
            latency = round((time.perf_counter() - t0) * 1000)
            services["supabase"] = {"status": "operational", "latency_ms": latency}
    except Exception:
        latency = round((time.perf_counter() - t0) * 1000)
        services["supabase"] = {"status": "down", "latency_ms": latency}

    # Matching Engine
    try:
        t0 = time.perf_counter()
        from engine.compatibility import calculate_compatibility  # noqa: F811
        latency = round((time.perf_counter() - t0) * 1000)
        services["matching_engine"] = {"status": "operational", "latency_ms": latency}
    except Exception:
        services["matching_engine"] = {"status": "down", "latency_ms": 0}

    # Auth
    services["auth"] = {
        "status": "operational" if is_auth_configured() else "degraded"
    }

    # Overall status
    statuses = [s["status"] for s in services.values()]
    if any(s == "down" for s in statuses):
        overall = "degraded"
    elif any(s == "degraded" for s in statuses):
        overall = "degraded"
    else:
        overall = "operational"

    return {
        "status": overall,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": services,
    }


# ============ Auth Endpoints ============

@app.post("/api/auth/check-email", response_model=CheckEmailResponse)
async def check_email_exists(request: CheckEmailRequest):
    """
    Check if an email exists in the database.
    Used to redirect users appropriately during signup/signin.
    """
    if not request.email or not request.email.strip():
        raise HTTPException(status_code=400, detail="Email is required")

    email = request.email.strip().lower()

    # Check in Supabase profiles table
    exists = check_email_in_profiles(email)

    if exists:
        return CheckEmailResponse(
            exists=True,
            message="An account with this email already exists."
        )

    return CheckEmailResponse(
        exists=False,
        message="No account found with this email."
    )


# ============ User Endpoints ============

@app.get("/api/me")
async def get_current_user_info(
    user: AuthUser = Depends(require_auth)
):
    """
    Get the current authenticated user's information.

    Requires valid JWT token in Authorization header.
    """
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "is_candidate": user.is_candidate,
        "is_employer": user.is_employer,
    }


# ============ Assessment Endpoints ============

@app.post("/api/assessment/start", response_model=StartAssessmentResponse)
async def start_assessment(request: StartAssessmentRequest):
    """
    Start a new assessment for a candidate.
    If the candidate already exists, resume their assessment.
    """
    # Check if candidate already exists
    existing = get_candidate_by_email(request.email)

    if existing:
        candidate_id = existing["id"]
        session = get_assessment_session(candidate_id)
        current_q = session["current_question"] if session else 1

        # Check if already completed
        if session and session["status"] == "completed":
            raise HTTPException(
                status_code=400,
                detail="Assessment already completed. Check your results."
            )
    else:
        # Create new candidate
        candidate_id = create_candidate(request.name, request.email)
        if not candidate_id:
            raise HTTPException(status_code=500, detail="Failed to create candidate")
        current_q = 1

    question = get_question(current_q)
    if not question:
        raise HTTPException(status_code=500, detail="Failed to get question")

    return StartAssessmentResponse(
        candidate_id=candidate_id,
        current_question=current_q,
        total_questions=get_total_questions(),
        question=question,
        message="Let's see if we're a great fit! This assessment takes about 5 minutes."
    )


@app.post("/api/assessment/answer", response_model=SubmitAnswerResponse)
async def submit_answer(request: SubmitAnswerRequest):
    """Submit an answer to an assessment question."""
    # Validate candidate exists
    candidate = get_candidate(request.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Validate question exists
    question = get_question(request.question_id)
    if not question:
        raise HTTPException(status_code=400, detail="Invalid question ID")

    # Validate answer is one of the options
    if request.answer not in question["options"]:
        raise HTTPException(status_code=400, detail="Invalid answer option")

    # Save the response
    success = save_assessment_response(
        request.candidate_id,
        request.question_id,
        request.answer
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to save response")

    total = get_total_questions()
    next_q_id = request.question_id + 1

    # When all questions have been answered, trigger score calculation.
    # This aggregates all responses into dimension scores, computes the
    # four composite scores, and identifies the candidate's top traits.
    if next_q_id > total:
        responses = get_assessment_responses(request.candidate_id)
        scores = calculate_scores(responses)

        save_scores(
            request.candidate_id,
            scores["culture_fit_score"],
            scores["work_style_score"],
            scores["communication_score"],
            scores["values_score"],
            ",".join(scores["top_traits"])
        )

        complete_assessment(request.candidate_id)

        return SubmitAnswerResponse(
            success=True,
            next_question=None,
            current_question=total,
            total_questions=total,
            is_complete=True,
            message="Assessment complete! Calculating your culture fit score..."
        )

    next_question = get_question(next_q_id)

    # Check if we're at the halfway point
    if next_q_id == 6:
        return SubmitAnswerResponse(
            success=True,
            next_question=next_question,
            current_question=next_q_id,
            total_questions=total,
            is_complete=False,
            message="You're halfway there! Ready to continue?"
        )

    return SubmitAnswerResponse(
        success=True,
        next_question=next_question,
        current_question=next_q_id,
        total_questions=total,
        is_complete=False,
        message=""
    )


@app.get("/api/assessment/results/{candidate_id}", response_model=AssessmentResultsResponse)
async def get_assessment_results(candidate_id: int):
    """Get assessment results for a candidate."""
    candidate = get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    scores = get_scores(candidate_id)
    if not scores:
        raise HTTPException(status_code=404, detail="Assessment not completed")

    top_traits = scores["top_traits"].split(",") if scores["top_traits"] else []
    explanation = get_score_explanation(scores["culture_fit_score"])

    return AssessmentResultsResponse(
        candidate_id=candidate_id,
        name=candidate["name"],
        culture_fit_score=scores["culture_fit_score"],
        work_style_score=scores["work_style_score"],
        communication_score=scores["communication_score"],
        values_score=scores["values_score"],
        top_traits=top_traits,
        explanation=explanation
    )


@app.get("/api/assessment/question/{question_id}")
async def get_question_by_id(question_id: int):
    """Get a specific question by ID."""
    question = get_question(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@app.get("/api/assessment/questions")
async def get_questions():
    """Get all assessment questions."""
    return {
        "questions": get_all_questions(),
        "total": get_total_questions()
    }


# ============ Candidate Dashboard Endpoints ============
# Note: These endpoints require authentication when SUPABASE_JWT_SECRET is configured

@app.get("/api/candidates", response_model=List[CandidateResponse])
async def get_candidates(
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Get all candidates with their scores (for employer dashboard).

    When auth is enabled, requires employer role.
    """
    # In production, verify employer role
    if user and not user.is_employer:
        raise HTTPException(
            status_code=403,
            detail="Only employers can view candidate list"
        )

    candidates = get_all_candidates_with_scores()

    return [
        CandidateResponse(
            id=c["id"],
            name=c["name"],
            email=c["email"],
            culture_fit_score=c.get("culture_fit_score"),
            work_style_score=c.get("work_style_score"),
            communication_score=c.get("communication_score"),
            values_score=c.get("values_score"),
            top_traits=c["top_traits"].split(",") if c.get("top_traits") else None,
            assessment_status=c.get("assessment_status")
        )
        for c in candidates
    ]


@app.get("/api/candidates/{candidate_id}", response_model=CandidateResponse)
async def get_candidate_by_id(
    candidate_id: int,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Get a specific candidate by ID.

    When auth is enabled, requires employer role.
    """
    # In production, verify employer role
    if user and not user.is_employer:
        raise HTTPException(
            status_code=403,
            detail="Only employers can view candidate details"
        )

    candidate = get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    scores = get_scores(candidate_id)

    return CandidateResponse(
        id=candidate["id"],
        name=candidate["name"],
        email=candidate["email"],
        culture_fit_score=scores.get("culture_fit_score") if scores else None,
        work_style_score=scores.get("work_style_score") if scores else None,
        communication_score=scores.get("communication_score") if scores else None,
        values_score=scores.get("values_score") if scores else None,
        top_traits=scores["top_traits"].split(",") if scores and scores.get("top_traits") else None,
        assessment_status=None
    )


# ============ Feedback Endpoints ============

@app.post("/api/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    """Submit user feedback."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Feedback message cannot be empty")

    success = save_feedback(
        message=request.message,
        user_type=request.user_type,
        page=request.page
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to save feedback")

    return FeedbackResponse(
        success=True,
        message="Thanks for your feedback!"
    )


@app.get("/api/feedback")
async def get_feedback():
    """Get all feedback (admin endpoint)."""
    return get_all_feedback()


# ============ Matching Endpoints ============
# These helper functions convert raw Supabase dictionaries into typed dataclass
# instances used by the compatibility scoring engine. Defaults to 50 (neutral)
# when a score is missing, since 50 represents the midpoint on the 0-100 scale.

def _build_candidate_ocean(candidate: dict) -> CandidateOCEAN:
    """Build CandidateOCEAN from Supabase candidate data."""
    return CandidateOCEAN(
        openness=candidate.get('openness_score') or 50,
        conscientiousness=candidate.get('conscientiousness_score') or 50,
        extraversion=candidate.get('extraversion_score') or 50,
        agreeableness=candidate.get('agreeableness_score') or 50,
        neuroticism=candidate.get('neuroticism_score') or 50,
    )


def _build_employer_preferences(employer: dict) -> EmployerPreferences:
    """Build EmployerPreferences from Supabase employer data."""
    return EmployerPreferences(
        openness_preference=employer.get('openness_preference') or 50,
        conscientiousness_preference=employer.get('conscientiousness_preference') or 50,
        extraversion_preference=employer.get('extraversion_preference') or 50,
        agreeableness_preference=employer.get('agreeableness_preference') or 50,
        neuroticism_preference=employer.get('neuroticism_preference') or 50,
        culture_values=employer.get('culture_values') or [],
    )


def _build_role_requirements(role: dict) -> RoleRequirements:
    """Build RoleRequirements from Supabase role data."""
    return RoleRequirements(
        required_openness_min=role.get('required_openness_min'),
        required_openness_max=role.get('required_openness_max'),
        required_conscientiousness_min=role.get('required_conscientiousness_min'),
        required_conscientiousness_max=role.get('required_conscientiousness_max'),
        required_extraversion_min=role.get('required_extraversion_min'),
        required_extraversion_max=role.get('required_extraversion_max'),
        required_agreeableness_min=role.get('required_agreeableness_min'),
        required_agreeableness_max=role.get('required_agreeableness_max'),
        required_neuroticism_min=role.get('required_neuroticism_min'),
        required_neuroticism_max=role.get('required_neuroticism_max'),
        work_style=role.get('work_style'),
    )


@app.post("/api/matching/calculate", response_model=MatchResult)
async def calculate_match(
    request: CalculateMatchRequest,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Calculate compatibility score between a candidate and a role.
    Stores the result in the applications table.
    """
    # Get candidate data
    candidate = get_supabase_candidate(request.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Get role with employer data
    role_data = get_role(request.role_id)
    if not role_data:
        raise HTTPException(status_code=404, detail="Role not found")

    employer = role_data.get('employers', {})

    # Build scoring inputs
    candidate_ocean = _build_candidate_ocean(candidate)
    employer_prefs = _build_employer_preferences(employer)
    role_reqs = _build_role_requirements(role_data)

    # Calculate compatibility
    result = calculate_compatibility(
        candidate=candidate_ocean,
        employer=employer_prefs,
        candidate_work_style=candidate.get('work_style'),
        role=role_reqs,
    )

    # Store in applications table
    upsert_application({
        'candidate_id': request.candidate_id,
        'role_id': request.role_id,
        'trait_match_score': result.trait_match_score,
        'culture_match_score': result.culture_match_score,
        'overall_match_score': result.overall_match_score,
        'match_breakdown': result.breakdown,
        'status': 'scored',
    })

    return MatchResult(
        candidate_id=request.candidate_id,
        role_id=request.role_id,
        trait_match_score=result.trait_match_score,
        culture_match_score=result.culture_match_score,
        overall_match_score=result.overall_match_score,
        breakdown=result.breakdown,
    )


@app.get("/api/matching/candidates/{role_id}", response_model=List[CandidateMatchResult])
async def get_candidates_for_role(
    role_id: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Get all candidates ranked by match score for a specific role.
    Requires employer role when auth is enabled.
    """
    if user and not user.is_employer:
        raise HTTPException(status_code=403, detail="Only employers can view candidates for roles")

    # Get role with employer
    role_data = get_role(role_id)
    if not role_data:
        raise HTTPException(status_code=404, detail="Role not found")

    employer = role_data.get('employers', {})
    employer_prefs = _build_employer_preferences(employer)
    role_reqs = _build_role_requirements(role_data)

    # Get all candidates with OCEAN scores
    candidates = get_supabase_candidates()
    results = []

    for candidate in candidates:
        candidate_ocean = _build_candidate_ocean(candidate)

        # Calculate compatibility
        result = calculate_compatibility(
            candidate=candidate_ocean,
            employer=employer_prefs,
            candidate_work_style=candidate.get('work_style'),
            role=role_reqs,
        )

        profile = candidate.get('profiles', {})
        results.append(CandidateMatchResult(
            candidate_id=candidate['id'],
            candidate_name=profile.get('full_name') or 'Unknown',
            candidate_email=profile.get('email') or '',
            trait_match_score=result.trait_match_score,
            culture_match_score=result.culture_match_score,
            overall_match_score=result.overall_match_score,
            breakdown=result.breakdown,
        ))

    # Sort by overall match score descending
    results.sort(key=lambda x: x.overall_match_score, reverse=True)
    return results


@app.get("/api/matching/roles/{candidate_id}", response_model=List[RoleMatchResult])
async def get_roles_for_candidate(
    candidate_id: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Get all active roles ranked by match score for a specific candidate.
    """
    # Get candidate
    candidate = get_supabase_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate_ocean = _build_candidate_ocean(candidate)

    # Get all active roles
    roles = get_all_active_roles()
    results = []

    for role_data in roles:
        employer = role_data.get('employers', {})
        employer_prefs = _build_employer_preferences(employer)
        role_reqs = _build_role_requirements(role_data)

        # Calculate compatibility
        result = calculate_compatibility(
            candidate=candidate_ocean,
            employer=employer_prefs,
            candidate_work_style=candidate.get('work_style'),
            role=role_reqs,
        )

        results.append(RoleMatchResult(
            role_id=role_data['id'],
            role_title=role_data.get('title') or 'Unknown Role',
            employer_name=employer.get('company_name') or 'Unknown Company',
            trait_match_score=result.trait_match_score,
            culture_match_score=result.culture_match_score,
            overall_match_score=result.overall_match_score,
            breakdown=result.breakdown,
        ))

    # Sort by overall match score descending
    results.sort(key=lambda x: x.overall_match_score, reverse=True)
    return results


@app.post("/api/matching/batch-calculate/{role_id}")
async def batch_calculate_for_role(
    role_id: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Calculate and store match scores for all candidates against a specific role.
    Requires employer role when auth is enabled.
    """
    if user and not user.is_employer:
        raise HTTPException(status_code=403, detail="Only employers can run batch calculations")

    # Get role with employer
    role_data = get_role(role_id)
    if not role_data:
        raise HTTPException(status_code=404, detail="Role not found")

    employer = role_data.get('employers', {})
    employer_prefs = _build_employer_preferences(employer)
    role_reqs = _build_role_requirements(role_data)

    # Get all candidates with OCEAN scores
    candidates = get_supabase_candidates()
    count = 0

    for candidate in candidates:
        candidate_ocean = _build_candidate_ocean(candidate)

        # Calculate compatibility
        result = calculate_compatibility(
            candidate=candidate_ocean,
            employer=employer_prefs,
            candidate_work_style=candidate.get('work_style'),
            role=role_reqs,
        )

        # Store in applications table
        upsert_application({
            'candidate_id': candidate['id'],
            'role_id': role_id,
            'trait_match_score': result.trait_match_score,
            'culture_match_score': result.culture_match_score,
            'overall_match_score': result.overall_match_score,
            'match_breakdown': result.breakdown,
            'status': 'scored',
        })
        count += 1

    return {
        "success": True,
        "message": f"Calculated scores for {count} candidates",
        "candidates_scored": count,
    }


@app.get("/api/matching/employer-candidates")
async def get_employer_candidates(
    user: AuthUser = Depends(require_auth)
):
    """
    Get candidates ranked by culture fit for the authenticated employer.
    No specific role - just overall employer culture match.
    """
    if not user.is_employer:
        raise HTTPException(status_code=403, detail="Only employers can access this endpoint")

    # Get employer data
    employer = get_employer_by_user_id(user.id)
    if not employer:
        raise HTTPException(status_code=404, detail="Employer profile not found")

    employer_prefs = _build_employer_preferences(employer)

    # Get all candidates with OCEAN scores
    candidates = get_supabase_candidates()
    results = []

    for candidate in candidates:
        candidate_ocean = _build_candidate_ocean(candidate)

        # Calculate compatibility without role-specific requirements
        result = calculate_compatibility(
            candidate=candidate_ocean,
            employer=employer_prefs,
            candidate_work_style=candidate.get('work_style'),
        )

        profile = candidate.get('profiles', {})
        results.append({
            'candidate_id': candidate['id'],
            'candidate_name': profile.get('full_name') or 'Unknown',
            'candidate_email': profile.get('email') or '',
            'headline': candidate.get('headline'),
            'trait_match_score': result.trait_match_score,
            'culture_match_score': result.culture_match_score,
            'overall_match_score': result.overall_match_score,
            'breakdown': result.breakdown,
        })

    # Sort by overall match score descending
    results.sort(key=lambda x: x['overall_match_score'], reverse=True)
    return results


# ============ Ember Agent Endpoints ============

@app.get("/api/ember/candidate-matches/{candidate_id}")
async def ember_candidate_matches(
    candidate_id: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Ember Agent: Get personality-based match analysis for a candidate across all active roles.
    Returns ranked matches with personality insights, archetype, and dimensional analysis.
    """
    # Get candidate data
    candidate = get_supabase_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not candidate.get('openness_score'):
        raise HTTPException(status_code=400, detail="Candidate has not completed personality assessment")

    # Get all active roles with employer data
    roles = get_all_active_roles()
    if not roles:
        return {
            'candidate_id': candidate_id,
            'archetype': determine_archetype(EmberCandidateOCEAN(
                openness=candidate.get('openness_score') or 50,
                conscientiousness=candidate.get('conscientiousness_score') or 50,
                extraversion=candidate.get('extraversion_score') or 50,
                agreeableness=candidate.get('agreeableness_score') or 50,
                neuroticism=candidate.get('neuroticism_score') or 50,
            )),
            'matches': [],
            'ember_message': "No active roles available yet. Check back soon!",
        }

    # Run Ember analysis for each role
    matches = []
    for role_data in roles:
        employer = role_data.get('employers', {})
        analysis = run_ember_analysis(candidate, employer, role_data)

        matches.append({
            'role_id': role_data['id'],
            'role_title': role_data.get('title', 'Unknown Role'),
            'company_name': employer.get('company_name', 'Unknown Company'),
            'company_industry': employer.get('industry', ''),
            'company_size': employer.get('company_size', ''),
            'company_location': employer.get('location', ''),
            'role_location': role_data.get('location', ''),
            'work_style': role_data.get('work_style', ''),
            'salary_min': role_data.get('salary_min'),
            'salary_max': role_data.get('salary_max'),
            'employment_type': role_data.get('employment_type', ''),
            **analysis,
        })

    # Sort by overall score
    matches.sort(key=lambda x: x['overall_score'], reverse=True)

    # Get candidate archetype
    archetype = determine_archetype(EmberCandidateOCEAN(
        openness=candidate.get('openness_score') or 50,
        conscientiousness=candidate.get('conscientiousness_score') or 50,
        extraversion=candidate.get('extraversion_score') or 50,
        agreeableness=candidate.get('agreeableness_score') or 50,
        neuroticism=candidate.get('neuroticism_score') or 50,
    ))

    top_score = matches[0]['overall_score'] if matches else 0
    if top_score >= 85:
        ember_msg = f"Great news! I found {len(matches)} roles, and your top match is exceptional at {top_score}%!"
    elif top_score >= 70:
        ember_msg = f"I analyzed {len(matches)} roles for your personality. Your best match is a solid {top_score}%."
    else:
        ember_msg = f"I checked {len(matches)} roles. The matches aren't perfect, but there could be good growth opportunities."

    return {
        'candidate_id': candidate_id,
        'archetype': archetype,
        'matches': matches,
        'total_matches': len(matches),
        'ember_message': ember_msg,
    }


@app.get("/api/ember/employer-matches/{employer_id}")
async def ember_employer_matches(
    employer_id: str,
    role_id: Optional[str] = None,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Ember Agent: Get personality-based candidate rankings for an employer.
    Optionally filtered to a specific role.
    """
    # Get employer data
    employer = get_employer_by_id(employer_id)
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")

    # Get role data if specified
    role_data = None
    if role_id:
        role_data = get_role(role_id)
        if not role_data:
            raise HTTPException(status_code=404, detail="Role not found")

    # Get all candidates with scores
    candidates = get_supabase_candidates()
    if not candidates:
        return {
            'employer_id': employer_id,
            'role_id': role_id,
            'candidates': [],
            'ember_message': "No candidates with completed assessments yet.",
        }

    # Run Ember analysis for each candidate
    results = run_ember_employer_analysis(employer, candidates, role_data)

    company_name = employer.get('company_name', 'your company')
    top_score = results[0]['overall_score'] if results else 0
    if top_score >= 80:
        ember_msg = f"Found {len(results)} candidates for {company_name}. Top personality match: {top_score}%!"
    else:
        ember_msg = f"Analyzed {len(results)} candidates for {company_name}. Here are the best personality fits."

    return {
        'employer_id': employer_id,
        'role_id': role_id,
        'candidates': results,
        'total_candidates': len(results),
        'ember_message': ember_msg,
    }


@app.get("/api/ember/analysis")
async def ember_single_analysis(
    candidate_id: str,
    employer_id: str,
    role_id: Optional[str] = None,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """
    Ember Agent: Get detailed personality analysis for a specific candidate-employer pair.
    """
    candidate = get_supabase_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not candidate.get('openness_score'):
        raise HTTPException(status_code=400, detail="Candidate has not completed personality assessment")

    employer = get_employer_by_id(employer_id)
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")

    role_data = None
    if role_id:
        role_data = get_role(role_id)

    analysis = run_ember_analysis(candidate, employer, role_data)

    profile = candidate.get('profiles', {})
    return {
        'candidate_id': candidate_id,
        'candidate_name': profile.get('full_name', 'Unknown'),
        'employer_id': employer_id,
        'company_name': employer.get('company_name', 'Unknown'),
        'role_id': role_id,
        'role_title': role_data.get('title') if role_data else None,
        **analysis,
    }


@app.post("/api/coffee-chats/{chat_id}/prep")
async def coffee_chat_prep(
    chat_id: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Generate a personality-based prep brief for a specific coffee chat using Ember's matching engine."""
    chat = get_coffee_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Coffee chat not found")

    candidate = get_supabase_candidate(chat['candidate_id'])
    employer = get_employer_by_id(chat['employer_id'])

    if not candidate or not employer:
        raise HTTPException(status_code=404, detail="Participant data not found")

    role_data = get_role(chat.get('role_id')) if chat.get('role_id') else None
    analysis = run_ember_analysis(candidate, employer, role_data)

    archetype = analysis.get('candidate_archetype', {})
    overall = analysis.get('overall_score', 0)
    company = employer.get('company_name', 'the company')
    arch_name = archetype.get('name', 'Your archetype')
    fit_level = 'strong' if overall >= 75 else 'moderate' if overall >= 55 else 'developing'

    # Build personality-based prep using Ember's analysis
    insights = analysis.get('insights', [])
    strengths = [i['message'] for i in insights if i.get('category') == 'strength']
    cautions = [i['message'] for i in insights if i.get('category') == 'caution']
    tips = [i['message'] for i in insights if i.get('category') == 'tip']

    prep = {
        'personality_summary': (
            f"As {arch_name}, you bring {archetype.get('description', 'unique strengths')} "
            f"to this conversation. Your {fit_level} compatibility score of {overall}% with "
            f"{company} suggests {'excellent alignment' if overall >= 75 else 'interesting complementary dynamics'}."
        ),
        'conversation_starters': [
            f"What does a typical day look like on your team at {company}?",
            "How would you describe the team's communication style?",
            "What's one thing about your culture that might surprise people?",
            "How does the team handle disagreements or different perspectives?",
            "What's the most rewarding project you've worked on recently?",
        ],
        'topics_to_explore': [
            'Team dynamics and collaboration style',
            'Growth opportunities and learning culture',
            'Work-life balance and flexibility',
            'Decision-making processes',
        ],
        'things_to_be_mindful_of': (
            cautions[:3] if cautions else [
                f'Your {arch_name} tendency may differ from their expected style - be authentic but adaptable',
                'Listen actively and ask follow-up questions to show genuine interest',
                'Share specific examples from your experience that demonstrate culture alignment',
            ]
        ),
        'archetype_tips': (
            tips[:2] if tips else [
                f'As {arch_name}, lead with your natural strengths in the conversation',
                'Balance sharing your perspective with curiosity about theirs',
            ]
        ),
        'strengths': strengths[:3],
    }

    return {
        'chat_id': chat_id,
        'prep': prep,
        'match_score': analysis['overall_score'],
        'archetype': archetype,
    }


# ============ Coffee Chat Endpoints ============

@app.post("/api/coffee-chats")
async def create_coffee_chat_endpoint(
    request: CreateCoffeeChatRequest,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Create a new coffee chat request."""
    chat = create_coffee_chat({
        'candidate_id': request.candidate_id,
        'employer_id': request.employer_id,
        'role_id': request.role_id,
        'message': request.message,
        'initiated_by': request.initiated_by,
        'status': 'pending',
    })
    if not chat:
        raise HTTPException(status_code=500, detail="Failed to create coffee chat")
    return chat


@app.get("/api/coffee-chats/candidate/{candidate_id}")
async def get_candidate_coffee_chats(
    candidate_id: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Get all coffee chats for a candidate."""
    return get_coffee_chats_for_candidate(candidate_id)


@app.get("/api/coffee-chats/employer/{employer_id}")
async def get_employer_coffee_chats(
    employer_id: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Get all coffee chats for an employer."""
    return get_coffee_chats_for_employer(employer_id)


@app.patch("/api/coffee-chats/{chat_id}/status")
async def update_coffee_chat_status(
    chat_id: str,
    status: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Update coffee chat status (accept, cancel, complete)."""
    if status not in ['accepted', 'cancelled', 'completed']:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = update_coffee_chat(chat_id, {'status': status})
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update coffee chat")
    return result


@app.patch("/api/coffee-chats/{chat_id}/schedule")
async def schedule_coffee_chat(
    chat_id: str,
    request: ScheduleCoffeeChatRequest,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Schedule a coffee chat with date/time and optional meeting link."""
    result = update_coffee_chat(chat_id, {
        'scheduled_at': request.scheduled_at,
        'meeting_link': request.meeting_link,
        'status': 'scheduled',
    })
    if not result:
        raise HTTPException(status_code=500, detail="Failed to schedule coffee chat")
    return result


@app.patch("/api/coffee-chats/{chat_id}/feedback")
async def submit_coffee_chat_feedback(
    chat_id: str,
    request: CoffeeChatFeedbackRequest,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Submit feedback after a completed coffee chat."""
    result = update_coffee_chat(chat_id, {
        'rating': request.rating,
        'feedback': request.feedback,
        'status': 'completed',
    })
    if not result:
        raise HTTPException(status_code=500, detail="Failed to submit feedback")
    return result


# ============ Connection Request/Response Models ============

class MeetInviteData(BaseModel):
    proposed_times: List[str] = []  # ISO datetime strings
    duration_minutes: int = 30


class CreateConnectionRequest(BaseModel):
    receiver_id: str
    sender_role: str  # 'candidate' or 'employer'
    message: Optional[str] = None
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
    sender_company: Optional[str] = None
    receiver_company: Optional[str] = None
    meet_invite: Optional[MeetInviteData] = None
    # Coffee chat context fields (passed when "Include A Coffee Chat Invite" is toggled)
    match_score: Optional[float] = None
    role_id: Optional[str] = None
    role_title: Optional[str] = None


class AcceptConnectionRequest(BaseModel):
    accept_meet_invite: bool = False
    confirmed_time: Optional[str] = None  # ISO datetime


# ============ Connection Endpoints ============

@app.post("/api/connections")
async def create_connection_endpoint(
    request: CreateConnectionRequest,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Create a connection request, optionally with a bundled meet invite."""
    print(f"\n[POST /api/connections] user={user.id if user else None}, receiver={request.receiver_id}, role={request.sender_role}, has_meet={request.meet_invite is not None}")
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Check for existing connection
    existing = get_connection_between(user.id, request.receiver_id)
    if existing:
        print(f"[POST /api/connections] existing connection found: {existing['id']}, status={existing['status']}")
        raise HTTPException(status_code=409, detail="Connection already exists")

    conn = create_connection({
        'sender_id': user.id,
        'receiver_id': request.receiver_id,
        'sender_role': request.sender_role,
        'status': 'pending',
        'message': request.message,
        'sender_name': request.sender_name,
        'receiver_name': request.receiver_name,
        'sender_company': request.sender_company,
        'receiver_company': request.receiver_company,
    })
    if not conn:
        raise HTTPException(status_code=500, detail="Failed to create connection")

    # Create bundled meet invite if provided
    if request.meet_invite and conn.get('id'):
        create_meet_invite({
            'connection_id': conn['id'],
            'proposed_times': request.meet_invite.proposed_times,
            'duration_minutes': request.meet_invite.duration_minutes,
            'status': 'pending',
        })

        # Immediately create a coffee_chat record so it appears in both sides' Coffee Chats
        try:
            is_candidate_sender = request.sender_role == 'candidate'
            candidate_id_val = user.id if is_candidate_sender else request.receiver_id
            employer_id_val = request.receiver_id if is_candidate_sender else user.id

            # Resolve candidate/employer entity IDs from user IDs
            candidate_entity = get_candidate_by_user_id(candidate_id_val)
            employer_entity = get_employer_by_user_id(employer_id_val)

            if candidate_entity and employer_entity:
                chat_data = {
                    'candidate_id': candidate_entity['id'],
                    'employer_id': employer_entity['id'],
                    'connection_id': conn['id'],
                    'initiated_by': request.sender_role,
                    'status': 'pending',
                    'message': request.message,
                    'preferred_dates': request.meet_invite.proposed_times,
                    'duration_minutes': request.meet_invite.duration_minutes,
                    'candidate_name': request.sender_name if is_candidate_sender else request.receiver_name,
                    'company_name': request.sender_company if not is_candidate_sender else request.receiver_company,
                    'match_score': int(request.match_score) if request.match_score is not None else None,
                    'role_id': request.role_id,
                    'role_title': request.role_title,
                }
                result = create_coffee_chat(chat_data)
                if not result:
                    print(f"Warning: coffee_chat creation returned None for connection {conn['id']}")
            else:
                print(f"Warning: could not resolve entities — candidate={candidate_entity is not None}, employer={employer_entity is not None}")
        except Exception as e:
            # Log but don't fail the connection request
            print(f"Error creating coffee chat for connection {conn.get('id')}: {e}")

    return conn


@app.patch("/api/connections/{connection_id}/accept")
async def accept_connection_endpoint(
    connection_id: str,
    request: AcceptConnectionRequest,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Accept a connection. Optionally accept the bundled meet invite with a confirmed time."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    conn = get_connection_by_id(connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    if conn['receiver_id'] != user.id:
        raise HTTPException(status_code=403, detail="Only the receiver can accept")
    if conn['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Connection is not pending")

    result = update_connection(connection_id, {'status': 'accepted'})
    if not result:
        raise HTTPException(status_code=500, detail="Failed to accept connection")

    # Handle bundled meet invite acceptance
    if request.accept_meet_invite:
        invite = get_meet_invite_by_connection(connection_id)
        if invite:
            update_meet_invite(invite['id'], {
                'status': 'accepted',
                'confirmed_time': request.confirmed_time,
            })
            # Update the existing coffee_chat (created when connection was sent)
            existing_chat = get_coffee_chat_by_connection(connection_id)
            if existing_chat:
                update_data = {'status': 'accepted'}
                if request.confirmed_time:
                    update_data['scheduled_at'] = request.confirmed_time
                    update_data['status'] = 'scheduled'
                update_coffee_chat(existing_chat['id'], update_data)
            else:
                # Fallback: create coffee_chat if it doesn't exist yet
                chat_data = {
                    'candidate_id': conn['sender_id'] if conn['sender_role'] == 'candidate' else conn['receiver_id'],
                    'employer_id': conn['sender_id'] if conn['sender_role'] == 'employer' else conn['receiver_id'],
                    'connection_id': connection_id,
                    'initiated_by': conn['sender_role'],
                    'status': 'accepted',
                    'message': conn.get('message'),
                    'candidate_name': conn.get('sender_name') if conn['sender_role'] == 'candidate' else conn.get('receiver_name'),
                    'company_name': conn.get('sender_company') if conn['sender_role'] == 'employer' else conn.get('receiver_company'),
                }
                if request.confirmed_time:
                    chat_data['scheduled_at'] = request.confirmed_time
                    chat_data['status'] = 'scheduled'
                create_coffee_chat(chat_data)

    return result


@app.patch("/api/connections/{connection_id}/reject")
async def reject_connection_endpoint(
    connection_id: str,
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Reject a connection request."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    conn = get_connection_by_id(connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    if conn['receiver_id'] != user.id:
        raise HTTPException(status_code=403, detail="Only the receiver can reject")

    result = update_connection(connection_id, {'status': 'rejected'})
    if not result:
        raise HTTPException(status_code=500, detail="Failed to reject connection")

    # Also decline any bundled meet invite
    invite = get_meet_invite_by_connection(connection_id)
    if invite and invite['status'] == 'pending':
        update_meet_invite(invite['id'], {'status': 'declined'})

    return result


@app.get("/api/connections/me")
async def get_my_connections(
    user: Optional[AuthUser] = Depends(get_current_user_dependency)
):
    """Get all connections for the current user, grouped by status."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    all_connections = get_connections_for_user(user.id)

    # Enrich with meet invites
    for conn in all_connections:
        invite = get_meet_invite_by_connection(conn['id'])
        conn['meet_invite'] = invite

    # Group by status and direction
    pending_sent = [c for c in all_connections if c['status'] == 'pending' and c['sender_id'] == user.id]
    pending_received = [c for c in all_connections if c['status'] == 'pending' and c['receiver_id'] == user.id]
    accepted = [c for c in all_connections if c['status'] == 'accepted']
    rejected = [c for c in all_connections if c['status'] == 'rejected']

    return {
        'pending_sent': pending_sent,
        'pending_received': pending_received,
        'accepted': accepted,
        'rejected': rejected,
    }


# ============ Stripe Endpoints ============
# Payment integration for subscription plans. When STRIPE_SECRET_KEY is not set,
# these endpoints return a demo-mode response instead of failing.
#
# Price-ID → plan mapping (must stay in sync with the frontend plans.ts):
import logging
logger = logging.getLogger("amber.stripe")

STRIPE_PRICE_TO_PLAN: dict[str, dict[str, str]] = {
    "price_1T2oVzHXKhBQCJWjU2CJciW7": {"plan": "smooth_talker", "interval": "monthly"},
    "price_1T2oWYHXKhBQCJWjxFrbIaLX": {"plan": "smooth_talker", "interval": "yearly"},
    "price_1T2oXMHXKhBQCJWjDm9jLe3r": {"plan": "connector",     "interval": "monthly"},
    "price_1T2oY1HXKhBQCJWjXUAzGSYX": {"plan": "connector",     "interval": "yearly"},
}


def _get_stripe():
    """Return a configured stripe module, or None."""
    stripe_key = os.environ.get("STRIPE_SECRET_KEY")
    if not stripe_key:
        return None
    try:
        import stripe
    except ImportError:
        logger.error("stripe package not installed. Run: pip install stripe")
        return None
    stripe.api_key = stripe_key
    return stripe


def _resolve_plan_from_price(price_id: str) -> dict[str, str]:
    """Map a Stripe price ID to plan + interval, with a safe fallback."""
    return STRIPE_PRICE_TO_PLAN.get(price_id, {"plan": "smooth_talker", "interval": "monthly"})


def _update_profile_subscription(user_id: str, updates: dict):
    """Update subscription fields on the profiles table via Supabase."""
    from db.supabase_client import get_supabase
    client = get_supabase()
    if not client:
        logger.warning("Supabase not configured — cannot update profile for %s", user_id)
        return
    try:
        client.table("profiles").update(updates).eq("id", user_id).execute()
        logger.info("Updated profile %s: %s", user_id, updates)
    except Exception as e:
        logger.error("Failed to update profile %s: %s", user_id, e)


class CreateCheckoutRequest(BaseModel):
    priceId: str
    userId: Optional[str] = None  # Fallback when auth is not configured


class CreatePortalRequest(BaseModel):
    userId: Optional[str] = None  # Fallback when auth is not configured


def _resolve_user_id(user: Optional[AuthUser], fallback_id: Optional[str]) -> str:
    """Get user ID from JWT auth or fallback body field."""
    if user:
        return user.id
    if fallback_id:
        return fallback_id
    raise HTTPException(status_code=401, detail="User identity required. Log in or provide userId.")


@app.post("/api/stripe/create-checkout-session")
async def create_checkout_session(
    request: CreateCheckoutRequest,
    user: Optional[AuthUser] = Depends(get_current_user_dependency),
):
    """
    Create a Stripe Checkout session for subscription.
    Uses JWT auth when configured, falls back to userId in body.
    If the user already has an active subscription, returns a portal
    URL instead so they can upgrade/downgrade without duplicating subs.
    Returns { url } for frontend redirect.
    """
    user_id = _resolve_user_id(user, request.userId)

    stripe = _get_stripe()
    if not stripe:
        return {"url": None, "message": "Stripe not configured. Set STRIPE_SECRET_KEY."}

    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    # Check if user already has an active Stripe subscription
    from db.supabase_client import get_supabase
    client = get_supabase()
    existing_customer_id = None
    has_active_sub = False
    if client:
        try:
            result = client.table("profiles").select(
                "stripe_customer_id, stripe_subscription_id, subscription_status"
            ).eq("id", user_id).single().execute()
            data = result.data or {}
            existing_customer_id = data.get("stripe_customer_id")
            has_active_sub = (
                bool(data.get("stripe_subscription_id"))
                and data.get("subscription_status") in ("active", "past_due")
            )
        except Exception:
            pass

    # If user already has an active subscription, redirect to portal for upgrade
    if has_active_sub and existing_customer_id:
        try:
            portal_session = stripe.billing_portal.Session.create(
                customer=existing_customer_id,
                return_url=frontend_url + "/app/settings/subscription",
            )
            return {"url": portal_session.url}
        except Exception as e:
            logger.error("Portal session creation for upgrade failed: %s", e)
            raise HTTPException(status_code=500, detail=str(e))

    try:
        checkout_params = {
            "mode": "subscription",
            "line_items": [{"price": request.priceId, "quantity": 1}],
            "success_url": frontend_url + "/billing/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": frontend_url + "/billing/cancel",
            "client_reference_id": user_id,
            "metadata": {"user_id": user_id},
        }
        # Attach existing customer if known so Stripe doesn't create a duplicate
        if existing_customer_id:
            checkout_params["customer"] = existing_customer_id
        session = stripe.checkout.Session.create(**checkout_params)
        return {"url": session.url}
    except Exception as e:
        logger.error("Checkout session creation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stripe/create-portal-session")
async def create_portal_session(
    request: CreatePortalRequest = CreatePortalRequest(),
    user: Optional[AuthUser] = Depends(get_current_user_dependency),
):
    """
    Create a Stripe Customer Portal session for managing subscriptions.
    Looks up stripe_customer_id from the profiles table.
    """
    user_id = _resolve_user_id(user, request.userId)

    stripe = _get_stripe()
    if not stripe:
        return {"url": None, "message": "Stripe not configured."}

    # Look up stripe_customer_id from DB first
    from db.supabase_client import get_supabase
    client = get_supabase()
    customer_id = None
    if client:
        try:
            result = client.table("profiles").select("stripe_customer_id").eq("id", user_id).single().execute()
            customer_id = result.data.get("stripe_customer_id") if result.data else None
        except Exception:
            pass

    # Fallback: search Stripe by metadata
    if not customer_id:
        try:
            customers = stripe.Customer.search(
                query=f"metadata['user_id']:'{user_id}'"
            )
            if not customers.data:
                raise HTTPException(status_code=404, detail="No Stripe customer found. Subscribe to a plan first.")
            customer_id = customers.data[0].id
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Stripe customer search failed: %s", e)
            raise HTTPException(status_code=500, detail=str(e))

    try:
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=frontend_url + "/app/settings/subscription",
        )
        return {"url": session.url}
    except Exception as e:
        logger.error("Portal session creation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stripe/subscription")
async def get_subscription_status(
    request: Request,
    user: Optional[AuthUser] = Depends(get_current_user_dependency),
):
    """Return the current user's subscription info from the profiles table."""
    # Get user_id from auth or query param
    user_id = user.id if user else request.query_params.get("userId")
    if not user_id:
        return {"plan": "free", "status": "inactive", "interval": None, "has_stripe_customer": False}

    from db.supabase_client import get_supabase
    client = get_supabase()
    if not client:
        return {"plan": "free", "status": "inactive", "interval": None, "has_stripe_customer": False}
    try:
        result = client.table("profiles").select(
            "subscription_plan, subscription_status, subscription_interval, stripe_customer_id"
        ).eq("id", user_id).single().execute()
        data = result.data or {}
        return {
            "plan": data.get("subscription_plan") or "free",
            "status": data.get("subscription_status") or "inactive",
            "interval": data.get("subscription_interval"),
            "has_stripe_customer": bool(data.get("stripe_customer_id")),
        }
    except Exception as e:
        logger.error("Failed to fetch subscription for %s: %s", user_id, e)
        return {"plan": "free", "status": "inactive", "interval": None, "has_stripe_customer": False}


@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    """
    Stripe webhook endpoint. Verifies signature using raw body, then
    processes subscription lifecycle events.
    """
    stripe = _get_stripe()
    if not stripe:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="STRIPE_WEBHOOK_SECRET not configured")

    # Read raw body for signature verification
    raw_body = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        event = stripe.Webhook.construct_event(raw_body, sig_header, webhook_secret)
    except stripe.error.SignatureVerificationError as e:
        logger.warning("Webhook signature verification failed: %s", e)
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.error("Webhook construction error: %s", e)
        raise HTTPException(status_code=400, detail=str(e))

    event_type = event["type"]
    data_object = event["data"]["object"]
    logger.info("Stripe webhook received: %s (id=%s)", event_type, event.get("id"))

    # ------ checkout.session.completed ------
    if event_type == "checkout.session.completed":
        user_id = data_object.get("client_reference_id") or data_object.get("metadata", {}).get("user_id")
        if not user_id:
            logger.warning("checkout.session.completed without user_id")
            return {"status": "ok"}

        customer_id = data_object.get("customer")
        subscription_id = data_object.get("subscription")

        # Determine plan from line items
        plan_info = {"plan": "smooth_talker", "interval": "monthly"}
        if subscription_id:
            try:
                sub = stripe.Subscription.retrieve(subscription_id)
                if sub["items"]["data"]:
                    price_id = sub["items"]["data"][0]["price"]["id"]
                    plan_info = _resolve_plan_from_price(price_id)
            except Exception as e:
                logger.error("Failed to retrieve subscription %s: %s", subscription_id, e)

        _update_profile_subscription(user_id, {
            "stripe_customer_id": customer_id,
            "stripe_subscription_id": subscription_id,
            "subscription_plan": plan_info["plan"],
            "subscription_interval": plan_info["interval"],
            "subscription_status": "active",
        })

    # ------ invoice.paid ------
    elif event_type == "invoice.paid":
        customer_id = data_object.get("customer")
        subscription_id = data_object.get("subscription")
        if not customer_id:
            return {"status": "ok"}

        # Find user by stripe_customer_id in DB
        from db.supabase_client import get_supabase
        client = get_supabase()
        if client:
            try:
                result = client.table("profiles").select("id").eq("stripe_customer_id", customer_id).single().execute()
                if result.data:
                    updates: dict = {"subscription_status": "active"}
                    # Update plan info from subscription items
                    if subscription_id:
                        try:
                            sub = stripe.Subscription.retrieve(subscription_id)
                            if sub["items"]["data"]:
                                price_id = sub["items"]["data"][0]["price"]["id"]
                                plan_info = _resolve_plan_from_price(price_id)
                                updates["subscription_plan"] = plan_info["plan"]
                                updates["subscription_interval"] = plan_info["interval"]
                        except Exception:
                            pass
                    _update_profile_subscription(result.data["id"], updates)
            except Exception as e:
                logger.error("invoice.paid: failed to update profile for customer %s: %s", customer_id, e)

    # ------ invoice.payment_failed ------
    elif event_type == "invoice.payment_failed":
        customer_id = data_object.get("customer")
        if not customer_id:
            return {"status": "ok"}

        from db.supabase_client import get_supabase
        client = get_supabase()
        if client:
            try:
                result = client.table("profiles").select("id").eq("stripe_customer_id", customer_id).single().execute()
                if result.data:
                    _update_profile_subscription(result.data["id"], {
                        "subscription_status": "past_due",
                    })
            except Exception as e:
                logger.error("invoice.payment_failed: failed to update profile for customer %s: %s", customer_id, e)

    # ------ customer.subscription.deleted ------
    elif event_type == "customer.subscription.deleted":
        customer_id = data_object.get("customer")
        if not customer_id:
            return {"status": "ok"}

        from db.supabase_client import get_supabase
        client = get_supabase()
        if client:
            try:
                result = client.table("profiles").select("id").eq("stripe_customer_id", customer_id).single().execute()
                if result.data:
                    _update_profile_subscription(result.data["id"], {
                        "subscription_plan": "free",
                        "subscription_interval": None,
                        "subscription_status": "canceled",
                        "stripe_subscription_id": None,
                    })
            except Exception as e:
                logger.error("subscription.deleted: failed to update profile for customer %s: %s", customer_id, e)

    return {"status": "ok"}



# ============ Company Logo Proxy ============
# Serves logo images via a caching proxy so the logo.dev API key is never
# exposed to the frontend.  Logos are fetched once from logo.dev and stored
# on disk; subsequent requests are served directly from the cache.

LOGO_CACHE_DIR = pathlib.Path(__file__).resolve().parent / "cache" / "logos"
LOGO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

_DOMAIN_RE = re.compile(r"^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$")

# Simple per-IP rate limiter: stores deque of timestamps per IP.
_logo_rate: dict[str, collections.deque] = {}
_LOGO_RATE_LIMIT = 60   # max requests
_LOGO_RATE_WINDOW = 60   # per this many seconds


def _check_logo_rate_limit(ip: str) -> bool:
    """Return True if the request is within the rate limit."""
    now = time.monotonic()
    timestamps = _logo_rate.get(ip)
    if timestamps is None:
        timestamps = collections.deque()
        _logo_rate[ip] = timestamps
    # Evict entries older than the window
    while timestamps and now - timestamps[0] > _LOGO_RATE_WINDOW:
        timestamps.popleft()
    if len(timestamps) >= _LOGO_RATE_LIMIT:
        return False
    timestamps.append(now)
    return True


@app.get("/api/logo")
async def get_logo(domain: str, request: Request):
    """Proxy a single company logo through our backend with disk caching."""
    # --- rate limit ---
    client_ip = request.client.host if request.client else "unknown"
    if not _check_logo_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")

    # --- validate domain ---
    domain = domain.strip().lower()
    if not domain or not _DOMAIN_RE.match(domain) or len(domain) > 253:
        raise HTTPException(status_code=400, detail="Invalid domain parameter.")

    # --- check disk cache ---
    cache_file = LOGO_CACHE_DIR / f"{domain}.png"
    if cache_file.exists() and cache_file.stat().st_size > 0:
        return FileResponse(
            path=str(cache_file),
            media_type="image/png",
            headers={"Cache-Control": "public, max-age=604800"},
        )

    # --- fetch from logo.dev ---
    token = os.environ.get("LOGO_DEV_API_KEY")
    if not token:
        raise HTTPException(status_code=500, detail="LOGO_DEV_API_KEY not configured")

    logo_url = f"https://img.logo.dev/{domain}?token={token}&size=80&format=png"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(logo_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch logo from upstream.")
        content_type = resp.headers.get("content-type", "")
        if "image" not in content_type:
            raise HTTPException(status_code=502, detail="Upstream did not return an image.")
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Failed to fetch logo from upstream.")

    # --- write to cache ---
    cache_file.write_bytes(resp.content)

    return FileResponse(
        path=str(cache_file),
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=604800"},
    )


# ============ Main Entry Point ============

if __name__ == "__main__":
    print("starting Amber backend...")
    print("api docs: http://127.0.0.1:8000/docs")

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_excludes=["venv/*", "*.pyc", "__pycache__", ".pytest_cache", "*.db"]
    )
