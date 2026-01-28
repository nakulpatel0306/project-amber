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
          // Check if this is a new user (from OAuth)
          const storedRole = localStorage.getItem('amber-signup-role');

          if (storedRole && (storedRole === 'candidate' || storedRole === 'employer')) {
            // Update the user's role in their profile
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: storedRole as 'candidate' | 'employer' })
              .eq('id', session.user.id);

            if (updateError) {
              console.error('Error updating role:', updateError);
            }

            localStorage.removeItem('amber-signup-role');
          }

          success('Welcome!', 'You have been signed in successfully.');
          navigate('/app', { replace: true });
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
