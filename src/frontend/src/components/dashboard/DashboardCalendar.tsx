import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Coffee,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  isToday,
  isTomorrow,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { Badge } from '../ui/Badge';
import { DayDetailPopup } from './DayDetailPopup';

export interface UpcomingChat {
  id?: string;
  company: string;
  person: string;
  role: string;
  time: string;
  scheduledAt: string | null;
  meetingLink?: string | null;
  status: string;
  type?: 'coffee_chat' | 'connection_meet';
}

interface DashboardCalendarProps {
  upcomingChats: UpcomingChat[];
  pendingChats: number;
  showViewAll?: boolean;
  viewAllPath?: string;
  allAcceptedChats?: UpcomingChat[];
  mode?: 'schedule' | 'navigate';
  onScheduleChat?: (chatId: string, prefilledDate: string) => void;
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
    case 'scheduled':
      return 'success';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DashboardCalendar({
  upcomingChats,
  pendingChats,
  showViewAll = true,
  viewAllPath = '/app/chats',
  allAcceptedChats,
  mode = 'navigate',
  onScheduleChat,
}: DashboardCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);

  // Dates that have scheduled chats, with status info for dot color
  const chatDateInfo = useMemo(() => {
    const info: Record<string, { hasPending: boolean; hasConfirmed: boolean }> = {};
    for (const chat of upcomingChats) {
      if (chat.scheduledAt) {
        const key = format(parseISO(chat.scheduledAt), 'yyyy-MM-dd');
        if (!info[key]) info[key] = { hasPending: false, hasConfirmed: false };
        if (chat.status === 'pending') info[key].hasPending = true;
        else info[key].hasConfirmed = true;
      }
    }
    return info;
  }, [upcomingChats]);

  const chatDates = useMemo(() => new Set(Object.keys(chatDateInfo)), [chatDateInfo]);

  // Build calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Filter chats based on selected day or show all
  const displayChats = useMemo(() => {
    if (!selectedDay) return upcomingChats;
    const dayKey = format(selectedDay, 'yyyy-MM-dd');
    return upcomingChats.filter(chat => {
      if (!chat.scheduledAt) return false;
      return format(parseISO(chat.scheduledAt), 'yyyy-MM-dd') === dayKey;
    });
  }, [upcomingChats, selectedDay]);

  // Group displayed chats by date
  const grouped: Record<string, UpcomingChat[]> = {};
  for (const chat of displayChats) {
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
        {showViewAll && (
          <Link to={viewAllPath}>
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        )}
      </div>

      {/* Mini Month Grid */}
      <div className="mb-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="p-1 rounded hover:bg-[var(--color-surfaceHover)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="p-1 rounded hover:bg-[var(--color-surfaceHover)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-center text-[10px] font-medium py-1"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px">
          {calendarDays.map((day, idx) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const hasChats = chatDates.has(dayKey);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const today = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => {
                  if (isCurrentMonth) {
                    setDayPopupDate(day);
                  }
                  if (hasChats) {
                    setSelectedDay(prev => (prev && isSameDay(prev, day)) ? null : day);
                  } else {
                    setSelectedDay(null);
                  }
                }}
                className="relative flex flex-col items-center justify-center py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                style={{
                  color: isSelected
                    ? 'var(--color-accentText)'
                    : !isCurrentMonth
                    ? 'var(--color-textMuted)'
                    : 'var(--color-text)',
                  backgroundColor: isSelected
                    ? 'var(--color-accent)'
                    : today
                    ? 'var(--color-surfaceHover)'
                    : 'transparent',
                  fontWeight: today || isSelected ? 600 : 400,
                  opacity: isCurrentMonth ? 1 : 0.4,
                }}
              >
                {format(day, 'd')}
                {hasChats && !isSelected && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {chatDateInfo[dayKey]?.hasConfirmed && (
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                    )}
                    {chatDateInfo[dayKey]?.hasPending && (
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Clear filter hint */}
        {selectedDay && (
          <button
            onClick={() => setSelectedDay(null)}
            className="text-[10px] mt-1.5 font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            Show all dates
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t mb-4" style={{ borderColor: 'var(--color-border)' }} />

      {/* Chat List */}
      {displayChats.length > 0 ? (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
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
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {chat.person.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                        {chat.person}
                        <span style={{ color: 'var(--color-textMuted)' }}> at {chat.company}</span>
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        {chat.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {chat.scheduledAt && (
                        <span className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                          {getTimeLabel(chat.scheduledAt)}
                        </span>
                      )}
                      {chat.meetingLink && (
                        <a
                          href={chat.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          Join <ExternalLink className="w-3 h-3" />
                        </a>
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

          {pendingChats > 0 && (
            <div className="pt-2">
              <Link to={viewAllPath} className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                You have {pendingChats} pending invite{pendingChats !== 1 ? 's' : ''}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Coffee className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-textMuted)' }} />
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            {selectedDay ? 'No chats on this day' : 'No upcoming chats yet'}
          </p>
          {pendingChats > 0 && !selectedDay && (
            <Link to={viewAllPath} className="text-xs font-medium mt-2 inline-block" style={{ color: 'var(--color-accent)' }}>
              You have {pendingChats} pending invite{pendingChats !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      )}

      {/* Day Detail Popup */}
      {dayPopupDate && (
        <DayDetailPopup
          isOpen={!!dayPopupDate}
          onClose={() => setDayPopupDate(null)}
          selectedDate={dayPopupDate}
          scheduledChats={upcomingChats.filter(c =>
            c.scheduledAt && format(parseISO(c.scheduledAt), 'yyyy-MM-dd') === format(dayPopupDate, 'yyyy-MM-dd')
          )}
          unscheduledChats={(allAcceptedChats || []).filter(c => !c.scheduledAt)}
          mode={mode}
          chatsPath={viewAllPath}
          onScheduleChat={onScheduleChat}
        />
      )}
    </div>
  );
}
