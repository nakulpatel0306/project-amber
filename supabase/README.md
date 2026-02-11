# Supabase (Database & Auth)

SQL and seed files for the Amber Supabase project. Supabase is the source of truth for **auth** and **app data** (profiles, candidates, employers, roles, etc.). The backend can also use a local SQLite DB for assessment flow in dev.

## What to Run (Order)

Run these in the Supabase SQL Editor for your project:

1. **schema.sql** – Tables, indexes, triggers, and functions. Run first.
2. **rls-policies.sql** – Row Level Security policies. Run after schema so users only see their own data and role-appropriate rows.
3. **seed-questions.sql** – Optional; seeds assessment questions if your app uses Supabase for questions.
4. **seed-test-users.sql** – Optional; test users for local/dev.
5. **seed-test-responses.sql** – Optional; test assessment responses for dev.

## What Lives Where

- **Auth** – Handled by Supabase (email, OAuth). We don't create auth tables; we use `auth.users`.
- **Profiles** – One row per user, extends `auth.users` with `role` (candidate/employer), onboarding, avatar, etc. Created/updated by app and triggers.
- **Candidates** – One per candidate user: Big Five scores, preferences, assessment status, setup progress.
- **Employers** – One per employer user: company info, culture values, culture quiz results.
- **Roles** – Job listings with personality requirements.
- **Applications**, **coffee_chats**, **assessments**, **feedback**, **user_settings** – Used as the product grows; schema is in `schema.sql`.

## RLS (Row Level Security)

RLS is applied so that:

- Users only read/update their own profile and related candidate/employer row.
- Candidates see only what they're allowed (e.g., active roles, own applications).
- Employers see only their org's data and candidates that are visible to them (e.g., completed assessments).

Details and exact policies are in `rls-policies.sql`.

## Seed Scripts (Backend)

In addition to the SQL seed files above, the backend has Python seed scripts in `src/backend/scripts/`:

- `seed_ember_data.py` — Populates test candidates with unique OCEAN personality profiles
- `seed_arsh_nakul.py` — Fills out Arsh and Nakul profiles with personality data

These use the Supabase service role key and are run as one-time setup utilities.

## Frontend / Backend

- **Frontend** — Uses Supabase JS client for auth, profiles, candidates, employers, roles. Needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Backend** — Uses `SUPABASE_JWT_SECRET` to verify JWT; uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` for server-side reads/writes (candidates, employers, roles).

## Notes

- The `roles` table is defined in `schema.sql` but may need to be created manually if it wasn't included in your initial setup. Check the Supabase table editor and run the relevant `CREATE TABLE` from `schema.sql` if missing.
