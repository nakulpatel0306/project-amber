import { ArrowRight, Terminal, Package, Settings, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    text: 'install figma',
    description: 'download and install figma',
    icon: Package,
  },
  {
    text: 'install vscode',
    description: 'setup visual studio code',
    icon: Terminal,
  },
  {
    text: 'setup python environment',
    description: 'create a virtual environment',
    icon: Settings,
  },
  {
    text: 'check docker status',
    description: 'verify docker is running',
    icon: Zap,
  },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      {/* hero section */}
      <div className="text-center mb-12">
        {/* logo and brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)',
            }}
          >
            <span className="text-2xl">🌙</span>
          </div>
        </div>

        <h1
          className="text-2xl font-semibold mb-2 tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          hello, i'm luna
        </h1>

        <p
          className="text-base"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          your local development agent
        </p>
      </div>

      {/* quick actions */}
      <div className="w-full max-w-lg">
        <p
          className="text-xs uppercase tracking-wider mb-3 text-center"
          style={{ color: 'var(--color-textMuted)' }}
        >
          quick actions
        </p>

        <div className="grid grid-cols-2 gap-3">
          {suggestions.map(({ text, description, icon: Icon }, index) => (
            <button
              key={text}
              onClick={() => onSuggestionClick(text)}
              className="group flex flex-col items-start p-4 rounded-xl border btn-smooth"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                animationDelay: `${index * 50}ms`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)';
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Icon
                  className="w-4 h-4 transition-colors"
                  style={{ color: 'var(--color-textMuted)' }}
                />
                <ArrowRight
                  className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0.5"
                  style={{ color: 'var(--color-accent)' }}
                />
              </div>
              <p
                className="font-medium text-sm text-left"
                style={{ color: 'var(--color-text)' }}
              >
                {text}
              </p>
              <p
                className="text-xs mt-0.5 text-left"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* keyboard hint */}
      <div className="mt-10">
        <p
          className="text-xs text-center flex items-center gap-2"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <span>type a command below to get started</span>
          <span className="opacity-50">·</span>
          <span className="flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              ⌘
            </kbd>
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              K
            </kbd>
            <span className="ml-1">for commands</span>
          </span>
        </p>
      </div>
    </div>
  );
}
