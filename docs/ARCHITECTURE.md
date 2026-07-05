# Amber — Architecture

Amber is a culture-first job matching platform. Instead of keyword-matching
resumes, it measures personality using the Big Five (OCEAN) model and matches
candidates to employers on culture and values fit. This document describes how
the codebase is organized and how the pieces fit together.

For product vision and roadmap see [`BLUEPRINT.md`](../BLUEPRINT.md); for a
feature-level breakdown see [`FEATURES.md`](../FEATURES.md); for setup and API
reference see [`README.md`](../README.md).

## System Overview

Amber is a two-tier application backed by Supabase:

```
┌──────────────────┐   REST (fetch)    ┌──────────────────┐
│  React frontend  │ ────────────────► │  FastAPI backend │
│  (src/frontend)  │                   │   (src/backend)  │
└────────┬─────────┘                   └────────┬─────────┘
         │                                      │
         │  supabase-js (auth, data, realtime)  │  supabase-py (service role)
         ▼                                      ▼
              ┌─────────────────────────────┐
              │   Supabase (PostgreSQL +    │
              │   Auth + Realtime + RLS)    │
              └─────────────────────────────┘
```

Two important architectural notes:

- **The frontend talks to Supabase directly** for authentication, most CRUD, and
  realtime subscriptions (messages, connections, coffee chats). It calls the
  **FastAPI backend** primarily for compatibility scoring, the Ember agent,
  Stripe, and the logo proxy.
- **Matching logic is intentionally duplicated** across Python (`src/backend`)
  and TypeScript (`src/frontend/src/lib`). The TS port is a client-side fallback
  used when the backend is unavailable and for rendering archetype details
  without an API round-trip. Keep the two in sync when changing scoring.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS 3, Framer Motion 12, Lucide icons |
| Frontend state | React Context (Auth, Theme, Toast, Messaging, Connections); Zustand available |
| Routing | React Router 7 (lazy-loaded routes, code splitting) |
| Backend | Python 3.11+, FastAPI, Uvicorn, Pydantic |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Realtime | Supabase Realtime (`postgres_changes`) |
| Auth | Supabase Auth (Email, Google OAuth, GitHub OAuth); JWT verified server-side |
| Payments | Stripe (checkout, customer portal, webhooks) |
| Matching | Custom OCEAN compatibility engine + Ember agent |
| Desktop (scaffold) | Tauri (`src-tauri/`) — shell only, not the primary target |
| AI/ML (reserved) | OpenAI, LangChain, Ollama — installed in `requirements.txt`, not yet wired in |

## Repository Layout

```
project-amber/
├── src/
│   ├── frontend/        # React web app — the primary application
│   ├── backend/         # Python FastAPI server — scoring, Ember, Stripe
│   ├── App.tsx          # Root-level Tauri desktop shell scaffold (separate from src/frontend)
│   └── main.tsx
├── src-tauri/           # Tauri desktop scaffolding (generated schemas)
├── supabase/            # SQL schema, RLS policies, migrations, seed data
├── tests/               # unit / integration / e2e (placeholders)
├── docs/                # this document
├── BLUEPRINT.md         # product vision + styling direction
├── FEATURES.md          # detailed feature docs
└── package.json         # root npm workspace (workspaces: src/frontend)
```

> Note: the root `src/App.tsx` / `src/main.tsx` and top-level `src-tauri/` are a
> Tauri desktop shell scaffold and are distinct from the real application under
> `src/frontend/`. Day-to-day work happens in `src/frontend` and `src/backend`.

The root `package.json` defines convenience scripts: `npm run dev` starts the
frontend and backend together via `concurrently`; `npm run frontend` /
`npm run backend` run each independently.

## Backend (`src/backend`)

A FastAPI application. `main.py` is the single entry point that declares all ~38
routes, CORS, middleware, and Pydantic request/response models, grouped by
domain: health, auth, assessment, candidates, matching, Ember, coffee chats,
connections, feedback, and Stripe.

### Modules

| Module | Responsibility |
|--------|----------------|
| `main.py` | FastAPI app, all route handlers, CORS, request models, logo proxy |
| `engine/compatibility.py` | Core OCEAN scoring: trait / culture / work-style / communication / overall, plus bidirectional and reverse compatibility |
| `engine/scoring.py` | Converts raw assessment responses into OCEAN scores |
| `engine/questions.py` | Assessment question definitions (source of truth for the dev quiz flow) |
| `agent/ember_agent.py` | Archetype classification, ranked matches, and human-readable insight generation |
| `agent/archetype_compatibility.py` | 8×8 archetype-pair bonus/modifier matrix layered on top of raw scores |
| `auth/supabase_auth.py` | Supabase JWT verification (`is_auth_configured` gate) |
| `auth/middleware.py` | `AuthMiddleware`, `require_auth`, `require_role` dependencies |
| `db/supabase_client.py` | Supabase (service-role) client — production data access (candidates, employers, roles, applications, coffee chats, connections, meet invites) |
| `db/database.py` | Local SQLite used for the assessment flow in development |
| `scripts/` | Seed scripts for test candidates and specific demo profiles |

### Two data paths

The backend has **two database layers**. `db/database.py` is a local SQLite
store initialized at startup (`init_database()`), used for the standalone
assessment flow in development. `db/supabase_client.py` is the real production
data access layer against Supabase using the service-role key. Handlers pick the
appropriate layer per endpoint.

### Auth mode

JWT verification is gated by `is_auth_configured`. When `SUPABASE_JWT_SECRET` is
**not** set, the API runs in development mode and skips auth on protected routes
(hence many endpoints being marked "No auth" in the README table). Endpoints
that enforce roles (e.g. candidate listing) require the secret to be configured.

## Matching & Scoring Engine

This is the heart of the product. Everything below lives in
`engine/compatibility.py` (Python) and is mirrored in
`src/frontend/src/lib/compatibilityScoring.ts` (TypeScript).

Inputs are three dataclasses: `CandidateOCEAN` (the five trait scores, 0–100),
`EmployerPreferences` (per-trait ideal scores + a list of `culture_values`), and
optional `RoleRequirements` (per-trait min/max ranges + work style). All scores
normalize to 0–100.

**Score components:**

- **Trait match** — weighted Euclidean distance between candidate OCEAN and
  employer preferences, normalized so 100 = identical.
- **Culture match** — a weighted composite: work-style compatibility (30%),
  culture-values alignment (50%), and role-specific fit (20%).
- **Culture-values alignment** uses `CULTURE_OCEAN_MAP`, a table mapping each
  culture value (e.g. `innovation`, `empathy`, `balance`) to the OCEAN traits it
  correlates with, and a signed weight. Positive weight → higher trait score is
  better; negative weight → lower score is better (e.g. `balance` favors low
  neuroticism).
- **Role fit** — checks whether candidate traits fall inside the role's declared
  min/max ranges; out-of-range traits are penalized proportionally.
- **Work style** — categorical compatibility between remote/hybrid/onsite/flexible.
- **Communication fit** — derived from extraversion + agreeableness alignment.
- **Overall** — `40% trait + 30% culture + 20% work style + 10% communication`.

**Bidirectional matching** — Amber scores fit in both directions.
`calculate_reverse_compatibility` scores how well the *employer* fits the
*candidate's* stated preferences (preferred work style, company size, and the
ideal cultures implied by the candidate's archetype).
`calculate_bidirectional_match` combines forward and reverse as
`0.7 * forward + 0.3 * reverse`. `calculate_confidence` grades how complete a
candidate's profile is, so the UI can flag low-confidence matches.

## The Ember Agent

Ember (`agent/ember_agent.py`) is the product's AI mascot and matching persona.
It sits on top of the compatibility engine and adds:

- **Archetype classification** — maps an OCEAN profile to one of 8 archetypes
  (Innovator, Architect, Connector, Catalyst, Craftsperson, Harmonizer,
  Explorer, Strategist). Each archetype carries an OCEAN signature, ideal
  cultures, and display metadata.
- **Archetype-pair modifiers** — `archetype_compatibility.py` holds an 8×8
  matrix that nudges raw scores based on how well two archetypes tend to mesh.
- **Ranked matches + insights** — `run_ember_analysis` (candidate → roles) and
  `run_ember_employer_analysis` (employer → candidates) produce ordered lists
  with narrative, human-readable insights for the UI.

These power the `/api/ember/*` endpoints and the `components/ember/` UI.

## Frontend (`src/frontend`)

A Vite + React 19 SPA. `src/main.tsx` mounts `App.tsx`, which defines all routing.

### Application shell & routing

`App.tsx` wraps the app in a fixed provider hierarchy:

```
ErrorBoundary
└─ AuthProvider          (session, current user, role)
   └─ ThemeProvider      (light/dark, reads user theme preference)
      └─ ToastProvider
         └─ BrowserRouter
            └─ ConnectionsProvider
               └─ MessagingProvider
                  └─ Routes (Suspense-wrapped, lazy-loaded)
```

Routes fall into three groups:

- **Public** (`/`, `/blog`, `/about`, `/science`, legal pages, `/pricing`) —
  wrapped in `PublicLayout`, no auth.
- **Auth** (`/auth/*`) — login, signup, OAuth callback, password reset, email
  verification, and role selection; guest-only routes use `GuestRoute`.
- **Protected app** (`/app/*`) — wrapped in `ProtectedRoute` + `AppLayout`, with
  role enforcement via `allowedRoles`. Candidate routes (dashboard, assessment,
  insights, ember, supplementary assessments) and employer routes
  (`/app/employer/*`: culture quiz, roles, candidates, ember) live here, plus
  shared routes (network hub, settings, pricing).

Route components are lazy-loaded (`React.lazy` + `Suspense`) for code splitting;
layouts, guards, and the landing page load eagerly on the critical path.

### Directory map

| Path | Contents |
|------|----------|
| `components/ui/` | Design system — `Button`, `Input`, `Card`, `Modal`, `Toast`, `Avatar`, charts (`RadarChart`, `OceanRadar`), loaders, `AmberLogo`, etc. All theme via CSS variables. |
| `components/auth/` | Login, signup, OAuth callback, role selection, onboarding, route guards (`ProtectedRoute`, `GuestRoute`) |
| `components/layout/` | `AppLayout`, `PublicLayout`, `Sidebar`, `Navbar`, `ErrorBoundary`, `RouteTitleSync`, notification/bookmark dropdowns |
| `components/landing/` | Animated marketing/welcome screen and its effects |
| `components/candidate/` | Assessment flow, personality insights, results, matching |
| `components/employer/` | Culture quiz/assessment, culture insights, role create/manage, candidate browsing |
| `components/dashboard/` | Job-seeker and employer dashboards and their widgets (stats, calendars, radars, carousels) |
| `components/ember/` | Ember agent UI — gallery, deep dive, identity card, match feed |
| `components/assessments/` | Supplementary assessments (visual perception, work values, team dynamics, leadership, etc.) |
| `components/coffee-chats/` | Scheduling, calendar, cards, prep, feedback |
| `components/connections/` | Connection requests, inbox panel, connect modal |
| `components/network/` | Network hub — roles, people, companies, discover, posts |
| `components/matches/` | Match pipeline and detail views |
| `components/messaging/` | Realtime message panel |
| `components/pricing/`, `components/settings/`, `components/pages/` | Billing, user settings sections, and public content pages |
| `contexts/` | `AuthContext`, `ThemeContext`, `ToastContext`, `MessagingContext`, `ConnectionsContext` |
| `hooks/` | Data + UI hooks (`useMatchData`, `useNetworkData`, `useSavedMatches`, `useLocalStorage`, `useReducedMotion`, `usePageTitle`, …) |
| `lib/` | `supabase.ts` (typed client), `personalityEngine.ts`, `compatibilityScoring.ts`, `archetypes.ts`, `archetypeCompatibility.ts`, `stripe/` |
| `types/` | TypeScript types (`auth`, `matching`, `connections`, `database`) |
| `utils/` | `api.ts` (typed backend client), `cn.ts`, `constants.ts`, `matchHelpers.ts`, `motion.ts`, `coffeeChatStatus.ts` |
| `data/` | Static content — assessment questions, blog posts, employer archetypes, hobbies, personality facts |
| `styles/` | `globals.css` with theme CSS variables |

### Client-side libraries of note

- `lib/supabase.ts` — the single typed Supabase client; degrades gracefully with
  a warning when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are absent.
- `lib/personalityEngine.ts` — maps scenario-based assessment responses to OCEAN
  scores, trait constellations, and culture-fit predictions on the client.
- `lib/compatibilityScoring.ts` + `lib/archetypes.ts` — TypeScript ports of the
  backend scoring and archetype logic (see the duplication note above).
- `utils/api.ts` — all backend REST calls, typed; `API_BASE_URL` points at the
  FastAPI dev server (`http://localhost:8000`).

## Data Layer (`supabase/`)

The database is defined and evolved entirely through SQL files run in the
Supabase SQL editor. `schema.sql` is the base; `rls-policies.sql` defines Row
Level Security; incremental changes live in `migrations/` and the various
`migrate-*.sql` files; `seed-*.sql` and `fix-*.sql` provide test data and
targeted patches.

### Core tables (`schema.sql`)

| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users` with role, avatar, onboarding status, Stripe fields |
| `candidates` | OCEAN scores, work preferences, assessment status, social links |
| `employers` | Company info, culture values, OCEAN preferences, quiz status |
| `roles` | Job listings with per-trait personality requirement ranges |
| `applications` | Trait / culture / overall match scores + application status |
| `coffee_chats` | Scheduling, meeting links, feedback, ratings, connection refs |
| `questions`, `assessments`, `assessment_responses` | Assessment definitions, sessions, and responses |
| `feedback` | Bug reports, feature requests, satisfaction ratings |
| `user_settings` | Notification, privacy, and theme preferences |

### Migration-added tables

| Table | Migration | Purpose |
|-------|-----------|---------|
| `connections`, `connection_meet_invites` | `migrations/connections.sql` | Connection requests + proposed meeting times |
| `messages` | `migrate-messages.sql` | Realtime chat within coffee chats |
| `saved_matches` | `migrate-saved-matches.sql` | Bookmarked roles/candidates |
| `activity_posts` | `migrate-activity-posts.sql` | Network-hub feed posts |

Stripe subscription state is stored as columns on `profiles`
(`migrate-stripe-subscriptions.sql`), not a separate table.

### Row Level Security

RLS is central to Amber's authorization model: users read/write only their own
rows; employers see candidates who have completed assessments; candidates see
active roles; applications, connections, and coffee-chat messages are visible
only to the parties involved. A number of `fix-*recursion*.sql` files exist
because RLS policies that self-reference tables can trigger infinite recursion —
consult those before editing policies.

## Cross-Cutting Concerns

- **Authentication** — Supabase Auth issues JWTs. The frontend manages the
  session via `AuthContext`/supabase-js; the backend verifies the JWT when
  `SUPABASE_JWT_SECRET` is configured, otherwise runs open in dev mode. After
  signup, users pick a role (candidate/employer) then complete a role-specific
  onboarding wizard.
- **Realtime** — Supabase `postgres_changes` subscriptions drive live messages,
  connection updates, and coffee-chat changes, surfaced through
  `MessagingContext` and `ConnectionsContext`.
- **Payments** — Stripe checkout and customer-portal sessions are created by the
  backend; webhooks (`/api/stripe/webhook`) update subscription state on
  `profiles`. Frontend billing lives in `components/pricing/` and
  `lib/stripe/`.
- **Theming** — a warm amber palette with Light and Dark themes, driven by CSS
  variables in `styles/globals.css` and persisted per user in `user_settings`.
- **Logo proxy** — `/api/logo` fetches and disk-caches company logos
  (`cache/logos/`) to avoid hotlinking and repeated fetches.

## Local Development

- `npm run dev` (root) — runs backend + frontend concurrently.
- Backend: `cd src/backend && python main.py` → `http://127.0.0.1:8000`
  (interactive docs at `/docs`).
- Frontend: `cd src/frontend && npm run dev` → `http://localhost:5173`.
- Tooling: frontend uses ESLint + Prettier; backend uses `ruff`, `black`,
  `mypy`, and `pytest`. The `tests/` tree (unit/integration/e2e) is currently
  scaffolding.

## Conventions & Gotchas

- **Keep the Python and TypeScript scoring engines in sync.** Changing weights,
  the `CULTURE_OCEAN_MAP`, or archetype definitions in one place requires the
  matching change in the other.
- **Two backend data stores.** Don't assume an endpoint hits Supabase — the
  assessment flow uses local SQLite in development.
- **RLS recursion.** Editing RLS policies is the most error-prone database task;
  the `fix-*-recursion.sql` history documents the pitfalls.
- **Dev-mode auth.** Many endpoints are effectively unauthenticated unless
  `SUPABASE_JWT_SECRET` is set — configure it before treating auth as enforced.
