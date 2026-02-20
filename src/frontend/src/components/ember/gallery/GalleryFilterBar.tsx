import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { SortOption } from '../../../types/matching.types';

interface GalleryFilterBarProps {
  mode: 'candidate' | 'employer';
  matchCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  quickFilter: string;
  onQuickFilterChange: (filter: string) => void;
  activeFilterCount: number;
  onToggleFilters: () => void;
  showFilters: boolean;
  // Candidate filters
  industries?: string[];
  selectedIndustry?: string;
  onIndustryChange?: (industry: string) => void;
  workStyles?: string[];
  selectedWorkStyle?: string;
  onWorkStyleChange?: (ws: string) => void;
  locations?: string[];
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
  // Employer filters
  archetypes?: string[];
  selectedArchetypes?: Set<string>;
  onToggleArchetype?: (arch: string) => void;
  // Role dropdown (employer only)
  roles?: { id: string; title: string }[];
  selectedRoleId?: string | null;
  onRoleChange?: (roleId: string | null) => void;
  // Score range
  minScore: number;
  maxScore: number;
  onMinScoreChange: (score: number) => void;
  onMaxScoreChange: (score: number) => void;
  onClearFilters: () => void;
}

const quickFilters = [
  { value: 'all', label: 'All Matches' },
  { value: 'top5', label: 'Top 5' },
  { value: 'top10', label: 'Top 10' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'score', label: 'Best Match' },
  { value: 'culture', label: 'Culture Fit' },
  { value: 'workstyle', label: 'Work Style' },
  { value: 'recent', label: 'Recent' },
];

export function GalleryFilterBar({
  mode,
  matchCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  quickFilter,
  onQuickFilterChange,
  activeFilterCount,
  onToggleFilters,
  showFilters,
  industries,
  selectedIndustry,
  onIndustryChange,
  workStyles: _workStyles,
  selectedWorkStyle,
  onWorkStyleChange,
  locations,
  selectedLocation,
  onLocationChange,
  archetypes,
  selectedArchetypes,
  onToggleArchetype,
  roles,
  selectedRoleId,
  onRoleChange,
  minScore,
  maxScore,
  onMinScoreChange,
  onMaxScoreChange,
  onClearFilters,
}: GalleryFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Main bar */}
      <div
        className="sticky top-0 z-20 rounded-xl p-3 flex flex-wrap items-center gap-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Quick filters */}
        <div className="flex items-center gap-1">
          {quickFilters.map(f => (
            <button
              key={f.value}
              onClick={() => onQuickFilterChange(f.value)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: quickFilter === f.value ? 'var(--color-accent)' : 'transparent',
                color: quickFilter === f.value ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-5 w-px" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value as SortOption)}
          className="appearance-none px-2 py-1 rounded-lg text-xs font-medium cursor-pointer"
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-textSecondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Role dropdown (employer only) */}
        {mode === 'employer' && roles && roles.length > 0 && (
          <select
            value={selectedRoleId || ''}
            onChange={e => onRoleChange?.(e.target.value || null)}
            className="appearance-none px-2 py-1 rounded-lg text-xs font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-textSecondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="pl-7 pr-3 py-1.5 rounded-lg text-xs w-40"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        {/* Filter toggle */}
        <Button
          size="xs"
          variant={showFilters ? 'primary' : 'outline'}
          onClick={onToggleFilters}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {activeFilterCount > 0 && (
            <span className="ml-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center bg-white/20">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Match count */}
        <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="text-xs flex items-center gap-1"
                style={{ color: 'var(--color-accent)' }}
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Industry (candidate view) */}
            {mode === 'candidate' && industries && industries.length > 0 && (
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Industry</label>
                <select
                  value={selectedIndustry || ''}
                  onChange={e => onIndustryChange?.(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="">All Industries</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            )}

            {/* Work Style */}
            {mode === 'candidate' && (
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Work Style</label>
                <select
                  value={selectedWorkStyle || ''}
                  onChange={e => onWorkStyleChange?.(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="">All Styles</option>
                  {['remote', 'hybrid', 'onsite', 'flexible'].map(ws => (
                    <option key={ws} value={ws}>{ws.charAt(0).toUpperCase() + ws.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Location (candidate view) */}
            {mode === 'candidate' && locations && locations.length > 0 && (
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Location</label>
                <select
                  value={selectedLocation || ''}
                  onChange={e => onLocationChange?.(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="">All Locations</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}

            {/* Archetype filter (employer view) */}
            {mode === 'employer' && archetypes && archetypes.length > 0 && (
              <div className="col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Archetypes</label>
                <div className="flex flex-wrap gap-1">
                  {archetypes.map(arch => (
                    <button
                      key={arch}
                      onClick={() => onToggleArchetype?.(arch)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-all"
                      style={{
                        backgroundColor: selectedArchetypes?.has(arch) ? 'var(--color-accent)' : 'var(--color-background)',
                        color: selectedArchetypes?.has(arch) ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {arch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Score range */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Min Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={minScore}
                onChange={e => onMinScoreChange(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg text-xs"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Max Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={maxScore}
                onChange={e => onMaxScoreChange(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg text-xs"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
