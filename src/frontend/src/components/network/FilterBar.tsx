import { LayoutGrid, Columns2, AlignJustify, LayoutDashboard } from 'lucide-react';

export type FeedFilter = 'all' | 'job_seekers' | 'employers' | 'connections' | 'following';
export type LayoutMode = 'grid-3' | 'grid-2' | 'feed' | 'masonry';

interface FilterBarProps {
  filter: FeedFilter;
  layout: LayoutMode;
  onFilterChange: (f: FeedFilter) => void;
  onLayoutChange: (l: LayoutMode) => void;
}

const FILTER_TABS: { value: FeedFilter; label: string }[] = [
  { value: 'all', label: 'All Posts' },
  { value: 'job_seekers', label: 'Job Seekers' },
  { value: 'employers', label: 'Employers' },
  { value: 'connections', label: 'Connections' },
  { value: 'following', label: 'Following' },
];

const LAYOUT_OPTIONS: { value: LayoutMode; icon: typeof LayoutGrid; label: string }[] = [
  { value: 'grid-3', icon: LayoutGrid, label: '3 columns' },
  { value: 'grid-2', icon: Columns2, label: '2 columns' },
  { value: 'feed', icon: AlignJustify, label: 'Feed' },
  { value: 'masonry', icon: LayoutDashboard, label: 'Masonry' },
];

export function FilterBar({
  filter,
  layout,
  onFilterChange,
  onLayoutChange,
}: FilterBarProps) {
  return (
    <div
      className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-3 backdrop-blur-xl border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-background) 80%, transparent)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hidden">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {FILTER_TABS.map(tab => {
            const isActive = filter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onFilterChange(tab.value)}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-4" />

        {/* Layout Toggle */}
        <div
          className="flex items-center gap-0.5 p-1 rounded-lg flex-shrink-0"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {LAYOUT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isActive = layout === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onLayoutChange(opt.value)}
                className="p-1.5 rounded-md transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                }}
                title={opt.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
