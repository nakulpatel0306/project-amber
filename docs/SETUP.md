# setup guide

this guide covers installing and running luna culturesync for development.

## prerequisites

### required

| tool | version | check command |
|------|---------|---------------|
| node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| rust | latest stable | `cargo --version` |
| python | 3.11+ | `python3 --version` |

### installing prerequisites

**rust:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**node.js (via homebrew):**
```bash
brew install node
```

**python 3.11+ (via homebrew):**
```bash
brew install python@3.11
```

## installation

### 1. clone the repository

```bash
git clone https://github.com/yourusername/luma-desktop-agent.git
cd luma-desktop-agent
```

### 2. backend setup

```bash
cd src/backend

# create virtual environment
python3 -m venv venv

# activate virtual environment
source venv/bin/activate  # macos/linux
# or: venv\Scripts\activate  # windows

# install dependencies
pip install fastapi uvicorn python-dotenv pydantic
```

### 3. frontend setup

```bash
cd ../frontend  # or cd src/frontend from root

# install node dependencies
npm install
```

## running culturesync

### development mode

**terminal 1 - backend:**
```bash
cd src/backend
source venv/bin/activate
python main.py
```

you should see:
```
☕ starting luna culturesync backend...
📍 api docs: http://127.0.0.1:8000/docs
💾 database: culturesync.db
```

**terminal 2 - frontend:**
```bash
cd src/frontend
npm run tauri dev
```

this compiles the rust code and opens the tauri window.

### using the root package.json

from the project root, you can run both with:

```bash
npm run dev  # runs backend and frontend concurrently
```

requires the `concurrently` package (already in devDependencies).

## verifying installation

### backend health check

```bash
curl http://localhost:8000/health
```

expected response:
```json
{
  "status": "healthy",
  "services": {
    "api": "ok",
    "database": "ok"
  }
}
```

### frontend verification

1. the tauri window should open automatically
2. you should see the luna culturesync welcome screen
3. click "take the assessment" to start
4. enter a name and email, then answer the questions

## database

culturesync uses sqlite for data storage. the database file is created automatically:

```
src/backend/culturesync.db
```

### database tables

| table | purpose |
|-------|---------|
| candidates | stores candidate information |
| assessment_responses | individual question answers |
| scores | calculated culture fit scores |
| feedback | user feedback submissions |

### resetting the database

to start fresh, delete the database file:

```bash
rm src/backend/culturesync.db
```

the tables will be recreated on next backend startup.

## configuration

### backend configuration

the backend runs on port 8000 by default. to change:

edit `src/backend/main.py`:
```python
uvicorn.run(
    "main:app",
    host="127.0.0.1",
    port=8000,  # change this
    reload=True
)
```

### frontend configuration

the api base url is defined in `src/frontend/src/utils/api.ts`:

```typescript
const API_BASE_URL = "http://localhost:8000";
```

change this if your backend runs on a different port.

### supabase auth (optional)

for authentication features, configure supabase:

1. create a project at https://supabase.com
2. get your project url and anon key
3. create `src/frontend/.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## troubleshooting

### backend won't start

**"module not found" error:**
```bash
# make sure venv is activated
source venv/bin/activate

# reinstall dependencies
pip install fastapi uvicorn python-dotenv pydantic
```

**port already in use:**
```bash
# find process using port 8000
lsof -i :8000

# kill it
kill -9 <PID>
```

**database errors:**
```bash
# reset the database
rm src/backend/culturesync.db
python main.py  # recreates tables
```

### frontend won't compile

**rust toolchain issues:**
```bash
rustup update stable
rustup default stable
```

**node modules issues:**
```bash
cd src/frontend
rm -rf node_modules package-lock.json
npm install
```

### connection refused

if the frontend shows "connection error":

1. check that backend is running (`python main.py`)
2. verify backend is on port 8000
3. check cors settings in `main.py` allow `http://localhost:1420`

## development tools

### api documentation

with the backend running, visit:
- http://localhost:8000/docs - swagger ui
- http://localhost:8000/redoc - redoc interface

### hot reload

- **backend:** uvicorn watches for changes automatically
- **frontend:** vite provides hot module replacement

### viewing database

use any sqlite client to inspect the database:

```bash
# command line
sqlite3 src/backend/culturesync.db
.tables
SELECT * FROM candidates;

# or use a gui tool like DB Browser for SQLite
```
