import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Users,
  Sparkles,
  Heart,
  Target,
  Coffee,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Brain,
  MessageCircle,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Instagram,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { AmberLogo } from '../ui/AmberLogo';
import { EmberFirefly } from '../ember/EmberFirefly';
import { APP_NAME } from '../../utils/constants';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import {
  FloatingThemeSelector,
  FAQAccordion,
  CursorSpotlight,
  FloatingCoffeeBeans,
  MagneticButton,
  TiltCard,
  ScrollProgress,
  AnimatedBlobs,
  InteractiveGreeting,
  TypewriterText,
} from '.';

const typewriterWords = [
  'Your Personality',
  'Your Values',
  'Your Work Style',
  'Your Culture',
];

const processSteps = [
  {
    number: '01',
    title: 'Take the Assessment',
    description: 'Our Big Five personality assessment reveals your unique work style, values, and preferences in just 15 minutes.',
    icon: Sparkles,
    color: '#F59E0B',
  },
  {
    number: '02',
    title: 'Get Matched by AI',
    description: 'Our AI analyzes your profile against company cultures to find roles where you\'ll truly thrive.',
    icon: Target,
    color: '#10B981',
  },
  {
    number: '03',
    title: 'Connect Over Coffee',
    description: 'Skip the formal interviews. Have genuine conversations with teams before committing.',
    icon: Coffee,
    color: '#8B5CF6',
  },
  {
    number: '04',
    title: 'Land Your Role',
    description: 'Join companies that value who you are, not just what you do. Culture fit guaranteed.',
    icon: Award,
    color: '#EC4899',
  },
];

const valueProps = [
  {
    icon: Brain,
    title: 'Science-Backed Matching',
    description: 'Built on the Big Five personality model — the most validated framework in organizational psychology.',
    color: '#8B5CF6',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Our AI doesn\'t just match keywords. It understands personality dynamics and team culture fit.',
    color: '#F59E0B',
  },
  {
    icon: Coffee,
    title: 'Coffee Chats, Not Interviews',
    description: 'Casual conversations replace cold applications. Meet teams authentically before applying.',
    color: '#10B981',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your personality data stays yours. Control exactly what employers see and when.',
    color: '#EC4899',
  },
];

// Company logos fetched from Clearbit Logo API for exact brand logos
const COMPANIES = [
  { name: 'Google', domain: 'google.com' },
  { name: 'Apple', domain: 'apple.com' },
  { name: 'Meta', domain: 'meta.com' },
  { name: 'Amazon', domain: 'amazon.com' },
  { name: 'Microsoft', domain: 'microsoft.com' },
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'NVIDIA', domain: 'nvidia.com' },
  { name: 'Tesla', domain: 'tesla.com' },
  { name: 'Stripe', domain: 'stripe.com' },
  { name: 'Shopify', domain: 'shopify.com' },
  { name: 'Spotify', domain: 'spotify.com' },
  { name: 'Airbnb', domain: 'airbnb.com' },
  { name: 'Uber', domain: 'uber.com' },
  { name: 'Coinbase', domain: 'coinbase.com' },
  { name: 'Databricks', domain: 'databricks.com' },
  { name: 'OpenAI', domain: 'openai.com' },
  { name: 'Slack', domain: 'slack.com' },
  { name: 'Figma', domain: 'figma.com' },
  { name: 'Notion', domain: 'notion.so' },
  { name: 'Linear', domain: 'linear.app' },
  { name: 'Canva', domain: 'canva.com' },
  { name: 'Vercel', domain: 'vercel.com' },
  { name: 'Datadog', domain: 'datadoghq.com' },
];

function CompanyLogo({ name, domain }: { name: string; domain: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      {!imgError ? (
        <img
          src={`https://logo.clearbit.com/${domain}?size=80`}
          alt={name}
          className="h-8 w-8 rounded-lg object-contain"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}
        >
          {name[0]}
        </div>
      )}
      <span
        className="text-[10px] font-medium tracking-wide"
        style={{ color: 'var(--color-textMuted)' }}
      >
        {name}
      </span>
    </div>
  );
}

const OUR_VALUES = [
  {
    number: '01',
    title: 'Personality Over Paper',
    description: 'We believe who you are matters more than what\'s on your resume. Your personality, values, and work style predict job satisfaction better than any transcript or GPA ever could. The era of judging candidates by grades and credentials is over.',
    color: '#F59E0B',
  },
  {
    number: '02',
    title: 'Authenticity First',
    description: 'No cover letter gymnastics. No keyword stuffing. Just be yourself. Our assessments have no right or wrong answers — only honest ones that lead to better matches. We reward being real, not performing.',
    color: '#8B5CF6',
  },
  {
    number: '03',
    title: 'Science, Not Buzzwords',
    description: 'Built on the Big Five personality model with 40+ years of peer-reviewed research. Every match is grounded in organizational psychology, not gut feelings or vague "culture fit" labels.',
    color: '#10B981',
  },
  {
    number: '04',
    title: 'Conversations Over Applications',
    description: 'Coffee chats replace cold applications. Meet real people on real teams before you ever commit. Building connections should feel human, not transactional. A 15-minute chat tells you more than a 15-page application.',
    color: '#EC4899',
  },
  {
    number: '05',
    title: 'Your Data, Your Rules',
    description: 'Your personality data belongs to you. Full control over what employers can see, when they can see it, and the power to revoke access at any time. Privacy isn\'t a feature — it\'s a right.',
    color: '#06B6D4',
  },
];

const forCandidates = [
  { text: 'Discover your unique work personality', icon: Sparkles },
  { text: 'Get matched based on culture, not keywords', icon: Heart },
  { text: 'See compatibility scores before applying', icon: Target },
  { text: 'Schedule casual coffee chats with teams', icon: Coffee },
];

const forEmployers = [
  { text: 'Define your company culture scientifically', icon: Zap },
  { text: 'Get your Top 10 candidates on a silver platter', icon: Trophy },
  { text: 'AI-ranked candidates by personality fit', icon: TrendingUp },
  { text: 'Reduce turnover with better culture matches', icon: Shield },
];

function Trophy(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return <Award {...props} />;
}

const faqItems = [
  {
    question: 'How does the culture matching actually work?',
    answer: 'Our AI analyzes your Big Five personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) and compares them with company culture profiles. We look at team dynamics, work style preferences, and values alignment to calculate a compatibility score that predicts how well you\'ll fit.',
  },
  {
    question: 'Is Amber free for job seekers?',
    answer: 'Yes! Our free tier lets you take the assessment, browse matches, and connect with employers. Premium plans unlock features like unlimited coffee chats, priority matching, and personalized Ember coaching.',
  },
  {
    question: 'What makes the Big Five assessment special?',
    answer: 'The Big Five is the most scientifically validated personality framework used by psychologists worldwide. Unlike other tests, it measures stable traits that predict workplace behavior and satisfaction. Our assessment is designed specifically for career matching.',
  },
  {
    question: 'What are coffee chats and how do they work?',
    answer: 'Coffee chats are informal 15-30 minute conversations with team members. No pressure, no formal interview questions. Just genuine conversation to see if there\'s mutual interest. Companies can invite you, or you can request them after matching.',
  },
  {
    question: 'How is this different from LinkedIn or job boards?',
    answer: 'Traditional job platforms match based on skills and keywords. Amber matches based on who you are — your personality, values, and work style. We believe culture fit predicts job satisfaction better than a resume ever could.',
  },
];

const demoTraits = [
  { label: 'Openness', value: 82, color: '#8B5CF6' },
  { label: 'Conscientiousness', value: 71, color: '#F59E0B' },
  { label: 'Extraversion', value: 64, color: '#10B981' },
  { label: 'Agreeableness', value: 88, color: '#EC4899' },
  { label: 'Neuroticism', value: 35, color: '#06B6D4' },
];

const demoMatches = [
  { company: 'Notion', role: 'Product Designer', score: 94, color: '#8B5CF6', tags: ['Creative', 'Collaborative'] },
  { company: 'Stripe', role: 'Frontend Engineer', score: 89, color: '#635BFF', tags: ['Innovative', 'Detail-oriented'] },
  { company: 'Spotify', role: 'UX Researcher', score: 85, color: '#1DB954', tags: ['Creative', 'Data-driven'] },
  { company: 'Figma', role: 'Design Engineer', score: 82, color: '#F24E1E', tags: ['Collaborative', 'Fast-paced'] },
];

const demoChatMessages = [
  { from: 'employer', name: 'Sarah', text: "Hey! We loved your personality profile. Free for a coffee chat this week?" },
  { from: 'candidate', name: 'You', text: "Absolutely! I'd love to learn more about the team culture." },
  { from: 'employer', name: 'Sarah', text: "Amazing \u2014 how's Thursday at 2pm? We'll keep it casual \u2615" },
  { from: 'candidate', name: 'You', text: "Perfect, see you then! \ud83c\udf89" },
];

const demoScreens = [
  { step: '01', label: 'Take Assessment', icon: Sparkles, color: '#F59E0B' },
  { step: '02', label: 'Get Matched', icon: Target, color: '#10B981' },
  { step: '03', label: 'Coffee Chat', icon: Coffee, color: '#EC4899' },
];

function ProductDemo() {
  const [activeScreen, setActiveScreen] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2.5;
      });
    }, 100);
    return () => clearInterval(progressInterval);
  }, [activeScreen]);

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Decorative glow */}
      <div
        className="absolute -inset-10 rounded-3xl opacity-15 blur-3xl -z-10"
        style={{ background: 'linear-gradient(135deg, var(--color-accent), #8B5CF6, #10B981)' }}
      />

      {/* Browser chrome frame */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28C840' }} />
          </div>
          <div
            className="flex-1 mx-12 py-1 px-3 rounded-md text-center text-[11px] font-medium"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}
          >
            app.tryamber.com
          </div>
          <div className="w-16" />
        </div>

        {/* Step indicators */}
        <div
          className="flex items-center justify-center gap-1 px-6 py-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {demoScreens.map((screen, i) => (
            <button
              key={screen.step}
              onClick={() => setActiveScreen(i)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: activeScreen === i ? `${screen.color}15` : 'transparent',
                color: activeScreen === i ? screen.color : 'var(--color-textMuted)',
              }}
            >
              <screen.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{screen.label}</span>
              <span className="sm:hidden">{screen.step}</span>
            </button>
          ))}
        </div>

        {/* Screen content */}
        <div className="relative h-80 sm:h-[420px] overflow-hidden">
          {/* Screen 1: Assessment */}
          <div
            className="absolute inset-0 p-6 sm:p-8 transition-all duration-500"
            style={{
              opacity: activeScreen === 0 ? 1 : 0,
              transform: activeScreen === 0 ? 'translateX(0)' : 'translateX(-20px)',
              pointerEvents: activeScreen === 0 ? 'auto' : 'none',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                  Your OCEAN Personality Profile
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                  Based on 48 research-backed questions
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {demoTraits.map((trait, i) => (
                <div key={trait.label} className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium w-28 sm:w-36 text-right"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {trait.label}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        backgroundColor: trait.color,
                        width: activeScreen === 0 ? `${trait.value}%` : '0%',
                        transitionDelay: `${i * 150}ms`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8 tabular-nums" style={{ color: trait.color }}>
                    {trait.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Archetype badge */}
            <div
              className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#8B5CF615' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                  Your Archetype: The Innovator
                </p>
                <p className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>
                  Creative, open-minded, and deeply collaborative
                </p>
              </div>
            </div>
          </div>

          {/* Screen 2: Matches */}
          <div
            className="absolute inset-0 p-6 sm:p-8 transition-all duration-500"
            style={{
              opacity: activeScreen === 1 ? 1 : 0,
              transform: activeScreen === 1 ? 'translateX(0)' : 'translateX(20px)',
              pointerEvents: activeScreen === 1 ? 'auto' : 'none',
            }}
          >
            <div className="mb-5">
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Your Top Culture Matches
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                Ranked by personality compatibility
              </p>
            </div>
            <div className="space-y-2.5">
              {demoMatches.map((match, i) => (
                <div
                  key={match.company}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-500"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    opacity: activeScreen === 1 ? 1 : 0,
                    transform: activeScreen === 1 ? 'translateX(0)' : 'translateX(30px)',
                    transitionDelay: `${i * 100}ms`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: match.color }}
                  >
                    {match.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                      {match.company}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--color-textMuted)' }}>
                      {match.role}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    {match.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[9px] font-medium"
                        style={{ backgroundColor: `${match.color}10`, color: match.color }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Screen 3: Coffee Chat */}
          <div
            className="absolute inset-0 p-6 sm:p-8 transition-all duration-500"
            style={{
              opacity: activeScreen === 2 ? 1 : 0,
              transform: activeScreen === 2 ? 'translateX(0)' : 'translateX(20px)',
              pointerEvents: activeScreen === 2 ? 'auto' : 'none',
            }}
          >
            <div className="mb-5">
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Coffee Chat with Notion
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                Casual conversation · No pressure
              </p>
            </div>
            <div className="space-y-3">
              {demoChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === 'candidate' ? 'justify-end' : 'justify-start'}`}
                  style={{
                    opacity: activeScreen === 2 ? 1 : 0,
                    transform: activeScreen === 2 ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(10px)',
                    transition: `all 0.4s ease-out ${i * 300}ms`,
                  }}
                >
                  <div className={`flex items-end gap-2 max-w-[80%] ${msg.from === 'candidate' ? 'flex-row-reverse' : ''}`}>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                      style={{
                        backgroundColor: msg.from === 'candidate' ? 'var(--color-accent)' : '#8B5CF6',
                        color: '#fff',
                      }}
                    >
                      {msg.from === 'candidate' ? 'Y' : 'S'}
                    </div>
                    <div>
                      <p
                        className={`text-[9px] font-medium mb-0.5 px-1 ${msg.from === 'candidate' ? 'text-right' : ''}`}
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        {msg.name}
                      </p>
                      <div
                        className="px-3.5 py-2 rounded-2xl text-xs leading-relaxed"
                        style={{
                          backgroundColor: msg.from === 'candidate' ? 'var(--color-accent)' : 'var(--color-background)',
                          color: msg.from === 'candidate' ? 'var(--color-accentText)' : 'var(--color-text)',
                          borderBottomRightRadius: msg.from === 'candidate' ? '4px' : undefined,
                          borderBottomLeftRadius: msg.from === 'employer' ? '4px' : undefined,
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
            <div
              className="h-full rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: demoScreens[activeScreen].color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats below */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        {[
          { value: '2,000+', label: 'Assessments Taken' },
          { value: '94%', label: 'Match Satisfaction' },
          { value: '500+', label: 'Coffee Chats Booked' },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <p className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {stat.value}
            </p>
            <p className="text-[10px] sm:text-xs" style={{ color: 'var(--color-textMuted)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrollSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  return (
    <div ref={ref} className={`scroll-animate ${isVisible ? 'visible'  : ''} ${className}`}>
      {children}
    </div>
  );
}

function ValueCard({ value, index }: { value: typeof OUR_VALUES[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`scroll-animate ${isVisible ? 'visible' : ''}`}
    >
      <div
        className="max-w-5xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16`}>
          {/* Number */}
          <div className="flex-shrink-0">
            <div
              className="text-8xl sm:text-9xl font-black select-none"
              style={{ color: value.color, lineHeight: 1, opacity: 0.35 }}
            >
              {value.number}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-xl">
            <div
              className="w-12 h-1 rounded-full mb-6"
              style={{ backgroundColor: value.color }}
            />
            <h3
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              {value.title}
            </h3>
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {value.description}
            </p>
          </div>
        </div>
      </div>
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
                <AmberLogo size="sm" />
              </div>
              <span
                className="text-lg font-semibold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                {APP_NAME}
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
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </MagneticButton>
                </Link>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/auth/signup">
                    <MagneticButton
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accentText)',
                      }}
                    >
                      Get Started
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
            Find Jobs That Fit{' '}
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
            Your personality says more about you than any resume ever could.
            We match you with companies where you'll actually thrive — based on who you are, not what's on paper.
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
                Start Free Assessment
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
                I'm Hiring
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Recruiters From These Companies */}
      <ScrollSection>
        <section className="py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-center text-sm font-medium mb-8 tracking-wide uppercase"
              style={{ color: 'var(--color-textMuted)', letterSpacing: '0.1em' }}
            >
              Recruiters From Leading Companies
            </p>
            <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <div className="flex items-center animate-marquee" style={{ width: 'max-content' }}>
                {/* Duplicate the logos for seamless loop */}
                {[...COMPANIES, ...COMPANIES].map((company, i) => (
                  <div
                    key={`${company.domain}-${i}`}
                    className="flex items-center justify-center px-8 py-3 flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <CompanyLogo name={company.name} domain={company.domain} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Why Amber - Value Props */}
      <ScrollSection>
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {valueProps.map((prop) => (
                <TiltCard
                  key={prop.title}
                  className="p-6 rounded-2xl border cursor-default"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                  tiltAmount={5}
                >
                  <div
                    className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${prop.color}15` }}
                  >
                    <prop.icon className="w-6 h-6" style={{ color: prop.color }} />
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {prop.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {prop.description}
                  </p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Product Demo — See Amber in Action */}
      <ScrollSection>
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                See Amber in Action
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                From personality assessment to coffee chat — watch how culture-first matching works.
              </p>
            </div>
            <ProductDemo />
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
                From Assessment to Offer in 4 Steps
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

      {/* Meet Ember - AI Agent Section */}
      <ScrollSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div
              className="p-10 sm:p-14 rounded-3xl border relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Decorative glow */}
              <div
                className="absolute top-0 right-0 w-60 h-60 opacity-10 rounded-full blur-3xl"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              <div
                className="absolute bottom-0 left-0 w-40 h-40 opacity-5 rounded-full blur-3xl"
                style={{ backgroundColor: '#8B5CF6' }}
              />

              <div className="relative flex flex-col lg:flex-row items-center gap-10">
                {/* Ember Firefly */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <EmberFirefly size="xl" mood="happy" animated />
                    <div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full blur-md"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.3)' }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center lg:text-left">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    AI-Powered
                  </div>

                  <h2
                    className="text-3xl sm:text-4xl font-bold mb-4"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Meet Ember
                  </h2>
                  <p
                    className="text-lg mb-6 max-w-xl"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    Your personal AI career companion. Ember analyzes personality data, identifies your
                    archetype, and finds matches you'd never discover on your own.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <Brain className="w-5 h-5 mb-2" style={{ color: '#8B5CF6' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Personality Analysis
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                        Deep archetype mapping
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <MessageCircle className="w-5 h-5 mb-2" style={{ color: '#10B981' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Smart Matching
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                        Culture-first recommendations
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <Coffee className="w-5 h-5 mb-2" style={{ color: '#EC4899' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Coffee Chats
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                        Casual team conversations
                      </p>
                    </div>
                  </div>

                  <Link to="/auth/signup">
                    <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Try Ember Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Our Values - Wealthsimple-style scroll */}
      <section
        style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
      >
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              What We Believe
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              We're building a world where your personality opens more doors than your pedigree.
            </p>
          </div>
        </div>

        {OUR_VALUES.map((value, index) => (
          <ValueCard key={value.number} value={value} index={index} />
        ))}
      </section>

      {/* Two-Sided Value Props */}
      <ScrollSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Built for Both Sides
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Whether you're looking for your next role or your next hire, Amber works for you.
              </p>
            </div>

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
                    For Job Seekers
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
                      Find Your Match
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
                    For Employers
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
                      Start Hiring Smarter
                    </MagneticButton>
                  </Link>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* FAQ Section */}
      <ScrollSection>
        <section
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Got Questions?
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
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <EmberFirefly size="lg" mood="excited" animated />
            </div>

            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Ready to Find Where You Belong?
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              Discover your personality profile and get matched with companies
              that value who you are. It starts with a 15-minute assessment.
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
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </Link>
          </div>
        </section>
      </ScrollSection>

      {/* Footer */}
      <footer
        className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t"
        style={{
          backgroundColor: 'var(--color-backgroundSecondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Main grid - Brand + Links + Newsletter all in one row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
            {/* Brand - spans 2 cols on lg */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <AmberLogo size="sm" />
                <span
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {APP_NAME}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Culture-first job matching powered by personality science and AI.
                Who you are matters more than what's on your resume.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-2">
                {[
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Github, label: 'GitHub' },
                ].map(social => (
                  <button
                    key={social.label}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-textMuted)',
                    }}
                    title={social.label}
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
            {/* Product */}
            <div>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Product
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Personality Assessment', href: '/auth/signup' },
                  { label: 'Culture Matching', href: '/auth/signup' },
                  { label: 'Coffee Chats', href: '/auth/signup' },
                  { label: 'Meet Ember', href: '/auth/signup' },
                ].map(item => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                For Employers
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Post a Role', href: '/auth/signup?role=employer' },
                  { label: 'Browse Candidates', href: '/auth/signup?role=employer' },
                  { label: 'Top 10 Matches', href: '/auth/signup?role=employer' },
                  { label: 'Pricing', href: '/app/pricing' },
                  { label: 'Enterprise', href: '/auth/signup?role=employer' },
                ].map(item => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Resources
              </h4>
              <ul className="space-y-2.5">
                {[
                  'Blog',
                  'The Science',
                  'Help Center',
                  'API Docs',
                  'Status',
                ].map(label => (
                  <li key={label}>
                    <span
                      className="text-sm cursor-pointer transition-colors hover:underline"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Company
              </h4>
              <ul className="space-y-2.5">
                {[
                  'About Us',
                  'Careers',
                  'Press',
                ].map(label => (
                  <li key={label}>
                    <span
                      className="text-sm cursor-pointer transition-colors hover:underline"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {label}
                    </span>
                  </li>
                ))}
                <li>
                  <span className="text-sm flex items-center gap-2" style={{ color: 'var(--color-textSecondary)' }}>
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    Toronto, ON
                  </span>
                </li>
                <li>
                  <span className="text-sm flex items-center gap-2" style={{ color: 'var(--color-textSecondary)' }}>
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    hello@tryamber.com
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter - compact row */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 rounded-xl"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            <div>
              <h4
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Stay in the Loop
              </h4>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Personality science, hiring trends, and product updates.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 sm:w-56 px-4 py-2 rounded-lg text-sm border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved. Made with love in Toronto.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-textMuted)' }}>
                Privacy Policy
              </span>
              <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-textMuted)' }}>
                Terms of Service
              </span>
              <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-textMuted)' }}>
                Cookie Policy
              </span>
              <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-textMuted)' }}>
                Accessibility
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
