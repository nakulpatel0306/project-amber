import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Brain, Users, Heart } from 'lucide-react';
import { ScoreRing } from '../ui/ScoreRing';

const QUESTION = 'I enjoy exploring new ideas and creative possibilities.';

const OPTIONS = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly Agree', value: 5 },
];

const TRAITS = [
  { label: 'Explorer', icon: Sparkles, color: 'var(--color-trait-openness)' },
  { label: 'Creative Thinker', icon: Brain, color: 'var(--color-trait-extraversion)' },
  { label: 'Team Player', icon: Users, color: 'var(--color-trait-agreeableness)' },
  { label: 'Empathetic', icon: Heart, color: 'var(--color-trait-stability)' },
];

export function InteractivePreview() {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (value: number) => {
    setSelected(value);
    setTimeout(() => setShowResult(true), 600);
  };

  const handleReset = () => {
    setShowResult(false);
    setSelected(null);
  };

  return (
    <motion.div
      className="max-w-lg mx-auto mt-16"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Label */}
      <div className="text-center mb-4">
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Try it yourself
        </span>
      </div>

      {/* Glass card */}
      <div
        className="rounded-2xl border p-6 backdrop-blur-xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px color-mix(in srgb, var(--color-accent) 6%, transparent)',
        }}
      >
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Question number */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}
                >
                  1
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--color-textMuted)' }}>
                  Personality Assessment
                </span>
              </div>

              {/* Question text */}
              <p
                className="text-base font-medium mb-5 leading-relaxed"
                style={{ color: 'var(--color-text)' }}
              >
                "{QUESTION}"
              </p>

              {/* Options */}
              <div className="space-y-2">
                {OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-[border-color,background-color,transform] duration-150"
                    style={{
                      borderColor: selected === opt.value ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: selected === opt.value ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                      color: 'var(--color-text)',
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        borderColor: selected === opt.value ? 'var(--color-accent)' : 'var(--color-border)',
                        backgroundColor: selected === opt.value ? 'var(--color-accent)' : 'transparent',
                      }}
                    >
                      {selected === opt.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <Check className="w-3 h-3" style={{ color: 'var(--color-accentText)' }} />
                        </motion.div>
                      )}
                    </div>
                    <span className="font-medium">{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="text-center"
            >
              <p
                className="text-xs font-medium uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Your Match Preview
              </p>

              {/* Score ring */}
              <div className="flex justify-center mb-5">
                <ScoreRing score={87} size={80} strokeWidth={4} fontSize="text-lg" />
              </div>

              <p
                className="text-lg font-semibold mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                Strong Culture Fit
              </p>
              <p
                className="text-sm mb-5"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Based on your personality profile
              </p>

              {/* Trait badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {TRAITS.map((trait, i) => (
                  <motion.div
                    key={trait.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                    style={{
                      color: trait.color,
                      borderColor: trait.color,
                      backgroundColor: `color-mix(in srgb, ${trait.color} 8%, transparent)`,
                    }}
                  >
                    <trait.icon className="w-3 h-3" />
                    {trait.label}
                  </motion.div>
                ))}
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--color-accent)' }}
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
