"""
Amber - Backend API
Culture-first job matching platform
"""

import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from database import (
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
from questions import get_question, get_all_questions, get_total_questions
from scoring import calculate_scores, get_score_explanation
from auth import (
    AuthMiddleware,
    require_auth,
    require_role,
    AuthUser,
    get_current_user_dependency,
    check_email_in_profiles,
)
from auth.supabase_auth import is_auth_configured

# Initialize database
init_database()

app = FastAPI(
    title="Amber API",
    description="Culture-first job matching platform",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1420",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://tauri.localhost",
        "tauri://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware (optional - only active when SUPABASE_JWT_SECRET is set)
# Protected routes require valid JWT token in Authorization header
app.add_middleware(
    AuthMiddleware,
    exclude_paths=["/", "/health", "/docs", "/redoc", "/openapi.json"],
    exclude_prefixes=["/api/assessment/", "/api/auth/"],  # Assessment and auth endpoints are public
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
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "api": "ok",
            "database": "ok",
            "auth": "configured" if is_auth_configured() else "disabled"
        }
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

    # Check if assessment is complete
    if next_q_id > total:
        # Calculate and save scores
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
