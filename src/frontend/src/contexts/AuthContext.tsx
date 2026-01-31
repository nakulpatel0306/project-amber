import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase, getCurrentUserWithProfile, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types/auth.types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
}

interface AuthContextType extends AuthState {
  // Auth status
  isAuthenticated: boolean;
  isCandidate: boolean;
  isEmployer: boolean;
  isAuthEnabled: boolean;
  needsOnboarding: boolean;

  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    role: UserRole,
    metadata?: Record<string, unknown>
  ) => Promise<{ session: Session | null; user: User | null }>;
  signInWithOAuth: (provider: 'google' | 'github', role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;

  // Email verification methods
  checkEmailExists: (email: string) => Promise<{ exists: boolean; message: string }>;
  resendVerificationEmail: (email: string) => Promise<void>;

  // Profile methods
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const result = await getCurrentUserWithProfile();
          setState({
            user: session.user,
            profile: result?.profile as Profile | null,
            session,
            isLoading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth init error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as AuthError,
        }));
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          // Small delay to allow database trigger to create profile
          setTimeout(async () => {
            const result = await getCurrentUserWithProfile();
            setState({
              user: session.user,
              profile: result?.profile as Profile | null,
              session,
              isLoading: false,
              error: null,
            });
          }, 500);
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({ ...prev, session }));
        } else if (event === 'PASSWORD_RECOVERY') {
          // Handle password recovery - user clicked reset link
          setState(prev => ({ ...prev, session }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error }));
      throw error;
    }
  }, []);

  // Sign up with email
  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      role: UserRole,
      metadata?: Record<string, unknown>
    ) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            ...metadata,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error }));
        throw error;
      }

      // If session is returned, user is logged in immediately (no email verification required)
      if (data.session) {
        // Wait for database trigger to create profile, then fetch it
        let attempts = 0;
        const maxAttempts = 10;
        let profileResult = null;

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          profileResult = await getCurrentUserWithProfile();
          if (profileResult?.profile) {
            break;
          }
          attempts++;
        }

        setState({
          user: data.user,
          profile: profileResult?.profile as Profile | null,
          session: data.session,
          isLoading: false,
          error: null,
        });
        return { session: data.session, user: data.user };
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return { session: null, user: data.user };
    },
    []
  );

  // Sign in with OAuth
  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'github', role?: UserRole) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error }));
        throw error;
      }

      // Only store role if explicitly provided (from signup flow)
      if (role) {
        localStorage.setItem('amber-signup-role', role);
      }
    },
    []
  );

  // Sign out
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    // Clear session storage so setup modal shows on next login
    sessionStorage.removeItem('profile_setup_skipped');
    sessionStorage.removeItem('employer_setup_skipped');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }, []);

  // Check if email exists in the database
  const checkEmailExists = useCallback(async (email: string): Promise<{ exists: boolean; message: string }> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to check email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking email:', error);
      // If we can't reach the backend, allow the auth flow to continue
      // Supabase will handle duplicate email detection
      return { exists: false, message: 'Unable to verify email' };
    }
  }, []);

  // Resend verification email
  const resendVerificationEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  }, []);

  // Update profile
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!state.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
      }));
    },
    [state.user]
  );

  // Refresh profile - fetches latest profile from database
  const refreshProfile = useCallback(async () => {
    const result = await getCurrentUserWithProfile();
    if (result?.user && result?.profile) {
      setState(prev => ({
        ...prev,
        user: result.user,
        profile: result.profile as Profile,
      }));
    } else if (result?.user) {
      // User exists but no profile yet - still update user
      setState(prev => ({
        ...prev,
        user: result.user,
      }));
    }
  }, []);

  // Check if user needs onboarding (only if no role is selected)
  // If user has a role, they don't need onboarding - they selected it during signup
  const needsOnboarding = !!state.user && !!state.profile && !state.profile.role;

  const value: AuthContextType = {
    ...state,
    isAuthenticated: !!state.user,
    isCandidate: state.profile?.role === 'candidate',
    isEmployer: state.profile?.role === 'employer',
    isAuthEnabled: isSupabaseConfigured,
    needsOnboarding,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    checkEmailExists,
    resendVerificationEmail,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
