import {
  ArrowRight,
  Brain,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Heart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatedBlobs,
  CursorSpotlight,
  FloatingCoffeeBeans,
  InteractiveGreeting,
  MagneticButton,
  ScrollProgress,
  TiltCard,
  TypewriterText,
} from '.';
import { ProductShowcase } from './ProductShowcase';
import { LiveStatsSection } from './LiveStatsSection';
import { FeatureBento } from './FeatureBento';
import { EmberFirefly } from '../ember/EmberFirefly';
import { LandingFooter } from './LandingFooter';
import { LandingNav } from './LandingNav';

const typewriterWords = [
  'Your Personality',
  'Your Values',
  'Your Work Style',
  'Your Culture',
];


const valueProps = [
  {
    icon: Brain,
    title: 'Science-Backed Matching',
    description: 'Built on the Big Five personality model, the most validated framework in organizational psychology. Your results actually mean something.',
    color: '#8B5CF6',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Our AI doesn\'t just match keywords. It understands personality dynamics and team culture fit to find where you truly belong.',
    color: '#F59E0B',
  },
  {
    icon: Coffee,
    title: 'Coffee Chats, Not Interviews',
    description: 'Skip the formal application. Have a real conversation with a real team before anyone has decided anything. Low pressure, real connection.',
    color: '#10B981',
  },
  {
    icon: Heart,
    title: 'People Over Paper',
    description: 'Your resume is not who you are. The most important things about you as a teammate don\'t show up on paper. We think those should come first.',
    color: '#EC4899',
  },
];

// Company logos served via our backend caching proxy (/api/logo?domain=...)
const COMPANIES_ROW1 = [
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
];

const COMPANIES_ROW2 = [
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
    <div className="flex items-center justify-center">
      {!imgError ? (
        <img
          src={`${API_BASE}/api/logo?domain=${domain}`}
          alt={name}
          className="h-8 w-auto max-w-[140px] rounded-lg object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="h-8 px-3 rounded-lg flex items-center justify-center text-xs font-bold opacity-50 hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}
        >
          {name}
        </div>
      )}
    </div>
  );
}

const OUR_VALUES = [
  {
    icon: Heart,
    title: 'People Over Paper',
    quote: 'Your resume is not who you are. It does not capture how you light up a brainstorm, how you show up for teammates on hard days, or why people trust you in a room. Those are the things that actually matter at work, and they deserve to come first. We built Amber because we believe the best hire is never just the best applicant on paper.',
    color: '#F59E0B',
  },
  {
    icon: Users,
    title: 'Culture Is Not A Perk',
    quote: 'Where you work shapes who you become. A bad culture fit does not just hold someone back, it slowly changes who they are. And the right one can unlock potential they did not even know was there. Culture is not a ping pong table or free snacks. It is the invisible force that determines whether someone thrives or just survives.',
    color: '#8B5CF6',
  },
  {
    icon: Zap,
    title: 'Networking Should Not Require A Network',
    quote: 'Most jobs are filled through people, not portals. But right now, that mostly benefits people who already have connections, the right school, or the right zip code. We think a first-gen student with the right personality deserves the same warm introduction as someone with a Rolodex full of VPs. Amber creates those introductions for everyone.',
    color: '#10B981',
  },
  {
    icon: Shield,
    title: 'Honesty Over Hype',
    quote: 'We will never inflate a match score to make you feel good. If there is friction, we will tell you. If a role is not right, we will say so. Every match comes with a plain-language breakdown of strengths, potential challenges, and what to keep in mind. That kind of honesty is rare, and it is exactly what makes Amber worth trusting.',
    color: '#EC4899',
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
  { text: 'Get your best candidates on a silver platter', icon: Trophy },
  { text: 'AI-ranked candidates by personality fit', icon: TrendingUp },
  { text: 'Reduce turnover with better culture matches', icon: Shield },
];



const seekerStories = [
  {
    quote: "For the first time, I didn't have to pretend to be someone else. Amber matched me with a team that genuinely values who I am. Three coffee chats later, I found my people.",
    name: 'Priya M.',
    role: 'Product Designer',
    company: 'Notion',
    archetype: 'The Visionary',
    color: '#8B5CF6',
  },
  {
    quote: "As a first-gen student with no connections, I honestly thought doors like these weren't meant for me. Amber changed that. It gave me the warm intro my resume never could.",
    name: 'Marcus T.',
    role: 'Software Engineer',
    company: 'Stripe',
    archetype: 'The Builder',
    color: '#635BFF',
  },
  {
    quote: "The assessment actually made me smile. And the matches? Scary accurate. I wake up excited for work now, and I never thought I'd say that.",
    name: 'Jordan K.',
    role: 'UX Researcher',
    company: 'Spotify',
    archetype: 'The Explorer',
    color: '#1DB954',
  },
  {
    quote: "200+ applications, zero responses. On Amber, my third coffee chat turned into a role I love. Sometimes the right opportunity just needs the right introduction.",
    name: 'Anika R.',
    role: 'Data Analyst',
    company: 'Shopify',
    archetype: 'The Connector',
    color: '#96BF48',
  },
  {
    quote: "Every other platform made me feel like a number. Amber made me feel like a person. Found a team that gets me in two weeks. Still pinching myself.",
    name: 'David L.',
    role: 'Frontend Engineer',
    company: 'Vercel',
    archetype: 'The Innovator',
    color: '#F59E0B',
  },
];

const employerStories = [
  {
    quote: "We hired three people through Amber last quarter. Every single one feels like they've been here for years. That's what real culture fit looks like.",
    name: 'Sarah L.',
    role: 'Head of People',
    company: 'Linear',
    archetype: 'The Strategist',
    color: '#5E6AD2',
  },
  {
    quote: "Our Amber hires don't just stay, they thrive. 94% retention after one year. Turns out when people feel like they belong, they stick around.",
    name: 'James W.',
    role: 'VP of Talent',
    company: 'Figma',
    archetype: 'The Architect',
    color: '#A259FF',
  },
  {
    quote: "The coffee chats feel like meeting a future teammate, not interviewing a stranger. That warmth carries into the work. Our team has never been more connected.",
    name: 'Elena K.',
    role: 'Engineering Manager',
    company: 'Notion',
    archetype: 'The Catalyst',
    color: '#8B5CF6',
  },
  {
    quote: "At our stage, every hire shapes the culture. Amber helped us build a founding team that genuinely cares about each other. You can't put a price on that.",
    name: 'Raj P.',
    role: 'Co-Founder & CEO',
    company: 'Stealth Startup',
    archetype: 'The Pioneer',
    color: '#EC4899',
  },
  {
    quote: "We used to spend months searching. Now the right people find us. Amber doesn't just fill roles, it builds teams that actually want to be together.",
    name: 'Mei C.',
    role: 'Head of Recruiting',
    company: 'Databricks',
    archetype: 'The Optimizer',
    color: '#EF4444',
  },
];

function TestimonialCarousel() {
  const [tab, setTab] = useState<'seekers' | 'employers'>('seekers');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stories = tab === 'seekers' ? seekerStories : employerStories;

  // With 5 stories and 3 visible, we have pages 0, 1, 2 (last page shows cards 2,3,4)
  const maxPage = Math.max(0, stories.length - 3);

  const goNext = useCallback(() => setActiveIndex(prev => prev >= maxPage ? 0 : prev + 1), [maxPage]);
  const goPrev = useCallback(() => setActiveIndex(prev => prev <= 0 ? maxPage : prev - 1), [maxPage]);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(goNext, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, goNext]);

  const handleTabSwitch = (newTab: 'seekers' | 'employers') => {
    if (newTab === tab) return;
    setIsTabSwitching(true);
    setTimeout(() => {
      setTab(newTab);
      setActiveIndex(0);
      setIsTabSwitching(false);
    }, 200);
  };

  return (
    <div className="space-y-8">
      {/* Toggle */}
      <div className="flex justify-center">
        <div
          className="inline-flex rounded-full p-1.5 gap-1"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
        >
          <button
            onClick={() => handleTabSwitch('seekers')}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
            style={{
              backgroundColor: tab === 'seekers' ? 'var(--color-accent)' : 'transparent',
              color: tab === 'seekers' ? 'var(--color-accentText)' : 'var(--color-textMuted)',
              boxShadow: tab === 'seekers' ? '0 4px 15px rgba(245, 158, 11, 0.3)' : 'none',
            }}
          >
            Job Seekers
          </button>
          <button
            onClick={() => handleTabSwitch('employers')}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
            style={{
              backgroundColor: tab === 'employers' ? 'var(--color-accent)' : 'transparent',
              color: tab === 'employers' ? 'var(--color-accentText)' : 'var(--color-textMuted)',
              boxShadow: tab === 'employers' ? '0 4px 15px rgba(245, 158, 11, 0.3)' : 'none',
            }}
          >
            Employers
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Arrow buttons */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
        </button>

        {/* Cards track */}
        <div className="overflow-hidden">
          <div
            className="flex gap-5 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(calc(-${activeIndex} * (33.333% + 6.67px)))`,
              opacity: isTabSwitching ? 0 : 1,
              transition: isTabSwitching ? 'opacity 0.2s ease' : 'transform 0.5s ease, opacity 0.2s ease',
            }}
          >
            {stories.map((s, i) => (
              <div
                key={`${tab}-${i}`}
                className="flex-shrink-0"
                style={{ width: 'calc(33.333% - 13.33px)' }}
              >
                <div
                  className="rounded-2xl border p-6 h-full flex flex-col relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {/* Subtle top glow */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-40"
                    style={{ backgroundColor: s.color }}
                  />

                  {/* Quote */}
                  <div
                    className="text-3xl font-serif leading-none mb-2 select-none"
                    style={{ color: `${s.color}30` }}
                  >
                    &ldquo;
                  </div>
                  <p
                    className="text-sm leading-relaxed flex-1 mb-5"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {s.quote}
                  </p>

                  {/* Profile */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: `${s.color}15`, color: s.color }}
                    >
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {s.name}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        {s.role} at {s.company}
                      </p>
                    </div>
                  </div>
                  {/* Archetype badge */}
                  <div
                    className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold mt-3 self-start"
                    style={{ backgroundColor: `${s.color}12`, color: s.color }}
                  >
                    {s.archetype}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: maxPage + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeIndex === i ? 24 : 8,
                height: 8,
                backgroundColor: activeIndex === i ? 'var(--color-accent)' : 'var(--color-border)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const valuePropTabs = ['Science', 'AI', 'Coffee Chats', 'People'];

const valuePropDetails = [
  {
    stat: '40+',
    statLabel: 'Years Of Research',
    bullets: [
      'Built on the Big Five (OCEAN) model, the gold standard in personality science',
      'Maps you to a unique archetype like The Innovator or The Connector',
      'Tailored for career matching, not a repurposed personality quiz',
    ],
  },
  {
    stat: '2-Way',
    statLabel: 'Compatibility Scoring',
    bullets: [
      'Scores compatibility from both sides with a plain-language breakdown',
      'Highlights strengths, friction points, and what to keep in mind',
      'No black box, just transparent insight you can trust and act on',
    ],
  },
  {
    stat: '15 Min',
    statLabel: 'Casual Conversations',
    bullets: [
      'Casual conversations with real team members, no formalities',
      'Both candidates and employers can initiate, so interest goes both ways',
      'Feedback after every chat keeps the community honest and helpful',
    ],
  },
  {
    stat: '80%',
    statLabel: 'Jobs Filled Via People',
    bullets: [
      'Most jobs are filled through people, not applications. Amber levels the field',
      'No cover letters or keyword stuffing. Your personality speaks for itself',
      'Built by students who saw great people get overlooked by a broken system',
    ],
  },
];

function ValuePropTabs() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right
  const [isAnimating, setIsAnimating] = useState(false);
  const prop = valueProps[active];
  const details = valuePropDetails[active];
  const Icon = prop.icon;

  const handleSwitch = (i: number) => {
    if (i === active || isAnimating) return;
    setDirection(i > active ? 1 : -1);
    setIsAnimating(true);
    setTimeout(() => {
      setActive(i);
      setTimeout(() => setIsAnimating(false), 50);
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Toggle bar - floating pill */}
      <div className="flex justify-center">
        <div
          className="inline-flex rounded-full p-1.5 gap-1"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
        >
          {valuePropTabs.map((label, i) => (
            <button
              key={label}
              onClick={() => handleSwitch(i)}
              className="relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                backgroundColor: active === i ? prop.color : 'transparent',
                color: active === i ? '#fff' : 'var(--color-textMuted)',
                boxShadow: active === i ? `0 4px 15px ${prop.color}40` : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content card */}
      <div
        className="rounded-3xl border relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${prop.color}12 0%, transparent 60%)`,
          }}
        />

        {/* Split layout */}
        <div
          className="relative flex flex-col md:flex-row"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? `translateX(${direction * 30}px)` : 'translateX(0)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          {/* Left: Visual showcase */}
          <div
            className="flex-shrink-0 md:w-[320px] p-10 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r relative overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* Amber glow pulse behind icon */}
            <div className="relative mb-6">
              <motion.div
                className="absolute rounded-2xl"
                style={{
                  inset: -8,
                  background: `radial-gradient(circle, ${prop.color}30, transparent 70%)`,
                  filter: 'blur(12px)',
                }}
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div
                className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: `${prop.color}15`,
                }}
              >
                <Icon className="w-10 h-10" style={{ color: prop.color }} />
              </div>
            </div>
            <div
              className="text-6xl font-black tracking-tight"
              style={{ color: prop.color }}
            >
              {details.stat}
            </div>
            <div
              className="text-xs font-semibold uppercase tracking-widest mt-1.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {details.statLabel}
            </div>
          </div>

          {/* Right: Text content */}
          <div className="flex-1 p-10">
            <h3
              className="text-3xl sm:text-4xl font-serif font-normal tracking-tight mb-5"
              style={{ color: 'var(--color-text)' }}
            >
              {prop.title}
            </h3>
            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {prop.description}
            </p>

            {/* Bullet points */}
            <ul className="space-y-3.5">
              {details.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${prop.color}12` }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: prop.color }}
                    />
                  </div>
                  <span
                    className="text-base leading-relaxed"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          className="h-1 transition-all duration-500"
          style={{
            backgroundColor: prop.color,
          }}
        />
      </div>
    </div>
  );
}

function ScrollSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 100, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
};

function StaggerGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

function ValuesSection() {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto">
      {OUR_VALUES.map((value, i) => {
        const Icon = value.icon;
        const isOpen = expandedIndex === i;

        return (
          <div
            key={value.title}
            className="border-b last:border-b-0 transition-all duration-300"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => setExpandedIndex(isOpen ? -1 : i)}
              className="w-full flex items-center gap-4 py-6 text-left group"
            >
              {/* Accent bar */}
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: isOpen ? value.color : 'transparent',
                }}
              />

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: isOpen ? `${value.color}15` : 'var(--color-background)',
                }}
              >
                <Icon
                  className="w-5 h-5 transition-colors duration-300"
                  style={{ color: isOpen ? value.color : 'var(--color-textMuted)' }}
                />
              </div>

              {/* Title */}
              <h3
                className="flex-1 text-lg font-semibold transition-colors duration-300"
                style={{ color: isOpen ? 'var(--color-text)' : 'var(--color-textSecondary)' }}
              >
                {value.title}
              </h3>

              {/* Toggle indicator */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium transition-all duration-300"
                style={{
                  backgroundColor: isOpen ? `${value.color}15` : 'var(--color-background)',
                  color: isOpen ? value.color : 'var(--color-textMuted)',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
              >
                +
              </div>
            </button>

            {/* Expandable content */}
            <div
              className="overflow-hidden transition-all duration-400"
              style={{
                maxHeight: isOpen ? '300px' : '0px',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p
                className="pb-6 text-base leading-relaxed max-w-2xl"
                style={{ color: 'var(--color-textSecondary)', paddingLeft: '3.75rem' }}
              >
                {value.quote}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


export function WelcomeScreen() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.95]);

  return (
    <div
      className="min-h-screen relative [overflow-x:clip]"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Background Effects */}
      <AnimatedBlobs />
      <FloatingCoffeeBeans />
      <CursorSpotlight />
      <ScrollProgress />
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section ref={heroRef} className="relative px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-40 lg:pb-32">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          {/* Interactive Greeting */}
          <div className="mb-8">
            <InteractiveGreeting />
          </div>

          {/* Main Heading — Serif editorial style */}
          <motion.h1
            className="text-7xl sm:text-8xl lg:text-9xl font-normal mb-8 tracking-tighter leading-[0.9] font-serif"
            style={{ color: 'var(--color-text)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            Find Jobs That Fit{' '}
            <span className="block mt-2">
              <TypewriterText
                words={typewriterWords}
                className="animate-gradient-text italic"
              />
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: 'var(--color-textSecondary)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            The job search is broken. We match you where you'll actually belong — based on who you are, not what's on your resume.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link to="/auth/signup">
              <MagneticButton
                className="px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 animate-glow-pulse"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
                strength={0.08}
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
                strength={0.08}
              >
                <Briefcase className="w-5 h-5" />
                I'm Hiring
              </MagneticButton>
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* Feature Bento Grid — "What's Inside" + 4-step journey */}
      <FeatureBento />

      {/* Why Amber - Value Props */}
      <ScrollSection>
        <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-4xl sm:text-5xl font-serif font-normal tracking-tight mb-5"
                style={{ color: 'var(--color-text)' }}
              >
                Why Amber Is Different
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                We Put Personality And Culture First, And Let The Matching Speak For Itself.
              </p>
            </div>

            <ValuePropTabs />
          </div>
        </section>
      </ScrollSection>

      {/* Product Showcase — Ember chat + Match visualization (interactive) */}
      <ProductShowcase />

      {/* Live Stats — editorial number grid */}
      <LiveStatsSection />

      {/* Companies Section */}
      <ScrollSection>
        <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2
                className="text-3xl sm:text-4xl font-serif font-normal tracking-tight mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Land coffee chats with recruiters from{' '}
                <span className="italic" style={{ color: 'var(--color-accent)' }}>
                  top companies.
                </span>
              </h2>
              <p
                className="text-base sm:text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Companies That Care About Culture Fit Are Already Here.
              </p>
            </div>

            <div className="space-y-4">
              {/* Row 1 - scrolls left */}
              <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <div className="flex items-center animate-marquee" style={{ width: 'max-content' }}>
                  {[...COMPANIES_ROW1, ...COMPANIES_ROW1].map((company, i) => (
                    <div
                      key={`r1-${company.domain}-${i}`}
                      className="flex items-center justify-center px-8 py-3 flex-shrink-0"
                    >
                      <CompanyLogo name={company.name} domain={company.domain} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2 - scrolls right */}
              <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <div className="flex items-center animate-marquee-reverse" style={{ width: 'max-content' }}>
                  {[...COMPANIES_ROW2, ...COMPANIES_ROW2].map((company, i) => (
                    <div
                      key={`r2-${company.domain}-${i}`}
                      className="flex items-center justify-center px-8 py-3 flex-shrink-0"
                    >
                      <CompanyLogo name={company.name} domain={company.domain} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollSection>


      {/* Success Stories */}
      <ScrollSection>
        <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-4xl sm:text-5xl font-serif font-normal tracking-tight mb-5"
                style={{ color: 'var(--color-text)' }}
              >
                Real People. Real Matches. Real Stories.
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Every Match Starts With A Personality, Not A Resume.
              </p>
            </div>

            <TestimonialCarousel />
          </div>
        </section>
      </ScrollSection>

      {/* Two-Sided Value Props */}
      <ScrollSection>
        <section
          className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-4xl sm:text-5xl font-serif font-normal tracking-tight mb-5"
                style={{ color: 'var(--color-text)' }}
              >
                Built For Both Sides
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Whether You're Looking For Your Next Role Or Your Next Great Hire, Amber Is Built To Work For Both Sides Of The Table.
              </p>
            </div>

            <StaggerGrid className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* For Candidates */}
              <motion.div variants={staggerItem}>
              <TiltCard
                className="p-8 rounded-2xl border relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                tiltAmount={3}
              >
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Users className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-5"
                    style={{ color: 'var(--color-text)' }}
                  >
                    For Job Seekers
                  </h3>
                  <ul className="space-y-3 mb-6">
                    {forCandidates.map(item => (
                      <li key={item.text} className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                        >
                          <item.icon className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup">
                    <MagneticButton
                      className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accentText)',
                      }}
                      strength={0.04}
                    >
                      Find Your Match
                    </MagneticButton>
                  </Link>
                </div>
              </TiltCard>
              </motion.div>

              {/* For Employers */}
              <motion.div variants={staggerItem}>
              <TiltCard
                className="p-8 rounded-2xl border relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                tiltAmount={3}
              >
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Briefcase className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-5"
                    style={{ color: 'var(--color-text)' }}
                  >
                    For Employers
                  </h3>
                  <ul className="space-y-3 mb-6">
                    {forEmployers.map(item => (
                      <li key={item.text} className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                        >
                          <item.icon className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup?role=employer">
                    <MagneticButton
                      className="w-full py-3.5 rounded-xl text-sm font-semibold border-2 transition-all"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                        backgroundColor: 'transparent',
                      }}
                      strength={0.04}
                    >
                      Start Hiring Smarter
                    </MagneticButton>
                  </Link>
                </div>
              </TiltCard>
              </motion.div>
            </StaggerGrid>
          </div>
        </section>
      </ScrollSection>

      {/* Meet Ember - The AI at the Heart of Amber */}
      <ScrollSection>
        <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full pointer-events-none ambient-drift"
            style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 65%)', filter: 'blur(60px)', transform: 'translate(-50%, -50%)' }}
          />

          <div className="max-w-5xl mx-auto relative">
            {/* Top: Ember + headline side by side */}
            <div className="flex flex-col lg:flex-row items-center gap-10 mb-12">
              {/* Ember showcase */}
              <div className="flex-shrink-0">
                <div className="relative ember-float">
                  <div
                    className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full pointer-events-none ember-glow-ring"
                    style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 65%)' }}
                  />
                  <EmberFirefly size="xl" mood="happy" animated />
                </div>
              </div>

              {/* Headline + subtitle */}
              <div className="text-center lg:text-left">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--color-accent)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  The AI Behind Every Match
                </div>

                <h2
                  className="text-4xl sm:text-5xl font-serif font-normal tracking-tight mb-5"
                  style={{ color: 'var(--color-text)' }}
                >
                  Meet{' '}
                  <span className="animate-gradient-text">Ember</span>
                </h2>
                <p
                  className="text-base sm:text-lg leading-relaxed max-w-xl"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  Your personal AI that connects people based on personality. Ember scores compatibility from both sides, explains every match in plain language, and preps you for every coffee chat so you show up as your most authentic self.
                </p>
              </div>
            </div>

            {/* Feature cards with animated border */}
            <div className="relative max-w-4xl mx-auto mb-10">
              <div
                className="absolute inset-[-2px] rounded-[22px] animated-border-glow"
              />
              <div
                className="animated-border-card rounded-[20px] relative overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="p-6 relative group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.06) 0%, transparent 70%)' }} />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                        <Brain className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                      </div>
                      <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>Personality Matching</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>Maps your Big Five traits to a unique archetype and scores compatibility from both sides.</p>
                    </div>
                  </div>
                  <div className="p-6 relative group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.06) 0%, transparent 70%)' }} />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                        <Target className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>Transparent Insights</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>No black box. Explains why you matched, highlights strengths and friction points in plain language.</p>
                    </div>
                  </div>
                  <div className="p-6 relative group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.06) 0%, transparent 70%)' }} />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <Coffee className="w-5 h-5" style={{ color: '#10B981' }} />
                      </div>
                      <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>Coffee Chat Prep</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>Briefs you on team culture, suggests talking points, and helps you show up authentically.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link to="/auth/signup">
                <MagneticButton
                  className="px-8 py-4 rounded-2xl text-base font-semibold inline-flex items-center gap-3 animate-glow-pulse"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accentText)',
                  }}
                  strength={0.08}
                >
                  Try Ember Free
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Our Values */}
      <ScrollSection>
        <section
          className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2
                className="text-4xl sm:text-5xl font-serif font-normal tracking-tight mb-5"
                style={{ color: 'var(--color-text)' }}
              >
                What We Believe
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                The Resume Had A Good Run. We Think Personality And Genuine Human Connection Are The Better Foundation.
              </p>
            </div>

            <ValuesSection />
          </div>
        </section>
      </ScrollSection>

      {/* Final CTA with Grid */}
      <ScrollSection>
        <section className="relative pt-6 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Pulsing grid background */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="grid-fade" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="70%" stopColor="white" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="grid-mask">
                  <rect width="100%" height="100%" fill="url(#grid-fade)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)" mask="url(#grid-mask)" />
            </svg>
            {/* Pulse overlay on the grid */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, var(--color-accent), transparent 70%)',
                mixBlendMode: 'overlay',
              }}
              animate={{ opacity: [0.02, 0.08, 0.02] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Content */}
          <div className="relative max-w-2xl mx-auto text-center">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
              </motion.div>
            </motion.div>

            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight mb-6"
              style={{ color: 'var(--color-text)' }}
            >
              Your Personality Is Your{' '}
              <span className="animate-gradient-text">Superpower</span>
            </h2>

            <p
              className="text-base sm:text-lg leading-relaxed mb-4 max-w-xl mx-auto"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              Take a 15-minute assessment. Discover your work personality. Get matched with companies that actually fit who you are.
            </p>
            <p
              className="text-sm mb-10"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Try it free. No resume required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth/signup">
                <MagneticButton
                  className="px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 animate-glow-pulse"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accentText)',
                  }}
                  strength={0.08}
                >
                  Get Started Free
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
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
                  strength={0.08}
                >
                  <Briefcase className="w-5 h-5" />
                  I'm Hiring
                </MagneticButton>
              </Link>
            </div>

            {/* Trust line */}
            <StaggerGrid
              className="flex items-center justify-center gap-5 mt-10 text-xs"
            >
              <motion.span variants={staggerItem} className="flex items-center gap-1.5" style={{ color: 'var(--color-textMuted)' }}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                >
                  <Shield className="w-3.5 h-3.5" />
                </motion.div>
                Science-Backed
              </motion.span>
              <motion.span variants={staggerItem}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <motion.span variants={staggerItem} className="flex items-center gap-1.5" style={{ color: 'var(--color-textMuted)' }}>
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >
                  <Coffee className="w-3.5 h-3.5" />
                </motion.div>
                Coffee Chats
              </motion.span>
              <motion.span variants={staggerItem}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <motion.span variants={staggerItem} className="flex items-center gap-1.5" style={{ color: 'var(--color-textMuted)' }}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <Heart className="w-3.5 h-3.5" />
                </motion.div>
                Culture First
              </motion.span>
            </StaggerGrid>
          </div>
        </section>
      </ScrollSection>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
