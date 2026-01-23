import { useState } from 'react';
import { Check, X, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Step } from './ChatInterface';

interface ExecutionTimelineProps {
  steps: Step[];
}

export function ExecutionTimeline({ steps }: ExecutionTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepId: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        );
      case 'failed':
        return (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-error)' }}
          >
            <X className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        );
      case 'running':
        return (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2"
            style={{ borderColor: 'var(--color-accent)' }}
          >
            <Loader2
              className="w-3 h-3 animate-spin"
              style={{ color: 'var(--color-accent)' }}
            />
          </div>
        );
      default:
        return (
          <div
            className="w-5 h-5 rounded-full flex-shrink-0 border-2"
            style={{ borderColor: 'var(--color-border)' }}
          />
        );
    }
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {steps.map((step, index) => {
        const isExpanded = expandedSteps.has(step.id);
        const hasOutput = step.output || step.error;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={!isLast ? 'border-b' : ''}
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => hasOutput && toggleStep(step.id)}
              className="w-full px-4 py-3 flex items-start gap-3 text-left transition-colors"
              style={{ cursor: hasOutput ? 'pointer' : 'default' }}
              onMouseEnter={e => {
                if (hasOutput) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Status Icon */}
              <div className="pt-0.5">{getStatusIcon(step.status)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {step.description}
                  </p>
                  {hasOutput && (
                    <span style={{ color: 'var(--color-textMuted)' }}>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>

                <code
                  className="text-xs font-mono mt-1 block truncate"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  $ {step.command}
                </code>
              </div>
            </button>

            {/* Expanded output */}
            {isExpanded && hasOutput && (
              <div className="px-4 pb-3" style={{ marginLeft: '32px' }}>
                <div
                  className="rounded-lg p-3 font-mono text-xs overflow-x-auto"
                  style={{
                    backgroundColor: 'var(--color-backgroundSecondary)',
                    border: `1px solid var(--color-border)`,
                  }}
                >
                  {step.output && (
                    <pre
                      className="whitespace-pre-wrap break-words"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {step.output}
                    </pre>
                  )}
                  {step.error && (
                    <pre
                      className={`whitespace-pre-wrap break-words ${step.output ? 'mt-2 pt-2 border-t' : ''}`}
                      style={{
                        color: 'var(--color-error)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {step.error}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
