# Amber Frontend

React web app for the Amber platform. Entry point is `src/main.tsx` → `App.tsx`.

## Purpose

- **Landing** — Public welcome screen with animations and marketing
- **Auth** — Signup, login, OAuth, password reset, role selection, onboarding
- **Candidate App** — Dashboard, assessment, personality insights, matches, Ember agent (under `/app`)
- **Employer App** — Dashboard, culture quiz, culture insights, roles, browse candidates, Ember agent (under `/app/employer`)
- **Settings** — Profile, appearance, notifications, privacy, feedback

## How It Works

- **Routing**: React Router in `App.tsx`. Public routes (`/`, `/auth/*`), then `/app/*` wrapped in `ProtectedRoute` (requires auth + onboarding). Role-specific routes use `allowedRoles`.
- **Auth**: `AuthContext` wraps the app; uses Supabase Auth and syncs with `profiles`. `ProtectedRoute` and `GuestRoute` enforce access. Onboarding redirect is handled in the context.
- **Theme**: `ThemeContext` + CSS variables in `styles/globals.css`. Theme persisted in `user_settings` when logged in.
- **API**: Backend base URL and auth token are in `utils/api.ts`; use those for all backend calls.

## Component Structure

All components are organized by feature — no loose files at the component root.

```
components/
├── ui/           # Reusable primitives (Button, Input, Card, Modal, Toast, etc.)
├── auth/         # Login, signup, callback, onboarding, protected/guest route wrappers
├── landing/      # Welcome screen, animated blobs, FAQ accordion, theme selector
├── layout/       # Navbar, AppLayout, ErrorBoundary
├── candidate/    # Assessment flow, personality insights, matching agent
├── dashboard/    # JobSeekerDashboard, EmployerDashboard
├── ember/        # Ember AI agent UI (mascot, score rings, dimension bars)
├── employer/     # Culture quiz, culture assessment, insights, roles, browse candidates
└── settings/     # Settings page, profile, appearance, notifications, privacy, feedback
```

Each folder has an `index.ts` barrel file that re-exports its components.

## Other Key Folders

| Folder | Purpose |
|--------|---------|
| `contexts/` | Auth, theme, toast providers |
| `hooks/` | Custom hooks (localStorage, scroll animation, toast) |
| `lib/` | Supabase client, personality engine, compatibility scoring engine |
| `types/` | TypeScript definitions (auth, database shapes) |
| `utils/` | API client, `cn` utility, constants |
| `data/` | Assessment question definitions |
| `styles/` | Global CSS with theme variables |

## Environment Variables

Create `.env` from `.env.example` and set:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key

Backend URL is configured in `utils/api.ts` (default `http://127.0.0.1:8000`).

## Scripts

- `npm run dev` — Vite dev server (default http://localhost:5173)
- `npm run build` — Production build → `dist/`
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Design

- Tailwind + CSS variables; see `styles/globals.css` and `components/ui/` for patterns.
- Lowercase UI copy throughout the app.
- Components in `ui/` are the source of truth for buttons, inputs, cards, etc.

## Ember Agent

The Ember agent UI (`components/ember/EmberAgent.tsx`) provides:

- Animated flame mascot with mood states
- Typing animation while analyzing
- Circular score rings for compatibility
- Dimension bars comparing candidate vs employer OCEAN scores
- Both candidate view (see employer matches) and employer view (see candidate rankings)
- Client-side fallback — queries Supabase directly if the backend is unavailable
