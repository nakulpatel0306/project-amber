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
          // Check for role from localStorage (OAuth signup from signup page)
          const storedRole = localStorage.getItem('amber-signup-role');

          // Wait briefly for the database trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Get current profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // If we have a stored role from signup flow, save it to the profile
          if (storedRole && (storedRole === 'candidate' || storedRole === 'employer')) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: storedRole })
              .eq('id', session.user.id);

            if (updateError) {
              console.error('Error updating role:', updateError);
            }

            localStorage.removeItem('amber-signup-role');
            success('Welcome!', 'You have been signed in successfully.');
            navigate('/app', { replace: true });
          } else if (profile?.role) {
            // User already has a role assigned - they're a returning user
            success('Welcome back!', 'You have been signed in successfully.');
            navigate('/app', { replace: true });
          } else {
            // No role assigned yet - new user needs to choose
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
