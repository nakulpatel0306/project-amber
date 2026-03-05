import { useState, useEffect, useRef } from 'react';

/**
 * Ensures a loader displays for at least `minDuration` ms, even if data loads faster.
 * Returns `true` until both conditions are met:
 *   1. `isLoading` has become `false`
 *   2. `minDuration` ms have elapsed since mount
 */
export function useMinLoader(isLoading: boolean, minDuration = 3000): boolean {
  const [minElapsed, setMinElapsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setMinElapsed(true), minDuration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [minDuration]);

  return isLoading || !minElapsed;
}
