import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Brain,
  Briefcase,
  Calendar,
  Check,
  Coffee,
  MousePointer2,
  Sparkles,
  Target,
  TrendingUp,
  Video,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   STEPS (narrative copy)
   ───────────────────────────────────────────── */

const STEPS = [
  {
    id: 'dashboard',
    tag: 'Step 01',
    label: 'Dashboard',
    headline: 'Your home base.',
    caption: 'Matches, coffee chats, and metrics in one glance.',
    icon: TrendingUp,
    /** Where the phantom cursor clicks as this step transitions out */
    clickPos: { x: '74%', y: '68%' },
  },
  {
    id: 'insights',
    tag: 'Step 02',
    label: 'Insights',
    headline: 'Your personality,\ndecoded.',
    caption: 'Big Five traits, clear archetype, and what it means for your career.',
    icon: Brain,
    clickPos: { x: '50%', y: '60%' },
  },
  {
    id: 'match',
    tag: 'Step 03',
    label: 'Match',
    headline: 'See the fit before\nyou apply.',
    caption: 'Trait-level breakdown. Zero guesswork. Ember tells you why.',
    icon: Target,
    clickPos: { x: '84%', y: '24%' },
  },
  {
    id: 'schedule',
    tag: 'Step 04',
    label: 'Schedule',
    headline: 'One click, one chat.',
    caption: 'Book a 15-minute coffee. No back-and-forth threads.',
    icon: Calendar,
    clickPos: { x: '82%', y: '88%' },
  },
];

/* ─────────────────────────────────────────────
   FRAME 1: DASHBOARD
   ───────────────────────────────────────────── */

const MOCK_MATCHES = [
  { company: 'Acme Labs', role: 'Senior Engineer', score: 94, color: 'var(--color-score-excellent)' },
  { company: 'Northwind', role: 'Product Designer', score: 87, color: 'var(--color-score-excellent)' },
  { company: 'Vanta', role: 'ML Researcher', score: 81, color: 'var(--color-score-good)' },
  { company: 'Supabase', role: 'DevRel Lead', score: 76, color: 'var(--color-score-good)' },
];

function DashboardFrame() {
  return (
    <div className="p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-6">
        <h3
          className="text-2xl sm:text-3xl font-serif font-normal tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          Good morning, <span className="italic" style={{ color: 'var(--color-accent)' }}>Alex</span>
        </h3>
        <p
          className="text-[10px] uppercase tracking-[0.25em] mt-1.5 font-medium"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Mon, Apr 16 · 4 New Matches
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Match Index', value: '87%', icon: TrendingUp, accent: true },
          { label: 'Open Roles', value: '24', icon: Briefcase, accent: false },
          { label: 'Coffee Chats', value: '3', icon: Coffee, accent: false },
        ].map((m, i) => (
          <div
            key={i}
            className="bento-card p-4"
            style={m.accent ? { borderTopColor: 'var(--color-accent)', borderTopWidth: 2 } : undefined}
          >
            <div className="flex items-start justify-between mb-2">
              <span
                className="text-[9px] uppercase tracking-[0.2em] font-medium"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {m.label}
              </span>
              <m.icon className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)', opacity: 0.5 }} />
            </div>
            <div className="text-3xl font-serif font-normal" style={{ color: 'var(--color-text)' }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bento-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Top Matches
          </h4>
          <span
            className="text-[9px] uppercase tracking-[0.25em] font-medium"
            style={{ color: 'var(--color-textMuted)' }}
          >
            This Week
          </span>
        </div>
        <div className="space-y-2.5">
          {MOCK_MATCHES.map((match, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'color-mix(in srgb, var(--color-surface) 50%, transparent)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${match.color} 15%, transparent)`,
                    color: match.color,
                  }}
                >
                  {match.company[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                    {match.company}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] truncate font-medium"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {match.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-semibold tabular-nums" style={{ color: match.color }}>
                  {match.score}%
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FRAME 2: INSIGHTS (OCEAN)
   ───────────────────────────────────────────── */

const OCEAN_TRAITS = [
  { label: 'Openness', score: 82, color: 'var(--color-trait-openness)' },
  { label: 'Conscientiousness', score: 68, color: 'var(--color-trait-conscientiousness)' },
  { label: 'Extraversion', score: 55, color: 'var(--color-trait-extraversion)' },
  { label: 'Agreeableness', score: 78, color: 'var(--color-trait-agreeableness)' },
  { label: 'Stability', score: 71, color: 'var(--color-trait-stability)' },
];

function InsightsFrame() {
  return (
    <div className="p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-5">
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-semibold"
          style={{ color: 'var(--color-accent)' }}
        >
          Your Archetype
        </span>
        <h3
          className="text-3xl sm:text-4xl font-serif font-normal tracking-tight italic mt-2"
          style={{ color: 'var(--color-text)' }}
        >
          The Explorer
        </h3>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
          Curious, adaptable, and energized by new possibilities. You thrive where learning never stops.
        </p>
      </div>

      <div className="bento-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Big Five Breakdown
          </h4>
          <span
            className="text-[9px] uppercase tracking-[0.25em] font-medium"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Scientific
          </span>
        </div>
        <div className="space-y-3">
          {OCEAN_TRAITS.map((t, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text)' }}
                >
                  {t.label}
                </span>
                <span className="text-xs font-mono tabular-nums" style={{ color: t.color }}>
                  {t.score}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: t.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${t.score}%` }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 rounded-lg flex items-start gap-3"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
        }}
      >
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
          <span className="font-semibold">You're a Great Fit For:</span>{' '}
          research-driven orgs, design studios, early-stage startups.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FRAME 3: MATCH DETAIL
   ───────────────────────────────────────────── */

const MATCH_DIMENSIONS = [
  { label: 'Openness', you: 82, company: 75, color: 'var(--color-trait-openness)' },
  { label: 'Conscientiousness', you: 68, company: 72, color: 'var(--color-trait-conscientiousness)' },
  { label: 'Agreeableness', you: 78, company: 81, color: 'var(--color-trait-agreeableness)' },
  { label: 'Stability', you: 71, company: 68, color: 'var(--color-trait-stability)' },
];

function MatchFrame() {
  return (
    <div className="p-6 lg:p-8 h-full overflow-hidden">
      <div className="flex items-start justify-between mb-5">
        <div>
          <span
            className="text-[10px] uppercase tracking-[0.3em] font-semibold"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Senior Engineer
          </span>
          <h3
            className="text-2xl sm:text-3xl font-serif font-normal tracking-tight mt-1"
            style={{ color: 'var(--color-text)' }}
          >
            Acme Labs
          </h3>
        </div>
        <motion.div
          className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            color: 'var(--color-success)',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-success) 25%, transparent)',
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
        >
          94% MATCH
        </motion.div>
      </div>

      <div className="bento-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Compatibility
          </h4>
          <span
            className="text-[9px] uppercase tracking-[0.25em] font-medium"
            style={{ color: 'var(--color-textMuted)' }}
          >
            You vs. Team
          </span>
        </div>
        <div className="space-y-3">
          {MATCH_DIMENSIONS.map((d, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text)' }}
                >
                  {d.label}
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--color-textMuted)' }}>
                  {d.you} · {d.company}
                </span>
              </div>
              <div
                className="relative h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-textMuted) 40%, transparent)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.company}%` }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.08 }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.you}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className="bento-card p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1 font-semibold" style={{ color: 'var(--color-accent)' }}>
              Ember's Take
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
              Your openness complements their structure-first team. You'll bring fresh ideas without
              disrupting their rhythm.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FRAME 4: SCHEDULING
   ───────────────────────────────────────────── */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIMES = ['9:00', '10:30', '1:00', '2:30', '4:00'];
const MOCK_AVAILABILITY: Record<number, Record<number, boolean>> = {
  0: { 0: true, 1: false, 2: true, 3: true, 4: false },
  1: { 0: false, 1: true, 2: true, 3: false, 4: true },
  2: { 0: true, 1: true, 2: false, 3: true, 4: true },
  3: { 0: false, 1: true, 2: true, 3: true, 4: false },
  4: { 0: true, 1: false, 2: true, 3: false, 4: true },
};
const SELECTED_SLOT = { day: 2, time: 1 };

function ScheduleFrame() {
  return (
    <div className="p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-5">
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-semibold"
          style={{ color: 'var(--color-accent)' }}
        >
          Coffee Chat
        </span>
        <h3
          className="text-2xl sm:text-3xl font-serif font-normal tracking-tight mt-2"
          style={{ color: 'var(--color-text)' }}
        >
          Coffee with{' '}
          <span className="italic" style={{ color: 'var(--color-accent)' }}>
            Jordan
          </span>
        </h3>
        <p className="text-[10px] uppercase tracking-[0.25em] mt-1 font-medium" style={{ color: 'var(--color-textMuted)' }}>
          Hiring Manager · Acme Labs
        </p>
      </div>

      <div className="bento-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Pick a Time
          </h4>
          <span
            className="text-[9px] uppercase tracking-[0.25em] font-medium"
            style={{ color: 'var(--color-textMuted)' }}
          >
            This Week
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2 text-center">
          <div />
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-[10px] uppercase tracking-[0.2em] font-semibold py-1"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {day}
            </div>
          ))}
          {TIMES.map((time, ti) => (
            <>
              <div
                key={`t-${time}`}
                className="text-[10px] font-mono py-2 text-right pr-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {time}
              </div>
              {DAYS.map((_, di) => {
                const available = MOCK_AVAILABILITY[di]?.[ti];
                const isSelected = di === SELECTED_SLOT.day && ti === SELECTED_SLOT.time;
                return (
                  <motion.div
                    key={`${di}-${ti}`}
                    className="h-7 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--color-accent)'
                        : available
                        ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                        : 'transparent',
                      border: available && !isSelected
                        ? '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)'
                        : '1px solid transparent',
                    }}
                    initial={isSelected ? { scale: 0 } : false}
                    animate={isSelected ? { scale: 1 } : {}}
                    transition={isSelected ? { type: 'spring', stiffness: 400, damping: 15, delay: 0.5 } : undefined}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-accentText)' }} />}
                  </motion.div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <motion.div
        className="p-4 rounded-lg flex items-center gap-3 border"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
          borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Video className="w-4 h-4" style={{ color: 'var(--color-accentText)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Wed · 10:30 AM
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--color-textMuted)' }}>
            15 Min · Google Meet
          </p>
        </div>
        <button
          className="text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accentText)',
          }}
        >
          Confirm
        </button>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PHANTOM CURSOR (clicks between frames)
   ───────────────────────────────────────────── */

function PhantomCursor({ show, pos }: { show: boolean; pos: { x: string; y: string } }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`${pos.x}-${pos.y}`}
          className="absolute pointer-events-none z-30"
          style={{ left: pos.x, top: pos.y }}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MousePointer2
            className="w-6 h-6 drop-shadow-lg"
            style={{ color: 'var(--color-accent)', fill: 'var(--color-accent)' }}
          />
          {/* click ripple */}
          <motion.div
            className="absolute top-2 left-2 w-6 h-6 rounded-full pointer-events-none"
            style={{ border: '2px solid var(--color-accent)' }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 2.5], opacity: [0.7, 0] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */

export function ProductJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showClick, setShowClick] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map scroll progress (0-1) to step index (0-3) with smooth boundaries
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // Each step occupies 25% of scroll progress
    const rawStep = v * 4;
    const step = Math.min(3, Math.max(0, Math.floor(rawStep)));

    if (step !== activeStep) {
      // Trigger click animation before switching (simulates user clicking to navigate)
      setShowClick(true);
      setTimeout(() => setShowClick(false), 600);
      setActiveStep(step);
    }
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const currentStep = STEPS[activeStep];

  // Subtle parallax on the window frame itself
  const frameScale = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0.95, 1, 1, 0.98]);
  const frameRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -2]);

  const frames = [<DashboardFrame />, <InsightsFrame />, <MatchFrame />, <ScheduleFrame />];

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: '800vh' }}
    >
      {/* Sticky playhead: pins to viewport as user scrolls */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(900px circle at 50% 50%, color-mix(in srgb, var(--color-accent) 5%, transparent), transparent 60%)',
          }}
        />

        <div className="w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Narrative: swaps with each step */}
            <div className="text-center mb-8 h-[180px] lg:h-[200px] flex flex-col items-center justify-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 border"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                    }}
                  >
                    <currentStep.icon className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.25em]"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {currentStep.tag} · {currentStep.label}
                    </span>
                  </div>

                  <h2
                    className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-[1.05] whitespace-pre-line"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {currentStep.headline}
                  </h2>

                  <p
                    className="text-sm lg:text-base max-w-lg mx-auto mt-4 leading-relaxed"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {currentStep.caption}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Window frame with 3D scale/tilt */}
            <div className="relative" style={{ perspective: '2000px' }}>
              <motion.div
                className="relative rounded-2xl overflow-hidden border shadow-2xl"
                style={{
                  width: 'min(640px, 92vw)',
                  height: 'min(560px, 65vh)',
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  scale: frameScale,
                  rotateX: frameRotateX,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Traffic lights */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5 border-b"
                  style={{
                    backgroundColor: 'var(--color-backgroundSecondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28C840' }} />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.25 }}
                        className="text-[10px] font-mono px-2.5 py-0.5 rounded flex items-center gap-1.5"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-textMuted)',
                        }}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-success)' }}
                        />
                        amber.app/{currentStep.id}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div style={{ width: 46 }} />
                </div>

                {/* Frames: zoom-in crossfade */}
                <div className="relative h-[calc(100%-40px)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
                      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {frames[activeStep]}
                    </motion.div>
                  </AnimatePresence>

                  {/* Phantom cursor: clicks before transition */}
                  <PhantomCursor show={showClick} pos={currentStep.clickPos} />
                </div>
              </motion.div>

              {/* Ambient glow under window */}
              <div
                className="absolute inset-x-16 -bottom-10 h-32 blur-3xl -z-10 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center top, color-mix(in srgb, var(--color-accent) 25%, transparent), transparent 70%)',
                }}
              />
            </div>

            {/* Progress dots */}
            <div className="mt-8 flex items-center gap-3">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 transition-opacity"
                    style={{ opacity: i === activeStep ? 1 : 0.35 }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full transition-all"
                      style={{
                        backgroundColor: i <= activeStep ? 'var(--color-accent)' : 'var(--color-border)',
                        width: i === activeStep ? '24px' : '6px',
                      }}
                    />
                    <span
                      className="text-[9px] uppercase tracking-[0.25em] font-semibold hidden sm:inline"
                      style={{ color: i === activeStep ? 'var(--color-text)' : 'var(--color-textMuted)' }}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className="text-[10px]" style={{ color: 'var(--color-border)' }}>
                      /
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Thin progress bar */}
            <div
              className="mt-4 h-0.5 w-64 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-border)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ width: progressWidth, backgroundColor: 'var(--color-accent)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
