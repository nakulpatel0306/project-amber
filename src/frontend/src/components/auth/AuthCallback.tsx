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
          // 3. Existing profile
          const storedRole = localStorage.getItem('amber-signup-role');
          const metadataRole = session.user.user_metadata?.role;

          // Get current profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // Determine the role to use (priority: stored > metadata > profile)
          const roleToUse = storedRole || metadataRole || profile?.role;

          if (roleToUse && (roleToUse === 'candidate' || roleToUse === 'employer')) {
            // Update profile if it doesn't have a role yet
            if (!profile?.role) {
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
            // No role found anywhere - user needs to select one (OAuth login without prior signup)
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
