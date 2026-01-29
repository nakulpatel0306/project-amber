import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../ui/Spinner';
import type { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  skipOnboardingCheck?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  skipOnboardingCheck = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile, isAuthEnabled, needsOnboarding } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return <PageLoader />;
  }

  // If auth is not enabled (Supabase not configured), allow access
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user needs onboarding (no role selected)
  // Skip this check for the onboarding page itself
  if (!skipOnboardingCheck && needsOnboarding) {
    return <Navigate to="/app/onboarding" replace />;
  }

  // Check role-based access (only if profile has a role)
  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = profile.role === 'employer' ? '/app/employer' : '/app/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Guest route - only accessible when NOT logged in
interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestRoute({ children, redirectTo = '/app' }: GuestRouteProps) {
  const { isAuthenticated, isLoading, isAuthEnabled } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return <PageLoader />;
  }

  // If auth is not enabled, allow access
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  // Redirect to app if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
