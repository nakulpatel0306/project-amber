import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../ui/Spinner';
import { useToast } from '../../contexts/ToastContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const { error: showError, success, info } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('AuthCallback: Starting...');

        // Check URL hash for different callback types
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const type = hashParams.get('type') || searchParams.get('type');
        console.log('AuthCallback: type =', type);

        // Get the session from URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('AuthCallback: session =', session ? 'exists' : 'null');

        if (error) {
          throw error;
        }

        // Track if this is an email verification callback (to avoid duplicate toasts)
        const isEmailVerification = type === 'signup' || type === 'email_change';

        // Handle email verification callback when no session
        if (isEmailVerification && !session) {
          info('Email verified', 'Your email has been verified. Please sign in.');
          navigate('/auth/login', { replace: true });
          return;
        }

        if (!session) {
          console.log('AuthCallback: No session, redirecting to login');
          navigate('/auth/login', { replace: true });
          return;
        }

        // Check for role from localStorage (OAuth signup from signup page)
        const storedRole = localStorage.getItem('amber-signup-role');
        console.log('AuthCallback: storedRole =', storedRole);

        // Helper function to get the dashboard path based on role
        const getDashboardPath = (role: string | null) => {
          return role === 'employer' ? '/app/employer' : '/app/dashboard';
        };

        // Wait for the database trigger to create the profile
        let profile = null;
        let attempts = 0;
        const maxAttempts = 10;

        while (!profile && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (data) {
            profile = data;
          }
          attempts++;
        }
        console.log('AuthCallback: profile =', profile);

        // If we have a stored role from signup flow
        if (storedRole && (storedRole === 'candidate' || storedRole === 'employer')) {
          // Check if user already has a role (existing user trying OAuth signup)
          if (profile?.role) {
            localStorage.removeItem('amber-signup-role');
            info(
              'Already have an account',
              'You already have an account. Signing you in.'
            );
            // Refresh AuthContext state before navigating
            await refreshProfile();
            // Small delay to ensure React state updates
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('AuthCallback: Navigating to', getDashboardPath(profile.role));
            navigate(getDashboardPath(profile.role), { replace: true });
          } else {
            // New user - save the role
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: storedRole })
              .eq('id', session.user.id);

            if (updateError) {
              console.error('Error updating role:', updateError);
            }

            localStorage.removeItem('amber-signup-role');

            // Refresh AuthContext state before navigating
            await refreshProfile();
            // Small delay to ensure React state updates
            await new Promise(resolve => setTimeout(resolve, 100));

            // Show appropriate message (only one toast)
            if (isEmailVerification) {
              success('Email verified', 'Your email has been verified. Welcome!');
            } else {
              success('Welcome!', 'Your account has been created successfully.');
            }
            console.log('AuthCallback: Navigating to', getDashboardPath(storedRole));
            navigate(getDashboardPath(storedRole), { replace: true });
          }
        } else if (profile?.role) {
          // User already has a role assigned - they're a returning user
          // Refresh AuthContext state before navigating
          await refreshProfile();
          // Small delay to ensure React state updates
          await new Promise(resolve => setTimeout(resolve, 100));

          // No toast for returning users - they already see "Welcome Back" on the login page
          console.log('AuthCallback: Navigating to', getDashboardPath(profile.role));
          navigate(getDashboardPath(profile.role), { replace: true });
        } else {
          // No role assigned yet - new user needs to choose
          console.log('AuthCallback: No role, redirecting to role selection');
          navigate('/auth/select-role', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        const message = err instanceof Error ? err.message : 'Authentication failed';
        showError('Sign in failed', message);
        navigate('/auth/login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, showError, success, info, searchParams, refreshProfile]);

  if (isProcessing) {
    return <PageLoader />;
  }

  return null;
}
