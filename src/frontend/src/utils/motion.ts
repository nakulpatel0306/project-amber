import type { Variants } from 'framer-motion';

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

/* ── Bento grid stagger (hero dashboard layouts) ── */
export const bentoContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

export const bentoItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

/* ── Card grid stagger (player card grids) ── */
export const cardGridContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

export const cardItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

/* ── Horizontal entrance variants ── */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
};

/* ── Counter / stat number reveal ── */
export const counterReveal: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

/* ── Full section fade-up reveal ── */
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ── Ember "Precision Dark" variants ── */
export const emberFadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export const emberStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

export const emberScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Phase 2: Visual polish variants ── */

/** Full-page entrance — fade up from 30px */
export const pageEntrance: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

/** Form field stagger container */
export const formStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

/** Form field stagger child */
export const formItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
};

/** Dashboard section stagger container */
export const dashboardStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

/** Dashboard section stagger child — more dramatic entrance */
export const dashboardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

/** Assessment question slide — enter from right */
export const questionEnter: Variants = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
  },
};

/** Answer option stagger container */
export const answerStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.15 },
  },
};

/** Answer option stagger child */
export const answerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
};

/** Celebration / milestone bounce */
export const celebrationBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 15 },
  },
};

/** Animated count-up helper */
export function animateCountUp(
  target: number,
  duration: number,
  onUpdate: (value: number) => void
) {
  const start = performance.now();
  const step = (now: number) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out curve
    const eased = 1 - Math.pow(1 - progress, 3);
    onUpdate(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
