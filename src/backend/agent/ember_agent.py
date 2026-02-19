"""
Ember Agent - The Personality Matching Engine for Project Amber

Ember is the AI agent mascot of Project Amber (like Duolingo's owl, but for
personality-based job matching). Ember analyzes personality profiles, compares
them against employer culture and role requirements, and generates compatibility
scores with actionable insights.

The agent works bidirectionally:
- For candidates: scores how compatible they are with each employer/role
- For employers: scores how well each candidate fits their culture and openings
"""

from dataclasses import dataclass
from typing import Optional
from engine.compatibility import (
    CandidateOCEAN,
    EmployerPreferences,
    RoleRequirements,
    calculate_compatibility,
    calculate_confidence,
    calculate_reverse_compatibility,
    CompatibilityResult,
    CULTURE_OCEAN_MAP,
)
from agent.archetype_compatibility import get_archetype_modifier


# ============================================
# PERSONALITY ARCHETYPES
# ============================================

PERSONALITY_ARCHETYPES = {
    'the_innovator': {
        'name': 'The Innovator',
        'emoji': 'lightbulb',
        'description': 'Creative thinker who thrives on new ideas and unconventional approaches',
        'ocean_signature': {'openness': 'high', 'conscientiousness': 'low-mid'},
        'ideal_cultures': ['innovation', 'creativity', 'risk', 'agility'],
    },
    'the_architect': {
        'name': 'The Architect',
        'emoji': 'layers',
        'description': 'Systematic builder who creates order and reliable structures',
        'ocean_signature': {'conscientiousness': 'high', 'openness': 'mid'},
        'ideal_cultures': ['excellence', 'quality', 'stability', 'integrity'],
    },
    'the_connector': {
        'name': 'The Connector',
        'emoji': 'heart',
        'description': 'Natural relationship builder who brings people together',
        'ocean_signature': {'extraversion': 'high', 'agreeableness': 'high'},
        'ideal_cultures': ['collaboration', 'empathy', 'trust', 'diversity'],
    },
    'the_catalyst': {
        'name': 'The Catalyst',
        'emoji': 'zap',
        'description': 'Bold leader who drives change and pushes boundaries',
        'ocean_signature': {'extraversion': 'high', 'openness': 'high', 'agreeableness': 'low'},
        'ideal_cultures': ['speed', 'autonomy', 'growth', 'impact'],
    },
    'the_craftsperson': {
        'name': 'The Craftsperson',
        'emoji': 'target',
        'description': 'Detail-oriented perfectionist who delivers exceptional quality',
        'ocean_signature': {'conscientiousness': 'high', 'extraversion': 'low'},
        'ideal_cultures': ['quality', 'excellence', 'stability', 'integrity'],
    },
    'the_harmonizer': {
        'name': 'The Harmonizer',
        'emoji': 'music',
        'description': 'Empathetic mediator who creates balance and team cohesion',
        'ocean_signature': {'agreeableness': 'high', 'neuroticism': 'low'},
        'ideal_cultures': ['collaboration', 'empathy', 'balance', 'mission'],
    },
    'the_explorer': {
        'name': 'The Explorer',
        'emoji': 'compass',
        'description': 'Curious adventurer who adapts quickly and embraces change',
        'ocean_signature': {'openness': 'high', 'neuroticism': 'low'},
        'ideal_cultures': ['innovation', 'autonomy', 'risk', 'growth'],
    },
    'the_strategist': {
        'name': 'The Strategist',
        'emoji': 'brain',
        'description': 'Analytical thinker who sees the big picture and plans ahead',
        'ocean_signature': {'conscientiousness': 'high', 'openness': 'mid-high'},
        'ideal_cultures': ['excellence', 'growth', 'impact', 'quality'],
    },
}


def classify_level(score: float) -> str:
    """Classify an OCEAN score (0-100) into a discrete level for archetype matching."""
    if score >= 80:
        return 'high'
    elif score >= 60:
        return 'mid-high'
    elif score >= 40:
        return 'mid'
    elif score >= 20:
        return 'low-mid'
    return 'low'


def determine_archetype(ocean: CandidateOCEAN) -> dict:
    """
    Determine the best-fitting personality archetype for a candidate.

    Each archetype has an OCEAN signature (e.g., Innovator = high openness).
    We score each archetype by comparing the candidate's classified trait levels
    against the expected levels, awarding full points for exact matches and
    partial credit based on distance. The archetype with the highest normalized
    score wins. Returns the archetype dict with a confidence value (0-100).
    """
    scores = {
        'openness': ocean.openness,
        'conscientiousness': ocean.conscientiousness,
        'extraversion': ocean.extraversion,
        'agreeableness': ocean.agreeableness,
        'neuroticism': ocean.neuroticism,
    }

    best_match = None
    best_score = -1

    for key, archetype in PERSONALITY_ARCHETYPES.items():
        sig = archetype['ocean_signature']
        match_score = 0
        count = 0

        for trait, expected_level in sig.items():
            actual = classify_level(scores[trait])
            count += 1

            # Score based on how close the actual level is to expected
            level_order = ['low', 'low-mid', 'mid', 'mid-high', 'high']
            expected_parts = expected_level.split('-') if '-' in expected_level else [expected_level]

            if actual in expected_parts:
                match_score += 10  # Exact match
            elif actual == expected_level:
                match_score += 10
            else:
                # Partial credit based on distance
                actual_idx = level_order.index(actual) if actual in level_order else 2
                best_expected_idx = min(
                    (abs(actual_idx - level_order.index(e)) for e in expected_parts if e in level_order),
                    default=2
                )
                match_score += max(0, 10 - best_expected_idx * 3)

        normalized = match_score / max(count, 1)

        if normalized > best_score:
            best_score = normalized
            best_match = {**archetype, 'key': key, 'confidence': round(normalized * 10)}

    return best_match


# ============================================
# EMBER ANALYSIS ENGINE
# ============================================

@dataclass
class EmberInsight:
    """A single insight from Ember's analysis."""
    category: str       # 'strength', 'caution', 'tip', 'highlight'
    message: str
    trait_related: Optional[str] = None
    score_impact: Optional[str] = None  # 'positive', 'negative', 'neutral'


@dataclass
class EmberMatchAnalysis:
    """Complete match analysis from Ember."""
    # Core scores
    overall_score: int
    trait_match_score: int
    culture_match_score: int

    # Personality archetype
    candidate_archetype: dict

    # Detailed breakdown
    breakdown: dict

    # Ember's insights
    insights: list[EmberInsight]

    # Summary messages
    ember_summary: str
    ember_recommendation: str

    # Dimensional analysis
    dimension_analysis: list[dict]


def generate_dimension_analysis(
    candidate: CandidateOCEAN,
    employer: EmployerPreferences,
    role: Optional[RoleRequirements] = None
) -> list[dict]:
    """Generate detailed per-dimension analysis."""
    dimensions = [
        {
            'name': 'Openness',
            'candidate_score': candidate.openness,
            'employer_preference': employer.openness_preference,
            'trait': 'openness',
        },
        {
            'name': 'Conscientiousness',
            'candidate_score': candidate.conscientiousness,
            'employer_preference': employer.conscientiousness_preference,
            'trait': 'conscientiousness',
        },
        {
            'name': 'Extraversion',
            'candidate_score': candidate.extraversion,
            'employer_preference': employer.extraversion_preference,
            'trait': 'extraversion',
        },
        {
            'name': 'Agreeableness',
            'candidate_score': candidate.agreeableness,
            'employer_preference': employer.agreeableness_preference,
            'trait': 'agreeableness',
        },
        {
            'name': 'Emotional Stability',
            'candidate_score': 100 - candidate.neuroticism,  # Invert for readability
            'employer_preference': 100 - employer.neuroticism_preference,
            'trait': 'neuroticism',
        },
    ]

    for dim in dimensions:
        diff = abs(dim['candidate_score'] - dim['employer_preference'])
        dim['fit_score'] = max(0, 100 - diff)
        dim['gap'] = diff
        dim['direction'] = 'above' if dim['candidate_score'] > dim['employer_preference'] else 'below'

        # Check role-specific ranges
        if role:
            trait = dim['trait']
            min_val = getattr(role, f'required_{trait}_min', None)
            max_val = getattr(role, f'required_{trait}_max', None)
            if min_val is not None or max_val is not None:
                actual = getattr(candidate, trait)
                effective_min = min_val if min_val is not None else 0
                effective_max = max_val if max_val is not None else 100
                dim['in_role_range'] = effective_min <= actual <= effective_max
                dim['role_range'] = [effective_min, effective_max]
            else:
                dim['in_role_range'] = True
                dim['role_range'] = None
        else:
            dim['in_role_range'] = True
            dim['role_range'] = None

    return dimensions


def generate_insights(
    candidate: CandidateOCEAN,
    employer: EmployerPreferences,
    archetype: dict,
    culture_values: list[str],
    role: Optional[RoleRequirements] = None,
    compatibility: Optional[CompatibilityResult] = None,
) -> list[EmberInsight]:
    """
    Generate Ember's personality-based insights for a candidate-employer match.

    Insights are categorized as:
      - 'strength': Traits that strongly align with the employer's culture
      - 'caution': Large gaps (>25 points) between candidate and employer preferences
      - 'highlight': Archetype-culture value overlap or exceptional overall scores
      - 'tip': Actionable advice for specific archetype-culture combinations

    Returns up to 8 insights, prioritizing the most impactful observations.
    """
    insights = []

    # Trait-based strengths: check if high candidate scores align with employer values
    if candidate.openness >= 75 and 'innovation' in [v.lower() for v in culture_values]:
        insights.append(EmberInsight(
            category='strength',
            message='Your creative thinking aligns perfectly with this company\'s innovation focus',
            trait_related='openness',
            score_impact='positive',
        ))

    if candidate.conscientiousness >= 80 and 'excellence' in [v.lower() for v in culture_values]:
        insights.append(EmberInsight(
            category='strength',
            message='Your attention to detail and reliability match their pursuit of excellence',
            trait_related='conscientiousness',
            score_impact='positive',
        ))

    if candidate.extraversion >= 75 and 'collaboration' in [v.lower() for v in culture_values]:
        insights.append(EmberInsight(
            category='strength',
            message='Your collaborative energy fits their team-oriented culture',
            trait_related='extraversion',
            score_impact='positive',
        ))

    if candidate.agreeableness >= 80 and 'empathy' in [v.lower() for v in culture_values]:
        insights.append(EmberInsight(
            category='strength',
            message='Your empathetic nature resonates with their people-first values',
            trait_related='agreeableness',
            score_impact='positive',
        ))

    if candidate.neuroticism <= 30:
        insights.append(EmberInsight(
            category='strength',
            message='Your emotional stability is a strong asset for high-pressure environments',
            trait_related='neuroticism',
            score_impact='positive',
        ))

    # Gap-based cautions: flag significant personality gaps (>25 points) that
    # could require adaptation from the candidate
    o_diff = abs(candidate.openness - employer.openness_preference)
    if o_diff > 25:
        direction = 'more creative' if candidate.openness > employer.openness_preference else 'more structured'
        insights.append(EmberInsight(
            category='caution',
            message=f'You tend to be {direction} than what this role typically calls for - be ready to adapt',
            trait_related='openness',
            score_impact='negative',
        ))

    c_diff = abs(candidate.conscientiousness - employer.conscientiousness_preference)
    if c_diff > 25:
        direction = 'more detail-oriented' if candidate.conscientiousness > employer.conscientiousness_preference else 'more flexible'
        insights.append(EmberInsight(
            category='caution',
            message=f'You\'re {direction} than typical for this team - this could be complementary or challenging',
            trait_related='conscientiousness',
            score_impact='negative',
        ))

    e_diff = abs(candidate.extraversion - employer.extraversion_preference)
    if e_diff > 30:
        direction = 'more social' if candidate.extraversion > employer.extraversion_preference else 'more introverted'
        insights.append(EmberInsight(
            category='caution',
            message=f'You\'re {direction} than the team norm - consider how this affects daily collaboration',
            trait_related='extraversion',
            score_impact='negative',
        ))

    # Culture value alignment tips
    archetype_cultures = set(archetype.get('ideal_cultures', []))
    employer_culture_lower = set(v.lower() for v in culture_values)
    shared_values = archetype_cultures & employer_culture_lower

    if len(shared_values) >= 2:
        values_str = ', '.join(shared_values)
        insights.append(EmberInsight(
            category='highlight',
            message=f'Your "{archetype["name"]}" personality naturally aligns with their values: {values_str}',
            score_impact='positive',
        ))

    # Archetype-specific tips
    archetype_key = archetype.get('key', '')
    if archetype_key == 'the_innovator' and 'stability' in employer_culture_lower:
        insights.append(EmberInsight(
            category='tip',
            message='As an Innovator in a stability-focused company, frame your ideas as building on existing foundations',
            score_impact='neutral',
        ))
    elif archetype_key == 'the_craftsperson' and 'speed' in employer_culture_lower:
        insights.append(EmberInsight(
            category='tip',
            message='Your quality focus is valuable, but this team moves fast - find the balance between polish and pace',
            score_impact='neutral',
        ))
    elif archetype_key == 'the_connector' and 'autonomy' in employer_culture_lower:
        insights.append(EmberInsight(
            category='tip',
            message='Your collaborative style is great, but this culture values independence - lead by connecting, not directing',
            score_impact='neutral',
        ))

    # Overall compatibility tip
    if compatibility:
        if compatibility.overall_match_score >= 85:
            insights.append(EmberInsight(
                category='highlight',
                message='This is an exceptional personality match - your natural traits align strongly with this culture',
                score_impact='positive',
            ))
        elif compatibility.overall_match_score >= 70:
            insights.append(EmberInsight(
                category='highlight',
                message='Solid compatibility - you\'d likely feel comfortable and contribute effectively here',
                score_impact='positive',
            ))
        elif compatibility.overall_match_score < 50:
            insights.append(EmberInsight(
                category='tip',
                message='This match has some personality gaps - but diversity of thought can be valuable if you\'re adaptable',
                score_impact='neutral',
            ))

    return insights[:8]  # Limit to 8 insights


def generate_summary(
    archetype: dict,
    compatibility: CompatibilityResult,
    company_name: str,
    role_title: Optional[str] = None,
) -> tuple[str, str]:
    """Generate Ember's summary and recommendation."""
    score = compatibility.overall_match_score
    archetype_name = archetype['name']

    # Summary
    if role_title:
        context = f'the {role_title} role at {company_name}'
    else:
        context = f'{company_name}'

    if score >= 85:
        summary = (
            f'As {archetype_name}, you\'re an excellent fit for {context}. '
            f'Your personality naturally aligns with their culture, and you\'d likely thrive there.'
        )
        recommendation = 'Highly recommended - your personality is a natural match for this environment.'
    elif score >= 70:
        summary = (
            f'As {archetype_name}, you have strong compatibility with {context}. '
            f'Most of your traits align well, with a few areas where you\'d bring complementary perspectives.'
        )
        recommendation = 'Recommended - you\'d fit well here with some natural adaptation.'
    elif score >= 55:
        summary = (
            f'As {archetype_name}, you have decent alignment with {context}. '
            f'There are some personality gaps, but they could bring valuable diversity of thought.'
        )
        recommendation = 'Worth exploring - some personality differences could be growth opportunities.'
    else:
        summary = (
            f'As {archetype_name}, {context} may require significant personality adaptation. '
            f'This doesn\'t mean it\'s wrong for you, but be prepared for some cultural adjustments.'
        )
        recommendation = 'Proceed thoughtfully - this match requires more adaptation than usual.'

    return summary, recommendation


def run_ember_analysis(
    candidate_data: dict,
    employer_data: dict,
    role_data: Optional[dict] = None,
) -> dict:
    """
    Run the full Ember personality matching analysis.

    Args:
        candidate_data: Dict with OCEAN scores and preferences from Supabase
        employer_data: Dict with employer preferences and culture values
        role_data: Optional dict with role-specific requirements

    Returns:
        Complete analysis dict ready for API response
    """
    # Build scoring objects
    candidate_ocean = CandidateOCEAN(
        openness=candidate_data.get('openness_score') or 50,
        conscientiousness=candidate_data.get('conscientiousness_score') or 50,
        extraversion=candidate_data.get('extraversion_score') or 50,
        agreeableness=candidate_data.get('agreeableness_score') or 50,
        neuroticism=candidate_data.get('neuroticism_score') or 50,
    )

    employer_prefs = EmployerPreferences(
        openness_preference=employer_data.get('openness_preference') or 50,
        conscientiousness_preference=employer_data.get('conscientiousness_preference') or 50,
        extraversion_preference=employer_data.get('extraversion_preference') or 50,
        agreeableness_preference=employer_data.get('agreeableness_preference') or 50,
        neuroticism_preference=employer_data.get('neuroticism_preference') or 50,
        culture_values=employer_data.get('culture_values') or [],
    )

    role_reqs = None
    if role_data:
        role_reqs = RoleRequirements(
            required_openness_min=role_data.get('required_openness_min'),
            required_openness_max=role_data.get('required_openness_max'),
            required_conscientiousness_min=role_data.get('required_conscientiousness_min'),
            required_conscientiousness_max=role_data.get('required_conscientiousness_max'),
            required_extraversion_min=role_data.get('required_extraversion_min'),
            required_extraversion_max=role_data.get('required_extraversion_max'),
            required_agreeableness_min=role_data.get('required_agreeableness_min'),
            required_agreeableness_max=role_data.get('required_agreeableness_max'),
            required_neuroticism_min=role_data.get('required_neuroticism_min'),
            required_neuroticism_max=role_data.get('required_neuroticism_max'),
            work_style=role_data.get('work_style'),
        )

    # Calculate compatibility
    compatibility = calculate_compatibility(
        candidate=candidate_ocean,
        employer=employer_prefs,
        candidate_work_style=candidate_data.get('preferred_work_style'),
        role=role_reqs,
    )

    # Determine personality archetype
    archetype = determine_archetype(candidate_ocean)

    # Archetype compatibility modifier
    employer_archetype_name = employer_data.get('archetype_name', '')
    arch_compat = get_archetype_modifier(archetype.get('key', ''), employer_archetype_name)

    # Confidence score
    confidence = calculate_confidence(candidate_data)

    # Reverse compatibility (employer → candidate fit)
    reverse_candidate_data = {
        **candidate_data,
        '_employer_work_style': role_data.get('work_style') if role_data else None,
        '_employer_company_size': employer_data.get('company_size'),
        '_ideal_cultures': archetype.get('ideal_cultures', []),
    }
    reverse_score = calculate_reverse_compatibility(employer_prefs, reverse_candidate_data)

    # Generate dimension analysis
    dimensions = generate_dimension_analysis(candidate_ocean, employer_prefs, role_reqs)

    # Generate insights
    culture_values = employer_data.get('culture_values') or []
    insights = generate_insights(
        candidate_ocean, employer_prefs, archetype, culture_values, role_reqs, compatibility
    )

    # Generate summary
    company_name = employer_data.get('company_name', 'this company')
    role_title = role_data.get('title') if role_data else None
    summary, recommendation = generate_summary(archetype, compatibility, company_name, role_title)

    # Apply archetype bonus to overall score (clamped 0-100)
    adjusted_overall = max(0, min(100, compatibility.overall_match_score + arch_compat['bonus']))

    return {
        'overall_score': adjusted_overall,
        'trait_match_score': compatibility.trait_match_score,
        'culture_match_score': compatibility.culture_match_score,
        'work_style_score': compatibility.work_style_score,
        'communication_score': compatibility.communication_score,
        'confidence_score': confidence,
        'reverse_score': reverse_score,
        'archetype_compatibility': arch_compat,
        'candidate_archetype': archetype,
        'breakdown': compatibility.breakdown,
        'insights': [
            {
                'category': i.category,
                'message': i.message,
                'trait_related': i.trait_related,
                'score_impact': i.score_impact,
            }
            for i in insights
        ],
        'ember_summary': summary,
        'ember_recommendation': recommendation,
        'dimension_analysis': [
            {
                'name': d['name'],
                'candidate_score': d['candidate_score'],
                'employer_preference': d['employer_preference'],
                'fit_score': d['fit_score'],
                'gap': d['gap'],
                'direction': d['direction'],
                'in_role_range': d['in_role_range'],
                'role_range': d['role_range'],
            }
            for d in dimensions
        ],
    }


def run_ember_employer_analysis(
    employer_data: dict,
    candidates: list[dict],
    role_data: Optional[dict] = None,
) -> list[dict]:
    """
    Run Ember analysis from the employer's perspective - rank all candidates.

    Returns a sorted list of candidate match results.
    """
    results = []

    for candidate_data in candidates:
        profile = candidate_data.get('profiles', {})

        analysis = run_ember_analysis(candidate_data, employer_data, role_data)

        results.append({
            'candidate_id': candidate_data.get('id'),
            'candidate_name': profile.get('full_name') or 'Unknown',
            'candidate_email': profile.get('email') or '',
            'candidate_headline': candidate_data.get('headline') or '',
            'candidate_location': candidate_data.get('location') or '',
            'candidate_archetype': analysis['candidate_archetype'],
            'overall_score': analysis['overall_score'],
            'trait_match_score': analysis['trait_match_score'],
            'culture_match_score': analysis['culture_match_score'],
            'breakdown': analysis['breakdown'],
            'top_insights': analysis['insights'][:3],
            'ember_summary': analysis['ember_summary'],
        })

    # Sort by overall score descending
    results.sort(key=lambda x: x['overall_score'], reverse=True)
    return results
