"""
luna backend - main entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any
import uvicorn
import platform
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from utils.executor import execute_command as run_command, check_tool_installed

# load environment variables
load_dotenv()

# initialize openai client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(
    title="luna agent api",
    description="local-first ai agent for development workflows",
    version="0.1.0"
)

# enable cors for tauri frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1420",
        "http://tauri.localhost",
        "tauri://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExecuteStep(BaseModel):
    id: int
    description: str
    command: str
    risk: Literal["safe", "moderate", "dangerous"]
    status: Optional[Literal["pending", "running", "completed", "failed"]] = "pending"


class ExecuteRequest(BaseModel):
    command: str
    context: Optional[dict] = None


class ExecuteResponse(BaseModel):
    task_id: str
    steps: List[ExecuteStep]
    requires_confirmation: bool
    estimated_time: Optional[str] = None


class ExecuteAllRequest(BaseModel):
    task_id: str
    steps: List[Dict[str, Any]]


class StepResult(BaseModel):
    step_id: int
    status: Literal["completed", "failed"]
    output: str
    error: Optional[str] = None


class ExecuteAllResponse(BaseModel):
    task_id: str
    results: List[StepResult]
    overall_status: Literal["completed", "failed", "partial"]


def parse_command_with_llm(command: str, os_type: str) -> ExecuteResponse:
    """
    use llm to parse any command and generate execution steps
    """
    
    # detect available package managers
    available_package_managers = []
    if check_tool_installed("brew"):
        available_package_managers.append("homebrew")
    if check_tool_installed("apt-get"):
        available_package_managers.append("apt")
    if check_tool_installed("choco"):
        available_package_managers.append("chocolatey")
    if check_tool_installed("npm"):
        available_package_managers.append("npm")
    if check_tool_installed("pip"):
        available_package_managers.append("pip")
    
    system_prompt = f"""you are luna, an AI agent that generates shell commands for development workflows on macOS/Linux/Windows.

CONTEXT:
- os: {os_type}
- package managers: {', '.join(available_package_managers) if available_package_managers else 'none detected'}
- sudo is handled automatically via native dialog (no terminal prompts)
- all commands run non-interactively (no user input required during execution)

TASK: convert the user request into executable shell commands.

CRITICAL RULE - ONE COMMAND PER STEP:
- Each step must contain exactly ONE command
- DO NOT chain commands with && or || in a single step
- Split into separate steps instead

EXAMPLE - CORRECT:
{{"id": 1, "command": "brew install --cask figma", "description": "install figma"}}
{{"id": 2, "command": "brew list --cask | grep figma", "description": "verify installation"}}

EXAMPLE - WRONG (DO NOT DO THIS):
{{"id": 1, "command": "brew install --cask figma && brew list --cask | grep figma", ...}}

CAPABILITIES:
1. INSTALL APPS: brew install --cask for GUI apps
2. UNINSTALL APPS: brew uninstall --cask app-name
3. SETUP ENVIRONMENTS: python3 -m venv, pip install, npm install
4. CHECK STATUS: which, --version, brew list

RULES:
1. ONE command per step (no && chaining)
2. risk levels: "safe" (read-only), "moderate" (installs), "dangerous" (sudo/delete)
3. verify installations with: brew list --cask | grep appname
4. use appropriate package manager for the os

MACOS CASK NAMES:
figma, slack, discord, spotify, google-chrome, visual-studio-code, cursor, notion, zoom, docker, postman, iterm2, onedrive, microsoft-teams, microsoft-outlook, microsoft-word, microsoft-excel, whatsapp, telegram, signal, arc, firefox, brave-browser, raycast, rectangle, alfred

respond with JSON only:
{{
  "task_id": "unique_id",
  "steps": [
    {{"id": 1, "description": "what this does", "command": "single shell command", "risk": "safe|moderate|dangerous"}}
  ],
  "requires_confirmation": true,
  "estimated_time": "time estimate"
}}"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # faster and cheaper
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": command}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # parse the response
        response_text = response.choices[0].message.content.strip()
        
        # remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        parsed = json.loads(response_text)
        
        # convert to our response model
        steps = [
            ExecuteStep(
                id=step["id"],
                description=step["description"],
                command=step["command"],
                risk=step["risk"]
            )
            for step in parsed["steps"]
        ]
        
        return ExecuteResponse(
            task_id=parsed.get("task_id", f"task_{hash(command)}"),
            steps=steps,
            requires_confirmation=parsed.get("requires_confirmation", True),
            estimated_time=parsed.get("estimated_time", "unknown")
        )
        
    except Exception as e:
        print(f"❌ llm parsing failed: {e}")
        # fallback to hardcoded parser
        return parse_command_hardcoded(command, os_type)


def parse_command_hardcoded(command: str, os_type: str) -> ExecuteResponse:
    """
    fallback hardcoded parser with improved verification
    """
    command_lower = command.lower().strip()

    # common macOS apps mapping (app keyword -> cask name)
    macos_apps = {
        "chrome": ("google-chrome", "Google Chrome"),
        "google chrome": ("google-chrome", "Google Chrome"),
        "vscode": ("visual-studio-code", "Visual Studio Code"),
        "visual studio code": ("visual-studio-code", "Visual Studio Code"),
        "vs code": ("visual-studio-code", "Visual Studio Code"),
        "slack": ("slack", "Slack"),
        "figma": ("figma", "Figma"),
        "discord": ("discord", "Discord"),
        "spotify": ("spotify", "Spotify"),
        "notion": ("notion", "Notion"),
        "zoom": ("zoom", "Zoom"),
        "cursor": ("cursor", "Cursor"),
        "docker": ("docker", "Docker"),
        "postman": ("postman", "Postman"),
        "iterm": ("iterm2", "iTerm2"),
        "iterm2": ("iterm2", "iTerm2"),
        "onedrive": ("onedrive", "OneDrive"),
        "microsoft onedrive": ("onedrive", "OneDrive"),
        "teams": ("microsoft-teams", "Microsoft Teams"),
        "microsoft teams": ("microsoft-teams", "Microsoft Teams"),
        "outlook": ("microsoft-outlook", "Microsoft Outlook"),
        "microsoft outlook": ("microsoft-outlook", "Microsoft Outlook"),
        "word": ("microsoft-word", "Microsoft Word"),
        "microsoft word": ("microsoft-word", "Microsoft Word"),
        "excel": ("microsoft-excel", "Microsoft Excel"),
        "microsoft excel": ("microsoft-excel", "Microsoft Excel"),
        "whatsapp": ("whatsapp", "WhatsApp"),
        "telegram": ("telegram", "Telegram"),
        "signal": ("signal", "Signal"),
        "arc": ("arc", "Arc"),
        "firefox": ("firefox", "Firefox"),
        "brave": ("brave-browser", "Brave"),
        "raycast": ("raycast", "Raycast"),
        "rectangle": ("rectangle", "Rectangle"),
        "alfred": ("alfred", "Alfred"),
        "1password": ("1password", "1Password"),
        "bitwarden": ("bitwarden", "Bitwarden"),
        "vlc": ("vlc", "VLC"),
        "obs": ("obs", "OBS"),
        "gimp": ("gimp", "GIMP"),
        "inkscape": ("inkscape", "Inkscape"),
    }

    # detect install commands
    if "install" in command_lower:
        for app_key, (cask_name, app_display) in macos_apps.items():
            if app_key in command_lower:
                if os_type == "darwin":
                    return ExecuteResponse(
                        task_id=f"task_install_{cask_name}",
                        steps=[
                            ExecuteStep(
                                id=1,
                                description="Check if Homebrew is installed",
                                command="command -v brew",
                                risk="safe"
                            ),
                            ExecuteStep(
                                id=2,
                                description=f"Install {app_display}",
                                command=f"brew install --cask {cask_name}",
                                risk="moderate"
                            ),
                            ExecuteStep(
                                id=3,
                                description="Verify installation",
                                command=f"brew list --cask | grep -q '{cask_name}' && echo '✓ {app_display} installed successfully' || echo '✗ Installation verification failed'",
                                risk="safe"
                            )
                        ],
                        requires_confirmation=True,
                        estimated_time="2-3 minutes"
                    )

    # detect uninstall commands
    if "uninstall" in command_lower or "remove" in command_lower:
        for app_key, (cask_name, app_display) in macos_apps.items():
            if app_key in command_lower:
                if os_type == "darwin":
                    return ExecuteResponse(
                        task_id=f"task_uninstall_{cask_name}",
                        steps=[
                            ExecuteStep(
                                id=1,
                                description=f"Check if {app_display} is installed",
                                command=f"brew list --cask | grep -q '{cask_name}' && echo 'Found' || echo 'Not installed via Homebrew'",
                                risk="safe"
                            ),
                            ExecuteStep(
                                id=2,
                                description=f"Uninstall {app_display}",
                                command=f"brew uninstall --cask {cask_name}",
                                risk="dangerous"
                            ),
                            ExecuteStep(
                                id=3,
                                description="Verify removal",
                                command=f"brew list --cask | grep -q '{cask_name}' && echo '✗ Still installed' || echo '✓ {app_display} removed successfully'",
                                risk="safe"
                            )
                        ],
                        requires_confirmation=True,
                        estimated_time="1-2 minutes"
                    )

    # detect "check docker" command
    if "check" in command_lower and "docker" in command_lower:
        return ExecuteResponse(
            task_id="task_003",
            steps=[
                ExecuteStep(
                    id=1,
                    description="Check if Docker is installed",
                    command="docker --version",
                    risk="safe"
                ),
                ExecuteStep(
                    id=2,
                    description="Check if Docker daemon is running",
                    command="docker ps",
                    risk="safe"
                ),
                ExecuteStep(
                    id=3,
                    description="Show Docker info",
                    command="docker info",
                    risk="safe"
                )
            ],
            requires_confirmation=False,
            estimated_time="5 seconds"
        )

    # detect python environment setup
    if "python" in command_lower and ("environment" in command_lower or "env" in command_lower or "setup" in command_lower):
        return ExecuteResponse(
            task_id="task_python_env",
            steps=[
                ExecuteStep(
                    id=1,
                    description="Check Python installation",
                    command="python3 --version",
                    risk="safe"
                ),
                ExecuteStep(
                    id=2,
                    description="Create virtual environment",
                    command="python3 -m venv venv",
                    risk="moderate"
                ),
                ExecuteStep(
                    id=3,
                    description="Verify virtual environment created",
                    command="test -d venv && echo '✓ Virtual environment created' || echo '✗ Failed to create venv'",
                    risk="safe"
                )
            ],
            requires_confirmation=True,
            estimated_time="30 seconds"
        )

    # detect "which" or similar check commands
    if "which" in command_lower or "where" in command_lower:
        tool = command_lower.split()[-1] if len(command_lower.split()) > 1 else "unknown"
        return ExecuteResponse(
            task_id="task_check",
            steps=[
                ExecuteStep(
                    id=1,
                    description=f"Check if {tool} is installed",
                    command=command,
                    risk="safe"
                )
            ],
            requires_confirmation=False,
            estimated_time="1 second"
        )

    # default: command not recognized
    return ExecuteResponse(
        task_id="task_unknown",
        steps=[
            ExecuteStep(
                id=1,
                description=f"Command not recognized: {command}",
                command="echo 'Unknown command - configure OPENAI_API_KEY in .env for natural language parsing'",
                risk="safe",
                status="failed"
            )
        ],
        requires_confirmation=False,
        estimated_time="0 seconds"
    )


def parse_command(command: str) -> ExecuteResponse:
    """
    main entry point - try llm first, fallback to hardcoded
    """
    os_type = platform.system().lower()
    
    # check if openai api key is available
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here":
        try:
            print(f"🤖 parsing with llm: {command}")
            return parse_command_with_llm(command, os_type)
        except Exception as e:
            print(f"⚠️  llm failed, using fallback: {e}")
            return parse_command_hardcoded(command, os_type)
    else:
        print("⚠️  no openai api key, using hardcoded parser")
        return parse_command_hardcoded(command, os_type)


@app.get("/")
async def root():
    """root endpoint - health check"""
    return {
        "status": "ok",
        "message": "luna agent api",
        "version": "0.1.0"
    }


@app.get("/health")
async def health():
    """detailed health check"""
    has_api_key = bool(os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "your_openai_api_key_here")
    
    return {
        "status": "healthy",
        "services": {
            "api": "ok",
            "os": platform.system(),
            "python": platform.python_version(),
            "llm": "enabled" if has_api_key else "disabled (using fallback parser)"
        }
    }


@app.post("/api/execute", response_model=ExecuteResponse)
async def execute_command_endpoint(request: ExecuteRequest):
    """
    parse and plan command execution
    """
    try:
        response = parse_command(request.command)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/execute/run", response_model=ExecuteAllResponse)
async def execute_all_steps(request: ExecuteAllRequest):
    """
    execute all steps of a task
    """
    results = []
    overall_success = True
    
    for step in request.steps:
        command = step.get("command")
        step_id = step.get("id")
        
        print(f"🔄 executing step {step_id}: {command}")
        
        # execute the command (sudo is handled seamlessly via macOS dialog if needed)
        success, stdout, stderr = run_command(command, timeout=300)
        
        print(f"{'✅' if success else '❌'} step {step_id}: {'completed' if success else 'failed'}")
        if stdout:
            print(f"   stdout: {stdout[:200]}...")
        if stderr:
            print(f"   stderr: {stderr[:200]}...")
        
        results.append(
            StepResult(
                step_id=step_id,
                status="completed" if success else "failed",
                output=stdout,
                error=stderr if not success else None
            )
        )
        
        # stop on first failure
        if not success:
            overall_success = False
            break
    
    # determine overall status
    if overall_success:
        overall_status = "completed"
    elif len(results) == 0:
        overall_status = "failed"
    elif len(results) < len(request.steps):
        overall_status = "partial"
    else:
        overall_status = "failed"
    
    return ExecuteAllResponse(
        task_id=request.task_id,
        results=results,
        overall_status=overall_status
    )


if __name__ == "__main__":
    print("🌙 starting luna backend...")
    print("📍 api docs: http://127.0.0.1:8000/docs")
    print(f"💻 os: {platform.system()}")
    
    # check api key status
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here":
        print("🤖 llm: enabled (gpt-4o-mini)")
    else:
        print("⚠️  llm: disabled (add OPENAI_API_KEY to .env)")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_excludes=["venv/*", "*.pyc", "__pycache__", ".pytest_cache"]
    )