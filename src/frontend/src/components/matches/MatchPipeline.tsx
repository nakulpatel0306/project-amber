import { useMemo } from 'react';
import { PipelineCard } from './PipelineCard';
import { EmberFirefly } from '../ember/EmberFirefly';
import type { SavedMatch, PipelineTab } from '../../types/matching.types';

interface MatchPipelineProps {
  savedMatches: SavedMatch[];
  activeTab: PipelineTab;
  onTabChange: (tab: PipelineTab) => void;
  counts: Record<PipelineTab, number>;
  mode: 'candidate' | 'employer';
  onViewInEmber: (matchId: string) => void;
  onRemove: (id: string) => void;
  onCoffeeChat: (match: SavedMatch) => void;
}

const candidateTabs: { value: PipelineTab; label: string }[] = [
  { value: 'saved', label: 'Saved' },
  { value: 'pending', label: 'Pending' },
  { value: 'connected', label: 'Connected' },
];

const employerTabs: { value: PipelineTab; label: string }[] = [
  { value: 'saved', label: 'Shortlisted' },
  { value: 'pending', label: 'Pending' },
  { value: 'connected', label: 'Connected' },
];

const emptyMessages: Record<PipelineTab, { title: string; message: string }> = {
  saved: {
    title: 'No saved matches',
    message: 'Explore your Ember matches to start saving!',
  },
  pending: {
    title: 'No pending requests',
    message: 'Send a coffee chat to get started!',
  },
  connected: {
    title: 'No connections yet',
    message: 'Accept a pending request to connect!',
  },
};

export function MatchPipeline({
  savedMatches,
  activeTab,
  onTabChange,
  counts,
  mode,
  onViewInEmber,
  onRemove,
  onCoffeeChat,
}: MatchPipelineProps) {
  const tabs = mode === 'candidate' ? candidateTabs : employerTabs;

  const filteredMatches = useMemo(() => {
    return savedMatches.filter(m => m.status === activeTab);
  }, [savedMatches, activeTab]);

  const empty = emptyMessages[activeTab];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.value ? 'var(--color-accent)' : 'transparent',
              color: activeTab === tab.value ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
            }}
          >
            {tab.label}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]"
              style={{
                backgroundColor: activeTab === tab.value ? 'rgba(255,255,255,0.2)' : 'var(--color-background)',
                color: activeTab === tab.value ? 'white' : 'var(--color-textMuted)',
              }}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filteredMatches.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <EmberFirefly size="lg" mood="happy" animated />
          <h3 className="mt-6 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            {empty.title}
          </h3>
          <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: 'var(--color-textMuted)' }}>
            {empty.message}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map(match => (
            <PipelineCard
              key={match.id}
              match={match}
              mode={mode}
              onViewInEmber={() => onViewInEmber(match.role_id || match.candidate_id || '')}
              onRemove={() => onRemove(match.id)}
              onCoffeeChat={() => onCoffeeChat(match)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
