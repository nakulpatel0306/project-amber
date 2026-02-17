"""
Supabase Client for Backend Operations

Provides database access functions for all Supabase tables: candidates, employers,
roles, applications, and coffee chats. Uses the service role key to bypass RLS
policies, which is necessary for cross-role data access in the matching engine
(e.g., employers viewing candidate personality scores).

The client is lazily initialized on first use. If Supabase credentials are not
configured, functions return None or empty lists instead of raising errors,
allowing the app to run in a degraded mode during local development.
"""

import os
from typing import Optional, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
# Service role key bypasses RLS — only use server-side, never expose to the client
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

# Lazy initialization: the client is created on first call to get_supabase()
_client = None


def get_supabase():
    """Get or create Supabase client."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            return None
        try:
            from supabase import create_client
            _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except ImportError:
            print("Warning: supabase-py not installed. Run: pip install supabase")
            return None
        except Exception as e:
            print(f"Warning: Could not connect to Supabase: {e}")
            return None
    return _client


def get_candidate_by_id(candidate_id: str) -> Optional[dict]:
    """Get candidate data by candidate ID."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('candidates').select('*, profiles!inner(full_name, email)').eq('id', candidate_id).single().execute()
        return result.data
    except Exception as e:
        print(f"Error fetching candidate: {e}")
        return None


def get_candidate_by_user_id(user_id: str) -> Optional[dict]:
    """Get candidate data by user ID."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('candidates').select('*, profiles!inner(full_name, email)').eq('user_id', user_id).single().execute()
        return result.data
    except Exception as e:
        print(f"Error fetching candidate: {e}")
        return None


def get_employer_by_id(employer_id: str) -> Optional[dict]:
    """Get employer data by employer ID."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('employers').select('*').eq('id', employer_id).single().execute()
        return result.data
    except Exception as e:
        print(f"Error fetching employer: {e}")
        return None


def get_employer_by_user_id(user_id: str) -> Optional[dict]:
    """Get employer data by user ID."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('employers').select('*').eq('user_id', user_id).single().execute()
        return result.data
    except Exception as e:
        print(f"Error fetching employer: {e}")
        return None


def get_role(role_id: str) -> Optional[dict]:
    """Get role data with employer info."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('roles').select('*, employers!inner(*)').eq('id', role_id).single().execute()
        return result.data
    except Exception as e:
        print(f"Error fetching role: {e}")
        return None


def get_all_candidates_with_scores() -> list[dict]:
    """Get all candidates who have completed assessments (have OCEAN scores)."""
    client = get_supabase()
    if not client:
        return []
    try:
        result = client.table('candidates').select(
            '*, profiles!inner(full_name, email)'
        ).not_.is_('openness_score', 'null').execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching candidates: {e}")
        return []


def get_all_active_roles() -> list[dict]:
    """Get all active roles with their employer data."""
    client = get_supabase()
    if not client:
        return []
    try:
        result = client.table('roles').select(
            '*, employers!inner(*)'
        ).eq('status', 'active').execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching roles: {e}")
        return []


def get_roles_by_employer_id(employer_id: str) -> list[dict]:
    """Get all roles for an employer."""
    client = get_supabase()
    if not client:
        return []
    try:
        result = client.table('roles').select('*').eq('employer_id', employer_id).execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching roles: {e}")
        return []


def upsert_application(data: dict) -> Optional[dict]:
    """Insert or update an application record."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('applications').upsert(
            data,
            on_conflict='candidate_id,role_id'
        ).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error upserting application: {e}")
        return None


def get_application(candidate_id: str, role_id: str) -> Optional[dict]:
    """Get an application by candidate and role ID."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('applications').select('*').eq(
            'candidate_id', candidate_id
        ).eq('role_id', role_id).single().execute()
        return result.data
    except Exception as e:
        return None


def get_applications_for_role(role_id: str) -> list[dict]:
    """Get all applications for a role with candidate data."""
    client = get_supabase()
    if not client:
        return []
    try:
        result = client.table('applications').select(
            '*, candidates!inner(*, profiles!inner(full_name, email))'
        ).eq('role_id', role_id).order('overall_match_score', desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching applications: {e}")
        return []


def get_applications_for_candidate(candidate_id: str) -> list[dict]:
    """Get all applications for a candidate with role data."""
    client = get_supabase()
    if not client:
        return []
    try:
        result = client.table('applications').select(
            '*, roles!inner(*, employers!inner(*))'
        ).eq('candidate_id', candidate_id).order('overall_match_score', desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching applications: {e}")
        return []


# ============ Coffee Chat Helpers ============

def create_coffee_chat(data: dict) -> Optional[dict]:
    """Create a new coffee chat request."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('coffee_chats').insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating coffee chat: {e}")
        return None


def get_coffee_chats_for_candidate(candidate_id: str) -> list[dict]:
    """Get all coffee chats for a candidate with employer data."""
    client = get_supabase()
    if not client:
        return []
    try:
        result = client.table('coffee_chats').select(
            '*, employers!inner(company_name, industry, location, profiles:user_id(full_name))'
        ).eq('candidate_id', candidate_id).order('created_at', desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching candidate coffee chats: {e}")
        return []


def get_coffee_chats_for_employer(employer_id: str) -> list[dict]:
    """Get all coffee chats for an employer with candidate data."""
    client = get_supabase()
    if not client:
        return []
    try:
        result = client.table('coffee_chats').select(
            '*, candidates!inner(*, profiles!inner(full_name, email))'
        ).eq('employer_id', employer_id).order('created_at', desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching employer coffee chats: {e}")
        return []


def update_coffee_chat(chat_id: str, data: dict) -> Optional[dict]:
    """Update a coffee chat record."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('coffee_chats').update(data).eq('id', chat_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error updating coffee chat: {e}")
        return None


def get_coffee_chat_by_id(chat_id: str) -> Optional[dict]:
    """Get a single coffee chat by ID."""
    client = get_supabase()
    if not client:
        return None
    try:
        result = client.table('coffee_chats').select('*').eq('id', chat_id).single().execute()
        return result.data
    except Exception as e:
        print(f"Error fetching coffee chat: {e}")
        return None
