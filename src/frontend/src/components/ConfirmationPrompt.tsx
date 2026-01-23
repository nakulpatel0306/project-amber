import { Loader2, Play, X } from 'lucide-react';

interface ConfirmationPromptProps {
  onConfirm: () => void;
  onDecline: () => void;
  isExecuting: boolean;
}

export function ConfirmationPrompt({
  onConfirm,
  onDecline,
  isExecuting,
}: ConfirmationPromptProps) {
  return (
    <div className="flex items-center gap-2 slide-in-up">
      <button
        onClick={onConfirm}
        disabled={isExecuting}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-smooth disabled:opacity-70"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accentText)',
        }}
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-4 h-4 spinner" />
            <span>running...</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" />
            <span>run</span>
          </>
        )}
      </button>

      <button
        onClick={onDecline}
        disabled={isExecuting}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border btn-smooth disabled:opacity-50"
        style={{
          backgroundColor: 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-textSecondary)',
        }}
        onMouseEnter={e => {
          if (!isExecuting) {
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            e.currentTarget.style.borderColor = 'var(--color-borderHover)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        <X className="w-3.5 h-3.5" />
        <span>cancel</span>
      </button>

      <span
        className="text-xs ml-2"
        style={{ color: 'var(--color-textMuted)' }}
      >
        review the steps above before running
      </span>
    </div>
  );
}
