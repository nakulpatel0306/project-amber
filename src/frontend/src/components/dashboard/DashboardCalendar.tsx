import { Link } from 'react-router-dom';
import {
  Calendar,
  Coffee,
  ArrowRight,
} from 'lucide-react';
import { isToday, isTomorrow, format, parseISO } from 'date-fns';
import { Badge } from '../ui/Badge';

interface UpcomingChat {
  company: string;
  person: string;
  role: string;
  time: string;
  scheduledAt: string | null;
  status: string;
}

interface DashboardCalendarProps {
  upcomingChats: UpcomingChat[];
  pendingChats: number;
}

function getDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return `Today, ${format(date, 'MMM d')}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, 'MMM d')}`;
  return format(date, 'EEE, MMM d');
}

function getTimeLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'h:mm a');
}

function getStatusVariant(status: string): 'success' | 'warning' | 'default' {
  switch (status) {
    case 'accepted':
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
}

export function DashboardCalendar({ upcomingChats, pendingChats }: DashboardCalendarProps) {
  // Group chats by date
  const grouped: Record<string, UpcomingChat[]> = {};
  for (const chat of upcomingChats) {
    const key = chat.scheduledAt ? format(parseISO(chat.scheduledAt), 'yyyy-MM-dd') : 'tbd';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(chat);
  }
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Calendar className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Upcoming Chats
        </h2>
        <Link to="/app/chats">
          <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
            View All <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Content */}
      {upcomingChats.length > 0 ? (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              {/* Date header */}
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>
                {dateKey === 'tbd' ? 'To Be Scheduled' : getDateLabel(grouped[dateKey][0].scheduledAt!)}
              </p>
              <div className="space-y-2">
                {grouped[dateKey].map((chat, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg flex items-center gap-3"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    {/* Avatar initials */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {chat.person.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                        {chat.person}
                        <span style={{ color: 'var(--color-textMuted)' }}> at {chat.company}</span>
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        {chat.role}
                      </p>
                    </div>

                    {/* Time + Status */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {chat.scheduledAt && (
                        <span className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                          {getTimeLabel(chat.scheduledAt)}
                        </span>
                      )}
                      <Badge variant={getStatusVariant(chat.status)} size="sm">
                        {chat.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pending invites note */}
          {pendingChats > 0 && (
            <div className="pt-2">
              <Link to="/app/chats" className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                You have {pendingChats} pending invite{pendingChats !== 1 ? 's' : ''}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Coffee className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-textMuted)' }} />
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            No upcoming chats yet
          </p>
          {pendingChats > 0 && (
            <Link to="/app/chats" className="text-xs font-medium mt-2 inline-block" style={{ color: 'var(--color-accent)' }}>
              You have {pendingChats} pending invite{pendingChats !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
