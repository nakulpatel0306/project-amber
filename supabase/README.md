# Supabase (Database and Authentication)

SQL schema, Row Level Security policies, migrations, and seed files for the Amber Supabase project. Supabase serves as the source of truth for **authentication** and **application data** (profiles, candidates, employers, roles, applications, coffee chats, connections, messages, assessments, and more). The backend also uses a local SQLite database for the assessment flow during development.

## Setup Instructions

Run the following files in order in the Supabase SQL Editor for your project:

| Step | File | Purpose |
|------|------|---------|
| 1 | `schema.sql` | Creates core tables, indexes, triggers, and functions. **Run this first.** |
| 2 | `rls-policies.sql` | Applies Row Level Security policies so users can only access their own data and role-appropriate rows. |
| 3 | `migrations/connections.sql` | Creates the `connections` and `connection_meet_invites` tables with RLS policies. |
| 4 | `migrate-messages.sql` | Creates the `messages` table for real-time coffee chat messaging. |
| 5 | `migrate-stripe-subscriptions.sql` | Adds Stripe billing columns (`stripe_customer_id`, `subscription_plan`, etc.) to the `profiles` table. |
| 6 | `migrate-saved-matches.sql` | Creates the `saved_matches` table for bookmarking roles and candidates. |
| 7 | `migrate-activity-posts.sql` | Creates the `activity_posts` table for the network hub feed. |
| 8 | `migrate-coffee-chats.sql` | Adds extended columns to `coffee_chats` (role context, partner names, preferred dates). |
| 9 | `seed-questions.sql` | (Optional) Seeds the assessment questions table. Only needed if your app stores questions in Supabase rather than in the backend code. |
| 10 | `seed-test-users.sql` | (Optional) Creates test user accounts with pre-filled profiles, candidate data, and employer data. |
| 11 | `seed-test-responses.sql` | (Optional) Populates test assessment responses and personality scores for the test users. |
| 12 | `seed-test-roles.sql` | (Optional) Creates test job roles with personality requirements. |

### Additional Migration and Fix Files

These files handle incremental schema changes, data fixes, and RLS policy updates. Only run them if needed for your specific database state:

| File | Purpose |
|------|---------|
| `migrations/coffee-chats-full-columns.sql` | Full column set for coffee chats (alternative to incremental migration) |
| `migrations/activity-posts.sql` | Activity posts migration (alternative location) |
| `migrations/fix-coffee-chats-status.sql` | Fixes coffee chat status constraints |
| `migrations/fix-match-score-type.sql` | Fixes match score column type |
| `migrate-assessment-responses.sql` | Migrates `assessment_responses` to the new schema format |
| `migrate-rls-cross-visibility.sql` | Updates RLS for cross-role visibility in matching |
| `migrate-matching-cross-visibility.sql` | Extended cross-visibility for matching engine |
| `migrate-new-assessments.sql` | Schema for supplementary assessment types |
| `migrate-employer-assessments.sql` | Schema for employer-side assessments |
| `fix-test-data.sql` | Fixes inconsistencies in test user data |
| `fix-rls-policies.sql` | General RLS policy fixes |
| `fix-rls-complete.sql` | Comprehensive RLS fix |
| `fix-rls-final.sql` | Final RLS policy corrections |
| `fix-rls-no-recursion.sql` | Fixes RLS infinite recursion issues |
| `fix-all-recursion.sql` | Comprehensive recursion fix across all tables |
| `fix-infinite-recursion.sql` | Targeted infinite recursion fix |
| `fix-candidate-assessment-status.sql` | Fixes candidate assessment status tracking |
| `fix-existing-candidate-scores.sql` | Backfills scores for existing candidates |
| `fix-candidate-coffee-chat-insert.sql` | Fixes RLS for candidate coffee chat creation |
| `revert-candidate-view-employer.sql` | Reverts a specific RLS policy change |
| `diagnose-rls-issue.sql` | Diagnostic queries for RLS debugging |
| `test-rls-as-user.sql` | Test RLS policies by impersonating a user |
| `rpc-get-employer-with-roles.sql` | RPC function to get employer with roles (avoids RLS join issues) |
| `add-photo-captions.sql` | Adds photo caption columns |
| `seed-catalog-data.sql` | Seeds catalog/hobby data for network features |
| `seed-new-assessments.sql` | Seeds supplementary assessment questions |
| `seed-employer-assessments.sql` | Seeds employer assessment questions |
| `seed-sample-jobs.sql` | Seeds sample job listings |
| `seed-full-test-data.sql` | Comprehensive test data seed |
| `update-real-companies.sql` | Updates test employers with real company data |

## Database Schema

### Core Tables (schema.sql)

#### `profiles`
Extends `auth.users` with application-specific data. One row per user. Stripe subscription fields are added via `migrate-stripe-subscriptions.sql`.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users(id)` |
| `email` | TEXT | User's email address |
| `full_name` | TEXT | Display name |
| `avatar_url` | TEXT | URL to the user's avatar image |
| `phone_number` | TEXT | Optional phone number |
| `role` | TEXT | Either `'candidate'` or `'employer'` (NULL until chosen during onboarding) |
| `email_verified` | BOOLEAN | Whether the user has verified their email |
| `onboarding_completed` | BOOLEAN | Whether the user has completed the setup wizard |
| `stripe_customer_id` | TEXT | Stripe customer ID (added via migration) |
| `stripe_subscription_id` | TEXT | Stripe subscription ID (added via migration) |
| `subscription_plan` | TEXT | One of `'free'`, `'smooth_talker'`, `'connector'` (added via migration) |
| `subscription_interval` | TEXT | One of `'monthly'`, `'yearly'` (added via migration) |
| `subscription_status` | TEXT | One of `'active'`, `'past_due'`, `'canceled'`, `'inactive'` (added via migration) |

#### `candidates`
One row per candidate user. Stores personality scores, work preferences, and assessment progress.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID (FK) | References `profiles(id)` |
| `headline`, `bio`, `location` | TEXT | Profile information |
| `linkedin_url`, `github_url`, `portfolio_url` | TEXT | Social and portfolio links |
| `years_experience` | INTEGER | Years of work experience |
| `openness_score` ... `neuroticism_score` | INTEGER (0–100) | Big Five trait scores |
| `culture_fit_score`, `work_style_score`, `communication_score`, `values_score` | INTEGER (0–100) | Derived composite scores |
| `top_traits` | TEXT[] | Array of top personality trait labels |
| `assessment_status` | TEXT | One of `'not_started'`, `'in_progress'`, `'completed'` |
| `preferred_work_style` | TEXT | One of `'remote'`, `'hybrid'`, `'onsite'`, `'flexible'` |
| `preferred_company_size` | TEXT | One of `'startup'`, `'small'`, `'medium'`, `'large'`, `'any'` |
| `salary_expectation_min`, `salary_expectation_max` | INTEGER | Salary range expectations |
| `setup_step` | INTEGER (0–4) | Tracks onboarding progress |

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
| `openness_preference` ... `neuroticism_preference` | INTEGER (0–100) | Ideal candidate OCEAN scores |
| `culture_quiz_completed` | BOOLEAN | Whether the employer has completed the culture quiz |
| `setup_step` | INTEGER (0–4) | Tracks onboarding progress |

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
| `required_openness_min/max` ... `required_neuroticism_min/max` | INTEGER | OCEAN trait requirement ranges (10 columns) |
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

Unique constraint on `(candidate_id, role_id)` ensures one application per candidate per role.

#### `coffee_chats`
Informal conversation scheduling between candidates and employers. Extended columns added via `migrate-coffee-chats.sql`.

| Column | Type | Description |
|--------|------|-------------|
| `candidate_id` | UUID (FK) | References `candidates(id)` |
| `employer_id` | UUID (FK) | References `employers(id)` |
| `connection_id` | UUID (FK) | Optional reference to `connections(id)` (added via migration) |
| `application_id` | UUID (FK) | Optional link to an application |
| `role_id` | UUID (FK) | Role context (added via migration) |
| `role_title` | TEXT | Denormalized role title (added via migration) |
| `status` | TEXT | One of `'pending'`, `'accepted'`, `'declined'`, `'completed'`, `'cancelled'` |
| `scheduled_at` | TIMESTAMPTZ | Scheduled date and time |
| `meeting_link` | TEXT | Video call URL |
| `match_score` | INTEGER | Compatibility score at time of creation (added via migration) |
| `message` | TEXT | Initial message (added via migration) |
| `initiated_by` | TEXT | `'employer'` or `'candidate'` (added via migration) |
| `candidate_name`, `company_name` | TEXT | Denormalized names to avoid RLS join issues (added via migration) |
| `preferred_dates` | JSONB | Array of proposed date options (added via migration) |
| `notes` | TEXT | Pre-chat notes |
| `employer_feedback`, `employer_rating` | TEXT, INTEGER (1–5) | Employer's post-chat feedback |
| `candidate_feedback`, `candidate_rating` | TEXT, INTEGER (1–5) | Candidate's post-chat feedback |

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

Unique constraint on `(assessment_id, question_code)` ensures one response per question per session.

#### `feedback`
User-submitted feedback (bug reports, feature requests, general feedback).

#### `user_settings`
Per-user notification, privacy, and UI preferences. Includes email notification toggles, profile visibility, salary visibility, and theme selection.

### Migration Tables

#### `connections` (migrations/connections.sql)
User-to-user connection requests as a prerequisite for coffee chats.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `sender_id` | UUID (FK) | References `profiles(id)` |
| `receiver_id` | UUID (FK) | References `profiles(id)` |
| `sender_role` | TEXT | `'candidate'` or `'employer'` |
| `status` | TEXT | One of `'pending'`, `'accepted'`, `'rejected'` |
| `message` | TEXT | Optional connection message |
| `sender_name`, `receiver_name` | TEXT | Denormalized names (avoids RLS join issues) |
| `sender_company`, `receiver_company` | TEXT | Denormalized company names |
| `created_at`, `updated_at` | TIMESTAMPTZ | Timestamps with auto-update trigger |

Unique constraint on `(sender_id, receiver_id)` prevents duplicate connections.

#### `connection_meet_invites` (migrations/connections.sql)
Proposed meeting times bundled with connection requests.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `connection_id` | UUID (FK) | References `connections(id)` |
| `proposed_times` | JSONB | Array of ISO datetime strings |
| `confirmed_time` | TIMESTAMPTZ | Accepted meeting time |
| `status` | TEXT | One of `'pending'`, `'accepted'`, `'declined'`, `'expired'` |
| `duration_minutes` | INTEGER | Meeting duration (default: 30) |
| `meeting_link` | TEXT | Video call URL |

#### `messages` (migrate-messages.sql)
Real-time chat messages within coffee chat conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `coffee_chat_id` | UUID (FK) | References `coffee_chats(id)` |
| `sender_id` | UUID (FK) | References `auth.users(id)` |
| `sender_name` | TEXT | Display name of sender |
| `sender_avatar_url` | TEXT | Avatar URL of sender |
| `content` | TEXT | Message content |
| `read_at` | TIMESTAMPTZ | When the message was read (NULL = unread) |
| `created_at` | TIMESTAMPTZ | Timestamp |

#### `saved_matches` (migrate-saved-matches.sql)
Bookmarked/shortlisted roles and candidates.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK) | References `auth.users(id)` |
| `target_type` | TEXT | `'role'` or `'candidate'` |
| `role_id`, `employer_id`, `candidate_id` | UUID (FK) | Optional references to saved targets |
| `match_score` | INTEGER | Compatibility score at time of save |
| `notes` | TEXT | User notes about the saved match |
| `status` | TEXT | One of `'saved'`, `'pending'`, `'connected'` |

#### `activity_posts` (migrate-activity-posts.sql)
User posts for the network hub feed.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK) | References `profiles(id)` |
| `image_url` | TEXT | Primary image URL |
| `caption` | TEXT | Post caption |
| `hobby_tags` | TEXT[] | Array of hobby/personality tags |
| `created_at`, `updated_at` | TIMESTAMPTZ | Timestamps |

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

### Connections
- Users can view connections where they are the sender or receiver.
- Users can create connections where they are the sender.
- Both participants can update connections (accept/reject).

### Connection Meet Invites
- Accessible via connection ownership — users can view, create, and update meet invites for connections they participate in.

### Messages
- Only participants of the coffee chat can read and write messages.
- Verified via a join to `coffee_chats` checking both `candidate_id` and `employer_id`.

### Saved Matches
- Users can only view, create, update, and delete their own saved matches.

### Activity Posts
- All authenticated users can view posts.
- Users can create, update, and delete their own posts.

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

- **Frontend** — Uses the Supabase JavaScript client (`@supabase/supabase-js`) for authentication, profile management, direct database queries (subject to RLS), and realtime subscriptions (messages, connections, coffee chats). Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Backend** — Uses `SUPABASE_JWT_SECRET` to verify JWT tokens on protected routes. Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side reads and writes that bypass RLS (needed for cross-role data access in the matching engine).

## Notes

- The core tables are defined in `schema.sql`. Additional tables (connections, messages, saved_matches, activity_posts) are created via separate migration files and must be run after the core schema.
- Stripe subscription data is stored as columns on the `profiles` table rather than in a separate table.
- Auto-created triggers ensure `updated_at` timestamps are refreshed on every row update.
- A trigger on `auth.users` automatically creates a `profiles` row and `user_settings` row when a new user signs up. If the user provides a role during email signup, the corresponding `candidates` or `employers` row is also created automatically.
- Several tables use denormalized name columns (e.g., `candidate_name` on `coffee_chats`, `sender_name` on `connections`) to avoid cross-table JOINs that conflict with RLS policies.
