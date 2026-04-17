import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Briefcase, Coffee, Sparkles, TrendingUp } from 'lucide-react';

const MOCK_MATCHES = [
  { company: 'Acme Labs', role: 'Senior Engineer', score: 94, tier: 'excellent' as const },
  { company: 'Northwind', role: 'Product Designer', score: 87, tier: 'excellent' as const },
  { company: 'Vanta', role: 'ML Researcher', score: 81, tier: 'good' as const },
  { company: 'Supabase', role: 'DevRel Lead', score: 76, tier: 'good' as const },
];

const tierColor: Record<string, string> = {
  excellent: 'var(--color-score-excellent)',
  good: 'var(--color-score-good)',
  fair: 'var(--color-score-fair)',
};

export function DashboardPreviewWindow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section intro */}
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
          >
            <Sparkles className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--color-accent)' }}>
              Your personal dashboard
            </span>
          </motion.div>

          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight mb-5"
            style={{ color: 'var(--color-text)' }}
          >
            Everything about your fit,{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              in one place.
            </span>
          </h2>

          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Your matches, coffee chats, and personality insights — always current, always actionable.
          </p>
        </motion.div>

        {/* 3D perspective container */}
        <div
          ref={containerRef}
          className="relative"
          style={{ perspective: '2000px', perspectiveOrigin: '50% 0%' }}
        >
          <motion.div
            style={{ rotateX, scale, y, transformStyle: 'preserve-3d' }}
            className="relative rounded-2xl overflow-hidden border shadow-2xl"
          >
            {/* macOS-style window chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{
                backgroundColor: 'var(--color-backgroundSecondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28C840' }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div
                  className="text-[11px] font-mono px-3 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-textMuted)',
                  }}
                >
                  amber.app/dashboard
                </div>
              </div>
              <div style={{ width: 52 }} />
            </div>

            {/* Dashboard content */}
            <div
              className="p-6 lg:p-8 min-h-[480px]"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              {/* Greeting */}
              <div className="mb-6">
                <h3
                  className="text-2xl sm:text-3xl font-serif font-normal tracking-tight"
                  style={{ color: 'var(--color-text)' }}
                >
                  Good morning,{' '}
                  <span className="italic" style={{ color: 'var(--color-accent)' }}>
                    Alex
                  </span>
                </h3>
                <p
                  className="text-[11px] uppercase tracking-[0.2em] mt-1"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  Mon, Apr 16 · 4 new matches
                </p>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Match index', value: '87', suffix: '%', icon: TrendingUp, accent: true },
                  { label: 'Open roles', value: '24', suffix: '', icon: Briefcase, accent: false },
                  { label: 'Coffee chats', value: '3', suffix: '', icon: Coffee, accent: false },
                ].map((m, i) => (
                  <motion.div
                    key={i}
                    className="bento-card p-4"
                    style={m.accent ? { borderTopColor: 'var(--color-accent)', borderTopWidth: 2 } : undefined}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="text-[10px] uppercase tracking-[0.2em] font-medium"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        {m.label}
                      </span>
                      <m.icon className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)', opacity: 0.5 }} />
                    </div>
                    <div
                      className="text-3xl font-serif font-normal"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {m.value}
                      <span className="text-lg">{m.suffix}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Top matches */}
              <div className="bento-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Top matches
                  </h4>
                  <span
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    This week
                  </span>
                </div>
                <div className="space-y-2.5">
                  {MOCK_MATCHES.map((match, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'color-mix(in srgb, var(--color-surface) 50%, transparent)',
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${tierColor[match.tier]} 15%, transparent)`,
                            color: tierColor[match.tier],
                          }}
                        >
                          {match.company[0]}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: 'var(--color-text)' }}
                          >
                            {match.company}
                          </p>
                          <p
                            className="text-[11px] uppercase tracking-wider truncate"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            {match.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className="text-sm font-semibold tabular-nums"
                          style={{ color: tierColor[match.tier] }}
                        >
                          {match.score}%
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ambient glow under window */}
          <div
            className="absolute inset-x-8 -bottom-8 h-24 blur-3xl -z-10"
            style={{
              background:
                'radial-gradient(ellipse at center top, color-mix(in srgb, var(--color-accent) 20%, transparent), transparent 70%)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
