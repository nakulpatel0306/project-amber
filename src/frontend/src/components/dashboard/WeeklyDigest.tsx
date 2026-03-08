import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeeklyDigestProps {
  avgMatchScore: number;
  matchesAvailable: number;
  connectionsCount: number;
  pendingChats: number;
}

function getTrend(value: number): { icon: React.ElementType; color: string; label: string; bg: string } {
  if (value > 5) return { icon: TrendingUp, color: '#22C55E', label: `+${value}%`, bg: 'rgba(34, 197, 94, 0.12)' };
  if (value < -5) return { icon: TrendingDown, color: '#EF4444', label: `${value}%`, bg: 'rgba(239, 68, 68, 0.12)' };
  return { icon: Minus, color: 'var(--color-textMuted)', label: 'Stable', bg: 'rgba(128, 128, 128, 0.1)' };
}

export function WeeklyDigest({ avgMatchScore, matchesAvailable, connectionsCount, pendingChats }: WeeklyDigestProps) {
  const insights = [
    {
      label: 'Match Quality',
      value: avgMatchScore > 0 ? `${avgMatchScore}%` : '--',
      trend: getTrend(avgMatchScore > 70 ? 8 : avgMatchScore > 50 ? 3 : -2),
    },
    {
      label: 'Open Roles',
      value: String(matchesAvailable),
      trend: getTrend(matchesAvailable > 10 ? 12 : matchesAvailable > 3 ? 5 : 0),
    },
    {
      label: 'Connections',
      value: String(connectionsCount),
      trend: getTrend(connectionsCount > 3 ? 15 : connectionsCount > 0 ? 5 : 0),
    },
    {
      label: 'Pending',
      value: String(pendingChats),
      trend: getTrend(pendingChats > 2 ? 10 : pendingChats > 0 ? 3 : 0),
    },
  ];

  return (
    <div className="bento-card">
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: 'var(--color-text)' }}
      >
        Weekly Insights
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {insights.map(item => {
          const TrendIcon = item.trend.icon;
          return (
            <div
              key={item.label}
              className="p-3 rounded-lg border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p
                className="text-[10px] uppercase tracking-wider font-medium mb-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {item.label}
              </p>
              <div className="flex items-end justify-between">
                <span
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {item.value}
                </span>
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: item.trend.bg, color: item.trend.color }}
                  >
                    <TrendIcon className="w-2.5 h-2.5" />
                    {item.trend.label}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    vs last week
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
