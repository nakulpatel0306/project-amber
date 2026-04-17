import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
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
  isToday,
  isPast,
  startOfDay,
  setMonth,
  setYear,
  getMonth,
  getYear,
} from 'date-fns';
import { DayDetailPopup } from './DayDetailPopup';
import { deriveDisplayStatus, sortChatsForDateView, type DisplayStatus } from '../../utils/coffeeChatStatus';
import type { ChatStatus } from '../coffee-chats/CoffeeChatCard';
import type { UpcomingChat } from './DashboardCalendar';

// Unified dot colors — matching Coffee Chats calendar
const DOT_COLORS = {
  pending: 'var(--color-textMuted)',
  upcoming: 'var(--color-info)',
  completed: 'var(--color-success)',
  cancelled: 'var(--color-error)',
};

interface ScheduleWidgetProps {
  upcomingChats: UpcomingChat[];
  pendingChats: number;
  acceptedChats: number;
  allAcceptedChats?: UpcomingChat[];
  viewerRole?: 'candidate' | 'employer';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ScheduleWidget({ upcomingChats, pendingChats: _pendingChats, acceptedChats: _acceptedChats, allAcceptedChats, viewerRole = 'candidate' }: ScheduleWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Reuse same dot logic from DashboardCalendar
  const chatDateInfo = useMemo(() => {
    const info: Record<string, { hasPending: boolean; hasUpcoming: boolean; hasCompleted: boolean }> = {};

    const addToDate = (dateKey: string, displayStatus: DisplayStatus) => {
      if (!info[dateKey]) info[dateKey] = { hasPending: false, hasUpcoming: false, hasCompleted: false };
      if (displayStatus === 'pending') info[dateKey].hasPending = true;
      else if (displayStatus === 'upcoming') info[dateKey].hasUpcoming = true;
      else if (displayStatus === 'completed') info[dateKey].hasCompleted = true;
    };

    for (const chat of upcomingChats) {
      const ds = deriveDisplayStatus(chat.status as ChatStatus, chat.scheduledAt);
      if (chat.scheduledAt) {
        const key = format(parseISO(chat.scheduledAt), 'yyyy-MM-dd');
        addToDate(key, ds);
      }
      if (ds === 'pending' && chat.preferredDates) {
        for (const pd of chat.preferredDates) {
          try {
            const key = format(parseISO(pd), 'yyyy-MM-dd');
            addToDate(key, 'pending');
          } catch { /* skip bad dates */ }
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

  // Compact upcoming list: next 3 upcoming/scheduled chats sorted by time
  const upcomingList = useMemo(() => {
    return sortChatsForDateView(
      upcomingChats
        .filter(c => {
          const ds = deriveDisplayStatus(c.status as ChatStatus, c.scheduledAt);
          return ds === 'upcoming' || ds === 'pending';
        })
        .map(c => ({
          ...c,
          displayStatus: deriveDisplayStatus(c.status as ChatStatus, c.scheduledAt),
        }))
    ).slice(0, 3);
  }, [upcomingChats]);

  return (
    <div
      className="p-5 rounded-2xl border h-full"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Coffee className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Meeting Calendar
        </h2>
        <Link to="/app/chats">
          <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
            View All <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4">
        {/* Left panel: Mini calendar */}
        <div className="flex-1 min-w-0">
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
              <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
            </button>
            <button
              onClick={() => setShowMonthPicker(prev => !prev)}
              className="text-[11px] font-semibold px-1.5 py-0.5 rounded hover:bg-[var(--color-surfaceHover)] transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              {showMonthPicker ? String(getYear(currentMonth)) : format(currentMonth, 'MMM yyyy')}
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
              <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
            </button>
          </div>

          {showMonthPicker ? (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentMonth(prev => setMonth(prev, i));
                    setShowMonthPicker(false);
                  }}
                  className="text-[11px] py-2.5 rounded-lg font-medium transition-colors hover:bg-[var(--color-surfaceHover)]"
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
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-0.5">
                {WEEKDAYS.map(day => (
                  <div
                    key={day}
                    className="text-center text-[9px] font-medium py-0.5"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {day[0]}
                  </div>
                ))}
              </div>

              {/* Day cells — same dot logic as DashboardCalendar */}
              <div className="grid grid-cols-7 gap-px">
                {calendarDays.map((day, idx) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dateInfo = chatDateInfo[dayKey];
                  const hasChats = chatDates.has(dayKey);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                  const today = isToday(day);
                  const isPastDate = isPast(startOfDay(day)) && !today;

                  const showPendingDot = dateInfo?.hasPending && viewerRole === 'candidate';
                  const showUpcomingDot = dateInfo?.hasUpcoming;
                  const showCompletedDot = dateInfo?.hasCompleted;
                  const hasDots = showPendingDot || showUpcomingDot || showCompletedDot;

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
                      className="relative flex flex-col items-center justify-center py-1 rounded text-[10px] transition-colors cursor-pointer"
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
                        <div className="absolute bottom-0 flex gap-0.5">
                          {showUpcomingDot && (
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: DOT_COLORS.upcoming }} />
                          )}
                          {showPendingDot && (
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: DOT_COLORS.pending }} />
                          )}
                          {showCompletedDot && (
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: DOT_COLORS.completed }} />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-[10px] mt-1 font-medium"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Show all
                </button>
              )}
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px self-stretch" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Right panel: Compact upcoming summary */}
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-textMuted)' }}>
            Upcoming
          </p>
          {upcomingList.length > 0 ? (
            <div className="space-y-2">
              {upcomingList.map((chat, i) => (
                <div key={chat.id || i} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: chat.displayStatus === 'upcoming' ? DOT_COLORS.upcoming : DOT_COLORS.pending }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {chat.person}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--color-textMuted)' }}>
                      {chat.company}
                      {chat.scheduledAt && (
                        <> · {format(parseISO(chat.scheduledAt), 'MMM d, h:mm a')}</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px]" style={{ color: 'var(--color-textMuted)' }}>
              No upcoming chats
            </p>
          )}

          {/* View all link at bottom */}
          <div className="mt-auto pt-3">
            <Link
              to="/app/chats"
              className="text-[10px] font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              View all chats
            </Link>
          </div>
        </div>
      </div>

      {/* Day Detail Popup — reuses same allChats pattern */}
      {dayPopupDate && (
        <DayDetailPopup
          isOpen={!!dayPopupDate}
          onClose={() => setDayPopupDate(null)}
          selectedDate={dayPopupDate}
          allChats={upcomingChats}
          unscheduledChats={(allAcceptedChats || []).filter(c => !c.scheduledAt)}
          mode="navigate"
          chatsPath="/app/chats"
          viewerRole={viewerRole}
        />
      )}
    </div>
  );
}
