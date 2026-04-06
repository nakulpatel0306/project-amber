# Amber Frontend

React web application for the Amber platform. Built with React 19, TypeScript, Vite 7, Tailwind CSS 3, and Framer Motion 12. The entry point is `src/main.tsx`, which renders `App.tsx`.

## Application Sections

- **Landing** — Public welcome screen with animated hero, interactive elements (magnetic buttons, cursor spotlight, tilt cards, floating coffee beans), and marketing content.
- **Authentication** — Signup, login, OAuth (Google/GitHub), password reset, email verification, role selection, and onboarding.
- **Job Seeker App** — Dashboard, personality assessment, insights, top matches, Ember agent gallery, network hub, connections, coffee chats with real-time messaging (under `/app`).
- **Employer App** — Dashboard, culture quiz, culture insights, role management, candidate browsing, Ember agent, connection inbox, coffee chats with real-time messaging (under `/app/employer`).
- **Settings** — Profile management, appearance, notifications, privacy, account, subscription, and feedback.
- **Public Pages** — Blog (with article detail), about, careers, press, science, help center, changelog, status, and legal pages.

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

Two built-in themes:
- **Amber Light** — Cream background (`#F5F3EF`) with warm amber accents
- **Amber Dark** — Stone background (`#1C1917`) with amber highlights

### API Communication

The backend base URL and auth token configuration live in `utils/api.ts`. All backend calls should use the helpers exported from this file to ensure consistent authentication headers and error handling.

### State Management

- **React Context** — Used for global concerns:
  - `AuthContext` — Authentication, session, profile, onboarding
  - `ThemeContext` — Light/dark mode toggle and persistence
  - `ToastContext` — Success/error/info notification banners
  - `MessagingContext` — Open chat panels, real-time message syncing via Supabase subscriptions, unread counts
  - `ConnectionsContext` — Connection requests (pending/accepted/rejected), sending and managing connections
- **Custom Hooks** — Encapsulate complex data fetching and state logic (see Hooks section below)
- **Local Storage** — Theme preference, sidebar state, dev mode flags
- **Session Storage** — Temporary state like setup modal dismissal

### Real-Time Features

Supabase realtime subscriptions (`postgres_changes`) power:
- **Messages** — Instant message delivery in floating chat panels (INSERT on `messages` table)
- **Connections** — Live inbox updates when connection requests are sent/accepted/rejected
- **Coffee Chats** — Status change notifications

Up to 3 floating chat panels can be open simultaneously with minimize/maximize, unread counts, and timestamp grouping.

## Component Structure

All components are organized by feature domain. There are no loose files at the `components/` root.

```
components/
├── ui/               # Reusable design system primitives (31+ components)
│                     # Button, Input, Card, Modal, Toast, Avatar, AvatarPicker,
│                     # Badge, Dropdown, DatePicker, Spinner, Skeleton, SearchInput,
│                     # GradientProgressBar, LocationPicker, ArchetypeCard,
│                     # CoffeeBrewLoader, GlitchMascot, PageBanner, AmberLogo, SplashScreen
│
├── auth/             # Authentication flow
│                     # LoginPage, SignupPage, AuthCallback, PasswordResetPage,
│                     # EmailVerificationPage, RoleSelectionPage, Onboarding,
│                     # ProtectedRoute, GuestRoute
│
├── landing/          # Public welcome screen
│                     # WelcomeScreen, LandingNav, LandingFooter,
│                     # AnimatedBlobs, CursorSpotlight, FloatingCoffeeBeans,
│                     # InteractiveGreeting, MagneticButton, ScrollProgress,
│                     # TiltCard, TypewriterText
│
├── layout/           # App shell
│                     # AppLayout, PublicLayout, Sidebar, MobileTopBar, ErrorBoundary
│
├── candidate/        # Job seeker features
│                     # Assessment, AssessmentFlow, AssessmentResults,
│                     # PersonalityInsights, PracticeCoffeeChat
│
├── employer/         # Employer features
│                     # CultureQuiz, CultureAssessment, CultureInsights,
│                     # EmployerAssessmentResults, CreateRole, ManageRoles,
│                     # TopCandidates, EmployerSetupModal
│
├── dashboard/        # Role-specific dashboards
│                     # JobSeekerDashboard: DashboardHeader, QuickActions,
│                     #   DashboardTopMatches, MatchingTable, StreakTracker,
│                     #   CompatibilityInsights, ScheduleWidget, ArchetypeStrip,
│                     #   CandidateSetupModal, BentoMetricCard, DashboardCalendar
│                     # EmployerDashboard: EmployerQuickActions,
│                     #   EmployerCandidateTable, EmployerArchetypeStrip,
│                     #   EmployerSetupModal
│
├── ember/            # Ember AI agent interface (11 components)
│                     # EmberAgent (gallery/carousel with filters and sort),
│                     # EmberEmployerPage, PlayerCardGrid, GalleryFilterBar,
│                     # DeepDive, CoffeeBrewModal, TopMatchCard,
│                     # MatchActivityFeed, EmberIdentityCard, EmberBrain,
│                     # EmberFirefly (animated mascot with mood states)
│
├── assessments/      # Supplementary assessment types (8 components)
│                     # VisualPerceptionAssessment, WorkValuesAssessment,
│                     # SituationalJudgmentAssessment, CognitivePatternAssessment,
│                     # TeamDynamicsAssessment, LeadershipStyleAssessment,
│                     # GrowthPhilosophyAssessment, WorkEnvironmentAssessment
│
├── coffee-chats/     # Coffee chat scheduling and management (13 components)
│                     # CandidateCoffeeChats, EmployerCoffeeChats,
│                     # CoffeeChatsCalendar, CoffeeChatCard, CoffeeChatDetailModal,
│                     # CoffeeChatFollowUp, CoffeeChatPrep, ScheduleModal,
│                     # FeedbackModal, AcceptWithDateModal
│
├── connections/      # Connection system (3 components)
│                     # InboxPanel (pending requests with actions),
│                     # ConnectModal (send request with optional meet invite),
│                     # ConnectButton (CTA to initiate connection)
│
├── network/          # Network hub and discovery (14 components)
│                     # NetworkHub (tabbed discovery interface),
│                     # NetworkRoles, NetworkPeople, NetworkCompanies,
│                     # NetworkDiscover, NetworkProfile, ProfileSidebar,
│                     # ProfileEditModal, FilterBar, NewPostModal, PostCard,
│                     # PostSkeleton
│
├── matches/          # Match display components
│                     # Match-related display and interaction components
│
├── messaging/        # Real-time messaging
│                     # MessagePanelContainer (floating chat panel manager)
│
├── pricing/          # Subscription and pricing
│                     # PricingPage (plans, Stripe checkout integration)
│
├── pages/            # Public informational pages (17 pages)
│                     # AboutPage, BlogPage, BlogArticlePage, CareersPage,
│                     # PressPage, SciencePage, HelpCenterPage, ChangelogPage,
│                     # StatusPage, PrivacyPolicyPage, TermsOfServicePage,
│                     # CookiePolicyPage, AccessibilityPage
│
└── settings/         # User settings sections (9 components)
                      # SettingsPage, AccountSection, CandidateProfileSection,
                      # EmployerProfileSection, AppearanceSection,
                      # NotificationSection, PrivacySection, SubscriptionSection,
                      # FeedbackSection
```

Each feature folder has an `index.ts` barrel file that re-exports its public components.

## Hooks

Custom hooks in `src/hooks/`:

| Hook | Purpose |
|------|---------|
| `useMatchData` (`useMatchData.ts`) | Load candidate or employer match data with compatibility calculations. Fetches profiles from Supabase and runs scoring. |
| `useNetworkData` (`useNetworkData.ts`) | Load network hub discovery data (roles, people, companies) with filters |
| `useSavedMatches` (`useSavedMatches.ts`) | Load, save, and manage bookmarked matches with status tracking |
| `useLocalStorage` (`useLocalStorage.ts`) | Typed localStorage hook with JSON serialization |
| `useScrollAnimation` (`useScrollAnimation.ts`) | Intersection Observer hook for scroll-triggered animations |
| `useMinLoader` (`useMinLoader.ts`) | Minimum loader display time to prevent UI flashing (<300ms) |
| `useToast` (`useToast.ts`) | Access toast notification context (show success/error/info) |

Context-based hooks (accessed via their respective contexts):
| Hook | Context | Purpose |
|------|---------|---------|
| `useAuth()` | `AuthContext` | Access auth state, session, profile, sign in/out methods |
| `useMessaging()` | `MessagingContext` | Open/close chat panels, send messages, mark as read |
| `useConnections()` | `ConnectionsContext` | Send/accept/reject connections, list connections by status |

## Other Key Folders

| Folder | Purpose |
|--------|---------|
| `contexts/` | 5 React context providers: Auth, Theme, Toast, Messaging, Connections |
| `lib/` | Supabase client initialization (`supabase.ts`), personality engine (`personalityEngine.ts`), compatibility scoring (`compatibilityScoring.ts`), archetype definitions (`archetypes.ts`), archetype compatibility matrix (`archetypeCompatibility.ts`), Stripe configuration (`stripe/`) |
| `types/` | TypeScript type definitions: `auth.types.ts` (user, session), `matching.types.ts` (OCEAN scores, compatibility), `connections.types.ts` (connection, meet invite), `database.types.ts` (Supabase table shapes) |
| `utils/` | `api.ts` (backend HTTP client with auth headers), `cn.ts` (class name utility using clsx + tailwind-merge), `constants.ts` (app-wide constants), `motion.ts` (Framer Motion presets: emberFadeUp, emberStagger), `matchHelpers.ts` (match score formatting), `coffeeChatStatus.ts` (status labels and colors), `seedTestData.ts` (development data seeding) |
| `data/` | Assessment question definitions with trait mappings and scoring weights |
| `styles/` | Global CSS with Tailwind directives and CSS variable definitions for theming (light/dark) |

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
- **Framer Motion** is used for all animations. Shared presets are defined in `utils/motion.ts` (`emberFadeUp`, `emberStagger`, etc.).

## Ember Agent

The Ember agent UI (`components/ember/`) provides the frontend interface for the AI-powered personality matching engine:

- **Animated Flame Mascot** — `EmberFirefly` renders the Ember character with mood-based animations (thinking, happy, neutral).
- **Typing Animation** — Simulates real-time analysis while waiting for backend results.
- **Circular Score Rings** — Visual compatibility score displays with animated fill.
- **Dimension Bars** — Side-by-side comparison of candidate vs. employer OCEAN scores.
- **Gallery Views** — Grid and carousel views with filter/sort controls (by score, culture, work style, recency).
- **Deep Dive Modals** — `CoffeeBrewModal` and `DeepDive` for detailed match analysis with trait breakdowns and insights.
- **Candidate View** (`EmberAgent`) — Ranked employer/role matches with compatibility insights.
- **Employer View** (`EmberEmployerPage`) — Ranked candidate matches with culture fit analysis.
- **Client-Side Fallback** — If the backend is unavailable, the frontend queries Supabase directly and runs the matching algorithm locally using the personality engine in `lib/`.
