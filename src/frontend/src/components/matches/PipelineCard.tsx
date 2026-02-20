import { Eye, X, Coffee } from 'lucide-react';
import { Button } from '../ui/Button';
import { ScoreRing } from '../ui/ScoreRing';
import type { SavedMatch } from '../../types/matching.types';
import { formatDistanceToNow } from 'date-fns';

interface PipelineCardProps {
  match: SavedMatch;
  mode: 'candidate' | 'employer';
  onViewInEmber: () => void;
  onRemove: () => void;
  onCoffeeChat: () => void;
}

const statusColors: Record<string, string> = {
  saved: '#3b82f6',
  pending: '#f59e0b',
  connected: '#10b981',
};

const statusLabels: Record<string, string> = {
  saved: 'Saved',
  pending: 'Pending',
  connected: 'Connected',
};

export function PipelineCard({
  match,
  mode: _mode,
  onViewInEmber,
  onRemove,
  onCoffeeChat,
}: PipelineCardProps) {
  const statusColor = statusColors[match.status] || '#6b7280';
  const timeAgo = formatDistanceToNow(new Date(match.created_at), { addSuffix: true });

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-sm"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Status dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: statusColor }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
            {match.target_type === 'role' ? 'Role Match' : 'Candidate Match'}
          </span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
          >
            {statusLabels[match.status]}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
          {statusLabels[match.status]} {timeAgo}
        </p>
        {match.notes && (
          <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--color-textSecondary)' }}>
            {match.notes}
          </p>
        )}
      </div>

      {/* Score */}
      {match.match_score && (
        <ScoreRing score={match.match_score} size={44} />
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button size="xs" variant="ghost" onClick={onViewInEmber} title="View in Ember">
          <Eye className="w-3.5 h-3.5" />
        </Button>
        {match.status === 'saved' && (
          <Button size="xs" variant="ghost" onClick={onCoffeeChat} title="Coffee Chat">
            <Coffee className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button size="xs" variant="ghost" onClick={onRemove} title="Remove">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
