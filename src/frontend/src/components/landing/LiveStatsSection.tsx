import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  {
    value: 73,
    suffix: '%',
    label: 'Of Employees Quit Due To Culture Mismatch',
    sublabel: 'Gallup, 2024',
  },
  {
    value: 40,
    suffix: '+',
    label: 'Companies Hiring Through Amber',
    sublabel: 'And Growing Weekly',
  },
  {
    value: 15,
    suffix: ' min',
    label: 'From Assessment To Matched',
    sublabel: 'No Resume. No Cover Letter.',
  },
  {
    value: 87,
    suffix: '%',
    label: 'Average Culture-Fit For Placed Candidates',
    sublabel: 'Measured 6 Months Post-Hire',
  },
];

function AnimatedNumber({ value, suffix, trigger }: { value: number; suffix: string; trigger: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * value);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, value]);

  return (
    <span className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function LiveStatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-100px' });

  return (
    <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: 'var(--color-accent)' }}
          >
            By The Numbers
          </span>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight mt-4"
            style={{ color: 'var(--color-text)' }}
          >
            The Job Market{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              Is Broken.
            </span>
            <br />
            We Have The Data.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              className="p-8 relative"
              style={{ backgroundColor: 'var(--color-surface)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="text-5xl lg:text-6xl font-serif font-normal tracking-tight mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                <AnimatedNumber value={stat.value} suffix={stat.suffix} trigger={inView} />
              </div>
              <p
                className="text-sm font-medium mb-1 leading-snug"
                style={{ color: 'var(--color-text)' }}
              >
                {stat.label}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {stat.sublabel}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
