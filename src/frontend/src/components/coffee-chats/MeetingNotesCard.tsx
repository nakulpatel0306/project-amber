import { useState, useEffect } from 'react';
import { FileText, Sparkles, Tag, CheckSquare, Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const API_BASE = 'http://127.0.0.1:8000';

interface MeetingNotesPreview {
  exists: boolean;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  summary_text?: string;
  key_topics?: string[];
  action_items?: string[];
}

interface MeetingNotesCardProps {
  coffeeChatId: string;
  onViewNotes: () => void;
}

export function MeetingNotesCard({ coffeeChatId, onViewNotes }: MeetingNotesCardProps) {
  const [preview, setPreview] = useState<MeetingNotesPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreview();
  }, [coffeeChatId]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(`${API_BASE}/api/coffee-chats/${coffeeChatId}/meeting-notes`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load notes');
      }

      const data = await response.json();
      setPreview(data);
    } catch (err) {
      console.error('Error loading meeting notes preview:', err);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="mt-3 p-3 rounded-xl flex items-center gap-3"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-textMuted)' }} />
        <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
          Loading notes...
        </span>
      </div>
    );
  }

  if (!preview?.exists || preview.status !== 'completed') {
    return null;
  }

  // Truncate summary to ~100 chars
  const truncatedSummary = preview.summary_text
    ? preview.summary_text.length > 100
      ? preview.summary_text.slice(0, 100) + '...'
      : preview.summary_text
    : '';

  const topicCount = preview.key_topics?.length || 0;
  const actionCount = preview.action_items?.length || 0;

  return (
    <button
      onClick={onViewNotes}
      className="mt-3 w-full text-left p-4 rounded-xl transition-all hover:shadow-md group"
      style={{
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Meeting Notes
            </h4>
            <ChevronRight
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            />
          </div>
          {truncatedSummary && (
            <p
              className="text-xs mb-2 line-clamp-2"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {truncatedSummary}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {topicCount > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {topicCount} topic{topicCount !== 1 ? 's' : ''}
              </span>
            )}
            {actionCount > 0 && (
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {actionCount} action{actionCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

interface MeetingNotesStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export function MeetingNotesStatusBadge({ status }: MeetingNotesStatusBadgeProps) {
  const config = {
    pending: { label: 'Recording Ready', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    processing: { label: 'Processing...', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
    completed: { label: 'Notes Ready', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
    failed: { label: 'Failed', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  };

  const { label, color, bg } = config[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {status === 'completed' && <FileText className="w-3 h-3" />}
      {status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
      {label}
    </span>
  );
}
