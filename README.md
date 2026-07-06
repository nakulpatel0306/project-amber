# Amber

A culture-first job matching platform that connects candidates with companies based on personality fit and shared values. Amber uses the Big Five (OCEAN) personality model to power its matching engine, helping both job seekers and employers find the right culture fit before the first interview.

> For the full product vision, growth roadmap, and styling direction, see [BLUEPRINT.md](./BLUEPRINT.md). For a technical overview of how the codebase fits together, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## What It Does

Amber reimagines the job search by putting personality and culture at the center of the hiring process. Instead of keyword-matching resumes, Amber measures who you are and how you work, then matches you with companies where you will actually thrive.

1. **Personality Assessment** — Candidates complete a research-backed Big Five personality assessment covering Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (OCEAN).
2. **Culture Definition** — Employers take a culture quiz to define their company values and ideal candidate personality profiles.
3. **AI-Powered Matching** — The Ember agent analyzes personality dimensions bidirectionally, scoring how well candidates align with each employer's culture and role requirements.
4. **Connections** — Candidates and employers send connection requests with optional meeting invites. Accepted connections unlock coffee chats.
5. **Coffee Chats** — Once connected, candidates and employers meet through informal coffee chats before any formal application process.

## Features

### For Job Seekers

- 10-question personality assessment based on the Big Five model
- Personality insights with archetype classification (8 archetypes: Innovator, Architect, Connector, Catalyst, Craftsperson, Harmonizer, Explorer, Strategist)
- **Ember Agent** — AI-powered analysis showing compatibility scores with each employer and role
- Top matches dashboard ranked by culture fit percentage
- Per-dimension breakdown comparing your OCEAN scores against employer preferences
- Network hub for discovering roles, people, and companies
- Connection requests with optional meeting invites
- Coffee chat scheduling with matched employers
- Real-time messaging with connected employers
- Profile management with work style preferences, salary expectations, and social links
- Supplementary assessments: Visual Perception, Work Values, Situational Judgment, Cognitive Patterns
- Practice coffee chat preparation

### For Employers

- Culture quiz to define company values and ideal personality preferences
- Culture insights dashboard with archetype-style company personality profiles
- **Ember Agent** — AI-ranked candidate list sorted by culture and personality fit
- Role management with personality requirement ranges per OCEAN trait
- Browse and filter candidates by match score via network hub
- Top candidates dashboard for each role
- Connection inbox for managing incoming and outgoing requests
- Coffee chat management with scheduling, feedback, and ratings
- Supplementary culture assessments: Team Dynamics, Leadership Style, Growth Philosophy, Work Environment

> For a detailed breakdown of all features and the product roadmap, see [FEATURES.md](./FEATURES.md).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS 3, Framer Motion 12 |
| Icons | Lucide React |
| State Management | React Context (Auth, Theme, Toast, Messaging, Connections) |
| Backend | Python 3.11+, FastAPI |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Realtime | Supabase Realtime (postgres_changes for messages, connections, coffee chats) |
| Authentication | Supabase Auth (Email, Google OAuth, GitHub OAuth) |
| Payments | Stripe (checkout, customer portal, webhook handling) |
| AI/Matching | Custom OCEAN-based compatibility engine + Ember agent |
| AI/ML (reserved) | OpenAI, LangChain, Ollama (installed, not yet integrated) |

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Python 3.11+
- A Supabase project ([supabase.com](https://supabase.com))

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Run the schema from `supabase/schema.sql` in the SQL Editor.
3. Run the RLS policies from `supabase/rls-policies.sql`.
4. Run migration files in `supabase/migrations/` for connections, activity posts, and coffee chat columns.
5. Run additional migrations: `migrate-messages.sql`, `migrate-stripe-subscriptions.sql`, `migrate-saved-matches.sql`, `migrate-activity-posts.sql`.
6. Enable authentication providers (Email, Google, GitHub) in Authentication > Providers.
7. Copy your project URL and anon key from Settings > API.

> See [supabase/README.md](./supabase/README.md) for detailed database setup instructions.

### 2. Environment Setup

```bash
# Frontend environment variables
cd src/frontend
cp .env.example .env
# Set the following in .env:
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend environment variables
cd ../backend
cp .env.example .env
# Set the following in .env:
# SUPABASE_URL=your-project-url
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# SUPABASE_JWT_SECRET=your-jwt-secret
# OPENAI_API_KEY=your-api-key (optional)
# STRIPE_SECRET_KEY=your-stripe-key (optional)
# STRIPE_WEBHOOK_SECRET=your-webhook-secret (optional)
```

### 3. Backend Setup

```bash
cd src/backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

The API runs at http://127.0.0.1:8000. Interactive docs are available at http://127.0.0.1:8000/docs.

### 4. Frontend Setup

```bash
cd src/frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The app runs at http://localhost:5173.

### 5. Running Both Together

From the project root, you can start both the frontend and backend simultaneously:

```bash
npm run dev
```

This uses `concurrently` to run both servers in parallel.

## Project Structure

```
amber/
├── src/
│   ├── frontend/                    # React web application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Reusable design system (Button, Input, Card, Modal, etc.)
│   │   │   │   ├── auth/            # Login, signup, OAuth, role selection, onboarding
│   │   │   │   ├── layout/          # AppLayout, PublicLayout, Sidebar, ErrorBoundary
│   │   │   │   ├── landing/         # Welcome screen with animations, nav, footer
│   │   │   │   ├── candidate/       # Assessment, personality insights, results
│   │   │   │   ├── employer/        # Culture quiz, roles, candidate browsing, culture insights
│   │   │   │   ├── dashboard/       # Job seeker and employer dashboards
│   │   │   │   ├── ember/           # Ember AI agent UI (gallery, deep dive, identity card)
│   │   │   │   ├── assessments/     # Supplementary assessment components
│   │   │   │   ├── coffee-chats/    # Coffee chat scheduling, calendar, cards, feedback
│   │   │   │   ├── connections/     # Connection requests, inbox panel, connect modal
│   │   │   │   ├── network/         # Network hub: roles, people, companies, discover
│   │   │   │   ├── matches/         # Match display components
│   │   │   │   ├── messaging/       # Real-time message panel container
│   │   │   │   ├── pricing/         # Pricing and subscription page
│   │   │   │   ├── pages/           # Public pages (blog, about, careers, science, legal, etc.)
│   │   │   │   └── settings/        # Profile, appearance, notifications, privacy, subscription
│   │   │   ├── contexts/            # React context providers (Auth, Theme, Toast, Messaging, Connections)
│   │   │   ├── hooks/               # Custom hooks (matchData, localStorage, scroll, networking, etc.)
│   │   │   ├── lib/                 # Supabase client, personality engine, scoring, archetypes, Stripe
│   │   │   ├── types/               # TypeScript type definitions (auth, matching, connections, database)
│   │   │   ├── utils/               # API client, helpers, constants, motion presets
│   │   │   ├── data/                # Assessment question definitions
│   │   │   └── styles/              # Global CSS with theme variables
│   │   └── package.json
│   │
│   └── backend/                     # Python FastAPI server
│       ├── main.py                  # FastAPI entry point with all API routes
│       ├── agent/                   # Ember personality matching agent
│       │   ├── ember_agent.py       # Archetype classification, scoring, insights
│       │   └── archetype_compatibility.py  # 8x8 archetype bonus matrix
│       ├── auth/                    # JWT authentication and middleware
│       │   ├── supabase_auth.py     # Supabase JWT token verification
│       │   └── middleware.py        # Auth middleware and role-based access
│       ├── db/                      # Database layer
│       │   ├── database.py          # Local SQLite for development
│       │   └── supabase_client.py   # Supabase API client for production data
│       ├── engine/                  # Scoring and compatibility algorithms
│       │   ├── compatibility.py     # OCEAN-based matching with culture mapping
│       │   ├── scoring.py           # Assessment response scoring
│       │   └── questions.py         # Assessment question definitions
│       └── scripts/                 # Seed and utility scripts
│           ├── seed_ember_data.py   # Populate test candidates
│           └── seed_arsh_nakul.py   # Populate specific test profiles
│
├── supabase/                        # Database schema, migrations, and seed data
│   ├── schema.sql                   # Core tables, indexes, triggers, functions
│   ├── rls-policies.sql             # Row Level Security policies
│   ├── migrations/                  # Incremental schema changes
│   │   ├── connections.sql          # Connections and meet invites tables
│   │   ├── activity-posts.sql       # Activity posts for network feed
│   │   ├── coffee-chats-full-columns.sql  # Extended coffee chat columns
│   │   └── ...
│   ├── migrate-messages.sql         # Messages table for real-time chat
│   ├── migrate-stripe-subscriptions.sql  # Stripe billing columns on profiles
│   ├── migrate-saved-matches.sql    # Saved matches / bookmarks table
│   ├── migrate-activity-posts.sql   # Activity posts table
│   ├── seed-*.sql                   # Test data seed files
│   └── README.md                    # Database documentation
│
├── tests/                           # Test suites
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests
│
├── docs/
│   └── ARCHITECTURE.md              # Technical architecture overview
├── BLUEPRINT.md                     # Product vision, growth roadmap, and styling direction
├── FEATURES.md                      # Detailed feature documentation
├── CONTRIBUTING.md                  # Contribution workflow and guidelines
├── CHANGELOG.md                     # Version history and release notes
├── package.json                     # Root workspace configuration
└── README.md                        # This file
```

## Design System

Amber uses a warm, professional color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Amber 600 | `#D97706` | Primary accent, buttons, links |
| Stone 500 | `#78716C` | Muted text, secondary elements |
| Cream 100 | `#F5F3EF` | Light mode background |
| Stone 900 | `#1C1917` | Dark mode background |
| Green 600 | `#16A34A` | Success states, positive indicators |
| Red 600 | `#DC2626` | Error states, destructive actions |

### Themes

- **Amber Light** — Cream background with warm amber accents
- **Amber Dark** — Stone background with amber highlights

Users can switch themes via Settings > Appearance. The theme is persisted per user in the `user_settings` table.

### UI Components

The design system includes reusable components in `src/frontend/src/components/ui/`:

- `Button` — Primary, secondary, outline, ghost, and danger variants
- `Input` — With label support, error states, and icon slots
- `Card` — Container with padding and border styling
- `Modal` — Dialog with header, body, and footer sections
- `Toast` — Success, error, and info notification banners
- `Avatar` — User avatars with fallback initials
- `AvatarPicker` — Photo upload with preview
- `Badge` — Status indicator pills
- `Dropdown` — Accessible dropdown menus
- `DatePicker` — Date selection for scheduling
- `Skeleton` — Loading placeholder animations
- `Spinner` — Loading indicators
- `SearchInput` — Filterable search bar
- `GradientProgressBar` — Amber gradient progress visualization
- `LocationPicker` — Location input with autocomplete
- `ArchetypeCard` — Archetype visualization with icon and description
- `CoffeeBrewLoader` — Animated coffee cup loading state
- `AmberLogo` — Brand logo component
- `SplashScreen` — App loading screen

All components use CSS variables for consistent theming across light and dark modes.

## Authentication

Amber uses Supabase Auth with multiple providers:

- **Email/Password** — Standard signup and login with email verification
- **Google OAuth** — One-click Google sign-in
- **GitHub OAuth** — One-click GitHub sign-in
- **Password Reset** — Email-based password recovery flow
- **Role Selection** — After signup, users choose between "Job Seeker" and "Employer"
- **Onboarding** — Role-specific setup wizard (profile info for candidates, culture quiz for employers)
- **Protected Routes** — Authenticated routes are wrapped in `ProtectedRoute` with optional role enforcement

The backend validates JWT tokens from Supabase. When `SUPABASE_JWT_SECRET` is not configured, the API runs in development mode and skips authentication on protected routes.

## Database

### Core Tables (schema.sql)

| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users` with role, avatar, onboarding status, Stripe subscription fields |
| `candidates` | OCEAN scores, work preferences, assessment status, social links |
| `employers` | Company info, culture values, OCEAN preferences, quiz status |
| `roles` | Job listings with title, salary, location, and personality requirements |
| `applications` | Match scores (trait, culture, overall) and application status |
| `coffee_chats` | Scheduling, meeting links, feedback, ratings, connection references |
| `questions` | Assessment question definitions with trait scoring |
| `assessments` | Assessment session tracking |
| `assessment_responses` | Individual question responses |
| `feedback` | Bug reports, feature requests, and satisfaction ratings |
| `user_settings` | Notification, privacy, and theme preferences |

### Migration Tables

| Table | Migration File | Purpose |
|-------|---------------|---------|
| `connections` | `migrations/connections.sql` | User-to-user connection requests with status tracking |
| `connection_meet_invites` | `migrations/connections.sql` | Proposed meeting times bundled with connection requests |
| `messages` | `migrate-messages.sql` | Real-time chat messages within coffee chats |
| `saved_matches` | `migrate-saved-matches.sql` | Bookmarked/shortlisted roles and candidates |
| `activity_posts` | `migrate-activity-posts.sql` | User posts for the network hub feed |

Stripe subscription data is stored as columns on the `profiles` table (added via `migrate-stripe-subscriptions.sql`).

### Row Level Security

RLS policies ensure:

- Users can only read and update their own data
- Employers can view candidates who have completed assessments
- Candidates can view active job listings
- Applications are visible to both the candidate and the employer involved
- Connections are visible to both sender and receiver
- Messages are accessible only to coffee chat participants
- Meet invites are accessible via connection ownership

## API Endpoints

38 endpoints organized by domain. Full documentation at http://127.0.0.1:8000/docs when running locally.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | Health check |
| `GET` | `/health` | No | Detailed health status with latency |
| `GET` | `/api/me` | Yes | Current authenticated user info |
| `POST` | `/api/auth/check-email` | No | Check if an email already exists |
| `DELETE` | `/api/auth/delete-account` | Yes | Full account deletion with cascade |
| `POST` | `/api/assessment/start` | No | Start or resume an assessment |
| `POST` | `/api/assessment/answer` | No | Submit an answer to a question |
| `GET` | `/api/assessment/results/{id}` | No | Get assessment results and scores |
| `GET` | `/api/assessment/question/{id}` | No | Get a specific question |
| `GET` | `/api/assessment/questions` | No | List all assessment questions |
| `GET` | `/api/candidates` | Yes* | List all candidates (employer only) |
| `GET` | `/api/candidates/{id}` | Yes* | Get a specific candidate's details |
| `POST` | `/api/matching/calculate` | No | Calculate match score for a candidate-role pair |
| `GET` | `/api/matching/candidates/{role_id}` | No | Ranked candidates for a role |
| `GET` | `/api/matching/roles/{candidate_id}` | No | Ranked roles for a candidate |
| `POST` | `/api/matching/batch-calculate/{role_id}` | No | Score all candidates against one role |
| `GET` | `/api/matching/employer-candidates` | No | Employer-wide candidate ranking |
| `GET` | `/api/ember/candidate-matches/{id}` | No | Ember: ranked role matches for a candidate |
| `GET` | `/api/ember/employer-matches/{id}` | No | Ember: ranked candidate matches for an employer |
| `GET` | `/api/ember/analysis` | No | Ember: detailed pair analysis with insights |
| `POST` | `/api/coffee-chats` | No | Create a coffee chat request |
| `GET` | `/api/coffee-chats/candidate/{id}` | No | Get a candidate's coffee chats |
| `GET` | `/api/coffee-chats/employer/{id}` | No | Get an employer's coffee chats |
| `PATCH` | `/api/coffee-chats/{id}/status` | No | Update coffee chat status |
| `PATCH` | `/api/coffee-chats/{id}/schedule` | No | Schedule a coffee chat |
| `PATCH` | `/api/coffee-chats/{id}/feedback` | No | Submit feedback for a coffee chat |
| `POST` | `/api/coffee-chats/{id}/prep` | No | Generate personality-based prep brief |
| `POST` | `/api/connections` | No | Create connection request with optional meet invite |
| `PATCH` | `/api/connections/{id}/accept` | No | Accept connection |
| `PATCH` | `/api/connections/{id}/reject` | No | Reject connection |
| `GET` | `/api/connections/me` | No | Get all connections grouped by status |
| `POST` | `/api/feedback` | No | Submit user feedback |
| `GET` | `/api/feedback` | No | Get all feedback (admin) |
| `POST` | `/api/stripe/create-checkout-session` | No | Create a Stripe checkout session |
| `POST` | `/api/stripe/create-portal-session` | No | Create a Stripe customer portal session |
| `POST` | `/api/stripe/webhook` | No | Handle Stripe webhook events |
| `GET` | `/api/stripe/subscription` | No | Get current subscription status |
| `GET` | `/api/logo` | No | Company logo proxy with disk caching |

\*Requires `SUPABASE_JWT_SECRET` to be configured.

## Development

### Running Tests

```bash
# Frontend linting
cd src/frontend
npm run lint

# Frontend formatting
npm run format

# Backend tests
cd src/backend
pytest

# Backend linting
ruff check .

# Backend formatting
black .
```

### Building for Production

```bash
cd src/frontend
npm run build
```

The production build outputs to `src/frontend/dist/`.

### Useful Scripts

From the project root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run frontend` | Start only the frontend dev server |
| `npm run backend` | Start only the backend server |
| `npm run lint` | Lint both frontend and backend |
| `npm run format` | Format both frontend and backend |
| `npm run test` | Run all tests |

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch, commit, style, testing, and pull request guidelines. Use the [PR template](./.github/PULL_REQUEST_TEMPLATE.md) when opening a pull request.

## Changelog

Release notes and version history are tracked in [CHANGELOG.md](./CHANGELOG.md).

## License

Released under the [MIT License](./LICENSE).

## Authors

Nakul Patel
