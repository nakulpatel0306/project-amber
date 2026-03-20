"""
Amber - Supabase JWT Authentication

Verifies JWT tokens issued by Supabase Auth.
"""

import os
import ssl
import certifi
from typing import Optional
from dataclasses import dataclass
from datetime import datetime

import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Supabase client (lazy initialization)
_supabase_client: Optional[Client] = None
_jwks_client: Optional[PyJWKClient] = None


def get_supabase_client() -> Optional[Client]:
    """Get the Supabase client instance."""
    global _supabase_client
    if _supabase_client is None and SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client


def get_jwks_client() -> Optional[PyJWKClient]:
    """Get the JWKS client for ES256 token verification."""
    global _jwks_client
    if _jwks_client is None and SUPABASE_URL:
        jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        # Use certifi SSL context to fix macOS certificate issues
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        _jwks_client = PyJWKClient(jwks_url, ssl_context=ssl_context)
    return _jwks_client


def check_email_in_profiles(email: str) -> bool:
    """Check if an email exists in the profiles table."""
    client = get_supabase_client()
    if not client:
        return False

    try:
        result = client.table("profiles").select("id").eq("email", email.lower()).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error checking email: {e}")
        return False

# JWT configuration
JWT_AUDIENCE = "authenticated"


@dataclass
class AuthUser:
    """Authenticated user data extracted from JWT."""
    id: str
    email: str
    role: Optional[str] = None
    app_metadata: Optional[dict] = None
    user_metadata: Optional[dict] = None

    @property
    def is_candidate(self) -> bool:
        """Check if user is a candidate."""
        return self.role == "candidate"

    @property
    def is_employer(self) -> bool:
        """Check if user is an employer."""
        return self.role == "employer"


def verify_token(token: str) -> dict:
    """
    Verify a Supabase JWT token.

    Args:
        token: The JWT token string (without 'Bearer ' prefix)

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    if not SUPABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication not configured. Set SUPABASE_URL."
        )

    try:
        # Try ES256 verification using JWKS (newer Supabase projects)
        jwks_client = get_jwks_client()
        if jwks_client:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256"],
                audience=JWT_AUDIENCE,
            )
            return payload

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication not configured properly."
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: str) -> AuthUser:
    """
    Get the current authenticated user from a JWT token.

    Args:
        token: The JWT token string

    Returns:
        AuthUser object with user data

    Raises:
        HTTPException: If token is invalid or user data is missing
    """
    payload = verify_token(token)

    # Extract user data from token
    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user data",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get role from app_metadata or user_metadata
    app_metadata = payload.get("app_metadata", {})
    user_metadata = payload.get("user_metadata", {})
    role = app_metadata.get("role") or user_metadata.get("role")

    return AuthUser(
        id=user_id,
        email=email,
        role=role,
        app_metadata=app_metadata,
        user_metadata=user_metadata,
    )


def is_auth_configured() -> bool:
    """Check if authentication is properly configured."""
    return bool(SUPABASE_URL)


def delete_user_account(user_id: str) -> bool:
    """
    Delete a user account from Supabase Auth.
    This will cascade delete all related data due to foreign key constraints.

    Args:
        user_id: The UUID of the user to delete

    Returns:
        True if successful, False otherwise
    """
    client = get_supabase_client()
    if not client:
        return False

    try:
        # Delete user from Supabase Auth (this cascades to profiles and other tables)
        client.auth.admin.delete_user(user_id)
        return True
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False
