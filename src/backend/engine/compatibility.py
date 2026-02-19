"""
Compatibility Scoring Engine for Project Amber

Calculates compatibility scores between candidates and employers/roles using the
Big Five (OCEAN) personality model. The engine produces three score types:

  1. Trait Match Score — How closely a candidate's OCEAN scores align with the
     employer's stated preferences, using weighted Euclidean distance.
  2. Culture Match Score — A composite of work style compatibility (30%), culture
     values alignment via OCEAN proxy (50%), and role-specific fit (20%).
  3. Overall Match Score — 50% trait match + 50% culture match.

All scores are normalized to a 0-100 scale where 100 is a perfect match.
"""

import math
from dataclasses import dataclass
from typing import Optional


@dataclass
class CandidateOCEAN:
    """Candidate's Big Five personality scores (0-100 scale)"""
    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float


@dataclass
class EmployerPreferences:
    """Employer's ideal candidate personality preferences (0-100 scale)"""
    openness_preference: float
    conscientiousness_preference: float
    extraversion_preference: float
    agreeableness_preference: float
    neuroticism_preference: float
    culture_values: list[str]


@dataclass
class RoleRequirements:
    """Role-specific personality requirements (optional min/max ranges)"""
    required_openness_min: Optional[float] = None
    required_openness_max: Optional[float] = None
    required_conscientiousness_min: Optional[float] = None
    required_conscientiousness_max: Optional[float] = None
    required_extraversion_min: Optional[float] = None
    required_extraversion_max: Optional[float] = None
    required_agreeableness_min: Optional[float] = None
    required_agreeableness_max: Optional[float] = None
    required_neuroticism_min: Optional[float] = None
    required_neuroticism_max: Optional[float] = None
    work_style: Optional[str] = None


@dataclass
class CompatibilityResult:
    """Result of a compatibility calculation"""
    trait_match_score: float      # 0-100
    culture_match_score: float    # 0-100
    work_style_score: float       # 0-100
    communication_score: float    # 0-100
    overall_match_score: float    # 0-100
    breakdown: dict               # Detailed breakdown for display


# Culture values to OCEAN correlation mapping.
# Each culture value maps to one or more OCEAN traits with a correlation weight.
# Positive weights mean a higher candidate score in that trait aligns with the value.
# Negative weights mean a lower candidate score aligns better (e.g., low neuroticism
# correlates with the "balance" value, meaning emotionally stable candidates fit better
# in cultures that prioritize work-life balance).
CULTURE_OCEAN_MAP = {
    'innovation': {'openness': 0.8, 'conscientiousness': -0.2},
    'transparency': {'extraversion': 0.3, 'agreeableness': 0.4},
    'collaboration': {'extraversion': 0.5, 'agreeableness': 0.7},
    'autonomy': {'openness': 0.4, 'extraversion': -0.3},
    'growth': {'openness': 0.6, 'conscientiousness': 0.4},
    'impact': {'conscientiousness': 0.5, 'openness': 0.3},
    'balance': {'neuroticism': -0.5, 'conscientiousness': 0.2},
    'diversity': {'openness': 0.7, 'agreeableness': 0.5},
    'customer': {'conscientiousness': 0.4, 'agreeableness': 0.3},
    'excellence': {'conscientiousness': 0.8},
    'agility': {'openness': 0.5, 'conscientiousness': -0.1},
    'integrity': {'conscientiousness': 0.5, 'agreeableness': 0.4},
    # Additional culture values
    'creativity': {'openness': 0.9},
    'stability': {'conscientiousness': 0.6, 'neuroticism': -0.4},
    'speed': {'openness': 0.3, 'conscientiousness': -0.2},
    'quality': {'conscientiousness': 0.8, 'openness': 0.2},
    'mission': {'conscientiousness': 0.4, 'agreeableness': 0.5},
    'empathy': {'agreeableness': 0.9},
    'risk': {'openness': 0.6, 'neuroticism': -0.3},
    'trust': {'agreeableness': 0.6, 'conscientiousness': 0.3},
}


def calculate_trait_match(candidate: CandidateOCEAN, employer: EmployerPreferences) -> tuple[float, dict]:
    """
    Calculate trait match using weighted Euclidean distance,
    normalized to 0-100 scale.

    Each OCEAN dimension contributes equally (20% each).
    Score = 100 - (weighted_distance / max_possible_distance * 100)

    Returns:
        tuple: (match_score, breakdown_dict)
    """
    dimensions = [
        ('openness', candidate.openness, employer.openness_preference),
        ('conscientiousness', candidate.conscientiousness, employer.conscientiousness_preference),
        ('extraversion', candidate.extraversion, employer.extraversion_preference),
        ('agreeableness', candidate.agreeableness, employer.agreeableness_preference),
        ('neuroticism', candidate.neuroticism, employer.neuroticism_preference),
    ]

    breakdown = {}
    sum_sq_diff = 0

    for name, c_val, e_val in dimensions:
        diff = abs(c_val - e_val)
        # Individual trait fit: 100 - diff (since diff is 0-100)
        fit = max(0, 100 - diff)
        breakdown[f'{name}_fit'] = round(fit)
        sum_sq_diff += diff ** 2

    # Weighted Euclidean distance (each dim 0-100 range)
    max_possible = 5 * (100 ** 2)  # If every dimension is 100 apart
    distance_ratio = math.sqrt(sum_sq_diff) / math.sqrt(max_possible)

    score = max(0, min(100, (1 - distance_ratio) * 100))
    return round(score), breakdown


def calculate_role_fit(candidate: CandidateOCEAN, role: RoleRequirements) -> tuple[float, dict]:
    """
    Check if candidate's scores fall within role's required ranges.

    For each dimension with a range set:
    - If candidate falls in range: 100 points
    - If outside range: proportional reduction based on distance

    Dimensions without ranges are scored at 100 (no constraint).

    Returns:
        tuple: (fit_score, breakdown_dict)
    """
    traits = [
        ('openness', candidate.openness, role.required_openness_min, role.required_openness_max),
        ('conscientiousness', candidate.conscientiousness, role.required_conscientiousness_min, role.required_conscientiousness_max),
        ('extraversion', candidate.extraversion, role.required_extraversion_min, role.required_extraversion_max),
        ('agreeableness', candidate.agreeableness, role.required_agreeableness_min, role.required_agreeableness_max),
        ('neuroticism', candidate.neuroticism, role.required_neuroticism_min, role.required_neuroticism_max),
    ]

    scores = []
    breakdown = {}

    for trait_name, candidate_val, min_val, max_val in traits:
        if min_val is None and max_val is None:
            scores.append(100)  # No constraint
            breakdown[f'{trait_name}_role_fit'] = 100
            continue

        effective_min = min_val if min_val is not None else 0
        effective_max = max_val if max_val is not None else 100

        if effective_min <= candidate_val <= effective_max:
            scores.append(100)  # In range
            breakdown[f'{trait_name}_role_fit'] = 100
        else:
            # Distance from nearest boundary, penalized
            distance = min(
                abs(candidate_val - effective_min),
                abs(candidate_val - effective_max)
            )
            penalty = min(distance * 2, 100)  # 2 points per unit of distance
            fit = max(0, 100 - penalty)
            scores.append(fit)
            breakdown[f'{trait_name}_role_fit'] = round(fit)

    overall = round(sum(scores) / len(scores)) if scores else 50
    return overall, breakdown


def calculate_work_style_score(
    candidate_work_style: Optional[str],
    role: Optional[RoleRequirements] = None
) -> float:
    """
    Calculate work style compatibility as an independent score (0-100).
    """
    if not candidate_work_style or not role or not role.work_style:
        return 75  # Default reasonable match

    if candidate_work_style == role.work_style:
        return 100
    elif candidate_work_style == 'flexible' or role.work_style == 'flexible':
        return 85
    elif (candidate_work_style == 'hybrid' and role.work_style in ['remote', 'onsite']) or \
         (role.work_style == 'hybrid' and candidate_work_style in ['remote', 'onsite']):
        return 65
    else:
        return 40


def calculate_communication_fit(candidate: CandidateOCEAN, employer: EmployerPreferences) -> float:
    """
    Calculate communication compatibility (0-100) derived from
    extraversion and agreeableness alignment.
    """
    e_diff = abs(candidate.extraversion - employer.extraversion_preference)
    a_diff = abs(candidate.agreeableness - employer.agreeableness_preference)
    # Weighted blend: extraversion drives communication style, agreeableness drives tone
    score = 100 - (e_diff * 0.55 + a_diff * 0.45)
    return round(max(0, min(100, score)))


def calculate_culture_match(
    candidate: CandidateOCEAN,
    candidate_work_style: Optional[str],
    employer: EmployerPreferences,
    role: Optional[RoleRequirements] = None
) -> tuple[float, dict]:
    """
    Culture match considers:
    1. Work style compatibility (30% of culture score)
    2. Culture values alignment via OCEAN proxy (50%)
    3. Role-specific fit (20%)

    Returns:
        tuple: (culture_score, breakdown_dict)
    """
    scores = []
    weights = []
    breakdown = {}

    # 1. Work style match
    work_style_score = calculate_work_style_score(candidate_work_style, role)
    scores.append(work_style_score)
    weights.append(0.30)
    breakdown['work_style_fit'] = round(work_style_score)

    # 2. Culture values alignment via OCEAN correlation.
    # For each of the employer's culture values, look up which OCEAN traits correlate
    # with that value and compute how well the candidate's scores align. For positive
    # correlations, higher candidate scores are better; for negative correlations,
    # lower candidate scores (inverted to 100 - score) are better.
    if employer.culture_values:
        value_scores = []
        for value in employer.culture_values:
            value_lower = value.lower()
            correlations = CULTURE_OCEAN_MAP.get(value_lower, {})
            if correlations:
                alignment = 0
                count = 0
                for ocean_dim, weight in correlations.items():
                    candidate_val = getattr(candidate, ocean_dim, 50)
                    if weight > 0:
                        alignment += candidate_val * abs(weight)
                    else:
                        alignment += (100 - candidate_val) * abs(weight)
                    count += abs(weight)
                if count > 0:
                    value_scores.append(alignment / count)

        if value_scores:
            values_avg = sum(value_scores) / len(value_scores)
            scores.append(values_avg)
            weights.append(0.50)
            breakdown['values_alignment'] = round(values_avg)

    # 3. Role-specific fit
    if role:
        role_fit, role_breakdown = calculate_role_fit(candidate, role)
        scores.append(role_fit)
        weights.append(0.20)
        breakdown['role_fit'] = role_fit
        breakdown.update(role_breakdown)

    if not scores:
        return 50, breakdown

    # Normalize weights
    total_weight = sum(weights)
    weighted_sum = sum(s * w for s, w in zip(scores, weights))
    final_score = weighted_sum / total_weight

    return round(final_score), breakdown


def calculate_overall_match(
    trait_match: float,
    culture_match: float,
    work_style: float,
    communication: float,
) -> float:
    """
    Overall = 40% trait + 30% culture + 20% work style + 10% communication
    """
    return round(
        trait_match * 0.40
        + culture_match * 0.30
        + work_style * 0.20
        + communication * 0.10
    )


def calculate_confidence(candidate_data: dict) -> int:
    """
    Calculate a confidence score (0-100) based on how complete the candidate's data is.
    - Core OCEAN scores present: +40
    - Profile complete (headline, bio, location): +30
    - Supplementary assessments completed: +30 (7.5 each)
    """
    score = 0

    # OCEAN scores present
    ocean_fields = [
        'openness_score', 'conscientiousness_score', 'extraversion_score',
        'agreeableness_score', 'neuroticism_score',
    ]
    if all(candidate_data.get(f) is not None for f in ocean_fields):
        score += 40

    # Profile completeness
    profile_fields = ['headline', 'bio', 'location']
    filled = sum(1 for f in profile_fields if candidate_data.get(f))
    score += round(30 * filled / len(profile_fields))

    # Supplementary assessments
    assessment_fields = [
        'work_style_assessment_completed',
        'communication_assessment_completed',
        'values_assessment_completed',
        'leadership_assessment_completed',
    ]
    for f in assessment_fields:
        if candidate_data.get(f):
            score += 7  # ~7.5 rounded

    return min(100, score)


def calculate_reverse_compatibility(
    employer: EmployerPreferences,
    candidate_data: dict,
) -> float:
    """
    Score how well the employer's culture fits the *candidate's* preferences.
    Uses candidate's preferred_work_style, preferred_company_size, and archetype
    idealEnvironments to evaluate reverse fit.
    """
    scores = []

    # Work style preference match
    preferred_ws = candidate_data.get('preferred_work_style')
    employer_ws = candidate_data.get('_employer_work_style')  # passed in externally
    if preferred_ws and employer_ws:
        if preferred_ws == employer_ws:
            scores.append(100)
        elif preferred_ws == 'flexible' or employer_ws == 'flexible':
            scores.append(85)
        elif 'hybrid' in (preferred_ws, employer_ws):
            scores.append(65)
        else:
            scores.append(40)

    # Culture values overlap with archetype ideal cultures
    ideal_cultures = candidate_data.get('_ideal_cultures', [])
    employer_values = [v.lower() for v in (employer.culture_values or [])]
    if ideal_cultures and employer_values:
        overlap = len(set(ideal_cultures) & set(employer_values))
        total = max(len(ideal_cultures), 1)
        scores.append(round(min(100, (overlap / total) * 100 + 20)))

    # Company size preference
    preferred_size = candidate_data.get('preferred_company_size')
    employer_size = candidate_data.get('_employer_company_size')
    if preferred_size and employer_size:
        if preferred_size == employer_size:
            scores.append(100)
        else:
            scores.append(60)

    if not scores:
        return 65  # Neutral default

    return round(sum(scores) / len(scores))


def calculate_bidirectional_match(
    candidate: CandidateOCEAN,
    employer: EmployerPreferences,
    candidate_data: dict,
    candidate_work_style: Optional[str] = None,
    role: Optional[RoleRequirements] = None,
) -> dict:
    """
    Calculate both forward (candidate→employer) and reverse (employer→candidate) scores.
    Returns dict with forward_score, reverse_score, and combined_score.
    """
    forward = calculate_compatibility(candidate, employer, candidate_work_style, role)
    reverse = calculate_reverse_compatibility(employer, candidate_data)
    combined = round(forward.overall_match_score * 0.7 + reverse * 0.3)

    return {
        'forward_score': forward.overall_match_score,
        'reverse_score': reverse,
        'combined_score': combined,
        'forward_result': forward,
    }


def calculate_compatibility(
    candidate: CandidateOCEAN,
    employer: EmployerPreferences,
    candidate_work_style: Optional[str] = None,
    role: Optional[RoleRequirements] = None
) -> CompatibilityResult:
    """
    Calculate full compatibility between a candidate and employer/role.

    Args:
        candidate: Candidate's OCEAN scores
        employer: Employer's preferences and culture values
        candidate_work_style: Candidate's preferred work style
        role: Optional role-specific requirements

    Returns:
        CompatibilityResult with all scores and breakdown
    """
    trait_match, trait_breakdown = calculate_trait_match(candidate, employer)
    culture_match, culture_breakdown = calculate_culture_match(
        candidate, candidate_work_style, employer, role
    )
    work_style = calculate_work_style_score(candidate_work_style, role)
    communication = calculate_communication_fit(candidate, employer)
    overall = calculate_overall_match(trait_match, culture_match, work_style, communication)

    breakdown = {
        **trait_breakdown,
        **culture_breakdown,
        'trait_match': trait_match,
        'culture_match': culture_match,
        'work_style_score': work_style,
        'communication_score': communication,
    }

    return CompatibilityResult(
        trait_match_score=trait_match,
        culture_match_score=culture_match,
        work_style_score=work_style,
        communication_score=communication,
        overall_match_score=overall,
        breakdown=breakdown
    )
