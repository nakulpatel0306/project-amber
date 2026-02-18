import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface DidYouKnowCardProps {
  facts: string[];
  autoRotate?: boolean;
  interval?: number;
}

export function DidYouKnowCard({
  facts,
  autoRotate = true,
  interval = 8000,
}: DidYouKnowCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || facts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoRotate, facts.length, interval]);

  if (facts.length === 0) return null;

  return (
    <div
      className="p-5 rounded-xl relative overflow-hidden"
      style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
        >
          <Lightbulb className="w-4.5 h-4.5" style={{ color: '#F59E0B' }} />
        </div>
        <div className="flex-1 min-h-[48px]">
          <p className="text-xs font-semibold mb-1" style={{ color: '#F59E0B' }}>
            Did You Know?
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              className="text-sm"
              style={{ color: 'var(--color-textSecondary)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {facts[currentIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {facts.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {facts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                backgroundColor: i === currentIndex ? '#F59E0B' : 'var(--color-border)',
                width: i === currentIndex ? '12px' : '6px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
