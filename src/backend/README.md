# Amber Backend

FastAPI server for the Amber platform. Handles authentication, personality assessments, candidate and employer management, compatibility scoring, coffee chats, and the Ember personality matching agent.

## Getting Started

### Prerequisites

- Python 3.11 or higher
- A Supabase project with the schema applied (see [supabase/README.md](../../supabase/README.md))

### Installation

```bash
cd src/backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

- **API**: http://127.0.0.1:8000
- **Interactive Docs (Swagger)**: http://127.0.0.1:8000/docs
- **Alternative Docs (ReDoc)**: http://127.0.0.1:8000/redoc

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key for client-side operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key for server-side data access (bypasses RLS) |
| `SUPABASE_JWT_SECRET` | No* | JWT secret for verifying Supabase auth tokens on protected routes |
| `OPENAI_API_KEY` | No | OpenAI API key (reserved for future AI features) |

*Without `SUPABASE_JWT_SECRET`, the API runs in **development mode** and skips authentication on protected routes. This is useful for local development and testing without needing to configure OAuth.

## Project Structure

```
backend/
├── main.py                    # FastAPI app entry point, CORS config, all API routes
├── agent/                     # Ember personality matching agent
│   └── ember_agent.py         # Archetype classification, bidirectional scoring, insight generation
├── auth/                      # Authentication layer
│   ├── supabase_auth.py       # JWT token verification using Supabase secrets
│   └── middleware.py          # FastAPI middleware for request-level auth and role enforcement
├── db/                        # Database layer
│   ├── database.py            # Local SQLite database for assessment flow in development
│   └── supabase_client.py     # Supabase API client for candidates, employers, roles, applications
├── engine/                    # Scoring and compatibility algorithms
│   ├── compatibility.py       # OCEAN-based matching with culture-to-trait mapping
│   ├── scoring.py             # Converts assessment responses into personality dimension scores
│   └── questions.py           # Assessment question definitions and helper functions
└── scripts/                   # One-time seed and utility scripts
    ├── seed_ember_data.py     # Populates test candidates with diverse OCEAN personality profiles
    └── seed_arsh_nakul.py     # Seeds specific test profiles for Arsh and Nakul
```

## Module Details

### `agent/` — Ember Agent

The Ember agent is the core personality matching engine. It analyzes candidate-employer compatibility bidirectionally:

- **For candidates**: Scores how compatible they are with each employer and role, providing ranked matches with detailed insights.
- **For employers**: Ranks all candidates by culture and personality fit, optionally filtered by a specific role.

Key capabilities:
- **Archetype Classification** — Classifies users into one of 8 personality archetypes (Innovator, Architect, Connector, Catalyst, Craftsperson, Harmonizer, Explorer, Strategist) based on their dominant OCEAN traits.
- **Per-Dimension Analysis** — Compares candidate OCEAN scores against employer preferences with fit scores, gap measurements, and direction indicators for each trait.
- **Insight Generation** — Produces up to 8 actionable insights categorized as strengths, cautions, highlights, and tips.
- **Natural Language Summary** — Generates a human-readable assessment of compatibility quality with a hiring recommendation.

### `auth/` — Authentication

JWT verification using Supabase Auth. The middleware intercepts requests and sets `request.state.user` with the authenticated user's ID, email, and role.

- **`AuthUser` model** — Contains `id`, `email`, `role`, `is_candidate`, and `is_employer` flags.
- **`get_current_user_dependency()`** — Optional auth dependency; returns `None` if auth is not configured.
- **`require_auth()`** — Mandatory auth dependency; raises 401 if no valid token is present.
- **`require_role(roles)`** — Role-based access control; raises 403 if the user does not have the required role.

### `db/` — Database Layer

Two database backends are available:

- **`database.py`** — Local SQLite database used during development for the assessment flow. Stores assessment sessions, question responses, and computed scores locally.
- **`supabase_client.py`** — Supabase API client for production data access. Handles CRUD operations for candidates, employers, roles, and applications using the service role key to bypass RLS when needed.

### `engine/` — Scoring Engine

The scoring engine converts raw assessment responses into personality scores and computes compatibility:

- **`compatibility.py`** — Implements the OCEAN-based compatibility algorithm. Maps culture values (innovation, collaboration, empathy, etc.) to weighted OCEAN trait vectors. Calculates trait match scores using weighted distance, culture alignment scores, and role-specific fit based on personality requirement ranges. The final overall score is a weighted combination of trait match (50%) and culture match (50%).
- **`scoring.py`** — Processes assessment answers by aggregating trait points from selected options, then normalizes scores to a 0-100 scale for each OCEAN dimension. Also computes derived scores for culture fit, work style, communication, and values.
- **`questions.py`** — Contains the assessment question bank with category groupings, trait mappings, and scoring weights per option.

## API Routes

### Health and Status

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | Health check with service status |
| `GET` | `/health` | No | Detailed health status with latency probes |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/check-email` | No | Check if an email address is already registered |
| `GET` | `/api/me` | Yes | Get the current authenticated user's profile |

### Assessment

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/assessment/start` | No | Start a new assessment or resume an existing one |
| `POST` | `/api/assessment/answer` | No | Submit an answer to a specific assessment question |
| `GET` | `/api/assessment/results/{candidate_id}` | No | Get computed assessment results and personality scores |
| `GET` | `/api/assessment/question/{question_id}` | No | Get a specific question by ID |
| `GET` | `/api/assessment/questions` | No | List all available assessment questions |

### Candidate Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/candidates` | Yes* | List all candidates with personality scores (employer only) |
| `GET` | `/api/candidates/{candidate_id}` | Yes* | Get a specific candidate's full profile and scores |

### Matching and Compatibility

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/matching/calculate` | No | Calculate the match score between a specific candidate and role |
| `GET` | `/api/matching/candidates/{role_id}` | No | Get all candidates ranked by fit for a specific role |
| `GET` | `/api/matching/roles/{candidate_id}` | No | Get all roles ranked by fit for a specific candidate |
| `POST` | `/api/matching/batch-calculate/{role_id}` | No | Batch-calculate scores for all candidates against a role |
| `GET` | `/api/matching/employer-candidates` | No | Get all candidates ranked by overall culture fit for an employer |

### Ember Agent

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ember/candidate-matches/{candidate_id}` | No | Ember analysis of role matches for a candidate (includes archetype and insights) |
| `GET` | `/api/ember/employer-matches/{employer_id}` | No | Ember ranking of candidates for an employer (optional `role_id` query param) |
| `GET` | `/api/ember/analysis` | No | Detailed pair analysis between a candidate, employer, and role |

### Coffee Chats

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/coffee-chats` | No | Create a new coffee chat request |
| `GET` | `/api/coffee-chats/candidate/{candidate_id}` | No | Get all coffee chats for a candidate |
| `GET` | `/api/coffee-chats/employer/{employer_id}` | No | Get all coffee chats for an employer |
| `PATCH` | `/api/coffee-chats/{chat_id}/status` | No | Update a coffee chat's status (accept, decline, complete, cancel) |
| `PATCH` | `/api/coffee-chats/{chat_id}/schedule` | No | Schedule a coffee chat with date, time, and meeting link |
| `PATCH` | `/api/coffee-chats/{chat_id}/feedback` | No | Submit post-chat feedback and rating |

### Feedback

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/feedback` | No | Submit user feedback (bug report, feature request, or general) |
| `GET` | `/api/feedback` | No | Retrieve all submitted feedback (admin use) |

### Payments (Stripe)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/stripe/create-checkout-session` | No | Create a Stripe checkout session for subscription purchase |
| `POST` | `/api/stripe/create-portal-session` | No | Create a Stripe customer portal session for subscription management |

*Protected endpoints require `SUPABASE_JWT_SECRET` to be configured.

## Notes

- The assessment flow uses a local SQLite database in development. For production, this can be switched to Supabase by updating the database layer.
- The Ember agent is designed with a client-side fallback — the frontend can run matching locally using Supabase data if the backend is unavailable.
- Seed scripts in `scripts/` are one-time utilities for populating test data. They require the `SUPABASE_SERVICE_ROLE_KEY` to be set.
- CORS is configured to allow requests from `http://localhost:5173` (the default Vite dev server) and can be updated in `main.py` for production domains.
