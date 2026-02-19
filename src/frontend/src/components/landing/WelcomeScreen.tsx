import {
  ArrowRight,
  Award,
  Brain,
  Briefcase,
  ChevronRight,
  Coffee,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatedBlobs,
  CursorSpotlight,
  FAQAccordion,
  FloatingCoffeeBeans,
  FloatingThemeSelector,
  InteractiveGreeting,
  MagneticButton,
  ScrollProgress,
  TiltCard,
  TypewriterText,
} from '.';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { EmberFirefly } from '../ember/EmberFirefly';
import { Button } from '../ui/Button';
import { LandingFooter } from './LandingFooter';
import { LandingNav } from './LandingNav';

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

// Company logos served via our backend caching proxy (/api/logo?domain=...)
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function CompanyLogo({ name, domain }: { name: string; domain: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      {!imgError ? (
        <img
          src={`${API_BASE}/api/logo?domain=${domain}`}
          alt={name}
          className="h-8 w-auto max-w-[140px] rounded-lg object-contain"
          style={{ opacity: 0.9 }}
          loading="lazy"
          decoding="async"
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
  { label: 'Conscientiousness', value: 71, color: '#10B981' },
  { label: 'Extraversion', value: 64, color: '#F59E0B' },
  { label: 'Agreeableness', value: 88, color: '#EC4899' },
  { label: 'Stability', value: 35, color: '#06B6D4' },
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
  { from: 'employer', name: 'Sarah', text: "Amazing \u2014 how's Thursday at 2pm? We'll keep it casual." },
  { from: 'candidate', name: 'You', text: "Perfect, see you then!" },
];

function ProductDemo() {
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const CYCLE = 24000;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setElapsed(prev => (prev + 50) % CYCLE);
    }, 50);
    return () => clearInterval(timer);
  }, [isPaused]);

  const t = elapsed;

  // Smoothstep easing
  const smooth = (x: number) => {
    const c = Math.max(0, Math.min(1, x));
    return c * c * (3 - 2 * c);
  };

  // Scene visibility: returns 0-1 opacity
  const vis = (fadeInStart: number, fadeInEnd: number, fadeOutStart: number, fadeOutEnd: number) => {
    if (t < fadeInStart || t > fadeOutEnd) return 0;
    if (t >= fadeInEnd && t <= fadeOutStart) return 1;
    if (t < fadeInEnd) return smooth((t - fadeInStart) / (fadeInEnd - fadeInStart));
    return smooth(1 - (t - fadeOutStart) / (fadeOutEnd - fadeOutStart));
  };

  // Progress 0-1 within time range
  const prog = (start: number, end: number) => {
    if (t <= start) return 0;
    if (t >= end) return 1;
    return (t - start) / (end - start);
  };

  // Scene opacities - 6 scenes across 24s
  const s1 = vis(0, 600, 2800, 3400);           // Welcome
  const s2 = vis(3000, 3600, 6600, 7200);       // Assessment
  const s3 = vis(6800, 7400, 10200, 10800);     // Personality
  const s4 = vis(10400, 11000, 13800, 14400);   // Matches
  const s5 = vis(14000, 14600, 17000, 17600);   // Coffee Chat
  const s6 = vis(17200, 17800, 23400, 24000);   // Ember

  // Assessment: scenario options stagger + selection
  const mcOptionProgress = prog(3600, 5200);
  const mcSelectionProgress = smooth(prog(5400, 5800));

  // Personality bars: animated fill
  const barProgress = prog(7400, 9800);

  // Match cards: staggered slide-in with counting scores
  const matchProgress = prog(11000, 13400);

  // Chat messages: staggered pop-in
  const chatProgress = prog(14600, 16600);

  // Ember finale
  const ringProgress = smooth(prog(17800, 19000));
  const emberScale = smooth(prog(18000, 19200));
  const emberTextOpacity = smooth(prog(19200, 20000));
  const amberTextOpacity = smooth(prog(20200, 21000));
  const lineReveal = smooth(prog(20800, 21400));

  // Progress bar
  const progressPercent = (t / CYCLE) * 100;

  // Step indicator
  const steps = ['Welcome', 'Assessment', 'Results', 'Matches', 'Coffee Chat', 'Ember'];
  const activeStep = s1 > 0 ? 0 : s2 > 0 ? 1 : s3 > 0 ? 2 : s4 > 0 ? 3 : s5 > 0 ? 4 : 5;

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
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

        {/* Content area */}
        <div className="relative h-[360px] sm:h-[460px] overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>

          {/* ===== Scene 1: Welcome ===== */}
          {s1 > 0 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-8"
              style={{ opacity: s1, transform: `scale(${0.95 + s1 * 0.05})` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                </div>
                <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--color-accent)', letterSpacing: '0.1em' }}>
                  Welcome to Amber
                </span>
              </div>
              <h3
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 max-w-lg leading-tight"
                style={{ color: 'var(--color-text)' }}
              >
                What if your personality was your best resume?
              </h3>
              <p className="text-sm text-center max-w-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                Take a 15-minute assessment. Get matched with companies where you'll thrive.
              </p>
            </div>
          )}

          {/* ===== Scene 2: Assessment (Scenario Options) ===== */}
          {s2 > 0 && (
            <div
              className="absolute inset-0 p-5 sm:p-7"
              style={{ opacity: s2, transform: `translateY(${(1 - s2) * 15}px)` }}
            >
              {/* Gradient progress bar across top */}
              <div className="absolute top-0 left-0 right-0 h-1">
                <div className="h-full" style={{ width: '25%', background: 'linear-gradient(90deg, var(--color-accent), var(--color-accentHover))' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-4 mt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Personality Assessment</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>Question 12 of 48</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}>
                  Scenario
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Your team is brainstorming and someone proposes an unconventional approach. You would most likely...
              </h3>

              {/* 2-column scenario grid (matching real ScenarioOptions) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: 'A', text: 'Champion the idea and help build on it' },
                  { label: 'B', text: 'Ask probing questions to understand their reasoning' },
                  { label: 'C', text: 'Suggest testing it alongside a proven method' },
                  { label: 'D', text: 'Advocate for sticking with what has worked before' },
                ].map((option, i) => {
                  const optionProg = smooth(Math.max(0, Math.min(1, (mcOptionProgress - i * 0.15) / 0.25)));
                  const isSelected = i === 0;
                  const selected = isSelected && mcSelectionProgress > 0;
                  return (
                    <div
                      key={option.label}
                      className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl"
                      style={{
                        backgroundColor: selected ? 'rgba(217, 119, 6, 0.06)' : 'var(--color-surface)',
                        border: selected ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                        opacity: optionProg,
                        transform: `translateY(${(1 - optionProg) * 15}px)`,
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: selected ? 'var(--color-accent)' : 'transparent',
                          border: selected ? 'none' : '2px solid var(--color-border)',
                          color: selected ? 'white' : 'var(--color-textMuted)',
                        }}
                      >
                        {selected ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-bold">{option.label}</span>
                        )}
                      </div>
                      <span className="text-[11px] sm:text-xs leading-snug" style={{ color: 'var(--color-text)' }}>
                        {option.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1 mt-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="rounded-full" style={{
                    width: i === 11 ? 16 : 5, height: 5,
                    backgroundColor: i === 11 ? 'var(--color-accent)' : i < 11 ? 'var(--color-success)' : 'var(--color-border)',
                  }} />
                ))}
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-textMuted)', opacity: 0.3 }} />
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-textMuted)', opacity: 0.3 }} />
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-textMuted)', opacity: 0.3 }} />
              </div>
            </div>
          )}

          {/* ===== Scene 3: OCEAN Bar Chart ===== */}
          {s3 > 0 && (
            <div
              className="absolute inset-0 p-5 sm:p-7"
              style={{ opacity: s3, transform: `translateY(${(1 - s3) * 15}px)` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                    <Brain className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Your Personality Profile</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>Big Five OCEAN dimensions</p>
                  </div>
                </div>
              </div>

              {/* OCEAN bars */}
              <div className="mt-4 space-y-3 sm:space-y-4">
                {demoTraits.map((trait, i) => {
                  const traitProg = smooth(Math.max(0, Math.min(1, (barProgress - i * 0.12) / 0.3)));
                  const displayValue = Math.round(trait.value * traitProg);
                  return (
                    <div key={trait.label} style={{ opacity: traitProg, transform: `translateX(${(1 - traitProg) * 20}px)` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: trait.color }} />
                          <span className="text-[11px] sm:text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{trait.label}</span>
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold tabular-nums" style={{ color: trait.color }}>{displayValue}%</span>
                      </div>
                      <div className="h-2.5 sm:h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${trait.value * traitProg}%`,
                            background: `linear-gradient(90deg, ${trait.color}, ${trait.color}88)`,
                            transition: 'none',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Archetype badge */}
              <div className="flex items-center justify-center mt-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: '#8B5CF615',
                    color: '#8B5CF6',
                    border: '1px solid #8B5CF625',
                    opacity: smooth(prog(8800, 9600)),
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-semibold">Your Archetype: The Innovator</span>
                  <span className="text-[9px] hidden sm:inline" style={{ color: 'var(--color-textMuted)' }}>Creative, Visionary, Open-minded</span>
                </div>
              </div>
            </div>
          )}

          {/* ===== Scene 4: Top Matches with Score Rings ===== */}
          {s4 > 0 && (
            <div
              className="absolute inset-0 p-5 sm:p-7"
              style={{ opacity: s4, transform: `translateY(${(1 - s4) * 15}px)` }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                    <Trophy className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Your Top Matches</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>Ranked by personality compatibility</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mt-3">
                {demoMatches.map((match, i) => {
                  const cardProg = smooth(Math.max(0, Math.min(1, (matchProgress - i * 0.16) / 0.25)));
                  const displayScore = Math.round(match.score * cardProg);
                  const scoreColor = displayScore >= 90 ? 'var(--color-success)' : displayScore >= 80 ? 'var(--color-accent)' : 'var(--color-warning, #F59E0B)';
                  const ringR = 16;
                  const ringCirc = 2 * Math.PI * ringR;
                  const ringOffset = ringCirc * (1 - (match.score / 100) * cardProg);
                  return (
                    <div
                      key={match.company}
                      className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: i === 0 && cardProg > 0.5 ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        opacity: cardProg,
                        transform: `translateX(${(1 - cardProg) * 40}px)`,
                      }}
                    >
                      {/* Score Ring */}
                      <div className="relative flex-shrink-0">
                        <svg width="40" height="40" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r={ringR} fill="none" stroke="var(--color-border)" strokeWidth="3" />
                          <circle
                            cx="20" cy="20" r={ringR}
                            fill="none"
                            stroke={scoreColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={ringCirc}
                            strokeDashoffset={ringOffset}
                            transform="rotate(-90 20 20)"
                          />
                          <text x="20" y="21.5" textAnchor="middle" fontSize="9" fontWeight="700" fill={scoreColor}>
                            {displayScore}
                          </text>
                        </svg>
                        {i < 3 && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold"
                            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                          >
                            {i + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{match.role}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--color-textSecondary)' }}>{match.company}</p>
                        <div className="flex gap-1.5 mt-1">
                          {match.tags.map(tag => (
                            <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== Scene 5: Coffee Chat ===== */}
          {s5 > 0 && (
            <div
              className="absolute inset-0 p-5 sm:p-7"
              style={{ opacity: s5, transform: `translateY(${(1 - s5) * 15}px)` }}
            >
              {/* Coffee chat card header */}
              <div
                className="p-4 rounded-2xl border mb-3"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}>
                    <Coffee className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Sarah from Notion</p>
                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>Confirmed</span>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>re: Product Designer - 94% match</p>
                    <div className="flex items-center gap-2.5 mt-1.5 text-[9px]" style={{ color: 'var(--color-textMuted)' }}>
                      <span>Thu 2:00 PM</span>
                      <span>15 min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat messages — staggered pop-in */}
              <div className="space-y-2.5">
                {demoChatMessages.map((msg, i) => {
                  const msgProg = smooth(Math.max(0, Math.min(1, (chatProgress - i * 0.2) / 0.2)));
                  return (
                    <div
                      key={i}
                      className={`flex ${msg.from === 'candidate' ? 'justify-end' : 'justify-start'}`}
                      style={{
                        opacity: msgProg,
                        transform: `scale(${0.9 + msgProg * 0.1}) translateY(${(1 - msgProg) * 10}px)`,
                      }}
                    >
                      <div className={`flex items-end gap-1.5 max-w-[80%] ${msg.from === 'candidate' ? 'flex-row-reverse' : ''}`}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                          style={{ backgroundColor: msg.from === 'candidate' ? 'var(--color-accent)' : '#8B5CF6', color: '#fff' }}>
                          {msg.from === 'candidate' ? 'Y' : 'S'}
                        </div>
                        <div
                          className="px-3 py-1.5 rounded-2xl text-[11px] leading-relaxed"
                          style={{
                            backgroundColor: msg.from === 'candidate' ? 'var(--color-accent)' : 'var(--color-surface)',
                            color: msg.from === 'candidate' ? 'var(--color-accentText)' : 'var(--color-text)',
                            borderBottomRightRadius: msg.from === 'candidate' ? '4px' : undefined,
                            borderBottomLeftRadius: msg.from === 'employer' ? '4px' : undefined,
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== Scene 6: Ember Finale ===== */}
          {s6 > 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center p-6 sm:p-8"
              style={{ opacity: s6 }}
            >
              {/* Radial ambient glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, ${0.1 * emberScale}) 0%, rgba(139, 92, 246, ${0.05 * emberScale}) 35%, transparent 65%)`,
                }}
              />

              {/* Concentric rings - centered on ember */}
              {[0, 1, 2].map(i => (
                <div
                  key={`ring-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: `${(120 + i * 80) * ringProgress}px`,
                    height: `${(120 + i * 80) * ringProgress}px`,
                    border: `1px solid rgba(245, 158, 11, ${(0.18 - i * 0.05) * ringProgress})`,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}

              {/* Orbiting particles */}
              {[...Array(12)].map((_, i) => {
                const baseAngle = (t / 2500) * Math.PI + i * (Math.PI * 2 / 12);
                const radius = 60 + (i % 3) * 25;
                const size = i % 4 === 0 ? 3.5 : i % 3 === 0 ? 3 : 2;
                const colors = ['#F59E0B', '#8B5CF6', '#10B981', '#F59E0B'];
                return (
                  <div
                    key={`p-${i}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: colors[i % 4],
                      top: `calc(50% + ${Math.sin(baseAngle) * radius * emberScale}px)`,
                      left: `calc(50% + ${Math.cos(baseAngle) * radius * emberScale}px)`,
                      opacity: emberScale * (0.3 + 0.35 * Math.sin(baseAngle * 2)),
                    }}
                  />
                );
              })}

              {/* Content stack */}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Ember character */}
                <div style={{ transform: `scale(${emberScale})`, opacity: emberScale }}>
                  <EmberFirefly size="xl" mood="excited" animated />
                </div>

                {/* Subtitle label */}
                <p
                  className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase mt-6 mb-2"
                  style={{ color: 'var(--color-accent)', opacity: emberTextOpacity }}
                >
                  Your AI Career Guide
                </p>

                {/* Main title */}
                <h3
                  className="text-3xl sm:text-4xl font-bold animate-gradient-text leading-tight"
                  style={{ opacity: amberTextOpacity, transform: `translateY(${(1 - amberTextOpacity) * 15}px)` }}
                >
                  Meet Ember
                </h3>

                {/* Animated horizontal line */}
                <div
                  className="h-px mt-4 mb-4 rounded-full"
                  style={{
                    width: `${lineReveal * 140}px`,
                    background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
                    opacity: lineReveal,
                  }}
                />

                {/* Tagline */}
                <p
                  className="text-sm sm:text-base max-w-[280px] leading-relaxed"
                  style={{
                    color: 'var(--color-textSecondary)',
                    opacity: amberTextOpacity,
                    transform: `translateY(${(1 - amberTextOpacity) * 10}px)`,
                  }}
                >
                  Discover where you truly belong
                </p>

                {/* CTA */}
                {amberTextOpacity > 0.8 && (
                  <Link to="/auth/signup" className="mt-6" style={{ opacity: smooth((amberTextOpacity - 0.8) / 0.2) }}>
                    <button
                      className="group px-7 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 animate-glow-pulse transition-all"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}
                    >
                      Begin Your Story
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 px-4 py-2 border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
          {steps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className="px-2 py-0.5 rounded-full text-[9px] font-medium transition-colors"
                style={{
                  backgroundColor: activeStep === i ? 'var(--color-accent)' : 'transparent',
                  color: activeStep === i ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                }}
              >
                {step}
              </div>
              {i < steps.length - 1 && (
                <div className="w-2 h-px mx-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-0.5 relative" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-full"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--color-accent), #8B5CF6, #10B981)',
              transition: 'none',
            }}
          />
        </div>
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
      <LandingNav />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 h-screen flex flex-col justify-center">
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
      <LandingFooter />
    </div>
  );
}
