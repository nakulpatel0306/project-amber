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
  isPast,
  startOfDay,
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
  setMonth,
  setYear,
  getMonth,
  getYear,
} from 'date-fns';
import { Badge } from '../ui/Badge';
import { DayDetailPopup } from './DayDetailPopup';
import { deriveDisplayStatus, sortChatsForDateView, type DisplayStatus } from '../../utils/coffeeChatStatus';
import type { ChatStatus } from '../coffee-chats/CoffeeChatCard';

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
  preferredDates?: string[] | null;
}

interface DashboardCalendarProps {
  upcomingChats: UpcomingChat[];
  pendingChats: number;
  showViewAll?: boolean;
  viewAllPath?: string;
  allAcceptedChats?: UpcomingChat[];
  mode?: 'schedule' | 'navigate';
  onScheduleChat?: (chatId: string, prefilledDate: string) => void;
  /** 'candidate' shows pending dots (grey), 'employer' hides them */
  viewerRole?: 'candidate' | 'employer';
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

function getDisplayStatusVariant(ds: DisplayStatus): 'success' | 'warning' | 'default' | 'info' {
  switch (ds) {
    case 'upcoming': return 'info';
    case 'pending': return 'warning';
    case 'completed': return 'success';
    default: return 'default';
  }
}

function getDisplayStatusLabel(ds: DisplayStatus): string {
  switch (ds) {
    case 'upcoming': return 'Upcoming';
    case 'pending': return 'Pending';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return ds;
  }
}

// Dot colors — unified with Coffee Chats calendar
const DOT_COLORS = {
  pending: '#9CA3AF',     // grey
  upcoming: '#3B82F6',    // blue
  completed: '#22C55E',   // green
  cancelled: '#EF4444',   // red
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DashboardCalendar({
  upcomingChats,
  pendingChats,
  showViewAll = true,
  viewAllPath = '/app/chats',
  allAcceptedChats,
  mode = 'navigate',
  onScheduleChat,
  viewerRole = 'candidate',
}: DashboardCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Compute display status for each chat and build date → dot info map
  const chatDateInfo = useMemo(() => {
    const info: Record<string, { hasPending: boolean; hasUpcoming: boolean; hasCompleted: boolean; hasCancelled: boolean }> = {};

    const addToDate = (dateKey: string, displayStatus: DisplayStatus) => {
      if (!info[dateKey]) info[dateKey] = { hasPending: false, hasUpcoming: false, hasCompleted: false, hasCancelled: false };
      if (displayStatus === 'pending') info[dateKey].hasPending = true;
      else if (displayStatus === 'upcoming') info[dateKey].hasUpcoming = true;
      else if (displayStatus === 'completed') info[dateKey].hasCompleted = true;
      else if (displayStatus === 'cancelled') info[dateKey].hasCancelled = true;
    };

    for (const chat of upcomingChats) {
      const ds = deriveDisplayStatus(chat.status as ChatStatus, chat.scheduledAt);

      // Use scheduledAt if available
      if (chat.scheduledAt) {
        const key = format(parseISO(chat.scheduledAt), 'yyyy-MM-dd');
        addToDate(key, ds);
      }
      // For pending chats, also mark their preferred dates
      if (ds === 'pending' && chat.preferredDates) {
        for (const pd of chat.preferredDates) {
          const key = format(parseISO(pd), 'yyyy-MM-dd');
          addToDate(key, 'pending');
        }
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

  // Filter chats based on selected day or show all, with proper sort order
  const displayChats = useMemo(() => {
    let chats = upcomingChats;
    if (selectedDay) {
      const dayKey = format(selectedDay, 'yyyy-MM-dd');
      chats = upcomingChats.filter(chat => {
        if (chat.scheduledAt && format(parseISO(chat.scheduledAt), 'yyyy-MM-dd') === dayKey) return true;
        // Also match on preferred dates for pending chats
        if (chat.preferredDates) {
          return chat.preferredDates.some(pd => format(parseISO(pd), 'yyyy-MM-dd') === dayKey);
        }
        return false;
      });
    }

    // Sort by display status: upcoming → pending → completed
    return sortChatsForDateView(
      chats.map(c => ({
        ...c,
        displayStatus: deriveDisplayStatus(c.status as ChatStatus, c.scheduledAt),
      }))
    );
  }, [upcomingChats, selectedDay]);

  // Group displayed chats by date
  const grouped: Record<string, (UpcomingChat & { displayStatus: DisplayStatus })[]> = {};
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
            onClick={() => {
              if (showMonthPicker) {
                setCurrentMonth(prev => setYear(prev, getYear(prev) - 1));
              } else {
                setCurrentMonth(prev => subMonths(prev, 1));
              }
            }}
            className="p-1 rounded hover:bg-[var(--color-surfaceHover)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
          <button
            onClick={() => setShowMonthPicker(prev => !prev)}
            className="text-xs font-semibold px-2 py-0.5 rounded hover:bg-[var(--color-surfaceHover)] transition-colors"
            style={{ color: 'var(--color-text)' }}
          >
            {showMonthPicker ? String(getYear(currentMonth)) : format(currentMonth, 'MMMM yyyy')}
          </button>
          <button
            onClick={() => {
              if (showMonthPicker) {
                setCurrentMonth(prev => setYear(prev, getYear(prev) + 1));
              } else {
                setCurrentMonth(prev => addMonths(prev, 1));
              }
            }}
            className="p-1 rounded hover:bg-[var(--color-surfaceHover)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
        </div>

        {showMonthPicker ? (
          /* Month picker grid — replaces calendar */
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentMonth(prev => setMonth(prev, i));
                  setShowMonthPicker(false);
                }}
                className="text-xs py-2.5 rounded-lg font-medium transition-colors hover:bg-[var(--color-surfaceHover)]"
                style={{
                  backgroundColor: getMonth(currentMonth) === i ? 'var(--color-accent)' : undefined,
                  color: getMonth(currentMonth) === i ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
                }}
              >
                {format(setMonth(new Date(), i), 'MMM')}
              </button>
            ))}
          </div>
        ) : (
          /* Calendar grid */
          <>
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
                const dateInfo = chatDateInfo[dayKey];
                const hasChats = chatDates.has(dayKey);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                const today = isToday(day);
                const isPastDate = isPast(startOfDay(day)) && !today;

                // Determine which dots to show - both candidates and employers see pending
                const showPendingDot = dateInfo?.hasPending;
                const showUpcomingDot = dateInfo?.hasUpcoming;
                const showCompletedDot = dateInfo?.hasCompleted;
                const showCancelledDot = dateInfo?.hasCancelled;
                const hasDots = showPendingDot || showUpcomingDot || showCompletedDot || showCancelledDot;

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
                        : isPastDate
                        ? 'var(--color-textMuted)'
                        : 'var(--color-text)',
                      backgroundColor: isSelected
                        ? 'var(--color-accent)'
                        : today
                        ? 'var(--color-surfaceHover)'
                        : 'transparent',
                      fontWeight: today || isSelected ? 600 : 400,
                      opacity: isCurrentMonth ? (isPastDate ? 0.5 : 1) : 0.4,
                    }}
                  >
                    {format(day, 'd')}
                    {hasDots && !isSelected && (
                      <div className="absolute bottom-0.5 flex gap-0.5">
                        {showUpcomingDot && (
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: DOT_COLORS.upcoming }} />
                        )}
                        {showPendingDot && (
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: DOT_COLORS.pending }} />
                        )}
                        {showCompletedDot && (
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: DOT_COLORS.completed }} />
                        )}
                        {showCancelledDot && (
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: DOT_COLORS.cancelled }} />
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
          </>
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
                      <Badge variant={getDisplayStatusVariant(chat.displayStatus)} size="sm">
                        {getDisplayStatusLabel(chat.displayStatus)}
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
          allChats={upcomingChats}
          scheduledChats={upcomingChats.filter(c =>
            c.scheduledAt && format(parseISO(c.scheduledAt), 'yyyy-MM-dd') === format(dayPopupDate, 'yyyy-MM-dd')
          )}
          unscheduledChats={(allAcceptedChats || []).filter(c => !c.scheduledAt)}
          mode={mode}
          chatsPath={viewAllPath}
          onScheduleChat={onScheduleChat}
          viewerRole={viewerRole}
        />
      )}
    </div>
  );
}
