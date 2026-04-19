import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Coffee,
  Lock,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { EmberFirefly } from '../ember/EmberFirefly';

/* ── Mock Ember chat messages ── */
const EMBER_CONVERSATION = [
  { role: 'user', text: "What should I ask in my coffee chat with Acme Labs?" },
  {
    role: 'ember',
    text: "Based on their Harmonizer culture, focus on how teams resolve conflict. Ask: 'Can you walk me through a recent disagreement and how it was worked out?'",
  },
  { role: 'user', text: "Am I a good fit for their senior engineer role?" },
  {
    role: 'ember',
    text: "87% match. Your Explorer profile complements their Strategist-heavy team. You bring curiosity they lack, so lead with a story about learning in public.",
  },
];

/* ── OCEAN dimensions for radar chart ── */
const OCEAN_DIMENSIONS = [
  { label: 'Openness', you: 82, company: 75, color: 'var(--color-trait-openness)' },
  { label: 'Conscientiousness', you: 68, company: 72, color: 'var(--color-trait-conscientiousness)' },
  { label: 'Extraversion', you: 55, company: 58, color: 'var(--color-trait-extraversion)' },
  { label: 'Agreeableness', you: 78, company: 81, color: 'var(--color-trait-agreeableness)' },
  { label: 'Stability', you: 71, company: 68, color: 'var(--color-trait-stability)' },
];

function EmberChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view as the transcript grows
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [visibleCount, typing]);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      setVisibleCount(0);
      setTyping(false);

      EMBER_CONVERSATION.forEach((_, i) => {
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            if (i > 0 && EMBER_CONVERSATION[i].role === 'ember') setTyping(true);
            timers.push(
              setTimeout(() => {
                if (cancelled) return;
                setTyping(false);
                setVisibleCount(i + 1);
              }, EMBER_CONVERSATION[i].role === 'ember' ? 900 : 0)
            );
          }, 800 + i * 1600)
        );
      });

      // Hold the full transcript for a beat, then restart the loop
      const totalDuration = 800 + EMBER_CONVERSATION.length * 1600 + 2800;
      timers.push(setTimeout(runCycle, totalDuration));
    };

    runCycle();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.div
      className="relative rounded-2xl border overflow-hidden flex-1 flex flex-col shadow-2xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* macOS-style window chrome */}
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
          <div
            className="text-[10px] font-mono px-2.5 py-0.5 rounded flex items-center gap-1.5"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}
          >
            <Lock className="w-2.5 h-2.5" />
            amber.app/ember
          </div>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Ember header */}
      <div
        className="px-5 py-3.5 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex-shrink-0">
          <EmberFirefly size="sm" mood="happy" animated />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
            Ember
            <span
              className="text-[9px] font-semibold px-1.5 py-px rounded uppercase tracking-wider"
              style={{
                color: 'var(--color-accent)',
                backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
              }}
            >
              AI
            </span>
          </p>
          <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
            Online · usually replies instantly
          </p>
        </div>
      </div>

      {/* Chat body */}
      <div
        ref={chatBodyRef}
        className="p-5 space-y-3 h-[360px] overflow-y-auto"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--color-backgroundSecondary) 40%, transparent), transparent)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-border) transparent',
        }}
      >
        <AnimatePresence initial={false}>
          {EMBER_CONVERSATION.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ember' && (
                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5 overflow-visible">
                  <div style={{ transform: 'scale(0.75)', transformOrigin: 'center' }}>
                    <EmberFirefly size="sm" mood="happy" />
                  </div>
                </div>
              )}
              <div
                className="flex flex-col gap-1 max-w-[78%]"
                style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <div
                  className="px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl"
                  style={{
                    backgroundColor:
                      msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: msg.role === 'user' ? 'var(--color-accentText)' : 'var(--color-text)',
                    border: msg.role === 'ember' ? '1px solid var(--color-border)' : 'none',
                    borderBottomRightRadius: msg.role === 'user' ? '6px' : undefined,
                    borderBottomLeftRadius: msg.role === 'ember' ? '6px' : undefined,
                  }}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] px-1" style={{ color: 'var(--color-textMuted)' }}>
                  {msg.role === 'user' ? 'You · just now' : 'Ember · just now'}
                </span>
              </div>
              {msg.role === 'user' && (
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 text-[10px] font-bold"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  Y
                </div>
              )}
            </motion.div>
          ))}

          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 justify-start"
            >
              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5 overflow-visible">
                <div style={{ transform: 'scale(0.75)', transformOrigin: 'center' }}>
                  <EmberFirefly size="sm" mood="thinking" animated />
                </div>
              </div>
              <div
                className="px-3.5 py-2.5 rounded-2xl flex gap-1 items-center"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderBottomLeftRadius: '6px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-textMuted)' }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestion chips */}
      <div
        className="px-4 py-2 flex gap-2 border-t overflow-x-auto"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundSecondary) 40%, transparent)',
          scrollbarWidth: 'none',
        }}
      >
        {['Explain my top match', 'Prep for coffee chat', 'Compare two roles'].map((s) => (
          <div
            key={s}
            className="text-[11px] px-2.5 py-1 rounded-full border flex-shrink-0 whitespace-nowrap"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-textSecondary)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 border-t flex items-center gap-2"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div
          className="flex-1 px-3 py-2 text-[13px] rounded-lg border flex items-center"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-textMuted)',
          }}
        >
          <span>Ask Ember anything</span>
          <motion.span
            className="inline-block w-px h-3.5 ml-0.5"
            style={{ backgroundColor: 'var(--color-accent)' }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function MatchVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAnimated(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative rounded-2xl border overflow-hidden flex-1 flex flex-col shadow-2xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      {/* macOS window chrome */}
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
          <div
            className="text-[10px] font-mono px-2.5 py-0.5 rounded flex items-center gap-1.5"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}
          >
            <Lock className="w-2.5 h-2.5" />
            amber.app/matches/acme-labs
          </div>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Role header */}
      <div
        className="px-5 py-4 flex items-center gap-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, var(--color-accent))',
            color: '#fff',
          }}
        >
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Senior Software Engineer
          </p>
          <p className="text-[11px] flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--color-textMuted)' }}>
            <span className="font-medium" style={{ color: 'var(--color-textSecondary)' }}>Acme Labs</span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              SF · Remote OK
            </span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
            <span>$180K–$240K</span>
          </p>
        </div>
        <motion.div
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 flex-shrink-0"
          style={{
            color: 'var(--color-success)',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-success) 25%, transparent)',
          }}
          initial={{ scale: 0 }}
          animate={animated ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: animated ? 0.8 : 0, type: 'spring', stiffness: 300 }}
        >
          <TrendingUp className="w-2.5 h-2.5" />
          Strong Fit
        </motion.div>
      </div>

      {/* Overall score */}
      <div className="px-5 pt-4 pb-3 flex items-end justify-between">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-medium mb-1"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Overall match
          </p>
          <p
            className="text-5xl font-serif font-normal leading-none tabular-nums"
            style={{ color: 'var(--color-success)' }}
          >
            87<span className="text-2xl">%</span>
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-[10px] uppercase tracking-[0.2em] font-medium mb-1"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Archetype
          </p>
          <p className="text-sm font-semibold italic font-serif" style={{ color: 'var(--color-text)' }}>
            The Explorer
          </p>
        </div>
      </div>

      {/* OCEAN breakdown */}
      <div className="px-5 pb-4 space-y-2.5 flex-1">
        <div
          className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-medium mb-1.5"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <span>Big Five breakdown</span>
          <span>You · Team</span>
        </div>
        {OCEAN_DIMENSIONS.map((dim, i) => {
          const delta = dim.you - dim.company;
          const aligned = Math.abs(delta) < 8;
          return (
            <div key={dim.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 rounded-full" style={{ backgroundColor: dim.color }} />
                  <span className="text-[12px] font-medium" style={{ color: 'var(--color-text)' }}>
                    {dim.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono tabular-nums"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {dim.you} · {dim.company}
                  </span>
                  <span
                    className="text-[9px] font-mono font-semibold px-1 rounded tabular-nums"
                    style={{
                      color: aligned ? 'var(--color-success)' : 'var(--color-textMuted)',
                      backgroundColor: aligned
                        ? 'color-mix(in srgb, var(--color-success) 10%, transparent)'
                        : 'color-mix(in srgb, var(--color-border) 40%, transparent)',
                    }}
                  >
                    {delta >= 0 ? '+' : ''}
                    {delta}
                  </span>
                </div>
              </div>
              <div
                className="relative h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}
              >
                {/* Company bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-textMuted) 40%, transparent)',
                  }}
                  initial={{ width: 0 }}
                  animate={animated ? { width: `${dim.company}%` } : { width: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: animated ? 0.2 + i * 0.08 : 0,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                />
                {/* Your bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: dim.color }}
                  initial={{ width: 0 }}
                  animate={animated ? { width: `${dim.you}%` } : { width: 0 }}
                  transition={{
                    duration: 1.0,
                    delay: animated ? 0.3 + i * 0.08 : 0,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ember's take */}
      <motion.div
        className="mx-5 mb-4 p-3 rounded-xl flex items-start gap-2.5"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)',
        }}
        initial={{ opacity: 0 }}
        animate={animated ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: animated ? 1.2 : 0 }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), #F59E0B)' }}
        >
          <Sparkles className="w-3 h-3" style={{ color: '#fff' }} />
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
            Ember's take:{' '}
          </span>
          Your openness complements their structure-first team. You'll bring fresh ideas without disrupting their rhythm.
        </p>
      </motion.div>

      {/* Action buttons */}
      <div
        className="px-4 py-3 border-t flex items-center gap-2"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundSecondary) 40%, transparent)',
        }}
      >
        <button
          className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accentText)',
          }}
        >
          <Coffee className="w-3.5 h-3.5" />
          Schedule coffee chat
        </button>
        <button
          className="w-9 h-9 rounded-lg border flex items-center justify-center"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-textSecondary)',
            backgroundColor: 'var(--color-surface)',
          }}
          aria-label="Save match"
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function ProductShowcase() {
  return (
    <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(600px circle at 50% 20%, color-mix(in srgb, var(--color-accent) 4%, transparent), transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
              borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--color-accent)' }}>
              See It In Action
            </span>
          </motion.div>

          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight mb-5"
            style={{ color: 'var(--color-text)' }}
          >
            Not Just A Match Score.{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              Real Insight.
            </span>
          </h2>

          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Ember doesn't just tell you there's a fit. It shows you why, where the friction is, and
            how to make your first conversation count.
          </p>
        </motion.div>

        {/* Two-column showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left: Match visualization */}
          <div className="flex flex-col">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--color-accent)' }}>
                  Science-Backed
                </span>
              </div>
              <h3
                className="text-2xl sm:text-3xl font-serif font-normal tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Your Personality, Visualized.
              </h3>
              <p className="text-sm mt-2" style={{ color: 'var(--color-textMuted)' }}>
                Big Five Dimensions, Side-By-Side With Every Role.
              </p>
            </motion.div>
            <MatchVisualization />
          </div>

          {/* Right: Ember chat */}
          <div className="flex flex-col">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--color-accent)' }}>
                  AI Coach
                </span>
              </div>
              <h3
                className="text-2xl sm:text-3xl font-serif font-normal tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Ask Ember Anything.
              </h3>
              <p className="text-sm mt-2" style={{ color: 'var(--color-textMuted)' }}>
                Prep For Coffee Chats. Understand Culture. Know Where You'll Thrive.
              </p>
            </motion.div>
            <EmberChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
