import { Eye, Coffee, Bookmark, BookmarkCheck, Sparkles, UserPlus, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ScoreRing } from '../../ui/ScoreRing';
import { avatarGradient } from '../../../utils/matchHelpers';
import type { ConnectionStatus } from '../../../types/connections.types';

interface PlayerCardProps {
  id: string;
  name: string;
  subtitle: string;
  archetype: { name: string; key: string };
  overallScore: number;
  cultureScore: number;
  workStyleScore: number;
  traitScore: number;
  highlightPills: string[];
  avatarUrl?: string | null;
  index?: number;
  isSaved?: boolean;
  isSelected?: boolean;
  showSelect?: boolean;
  connectionStatus?: ConnectionStatus;
  onDeepDive: () => void;
  onBrew: () => void;
  onToggleSave: () => void;
  onToggleSelect?: () => void;
  onConnect?: () => void;
}

export function PlayerCard({
  name, subtitle, archetype, overallScore, cultureScore, workStyleScore,
  traitScore, avatarUrl, isSaved = false,
  isSelected = false, showSelect = false, connectionStatus = 'accepted',
  onDeepDive, onBrew, onToggleSave, onToggleSelect, onConnect,
}: PlayerCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="bento-card card-hover relative overflow-hidden p-0 cursor-pointer group"
      style={{ border: isSelected ? '2px solid var(--color-accent)' : undefined }}
    >
      {/* Select checkbox for compare */}
      {showSelect && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
          className="absolute top-4 left-4 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
            backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
          }}
        >
          {isSelected && <span className="text-white text-xs font-bold">&#10003;</span>}
        </button>
      )}

      {/* Card content */}
      <div className="p-6 flex flex-col gap-5" onClick={onDeepDive}>
        {/* Top row: Avatar + Info + Bookmark */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: avatarUrl ? undefined : avatarGradient(name) }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">{initial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
              {name}
            </h3>
            <p className="text-xs line-clamp-1" style={{ color: 'var(--color-textMuted)' }}>
              {subtitle}
            </p>
            <span
              className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--color-accent)' }}
            >
              <Sparkles className="w-2.5 h-2.5" />{archetype.name}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
            className="p-1.5 rounded-lg transition-all hover:bg-[var(--color-surfaceHover)] flex-shrink-0"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            ) : (
              <Bookmark className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            )}
          </button>
        </div>

        {/* Score Ring — centered hero */}
        <div className="flex justify-center">
          <ScoreRing score={overallScore} size={72} strokeWidth={4} fontSize="text-lg" />
        </div>

        {/* Compact metric row */}
        <div className="flex items-center justify-center gap-0 text-xs font-medium">
          <span style={{ color: 'var(--color-textSecondary)' }}>
            Culture <span className="font-bold" style={{ color: 'var(--color-text)' }}>{cultureScore}%</span>
          </span>
          <div className="w-px h-3 mx-3" style={{ backgroundColor: 'var(--color-border)' }} />
          <span style={{ color: 'var(--color-textSecondary)' }}>
            Style <span className="font-bold" style={{ color: 'var(--color-text)' }}>{workStyleScore}%</span>
          </span>
          <div className="w-px h-3 mx-3" style={{ backgroundColor: 'var(--color-border)' }} />
          <span style={{ color: 'var(--color-textSecondary)' }}>
            Traits <span className="font-bold" style={{ color: 'var(--color-text)' }}>{traitScore}%</span>
          </span>
        </div>
      </div>

      {/* Action row */}
      <div
        className="flex items-center gap-2 px-6 py-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <Button size="xs" variant="ghost" className="flex-1" onClick={onDeepDive}>
          <Eye className="w-3.5 h-3.5 mr-1" />Deep Dive
        </Button>
        {connectionStatus === 'accepted' ? (
          <Button size="xs" className="flex-1" onClick={(e) => { e.stopPropagation(); onBrew(); }}>
            <Coffee className="w-3.5 h-3.5 mr-1" />Let's Brew
          </Button>
        ) : connectionStatus === 'pending_sent' ? (
          <span
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}
          >
            <Clock className="w-3 h-3" />Pending
          </span>
        ) : (
          <Button size="xs" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); onConnect?.(); }}>
            <UserPlus className="w-3.5 h-3.5 mr-1" />Connect
          </Button>
        )}
      </div>
    </div>
  );
}
