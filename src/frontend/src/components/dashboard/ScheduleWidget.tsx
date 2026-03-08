import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
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
  setMonth,
  setYear,
  getMonth,
  getYear,
} from 'date-fns';
import { Badge } from '../ui/Badge';
import { DayDetailPopup } from './DayDetailPopup';
import type { UpcomingChat } from './DashboardCalendar';

interface ScheduleWidgetProps {
  upcomingChats: UpcomingChat[];
  pendingChats: number;
  acceptedChats: number;
  allAcceptedChats?: UpcomingChat[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getOptimalSlots(chats: UpcomingChat[]): string[] {
  const hours = chats
    .filter(c => c.scheduledAt)
    .map(c => parseISO(c.scheduledAt!).getHours());
  const slots: string[] = [];
  if (!hours.some(h => h >= 9 && h < 12)) slots.push('Mornings (9-11 AM)');
  if (!hours.some(h => h >= 13 && h < 16)) slots.push('Afternoons (1-3 PM)');
  if (!hours.some(h => h >= 16 && h < 18)) slots.push('Late Afternoon (4-5 PM)');
  if (slots.length === 0) slots.push('Early Morning (8-9 AM)', 'Evening (5-6 PM)');
  return slots.slice(0, 3);
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

export function ScheduleWidget({ upcomingChats, pendingChats: _pendingChats, acceptedChats: _acceptedChats, allAcceptedChats }: ScheduleWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Dates that have scheduled chats
  const chatDates = useMemo(() => {
    const dates = new Set<string>();
    for (const chat of upcomingChats) {
      if (chat.scheduledAt) {
        dates.add(format(parseISO(chat.scheduledAt), 'yyyy-MM-dd'));
      }
    }
    return dates;
  }, [upcomingChats]);

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

  // Filter chats based on selected day
  const displayChats = useMemo(() => {
    if (!selectedDay) return upcomingChats;
    const dayKey = format(selectedDay, 'yyyy-MM-dd');
    return upcomingChats.filter(chat => {
      if (!chat.scheduledAt) return false;
      return format(parseISO(chat.scheduledAt), 'yyyy-MM-dd') === dayKey;
    });
  }, [upcomingChats, selectedDay]);

  const visibleChats = displayChats.slice(0, 3);
  const optimalSlots = useMemo(() => getOptimalSlots(upcomingChats), [upcomingChats]);

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
            /* Month picker grid — replaces calendar */
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
            /* Calendar grid */
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
                      className="relative flex flex-col items-center justify-center py-1 rounded text-[10px] transition-colors cursor-pointer"
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
                        <div
                          className="absolute bottom-0 w-1 h-1 rounded-full"
                          style={{ backgroundColor: 'var(--color-accent)' }}
                        />
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

        {/* Right panel: Schedule info */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Upcoming & Pending list */}
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-textMuted)' }}>
              Upcoming
            </p>
            {visibleChats.length > 0 ? (
              <div className="space-y-1.5">
                {visibleChats.map((chat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-1.5 rounded-lg"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                      style={{
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {chat.person.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[11px] truncate" style={{ color: 'var(--color-text)' }}>
                        {chat.person}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--color-textMuted)' }}>
                        {chat.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {chat.meetingLink && (
                        <a
                          href={chat.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Join meeting"
                        >
                          <ExternalLink className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                        </a>
                      )}
                      {chat.status === 'pending' ? (
                        <Badge variant="warning" size="sm">Pending</Badge>
                      ) : chat.scheduledAt ? (
                        <span className="text-[10px]" style={{ color: 'var(--color-textSecondary)' }}>
                          {format(parseISO(chat.scheduledAt), 'h:mm a')}
                        </span>
                      ) : (
                        <Badge variant={getStatusVariant(chat.status)} size="sm">
                          {chat.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] py-2" style={{ color: 'var(--color-textMuted)' }}>
                {selectedDay ? 'No chats this day' : 'No upcoming chats'}
              </p>
            )}
          </div>

          {/* Optimal Time Slots */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-textMuted)' }}>
              Suggested Open Slots
            </p>
            <div className="space-y-1">
              {optimalSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                  <span className="text-[11px]" style={{ color: 'var(--color-textSecondary)' }}>
                    {slot}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
          mode="navigate"
          chatsPath="/app/chats"
        />
      )}
    </div>
  );
}
