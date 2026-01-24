"""
Luna CultureSync - Database setup and management
"""

import sqlite3
import os
from typing import Optional, List, Dict, Any
from datetime import datetime

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "database.db")


def get_connection() -> sqlite3.Connection:
    """Get a database connection with row factory for dict-like access."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize the database with required tables."""
    conn = get_connection()
    cursor = conn.cursor()

    # Create candidates table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create assessment_responses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_id INTEGER,
            question_id INTEGER,
            answer TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (candidate_id) REFERENCES candidates(id)
        )
    """)

    # Create scores table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_id INTEGER UNIQUE,
            culture_fit_score INTEGER,
            work_style_score INTEGER,
            communication_score INTEGER,
            values_score INTEGER,
            top_traits TEXT,
            FOREIGN KEY (candidate_id) REFERENCES candidates(id)
        )
    """)

    # Create feedback table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_type TEXT,
            message TEXT,
            page TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create assessment_sessions table to track progress
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_id INTEGER UNIQUE,
            current_question INTEGER DEFAULT 1,
            status TEXT DEFAULT 'in_progress',
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (candidate_id) REFERENCES candidates(id)
        )
    """)

    conn.commit()
    conn.close()
    print("database initialized successfully")


# Candidate operations
def create_candidate(name: str, email: str) -> Optional[int]:
    """Create a new candidate and return their ID."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO candidates (name, email) VALUES (?, ?)",
            (name, email)
        )
        conn.commit()
        candidate_id = cursor.lastrowid

        # Create assessment session
        cursor.execute(
            "INSERT INTO assessment_sessions (candidate_id) VALUES (?)",
            (candidate_id,)
        )
        conn.commit()
        return candidate_id
    except sqlite3.IntegrityError:
        # Email already exists, get existing candidate
        cursor.execute("SELECT id FROM candidates WHERE email = ?", (email,))
        row = cursor.fetchone()
        return row["id"] if row else None
    finally:
        conn.close()


def get_candidate(candidate_id: int) -> Optional[Dict[str, Any]]:
    """Get candidate by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_candidate_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get candidate by email."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM candidates WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_candidates_with_scores() -> List[Dict[str, Any]]:
    """Get all candidates with their scores."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            c.id, c.name, c.email, c.created_at,
            s.culture_fit_score, s.work_style_score,
            s.communication_score, s.values_score, s.top_traits,
            sess.status as assessment_status
        FROM candidates c
        LEFT JOIN scores s ON c.id = s.candidate_id
        LEFT JOIN assessment_sessions sess ON c.id = sess.candidate_id
        ORDER BY s.culture_fit_score DESC NULLS LAST
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


# Assessment operations
def save_assessment_response(candidate_id: int, question_id: int, answer: str) -> bool:
    """Save an assessment response."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Check if response already exists
        cursor.execute(
            "SELECT id FROM assessment_responses WHERE candidate_id = ? AND question_id = ?",
            (candidate_id, question_id)
        )
        existing = cursor.fetchone()

        if existing:
            cursor.execute(
                "UPDATE assessment_responses SET answer = ?, timestamp = ? WHERE id = ?",
                (answer, datetime.now(), existing["id"])
            )
        else:
            cursor.execute(
                "INSERT INTO assessment_responses (candidate_id, question_id, answer) VALUES (?, ?, ?)",
                (candidate_id, question_id, answer)
            )

        # Update session progress
        cursor.execute(
            "UPDATE assessment_sessions SET current_question = ? WHERE candidate_id = ?",
            (question_id + 1, candidate_id)
        )

        conn.commit()
        return True
    except Exception as e:
        print(f"error saving response: {e}")
        return False
    finally:
        conn.close()


def get_assessment_responses(candidate_id: int) -> List[Dict[str, Any]]:
    """Get all assessment responses for a candidate."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM assessment_responses WHERE candidate_id = ? ORDER BY question_id",
        (candidate_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_assessment_session(candidate_id: int) -> Optional[Dict[str, Any]]:
    """Get assessment session for a candidate."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM assessment_sessions WHERE candidate_id = ?",
        (candidate_id,)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def complete_assessment(candidate_id: int) -> bool:
    """Mark assessment as complete."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE assessment_sessions SET status = 'completed', completed_at = ? WHERE candidate_id = ?",
            (datetime.now(), candidate_id)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"error completing assessment: {e}")
        return False
    finally:
        conn.close()


# Score operations
def save_scores(
    candidate_id: int,
    culture_fit_score: int,
    work_style_score: int,
    communication_score: int,
    values_score: int,
    top_traits: str
) -> bool:
    """Save or update candidate scores."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO scores
               (candidate_id, culture_fit_score, work_style_score, communication_score, values_score, top_traits)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(candidate_id) DO UPDATE SET
               culture_fit_score = excluded.culture_fit_score,
               work_style_score = excluded.work_style_score,
               communication_score = excluded.communication_score,
               values_score = excluded.values_score,
               top_traits = excluded.top_traits
            """,
            (candidate_id, culture_fit_score, work_style_score, communication_score, values_score, top_traits)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"error saving scores: {e}")
        return False
    finally:
        conn.close()


def get_scores(candidate_id: int) -> Optional[Dict[str, Any]]:
    """Get scores for a candidate."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scores WHERE candidate_id = ?", (candidate_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


# Feedback operations
def save_feedback(message: str, user_type: str = "candidate", page: str = "unknown") -> bool:
    """Save user feedback."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO feedback (message, user_type, page) VALUES (?, ?, ?)",
            (message, user_type, page)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"error saving feedback: {e}")
        return False
    finally:
        conn.close()


def get_all_feedback() -> List[Dict[str, Any]]:
    """Get all feedback entries."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM feedback ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


# Initialize database on module import
if not os.path.exists(DATABASE_PATH):
    init_database()
