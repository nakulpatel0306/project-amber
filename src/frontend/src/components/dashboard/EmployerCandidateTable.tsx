import { useMemo } from 'react';
import {
  MapPin,
  RefreshCw,
  Send,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CandidateRow {
  candidateId: string;
  name: string;
  headline: string;
  location: string;
  matchScore: number;
  topTrait: string;
  chatStatus: 'none' | 'pending' | 'accepted' | 'completed';
}

interface EmployerCandidateTableProps {
  candidates: CandidateRow[];
  hasCompletedCultureQuiz: boolean;
  onRowClick?: (candidate: CandidateRow) => void;
  onRefresh?: () => void;
}

function formatLocation(loc: string): string {
  if (!loc || loc.toLowerCase() === 'unknown') return 'Remote';
  return loc;
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 55) return '#3B82F6';
  return 'var(--color-textMuted)';
}

interface StatusConfig {
  label: string;
  icon: typeof CheckCircle2;
  color: string;
  bg: string;
}

function getStatusConfig(status: CandidateRow['chatStatus']): StatusConfig {
  switch (status) {
    case 'completed':
      return { label: 'Chat Done', icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)' };
    case 'accepted':
      return { label: 'Scheduled', icon: CalendarCheck, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
    case 'pending':
      return { label: 'Invite Sent', icon: Send, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)' };
    default:
      return { label: 'New Match', icon: Sparkles, color: 'var(--color-textMuted)', bg: 'rgba(120, 113, 108, 0.1)' };
  }
}

export function EmployerCandidateTable({ candidates, hasCompletedCultureQuiz, onRowClick, onRefresh }: EmployerCandidateTableProps) {
  const filtered = useMemo(() => {
    const rows = [...candidates];
    rows.sort((a, b) => b.matchScore - a.matchScore);
    return rows;
  }, [candidates]);

  if (!hasCompletedCultureQuiz) {
    return (
      <div className="py-6">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Top Culture Matches
        </h3>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.25em] mb-1"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Browse & Connect With Best-Fit Candidates
        </p>
        <p className="text-sm py-8 text-center" style={{ color: 'var(--color-textMuted)' }}>
          Complete your culture assessment to see matched candidates
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header: title + refresh */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Top Culture Matches
          </h3>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Browse & Connect With Best-Fit Candidates
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--color-surfaceHover)]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th
                className="pb-2.5 pl-1 text-left text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Candidate
              </th>
              <th
                className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Location
              </th>
              <th
                className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Match
              </th>
              <th
                className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Top Trait
              </th>
              <th
                className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  No matches found yet
                </td>
              </tr>
            ) : (
              filtered.map((candidate, i) => {
                const location = formatLocation(candidate.location);
                const statusCfg = getStatusConfig(candidate.chatStatus);
                const StatusIcon = statusCfg.icon;

                return (
                  <tr
                    key={`${candidate.candidateId}-${i}`}
                    className="group transition-colors hover:bg-[var(--color-surfaceHover)]"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : undefined,
                      cursor: onRowClick ? 'pointer' : undefined,
                    }}
                    onClick={() => onRowClick?.(candidate)}
                  >
                    {/* Candidate: avatar initial + name + headline */}
                    <td className="py-3.5 pr-5 pl-1">
                      <div className="flex items-center gap-3">
                        {/* Avatar initial */}
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{
                            backgroundColor: 'var(--color-accent)',
                            color: 'white',
                          }}
                        >
                          {candidate.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium truncate leading-tight"
                            style={{ color: 'var(--color-text)' }}
                          >
                            {candidate.name}
                          </p>
                          <p
                            className="text-[10px] truncate mt-0.5"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            {candidate.headline}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 pr-5">
                      <div className="flex items-center gap-1">
                        <MapPin
                          className="w-3 h-3 flex-shrink-0"
                          style={{ color: 'var(--color-textMuted)' }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {location}
                        </span>
                      </div>
                    </td>

                    {/* Match Score */}
                    <td className="py-3.5 pr-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: getScoreColor(candidate.matchScore) }}
                        >
                          {candidate.matchScore}%
                        </span>
                        <div
                          className="w-14 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--color-border)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${candidate.matchScore}%`,
                              backgroundColor: getScoreColor(candidate.matchScore),
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Top Trait */}
                    <td className="py-3.5 pr-5">
                      <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-textSecondary)' }}
                      >
                        {candidate.topTrait}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide"
                        style={{
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.color,
                        }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
