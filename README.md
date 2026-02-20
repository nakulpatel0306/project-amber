# Amber

A culture-first job matching platform that connects candidates with companies based on personality fit and shared values. Amber uses the Big Five (OCEAN) personality model to power its matching engine, helping both job seekers and employers find the right culture fit before the first interview.

## What It Does

Amber reimagines the job search by putting personality and culture at the center of the hiring process. Instead of keyword-matching resumes, Amber measures who you are and how you work, then matches you with companies where you will actually thrive.

1. **Personality Assessment** — Candidates complete a research-backed Big Five personality assessment covering Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (OCEAN).
2. **Culture Definition** — Employers take a culture quiz to define their company values and ideal candidate personality profiles.
3. **AI-Powered Matching** — The Ember agent analyzes personality dimensions bidirectionally, scoring how well candidates align with each employer's culture and role requirements.
4. **Coffee Chats** — Once matched, candidates and employers connect through informal coffee chats before any formal application process.

## Features

### For Job Seekers

- 15-minute personality assessment based on the Big Five model
- Personality insights with archetype classification (8 archetypes: Innovator, Architect, Connector, Catalyst, Craftsperson, Harmonizer, Explorer, Strategist)
- **Ember Agent** — AI-powered analysis showing compatibility scores with each employer and role
- Top matches dashboard ranked by culture fit percentage
- Per-dimension breakdown comparing your OCEAN scores against employer preferences
- Coffee chat scheduling with matched employers
- Leaderboard showing how you rank among other candidates
- Profile management with work style preferences, salary expectations, and social links
- Supplementary assessments: Visual Perception, Work Values, Situational Judgment, and Cognitive Patterns

### For Employers

- Culture quiz to define company values and ideal personality preferences
- Culture insights dashboard with archetype-style company personality profiles
- **Ember Agent** — AI-ranked candidate list sorted by culture and personality fit
- Role management with personality requirement ranges per OCEAN trait
- Browse and filter candidates by match score
- Top candidates dashboard for each role
- Coffee chat management with scheduling, feedback, and ratings
- Employer leaderboard

> For a detailed breakdown of all features, see [FEATURES.md](./FEATURES.md).

## Tech Stack

| Layer            | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| Frontend         | React 19, TypeScript, Vite 7                          |
| Styling          | Tailwind CSS 3                                        |
| Icons            | Lucide React                                          |
| State Management | React Context, Zustand                                |
| Backend          | Python 3.11+, FastAPI                                 |
| Database         | Supabase (PostgreSQL)                                 |
| Authentication   | Supabase Auth (Email, Google OAuth, GitHub OAuth)     |
| Payments         | Stripe (checkout and customer portal)                 |
| AI/Matching      | Custom OCEAN-based compatibility engine + Ember agent |

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Python 3.11+
- A Supabase project ([supabase.com](https://supabase.com))

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Run the schema from `supabase/schema.sql` in the SQL Editor.
3. Run the RLS policies from `supabase/rls-policies.sql`.
4. Enable authentication providers (Email, Google, GitHub) in Authentication > Providers.
5. Copy your project URL and anon key from Settings > API.

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
│   │   │   │   ├── layout/          # Navbar, AppLayout, PublicLayout, ErrorBoundary
│   │   │   │   ├── landing/         # Welcome screen with animations, nav, footer
│   │   │   │   ├── candidate/       # Assessment, personality insights, matches, leaderboard
│   │   │   │   ├── employer/        # Culture quiz, roles, browse candidates, leaderboard
│   │   │   │   ├── dashboard/       # Job seeker and employer dashboards
│   │   │   │   ├── ember/           # Ember AI agent UI (mascot, score rings, analysis)
│   │   │   │   ├── assessments/     # Supplementary assessment components
│   │   │   │   ├── coffee-chats/    # Coffee chat scheduling, cards, feedback
│   │   │   │   ├── pricing/         # Pricing and subscription page
│   │   │   │   ├── pages/           # Public pages (blog, about, careers, etc.)
│   │   │   │   └── settings/        # Profile, appearance, notifications, privacy
│   │   │   ├── contexts/            # React context providers (Auth, Theme, Toast)
│   │   │   ├── hooks/               # Custom hooks (localStorage, scroll, toast)
│   │   │   ├── lib/                 # Supabase client, personality engine, scoring
│   │   │   ├── types/               # TypeScript type definitions
│   │   │   ├── utils/               # API client, helpers, constants
│   │   │   ├── data/                # Assessment question definitions
│   │   │   └── styles/              # Global CSS with theme variables
│   │   └── package.json
│   │
│   └── backend/                     # Python FastAPI server
│       ├── main.py                  # FastAPI entry point with all API routes
│       ├── agent/                   # Ember personality matching agent
│       │   └── ember_agent.py       # Archetype classification, scoring, insights
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
├── supabase/                        # Database schema and seed data
│   ├── schema.sql                   # Tables, indexes, triggers, functions
│   ├── rls-policies.sql             # Row Level Security policies
│   ├── seed-questions.sql           # Assessment questions
│   ├── seed-test-users.sql          # Test user data
│   ├── seed-test-responses.sql      # Test assessment responses
│   ├── seed-test-roles.sql          # Test job roles
│   └── README.md                    # Database documentation
│
├── tests/                           # Test suites
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests
│
├── FEATURES.md                      # Detailed feature documentation
├── package.json                     # Root workspace configuration
└── README.md                        # This file
```

## Design System

Amber uses a warm, professional color palette:

| Color     | Hex       | Usage                          |
| --------- | --------- | ------------------------------ |
| Amber 600 | `#D97706` | Primary accent, buttons, links |
| Stone 500 | `#78716C` | Muted text, secondary elements |
| Cream 100 | `#F5F3EF` | Light mode background          |
| Stone 900 | `#1C1917` | Dark mode background           |

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
- `Badge` — Status indicator pills
- `Dropdown` — Accessible dropdown menus
- `Skeleton` — Loading placeholder animations
- `Spinner` — Loading indicators
- `SearchInput` — Filterable search bar
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

### Core Tables

| Table                  | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `profiles`             | Extends `auth.users` with role, avatar, onboarding status               |
| `candidates`           | OCEAN scores, work preferences, assessment status, social links         |
| `employers`            | Company info, culture values, OCEAN preferences, quiz status            |
| `roles`                | Job listings with title, salary, location, and personality requirements |
| `applications`         | Match scores (trait, culture, overall) and application status           |
| `coffee_chats`         | Scheduling, meeting links, feedback, and ratings                        |
| `questions`            | Assessment question definitions with trait scoring                      |
| `assessments`          | Assessment session tracking                                             |
| `assessment_responses` | Individual question responses                                           |
| `feedback`             | Bug reports, feature requests, and satisfaction ratings                 |
| `user_settings`        | Notification, privacy, and theme preferences                            |

### Row Level Security

RLS policies ensure:

- Users can only read and update their own data
- Employers can view candidates who have completed assessments
- Candidates can view active job listings
- Applications are visible to both the candidate and the employer involved

## API Endpoints

| Method  | Endpoint                              | Auth  | Description                                     |
| ------- | ------------------------------------- | ----- | ----------------------------------------------- |
| `GET`   | `/`                                   | No    | Health check                                    |
| `GET`   | `/health`                             | No    | Detailed health status with latency             |
| `GET`   | `/api/me`                             | Yes   | Current authenticated user info                 |
| `POST`  | `/api/auth/check-email`               | No    | Check if an email already exists                |
| `POST`  | `/api/assessment/start`               | No    | Start or resume an assessment                   |
| `POST`  | `/api/assessment/answer`              | No    | Submit an answer to a question                  |
| `GET`   | `/api/assessment/results/{id}`        | No    | Get assessment results and scores               |
| `GET`   | `/api/assessment/questions`           | No    | List all assessment questions                   |
| `GET`   | `/api/candidates`                     | Yes\* | List all candidates (employer only)             |
| `GET`   | `/api/candidates/{id}`                | Yes\* | Get a specific candidate's details              |
| `POST`  | `/api/matching/calculate`             | No    | Calculate match score for a candidate-role pair |
| `GET`   | `/api/matching/candidates/{role_id}`  | No    | Ranked candidates for a role                    |
| `GET`   | `/api/matching/roles/{candidate_id}`  | No    | Ranked roles for a candidate                    |
| `GET`   | `/api/ember/candidate-matches/{id}`   | No    | Ember: ranked role matches for a candidate      |
| `GET`   | `/api/ember/employer-matches/{id}`    | No    | Ember: ranked candidate matches for an employer |
| `GET`   | `/api/ember/analysis`                 | No    | Ember: detailed pair analysis with insights     |
| `POST`  | `/api/coffee-chats`                   | No    | Create a coffee chat request                    |
| `GET`   | `/api/coffee-chats/candidate/{id}`    | No    | Get a candidate's coffee chats                  |
| `GET`   | `/api/coffee-chats/employer/{id}`     | No    | Get an employer's coffee chats                  |
| `PATCH` | `/api/coffee-chats/{id}/status`       | No    | Update coffee chat status                       |
| `PATCH` | `/api/coffee-chats/{id}/schedule`     | No    | Schedule a coffee chat                          |
| `PATCH` | `/api/coffee-chats/{id}/feedback`     | No    | Submit feedback for a coffee chat               |
| `POST`  | `/api/feedback`                       | No    | Submit user feedback                            |
| `POST`  | `/api/stripe/create-checkout-session` | No    | Create a Stripe checkout session                |
| `POST`  | `/api/stripe/create-portal-session`   | No    | Create a Stripe customer portal session         |

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

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start both frontend and backend concurrently |
| `npm run frontend` | Start only the frontend dev server           |
| `npm run backend`  | Start only the backend server                |
| `npm run lint`     | Lint both frontend and backend               |
| `npm run format`   | Format both frontend and backend             |
| `npm run test`     | Run all tests                                |

## License

MIT

## Authors

Nakul Patel
