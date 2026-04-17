import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Check,
  Coffee,
  Lock,
  MousePointer2,
  Sparkles,
  Target,
  Users,
  Video,
  Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   1. BIG CARD — 4-Step Process (real app flow)
   ───────────────────────────────────────────── */

const PROCESS_STEPS = [
  {
    number: '01',
    label: 'Dashboard',
    caption: 'Your home base — matches, chats, and metrics.',
    icon: Target,
  },
  {
    number: '02',
    label: 'Assessment',
    caption: '15 min Big Five · scenario-based questions.',
    icon: Sparkles,
  },
  {
    number: '03',
    label: 'Insights',
    caption: 'Your archetype · OCEAN trait breakdown.',
    icon: Brain,
  },
  {
    number: '04',
    label: 'Connect',
    caption: 'Pick a match · book a 15-min coffee chat.',
    icon: Coffee,
  },
];

const STEP_DURATION = 4000;

/* ── Scene 1: Dashboard (matches JobSeekerDashboard bento layout) ── */
function SceneDashboard() {
  const matches = [
    { name: 'Acme Labs', role: 'Senior Eng', score: 94, color: 'var(--color-score-excellent)' },
    { name: 'Northwind', role: 'Designer', score: 87, color: 'var(--color-score-excellent)' },
    { name: 'Vanta', role: 'ML Research', score: 81, color: 'var(--color-score-good)' },
  ];

  return (
    <div className="w-full h-full p-4">
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p
          className="text-lg font-serif font-normal leading-tight"
          style={{ color: 'var(--color-text)' }}
        >
          Good morning, <span className="italic" style={{ color: 'var(--color-accent)' }}>Alex</span>
        </p>
        <p
          className="text-[9px] uppercase tracking-[0.25em] font-mono mt-0.5"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Mon, Apr 16 · 4 New Matches
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Match', value: '87%', accent: true },
          { label: 'Roles', value: '24' },
          { label: 'Chats', value: '3' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-lg border p-2.5"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderTopColor: m.accent ? 'var(--color-accent)' : 'var(--color-border)',
              borderTopWidth: m.accent ? 2 : 1,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
          >
            <p
              className="text-[8px] uppercase tracking-[0.2em] font-mono font-medium"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {m.label}
            </p>
            <p
              className="text-xl font-serif font-normal mt-0.5"
              style={{ color: 'var(--color-text)' }}
            >
              {m.value}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold" style={{ color: 'var(--color-text)' }}>
            Top Matches
          </p>
          <span
            className="text-[8px] uppercase tracking-[0.25em] font-mono"
            style={{ color: 'var(--color-textMuted)' }}
          >
            This Week
          </span>
        </div>
        <div className="space-y-1">
          {matches.map((m, i) => (
            <motion.div
              key={m.name}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.55 + i * 0.08 }}
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: `color-mix(in srgb, ${m.color} 15%, transparent)`,
                  color: m.color,
                }}
              >
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
                <span className="text-[10px] font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                  {m.name}
                </span>
                <span
                  className="text-[8px] uppercase tracking-wider font-medium truncate"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {m.role}
                </span>
              </div>
              <span
                className="text-[10px] font-semibold tabular-nums"
                style={{ color: m.color }}
              >
                {m.score}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Scene 2: Assessment — scenario options matching ScenarioOptions ── */
function SceneAssessmentScene({ pickedIndex }: { pickedIndex: number }) {
  const options = [
    'Jump in, figure it out',
    'Research first, then act',
    'Collaborate and decide',
    'Follow a proven plan',
  ];

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] uppercase tracking-[0.3em] font-mono" style={{ color: 'var(--color-textMuted)' }}>
          Question 3 / 10
        </p>
        <p className="text-[9px] font-mono tabular-nums" style={{ color: 'var(--color-accent)' }}>
          30%
        </p>
      </div>
      <div
        className="h-0.5 rounded-full mb-4 overflow-hidden"
        style={{ backgroundColor: 'var(--color-border)' }}
      >
        <div className="h-full rounded-full" style={{ backgroundColor: 'var(--color-accent)', width: '30%' }} />
      </div>

      <motion.p
        className="text-[13px] font-serif font-normal leading-snug mb-4"
        style={{ color: 'var(--color-text)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        When you face an ambiguous problem,{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          what feels most natural?
        </span>
      </motion.p>

      <div className="space-y-1.5 flex-1">
        {options.map((opt, i) => {
          const isPicked = i === pickedIndex;
          return (
            <motion.div
              key={opt}
              className="rounded-lg border px-3 py-2 text-[11px] flex items-center gap-2"
              style={{
                borderColor: isPicked ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: isPicked
                  ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)'
                  : 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: `1.5px solid ${isPicked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  backgroundColor: isPicked ? 'var(--color-accent)' : 'transparent',
                }}
              >
                {isPicked && <Check className="w-2.5 h-2.5" style={{ color: 'var(--color-accentText)' }} />}
              </div>
              <span className="flex-1">{opt}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Scene 3: Insights — archetype + OCEAN matching PersonalityInsights ── */
function SceneInsights() {
  const traits = [
    { label: 'Openness', value: 82, color: 'var(--color-trait-openness)' },
    { label: 'Conscientious', value: 68, color: 'var(--color-trait-conscientiousness)' },
    { label: 'Extraversion', value: 55, color: 'var(--color-trait-extraversion)' },
    { label: 'Agreeableness', value: 78, color: 'var(--color-trait-agreeableness)' },
    { label: 'Stability', value: 71, color: 'var(--color-trait-stability)' },
  ];

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p
          className="text-[9px] uppercase tracking-[0.3em] font-mono"
          style={{ color: 'var(--color-accent)' }}
        >
          Your Archetype
        </p>
        <p
          className="text-xl font-serif italic font-normal mt-1"
          style={{ color: 'var(--color-text)' }}
        >
          The Explorer
        </p>
      </motion.div>

      <div className="flex-1 space-y-2">
        {traits.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.25 + i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text)' }}
              >
                {t.label}
              </span>
              <span className="text-[10px] font-mono tabular-nums" style={{ color: t.color }}>
                {t.value}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: t.color }}
                initial={{ width: 0 }}
                animate={{ width: `${t.value}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Scene 4: Connect — match card + calendar picker ── */
function SceneConnect({ clicked }: { clicked: boolean }) {
  const times = ['9:00', '10:30', '12:00', '2:00', '3:30', '4:30'];
  const pickedTime = 1;

  return (
    <div className="w-full h-full p-4 flex flex-col gap-3">
      <motion.div
        className="rounded-lg border p-2.5 flex items-center gap-2.5"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'color-mix(in srgb, var(--color-accent) 25%, transparent)',
          borderLeftWidth: 2,
          borderLeftColor: 'var(--color-accent)',
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative w-8 h-8 flex-shrink-0">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="13" fill="none" stroke="var(--color-border)" strokeWidth="2" />
            <motion.circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="var(--color-score-excellent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="81.7"
              initial={{ strokeDashoffset: 81.7 }}
              animate={{ strokeDashoffset: 81.7 * 0.06 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold tabular-nums"
            style={{ color: 'var(--color-score-excellent)' }}
          >
            94
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold" style={{ color: 'var(--color-text)' }}>
            Acme Labs · Senior Eng
          </p>
          <p
            className="text-[9px] uppercase tracking-wider font-medium"
            style={{ color: 'var(--color-success)' }}
          >
            ▲ Strong Fit
          </p>
        </div>
      </motion.div>

      <motion.div
        className="rounded-lg border p-3 flex-1"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Coffee className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
            <p className="text-[10px] font-semibold" style={{ color: 'var(--color-text)' }}>
              Pick a Time · Wed
            </p>
          </div>
          <p
            className="text-[8px] uppercase tracking-[0.25em] font-mono"
            style={{ color: 'var(--color-textMuted)' }}
          >
            15 min
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {times.map((t, i) => {
            const isPicked = clicked && i === pickedTime;
            return (
              <motion.div
                key={t}
                className="py-1.5 text-center text-[10px] font-medium rounded border"
                style={{
                  borderColor: isPicked
                    ? 'var(--color-accent)'
                    : 'color-mix(in srgb, var(--color-accent) 25%, transparent)',
                  backgroundColor: isPicked
                    ? 'var(--color-accent)'
                    : 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                  color: isPicked ? 'var(--color-accentText)' : 'var(--color-text)',
                }}
                animate={isPicked ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {t}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-2 rounded border flex items-center gap-1.5 px-2 py-1.5"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-success) 25%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 6%, transparent)',
          }}
          animate={{ opacity: clicked ? 1 : 0.4 }}
          transition={{ duration: 0.3 }}
        >
          <Video className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
          <span className="text-[9px] font-mono flex-1 truncate" style={{ color: 'var(--color-textSecondary)' }}>
            meet.google.com/xyz-abc
          </span>
          {clicked && <Check className="w-2.5 h-2.5" style={{ color: 'var(--color-success)' }} />}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Phantom cursor ── */
function SceneCursor({ x, y, clicked }: { x: number; y: number; clicked: boolean }) {
  return (
    <>
      <motion.div
        className="absolute pointer-events-none z-20"
        style={{ left: `${x}%`, top: `${y}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <MousePointer2
          className="w-4 h-4 drop-shadow"
          style={{ color: 'var(--color-accent)', fill: 'var(--color-accent)' }}
        />
      </motion.div>
      {clicked && (
        <motion.div
          key={`ripple-${x}-${y}`}
          className="absolute pointer-events-none z-20"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ border: '2px solid var(--color-accent)' }}
          />
        </motion.div>
      )}
    </>
  );
}

function ProcessCard() {
  const [active, setActive] = useState(0);
  const [clicked, setClicked] = useState(false);
  const [pickedIndex, setPickedIndex] = useState(-1);

  useEffect(() => {
    setClicked(false);
    setPickedIndex(-1);

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (active === 1) {
      timers.push(setTimeout(() => setPickedIndex(0), 1600));
    }
    if (active === 3) {
      timers.push(setTimeout(() => setClicked(true), 1800));
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
    <SceneAssessmentScene pickedIndex={pickedIndex} />,
    <SceneInsights />,
    <SceneConnect clicked={clicked} />,
  ];

  const cursorPositions: (null | { x: number; y: number })[] = [
    null,
    { x: 28, y: 58 },
    null,
    { x: 42, y: 62 },
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
          From dashboard to offer.{' '}
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
                initial={{
                  opacity: 0,
                  scale: active % 2 === 0 ? 1.15 : 0.88,
                  filter: 'blur(6px)',
                }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  scale: active % 2 === 0 ? 0.88 : 1.15,
                  filter: 'blur(4px)',
                }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                {scenes[active]}
                {cursorPositions[active] && (
                  <SceneCursor
                    x={cursorPositions[active]!.x}
                    y={cursorPositions[active]!.y}
                    clicked={active === 3 ? clicked : pickedIndex >= 0}
                  />
                )}
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
                  className="text-[10px] font-semibold uppercase tracking-[0.15em] truncate"
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
   2. SCIENCE — Big Five / OCEAN radar
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
          70 years of research,{' '}
          <span className="italic" style={{ color: 'var(--color-accent)' }}>
            in 15 minutes.
          </span>
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
          The same model used by Fortune 500s — openness, conscientiousness, extraversion,
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
   3. SPEED — No resume
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
        No resume.{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          No cover letter.
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
   4. COFFEE — animated booking slots
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
        Book a coffee. Skip the{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          cold apply.
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
   5. TWO-SIDED — Venn
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
        Made for both{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          sides.
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
   6. PRIVACY — lock + encryption visual
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
        Private by{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          default.
        </span>
      </h3>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
        Your profile is invisible until you opt in. Employers never see your data without permission.
      </p>

      {/* Encryption visual — animated hash string */}
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
          viewport={{ once: true, margin: '-80px' }}
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
            The whole job search,{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              rethought.
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 auto-rows-[minmax(280px,auto)]">
          {/* Big process card — 2 cols, 2 rows */}
          <motion.div
            className="lg:col-span-2 lg:row-span-2 min-h-[540px]"
            initial={{ opacity: 0, scale: 0.82, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.01 }}
            viewport={{ once: true, margin: '-60px' }}
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
            viewport={{ once: true, margin: '-60px' }}
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
            viewport={{ once: true, margin: '-60px' }}
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
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.42, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center center' }}
          >
            <CoffeeChatCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.015 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.54, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center center' }}
          >
            <TwoSidedCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ scale: 1.015 }}
            viewport={{ once: true, margin: '-60px' }}
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
