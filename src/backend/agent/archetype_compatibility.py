"""
Archetype Compatibility Matrix for Project Amber

Maps candidate personality archetypes (8) to employer culture archetypes (8)
producing a bonus modifier (-10 to +10), synergy notes, and friction notes.
Applied as an additive modifier to the overall compatibility score.
"""

# 8x8 matrix: ARCHETYPE_MATRIX[candidate_key][employer_name] = {bonus, synergy_note, friction_note}
ARCHETYPE_MATRIX: dict[str, dict[str, dict]] = {
    'the_innovator': {
        'The Innovator': {'bonus': 10, 'synergy_note': 'Creative minds amplify each other', 'friction_note': 'May lack grounding without structure'},
        'The Optimizer': {'bonus': -5, 'synergy_note': 'Can introduce fresh perspectives to processes', 'friction_note': 'May feel constrained by rigid processes'},
        'The Collaborator': {'bonus': 3, 'synergy_note': 'Creative ideas thrive in supportive teams', 'friction_note': 'May prefer solo ideation over group consensus'},
        'The Driver': {'bonus': 2, 'synergy_note': 'Innovation fuels ambitious goals', 'friction_note': 'May clash on timelines vs exploration'},
        'The Stabilizer': {'bonus': -8, 'synergy_note': 'Can bring needed evolution to stable systems', 'friction_note': 'Innovation-averse culture feels stifling'},
        'The Visionary': {'bonus': 9, 'synergy_note': 'Shared love of big ideas and possibilities', 'friction_note': 'Both may neglect execution details'},
        'The Nurturer': {'bonus': 1, 'synergy_note': 'Supportive environment for creative risk-taking', 'friction_note': 'Pace mismatch - innovators move fast'},
        'The Challenger': {'bonus': 7, 'synergy_note': 'Intellectual sparring sharpens ideas', 'friction_note': 'Criticism of new ideas can be demotivating'},
    },
    'the_architect': {
        'The Innovator': {'bonus': -3, 'synergy_note': 'Provides structure to creative chaos', 'friction_note': 'May feel uncomfortable with constant change'},
        'The Optimizer': {'bonus': 10, 'synergy_note': 'Perfect alignment on quality and process', 'friction_note': 'Risk of over-engineering together'},
        'The Collaborator': {'bonus': 3, 'synergy_note': 'Reliable foundation for team projects', 'friction_note': 'May prefer systems over relationships'},
        'The Driver': {'bonus': 5, 'synergy_note': 'Delivers consistent results for ambitious targets', 'friction_note': 'Thoroughness may slow rapid execution'},
        'The Stabilizer': {'bonus': 8, 'synergy_note': 'Shared appreciation for reliability and order', 'friction_note': 'Limited innovation potential'},
        'The Visionary': {'bonus': -2, 'synergy_note': 'Can make visions into reality', 'friction_note': 'Frequent pivots frustrate systematic planners'},
        'The Nurturer': {'bonus': 4, 'synergy_note': 'Dependable presence in growth-focused culture', 'friction_note': 'May prioritize systems over people development'},
        'The Challenger': {'bonus': 1, 'synergy_note': 'Structured thinking withstands scrutiny', 'friction_note': 'May resist challenges to established processes'},
    },
    'the_connector': {
        'The Innovator': {'bonus': 3, 'synergy_note': 'Builds bridges between creative silos', 'friction_note': 'May feel underutilized in solo-focused innovation'},
        'The Optimizer': {'bonus': -2, 'synergy_note': 'Humanizes process-driven culture', 'friction_note': 'Relationship focus may clash with efficiency goals'},
        'The Collaborator': {'bonus': 10, 'synergy_note': 'Natural fit - thrives in team-oriented cultures', 'friction_note': 'Both may avoid necessary conflict'},
        'The Driver': {'bonus': -1, 'synergy_note': 'Keeps team morale high during pushes', 'friction_note': 'Relationship building may seem slow to results-focused culture'},
        'The Stabilizer': {'bonus': 2, 'synergy_note': 'Strengthens team bonds in stable environment', 'friction_note': 'May find stable cultures under-stimulating socially'},
        'The Visionary': {'bonus': 4, 'synergy_note': 'Can rally people around the vision', 'friction_note': 'May focus on relationships over strategy'},
        'The Nurturer': {'bonus': 9, 'synergy_note': 'Deep alignment on people-first values', 'friction_note': 'May create echo chamber of agreeableness'},
        'The Challenger': {'bonus': -4, 'synergy_note': 'Brings warmth to intense environments', 'friction_note': 'Confrontational style clashes with harmony-seeking nature'},
    },
    'the_catalyst': {
        'The Innovator': {'bonus': 7, 'synergy_note': 'Drives creative ideas to execution', 'friction_note': 'Two strong personalities may compete'},
        'The Optimizer': {'bonus': -3, 'synergy_note': 'Pushes efficiency to new heights', 'friction_note': 'Disruptive style clashes with process culture'},
        'The Collaborator': {'bonus': -2, 'synergy_note': 'Energizes collaborative projects', 'friction_note': 'Bold style may overwhelm consensus-driven culture'},
        'The Driver': {'bonus': 10, 'synergy_note': 'Shared drive for results and impact', 'friction_note': 'May lack balancing voices in the team'},
        'The Stabilizer': {'bonus': -7, 'synergy_note': 'Can inject needed energy and urgency', 'friction_note': 'Change-driving nature threatens stability-focused culture'},
        'The Visionary': {'bonus': 8, 'synergy_note': 'Turns vision into bold action', 'friction_note': 'Both may move too fast without reflection'},
        'The Nurturer': {'bonus': -4, 'synergy_note': 'Bold leadership with supportive backup', 'friction_note': 'Aggressive style may clash with nurturing culture'},
        'The Challenger': {'bonus': 6, 'synergy_note': 'Thrives on productive tension and debate', 'friction_note': 'Risk of constant power struggles'},
    },
    'the_craftsperson': {
        'The Innovator': {'bonus': -4, 'synergy_note': 'Brings quality execution to creative ideas', 'friction_note': 'May resist rapid prototyping and iteration'},
        'The Optimizer': {'bonus': 9, 'synergy_note': 'Shared obsession with quality and precision', 'friction_note': 'Perfectionism may slow output'},
        'The Collaborator': {'bonus': 1, 'synergy_note': 'Contributes deep expertise to team efforts', 'friction_note': 'Prefers focused work over meetings'},
        'The Driver': {'bonus': 3, 'synergy_note': 'Delivers polished results', 'friction_note': 'Quality focus may conflict with speed demands'},
        'The Stabilizer': {'bonus': 8, 'synergy_note': 'Excellence in a predictable environment', 'friction_note': 'Limited growth and variety'},
        'The Visionary': {'bonus': -5, 'synergy_note': 'Grounds ambitious plans in reality', 'friction_note': 'Detail focus may miss the bigger picture'},
        'The Nurturer': {'bonus': 3, 'synergy_note': 'Patient environment for mastery development', 'friction_note': 'May prefer technical depth over people engagement'},
        'The Challenger': {'bonus': 2, 'synergy_note': 'Expertise holds up under scrutiny', 'friction_note': 'Prefers deep work over debate'},
    },
    'the_harmonizer': {
        'The Innovator': {'bonus': 0, 'synergy_note': 'Keeps creative teams cohesive', 'friction_note': 'May avoid necessary creative conflict'},
        'The Optimizer': {'bonus': 2, 'synergy_note': 'Smooths process adoption through empathy', 'friction_note': 'May prioritize feelings over efficiency'},
        'The Collaborator': {'bonus': 9, 'synergy_note': 'Natural culture fit with team-first values', 'friction_note': 'Both may avoid tough conversations'},
        'The Driver': {'bonus': -5, 'synergy_note': 'Provides emotional intelligence balance', 'friction_note': 'Results pressure conflicts with harmony-seeking'},
        'The Stabilizer': {'bonus': 5, 'synergy_note': 'Creates calm, balanced work environment', 'friction_note': 'Low-energy pairing may lack dynamism'},
        'The Visionary': {'bonus': 1, 'synergy_note': 'Ensures people arent left behind in change', 'friction_note': 'May slow ambitious transformations'},
        'The Nurturer': {'bonus': 10, 'synergy_note': 'Perfect alignment on people-centered values', 'friction_note': 'May lack performance accountability'},
        'The Challenger': {'bonus': -8, 'synergy_note': 'Brings needed balance to intense debate', 'friction_note': 'Confrontational culture is deeply uncomfortable'},
    },
    'the_explorer': {
        'The Innovator': {'bonus': 8, 'synergy_note': 'Curiosity and creativity feed each other', 'friction_note': 'Both may lack follow-through'},
        'The Optimizer': {'bonus': -4, 'synergy_note': 'Brings fresh perspective to optimized systems', 'friction_note': 'Routine and process feel constraining'},
        'The Collaborator': {'bonus': 4, 'synergy_note': 'Adaptability makes them great team members', 'friction_note': 'May wander from team priorities'},
        'The Driver': {'bonus': 2, 'synergy_note': 'Resilience serves high-pressure goals', 'friction_note': 'May resist rigid goal structures'},
        'The Stabilizer': {'bonus': -6, 'synergy_note': 'Brings needed change perspective', 'friction_note': 'Predictable environment feels stagnant'},
        'The Visionary': {'bonus': 7, 'synergy_note': 'Shared enthusiasm for new frontiers', 'friction_note': 'May lack grounding together'},
        'The Nurturer': {'bonus': 3, 'synergy_note': 'Supportive base for exploration', 'friction_note': 'May outgrow nurturing environment quickly'},
        'The Challenger': {'bonus': 5, 'synergy_note': 'Embraces intellectual challenge as growth', 'friction_note': 'May prefer exploring to debating'},
    },
    'the_strategist': {
        'The Innovator': {'bonus': 4, 'synergy_note': 'Strategic thinking guides innovation', 'friction_note': 'May over-analyze before acting'},
        'The Optimizer': {'bonus': 7, 'synergy_note': 'Analytical depth enhances optimization', 'friction_note': 'May focus too much on planning vs doing'},
        'The Collaborator': {'bonus': 2, 'synergy_note': 'Strategic perspective elevates teamwork', 'friction_note': 'May prefer analysis over collaboration'},
        'The Driver': {'bonus': 8, 'synergy_note': 'Strategy meets execution powerfully', 'friction_note': 'Strategic patience vs drive for speed'},
        'The Stabilizer': {'bonus': 5, 'synergy_note': 'Long-term planning in stable environment', 'friction_note': 'Risk-averse culture may limit strategic ambition'},
        'The Visionary': {'bonus': 6, 'synergy_note': 'Turns vision into actionable strategy', 'friction_note': 'May be too cautious for bold visions'},
        'The Nurturer': {'bonus': 1, 'synergy_note': 'Strategic growth planning for people', 'friction_note': 'Analysis-heavy style in people-first culture'},
        'The Challenger': {'bonus': 7, 'synergy_note': 'Well-reasoned arguments thrive in debate culture', 'friction_note': 'May feel pressure to always justify decisions'},
    },
}


def get_archetype_modifier(candidate_key: str, employer_name: str) -> dict:
    """
    Look up the compatibility modifier for a candidate archetype + employer archetype pair.

    Args:
        candidate_key: e.g. 'the_innovator'
        employer_name: e.g. 'The Optimizer'

    Returns:
        dict with 'bonus' (-10 to +10), 'synergy_note', 'friction_note'
        Falls back to neutral if pair not found.
    """
    candidate_entry = ARCHETYPE_MATRIX.get(candidate_key, {})
    return candidate_entry.get(employer_name, {
        'bonus': 0,
        'synergy_note': 'Neutral compatibility',
        'friction_note': 'No specific friction identified',
    })
