import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Lightbulb } from 'lucide-react';
import { EmberFirefly } from '../ember/EmberFirefly';

interface PrepData {
  personality_summary: string;
  conversation_starters: string[];
  topics_to_explore: string[];
  things_to_be_mindful_of: string[];
  archetype_tips: string;
}

interface PrepResponse {
  chat_id: string;
  prep: PrepData;
  match_score: number;
  archetype: string;
}

interface CoffeeChatPrepProps {
  chatId: string;
}

export function CoffeeChatPrep({ chatId }: CoffeeChatPrepProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<PrepResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrep = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/coffee-chats/${chatId}/prep`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch prep');
        const json: PrepResponse = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrep();
  }, [chatId]);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Clipboard not available
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="mt-2 p-4 rounded-xl border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-4 w-24 rounded"
            style={{ backgroundColor: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }}
          />
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }}
          />
        </div>
        <div className="space-y-2">
          <div
            className="h-3 w-full rounded"
            style={{ backgroundColor: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }}
          />
          <div
            className="h-3 w-4/5 rounded"
            style={{ backgroundColor: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }}
          />
          <div
            className="h-3 w-3/5 rounded"
            style={{ backgroundColor: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div
        className="mt-2 p-4 rounded-xl border text-sm"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-textMuted)',
        }}
      >
        Prep brief unavailable
      </div>
    );
  }

  const { prep, match_score } = data;

  return (
    <div
      className="mt-2 rounded-xl border overflow-hidden transition-all"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ backgroundColor: isExpanded ? 'rgba(217, 119, 6, 0.04)' : 'transparent' }}
      >
        <div className="flex items-center gap-2">
          <EmberFirefly size="sm" mood="thinking" />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            AI Prep Brief
          </span>
          {match_score > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                color: 'var(--color-accent)',
              }}
            >
              {match_score}% match
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-5">
          {/* Personality Summary */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-textMuted)' }}>
              Personality Summary
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
              {prep.personality_summary}
            </p>
          </div>

          {/* Conversation Starters */}
          {prep.conversation_starters.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-textMuted)' }}>
                Conversation Starters
              </h4>
              <ol className="space-y-2">
                {prep.conversation_starters.map((starter, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm p-2 rounded-lg group"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                      style={{
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1" style={{ color: 'var(--color-textSecondary)' }}>
                      {starter}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(starter, i);
                      }}
                      className="flex-shrink-0 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                      style={{ color: 'var(--color-textMuted)' }}
                      title="Copy to clipboard"
                    >
                      {copiedIndex === i ? (
                        <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Topics to Explore */}
          {prep.topics_to_explore.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-textMuted)' }}>
                Topics to Explore
              </h4>
              <ul className="space-y-1.5">
                {prep.topics_to_explore.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    />
                    <span style={{ color: 'var(--color-textSecondary)' }}>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Things to Be Mindful Of */}
          {prep.things_to_be_mindful_of.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-textMuted)' }}>
                Things to Be Mindful Of
              </h4>
              <ul className="space-y-1.5">
                {prep.things_to_be_mindful_of.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle
                      className="flex-shrink-0 w-3.5 h-3.5 mt-0.5"
                      style={{ color: 'var(--color-warning)' }}
                    />
                    <span style={{ color: 'var(--color-textSecondary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Archetype Tips */}
          {prep.archetype_tips && (
            <div
              className="p-3 rounded-xl border"
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.05)',
                borderColor: 'rgba(217, 119, 6, 0.2)',
              }}
            >
              <div className="flex items-start gap-2">
                <Lightbulb
                  className="flex-shrink-0 w-4 h-4 mt-0.5"
                  style={{ color: 'var(--color-accent)' }}
                />
                <div>
                  <h4 className="text-xs font-semibold mb-1" style={{ color: 'var(--color-accent)' }}>
                    Archetype Tips
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                    {prep.archetype_tips}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
