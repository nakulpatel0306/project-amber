"""
Amber - Supabase JWT Authentication

Verifies JWT tokens issued by Supabase Auth.
"""

import os
from typing import Optional
from dataclasses import dataclass
from datetime import datetime

import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# JWT configuration
JWT_ALGORITHM = "HS256"
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
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication not configured. Set SUPABASE_JWT_SECRET."
        )

    try:
        # Decode and verify the JWT
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            audience=JWT_AUDIENCE,
        )

        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

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
    return bool(SUPABASE_JWT_SECRET)
