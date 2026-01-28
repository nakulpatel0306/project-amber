import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Users,
  Sparkles,
  Heart,
  Target,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { APP_NAME } from '../utils/constants';

const features = [
  {
    title: 'personality assessment',
    description: 'discover your work style with our 15-minute Big Five assessment',
    icon: Sparkles,
  },
  {
    title: 'culture matching',
    description: 'find companies whose values and culture align with yours',
    icon: Heart,
  },
  {
    title: 'smart job matches',
    description: 'get personalized job recommendations with match scores',
    icon: Target,
  },
  {
    title: 'coffee chats',
    description: 'connect directly with employers for informal conversations',
    icon: Coffee,
  },
];

const forCandidates = [
  'Complete a 15-minute personality assessment',
  'Get matched with roles that fit your style',
  'See compatibility scores before you apply',
  'Schedule coffee chats with hiring teams',
];

const forEmployers = [
  'Define your company culture with a quick quiz',
  'Create roles with personality requirements',
  'Get AI-ranked candidates by culture fit',
  'Send one-click chat invitations',
];

export function WelcomeScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
                }}
              >
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <span
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                {APP_NAME.toLowerCase()}
              </span>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/app">
                  <Button size="sm">
                    go to dashboard
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">
                      sign in
                    </Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button size="sm">get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{
              background:
                'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.25)',
            }}
          >
            <Briefcase className="w-8 h-8 text-white" />
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            find jobs that{' '}
            <span className="text-gradient-amber">fit your personality</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-8"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {APP_NAME} matches you with companies based on culture fit, not just
            skills. take our personality assessment and discover roles where
            you'll thrive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/signup">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                start your assessment
              </Button>
            </Link>
            <Link to="/auth/signup?role=employer">
              <Button variant="outline" size="lg">
                <Users className="w-5 h-5 mr-2" />
                i'm hiring
              </Button>
            </Link>
          </div>

          <p
            className="text-sm mt-4"
            style={{ color: 'var(--color-textMuted)' }}
          >
            free to use · takes 15 minutes · no credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-semibold text-center mb-12"
            style={{ color: 'var(--color-text)' }}
          >
            how it works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ title, description, icon: Icon }, index) => (
              <div
                key={title}
                className="p-6 rounded-2xl text-center"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                >
                  <Icon
                    className="w-6 h-6"
                    style={{ color: 'var(--color-accent)' }}
                  />
                </div>
                <div
                  className="text-xs font-medium mb-2"
                  style={{ color: 'var(--color-accent)' }}
                >
                  step {index + 1}
                </div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-sided marketplace section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Candidates */}
            <div
              className="p-8 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-backgroundSecondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
              >
                <Users
                  className="w-6 h-6"
                  style={{ color: 'var(--color-accent)' }}
                />
              </div>
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                for job seekers
              </h3>
              <ul className="space-y-3">
                {forCandidates.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--color-success)' }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup" className="block mt-6">
                <Button fullWidth>find your match</Button>
              </Link>
            </div>

            {/* For Employers */}
            <div
              className="p-8 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-backgroundSecondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
              >
                <Briefcase
                  className="w-6 h-6"
                  style={{ color: 'var(--color-accent)' }}
                />
              </div>
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                for employers
              </h3>
              <ul className="space-y-3">
                {forEmployers.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--color-success)' }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup?role=employer" className="block mt-6">
                <Button variant="secondary" fullWidth>
                  start hiring
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl font-semibold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            ready to find your perfect match?
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            join thousands of candidates and employers who are already finding
            better culture fits with {APP_NAME}.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              get started for free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 sm:px-6 lg:px-8 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              }}
            >
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {APP_NAME}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            © 2025 {APP_NAME}. culture-first job matching.
          </p>
        </div>
      </footer>
    </div>
  );
}
