import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const taglines = [
  'Local development agent',
  'Manage environments',
  'Automate workflows',
  'Install and configure apps',
  'Setup dev tools instantly',
];

const suggestions = [
  { text: 'Install Figma', description: 'Download and install Figma' },
  { text: 'Install VS Code', description: 'Setup Visual Studio Code' },
  { text: 'Install Slack', description: 'Get Slack for team communication' },
  { text: 'Setup Python environment', description: 'Create a virtual environment' },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const tagline = taglines[currentTagline];

    if (isTyping) {
      if (displayText.length < tagline.length) {
        const timeout = setTimeout(() => {
          setDisplayText(tagline.slice(0, displayText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        setCurrentTagline((prev) => (prev + 1) % taglines.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, currentTagline]);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1
          className="text-4xl font-semibold mb-4 tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          Hello, I'm Luna
        </h1>

        <div className="h-8 flex items-center justify-center">
          <p
            className="text-lg"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {displayText}
            <span
              className="inline-block w-0.5 h-5 ml-0.5 animate-pulse"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-lg">
        <div className="space-y-2">
          {suggestions.map(({ text, description }) => (
            <button
              key={text}
              onClick={() => onSuggestionClick(text)}
              className="group w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)';
                e.currentTarget.style.borderColor = 'var(--color-borderHover)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div className="text-left">
                <p
                  className="font-medium text-sm"
                  style={{ color: 'var(--color-text)' }}
                >
                  {text}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {description}
                </p>
              </div>
              <ArrowRight
                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--color-textSecondary)' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16">
        <p
          className="text-xs text-center"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Type a command or select a suggestion to get started
        </p>
      </div>
    </div>
  );
}
