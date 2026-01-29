import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export function AnimatedCounter({
  target,
  suffix = '',
  label,
  duration = 2000,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (target - startValue) * eased);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return (
    <div ref={ref} className="text-center">
      <div
        className="text-4xl sm:text-5xl font-bold mb-2"
        style={{ color: 'var(--color-accent)' }}
      >
        {count.toLocaleString()}{suffix}
      </div>
      <div
        className="text-sm"
        style={{ color: 'var(--color-textSecondary)' }}
      >
        {label}
      </div>
    </div>
  );
}
