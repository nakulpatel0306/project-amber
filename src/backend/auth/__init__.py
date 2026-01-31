"""
Amber - Authentication Module
"""

from .supabase_auth import verify_token, get_current_user, AuthUser, check_email_in_profiles
from .middleware import AuthMiddleware, require_auth, require_role, get_current_user_dependency

__all__ = [
    "verify_token",
    "get_current_user",
    "AuthUser",
    "AuthMiddleware",
    "require_auth",
    "require_role",
    "get_current_user_dependency",
    "check_email_in_profiles",
]
