import { Loader2 } from 'lucide-react';

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
    <div className="flex items-center gap-2">
      <button
        onClick={onConfirm}
        disabled={isExecuting}
        className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-70"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accentText)',
        }}
        onMouseEnter={e => {
          if (!isExecuting) {
            e.currentTarget.style.opacity = '0.9';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Running...</span>
          </>
        ) : (
          <span>Yes</span>
        )}
      </button>

      <button
        onClick={onDecline}
        disabled={isExecuting}
        className="px-5 py-2 rounded-lg font-medium text-sm border transition-all duration-150 disabled:opacity-50"
        style={{
          backgroundColor: 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-textSecondary)',
        }}
        onMouseEnter={e => {
          if (!isExecuting) {
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        No
      </button>
    </div>
  );
}
