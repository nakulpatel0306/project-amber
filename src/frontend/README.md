# Amber Frontend

React web application for the Amber platform. Built with React 19, TypeScript, Vite, and Tailwind CSS. The entry point is `src/main.tsx`, which renders `App.tsx`.

## Application Sections

- **Landing** — Public welcome screen with animated hero, product demo, FAQ, and marketing content.
- **Authentication** — Signup, login, OAuth (Google/GitHub), password reset, email verification, role selection, and onboarding.
- **Job Seeker App** — Dashboard, personality assessment, insights, top matches, Ember agent, coffee chats, and leaderboard (under `/app`).
- **Employer App** — Dashboard, culture quiz, culture insights, role management, candidate browsing, Ember agent, coffee chats, and leaderboard (under `/app/employer`).
- **Settings** — Profile management, appearance, notifications, privacy, account, subscription, and feedback.
- **Public Pages** — Blog, about, careers, press, science, help center, changelog, status, and legal pages.

## How It Works

### Routing

React Router is configured in `App.tsx`. Routes are organized into three groups:

1. **Public routes** (`/`, `/auth/*`, `/blog`, `/about`, etc.) — Accessible to everyone. Wrapped in `PublicLayout` for pages that share the landing nav and footer.
2. **Protected routes** (`/app/*`) — Wrapped in `ProtectedRoute`, which requires authentication and completed onboarding. Role-specific routes use the `allowedRoles` prop to restrict access to either candidates or employers.
3. **Guest-only routes** (`/auth/login`, `/auth/signup`) — Wrapped in `GuestRoute`, which redirects authenticated users to their dashboard.

### Authentication

`AuthContext` wraps the entire app and manages the Supabase Auth session. It handles:
- Session initialization and persistence
- User profile fetching from the `profiles` table
- Onboarding redirect logic (sends incomplete users to the setup wizard)
- Role-based navigation (candidates go to `/app/dashboard`, employers go to `/app/employer`)

`ProtectedRoute` and `GuestRoute` components enforce access rules at the route level.

### Theming

`ThemeContext` manages light/dark mode using CSS variables defined in `styles/globals.css`. The selected theme is persisted in the `user_settings` table when the user is logged in, and falls back to local storage for unauthenticated users.

### API Communication

The backend base URL and auth token configuration live in `utils/api.ts`. All backend calls should use the helpers exported from this file to ensure consistent authentication headers and error handling.

### State Management

- **React Context** — Used for global concerns: authentication (`AuthContext`), theming (`ThemeContext`), and toast notifications (`ToastContext`).
- **Zustand** — Used for local component state that needs to persist across renders without prop drilling.

## Component Structure

All components are organized by feature domain. There are no loose files at the `components/` root.

```
components/
├── ui/               # Reusable design system primitives
│                     # Button, Input, Card, Modal, Toast, Avatar, Badge,
│                     # Dropdown, Spinner, Skeleton, SearchInput, AmberLogo, SplashScreen
│
├── auth/             # Authentication flow
│                     # LoginPage, SignupPage, AuthCallback, PasswordResetPage,
│                     # RoleSelectionPage, Onboarding, ProtectedRoute, GuestRoute
│
├── landing/          # Public welcome screen
│                     # WelcomeScreen (hero, product demo, testimonials, FAQ),
│                     # LandingNav, LandingFooter
│
├── layout/           # App shell
│                     # Navbar, AppLayout, PublicLayout, ErrorBoundary,
│                     # NotificationDropdown
│
├── candidate/        # Job seeker features
│                     # Assessment, AssessmentFlow, PersonalityInsights,
│                     # MatchingAgent, TopMatches, Leaderboard
│
├── employer/         # Employer features
│                     # CultureQuiz, CultureAssessment, CultureInsights,
│                     # CreateRole, ManageRoles, BrowseCandidates,
│                     # TopCandidates, Leaderboard
│
├── dashboard/        # Role-specific dashboards
│                     # JobSeekerDashboard, EmployerDashboard
│
├── ember/            # Ember AI agent interface
│                     # EmberAgent (analysis UI, score rings, dimension bars),
│                     # EmberFirefly (animated mascot with mood states)
│
├── assessments/      # Supplementary assessment types
│                     # VisualPerceptionAssessment, WorkValuesAssessment,
│                     # SituationalJudgmentAssessment, CognitivePatternAssessment
│
├── coffee-chats/     # Coffee chat scheduling and management
│                     # CandidateCoffeeChats, EmployerCoffeeChats,
│                     # CoffeeChatCard, ScheduleModal, FeedbackModal
│
├── pricing/          # Subscription and pricing
│                     # PricingPage
│
├── pages/            # Public informational pages
│                     # AboutPage, BlogPage, CareersPage, PressPage,
│                     # SciencePage, HelpCenterPage, ChangelogPage, StatusPage,
│                     # PrivacyPolicyPage, TermsOfServicePage, CookiePolicyPage,
│                     # AccessibilityPage
│
└── settings/         # User settings sections
                      # SettingsPage, ProfileSection, CandidateProfileSection,
                      # EmployerProfileSection, AppearanceSection,
                      # NotificationSection, PrivacySection, AccountSection,
                      # SubscriptionSection, FeedbackSection
```

Each feature folder has an `index.ts` barrel file that re-exports its public components.

## Other Key Folders

| Folder | Purpose |
|--------|---------|
| `contexts/` | React context providers for Auth, Theme, and Toast state |
| `hooks/` | Custom hooks: `useLocalStorage`, `useScrollAnimation`, `useToast` |
| `lib/` | Supabase client initialization, personality engine, compatibility scoring, archetype definitions, Stripe configuration |
| `types/` | TypeScript type definitions for auth, database table shapes, and API responses |
| `utils/` | API client with auth headers, `cn()` class name utility, constants |
| `data/` | Assessment question definitions with trait mappings and scoring weights |
| `styles/` | Global CSS with Tailwind directives and CSS variable definitions for theming |

## Environment Variables

Create `.env` from `.env.example` and set:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

The backend URL is configured in `utils/api.ts` (defaults to `http://127.0.0.1:8000` in development).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server (default: http://localhost:5173) |
| `npm run build` | Type-check with TypeScript and build for production (output: `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on all TypeScript and TSX files |
| `npm run format` | Format all source files with Prettier |

## Design Conventions

- **Tailwind CSS** is used for all styling, with CSS variables defined in `styles/globals.css` for theme-aware colors.
- **Lowercase UI copy** is used throughout the app for a modern, casual feel.
- The `components/ui/` folder is the source of truth for all primitive UI components (buttons, inputs, cards, etc.). Always use these instead of creating one-off styled elements.
- New components should be placed in the appropriate feature folder and re-exported from its `index.ts` barrel file.

## Ember Agent

The Ember agent UI (`components/ember/EmberAgent.tsx`) provides the frontend interface for the AI-powered personality matching engine:

- **Animated Flame Mascot** — `EmberFirefly` renders the Ember character with mood-based animations (thinking, happy, neutral).
- **Typing Animation** — Simulates real-time analysis while waiting for backend results.
- **Circular Score Rings** — Visual compatibility score displays with animated fill.
- **Dimension Bars** — Side-by-side comparison of candidate vs. employer OCEAN scores for each personality trait.
- **Candidate View** — Shows ranked employer/role matches with compatibility insights.
- **Employer View** — Shows ranked candidate matches with culture fit analysis.
- **Client-Side Fallback** — If the backend is unavailable, the frontend queries Supabase directly and runs the matching algorithm locally using the personality engine in `lib/`.
