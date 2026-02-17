"""
Amber Scoring Algorithm

Converts raw assessment responses into personality dimension scores. Each answer
option contributes points to one or more dimensions (e.g., "directness",
"collaboration", "autonomy"). These raw dimensions are then grouped into three
categories — work style, communication, and values — and normalized to 0-100
scores. The overall culture fit score is a weighted average of all three.

Score flow:
  1. User selects an answer option for each question.
  2. The option's index maps to a score profile (dimension -> points).
  3. Points are accumulated across all questions.
  4. Category scores are computed by summing relevant dimensions and normalizing.
  5. Culture fit = 35% work style + 35% communication + 30% values.
  6. Top 3 highest-scoring dimensions become the candidate's "top traits".
"""

from typing import Dict, List, Tuple
from engine.questions import ASSESSMENT_QUESTIONS

# Score profiles for each answer option
# Format: {question_id: {option_index: {dimension: points}}}
SCORE_PROFILES = {
    # Question 1: How do you prefer to receive feedback?
    1: {
        0: {"directness": 10, "adaptability": 5},      # Direct and immediate
        1: {"structure": 10, "collaboration": 5},       # Scheduled 1-on-1s
        2: {"structure": 8, "autonomy": 5},             # Written summaries
        3: {"collaboration": 10, "flexibility": 5},    # Casual conversations
    },
    # Question 2: When starting a new project
    2: {
        0: {"structure": 10, "planning": 10},          # Detailed planning first
        1: {"adaptability": 10, "autonomy": 8},        # Jump in and iterate
        2: {"learning": 10, "structure": 5},           # Research similar approaches
        3: {"collaboration": 10, "communication": 5},  # Discuss with team first
    },
    # Question 3: Ideal work environment
    3: {
        0: {"structure": 10, "planning": 5},           # Structured with clear processes
        1: {"autonomy": 10, "flexibility": 8},         # Flexible and autonomous
        2: {"collaboration": 10, "communication": 8},  # Collaborative and social
        3: {"focus": 10, "autonomy": 5},               # Quiet and focused
    },
    # Question 4: Handling ambiguity
    4: {
        0: {"adaptability": 10, "autonomy": 8},        # Thrive in it
        1: {"adaptability": 5, "learning": 5},         # Need some guidance
        2: {"structure": 10, "planning": 5},           # Prefer clear direction
        3: {"structure": 8, "planning": 8},            # Seek structure immediately
    },
    # Question 5: Communication style
    5: {
        0: {"directness": 10, "communication": 8},     # Direct and concise
        1: {"communication": 10, "structure": 5},      # Detailed and thorough
        2: {"collaboration": 8, "flexibility": 5},     # Casual and conversational
        3: {"structure": 10, "communication": 5},      # Formal and structured
    },
    # Question 6: Disagreement handling
    6: {
        0: {"directness": 10, "communication": 8},     # Voice concerns immediately
        1: {"planning": 8, "communication": 5},        # Think it through then discuss
        2: {"collaboration": 10, "flexibility": 5},    # Support the team decision
        3: {"autonomy": 8, "communication": 8},        # Propose alternative approach
    },
    # Question 7: Deadline approach
    7: {
        0: {"adaptability": 10, "focus": 8},           # Work best under pressure
        1: {"planning": 10, "structure": 8},           # Steady pace throughout
        2: {"planning": 10, "structure": 10},          # Early completion
        3: {"flexibility": 10, "adaptability": 5},     # Flexible - depends on priority
    },
    # Question 8: Motivation
    8: {
        0: {"learning": 10, "adaptability": 5},        # Learning new skills
        1: {"impact": 10, "collaboration": 5},         # Impact on users/customers
        2: {"collaboration": 10, "communication": 8},  # Team collaboration
        3: {"autonomy": 10, "focus": 5},               # Autonomy and ownership
    },
    # Question 9: Learning style
    9: {
        0: {"adaptability": 10, "autonomy": 5},        # Hands-on experimentation
        1: {"structure": 10, "focus": 5},              # Reading documentation
        2: {"learning": 8, "focus": 5},                # Watching tutorials
        3: {"collaboration": 10, "communication": 5},  # Asking colleagues
    },
    # Question 10: Startup priorities
    10: {
        0: {"growth": 10, "adaptability": 5},          # Fast growth potential
        1: {"impact": 10, "alignment": 10},            # Mission alignment
        2: {"balance": 10, "flexibility": 5},          # Work-life balance
        3: {"growth": 8, "autonomy": 5},               # Equity opportunity
    },
}

# Trait descriptions for reporting
TRAIT_DESCRIPTIONS = {
    "directness": "Direct Communicator",
    "adaptability": "Highly Adaptable",
    "structure": "Process-Oriented",
    "collaboration": "Team Player",
    "autonomy": "Self-Directed",
    "flexibility": "Flexible Worker",
    "planning": "Strategic Planner",
    "communication": "Strong Communicator",
    "focus": "Deep Focus",
    "learning": "Continuous Learner",
    "impact": "Impact-Driven",
    "growth": "Growth-Minded",
    "alignment": "Mission-Aligned",
    "balance": "Work-Life Conscious",
}


def calculate_scores(responses: List[Dict]) -> Dict:
    """
    Calculate scores from assessment responses.

    Args:
        responses: List of {question_id, answer} dicts

    Returns:
        Dictionary with scores and traits
    """
    # Initialize dimension scores
    dimension_scores = {}

    for response in responses:
        question_id = response.get("question_id")
        answer = response.get("answer")

        if question_id not in SCORE_PROFILES:
            continue

        # Find the option index for this answer
        question = next((q for q in ASSESSMENT_QUESTIONS if q["id"] == question_id), None)
        if not question:
            continue

        try:
            option_index = question["options"].index(answer)
        except ValueError:
            continue

        # Get score profile for this answer
        if option_index in SCORE_PROFILES[question_id]:
            for dimension, points in SCORE_PROFILES[question_id][option_index].items():
                dimension_scores[dimension] = dimension_scores.get(dimension, 0) + points

    # Group dimensions into three scoring categories.
    # Each category's score is the sum of its dimension points divided by the
    # maximum possible points (10 per dimension per question), scaled to 0-100.
    work_style_dimensions = ["structure", "planning", "autonomy", "flexibility", "adaptability", "focus"]
    communication_dimensions = ["directness", "communication", "collaboration"]
    values_dimensions = ["learning", "impact", "growth", "alignment", "balance"]

    def category_score(dimensions: List[str]) -> int:
        relevant_scores = [dimension_scores.get(d, 0) for d in dimensions]
        if not relevant_scores:
            return 50
        max_possible = len(dimensions) * 10  # Max 10 points per dimension per question
        actual = sum(relevant_scores)
        return min(100, int((actual / max(max_possible, 1)) * 100))

    work_style_score = category_score(work_style_dimensions)
    communication_score = category_score(communication_dimensions)
    values_score = category_score(values_dimensions)

    # Calculate overall culture fit score (weighted average)
    culture_fit_score = int(
        work_style_score * 0.35 +
        communication_score * 0.35 +
        values_score * 0.30
    )

    # Get top 3 traits
    sorted_dimensions = sorted(dimension_scores.items(), key=lambda x: x[1], reverse=True)
    top_traits = [
        TRAIT_DESCRIPTIONS.get(dim, dim.title())
        for dim, _ in sorted_dimensions[:3]
    ]

    return {
        "culture_fit_score": culture_fit_score,
        "work_style_score": work_style_score,
        "communication_score": communication_score,
        "values_score": values_score,
        "top_traits": top_traits,
        "dimension_scores": dimension_scores,
    }


def get_score_explanation(culture_fit_score: int) -> str:
    """Get a brief explanation based on the culture fit score."""
    if culture_fit_score >= 80:
        return "Excellent cultural alignment! Your work style and values strongly match what startups typically look for."
    elif culture_fit_score >= 60:
        return "Good cultural fit! You share many traits that are valued in startup environments."
    elif culture_fit_score >= 40:
        return "Moderate alignment. You may thrive in certain startup cultures more than others."
    else:
        return "Your profile suggests you might prefer more structured environments. Startups with established processes could be a good fit."
