import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Brain,
  Calendar,
  Check,
  Coffee,
  Lock,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   1. BIG CARD: 4-Step Process (real app flow)
   ───────────────────────────────────────────── */

const PROCESS_STEPS = [
  {
    number: '01',
    label: 'Dashboard',
    caption: 'Your Home Base For Matches, Chats, And Metrics.',
    icon: Target,
  },
  {
    number: '02',
    label: 'Assessment',
    caption: '15 Min Big Five · Scenario-Based Questions.',
    icon: Sparkles,
  },
  {
    number: '03',
    label: 'Insights',
    caption: 'Your Archetype · OCEAN Trait Breakdown.',
    icon: Brain,
  },
  {
    number: '04',
    label: 'Connect',
    caption: 'Pick A Match · Book A 15-Min Coffee Chat.',
    icon: Coffee,
  },
];

const STEP_DURATION = 4000;

/* ── Scene 1: Dashboard — mirrors /app/dashboard ── */
function AnimatedScoreNumber({ value, suffix = '', delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const startTime = performance.now() + delay * 1000;
    const duration = 900;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, delay]);
  return (
    <span className="tabular-nums">
      {display}
      {suffix && <span className="text-[10px]">{suffix}</span>}
    </span>
  );
}

function CompanyLogoTile({ domain, fallback, size = 20 }: { domain: string; fallback: string; size?: number }) {
  const [err, setErr] = useState(false);
  // Extract company name from domain (e.g., "figma.com" -> "figma")
  const logoName = domain.split('.')[0];
  return (
    <div
      className="rounded flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: '#fff',
        border: '1px solid var(--color-border)',
      }}
    >
      {err ? (
        <span className="text-[9px] font-bold" style={{ color: '#111' }}>
          {fallback}
        </span>
      ) : (
        <img
          src={`/logos/${logoName}.png`}
          alt={fallback}
          className="w-full h-full object-contain p-0.5"
          onError={() => setErr(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}

function SceneDashboard() {
  const stats = [
    { label: 'Match Index', value: 83, suffix: '%', chip: 'Best 87%' },
    { label: 'Available', value: 230, suffix: '', chip: '110 Co' },
    { label: 'Chats', value: 4, suffix: '', chip: '3 Pending' },
  ];

  const topMatches = [
    { company: 'Figma', domain: 'figma.com', role: 'Senior Product Designer', score: 94, fallback: 'F' },
    { company: 'Stripe', domain: 'stripe.com', role: 'Staff Engineer', score: 91, fallback: 'S' },
    { company: 'Linear', domain: 'linear.app', role: 'Design Engineer', score: 87, fallback: 'L' },
    { company: 'Vercel', domain: 'vercel.com', role: 'DevRel Lead', score: 83, fallback: 'V' },
  ];

  return (
    <div className="w-full h-full p-3 flex flex-col gap-2.5 overflow-hidden">
      {/* Hero greeting — consistent header pattern */}
      <motion.div
        className="rounded-lg border p-2 flex items-center gap-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 40%, transparent), color-mix(in srgb, var(--color-accent) 80%, transparent))',
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#fff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-serif leading-none"
            style={{ color: 'var(--color-text)' }}
          >
            Good Evening,{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              Alex
            </span>
          </p>
          <div className="flex items-center gap-1 mt-1">
            <motion.div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <p className="text-[8.5px] leading-none" style={{ color: 'var(--color-textMuted)' }}>
              2 New Matches · Sat, Apr 18
            </p>
          </div>
        </div>
        {/* Archetype chip — standardized */}
        <motion.div
          className="flex items-center gap-1 px-2 py-0.5 rounded flex-shrink-0"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
          }}
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Brain className="w-2.5 h-2.5" style={{ color: 'var(--color-accent)' }} />
          <span className="text-[9px] font-serif italic" style={{ color: 'var(--color-accent)' }}>
            The Strategist
          </span>
        </motion.div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-1.5">
        {stats.map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-lg border p-2 relative overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
              }}
            />
            <div className="flex items-start justify-between">
              <p
                className="text-[8px] font-mono uppercase tracking-[0.2em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {m.label}
              </p>
              <ArrowUpRight
                className="w-2.5 h-2.5"
                style={{ color: 'var(--color-textMuted)' }}
              />
            </div>
            <p
              className="text-[20px] font-serif leading-none mt-1"
              style={{ color: 'var(--color-text)' }}
            >
              <AnimatedScoreNumber value={m.value} suffix={m.suffix} delay={0.3 + i * 0.08} />
            </p>
            <span
              className="text-[8px] font-semibold px-1 py-0.5 rounded mt-1 self-start"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-accent) 14%, transparent)',
                color: 'var(--color-accent)',
              }}
            >
              {m.chip}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Top matches — fills remaining space with 4 rows */}
      <motion.div
        className="rounded-lg border p-2 flex-1 flex flex-col min-h-0"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: 'var(--color-success)' }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <p className="text-[10px] font-semibold" style={{ color: 'var(--color-text)' }}>
              Top Personality Matches
            </p>
          </div>
          <span
            className="text-[8px] font-mono uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            This Week
          </span>
        </div>
        <div className="space-y-1 flex-1 flex flex-col justify-evenly">
          {topMatches.map((m, i) => (
            <motion.div
              key={m.company}
              className="flex items-center gap-2 px-2 py-1.5 rounded border"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-border) 60%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-background) 40%, transparent)',
              }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.08 }}
            >
              <CompanyLogoTile domain={m.domain} fallback={m.fallback} size={22} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-semibold leading-tight truncate"
                  style={{ color: 'var(--color-text)' }}
                >
                  {m.company}
                </p>
                <p
                  className="text-[8px] truncate"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {m.role}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="h-1 rounded-full w-8 overflow-hidden"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.score}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <span
                  className="text-[11px] font-serif font-semibold tabular-nums"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <AnimatedScoreNumber value={m.score} suffix="%" delay={0.8 + i * 0.08} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Scene 2: Assessment — mirrors /app/personality ── */
function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const startTime = performance.now() + delay * 1000;
    const perChar = 18;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const count = Math.min(Math.floor(elapsed / perChar), text.length);
      setShown(count);
      if (count < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay]);
  return <>{text.slice(0, shown)}</>;
}

function SceneAssessmentScene({ pickedIndex, hoverIndex }: { pickedIndex: number; hoverIndex: number }) {
  const options = [
    {
      title: 'Take The Leap',
      desc: 'Growth Happens Outside Comfort Zones. The Learning Opportunity Is Worth The Risk.',
    },
    {
      title: 'Stay The Course',
      desc: 'Building Mastery In Your Field Is Underrated. Depth Over Breadth.',
    },
    {
      title: 'Negotiate A Hybrid',
      desc: 'Can You Try It Part-Time First? Test Before Fully Committing.',
    },
    {
      title: 'Need More Information',
      desc: 'Too Many Unknowns. Research Thoroughly Before Deciding.',
    },
  ];

  return (
    <div className="w-full h-full p-3 flex flex-col overflow-hidden">
      {/* Amber progress bar at the very top edge */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}
      >
        <div
          className="h-full"
          style={{
            width: '69%',
            background: 'linear-gradient(90deg, #16A34A, #F59E0B, var(--color-accent))',
          }}
        />
      </div>

      {/* Header row — bordered container matching other scenes */}
      <motion.div
        className="rounded-lg border p-2 flex items-center gap-2 mb-2 mt-1"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 40%, transparent), color-mix(in srgb, var(--color-accent) 80%, transparent))',
          }}
        >
          <Brain className="w-4 h-4" style={{ color: '#fff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] font-semibold leading-none"
            style={{ color: 'var(--color-text)' }}
          >
            Personality Assessment
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <p
              className="text-[8.5px] leading-none"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Question 11 Of 16
            </p>
            <span
              className="w-[3px] h-[3px] rounded-full"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <p
              className="text-[8.5px] leading-none font-mono uppercase tracking-wider"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Scenario
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Auto-save indicator — live pulse (label hidden on narrow widths) */}
          <motion.div
            className="flex items-center gap-1 text-[8px] font-mono"
            style={{ color: 'var(--color-success)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-success)' }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span className="hidden sm:inline">Auto-Saved</span>
          </motion.div>
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
              color: 'var(--color-accent)',
            }}
          >
            Growth
          </span>
        </div>
      </motion.div>

      {/* Scenario question — tighter with less empty space */}
      <motion.div
        className="text-[19px] font-serif leading-[1.25] tracking-tight mb-2"
        style={{ color: 'var(--color-text)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <TypedText
          text="You're offered a role in a completely new field. More money, but you'd be starting from scratch. Your current role has a "
          delay={0.2}
        />
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          <TypedText text="clear promotion path." delay={2.4} />
        </span>
      </motion.div>

      {/* 2×2 option cards — matches real /app/personality (radio + title + description) */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {options.map((opt, i) => {
          const isPicked = i === pickedIndex;
          const isHovered = i === hoverIndex && !isPicked;
          return (
            <motion.div
              key={opt.title}
              className="rounded-lg border p-3 flex items-start gap-2 transition-colors"
              style={{
                borderColor: isPicked
                  ? 'var(--color-accent)'
                  : isHovered
                  ? 'color-mix(in srgb, var(--color-accent) 50%, var(--color-border))'
                  : 'var(--color-border)',
                backgroundColor: isPicked
                  ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                  : isHovered
                  ? 'color-mix(in srgb, var(--color-accent) 4%, transparent)'
                  : 'var(--color-surface)',
                boxShadow: isPicked
                  ? '0 0 0 1px var(--color-accent), 0 0 14px color-mix(in srgb, var(--color-accent) 25%, transparent)'
                  : 'none',
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isPicked ? [1, 1.03, 1] : 1,
              }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
            >
              {/* Radio */}
              <div
                className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  border: `1.5px solid ${
                    isPicked || isHovered ? 'var(--color-accent)' : 'var(--color-border)'
                  }`,
                  backgroundColor: isPicked ? 'var(--color-accent)' : 'transparent',
                }}
              >
                {isPicked && (
                  <Check
                    className="w-1.5 h-1.5"
                    style={{ color: 'var(--color-accentText)' }}
                    strokeWidth={3}
                  />
                )}
              </div>
              {/* Title + description */}
              <div className="min-w-0 flex-1">
                <p
                  className="text-[13px] font-semibold leading-tight mb-1.5"
                  style={{ color: 'var(--color-text)' }}
                >
                  {opt.title}
                </p>
                <p
                  className="text-[11px] leading-snug"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {opt.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer: keyboard hint + progress dots + Back/Continue */}
      <div className="flex items-center justify-between mt-2.5">
        {/* Keyboard shortcut hint */}
        <div className="flex items-center gap-1">
          <span
            className="text-[7.5px] font-mono px-1 py-0.5 rounded border flex items-center gap-0.5"
            style={{
              color: 'var(--color-textMuted)',
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <kbd className="font-mono">1</kbd>
            –
            <kbd className="font-mono">4</kbd>
          </span>
          <span className="text-[7.5px]" style={{ color: 'var(--color-textMuted)' }}>
            Pick
          </span>
          <span
            className="w-[3px] h-[3px] rounded-full ml-1"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
          <span
            className="text-[7.5px]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            ~2 Min Left
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 16 }).map((_, i) => {
            const completed = i < 10;
            const current = i === 10;
            return (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: current ? 12 : 3,
                  height: 3,
                  backgroundColor: completed || current
                    ? 'var(--color-accent)'
                    : 'color-mix(in srgb, var(--color-border) 60%, transparent)',
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px]" style={{ color: 'var(--color-textMuted)' }}>
            ← Back
          </span>
          <span
            className="text-[9px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-0.5"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accentText)',
            }}
          >
            Continue →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Scene 3: Insights — mirrors Ember deep-dive with full capability showcase ── */
function SceneInsights() {
  const scores = [
    { label: 'Trait', value: 93, color: '#A855F7', icon: 'T' },
    { label: 'Culture', value: 76, color: '#10B981', icon: 'C' },
    { label: 'Style', value: 75, color: '#F59E0B', icon: 'S' },
    { label: 'Comms', value: 92, color: '#EC4899', icon: '✦' },
  ];

  const dimensions = [
    { letter: 'O', label: 'Openness', you: 75, team: 80, color: '#A855F7', status: 'growth' },
    { letter: 'C', label: 'Conscientious', you: 85, team: 82, color: '#10B981', status: 'aligned' },
    { letter: 'E', label: 'Extraversion', you: 68, team: 72, color: '#F59E0B', status: 'near' },
    { letter: 'A', label: 'Agreeableness', you: 72, team: 85, color: '#EC4899', status: 'growth' },
    { letter: 'S', label: 'Stability', you: 72, team: 72, color: '#3B82F6', status: 'match' },
  ];

  return (
    <div className="w-full h-full p-3 flex flex-col gap-2 overflow-hidden">
      {/* Profile header — consistent header pattern */}
      <motion.div
        className="rounded-lg border p-2 flex items-center gap-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CompanyLogoTile domain="figma.com" fallback="F" size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className="text-[11px] font-semibold leading-none truncate"
              style={{ color: 'var(--color-text)' }}
            >
              Jordan Park
            </p>
            <span
              className="text-[9px] leading-none"
              style={{ color: 'var(--color-textMuted)' }}
            >
              · Figma
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <p
              className="text-[8.5px] leading-none font-mono uppercase tracking-wider"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Ember › Deep Dive
            </p>
            <span
              className="w-[3px] h-[3px] rounded-full"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <span
              className="text-[9px] font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                color: 'var(--color-accent)',
              }}
            >
              The Strategist
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <p
            className="text-[18px] font-serif leading-none tabular-nums"
            style={{ color: 'var(--color-text)' }}
          >
            <AnimatedScoreNumber value={85} suffix="%" delay={0.3} />
          </p>
          <motion.div
            className="text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-0.5"
            style={{
              color: 'var(--color-success)',
              backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
          >
            <TrendingUp className="w-2.5 h-2.5" />
            Strong Fit
          </motion.div>
        </div>
      </motion.div>

      {/* Score breakdown — 4 bigger colored tiles in a row */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <p
            className="text-[8px] font-mono uppercase tracking-[0.25em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Score Breakdown //
          </p>
          <p
            className="text-[8px] font-mono uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            4 Dimensions
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {scores.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-lg p-3 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: `1px solid color-mix(in srgb, ${s.color} 35%, var(--color-border))`,
                boxShadow: `0 1px 0 color-mix(in srgb, ${s.color} 20%, transparent), 0 0 16px color-mix(in srgb, ${s.color} 10%, transparent)`,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.25 + i * 0.06 }}
            >
              <div
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ backgroundColor: s.color }}
              />
              <p
                className="text-[8.5px] font-mono uppercase tracking-[0.2em] pl-1.5 mb-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {s.label}
              </p>
              <p
                className="text-[24px] font-serif leading-none tabular-nums pl-1.5 mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                <AnimatedScoreNumber value={s.value} suffix="%" delay={0.4 + i * 0.06} />
              </p>
              <div
                className="h-1 rounded-full overflow-hidden ml-1.5"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: s.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Flavor Profile — OCEAN bars with letter icons + delta chips */}
      <motion.div
        className="rounded-md border p-2 flex-1 flex flex-col min-h-0"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <p
            className="text-[7.5px] font-mono uppercase tracking-[0.25em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Flavor Profile //
          </p>
          <div className="flex items-center gap-2 text-[7px] font-mono" style={{ color: 'var(--color-textMuted)' }}>
            <span className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
              You
            </span>
            <span className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-textMuted) 40%, transparent)' }} />
              Team
            </span>
          </div>
        </div>
        <div className="space-y-1 flex-1 flex flex-col justify-between">
          {dimensions.map((dim, i) => {
            const delta = dim.you - dim.team;
            const statusColor =
              dim.status === 'match'
                ? 'var(--color-success)'
                : dim.status === 'aligned'
                ? 'var(--color-success)'
                : dim.status === 'near'
                ? '#F59E0B'
                : '#EC4899';
            const statusLabel =
              dim.status === 'match' ? 'Match' : dim.status === 'aligned' ? 'Aligned' : dim.status === 'near' ? 'Near' : 'Growth';
            return (
              <motion.div
                key={dim.label}
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-mono font-bold flex-shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${dim.color} 15%, transparent)`,
                    color: dim.color,
                  }}
                >
                  {dim.letter}
                </div>
                <span
                  className="text-[8.5px] w-[72px] flex-shrink-0 truncate"
                  style={{ color: 'var(--color-text)' }}
                >
                  {dim.label}
                </span>
                <div
                  className="flex-1 h-1 rounded-full overflow-hidden relative"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-textMuted) 35%, transparent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.team}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                  />
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: dim.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.you}%` }}
                    transition={{ duration: 0.9, delay: 0.6 + i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <span
                  className="text-[8px] font-mono tabular-nums flex-shrink-0 w-[28px] text-right"
                  style={{ color: dim.color }}
                >
                  {dim.you}
                  <span className="opacity-40">/{dim.team}</span>
                </span>
                <span
                  className="text-[7px] font-semibold px-1 py-0.5 rounded flex-shrink-0 w-[44px] text-center"
                  style={{
                    color: statusColor,
                    backgroundColor: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
                  }}
                >
                  {delta >= 0 ? '+' : ''}
                  {delta} {statusLabel}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Ember's Take — AI-generated insight with strengths & discussion point */}
      <motion.div
        className="rounded-md border p-2 flex items-start gap-2"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
          borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), #F59E0B)',
          }}
        >
          <Sparkles className="w-2.5 h-2.5" style={{ color: '#fff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p
              className="text-[7.5px] font-mono uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-accent)' }}
            >
              Ember's Take
            </p>
            <div className="flex items-center gap-1">
              <span
                className="text-[7px] font-semibold px-1 py-px rounded"
                style={{
                  color: 'var(--color-success)',
                  backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                }}
              >
                2 Strengths
              </span>
              <span
                className="text-[7px] font-semibold px-1 py-px rounded"
                style={{
                  color: '#F59E0B',
                  backgroundColor: 'color-mix(in srgb, #F59E0B 12%, transparent)',
                }}
              >
                1 To Discuss
              </span>
            </div>
          </div>
          <p
            className="text-[9px] leading-snug"
            style={{ color: 'var(--color-text)' }}
          >
            Strong conscientiousness alignment means compatible work ethics.{' '}
            <span style={{ color: 'var(--color-textMuted)' }}>
              Discuss how your openness complements their structured approach.
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Scene 4: Connect — mirrors connection-request modal ── */
function SceneConnect({ stage }: { stage: number }) {
  const times = ['10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM'];
  const pickedTime = 4; // 12:30 PM
  const durations = ['15m', '30m', '45m', '60m'];
  const pickedDuration = '30m';

  const durationPicked = stage >= 1;
  const timePicked = stage >= 2;
  const sendHovered = stage >= 3;
  const sent = stage >= 3;

  const message =
    "I'd love to chat about how our work styles align at Figma.";

  return (
    <div className="w-full h-full p-3 flex flex-col gap-2 overflow-hidden">
      {/* Target person+company card — consistent header pattern */}
      <motion.div
        className="rounded-lg border p-2 flex items-center gap-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CompanyLogoTile domain="figma.com" fallback="F" size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className="text-[11px] font-semibold leading-none truncate"
              style={{ color: 'var(--color-text)' }}
            >
              Jordan Park
            </p>
            <span
              className="text-[9px] leading-none"
              style={{ color: 'var(--color-textMuted)' }}
            >
              · Figma
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <p
              className="text-[8.5px] leading-none"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Senior Product Designer
            </p>
            <span
              className="w-[3px] h-[3px] rounded-full"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <span
              className="text-[9px] font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                color: 'var(--color-accent)',
              }}
            >
              The Strategist
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <p
            className="text-[18px] font-serif leading-none tabular-nums"
            style={{ color: 'var(--color-text)' }}
          >
            85%
          </p>
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-0.5"
            style={{
              color: 'var(--color-success)',
              backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
            }}
          >
            <TrendingUp className="w-2.5 h-2.5" />
            Strong Fit
          </span>
        </div>
      </motion.div>

      {/* Duration pills row */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div
          className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-[0.2em] mb-1"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <Coffee className="w-2.5 h-2.5" />
          Duration
        </div>
        <div className="grid grid-cols-4 gap-1">
          {durations.map((d) => {
            const picked = durationPicked && d === pickedDuration;
            return (
              <motion.span
                key={d}
                className="text-[10px] font-semibold py-1.5 rounded-md text-center"
                style={{
                  backgroundColor: picked ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: picked ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
                  border: `1px solid ${picked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
                animate={picked ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {d}
              </motion.span>
            );
          })}
        </div>
      </motion.div>

      {/* Mini calendar — full width, takes most vertical space */}
      <motion.div
        className="rounded-md border p-2 flex-1 flex flex-col min-h-0"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[10px] font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            ◀ April 2026 ▶
          </span>
          <span
            className="text-[8px] font-mono"
            style={{ color: 'var(--color-textMuted)' }}
          >
            2/5 Dates Selected
          </span>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div
              key={i}
              className="text-[8px] font-mono uppercase text-center"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {d}
            </div>
          ))}
        </div>
        {/* Calendar cells — April 2026: starts Wed Apr 1 */}
        <div className="grid grid-cols-7 gap-0.5 flex-1 min-h-0">
          {(() => {
            type Cell = { day: number; inMonth: boolean; selected?: boolean; today?: boolean };
            const cells: Cell[] = [];
            cells.push({ day: 29, inMonth: false });
            cells.push({ day: 30, inMonth: false });
            cells.push({ day: 31, inMonth: false });
            for (let d = 1; d <= 30; d++) {
              cells.push({
                day: d,
                inMonth: true,
                selected: d === 21 || d === 23,
                today: d === 18,
              });
            }
            cells.push({ day: 1, inMonth: false });
            cells.push({ day: 2, inMonth: false });
            return cells.map((c, i) => {
              const isPicked = c.inMonth && c.selected && timePicked;
              return (
                <motion.div
                  key={i}
                  className="text-[9px] font-mono rounded flex items-center justify-center"
                  style={{
                    color: !c.inMonth
                      ? 'color-mix(in srgb, var(--color-textMuted) 50%, transparent)'
                      : isPicked
                      ? 'var(--color-accentText)'
                      : c.today
                      ? 'var(--color-accent)'
                      : 'var(--color-text)',
                    backgroundColor: isPicked
                      ? 'var(--color-accent)'
                      : c.today
                      ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                      : 'transparent',
                    border: c.today
                      ? '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)'
                      : 'none',
                    fontWeight: isPicked || c.today ? 600 : 400,
                  }}
                  animate={isPicked ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {c.day}
                </motion.div>
              );
            });
          })()}
        </div>
      </motion.div>

      {/* Time slots row — single horizontal row below calendar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-[0.2em] mb-1"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <Calendar className="w-2.5 h-2.5" />
          Preferred Time · Thu Apr 23
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
          {times.map((t, i) => {
            const isPicked = timePicked && i === pickedTime;
            return (
              <motion.div
                key={t}
                className="text-center text-[8.5px] font-medium rounded-md border py-1 flex items-center justify-center"
                style={{
                  borderColor: isPicked ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: isPicked ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: isPicked ? 'var(--color-accentText)' : 'var(--color-text)',
                }}
                animate={isPicked ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {t}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Message preview — single compact row under the times */}
      <motion.div
        className="rounded-md border px-2 py-1.5 flex items-center gap-1.5"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <span
          className="text-[7.5px] font-mono uppercase tracking-[0.2em] flex-shrink-0"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Message
        </span>
        <p
          className="text-[9px] leading-none flex-1 min-w-0 truncate"
          style={{ color: 'var(--color-text)' }}
        >
          <TypedText text={message} delay={0.5} />
          <motion.span
            className="inline-block w-0.5 h-2 ml-px align-middle"
            style={{ backgroundColor: 'var(--color-accent)' }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
        </p>
        <span
          className="text-[7.5px] font-mono flex-shrink-0"
          style={{ color: 'var(--color-textMuted)' }}
        >
          11/100
        </span>
      </motion.div>

      {/* Footer row: cancel + send request */}
      <motion.div
        className="flex items-center justify-end gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <span className="text-[9px]" style={{ color: 'var(--color-textMuted)' }}>
          Cancel
        </span>
        <motion.div
          className="text-[9.5px] font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accentText)',
            boxShadow: sendHovered
              ? '0 0 0 2px color-mix(in srgb, var(--color-accent) 30%, transparent)'
              : 'none',
          }}
          animate={sent ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {sent ? (
            <>
              <Check className="w-3 h-3" strokeWidth={3} />
              Sent
            </>
          ) : (
            <>
              <Send className="w-3 h-3" />
              Send Request
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function ProcessCard() {
  const [active, setActive] = useState(0);
  const [_clicked, setClicked] = useState(false);
  const [pickedIndex, setPickedIndex] = useState(-1);
  const [hoverIndex, setHoverIndex] = useState(-1); // Scene 2: hover drift
  const [connectStage, setConnectStage] = useState(0); // Scene 4: 0=idle, 1=duration picked, 2=time picked, 3=sent

  useEffect(() => {
    setClicked(false);
    setPickedIndex(-1);
    setHoverIndex(-1);
    setConnectStage(0);

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (active === 1) {
      // Assessment: cursor drifts across 2–3 options, then picks top-left
      timers.push(setTimeout(() => setHoverIndex(3), 600));
      timers.push(setTimeout(() => setHoverIndex(1), 1200));
      timers.push(setTimeout(() => setHoverIndex(0), 1800));
      timers.push(setTimeout(() => setPickedIndex(0), 2300));
    }
    if (active === 3) {
      // Connect: duration → time → send (3 stages)
      timers.push(setTimeout(() => setConnectStage(1), 700));
      timers.push(setTimeout(() => setConnectStage(2), 1500));
      timers.push(setTimeout(() => setConnectStage(3), 2400));
      timers.push(setTimeout(() => setClicked(true), 2600));
    }

    timers.push(
      setTimeout(() => {
        setActive((a) => (a + 1) % PROCESS_STEPS.length);
      }, STEP_DURATION)
    );

    return () => timers.forEach(clearTimeout);
  }, [active]);

  const step = PROCESS_STEPS[active];

  const scenes = [
    <SceneDashboard />,
    <SceneAssessmentScene pickedIndex={pickedIndex} hoverIndex={hoverIndex} />,
    <SceneInsights />,
    <SceneConnect stage={connectStage} />,
  ];

  return (
    <div
      className="relative rounded-3xl p-7 lg:p-8 h-full overflow-hidden flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.1] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at top right, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top right, black, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span
            className="text-[10px] font-mono uppercase tracking-[0.3em] font-semibold"
            style={{ color: 'var(--color-accent)' }}
          >
            The 4-Step Journey
          </span>
        </div>

        <h3
          className="text-2xl lg:text-3xl font-serif font-normal tracking-tight mb-1 leading-[1.1]"
          style={{ color: 'var(--color-text)' }}
        >
          From Dashboard To Offer.{' '}
          <span className="italic" style={{ color: 'var(--color-accent)' }}>
            Effortlessly.
          </span>
        </h3>

        <AnimatePresence mode="wait">
          <motion.p
            key={step.number}
            className="text-sm leading-relaxed mb-5 max-w-md"
            style={{ color: 'var(--color-textMuted)' }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {step.caption}
          </motion.p>
        </AnimatePresence>

        <div
          className="relative flex-1 rounded-2xl overflow-hidden border mb-5"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'color-mix(in srgb, var(--color-background) 60%, transparent)',
            minHeight: 280,
          }}
        >
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 border-b"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-backgroundSecondary)',
            }}
          >
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#28C840' }} />
            </div>
            <div className="flex-1 flex justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={step.label}
                  className="text-[8px] font-mono tracking-wider"
                  style={{ color: 'var(--color-textMuted)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  amber.app/{step.label.toLowerCase()}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative w-full" style={{ height: 'calc(100% - 26px)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                {scenes[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {PROCESS_STEPS.map((s, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <div key={s.number} className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-mono font-bold transition-all"
                  style={{
                    backgroundColor:
                      isActive || isDone ? 'var(--color-accent)' : 'transparent',
                    border: `1px solid ${
                      isActive || isDone ? 'var(--color-accent)' : 'var(--color-border)'
                    }`,
                    color:
                      isActive || isDone
                        ? 'var(--color-accentText)'
                        : 'var(--color-textMuted)',
                  }}
                >
                  {isDone ? <Check className="w-2.5 h-2.5" /> : s.number}
                </div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.15em] truncate hidden sm:inline"
                  style={{
                    color: isActive ? 'var(--color-text)' : 'var(--color-textMuted)',
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  {s.label}
                </span>
                {i < PROCESS_STEPS.length - 1 && (
                  <div
                    className="w-2 h-px flex-shrink-0 hidden sm:block"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. SCIENCE: Big Five / OCEAN radar
   ───────────────────────────────────────────── */

const RADAR_TRAITS = ['O', 'C', 'E', 'A', 'S'];

function ScienceCard() {
  return (
    <div
      className="relative rounded-3xl p-7 h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
          <span
            className="text-[10px] font-mono uppercase tracking-[0.25em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Big Five · OCEAN
          </span>
        </div>

        <h3
          className="text-2xl font-serif font-normal tracking-tight mb-2 leading-tight"
          style={{ color: 'var(--color-text)' }}
        >
          70 Years Of Research,{' '}
          <span className="italic" style={{ color: 'var(--color-accent)' }}>
            In 15 Minutes.
          </span>
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
          The same model used by Fortune 500s: openness, conscientiousness, extraversion,
          agreeableness, stability.
        </p>

        {/* Radar with 5 labeled points */}
        <div className="mt-auto pt-5 flex justify-center">
          <div className="relative w-40 h-40">
            {[0.4, 0.7, 1].map((scale, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)',
                }}
                animate={{ scale: [scale * 0.9, scale, scale * 0.9], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            {RADAR_TRAITS.map((letter, i) => {
              const angle = (i * (360 / RADAR_TRAITS.length) - 90) * (Math.PI / 180);
              const r = 70;
              return (
                <div
                  key={letter}
                  className="absolute text-xs font-mono font-semibold flex items-center justify-center w-6 h-6 rounded-full"
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * r}px - 12px)`,
                    top: `calc(50% + ${Math.sin(angle) * r}px - 12px)`,
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-accent)',
                  }}
                >
                  {letter}
                </div>
              );
            })}
            <div
              className="absolute inset-0 flex items-center justify-center text-3xl font-serif font-normal"
              style={{ color: 'var(--color-accent)' }}
            >
              5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   3. SPEED: No resume
   ───────────────────────────────────────────── */

function SpeedCard() {
  const [seconds, setSeconds] = useState(900); // 15 min countdown visual

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s <= 0 ? 900 : s - 1));
    }, 60);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div
      className="relative rounded-3xl p-7 h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
        <span
          className="text-[10px] font-mono uppercase tracking-[0.25em]"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Assessment · Timer
        </span>
      </div>

      <h3
        className="text-2xl font-serif font-normal tracking-tight mb-2 leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        No Resume.{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          No Cover Letter.
        </span>
      </h3>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
        Answer a few questions about how you think and work. We do the rest.
      </p>

      {/* Countdown widget */}
      <div className="mt-auto pt-5">
        <div
          className="rounded-xl p-4 border flex items-center justify-between"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 5%, transparent)',
          }}
        >
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.25em] font-mono font-medium mb-1"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Time Remaining
            </p>
            <p
              className="text-3xl font-serif font-normal tabular-nums"
              style={{ color: 'var(--color-text)' }}
            >
              {String(mins).padStart(2, '0')}
              <span style={{ color: 'var(--color-accent)' }}>:</span>
              {String(secs).padStart(2, '0')}
            </p>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="3"
                strokeDasharray={`${(seconds / 900) * 125.6} 125.6`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   4. COFFEE: animated booking slots
   ───────────────────────────────────────────── */

function CoffeeChatCard() {
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFilled((f) => (f + 1) % 7);
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative rounded-3xl p-7 h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Coffee className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
        <span
          className="text-[10px] font-mono uppercase tracking-[0.25em]"
          style={{ color: 'var(--color-textMuted)' }}
        >
          15 Min · Video
        </span>
      </div>

      <h3
        className="text-2xl font-serif font-normal tracking-tight mb-2 leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        Book A Coffee. Skip The{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          Cold Apply.
        </span>
      </h3>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
        Connect with hiring managers directly. One click, real conversation.
      </p>

      <div className="mt-auto pt-5">
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-8 rounded"
              animate={{
                backgroundColor:
                  i < filled
                    ? 'var(--color-accent)'
                    : 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                borderColor:
                  i < filled
                    ? 'var(--color-accent)'
                    : 'color-mix(in srgb, var(--color-accent) 25%, transparent)',
              }}
              style={{ border: '1px solid' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 px-0.5">
          <span
            className="text-[9px] font-mono uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Mon
          </span>
          <span
            className="text-[9px] font-mono uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Sat
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   5. TWO-SIDED: Venn
   ───────────────────────────────────────────── */

function TwoSidedCard() {
  return (
    <div
      className="relative rounded-3xl p-7 h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
        <span
          className="text-[10px] font-mono uppercase tracking-[0.25em]"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Two-Way Matching
        </span>
      </div>

      <h3
        className="text-2xl font-serif font-normal tracking-tight mb-2 leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        Made For Both{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          Sides.
        </span>
      </h3>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
        Employers define culture. Candidates share personality. Matches happen where they overlap.
      </p>

      {/* Breathing Venn */}
      <div className="mt-auto pt-6 flex justify-center items-center h-24 relative">
        <div className="relative">
          <motion.div
            className="absolute w-16 h-16 rounded-full"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 45%, transparent)',
              left: -20,
              mixBlendMode: 'multiply',
            }}
            animate={{ x: [-20, -10, -20] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-16 h-16 rounded-full"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-trait-conscientiousness) 45%, transparent)',
              left: 20,
              mixBlendMode: 'multiply',
            }}
            animate={{ x: [20, 10, 20] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="w-16 h-16" />
        </div>
        <div
          className="absolute text-[10px] font-mono uppercase tracking-[0.2em] font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          FIT
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   6. PRIVACY: lock + encryption visual
   ───────────────────────────────────────────── */

function PrivacyCard() {
  return (
    <div
      className="relative rounded-3xl p-7 h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
        <span
          className="text-[10px] font-mono uppercase tracking-[0.25em]"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Your Data · Encrypted
        </span>
      </div>

      <h3
        className="text-2xl font-serif font-normal tracking-tight mb-2 leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        Private By{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          Default.
        </span>
      </h3>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
        Your profile is invisible until you opt in. Employers never see your data without permission.
      </p>

      {/* Encryption visual: animated hash string */}
      <div className="mt-auto pt-5">
        <div
          className="rounded-xl p-4 border flex items-center gap-3 font-mono text-[10px]"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'color-mix(in srgb, var(--color-background) 50%, transparent)',
          }}
        >
          <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
          <div className="flex-1 min-w-0 overflow-hidden">
            <motion.div
              className="truncate tracking-widest"
              style={{ color: 'var(--color-textSecondary)' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              a7b2·9fd0·14ce·8a3f
            </motion.div>
            <p
              className="text-[9px] uppercase tracking-[0.25em] mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              AES-256 · TLS 1.3
            </p>
          </div>
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-success)' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN SECTION
   ───────────────────────────────────────────── */

export function FeatureBento() {
  return (
    <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-1.5 h-1.5 rounded-full status-dot"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
            <span
              className="text-[10px] font-mono uppercase tracking-[0.3em] font-semibold"
              style={{ color: 'var(--color-accent)' }}
            >
              Features / How It Works
            </span>
          </div>

          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-[1.05]"
            style={{ color: 'var(--color-text)' }}
          >
            The Whole Job Search,{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              Rethought.
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 auto-rows-[minmax(280px,auto)]">
          {/* Big process card: 2 cols, 2 rows */}
          <motion.div
            className="lg:col-span-2 lg:row-span-2 min-h-[620px] sm:min-h-[580px] lg:min-h-[540px]"
            initial={{ opacity: 0, scale: 0.82, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.01 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center center' }}
          >
            <ProcessCard />
          </motion.div>

          {/* Right column top: Science */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.015 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center center' }}
          >
            <ScienceCard />
          </motion.div>

          {/* Right column bottom: Speed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.015 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center center' }}
          >
            <SpeedCard />
          </motion.div>

          {/* Bottom row */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.015 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.42, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center center' }}
          >
            <CoffeeChatCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.015 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.54, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center center' }}
          >
            <TwoSidedCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.015 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.66, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center center' }}
          >
            <PrivacyCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
