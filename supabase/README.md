# Supabase (Database and Authentication)

SQL schema, Row Level Security policies, and seed files for the Amber Supabase project. Supabase serves as the source of truth for **authentication** and **application data** (profiles, candidates, employers, roles, applications, coffee chats, assessments, and more). The backend also uses a local SQLite database for the assessment flow during development.

## Setup Instructions

Run the following files in order in the Supabase SQL Editor for your project:

| Step | File | Purpose |
|------|------|---------|
| 1 | `schema.sql` | Creates all tables, indexes, triggers, and functions. **Run this first.** |
| 2 | `rls-policies.sql` | Applies Row Level Security policies so users can only access their own data and role-appropriate rows. Run after the schema is in place. |
| 3 | `seed-questions.sql` | (Optional) Seeds the assessment questions table. Only needed if your app stores questions in Supabase rather than in the backend code. |
| 4 | `seed-test-users.sql` | (Optional) Creates test user accounts with pre-filled profiles, candidate data, and employer data for local development. |
| 5 | `seed-test-responses.sql` | (Optional) Populates test assessment responses and personality scores for the test users. |
| 6 | `seed-test-roles.sql` | (Optional) Creates test job roles with personality requirements for development. |

### Additional Migration Files

These files handle incremental schema changes and data fixes. Only run them if you are working with a database that was created before these changes were introduced:

| File | Purpose |
|------|---------|
| `fix-test-data.sql` | Fixes inconsistencies in test user data |
| `migrate-assessment-responses.sql` | Migrates the `assessment_responses` table to the new schema format |
| `migrate-rls-cross-visibility.sql` | Updates RLS policies to support cross-role visibility for matching |

## Database Schema

### Tables

#### `profiles`
Extends `auth.users` with application-specific data. One row per user.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users(id)` |
| `email` | TEXT | User's email address |
| `full_name` | TEXT | Display name |
| `avatar_url` | TEXT | URL to the user's avatar image |
| `phone_number` | TEXT | Optional phone number |
| `role` | TEXT | Either `'candidate'` or `'employer'` (NULL until the user chooses during onboarding) |
| `email_verified` | BOOLEAN | Whether the user has verified their email |
| `onboarding_completed` | BOOLEAN | Whether the user has completed the setup wizard |

#### `candidates`
One row per candidate user. Stores personality scores, work preferences, and assessment progress.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID (FK) | References `profiles(id)` |
| `headline`, `bio`, `location` | TEXT | Profile information |
| `linkedin_url`, `github_url`, `portfolio_url` | TEXT | Social and portfolio links |
| `years_experience` | INTEGER | Years of work experience |
| `openness_score` ... `neuroticism_score` | INTEGER (0-100) | Big Five trait scores |
| `culture_fit_score`, `work_style_score`, `communication_score`, `values_score` | INTEGER (0-100) | Derived composite scores |
| `top_traits` | TEXT[] | Array of top personality trait labels |
| `assessment_status` | TEXT | One of `'not_started'`, `'in_progress'`, `'completed'` |
| `preferred_work_style` | TEXT | One of `'remote'`, `'hybrid'`, `'onsite'`, `'flexible'` |
| `preferred_company_size` | TEXT | One of `'startup'`, `'small'`, `'medium'`, `'large'`, `'any'` |
| `salary_expectation_min`, `salary_expectation_max` | INTEGER | Salary range expectations |
| `setup_step` | INTEGER (0-4) | Tracks onboarding progress |

#### `employers`
One row per employer user. Stores company information, culture values, and OCEAN preferences.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID (FK) | References `profiles(id)` |
| `company_name` | TEXT | Company name (required) |
| `company_website`, `company_logo_url` | TEXT | Company branding |
| `company_size` | TEXT | One of `'1-10'`, `'11-50'`, `'51-200'`, `'201-500'`, `'500+'` |
| `industry`, `description`, `location` | TEXT | Company details |
| `culture_values` | TEXT[] | Top 5 selected culture values |
| `openness_preference` ... `neuroticism_preference` | INTEGER (0-100) | Ideal candidate OCEAN scores |
| `culture_quiz_completed` | BOOLEAN | Whether the employer has completed the culture quiz |
| `setup_step` | INTEGER (0-4) | Tracks onboarding progress |

#### `roles`
Job listings created by employers, each with optional personality requirement ranges.

| Column | Type | Description |
|--------|------|-------------|
| `employer_id` | UUID (FK) | References `employers(id)` |
| `title`, `description` | TEXT | Role title and description |
| `requirements`, `nice_to_have` | TEXT[] | Required and preferred qualifications |
| `location`, `work_style` | TEXT | Location and work arrangement |
| `salary_min`, `salary_max` | INTEGER | Salary range |
| `employment_type` | TEXT | One of `'full_time'`, `'part_time'`, `'contract'`, `'internship'` |
| `required_openness_min/max` ... `required_neuroticism_min/max` | INTEGER | OCEAN trait requirement ranges |
| `status` | TEXT | One of `'draft'`, `'active'`, `'paused'`, `'closed'` |

#### `applications`
Links candidates to roles with match scores and application status.

| Column | Type | Description |
|--------|------|-------------|
| `candidate_id` | UUID (FK) | References `candidates(id)` |
| `role_id` | UUID (FK) | References `roles(id)` |
| `status` | TEXT | One of `'pending'`, `'reviewing'`, `'shortlisted'`, `'interview'`, `'rejected'`, `'accepted'` |
| `trait_match_score`, `culture_match_score`, `overall_match_score` | INTEGER | Computed match scores |
| `behavioral_questions`, `behavioral_answers` | JSONB | AI-generated interview questions and candidate answers |
| `cover_note` | TEXT | Optional cover note from the candidate |

A unique constraint on `(candidate_id, role_id)` ensures one application per candidate per role.

#### `coffee_chats`
Informal conversation scheduling between candidates and employers.

| Column | Type | Description |
|--------|------|-------------|
| `candidate_id` | UUID (FK) | References `candidates(id)` |
| `employer_id` | UUID (FK) | References `employers(id)` |
| `application_id` | UUID (FK) | Optional link to an application |
| `status` | TEXT | One of `'pending'`, `'accepted'`, `'declined'`, `'completed'`, `'cancelled'` |
| `scheduled_at` | TIMESTAMPTZ | Scheduled date and time |
| `meeting_link` | TEXT | Video call URL |
| `notes` | TEXT | Pre-chat notes |
| `employer_feedback`, `employer_rating` | TEXT, INTEGER (1-5) | Employer's post-chat feedback |
| `candidate_feedback`, `candidate_rating` | TEXT, INTEGER (1-5) | Candidate's post-chat feedback |

#### `questions`
Assessment question definitions with trait scoring configuration.

| Column | Type | Description |
|--------|------|-------------|
| `question_code` | TEXT (Unique) | Short code like `'c1'`, `'c2'`, `'e1'` |
| `question_type` | TEXT | One of `'candidate'`, `'employer'`, `'visual_perception'` |
| `question_format` | TEXT | One of `'scenario'`, `'metaphor'`, `'tradeoff'`, `'ranking'`, `'reflection'`, `'slider'`, `'visual'` |
| `category` | TEXT | Grouping category (e.g., `'work_style'`, `'communication'`, `'values'`) |
| `question_text` | TEXT | The question displayed to the user |
| `options` | JSONB | Array of answer options with trait score mappings |
| `slider_config` | JSONB | Configuration for slider-type questions |
| `traits` | TEXT[] | Which OCEAN traits this question measures |

#### `assessments`
Tracks assessment sessions per user.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID (FK) | References `profiles(id)` |
| `assessment_type` | TEXT | One of `'candidate_personality'`, `'employer_culture'`, `'visual_perception'` |
| `responses` | JSONB | Final compiled responses (populated on completion) |
| `started_at`, `completed_at` | TIMESTAMPTZ | Session timestamps |

#### `assessment_responses`
Individual question responses within an assessment session.

| Column | Type | Description |
|--------|------|-------------|
| `assessment_id` | UUID (FK) | References `assessments(id)` |
| `user_id` | UUID (FK) | References `profiles(id)` |
| `question_code` | TEXT (FK) | References `questions(question_code)` |
| `answer` | JSONB | Answer data: `{"value": 75}` for sliders, `{"selected": "option_a"}` for multiple choice, `{"order": [...]}` for rankings, `{"text": "..."}` for reflections |

A unique constraint on `(assessment_id, question_code)` ensures one response per question per session.

#### `feedback`
User-submitted feedback (bug reports, feature requests, general feedback).

#### `user_settings`
Per-user notification, privacy, and UI preferences. Includes email notification toggles, profile visibility, salary visibility, and theme selection.

## Row Level Security (RLS)

RLS is enabled on all tables. The key policies are:

### Profiles
- Users can read and update their own profile.
- Employers can view candidate profiles only if the candidate has completed their assessment.
- Candidates can view employer profiles for matching purposes.

### Candidates and Employers
- Users can read, insert, and update their own candidate or employer record.
- Cross-role visibility (employers viewing candidates and vice versa) is handled through the backend API using the service role key to avoid RLS recursion issues.

### Roles (Job Listings)
- Anyone can view roles with `status = 'active'`.
- Employers can view, create, update, and delete their own roles.

### Applications
- Candidates can view and manage their own applications.
- Employers can view and update applications for roles they own.

### Coffee Chats
- Candidates can view their own coffee chats.
- Employers can view and create coffee chats.
- Both participants can update a coffee chat (for scheduling and feedback).

### Questions and Assessments
- All authenticated users can read questions (read-only).
- Users can create, view, and update their own assessments and responses.

### Storage
- An `avatars` storage bucket is created with public read access.
- Users can upload, update, and delete avatars only in their own folder (keyed by user ID).

## Seed Scripts (Backend)

In addition to the SQL seed files, the backend has Python seed scripts in `src/backend/scripts/`:

| Script | Purpose |
|--------|---------|
| `seed_ember_data.py` | Populates test candidates with diverse OCEAN personality profiles for testing the Ember matching engine |
| `seed_arsh_nakul.py` | Seeds specific test profiles for the Arsh and Nakul accounts with predefined personality data |

These scripts use the `SUPABASE_SERVICE_ROLE_KEY` environment variable and are intended as one-time development utilities.

## How the Frontend and Backend Connect to Supabase

- **Frontend** — Uses the Supabase JavaScript client (`@supabase/supabase-js`) for authentication, profile management, and direct database queries (subject to RLS). Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Backend** — Uses `SUPABASE_JWT_SECRET` to verify JWT tokens on protected routes. Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side reads and writes that bypass RLS (needed for cross-role data access in the matching engine).

## Notes

- The `roles` table is defined in `schema.sql` but may need to be created manually if it was not included in your initial setup. Check the Supabase Table Editor and run the relevant `CREATE TABLE` statement from `schema.sql` if it is missing.
- Auto-created triggers ensure `updated_at` timestamps are refreshed on every row update.
- A trigger on `auth.users` automatically creates a `profiles` row and `user_settings` row when a new user signs up. If the user provides a role during email signup, the corresponding `candidates` or `employers` row is also created automatically.
