# amber

a culture-first job matching platform that connects candidates with companies based on personality fit and shared values.

## what it does

amber helps candidates and employers find the right culture fit through:

1. **personality assessment** - candidates complete a 15-minute Big Five personality assessment
2. **culture matching** - employers define their culture, and our algorithm calculates compatibility scores
3. **smart job matches** - candidates see personalized job recommendations ranked by culture fit
4. **coffee chats** - connect directly with hiring teams for informal conversations

## features

### for candidates
- 15-minute personality assessment (Big Five + creative scenarios)
- **ember agent** - ai mascot that analyzes personality compatibility with employers
- personalized job recommendations with match scores
- culture compatibility breakdown before applying
- one-click coffee chat scheduling with employers

### for employers
- culture quiz to define company values
- create roles with personality requirements
- **ember agent** - ai-ranked candidates by culture and personality fit
- send chat invitations to top matches

## tech stack

| layer | technology |
|-------|------------|
| frontend | react 19, typescript, vite |
| styling | tailwind css |
| icons | lucide-react |
| state | react context, zustand |
| backend | python 3.11+, fastapi |
| database | supabase (postgresql) |
| auth | supabase auth (email, google, github) |
| storage | supabase storage |

## quick start

### 1. supabase setup

1. create a new project at [supabase.com](https://supabase.com)
2. run the schema from `supabase/schema.sql` in the sql editor
3. run the rls policies from `supabase/rls-policies.sql`
4. enable auth providers (email, google, github) in authentication settings
5. copy your project url and anon key

### 2. environment setup

```bash
# frontend (.env)
cd src/frontend
cp .env.example .env
# add your supabase credentials:
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# backend (.env)
cd ../backend
cp .env.example .env
# add your openai api key:
# OPENAI_API_KEY=your-api-key
```

### 3. backend setup

```bash
cd src/backend

# create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # windows: venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# run backend
python main.py
```

the api runs at http://127.0.0.1:8000

### 4. frontend setup

```bash
cd src/frontend

# install dependencies
npm install

# run development server
npm run dev
```

the app runs at http://localhost:5173

## project structure

```
amber/
├── src/
│   ├── frontend/                # react web app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/          # reusable ui components
│   │   │   │   ├── auth/        # authentication pages
│   │   │   │   ├── layout/      # navbar, app layout
│   │   │   │   ├── landing/     # welcome screen, animations
│   │   │   │   ├── candidate/   # assessment, insights, matches
│   │   │   │   ├── employer/    # culture quiz, roles, candidates
│   │   │   │   ├── dashboard/   # candidate & employer dashboards
│   │   │   │   ├── ember/       # ember ai agent ui
│   │   │   │   └── settings/    # settings page sections
│   │   │   ├── contexts/        # react context providers
│   │   │   ├── hooks/           # custom hooks
│   │   │   ├── lib/             # supabase client, engines
│   │   │   ├── types/           # typescript definitions
│   │   │   ├── utils/           # helpers and constants
│   │   │   ├── data/            # assessment questions data
│   │   │   └── styles/          # global css
│   │   └── package.json
│   └── backend/                 # python api server
│       ├── main.py              # fastapi entry point & routes
│       ├── agent/               # ember personality matching agent
│       │   └── ember_agent.py
│       ├── auth/                # jwt authentication
│       │   ├── supabase_auth.py
│       │   └── middleware.py
│       ├── db/                  # database layer
│       │   ├── database.py      # local sqlite operations
│       │   └── supabase_client.py  # supabase api client
│       ├── engine/              # scoring & compatibility
│       │   ├── compatibility.py # ocean-based matching
│       │   ├── scoring.py       # assessment scoring
│       │   └── questions.py     # assessment questions
│       └── scripts/             # seed & utility scripts
│           ├── seed_ember_data.py
│           └── seed_arsh_nakul.py
├── supabase/                    # database schema & seeds
│   ├── schema.sql
│   ├── rls-policies.sql
│   └── seed-*.sql
└── tests/                       # test suites
    ├── unit/
    ├── integration/
    └── e2e/
```

## design system

amber uses a warm, professional color palette inspired by claude:

| color | hex | usage |
|-------|-----|-------|
| amber-600 | #D97706 | primary accent, buttons, links |
| stone-500 | #78716C | muted text, secondary elements |
| cream-100 | #F5F3EF | light mode background |
| stone-900 | #1C1917 | dark mode background |

### themes

- **amber-light** - cream background with warm accents
- **amber-dark** - stone background with amber highlights

access themes via settings → appearance.

## ui components

the design system includes reusable components:

- `Button` - primary, secondary, outline, ghost, danger variants
- `Input` - with label, error states, icons
- `Card` - container with padding and border
- `Modal` - dialog with header and footer
- `Toast` - success, error, info notifications
- `Avatar` - user avatars with fallback
- `Badge` - status indicators
- `Dropdown` - accessible dropdown menus
- `Skeleton` - loading placeholders
- `Spinner` - loading indicators

all components use css variables for consistent theming.

## authentication

amber uses supabase auth with:

- email/password signup and login
- google oauth
- github oauth
- password reset via email
- role-based access (candidate vs employer)
- protected routes

## database

### tables

- `profiles` - extends auth.users with role and avatar
- `candidates` - big five scores, work preferences
- `employers` - company info, culture values
- `roles` - job listings with personality requirements
- `applications` - match scores, behavioral answers
- `coffee_chats` - scheduling and feedback
- `assessments` - question responses
- `feedback` - bug reports, feature requests
- `user_settings` - notifications, privacy, theme

### security

row level security (rls) ensures:
- users can only access their own data
- employers see candidates with completed assessments
- candidates see active job listings
- applications visible to both parties

## api endpoints

| method | endpoint | auth | description |
|--------|----------|------|-------------|
| GET | `/` | no | health check |
| GET | `/health` | no | detailed health status |
| GET | `/api/me` | yes | current user info |
| POST | `/api/assessment/start` | no | start new assessment |
| POST | `/api/assessment/answer` | no | submit question answer |
| GET | `/api/assessment/results/{id}` | no | get assessment results |
| GET | `/api/candidates` | yes* | list candidates (employer only) |
| GET | `/api/candidates/{id}` | yes* | get candidate details (employer only) |
| GET | `/api/ember/candidate-matches/{id}` | no | ember: ranked role matches for a candidate |
| GET | `/api/ember/employer-matches/{id}` | no | ember: ranked candidate matches for an employer |
| GET | `/api/ember/analysis` | no | ember: detailed candidate-employer pair analysis |
| POST | `/api/feedback` | no | submit feedback |

*requires `SUPABASE_JWT_SECRET` to be configured

## backend authentication

the backend uses jwt tokens from supabase auth. to enable:

1. get your jwt secret from supabase dashboard (settings > api > jwt secret)
2. set `SUPABASE_JWT_SECRET` in your backend `.env`
3. protected endpoints will require `Authorization: Bearer <token>` header

when auth is not configured, endpoints work without authentication (development mode).

## roadmap

### phase 1 (complete)
- [x] design system and ui components
- [x] authentication (email, oauth)
- [x] settings page
- [x] backend auth middleware

### phase 2 (complete)
- [x] candidate assessment flow
- [x] employer culture quiz
- [x] candidate & employer dashboards
- [x] personality insights
- [x] compatibility scoring engine
- [x] ember agent (personality matching ai)

### phase 3
- [ ] job listings and search
- [ ] application system
- [ ] roles table & role management

### phase 4
- [ ] coffee chat scheduling
- [ ] messaging system
- [ ] notifications

## development

### running tests

```bash
# frontend
cd src/frontend
npm run lint

# backend
cd src/backend
pytest
```

### building for production

```bash
cd src/frontend
npm run build
```

output is in `src/frontend/dist/`.

## license

mit

## author

nakul patel
