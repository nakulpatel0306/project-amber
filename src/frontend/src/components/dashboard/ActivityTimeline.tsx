import { Coffee, Eye, Star, UserCheck, Sparkles, TrendingUp } from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  detail: string;
  time: string;
}

function generateActivities(
  matchCount: number,
  chatCount: number,
  connectionCount: number,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  if (connectionCount > 0) {
    items.push({
      id: 'conn',
      icon: UserCheck,
      iconColor: '#22C55E',
      title: 'New connection made',
      detail: `${connectionCount} confirmed chat${connectionCount > 1 ? 's' : ''} this period`,
      time: '2h ago',
    });
  }

  if (matchCount > 0) {
    items.push({
      id: 'match',
      icon: Sparkles,
      iconColor: 'var(--color-accent)',
      title: 'New matches available',
      detail: `${matchCount} role${matchCount > 1 ? 's' : ''} matching your profile`,
      time: '4h ago',
    });
  }

  items.push({
    id: 'profile',
    icon: Eye,
    iconColor: '#8B5CF6',
    title: 'Profile viewed',
    detail: 'Your profile was viewed by a recruiter',
    time: '1d ago',
  });

  if (chatCount > 0) {
    items.push({
      id: 'chat',
      icon: Coffee,
      iconColor: '#F59E0B',
      title: 'Coffee chat pending',
      detail: `${chatCount} chat request${chatCount > 1 ? 's' : ''} awaiting response`,
      time: '1d ago',
    });
  }

  items.push({
    id: 'score',
    icon: TrendingUp,
    iconColor: '#10B981',
    title: 'Match score updated',
    detail: 'Your compatibility scores were recalculated',
    time: '2d ago',
  });

  items.push({
    id: 'review',
    icon: Star,
    iconColor: '#EC4899',
    title: 'Weekly digest ready',
    detail: 'Review your weekly match insights',
    time: '3d ago',
  });

  return items.slice(0, 5);
}

interface ActivityTimelineProps {
  matchCount: number;
  chatCount: number;
  connectionCount: number;
}

export function ActivityTimeline({ matchCount, chatCount, connectionCount }: ActivityTimelineProps) {
  const activities = generateActivities(matchCount, chatCount, connectionCount);

  return (
    <div className="bento-card">
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--color-text)' }}
      >
        Recent Activity
      </h3>

      <div className="space-y-0">
        {activities.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-2.5"
            style={{
              borderBottom: i < activities.length - 1 ? '1px solid var(--color-border)' : undefined,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${item.iconColor}15` }}
            >
              <item.icon className="w-3.5 h-3.5" style={{ color: item.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                {item.title}
              </p>
              <p
                className="text-[11px]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {item.detail}
              </p>
            </div>
            <span
              className="text-[10px] font-medium flex-shrink-0"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
