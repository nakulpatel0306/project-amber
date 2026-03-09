import { useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  RefreshCw,
  Coffee,
  Send,
  UserCheck,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface MatchRow {
  name: string;
  company: string;
  role: string;
  matchScore: number;
  location: string;
  workStyle: string | null;
  logoUrl: string | null;
  description: string | null;
  industry: string | null;
  employerId: string;
  chatStatus: 'none' | 'pending' | 'accepted' | 'scheduled' | 'completed' | 'connected';
}

interface MatchingTableProps {
  matches: MatchRow[];
  hasCompletedAssessment: boolean;
  onRowClick?: (match: MatchRow) => void;
  onRefresh?: () => void;
}


function formatWorkStyle(ws: string | null): string {
  if (!ws) return 'Flexible';
  const lower = ws.toLowerCase().trim();
  if (lower === 'remote') return 'Remote';
  if (lower === 'hybrid') return 'Hybrid';
  if (lower === 'on-site' || lower === 'onsite' || lower === 'on_site') return 'On-Site';
  if (lower === 'in-office' || lower === 'in_office') return 'In-Office';
  return ws.charAt(0).toUpperCase() + ws.slice(1);
}

function formatLocation(loc: string): string {
  if (!loc || loc.toLowerCase() === 'unknown') return 'Remote';
  return loc;
}

function formatCompany(name: string): string {
  if (!name || name.toLowerCase() === 'unknown') return 'Unlisted';
  return name;
}


function getScoreColor(score: number): string {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 55) return '#3B82F6';
  return 'var(--color-textMuted)';
}

interface StatusConfig {
  label: string;
  icon: typeof Coffee;
  color: string;
  bg: string;
}

function getStatusConfig(status: MatchRow['chatStatus']): StatusConfig {
  switch (status) {
    case 'connected':
      return { label: 'Connected', icon: UserCheck, color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)' };
    case 'completed':
      return { label: 'Chat Done', icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)' };
    case 'scheduled':
      return { label: 'Coffee Chat', icon: Coffee, color: 'var(--color-accent)', bg: 'rgba(240, 144, 48, 0.12)' };
    case 'accepted':
      return { label: 'Accepted', icon: CalendarCheck, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
    case 'pending':
      return { label: 'Invite Sent', icon: Send, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)' };
    default:
      return { label: 'New Match', icon: Sparkles, color: 'var(--color-textMuted)', bg: 'rgba(120, 113, 108, 0.1)' };
  }
}

export function MatchingTable({ matches, hasCompletedAssessment, onRowClick, onRefresh }: MatchingTableProps) {
  const filtered = useMemo(() => {
    const rows = [...matches];
    rows.sort((a, b) => b.matchScore - a.matchScore);
    return rows;
  }, [matches]);

  if (!hasCompletedAssessment) {
    return (
      <div className="py-6">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Top Personality Matches
        </h3>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.25em] mb-1"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Check & Maintain Your Match Status
        </p>
        <p className="text-sm py-8 text-center" style={{ color: 'var(--color-textMuted)' }}>
          Complete your personality assessment to see matched roles
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
            Top Personality Matches
          </h3>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Check & Maintain Your Match Status
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
                Company
              </th>
              <th
                className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Name
              </th>
              <th
                className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Role
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
                Work Style
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
                  colSpan={6}
                  className="py-8 text-center text-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  No matches found yet
                </td>
              </tr>
            ) : (
              filtered.map((match, i) => {
                const company = formatCompany(match.company);
                const location = formatLocation(match.location);
                const workStyle = formatWorkStyle(match.workStyle);
                const statusCfg = getStatusConfig(match.chatStatus);
                const StatusIcon = statusCfg.icon;

                return (
                  <tr
                    key={`${match.employerId}-${match.role}-${i}`}
                    className="group transition-colors hover:bg-[var(--color-surfaceHover)]"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : undefined,
                      cursor: onRowClick ? 'pointer' : undefined,
                    }}
                    onClick={() => onRowClick?.(match)}
                  >
                    {/* Company: logo + name + one-liner + location */}
                    <td className="py-3.5 pr-5 pl-1">
                      <div className="flex items-center gap-3">
                        {/* Logo or initial */}
                        {match.logoUrl ? (
                          <img
                            src={match.logoUrl}
                            alt={company}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                            style={{ border: '1px solid var(--color-border)' }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{
                              backgroundColor: 'var(--color-accent)',
                              color: 'white',
                            }}
                          >
                            {company.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium truncate leading-tight"
                            style={{ color: 'var(--color-text)' }}
                          >
                            {company}
                          </p>
                          <p
                            className="text-[10px] flex items-center gap-0.5 mt-0.5"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                            {location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 pr-5">
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        {match.name}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 pr-5">
                      <div className="flex items-center gap-2">
                        <Briefcase
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: 'var(--color-textMuted)' }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {match.role}
                        </span>
                      </div>
                    </td>

                    {/* Match Score */}
                    <td className="py-3.5 pr-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: getScoreColor(match.matchScore) }}
                        >
                          {match.matchScore}%
                        </span>
                        <div
                          className="w-14 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--color-border)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${match.matchScore}%`,
                              backgroundColor: getScoreColor(match.matchScore),
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Work Style */}
                    <td className="py-3.5 pr-5">
                      <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-textSecondary)' }}
                      >
                        {workStyle}
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
