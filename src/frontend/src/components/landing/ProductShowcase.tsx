import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, TrendingUp, Brain, Target, Send } from 'lucide-react';

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
    text: "87% match. Your Explorer profile complements their Strategist-heavy team — you bring curiosity they lack. Lead with a story about learning in public.",
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });

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

  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <motion.div
      ref={containerRef}
      style={{ y: parallaxY }}
      className="relative rounded-3xl border overflow-hidden"
    >
      <div
        className="px-6 py-5 border-b flex items-center gap-3"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'color-mix(in srgb, var(--color-surface) 50%, transparent)',
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Ember
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            Your culture-fit AI
          </p>
        </div>
        <div
          className="w-2 h-2 rounded-full status-dot"
          style={{ backgroundColor: 'var(--color-success)' }}
        />
      </div>

      <div
        className="p-6 space-y-3 min-h-[360px]"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 30%, transparent), transparent)',
        }}
      >
        <AnimatePresence>
          {EMBER_CONVERSATION.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  backgroundColor:
                    msg.role === 'user'
                      ? 'var(--color-accent)'
                      : 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                  color:
                    msg.role === 'user' ? 'var(--color-accentText)' : 'var(--color-text)',
                  border: msg.role === 'ember' ? '1px solid var(--color-border)' : 'none',
                }}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div
                className="px-4 py-3 rounded-2xl flex gap-1 items-center"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                  border: '1px solid var(--color-border)',
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

      <div
        className="px-4 py-3 border-t flex items-center gap-2"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <input
          disabled
          placeholder="Ask Ember anything…"
          className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
          style={{ color: 'var(--color-textMuted)' }}
        />
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center"
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
        if (entry.isIntersecting) setAnimated(true);
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <motion.div
      ref={containerRef}
      style={{ y: parallaxY }}
      className="relative rounded-3xl border p-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
        >
          <Target className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Compatibility Breakdown
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            You vs. Acme Labs culture
          </p>
        </div>
        <div className="ml-auto">
          <motion.div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              color: 'var(--color-success)',
              backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-success) 25%, transparent)',
            }}
            initial={{ scale: 0 }}
            animate={animated ? { scale: 1 } : {}}
            transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
          >
            87% match
          </motion.div>
        </div>
      </div>

      <div className="space-y-4">
        {OCEAN_DIMENSIONS.map((dim, i) => (
          <div key={dim.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                {dim.label}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--color-textMuted)' }}>
                {dim.you} · {dim.company}
              </span>
            </div>
            <div
              className="relative h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}
            >
              {/* Company bar (background) */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-textMuted) 40%, transparent)' }}
                initial={{ width: 0 }}
                animate={animated ? { width: `${dim.company}%` } : {}}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              />
              {/* Your bar */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: dim.color }}
                initial={{ width: 0 }}
                animate={animated ? { width: `${dim.you}%` } : {}}
                transition={{ duration: 1.0, delay: 0.3 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </div>
        ))}
      </div>

      <motion.div
        className="mt-6 pt-6 border-t"
        style={{ borderColor: 'var(--color-border)' }}
        initial={{ opacity: 0 }}
        animate={animated ? { opacity: 1 } : {}}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
          >
            <Brain className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Ember's take:</span>{' '}
            Your openness complements their structure-first team. You'll bring fresh ideas without
            disrupting their rhythm.
          </p>
        </div>
      </motion.div>
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
          viewport={{ once: true, margin: '-80px' }}
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
            viewport={{ once: true }}
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
            Not just a match score.{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              Real insight.
            </span>
          </h2>

          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Ember doesn't just tell you there's a fit. She shows you why, where the friction is, and
            how to make your first conversation count.
          </p>
        </motion.div>

        {/* Two-column showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Match visualization */}
          <div>
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
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
                Your personality, visualized.
              </h3>
              <p className="text-sm mt-2" style={{ color: 'var(--color-textMuted)' }}>
                Big Five dimensions, side-by-side with every role.
              </p>
            </motion.div>
            <MatchVisualization />
          </div>

          {/* Right: Ember chat */}
          <div>
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
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
                Ask Ember anything.
              </h3>
              <p className="text-sm mt-2" style={{ color: 'var(--color-textMuted)' }}>
                Prep for coffee chats. Understand culture. Know where you'll thrive.
              </p>
            </motion.div>
            <EmberChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
