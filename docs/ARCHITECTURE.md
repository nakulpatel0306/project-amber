# architecture

luna culturesync is a desktop application with a tauri/react frontend and a python backend. the two communicate over http.

## system overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        tauri desktop app                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    react frontend                         │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐   │  │
│  │  │  welcome    │───▶│   api.ts    │───▶│  dashboard   │   │  │
│  │  │  assessment │    │   client    │    │   results    │   │  │
│  │  └─────────────┘    └─────────────┘    └──────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ http (localhost:8000)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       python backend                            │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐    │
│  │   fastapi   │───▶│  questions  │───▶│    scoring       │    │
│  │   routes    │    │   module    │    │   algorithm      │    │
│  └─────────────┘    └─────────────┘    └──────────────────┘    │
│                              │                    │             │
│                              ▼                    ▼             │
│                     ┌─────────────────────────────────────┐    │
│                     │         sqlite database             │    │
│                     │  candidates | responses | scores    │    │
│                     └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## components

### frontend (src/frontend/)

**technology:** tauri 2.0, react 18, typescript, tailwind css

**key files:**

| file | purpose |
|------|---------|
| `src/components/ChatInterface.tsx` | main layout with navigation |
| `src/components/WelcomeScreen.tsx` | landing page with cta buttons |
| `src/components/AssessmentFlow.tsx` | 10-question assessment flow |
| `src/components/CandidateDashboard.tsx` | candidate list with filtering |
| `src/components/FeedbackWidget.tsx` | floating feedback button |
| `src/utils/api.ts` | http client for backend communication |
| `src/contexts/ThemeContext.tsx` | theme management |

**data flow:**

1. user clicks "take the assessment" on welcome screen
2. enters name and email, `startAssessment()` creates candidate record
3. answers 10 questions, each calls `submitAnswer()` to save response
4. after question 10, frontend calculates scores via `calculateScores()`
5. results displayed with culture fit score and top traits
6. dashboard fetches all candidates via `getCandidates()`

### backend (src/backend/)

**technology:** python 3.11+, fastapi, sqlite

**key files:**

| file | purpose |
|------|---------|
| `main.py` | fastapi app and api routes |
| `database.py` | sqlite operations and crud functions |
| `questions.py` | assessment question definitions |
| `scoring.py` | culture fit scoring algorithm |

**database schema:**

```sql
-- candidates table
candidates (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  assessment_status TEXT DEFAULT 'in_progress',
  culture_fit_score REAL,
  top_traits TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- assessment responses
assessment_responses (
  id INTEGER PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id),
  question_id INTEGER NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- scores breakdown
scores (
  id INTEGER PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id),
  culture_fit_score REAL,
  work_style_score REAL,
  communication_score REAL,
  values_score REAL,
  top_traits TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- user feedback
feedback (
  id INTEGER PRIMARY KEY,
  message TEXT NOT NULL,
  user_type TEXT,
  page TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### assessment flow

```
┌────────────────────────────────────────────────────────────┐
│                    assessment flow                          │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ welcome  │───▶│ question │───▶│ question │───▶ ...      │
│  │  form    │    │    1     │    │    2     │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │                                  │                  │
│       │                                  ▼                  │
│       │              ┌──────────────────────┐              │
│       │              │   halfway pause      │              │
│       │              │   (question 5)       │              │
│       │              └──────────────────────┘              │
│       │                         │                          │
│       │                         ▼                          │
│       │              ┌──────────────────────┐              │
│       │              │  questions 6-10      │              │
│       │              └──────────────────────┘              │
│       │                         │                          │
│       ▼                         ▼                          │
│  ┌──────────────────────────────────────────┐              │
│  │              results screen              │              │
│  │  - culture fit score (0-100)            │              │
│  │  - dimension breakdown                   │              │
│  │  - top 3 traits                         │              │
│  └──────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────┘
```

### scoring algorithm

the scoring algorithm evaluates three dimensions:

**1. work style (33%)**
- questions about structure vs flexibility
- solo work vs collaboration preferences
- planning vs spontaneity

**2. communication (33%)**
- feedback preferences
- meeting style
- conflict resolution

**3. values (33%)**
- what matters in a workplace
- work-life balance views
- growth priorities

**score calculation:**

```python
# each answer has a profile with dimension scores
answer_profiles = {
    "q1_a": {"work_style": 0.8, "communication": 0.6, "values": 0.5},
    "q1_b": {"work_style": 0.5, "communication": 0.8, "values": 0.7},
    # ...
}

# aggregate across all answers
work_style_score = average(answer.work_style for answer in responses)
communication_score = average(answer.communication for answer in responses)
values_score = average(answer.values for answer in responses)

# final score is weighted average
culture_fit_score = (work_style * 33 + communication * 33 + values * 33)
```

**trait identification:**

top 3 traits are identified from the strongest response patterns:
- "collaborative" - prefers team environments
- "structured" - likes clear processes
- "growth-oriented" - prioritizes learning
- "autonomous" - prefers independence
- "direct communicator" - values clarity
- "adaptable" - comfortable with change

## data models

### StartAssessmentResponse

```json
{
  "candidate_id": 1,
  "total_questions": 10,
  "questions": [
    {
      "id": 1,
      "question": "How do you prefer to receive feedback?",
      "type": "multiple_choice",
      "category": "communication",
      "options": ["a", "b", "c", "d"]
    }
  ]
}
```

### AssessmentResults

```json
{
  "candidate_id": 1,
  "culture_fit_score": 78,
  "work_style_score": 82,
  "communication_score": 75,
  "values_score": 77,
  "top_traits": ["collaborative", "growth-oriented", "adaptable"]
}
```

### Candidate

```json
{
  "id": 1,
  "name": "john doe",
  "email": "john@example.com",
  "assessment_status": "completed",
  "culture_fit_score": 78,
  "top_traits": ["collaborative", "growth-oriented", "adaptable"],
  "created_at": "2024-01-15T10:30:00Z"
}
```

## theming system

culturesync includes a comprehensive theming system:

**available themes:**
- minimal-light / minimal-dark
- lavender / rose / mint
- mocha / ocean / sunset

**implementation:**
- themes defined in `ThemeContext.tsx`
- css custom properties for colors
- persisted to localStorage
- real-time switching without reload

**theme structure:**

```typescript
interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    border: string;
    // ...
  };
}
```

## future considerations

areas for potential expansion:

- company profiles (matching candidates to specific companies)
- more sophisticated matching algorithms
- assessment analytics and insights
- interview scheduling integration
- candidate comparison tools
- batch assessment invitations
