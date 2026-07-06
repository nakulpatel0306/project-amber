# Changelog

All notable changes to Amber are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `docs/ARCHITECTURE.md` — end-to-end architecture overview (system diagram, backend/frontend/data layers, matching engine, and cross-cutting concerns).
- `LICENSE` (MIT) at repo root.
- `CONTRIBUTING.md` with branch, commit, style, testing, and PR guidelines.
- `CHANGELOG.md` to track version history.
- `.github/PULL_REQUEST_TEMPLATE.md` to standardize pull request descriptions.

### Fixed
- Documentation accuracy pass: corrected culture-values count (17 → 20), culture-quiz question count (7 → 8), `pages/` component count (17 → 14), and the `globals.css` path in `CONTRIBUTING.md`.

## [0.1.0] — Initial Development

Pre-release baseline. The platform is under active development; all features below are implemented but not production-released.

### Added
- **Frontend**: React 19 + TypeScript + Vite 7 app with Tailwind 3 and Framer Motion 12.
- **Backend**: Python 3.11 + FastAPI service with 38 API endpoints spanning auth, assessments, candidate/employer management, matching, Ember agent, coffee chats, connections, feedback, and Stripe billing.
- **Database**: Supabase (PostgreSQL) schema with 20+ tables, Row Level Security policies, and migration/seed files.
- **Matching engine**: OCEAN-based compatibility scoring with 8 archetypes and an 8×8 archetype compatibility matrix.
- **Assessments**: 10-question Big Five assessment plus supplementary candidate and employer assessment types.
- **Ember agent**: AI-ranked compatibility analysis for candidates and employers (rule-based; OpenAI/LangChain integration reserved for a future phase).
- **Connections**: connection requests with optional meeting invites; accepted connections unlock coffee chats.
- **Coffee chats**: lifecycle (requested → scheduled → completed) with feedback and ratings.
- **Network hub**: role, people, and company discovery surfaces.
- **Realtime**: Supabase `postgres_changes` subscriptions for messages, connections, and coffee chats.
- **Auth**: Supabase Auth with Email, Google OAuth, and GitHub OAuth.
- **Payments**: Stripe checkout, customer portal, and webhook handling (with graceful demo-data fallback when unconfigured).
- **Documentation**: root `README.md`, `BLUEPRINT.md`, `FEATURES.md`, and per-area READMEs under `src/frontend/`, `src/backend/`, and `supabase/`.

[Unreleased]: https://github.com/nakulpatel0306/project-amber/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/nakulpatel0306/project-amber/releases/tag/v0.1.0
