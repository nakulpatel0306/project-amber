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
  Zap,
  Shield,
  Star,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { CoffeeLogo } from './ui/CoffeeLogo';
import { APP_NAME } from '../utils/constants';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import {
  FloatingThemeSelector,
  AnimatedCounter,
  FAQAccordion,
  CursorSpotlight,
  FloatingCoffeeBeans,
  MagneticButton,
  TiltCard,
  ScrollProgress,
  AnimatedBlobs,
  InteractiveGreeting,
  TypewriterText,
} from './landing';

const typewriterWords = [
  'your personality',
  'your values',
  'your work style',
  'your culture',
];

const processSteps = [
  {
    number: '01',
    title: 'take the assessment',
    description: 'Our 15-minute Big Five personality assessment reveals your unique work style and preferences.',
    icon: Sparkles,
    color: '#F59E0B',
  },
  {
    number: '02',
    title: 'get matched',
    description: 'Our AI analyzes your profile against company cultures to find roles where you\'ll truly thrive.',
    icon: Target,
    color: '#10B981',
  },
  {
    number: '03',
    title: 'connect over coffee',
    description: 'Skip the formal interviews. Have genuine conversations with teams before applying.',
    icon: Coffee,
    color: '#8B5CF6',
  },
  {
    number: '04',
    title: 'land your role',
    description: 'Join companies that value who you are, not just what you do. Culture fit guaranteed.',
    icon: Award,
    color: '#EC4899',
  },
];

const stats = [
  { target: 10000, suffix: '+', label: 'candidates matched', icon: Users },
  { target: 500, suffix: '+', label: 'companies hiring', icon: Briefcase },
  { target: 95, suffix: '%', label: 'culture fit rate', icon: Heart },
  { target: 15, suffix: 'm', label: 'avg. assessment time', icon: Clock },
];

const forCandidates = [
  { text: 'Discover your unique work personality', icon: Sparkles },
  { text: 'Get matched based on culture, not keywords', icon: Heart },
  { text: 'See compatibility scores before applying', icon: Target },
  { text: 'Schedule casual coffee chats with teams', icon: Coffee },
];

const forEmployers = [
  { text: 'Define your company culture scientifically', icon: Zap },
  { text: 'Create roles with personality requirements', icon: Target },
  { text: 'Get AI-ranked candidates by culture fit', icon: TrendingUp },
  { text: 'Reduce turnover with better matches', icon: Shield },
];

const testimonials = [
  {
    quote: "Finally, a platform that gets it. I found a team that actually matches my energy.",
    author: "Sarah K.",
    role: "Product Designer at Stripe",
    rating: 5,
  },
  {
    quote: "Our culture fit improved dramatically. Turnover dropped 40% in the first year.",
    author: "Marcus T.",
    role: "Head of People at Notion",
    rating: 5,
  },
  {
    quote: "The coffee chat feature is genius. No more awkward first interviews.",
    author: "Alex R.",
    role: "Software Engineer at Vercel",
    rating: 5,
  },
];

const faqItems = [
  {
    question: 'How does the culture matching actually work?',
    answer: 'Our AI analyzes your Big Five personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) and compares them with company culture profiles. We look at team dynamics, work style preferences, and values alignment to calculate a compatibility score that predicts how well you\'ll fit.',
  },
  {
    question: 'Is Amber completely free for job seekers?',
    answer: 'Yes! Take the assessment, browse matches, and connect with employers at no cost. We believe everyone deserves to find work that fits their personality. Companies pay for access to our matching platform.',
  },
  {
    question: 'What makes the Big Five assessment special?',
    answer: 'The Big Five is the most scientifically validated personality framework used by psychologists worldwide. Unlike other tests, it measures stable traits that predict workplace behavior and satisfaction. Our assessment is designed specifically for career matching.',
  },
  {
    question: 'What are coffee chats and how do they work?',
    answer: 'Coffee chats are informal 15-30 minute video calls with team members. No pressure, no formal interview questions. Just genuine conversation to see if there\'s mutual interest. Companies can invite you, or you can request them after matching.',
  },
];

function ScrollSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  return (
    <div ref={ref} className={`scroll-animate ${isVisible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function WelcomeScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Background Effects */}
      <AnimatedBlobs />
      <FloatingCoffeeBeans />
      <CursorSpotlight />
      <ScrollProgress />
      <FloatingThemeSelector />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-6 pb-3">
        <div
          className="max-w-5xl mx-auto px-6 py-3 rounded-2xl border"
          style={{
            background: 'color-mix(in srgb, var(--color-surface) 60%, transparent)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="transition-transform group-hover:scale-110 group-hover:rotate-3">
                <CoffeeLogo size="sm" />
              </div>
              <span
                className="text-lg font-semibold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                {APP_NAME.toLowerCase()}
              </span>
            </Link>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/app">
                  <MagneticButton
                    className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accentText)',
                    }}
                  >
                    dashboard
                    <ArrowRight className="w-4 h-4" />
                  </MagneticButton>
                </Link>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">sign in</Button>
                  </Link>
                  <Link to="/auth/signup">
                    <MagneticButton
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accentText)',
                      }}
                    >
                      get started
                    </MagneticButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Interactive Greeting */}
          <div className="mb-8">
            <InteractiveGreeting />
          </div>

          {/* Main Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-slide-up"
            style={{ color: 'var(--color-text)' }}
          >
            find jobs that fit{' '}
            <span className="block mt-2">
              <TypewriterText
                words={typewriterWords}
                className="animate-gradient-text"
              />
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-200"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Stop chasing job descriptions. Start finding companies where you actually belong.
            Our AI matches your personality with company cultures for better career fits.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animate-delay-300">
            <Link to="/auth/signup">
              <MagneticButton
                className="px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 animate-glow-pulse"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
                strength={0.2}
              >
                start free assessment
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </Link>
            <Link to="/auth/signup?role=employer">
              <MagneticButton
                className="px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 border-2"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  backgroundColor: 'var(--color-surface)',
                }}
                strength={0.2}
              >
                <Briefcase className="w-5 h-5" />
                I'm hiring
              </MagneticButton>
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm animate-fade-in animate-delay-400"
            style={{ color: 'var(--color-textMuted)' }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
              free forever
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              15 min assessment
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              privacy first
            </span>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <ScrollSection>
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center animate-float"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <AnimatedCounter {...stat} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* How It Works - Process Steps */}
      <ScrollSection>
        <section
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                from assessment to offer in 4 steps
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Our process is designed to be fast, insightful, and actually enjoyable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processSteps.map((step) => (
                <TiltCard
                  key={step.number}
                  className="p-8 rounded-3xl border cursor-default"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                  tiltAmount={5}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <step.icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                    <div>
                      <div
                        className="text-xs font-mono font-bold mb-2"
                        style={{ color: step.color }}
                      >
                        {step.number}
                      </div>
                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-textSecondary)' }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Two-Sided Value Props */}
      <ScrollSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* For Candidates */}
              <TiltCard
                className="p-10 rounded-3xl border relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                tiltAmount={3}
              >
                {/* Decorative gradient */}
                <div
                  className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />

                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Users className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-6"
                    style={{ color: 'var(--color-text)' }}
                  >
                    for job seekers
                  </h3>
                  <ul className="space-y-4 mb-8">
                    {forCandidates.map(item => (
                      <li key={item.text} className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                        >
                          <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup">
                    <MagneticButton
                      className="w-full py-4 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accentText)',
                      }}
                    >
                      find your match
                    </MagneticButton>
                  </Link>
                </div>
              </TiltCard>

              {/* For Employers */}
              <TiltCard
                className="p-10 rounded-3xl border relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                tiltAmount={3}
              >
                {/* Decorative gradient */}
                <div
                  className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl"
                  style={{ backgroundColor: 'var(--color-accentHover)' }}
                />

                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Briefcase className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-6"
                    style={{ color: 'var(--color-text)' }}
                  >
                    for employers
                  </h3>
                  <ul className="space-y-4 mb-8">
                    {forEmployers.map(item => (
                      <li key={item.text} className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                        >
                          <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup?role=employer">
                    <MagneticButton
                      className="w-full py-4 rounded-xl text-sm font-semibold border-2 transition-all"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      start hiring smarter
                    </MagneticButton>
                  </Link>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Testimonials */}
      <ScrollSection>
        <section
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                loved by teams everywhere
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TiltCard
                  key={index}
                  className="p-6 rounded-2xl border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                  tiltAmount={8}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-current"
                        style={{ color: 'var(--color-warning)' }}
                      />
                    ))}
                  </div>

                  <p
                    className="text-sm mb-6 leading-relaxed"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    "{testimonial.quote}"
                  </p>

                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {testimonial.author}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* FAQ Section */}
      <ScrollSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                got questions?
              </h2>
              <p style={{ color: 'var(--color-textSecondary)' }}>
                Here are some answers to help you get started.
              </p>
            </div>

            <div
              className="p-8 rounded-3xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <FAQAccordion items={faqItems} />
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Final CTA */}
      <ScrollSection>
        <section
          className="py-24 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center animate-bounce-soft"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
                boxShadow: '0 8px 30px rgba(217, 119, 6, 0.3)',
              }}
            >
              <Coffee className="w-10 h-10 text-white" />
            </div>

            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              ready to find where you belong?
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              Join thousands who've already discovered their perfect culture fit.
              It starts with a 15-minute assessment.
            </p>

            <Link to="/auth/signup">
              <MagneticButton
                className="px-10 py-5 rounded-2xl text-lg font-semibold inline-flex items-center gap-3 animate-glow-pulse"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
                strength={0.15}
              >
                start your journey
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </Link>
          </div>
        </section>
      </ScrollSection>

      {/* Footer */}
      <footer
        className="py-10 px-4 sm:px-6 lg:px-8 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CoffeeLogo size="sm" />
            <span
              className="text-sm font-semibold"
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
