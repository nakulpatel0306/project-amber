import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PageLoader } from '../ui/Spinner';
import { useToast } from '../../contexts/ToastContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { error: showError, success } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          // Check for role from different sources:
          // 1. localStorage (OAuth signup from signup page)
          // 2. User metadata (email signup)
          const storedRole = localStorage.getItem('amber-signup-role');
          const metadataRole = session.user.user_metadata?.role;

          // Get current profile (may not exist yet due to trigger timing)
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, onboarding_completed')
            .eq('id', session.user.id)
            .single();

          // Determine the role to use
          // Only use profile.role if user has completed onboarding (meaning they chose it themselves)
          const roleToUse = storedRole || metadataRole || (profile?.onboarding_completed ? profile?.role : null);

          if (roleToUse && (roleToUse === 'candidate' || roleToUse === 'employer')) {
            // Update profile with the chosen role
            if (profile && profile.role !== roleToUse) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: roleToUse as 'candidate' | 'employer' })
                .eq('id', session.user.id);

              if (updateError) {
                console.error('Error updating role:', updateError);
              }
            }

            // Clean up localStorage if it was used
            if (storedRole) {
              localStorage.removeItem('amber-signup-role');
            }

            success('Welcome!', 'You have been signed in successfully.');
            navigate('/app', { replace: true });
          } else {
            // New OAuth user who hasn't chosen a role yet - redirect to role selection
            navigate('/auth/select-role', { replace: true });
          }
        } else {
          // No session found - redirect to login
          navigate('/auth/login', { replace: true });
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
  }, [navigate, showError, success]);

  if (isProcessing) {
    return <PageLoader />;
  }

  return null;
}
