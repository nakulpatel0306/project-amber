"""
Amber FastAPI Authentication Middleware

Provides two layers of authentication:

1. AuthMiddleware (Starlette middleware): Intercepts all incoming requests,
   validates JWT tokens, and attaches the authenticated user to request.state.
   Routes can be excluded by path or prefix (e.g., public assessment endpoints).

2. FastAPI dependencies (get_current_user_dependency, require_auth, require_role):
   Used in individual route handlers to enforce auth and role-based access.
   These work independently of the middleware and can be used as a second check.

When SUPABASE_JWT_SECRET is not configured, auth is disabled entirely (dev mode).
"""

from typing import Optional, List, Callable
from functools import wraps

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

import jwt as pyjwt

from .supabase_auth import get_current_user, verify_token, AuthUser, is_auth_configured


# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware that validates JWT tokens on protected routes.

    Routes can be excluded from authentication by adding them to exclude_paths.
    """

    def __init__(
        self,
        app,
        exclude_paths: Optional[List[str]] = None,
        exclude_prefixes: Optional[List[str]] = None,
    ):
        super().__init__(app)
        self.exclude_paths = exclude_paths or [
            "/",
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
        ]
        self.exclude_prefixes = exclude_prefixes or [
            "/api/assessment/",  # Public assessment endpoints
        ]

    async def dispatch(self, request: Request, call_next):
        # Skip auth for excluded paths
        path = request.url.path

        if path in self.exclude_paths:
            return await call_next(request)

        for prefix in self.exclude_prefixes:
            if path.startswith(prefix):
                return await call_next(request)

        # Skip auth if not configured (development mode)
        if not is_auth_configured():
            return await call_next(request)

        # Extract and verify token
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing authorization header"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authorization header format"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = auth_header[7:]  # Remove "Bearer " prefix

        try:
            user = get_current_user(token)
            # Attach user to request state for use in route handlers
            request.state.user = user
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail},
                headers=e.headers or {},
            )

        return await call_next(request)


async def get_current_user_dependency(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[AuthUser]:
    """
    FastAPI dependency to get the current authenticated user.

    Usage:
        @app.get("/protected")
        async def protected_route(user: AuthUser = Depends(get_current_user_dependency)):
            return {"user_id": user.id}
    """
    if not is_auth_configured():
        # Dev mode: decode token without verification to identify the user
        if credentials:
            try:
                payload = pyjwt.decode(
                    credentials.credentials,
                    options={"verify_signature": False, "verify_aud": False, "verify_exp": False},
                )
                user_id = payload.get("sub")
                email = payload.get("email", "")
                app_metadata = payload.get("app_metadata", {})
                user_metadata = payload.get("user_metadata", {})
                role = app_metadata.get("role") or user_metadata.get("role")
                if user_id:
                    return AuthUser(
                        id=user_id,
                        email=email,
                        role=role,
                        app_metadata=app_metadata,
                        user_metadata=user_metadata,
                    )
            except Exception as e:
                print(f"[dev-mode] Could not decode token: {e}")
        return None

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return get_current_user(credentials.credentials)


async def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> AuthUser:
    """
    FastAPI dependency that requires authentication.
    Raises 401 if not authenticated.

    Usage:
        @app.get("/protected")
        async def protected_route(user: AuthUser = Depends(require_auth)):
            return {"user_id": user.id}
    """
    if not is_auth_configured():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication not configured",
        )

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return get_current_user(credentials.credentials)


def require_role(allowed_roles: List[str]) -> Callable:
    """
    FastAPI dependency factory that requires specific roles.

    Usage:
        @app.get("/employer-only")
        async def employer_route(user: AuthUser = Depends(require_role(["employer"]))):
            return {"company": "..."}
    """
    async def role_checker(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    ) -> AuthUser:
        if not is_auth_configured():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication not configured",
            )

        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = get_current_user(credentials.credentials)

        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}",
            )

        return user

    return role_checker


# Pre-built role dependencies for common access patterns.
# Usage: user: AuthUser = Depends(require_candidate)
require_candidate = require_role(["candidate"])
require_employer = require_role(["employer"])
require_any_role = require_role(["candidate", "employer"])
