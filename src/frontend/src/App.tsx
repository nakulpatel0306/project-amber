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
 *
 * Code Splitting: Route components are lazy-loaded to reduce initial bundle size.
 * The landing page loads instantly while other routes are fetched on demand.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { ConnectionsProvider } from './contexts/ConnectionsContext';

// Layout components (loaded eagerly - needed for app shell)
import { AppLayout } from './components/layout/AppLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { RouteTitleSync } from './components/layout/RouteTitleSync';

// Landing page (loaded eagerly - critical path)
import { WelcomeScreen } from './components/landing';

// Auth components (loaded eagerly - needed for route guards)
import { ProtectedRoute, GuestRoute } from './components/auth';

// Lazy-loaded auth pages
const LoginPage = lazy(() => import('./components/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./components/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const PasswordResetPage = lazy(() => import('./components/auth/PasswordResetPage').then(m => ({ default: m.PasswordResetPage })));
const AuthCallback = lazy(() => import('./components/auth/AuthCallback').then(m => ({ default: m.AuthCallback })));
const RoleSelectionPage = lazy(() => import('./components/auth/RoleSelectionPage').then(m => ({ default: m.RoleSelectionPage })));
const Onboarding = lazy(() => import('./components/auth/Onboarding').then(m => ({ default: m.Onboarding })));
const EmailVerificationPage = lazy(() => import('./components/auth/EmailVerificationPage').then(m => ({ default: m.EmailVerificationPage })));

// Lazy-loaded public pages
const BlogPage = lazy(() => import('./components/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogArticlePage = lazy(() => import('./components/pages/BlogArticlePage').then(m => ({ default: m.BlogArticlePage })));
const SciencePage = lazy(() => import('./components/pages/SciencePage').then(m => ({ default: m.SciencePage })));
const HelpCenterPage = lazy(() => import('./components/pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));
const ChangelogPage = lazy(() => import('./components/pages/ChangelogPage').then(m => ({ default: m.ChangelogPage })));
const StatusPage = lazy(() => import('./components/pages/StatusPage').then(m => ({ default: m.StatusPage })));
const AboutPage = lazy(() => import('./components/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const CareersPage = lazy(() => import('./components/pages/CareersPage').then(m => ({ default: m.CareersPage })));
const PressPage = lazy(() => import('./components/pages/PressPage').then(m => ({ default: m.PressPage })));
const PrivacyPolicyPage = lazy(() => import('./components/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./components/pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const CookiePolicyPage = lazy(() => import('./components/pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const AccessibilityPage = lazy(() => import('./components/pages/AccessibilityPage').then(m => ({ default: m.AccessibilityPage })));
const RolesPage = lazy(() => import('./components/pages/RolesPage').then(m => ({ default: m.RolesPage })));

// Lazy-loaded dashboard components
const JobSeekerDashboard = lazy(() => import('./components/dashboard/JobSeekerDashboard').then(m => ({ default: m.JobSeekerDashboard })));
const EmployerDashboard = lazy(() => import('./components/dashboard/EmployerDashboard').then(m => ({ default: m.EmployerDashboard })));

// Lazy-loaded candidate components
const AssessmentFlow = lazy(() => import('./components/candidate/AssessmentFlow').then(m => ({ default: m.AssessmentFlow })));
const Assessment = lazy(() => import('./components/candidate/Assessment').then(m => ({ default: m.Assessment })));
const AssessmentResults = lazy(() => import('./components/candidate/AssessmentResults').then(m => ({ default: m.AssessmentResults })));
const PersonalityInsights = lazy(() => import('./components/candidate/PersonalityInsights').then(m => ({ default: m.PersonalityInsights })));

// Lazy-loaded employer components
const CultureQuiz = lazy(() => import('./components/employer/CultureQuiz').then(m => ({ default: m.CultureQuiz })));
const CultureAssessment = lazy(() => import('./components/employer/CultureAssessment').then(m => ({ default: m.CultureAssessment })));
const CultureInsights = lazy(() => import('./components/employer/CultureInsights').then(m => ({ default: m.CultureInsights })));
const EmployerAssessmentResults = lazy(() => import('./components/employer/EmployerAssessmentResults').then(m => ({ default: m.EmployerAssessmentResults })));
const CreateRole = lazy(() => import('./components/employer/CreateRole').then(m => ({ default: m.CreateRole })));
const ManageRoles = lazy(() => import('./components/employer/ManageRoles').then(m => ({ default: m.ManageRoles })));
const TopCandidates = lazy(() => import('./components/employer/TopCandidates').then(m => ({ default: m.TopCandidates })));

// Lazy-loaded Ember AI components
const EmberAgent = lazy(() => import('./components/ember/EmberAgent').then(m => ({ default: m.EmberAgent })));
const EmberEmployerPage = lazy(() => import('./components/ember/EmberEmployerPage').then(m => ({ default: m.EmberEmployerPage })));

// Lazy-loaded coffee chat components
const CandidateCoffeeChats = lazy(() => import('./components/coffee-chats/CandidateCoffeeChats').then(m => ({ default: m.CandidateCoffeeChats })));
const EmployerCoffeeChats = lazy(() => import('./components/coffee-chats/EmployerCoffeeChats').then(m => ({ default: m.EmployerCoffeeChats })));

// Lazy-loaded network components
const NetworkHub = lazy(() => import('./components/network/NetworkHub').then(m => ({ default: m.NetworkHub })));
const PracticeCoffeeChat = lazy(() => import('./components/network/PracticeCoffeeChat').then(m => ({ default: m.PracticeCoffeeChat })));

// Lazy-loaded pricing/billing components
const PricingPage = lazy(() => import('./components/pricing/PricingPage').then(m => ({ default: m.PricingPage })));
const BillingSuccessPage = lazy(() => import('./components/pricing/BillingSuccessPage').then(m => ({ default: m.BillingSuccessPage })));
const BillingCancelPage = lazy(() => import('./components/pricing/BillingCancelPage').then(m => ({ default: m.BillingCancelPage })));

// Lazy-loaded settings
const SettingsPage = lazy(() => import('./components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Lazy-loaded assessment modules (heavy components)
const VisualPerceptionAssessment = lazy(() => import('./components/assessments/VisualPerceptionAssessment').then(m => ({ default: m.VisualPerceptionAssessment })));
const WorkValuesAssessment = lazy(() => import('./components/assessments/WorkValuesAssessment').then(m => ({ default: m.WorkValuesAssessment })));
const SituationalJudgmentAssessment = lazy(() => import('./components/assessments/SituationalJudgmentAssessment').then(m => ({ default: m.SituationalJudgmentAssessment })));
const CognitivePatternAssessment = lazy(() => import('./components/assessments/CognitivePatternAssessment').then(m => ({ default: m.CognitivePatternAssessment })));
const TeamDynamicsAssessment = lazy(() => import('./components/assessments/TeamDynamicsAssessment').then(m => ({ default: m.TeamDynamicsAssessment })));
const LeadershipStyleAssessment = lazy(() => import('./components/assessments/LeadershipStyleAssessment').then(m => ({ default: m.LeadershipStyleAssessment })));
const GrowthPhilosophyAssessment = lazy(() => import('./components/assessments/GrowthPhilosophyAssessment').then(m => ({ default: m.GrowthPhilosophyAssessment })));
const WorkEnvironmentAssessment = lazy(() => import('./components/assessments/WorkEnvironmentAssessment').then(m => ({ default: m.WorkEnvironmentAssessment })));

import './styles/globals.css';

// Minimal loading fallback - keeps UI feeling fast
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <RouteTitleSync />
              <ConnectionsProvider>
              <MessagingProvider>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<WelcomeScreen />} />
                <Route element={<PublicLayout />}>
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogArticlePage />} />
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

                {/* Billing result pages (after Stripe redirect) */}
                <Route path="/billing/success" element={<BillingSuccessPage />} />
                <Route path="/billing/cancel" element={<BillingCancelPage />} />

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
                  <Route path="matches" element={<Navigate to="/app/network?tab=roles" replace />} />
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
                  <Route path="roles" element={<RolesPage />} />

                  {/* Network Hub (shared route for both roles) */}
                  <Route path="network" element={<NetworkHub />} />
                  <Route path="practice" element={<PracticeCoffeeChat />} />

                  <Route
                    path="chats"
                    element={
                      <ProtectedRoute allowedRoles={['candidate']}>
                        <CandidateCoffeeChats />
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
                  <Route path="employer/candidates" element={<Navigate to="/app/network?tab=roles" replace />} />
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
              </Suspense>
              </MessagingProvider>
              </ConnectionsProvider>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
