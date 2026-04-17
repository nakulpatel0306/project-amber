import { useReducedMotion } from 'framer-motion';

/**
 * Wraps Framer Motion's useReducedMotion for consistent access.
 * Returns helpers to conditionally apply motion props.
 */
export function useMotionSafe() {
  const shouldReduce = useReducedMotion();

  return {
    shouldReduceMotion: !!shouldReduce,
    /** Returns the props if motion is safe, empty object otherwise */
    motionProps: <T extends Record<string, unknown>>(props: T): T | Record<string, never> =>
      shouldReduce ? {} : props,
  };
}
