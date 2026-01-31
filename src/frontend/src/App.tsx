import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Auth components
import {
  LoginPage,
  SignupPage,
  PasswordResetPage,
  AuthCallback,
  RoleSelectionPage,
  ProtectedRoute,
  GuestRoute,
  Onboarding,
  EmailVerificationPage,
} from './components/auth';

// Layout
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

// Pages
import { WelcomeScreen } from './components/WelcomeScreen';
import { JobSeekerDashboard, EmployerDashboard } from './components/dashboard';
import { AssessmentFlow } from './components/AssessmentFlow';
import { Assessment, MatchingAgent } from './components/candidate';
import { CultureQuiz, CultureAssessment, CreateRole, ManageRoles, BrowseCandidates } from './components/employer';
import { SettingsPage } from './components/settings/SettingsPage';

import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<WelcomeScreen />} />

                {/* Auth routes (guest only) */}
                <Route
                  path="/auth/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/auth/signup"
                  element={
                    <GuestRoute>
                      <SignupPage />
                    </GuestRoute>
                  }
                />
                <Route path="/auth/forgot-password" element={<PasswordResetPage />} />
                <Route path="/auth/reset-password" element={<PasswordResetPage />} />
                <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/auth/select-role"
                  element={
                    <ProtectedRoute skipOnboardingCheck>
                      <RoleSelectionPage />
                    </ProtectedRoute>
                  }
                />

                {/* Legacy route redirect */}
                <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

                {/* Protected app routes */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Onboarding route - skip onboarding check to avoid redirect loop */}
                  <Route
                    path="onboarding"
                    element={
                      <ProtectedRoute skipOnboardingCheck>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />

                  {/* Candidate routes */}
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <JobSeekerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="assessment"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <AssessmentFlow />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="personality"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <Assessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="matches"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <MatchingAgent />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="jobs" element={<div className="p-8 text-center" style={{ color: 'var(--color-textMuted)' }}>Jobs page coming soon...</div>} />
                  <Route path="chats" element={<div className="p-8 text-center" style={{ color: 'var(--color-textMuted)' }}>Coffee chats page coming soon...</div>} />

                  {/* Employer routes */}
                  <Route
                    path="employer"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <EmployerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="employer/culture" element={<CultureQuiz />} />
                  <Route
                    path="employer/culture-assessment"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <CultureAssessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="employer/roles" element={<ManageRoles />} />
                  <Route path="employer/roles/new" element={<CreateRole />} />
                  <Route path="employer/candidates" element={<BrowseCandidates />} />
                  <Route path="employer/chats" element={<div className="p-8 text-center" style={{ color: 'var(--color-textMuted)' }}>Coffee chats page coming soon...</div>} />

                  {/* Shared routes */}
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="settings/:section" element={<SettingsPage />} />
                </Route>

                {/* Catch all - 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
