# Contributing to Amber

Thanks for your interest in contributing. This guide covers the development workflow, code style, and review expectations for the project.

## Getting Started

1. Fork the repo and clone your fork.
2. Follow the [Quick Start](./README.md#quick-start) in the root README to set up Supabase, the backend, and the frontend.
3. Create a feature branch off `main`:
   ```bash
   git checkout -b feature/short-description
   ```

## Branch Naming

Use descriptive, lowercase, hyphenated names with a prefix that signals intent:

| Prefix | Use For |
|--------|---------|
| `feature/` | New user-facing functionality |
| `fix/` | Bug fixes |
| `chore/` | Tooling, dependencies, non-behavioral maintenance |
| `docs/` | Documentation-only changes |
| `refactor/` | Internal restructuring without behavior change |

Example: `feature/ember-archetype-filter`, `fix/coffee-chat-status-race`.

## Commit Messages

Keep commit subjects short and in the imperative mood ("add X", not "added X" or "adds X"). Use the body for the "why," not the "what."

```
fix: prevent duplicate connection requests on rapid click

The connection button was not disabled during the in-flight request,
allowing users to submit the same invite twice.
```

Prefixes like `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` are encouraged but not enforced.

## Code Style

The project follows the conventions in [`.cursorrules`](./.cursorrules). Highlights:

- **UI copy**: lowercase text throughout (buttons, labels, headings in the app).
- **React**: functional components, hooks over class patterns.
- **Python**: type hints on function signatures; small, focused functions.
- **Theming**: use the CSS variables defined in `src/frontend/src/styles/globals.css` — do not hardcode colors.
- **Components**: follow the patterns in `src/frontend/src/components/ui/` (Button, Input, Card).
- **RBAC**: every new route or data read must respect candidate vs. employer scoping.

### Linting and Formatting

Run before you push:

```bash
npm run lint        # frontend + backend
npm run format      # prettier + black
```

Individual targets are available under `lint:frontend`, `lint:backend`, `format:frontend`, `format:backend`.

## Testing

```bash
npm run test              # frontend + backend
npm run test:frontend     # vitest
npm run test:backend      # pytest
```

- New features should include at least one test (unit or integration).
- Bug fixes should add a regression test that fails without the fix.
- E2E tests live in `tests/e2e/`; integration in `tests/integration/`; unit in `tests/unit/`.

## Database Changes

Schema changes go in `supabase/` as new migration files — do not edit `schema.sql` in place unless you are also updating every downstream environment.

- New table or column → add a `migrate-*.sql` or `migrations/*.sql` file.
- New RLS policy → append to a dedicated migration, not `rls-policies.sql`.
- Document the new file in [`supabase/README.md`](./supabase/README.md) so others know the run order.

## Pull Requests

1. Push your branch and open a PR against `main`.
2. Fill out the PR template — summary, test plan, screenshots for UI changes.
3. Keep PRs focused: one feature, one fix, or one refactor per PR.
4. Link related issues with `Closes #123`.
5. Ensure CI is green before requesting review.

## Review Expectations

- Reviewers check correctness, RLS/auth impact, test coverage, and adherence to the design system.
- Address comments by pushing new commits rather than force-pushing until the PR is approved.
- Squash-merge is the default merge strategy.

## Reporting Issues

Open a GitHub issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser / OS / Node / Python versions if relevant

Security issues should be reported privately — do not open a public issue.
