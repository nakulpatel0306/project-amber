import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, UserPlus, Zap, Bookmark, Coffee, ArrowUpRight, Star } from 'lucide-react';
import type { EmployerResult, CandidateResult } from '../../types/matching.types';
import type { SavedMatch } from '../../types/matching.types';
import type { Connection } from '../../types/connections.types';

interface MatchActivityFeedProps {
  mode?: 'candidate' | 'employer';
  matches?: EmployerResult[];
  candidateMatches?: CandidateResult[];
  savedMatches?: SavedMatch[];
  pendingSent?: Connection[];
  acceptedConnections?: Connection[];
}

interface ActivityItem {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  text: string;
  time: string;
  sortDate: number;
}

function titleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just Now';
  if (diffMin < 60) return `${diffMin}m Ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h Ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d Ago`;
  const diffWeek = Math.floor(diffDay / 7);
  return `${diffWeek}w Ago`;
}

function buildActivity(
  matches: EmployerResult[],
  savedMatches: SavedMatch[],
  pendingSent: Connection[],
  acceptedConnections: Connection[],
): ActivityItem[] {
  const items: ActivityItem[] = [];
  const sorted = [...matches].sort((a, b) => b.overallScore - a.overallScore);

  // Top match
  if (sorted[0]) {
    items.push({
      icon: TrendingUp,
      text: titleCase(`Top Match: ${sorted[0].companyName} At ${sorted[0].overallScore}%`),
      time: 'Live',
      sortDate: Date.now(),
    });
  }

  // Strong matches
  const strong = sorted.filter(m => m.overallScore >= 80).length;
  if (strong > 0) {
    items.push({
      icon: Zap,
      text: titleCase(`${strong} Strong Match${strong > 1 ? 'es' : ''} (80%+)`),
      time: 'Live',
      sortDate: Date.now() - 1000,
    });
  }

  // Real saved matches
  for (const sm of savedMatches.slice(0, 2)) {
    const employer = matches.find(e => e.employerId === sm.employer_id);
    const name = employer?.companyName || 'A Company';
    items.push({
      icon: Bookmark,
      text: titleCase(`Saved ${name} To Matches`),
      time: timeAgo(sm.created_at),
      sortDate: new Date(sm.created_at).getTime(),
    });
  }

  // Pending connection requests
  for (const conn of pendingSent.slice(0, 2)) {
    const name = conn.receiver_name || conn.receiver_company || 'A Company';
    items.push({
      icon: UserPlus,
      text: titleCase(`Requested ${name}`),
      time: timeAgo(conn.created_at),
      sortDate: new Date(conn.created_at).getTime(),
    });
  }

  // Accepted connections
  for (const conn of acceptedConnections.slice(0, 2)) {
    const name = conn.receiver_name || conn.receiver_company || conn.sender_name || 'A Company';
    items.push({
      icon: Coffee,
      text: titleCase(`Connected With ${name}`),
      time: timeAgo(conn.updated_at),
      sortDate: new Date(conn.updated_at).getTime(),
    });
  }

  // Engine status
  if (sorted.length > 0) {
    items.push({
      icon: ArrowUpRight,
      text: titleCase(`Scanning ${sorted.length} Companies`),
      time: 'Live',
      sortDate: 0,
    });
  }

  // Empty state
  if (items.length === 0) {
    items.push({
      icon: Star,
      text: 'Complete Your Assessment To See Matches',
      time: 'Now',
      sortDate: 0,
    });
  }

  return items.slice(0, 5);
}

function buildEmployerActivity(
  candidates: CandidateResult[],
  savedMatches: SavedMatch[],
  pendingSent: Connection[],
  acceptedConnections: Connection[],
): ActivityItem[] {
  const items: ActivityItem[] = [];
  const sorted = [...candidates].sort((a, b) => b.overallScore - a.overallScore);

  // Top match
  if (sorted[0]) {
    items.push({
      icon: TrendingUp,
      text: titleCase(`Top Candidate: ${sorted[0].name} At ${sorted[0].overallScore}%`),
      time: 'Live',
      sortDate: Date.now(),
    });
  }

  // Strong matches
  const strong = sorted.filter(c => c.overallScore >= 80).length;
  if (strong > 0) {
    items.push({
      icon: Zap,
      text: titleCase(`${strong} Strong Candidate${strong > 1 ? 's' : ''} (80%+)`),
      time: 'Live',
      sortDate: Date.now() - 1000,
    });
  }

  // Saved candidates
  for (const sm of savedMatches.slice(0, 2)) {
    const candidate = candidates.find(c => c.candidateId === sm.candidate_id);
    const name = candidate?.name || 'A Candidate';
    items.push({
      icon: Bookmark,
      text: titleCase(`Shortlisted ${name}`),
      time: timeAgo(sm.created_at),
      sortDate: new Date(sm.created_at).getTime(),
    });
  }

  // Pending connection requests
  for (const conn of pendingSent.slice(0, 2)) {
    const name = conn.receiver_name || 'A Candidate';
    items.push({
      icon: UserPlus,
      text: titleCase(`Requested ${name}`),
      time: timeAgo(conn.created_at),
      sortDate: new Date(conn.created_at).getTime(),
    });
  }

  // Accepted connections
  for (const conn of acceptedConnections.slice(0, 2)) {
    const name = conn.receiver_name || conn.sender_name || 'A Candidate';
    items.push({
      icon: Coffee,
      text: titleCase(`Connected With ${name}`),
      time: timeAgo(conn.updated_at),
      sortDate: new Date(conn.updated_at).getTime(),
    });
  }

  // Engine status
  if (sorted.length > 0) {
    items.push({
      icon: ArrowUpRight,
      text: titleCase(`Scanning ${sorted.length} Candidates`),
      time: 'Live',
      sortDate: 0,
    });
  }

  if (items.length === 0) {
    items.push({
      icon: Star,
      text: 'Complete Your Culture Quiz To See Candidates',
      time: 'Now',
      sortDate: 0,
    });
  }

  return items.slice(0, 5);
}

export function MatchActivityFeed({ mode = 'candidate', matches = [], candidateMatches = [], savedMatches = [], pendingSent = [], acceptedConnections = [] }: MatchActivityFeedProps) {
  // Tick every 30s so relative timestamps stay fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const activity = useMemo(
    () => mode === 'employer'
      ? buildEmployerActivity(candidateMatches, savedMatches, pendingSent, acceptedConnections)
      : buildActivity(matches, savedMatches, pendingSent, acceptedConnections),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, matches, candidateMatches, savedMatches, pendingSent, acceptedConnections],
  );

  return (
    <div className="bento-card">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3"
        style={{ color: 'var(--color-textMuted)' }}
      >
        Recent Activity
      </p>

      <div className="space-y-0">
        {activity.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 py-2.5"
              style={{
                borderBottom: i < activity.length - 1 ? '1px solid var(--color-border)' : undefined,
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                  {item.text}
                </p>
              </div>
              <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-textMuted)' }}>
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
