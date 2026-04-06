# Amber Backend

FastAPI server for the Amber platform. Handles authentication, personality assessments, candidate and employer management, compatibility scoring, connections, coffee chats, payments, and the Ember personality matching agent.

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
| `OPENAI_API_KEY` | No | OpenAI API key (reserved for future conversational AI features) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payment processing |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret for event verification |

\*Without `SUPABASE_JWT_SECRET`, the API runs in **development mode** and skips authentication on protected routes. This is useful for local development and testing without needing to configure OAuth.

## Project Structure

```
backend/
├── main.py                           # FastAPI app, CORS config, all 38 API routes, request/response models
├── agent/                            # Ember personality matching agent
│   ├── ember_agent.py                # 8 archetypes, classification, bidirectional scoring, insight generation, prep briefs
│   └── archetype_compatibility.py    # 8x8 archetype bonus matrix with synergy/friction notes
├── auth/                             # Authentication layer
│   ├── supabase_auth.py              # JWT token verification using Supabase JWKS
│   └── middleware.py                 # FastAPI middleware for request-level auth and role enforcement
├── db/                               # Database layer
│   ├── database.py                   # Local SQLite database for assessment flow in development
│   └── supabase_client.py            # Supabase API client for all production tables
├── engine/                           # Scoring and compatibility algorithms
│   ├── compatibility.py              # OCEAN-based matching: trait, culture, work style, communication, overall
│   ├── scoring.py                    # Assessment response → personality dimension → OCEAN score computation
│   └── questions.py                  # 10 assessment questions with category groupings and trait mappings
└── scripts/                          # One-time seed and utility scripts
    ├── seed_ember_data.py            # Populates test candidates with diverse OCEAN profiles
    └── seed_arsh_nakul.py            # Seeds specific test profiles
```

## Module Details

### `agent/` — Ember Agent

The Ember agent is the core personality matching engine. It analyzes candidate-employer compatibility bidirectionally:

- **For candidates**: Scores how compatible they are with each employer and role, providing ranked matches with detailed insights.
- **For employers**: Ranks all candidates by culture and personality fit, optionally filtered by a specific role.

Key capabilities:
- **Archetype Classification** — Classifies users into one of 8 personality archetypes (Innovator, Architect, Connector, Catalyst, Craftsperson, Harmonizer, Explorer, Strategist) based on OCEAN score levels (low/low-mid/mid/mid-high/high). Awards 10 points for exact level matches against each archetype's signature, partial credit based on distance.
- **Archetype Compatibility Matrix** (`archetype_compatibility.py`) — An 8x8 matrix mapping all 64 candidate-archetype-to-employer-archetype pairings. Each pairing has a bonus modifier (-10 to +10), synergy note, and friction note. Applied additively to overall compatibility scores.
- **Per-Dimension Analysis** — Compares candidate OCEAN scores against employer preferences with fit scores, gap measurements, and direction indicators for each trait.
- **Insight Generation** — Produces up to 8 actionable insights categorized as strengths (trait-culture alignments), cautions (gaps >25 points), highlights (archetype-culture overlaps or 85+ scores), and tips (archetype-specific adaptation advice).
- **Natural Language Summary** — Score-tier-based assessment (85+: strong, 70+: good, 55+: moderate, <55: mismatch) with hiring recommendation.
- **Coffee Chat Prep Briefs** — Personality-based preparation for upcoming chats: key traits, conversation topics, friction points, and tips.

### `auth/` — Authentication

JWT verification using Supabase Auth. The middleware intercepts requests and sets `request.state.user` with the authenticated user's ID, email, and role.

- **`AuthUser` model** — Contains `id`, `email`, `role`, `is_candidate`, and `is_employer` flags.
- **`get_current_user_dependency()`** — Optional auth dependency; returns `None` if auth is not configured.
- **`require_auth()`** — Mandatory auth dependency; raises 401 if no valid token is present.
- **`require_role(roles)`** — Role-based access control; raises 403 if the user does not have the required role.

### `db/` — Database Layer

Two database backends are available:

- **`database.py`** — Local SQLite database used during development for the assessment flow. Stores assessment sessions, question responses, and computed scores locally. Tables: `candidates`, `assessment_responses`, `scores`, `assessment_sessions`, `feedback`.
- **`supabase_client.py`** — Supabase API client for production data access. Handles CRUD operations for candidates, employers, roles, applications, coffee chats, connections, and more. Uses the service role key to bypass RLS when needed for cross-role data access.

### `engine/` — Scoring Engine

The scoring engine converts raw assessment responses into personality scores and computes compatibility:

- **`compatibility.py`** — The full OCEAN-based compatibility algorithm:
  - **Trait Match** (40% of overall): Weighted Euclidean distance across 5 OCEAN dimensions, normalized to 0–100
  - **Culture Match** (30% of overall): Composite of work style compatibility (30%), culture values alignment via 17-value OCEAN correlation map (50%), and role-specific fit (20%)
  - **Work Style** (20% of overall): Direct comparison of candidate/role work style preferences
  - **Communication Fit** (10% of overall): Extraversion (55%) + agreeableness (45%) alignment
  - **Bidirectional Matching**: Forward score (candidate→employer, 70% weight) + reverse score (employer→candidate, 30% weight)
  - **Confidence Scoring**: Data completeness indicator (+40 OCEAN scores, +30 profile, +7 per supplementary assessment)
- **`scoring.py`** — Processes assessment answers by aggregating trait points across 14 personality dimensions, grouping into 3 categories (work style, communication, values), and normalizing to 0–100 OCEAN scores.
- **`questions.py`** — 10 assessment questions across 3 categories (work style, communication, values) with 4 options each. Includes helper functions for question retrieval.

## API Routes

### Health and Status

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | Health check with service status |
| `GET` | `/health` | No | Detailed health status with latency probes for database, Supabase, auth, and matching engine |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/check-email` | No | Check if an email address is already registered |
| `DELETE` | `/api/auth/delete-account` | Yes | Full account deletion with cascade (profile, candidate/employer, applications, coffee chats, connections, feedback, settings) |
| `GET` | `/api/me` | Yes | Get the current authenticated user's profile |

### Assessment

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/assessment/start` | No | Start a new assessment or resume an existing one |
| `POST` | `/api/assessment/answer` | No | Submit an answer; triggers scoring on final question |
| `GET` | `/api/assessment/results/{candidate_id}` | No | Get computed OCEAN scores, top traits, culture fit |
| `GET` | `/api/assessment/question/{question_id}` | No | Get a specific question by ID |
| `GET` | `/api/assessment/questions` | No | List all 10 assessment questions |

### Candidate Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/candidates` | Yes* | List all candidates with personality scores (employer access) |
| `GET` | `/api/candidates/{candidate_id}` | Yes* | Get a specific candidate's full profile and scores |

### Matching and Compatibility

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/matching/calculate` | No | Calculate match score for a specific candidate-role pair |
| `GET` | `/api/matching/candidates/{role_id}` | No | Rank all candidates by fit for a specific role |
| `GET` | `/api/matching/roles/{candidate_id}` | No | Rank all roles by fit for a specific candidate |
| `POST` | `/api/matching/batch-calculate/{role_id}` | No | Batch-calculate scores for all candidates against a role |
| `GET` | `/api/matching/employer-candidates` | No | Rank all candidates by overall culture fit for an employer |

### Ember Agent

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ember/candidate-matches/{candidate_id}` | No | Personality-ranked role matches with archetypes and insights |
| `GET` | `/api/ember/employer-matches/{employer_id}` | No | Personality-ranked candidate matches (optional `role_id` query param) |
| `GET` | `/api/ember/analysis` | No | Detailed pair analysis between a candidate, employer, and optional role |

### Coffee Chats

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/coffee-chats` | No | Create a new coffee chat request |
| `GET` | `/api/coffee-chats/candidate/{candidate_id}` | No | Get all coffee chats for a candidate |
| `GET` | `/api/coffee-chats/employer/{employer_id}` | No | Get all coffee chats for an employer |
| `PATCH` | `/api/coffee-chats/{chat_id}/status` | No | Update status (accept, decline, complete, cancel) |
| `PATCH` | `/api/coffee-chats/{chat_id}/schedule` | No | Schedule with date, time, and meeting link |
| `PATCH` | `/api/coffee-chats/{chat_id}/feedback` | No | Submit post-chat feedback and rating |
| `POST` | `/api/coffee-chats/{chat_id}/prep` | No | Generate personality-based preparation brief |

### Connections

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/connections` | No | Create connection request with optional message and meet invite |
| `PATCH` | `/api/connections/{connection_id}/accept` | No | Accept connection; auto-creates coffee chat if meet invite exists |
| `PATCH` | `/api/connections/{connection_id}/reject` | No | Reject connection request |
| `GET` | `/api/connections/me` | No | Get all connections for the current user, grouped by status |

### Feedback

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/feedback` | No | Submit user feedback (bug report, feature request, or general) |
| `GET` | `/api/feedback` | No | Retrieve all submitted feedback (admin use) |

### Payments (Stripe)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/stripe/create-checkout-session` | No | Create a Stripe checkout session (handles new subscriptions and upgrades) |
| `POST` | `/api/stripe/create-portal-session` | No | Create a Stripe customer portal session for subscription management |
| `POST` | `/api/stripe/webhook` | No | Handle Stripe webhook events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted` |
| `GET` | `/api/stripe/subscription` | No | Get current subscription status and plan details |

### Utilities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/logo` | No | Company logo proxy with disk caching and rate limiting (fetches from logo.dev) |

\*Protected endpoints require `SUPABASE_JWT_SECRET` to be configured.

## CORS Configuration

CORS is configured to allow requests from:
- `tauri://localhost` — Tauri desktop app
- `http://localhost:1420` — Tauri dev server
- `http://localhost:5173` — Vite dev server (default)
- `http://localhost:3000` — Alternative dev server

Update the `origins` list in `main.py` for production domains.

## Notes

- The assessment flow uses a local SQLite database in development. For production, this can be switched to Supabase by updating the database layer.
- The Ember agent is designed with a client-side fallback — the frontend can run matching locally using Supabase data if the backend is unavailable.
- Seed scripts in `scripts/` are one-time utilities for populating test data. They require the `SUPABASE_SERVICE_ROLE_KEY` to be set.
- OpenAI (1.54.0), LangChain (0.3.0), and Ollama (0.4.3) are installed as dependencies but not yet integrated into the Ember agent. They are reserved for Phase 1 of the product roadmap (Conversational Ember AI). See [BLUEPRINT.md](../../BLUEPRINT.md) for details.
- Stripe returns demo subscription data when `STRIPE_SECRET_KEY` is not configured, allowing local development without a Stripe account.
