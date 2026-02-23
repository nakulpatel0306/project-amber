/**
 * App.tsx — Root component and route configuration for the Amber frontend.
 *
 * Routes are organized into three groups:
 *   1. Public routes: Landing page, blog, about, legal pages (no auth required)
 *   2. Auth routes: Login, signup, OAuth callback, role selection (guest only)
 *   3. Protected routes (/app/*): Dashboards, assessments, matching, settings
 *      - Candidate routes: /app/dashboard, /app/assessment, /app/insights, etc.
 *      - Employer routes: /app/employer/*, culture quiz, roles, candidates
 *      - Shared routes: /app/settings, /app/pricing
 *
 * The provider hierarchy is: ErrorBoundary > AuthProvider > ThemeProvider > ToastProvider
 * This ensures auth state is available to theming (user theme preference) and
 * toast notifications are available to all components.
 */
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
import { PublicLayout } from './components/layout/PublicLayout';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

// Pages
import { WelcomeScreen } from './components/landing';
import { BlogPage, SciencePage, HelpCenterPage, ChangelogPage, StatusPage, AboutPage, CareersPage, PressPage, PrivacyPolicyPage, TermsOfServicePage, CookiePolicyPage, AccessibilityPage } from './components/pages';
import { JobSeekerDashboard, EmployerDashboard } from './components/dashboard';
import { AssessmentFlow, Assessment, AssessmentResults, MatchingAgent, PersonalityInsights, Leaderboard } from './components/candidate';
import { CultureQuiz, CultureAssessment, CultureInsights, EmployerAssessmentResults, CreateRole, ManageRoles, BrowseCandidates, TopCandidates, EmployerLeaderboard } from './components/employer';
import { EmberAgent, EmberEmployerPage } from './components/ember';
import { CandidateCoffeeChats, EmployerCoffeeChats } from './components/coffee-chats';
import { PricingPage } from './components/pricing';
import { SettingsPage } from './components/settings/SettingsPage';
import { VisualPerceptionAssessment, WorkValuesAssessment, SituationalJudgmentAssessment, CognitivePatternAssessment, TeamDynamicsAssessment, LeadershipStyleAssessment, GrowthPhilosophyAssessment, WorkEnvironmentAssessment } from './components/assessments';

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
                <Route element={<PublicLayout />}>
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/science" element={<SciencePage />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/changelog" element={<ChangelogPage />} />
                  <Route path="/status" element={<StatusPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/careers" element={<CareersPage />} />
                  <Route path="/press" element={<PressPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/cookies" element={<CookiePolicyPage />} />
                  <Route path="/accessibility" element={<AccessibilityPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                </Route>

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
                    path="personality/results"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <AssessmentResults />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="insights"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <PersonalityInsights />
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
                  <Route
                    path="ember"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <EmberAgent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="assessments/visual-perception"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <VisualPerceptionAssessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="assessments/work-values"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <WorkValuesAssessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="assessments/situational-judgment"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <SituationalJudgmentAssessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="assessments/cognitive-patterns"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <CognitivePatternAssessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="jobs" element={<div className="p-8 text-center" style={{ color: 'var(--color-textMuted)' }}>Jobs page coming soon...</div>} />
                  <Route
                    path="chats"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <CandidateCoffeeChats />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="leaderboard"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <Leaderboard />
                      </ProtectedRoute>
                    }
                  />

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
                  <Route
                    path="employer/culture-results"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <EmployerAssessmentResults />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employer/insights"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <CultureInsights />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="employer/roles" element={<ManageRoles />} />
                  <Route path="employer/roles/new" element={<CreateRole />} />
                  <Route path="employer/candidates" element={<BrowseCandidates />} />
                  <Route
                    path="employer/top-candidates"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <TopCandidates />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employer/ember"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <EmberEmployerPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employer/chats"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <EmployerCoffeeChats />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employer/leaderboard"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <EmployerLeaderboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employer/assessments/team-dynamics"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <TeamDynamicsAssessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employer/assessments/leadership-style"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <LeadershipStyleAssessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employer/assessments/growth-philosophy"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <GrowthPhilosophyAssessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employer/assessments/work-environment"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <WorkEnvironmentAssessment />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shared routes */}
                  <Route path="pricing" element={<PricingPage />} />
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
