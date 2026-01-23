import { useState } from 'react';
import { Check, X, Loader2, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
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
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 scale-fade-in"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        );
      case 'failed':
        return (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 scale-fade-in"
            style={{ backgroundColor: 'var(--color-error)' }}
          >
            <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        );
      case 'running':
        return (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '2px solid var(--color-accent)',
            }}
          >
            <Loader2
              className="w-3.5 h-3.5 spinner"
              style={{ color: 'var(--color-accent)' }}
            />
          </div>
        );
      default:
        return (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: 'var(--color-backgroundSecondary)',
              border: '2px solid var(--color-border)',
            }}
          >
            <span
              className="text-[10px] font-medium"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {steps.findIndex(s => s.status === undefined || s.status === 'pending') + 1 || ''}
            </span>
          </div>
        );
    }
  };

  const getRiskBadge = (risk: Step['risk']) => {
    const colors = {
      safe: 'var(--color-success)',
      moderate: 'var(--color-warning)',
      dangerous: 'var(--color-error)',
    };

    return (
      <span
        className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium"
        style={{
          backgroundColor: `${colors[risk]}15`,
          color: colors[risk],
        }}
      >
        {risk}
      </span>
    );
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
            className={`transition-all duration-200 ${!isLast ? 'border-b' : ''}`}
            style={{
              borderColor: 'var(--color-border)',
              animationDelay: `${index * 50}ms`,
            }}
          >
            <button
              onClick={() => hasOutput && toggleStep(step.id)}
              className="w-full px-4 py-3 flex items-start gap-3 text-left transition-all duration-150"
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
              {/* status icon */}
              <div className="pt-0.5">{getStatusIcon(step.status)}</div>

              {/* content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {step.description.toLowerCase()}
                    </p>
                    {getRiskBadge(step.risk)}
                  </div>
                  {hasOutput && (
                    <span
                      className="transition-transform duration-200"
                      style={{
                        color: 'var(--color-textMuted)',
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(0deg)',
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <Terminal className="w-3 h-3" style={{ color: 'var(--color-textMuted)' }} />
                  <code
                    className="text-xs font-mono truncate"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {step.command}
                  </code>
                </div>
              </div>
            </button>

            {/* expanded output */}
            {isExpanded && hasOutput && (
              <div
                className="px-4 pb-3 slide-in-up"
                style={{ marginLeft: '36px' }}
              >
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
