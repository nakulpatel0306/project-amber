import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../ui/Spinner';
import type { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireOnboarding?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireOnboarding = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile, isAuthEnabled } = useAuth();
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

  // Check role-based access
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = profile.role === 'employer' ? '/app/employer' : '/app/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Check onboarding requirement
  if (requireOnboarding && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
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
