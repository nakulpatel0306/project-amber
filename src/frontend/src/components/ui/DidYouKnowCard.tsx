import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

interface Fact {
  title: string;
  description: string;
  source?: string;
}

interface DidYouKnowCardProps {
  facts: Fact[];
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function DidYouKnowCard({
  facts,
  autoRotate = true,
  rotateInterval = 8000,
}: DidYouKnowCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || facts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, facts.length, rotateInterval]);

  if (!facts || facts.length === 0) {
    return null;
  }

  const currentFact = facts[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + facts.length) % facts.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % facts.length);
  };

  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
        >
          <Lightbulb className="w-4 h-4" style={{ color: '#F59E0B' }} />
        </div>
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Did You Know?
        </h3>
      </div>

      {/* Fact content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            {currentFact.title}
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {currentFact.description}
          </p>
          {currentFact.source && (
            <p
              className="text-xs mt-2 italic"
              style={{ color: 'var(--color-textMuted)' }}
            >
              — {currentFact.source}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {facts.length > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={goToPrevious}
            className="p-1.5 rounded-lg hover:bg-[var(--color-background)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
          <div className="flex gap-1.5">
            {facts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: index === currentIndex
                    ? 'var(--color-accent)'
                    : 'var(--color-border)',
                }}
              />
            ))}
          </div>
          <button
            onClick={goToNext}
            className="p-1.5 rounded-lg hover:bg-[var(--color-background)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
        </div>
      )}
    </div>
  );
}
