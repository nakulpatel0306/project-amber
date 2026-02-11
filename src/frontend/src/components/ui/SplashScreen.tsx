import { useState, useEffect } from 'react';
import { EmberFirefly } from '../ember/EmberFirefly';
import { APP_NAME } from '../../utils/constants';

const loadingMessages = [
  'Warming up Ember...',
  'Analyzing your profile...',
  'Finding your matches...',
  'Almost there...',
];

export function SplashScreen({ message }: { message?: string }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Firefly with glow effect */}
        <div className="relative">
          <EmberFirefly size="xl" mood="thinking" animated />
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full blur-lg animate-pulse"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.3)' }}
          />
        </div>

        {/* App name */}
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          {APP_NAME}
        </h2>

        {/* Loading message */}
        <div className="h-5 flex items-center">
          <p
            className="text-sm transition-opacity duration-300"
            style={{ color: 'var(--color-textMuted)' }}
          >
            {message || loadingMessages[msgIndex]}
            {'.'.repeat(dotCount)}
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="w-48 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <div
            className="h-full rounded-full animate-splash-progress"
            style={{
              background: 'linear-gradient(90deg, var(--color-accent), var(--color-accentHover))',
            }}
          />
        </div>
      </div>
    </div>
  );
}
