# luna culturesync

a coffee chat matching platform that helps startups find candidates who align with their culture and values.

## what it does

luna culturesync helps startups find the right culture fit through:

1. **culture assessment** - candidates answer 10 questions about work style, communication preferences, and values
2. **personality matching** - our scoring algorithm identifies culture traits and compatibility
3. **coffee chat scheduling** - easily connect with candidates for informal conversations

## features

- **10-question assessment** covering work style, communication, and values
- **culture fit scoring** with detailed dimension breakdowns
- **candidate dashboard** with search, sort, and filter capabilities
- **one-click coffee chat** scheduling via email
- **feedback collection** to continuously improve the platform
- **beautiful theming** with multiple color schemes

## tech stack

| layer | technology |
|-------|------------|
| desktop runtime | tauri 2.0 (rust) |
| frontend | react 18, typescript |
| styling | tailwind css |
| icons | lucide-react |
| backend | python 3.11+, fastapi |
| database | sqlite |
| auth | supabase (optional) |

## quick start

### 1. backend setup

```bash
cd src/backend

# create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # windows: venv\Scripts\activate

# install dependencies
pip install fastapi uvicorn python-dotenv pydantic

# run backend
python main.py
```

the api runs at http://127.0.0.1:8000

### 2. frontend setup

```bash
cd src/frontend

# install dependencies
npm install

# run development server
npm run tauri dev
```

### 3. use culturesync

1. click "take the assessment" on the welcome screen
2. enter your name and email
3. answer 10 questions about your work style and values
4. view your culture fit results
5. browse the candidate dashboard to find matches
6. schedule coffee chats with potential fits

## project structure

```
luma-desktop-agent/
├── src/
│   ├── frontend/           # tauri + react app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── AssessmentFlow.tsx   # assessment questions
│   │   │   │   ├── CandidateDashboard.tsx # candidate list
│   │   │   │   ├── FeedbackWidget.tsx   # feedback collection
│   │   │   │   ├── WelcomeScreen.tsx    # landing page
│   │   │   │   └── ChatInterface.tsx    # main layout
│   │   │   ├── utils/
│   │   │   │   └── api.ts              # backend api client
│   │   │   └── contexts/
│   │   │       ├── ThemeContext.tsx    # theme management
│   │   │       └── AuthContext.tsx     # authentication
│   │   └── src-tauri/      # rust backend for tauri
│   └── backend/            # python api server
│       ├── main.py         # fastapi endpoints
│       ├── database.py     # sqlite operations
│       ├── questions.py    # assessment questions
│       └── scoring.py      # culture fit algorithm
├── docs/                   # documentation
└── package.json            # root workspace config
```

## api endpoints

| method | endpoint | description |
|--------|----------|-------------|
| POST | `/api/assessment/start` | start new assessment |
| POST | `/api/assessment/answer` | submit question answer |
| GET | `/api/assessment/results/{id}` | get assessment results |
| GET | `/api/candidates` | list all candidates |
| POST | `/api/feedback` | submit feedback |

## assessment categories

the assessment measures three core dimensions:

1. **work style** - how you prefer to work (structured vs flexible, solo vs collaborative)
2. **communication** - how you prefer to communicate and receive feedback
3. **values** - what matters most to you in a workplace

## scoring algorithm

the culture fit score (0-100) is calculated from:
- work style compatibility (33%)
- communication alignment (33%)
- values match (33%)

top traits are identified based on the strongest response patterns.

## themes

culturesync includes multiple themes:
- minimal light / minimal dark
- lavender / rose / mint
- mocha / ocean / sunset

access via the settings panel.

## license

mit

## author

nakul patel
