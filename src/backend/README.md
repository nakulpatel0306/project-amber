# Amber Backend

FastAPI server for the Amber platform. Handles auth, assessments, candidates, compatibility scoring, and the Ember personality matching agent.

## How to Run

```bash
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

API: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side data access) |
| `SUPABASE_JWT_SECRET` | Validate Supabase JWT; required for protected routes |
| `OPENAI_API_KEY` | Optional; for future AI features |

Without `SUPABASE_JWT_SECRET`, the API runs in dev mode and skips auth on protected routes.

## Project Structure

```
backend/
├── main.py                  # FastAPI app, CORS, middleware, all routes
├── agent/                   # Ember personality matching agent
│   └── ember_agent.py       # Archetype classification, bidirectional scoring, insights
├── auth/                    # Authentication
│   ├── supabase_auth.py     # JWT token verification
│   └── middleware.py        # FastAPI middleware (sets user on request)
├── db/                      # Database layer
│   ├── database.py          # Local SQLite (candidates, sessions, scores, feedback)
│   └── supabase_client.py   # Supabase API client (candidates, employers, roles)
├── engine/                  # Scoring & compatibility
│   ├── compatibility.py     # OCEAN-based compatibility scoring, culture mapping
│   ├── scoring.py           # Assessment answer → personality scores
│   └── questions.py         # Assessment question set and helpers
└── scripts/                 # Seed & utility scripts
    ├── seed_ember_data.py   # Populate test candidates with unique personalities
    └── seed_arsh_nakul.py   # Populate Arsh & Nakul profiles
```

## Modules

### `agent/` — Ember Agent

The Ember agent is the personality matching engine. It works bidirectionally:

- **For candidates**: Scores how compatible they are with each employer/role
- **For employers**: Ranks candidates by culture and personality fit

Key features:
- 8 personality archetypes (Innovator, Architect, Connector, Catalyst, etc.)
- Per-dimension analysis comparing candidate OCEAN scores vs employer preferences
- Insight generation (strengths, cautions, tips)
- Summary text with Ember's recommendation

### `auth/` — Authentication

JWT verification using Supabase Auth. Middleware sets `request.state.user` on protected routes.

### `db/` — Database Layer

- `database.py` — Local SQLite for assessment flow in development
- `supabase_client.py` — Supabase API client for candidates, employers, roles, applications

### `engine/` — Scoring Engine

- `compatibility.py` — OCEAN-based compatibility scoring with culture-to-OCEAN mapping
- `scoring.py` — Converts assessment answers into personality dimension scores
- `questions.py` — Assessment question definitions

## Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/`, `/health` | no | Health check |
| GET | `/api/me` | yes | Current user from JWT |
| POST | `/api/auth/check-email` | no | Check if email exists |
| POST | `/api/assessment/start` | no | Start new assessment |
| POST | `/api/assessment/answer` | no | Submit question answer |
| GET | `/api/assessment/results/{id}` | no | Get assessment results |
| GET | `/api/assessment/questions` | no | List all questions |
| GET | `/api/candidates` | yes* | List candidates (employer only) |
| GET | `/api/candidates/{id}` | yes* | Get candidate details |
| GET | `/api/ember/candidate-matches/{id}` | no | Ember: ranked role matches for candidate |
| GET | `/api/ember/employer-matches/{id}` | no | Ember: ranked candidate matches for employer |
| GET | `/api/ember/analysis` | no | Ember: detailed pair analysis |
| POST | `/api/feedback` | no | Submit feedback |

*requires `SUPABASE_JWT_SECRET` to be configured

## Notes

- Assessment flow uses local SQLite; production can switch to Supabase
- Ember agent works with client-side fallback — the frontend can run matching locally if the backend is unavailable
- Seed scripts in `scripts/` are one-time utilities for populating test data
