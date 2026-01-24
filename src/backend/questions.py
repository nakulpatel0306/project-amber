"""
Luna CultureSync - Assessment Questions
"""

ASSESSMENT_QUESTIONS = [
    {
        "id": 1,
        "question": "How do you prefer to receive feedback?",
        "type": "multiple_choice",
        "category": "work_style",
        "options": [
            "Direct and immediate",
            "Scheduled 1-on-1s",
            "Written summaries",
            "Casual conversations"
        ]
    },
    {
        "id": 2,
        "question": "When starting a new project, do you prefer:",
        "type": "multiple_choice",
        "category": "work_style",
        "options": [
            "Detailed planning first",
            "Jump in and iterate",
            "Research similar approaches",
            "Discuss with team first"
        ]
    },
    {
        "id": 3,
        "question": "Your ideal work environment is:",
        "type": "multiple_choice",
        "category": "work_style",
        "options": [
            "Structured with clear processes",
            "Flexible and autonomous",
            "Collaborative and social",
            "Quiet and focused"
        ]
    },
    {
        "id": 4,
        "question": "How do you handle ambiguity in your work?",
        "type": "multiple_choice",
        "category": "work_style",
        "options": [
            "Thrive in it - I like figuring things out",
            "Need some guidance but can adapt",
            "Prefer clear direction",
            "Seek structure immediately"
        ]
    },
    {
        "id": 5,
        "question": "Describe your communication style:",
        "type": "multiple_choice",
        "category": "communication",
        "options": [
            "Direct and concise",
            "Detailed and thorough",
            "Casual and conversational",
            "Formal and structured"
        ]
    },
    {
        "id": 6,
        "question": "When you disagree with a decision, you:",
        "type": "multiple_choice",
        "category": "communication",
        "options": [
            "Voice concerns immediately",
            "Think it through then discuss",
            "Support the team decision",
            "Propose alternative approach"
        ]
    },
    {
        "id": 7,
        "question": "Your approach to deadlines:",
        "type": "multiple_choice",
        "category": "communication",
        "options": [
            "Work best under pressure",
            "Steady pace throughout",
            "Early completion",
            "Flexible - depends on priority"
        ]
    },
    {
        "id": 8,
        "question": "What motivates you most at work?",
        "type": "multiple_choice",
        "category": "values",
        "options": [
            "Learning new skills",
            "Impact on users/customers",
            "Team collaboration",
            "Autonomy and ownership"
        ]
    },
    {
        "id": 9,
        "question": "How do you prefer to learn new things?",
        "type": "multiple_choice",
        "category": "values",
        "options": [
            "Hands-on experimentation",
            "Reading documentation",
            "Watching tutorials",
            "Asking colleagues"
        ]
    },
    {
        "id": 10,
        "question": "In a startup environment, what matters most to you?",
        "type": "multiple_choice",
        "category": "values",
        "options": [
            "Fast growth potential",
            "Mission alignment",
            "Work-life balance",
            "Equity opportunity"
        ]
    }
]


def get_question(question_id: int):
    """Get a specific question by ID."""
    for q in ASSESSMENT_QUESTIONS:
        if q["id"] == question_id:
            return q
    return None


def get_all_questions():
    """Get all assessment questions."""
    return ASSESSMENT_QUESTIONS


def get_total_questions():
    """Get the total number of questions."""
    return len(ASSESSMENT_QUESTIONS)
