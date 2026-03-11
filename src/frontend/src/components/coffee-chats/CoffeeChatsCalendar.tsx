import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  MessageCircle,
  Info,
  Clock,
  Building2,
} from 'lucide-react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from 'date-fns';
import { deriveDisplayStatus, type DisplayStatus } from '../../utils/coffeeChatStatus';
import type { CoffeeChatData } from './CoffeeChatCard';

/* ── Status color map ── */
const STATUS_COLORS: Record<DisplayStatus, { bg: string; border: string; dot: string; text: string }> = {
  pending:   { bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)', dot: '#9CA3AF', text: '#9CA3AF' },
  upcoming:  { bg: 'rgba(59,130,246,0.15)',   border: 'rgba(59,130,246,0.3)', dot: '#3B82F6', text: '#3B82F6' },
  completed: { bg: 'rgba(34,197,94,0.15)',    border: 'rgba(34,197,94,0.3)',  dot: '#22C55E', text: '#22C55E' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',    border: 'rgba(239,68,68,0.3)',  dot: '#EF4444', text: '#EF4444' },
  declined:  { bg: 'rgba(239,68,68,0.15)',    border: 'rgba(239,68,68,0.3)',  dot: '#EF4444', text: '#EF4444' },
};

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FULL = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const HOUR_HEIGHT = 40; // compact: 40px per hour
const START_HOUR = 0;
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 12 AM – 11 PM (full 24h)

interface CoffeeChatsCalendarProps {
  chats: CoffeeChatData[];
  onMessage?: (chatId: string, partnerName: string) => void;
  onViewDetails?: (chat: CoffeeChatData) => void;
}

/** Enrich a chat with its display status */
function enrichChat(chat: CoffeeChatData) {
  return {
    ...chat,
    displayStatus: deriveDisplayStatus(chat.status, chat.scheduled_at),
  };
}

type EnrichedChat = CoffeeChatData & { displayStatus: DisplayStatus };

/* ════════════════════════════════════════════════════════════════════
   SMALL MONTH CALENDAR
   ════════════════════════════════════════════════════════════════════ */
function SmallMonthCalendar({
  currentMonth,
  onMonthChange,
  selectedDate,
  onSelectDate,
  chatsByDate,
}: {
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  chatsByDate: Map<string, EnrichedChat[]>;
}) {
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

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surfaceHover)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
        </button>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surfaceHover)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: 'var(--color-textMuted)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayChats = chatsByDate.get(key) || [];
          const inMonth = isSameMonth(day, currentMonth);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);

          // Show one dot per chat (max 5), colored by status
          const dots = dayChats.slice(0, 5).map(c => c.displayStatus);

          return (
            <button
              key={idx}
              onClick={() => inMonth && onSelectDate(day)}
              className="relative flex flex-col items-center justify-center py-1.5 rounded-lg text-xs transition-all"
              style={{
                color: selected
                  ? 'var(--color-accentText)'
                  : !inMonth
                  ? 'var(--color-textMuted)'
                  : 'var(--color-text)',
                backgroundColor: selected
                  ? 'var(--color-accent)'
                  : today
                  ? 'var(--color-surfaceHover)'
                  : 'transparent',
                fontWeight: today || selected ? 600 : 400,
                opacity: inMonth ? 1 : 0.35,
                cursor: inMonth ? 'pointer' : 'default',
              }}
            >
              {format(day, 'd')}
              {dots.length > 0 && !selected && (
                <div className="absolute bottom-0.5 flex gap-px">
                  {dots.map((s, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[s].dot }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STATUS LEGEND
   ════════════════════════════════════════════════════════════════════ */
function StatusLegend() {
  const items: { label: string; status: DisplayStatus }[] = [
    { label: 'Scheduled', status: 'upcoming' },
    { label: 'Pending', status: 'pending' },
    { label: 'Completed', status: 'completed' },
    { label: 'Cancelled', status: 'cancelled' },
  ];

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-textSecondary)' }}>
        Status Legend
      </p>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ label, status }) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status].dot }} />
            <span className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   NEXT UP CARD
   ════════════════════════════════════════════════════════════════════ */
function NextUpCard({
  chat,
  onMessage,
  onViewDetails,
}: {
  chat: EnrichedChat | null;
  onMessage?: (chatId: string, partnerName: string) => void;
  onViewDetails?: (chat: CoffeeChatData) => void;
}) {
  if (!chat) {
    return (
      <div
        className="rounded-2xl border p-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-textSecondary)' }}>
          Next Up
        </p>
        <div className="flex flex-col items-center py-4">
          <Coffee className="w-6 h-6 mb-2" style={{ color: 'var(--color-textMuted)' }} />
          <p className="text-xs text-center" style={{ color: 'var(--color-textMuted)' }}>
            No upcoming chats
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-4 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }}
      />

      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-textSecondary)' }}>
        Next Up
      </p>

      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: 'var(--color-accent)' }}
        >
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {chat.partner_company || chat.partner_name}
          </p>
          {chat.role_title && (
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
              {chat.role_title}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1.5">
        {chat.scheduled_at && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-textSecondary)' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{format(parseISO(chat.scheduled_at), 'EEE, MMM d · h:mm a')}</span>
          </div>
        )}
        {chat.match_score != null && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-accent)' }}>
            <span className="font-semibold">{Math.round(chat.match_score)}% match</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onViewDetails?.(chat)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-surfaceHover)',
            color: 'var(--color-textSecondary)',
          }}
        >
          <Info className="w-3.5 h-3.5" />
          Details
        </button>
        <button
          onClick={() => onMessage?.(chat.id, chat.partner_name)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accentText)',
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Message
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   WEEK CALENDAR EVENT BLOCK
   ════════════════════════════════════════════════════════════════════ */
function EventBlock({
  chat,
  top,
  height,
  onClick,
}: {
  chat: EnrichedChat;
  top: number;
  height: number;
  onClick?: () => void;
}) {
  const colors = STATUS_COLORS[chat.displayStatus];
  const time = chat.scheduled_at ? format(parseISO(chat.scheduled_at), 'h:mm a') : '';

  return (
    <button
      onClick={onClick}
      className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-left transition-all hover:brightness-110 hover:shadow-md cursor-pointer overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 22)}px`,
        backgroundColor: colors.bg,
        borderLeft: `3px solid ${colors.dot}`,
        zIndex: 10,
      }}
    >
      <p
        className="text-[10px] font-semibold truncate leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        {chat.partner_company || chat.partner_name}
      </p>
      {height > 28 && (
        <p className="text-[9px] truncate leading-tight" style={{ color: 'var(--color-textMuted)' }}>
          {time}
        </p>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LARGE WEEK CALENDAR
   ════════════════════════════════════════════════════════════════════ */
function WeekCalendar({
  weekStart,
  onWeekChange,
  onTodayClick,
  chats,
  onEventClick,
}: {
  weekStart: Date;
  onWeekChange: (d: Date) => void;
  onTodayClick: () => void;
  chats: EnrichedChat[];
  onEventClick?: (chat: CoffeeChatData) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Auto-scroll to ~current hour on first render
  useEffect(() => {
    if (scrollRef.current && !hasScrolled.current) {
      const now = new Date();
      const scrollTo = Math.max(0, (getHours(now) - 1) * HOUR_HEIGHT);
      scrollRef.current.scrollTop = scrollTo;
      hasScrolled.current = true;
    }
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const weekEnd = addDays(weekStart, 6);
  const monthLabel = isSameMonth(weekStart, weekEnd)
    ? format(weekStart, 'MMMM yyyy')
    : `${format(weekStart, 'MMM')} – ${format(weekEnd, 'MMM yyyy')}`;

  // Group chats by day column
  const chatsByDay = useMemo(() => {
    const map = new Map<number, EnrichedChat[]>();
    for (let i = 0; i < 7; i++) map.set(i, []);

    chats.forEach(chat => {
      if (!chat.scheduled_at) return;
      const chatDate = parseISO(chat.scheduled_at);
      for (let i = 0; i < 7; i++) {
        if (isSameDay(chatDate, weekDays[i])) {
          map.get(i)!.push(chat);
          break;
        }
      }
    });
    return map;
  }, [chats, weekDays]);

  const getEventPosition = (chat: EnrichedChat) => {
    if (!chat.scheduled_at) return { top: 0, height: HOUR_HEIGHT / 2 };
    const d = parseISO(chat.scheduled_at);
    const h = getHours(d);
    const m = getMinutes(d);
    const top = (h - START_HOUR) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
    const height = HOUR_HEIGHT / 2; // 30 min default
    return { top, height };
  };

  // Current time indicator
  const now = new Date();
  const nowDayIndex = weekDays.findIndex(d => isSameDay(d, now));
  const nowTop = (getHours(now) - START_HOUR) * HOUR_HEIGHT + (getMinutes(now) / 60) * HOUR_HEIGHT;

  return (
    <div
      className="rounded-2xl border overflow-hidden flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {monthLabel}
          </h2>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onWeekChange(subWeeks(weekStart, 1))}
              className="p-1 rounded-lg hover:bg-[var(--color-surfaceHover)] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
            </button>
            <button
              onClick={() => onWeekChange(addWeeks(weekStart, 1))}
              className="p-1 rounded-lg hover:bg-[var(--color-surfaceHover)] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
            </button>
          </div>
        </div>
        <button
          onClick={onTodayClick}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-accent)',
            backgroundColor: 'transparent',
          }}
        >
          Today
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div /> {/* spacer for time gutter */}
        {weekDays.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className="text-center py-1.5 border-l"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="text-[9px] font-medium tracking-wide" style={{ color: 'var(--color-textMuted)' }}>
                {WEEKDAYS_FULL[i]}
              </p>
              <p
                className="text-sm font-semibold mt-0.5 rounded-full w-7 h-7 flex items-center justify-center mx-auto"
                style={{
                  color: today ? 'var(--color-accentText)' : 'var(--color-text)',
                  backgroundColor: today ? 'var(--color-accent)' : 'transparent',
                }}
              >
                {format(day, 'd')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid — scrollable 24h */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="relative grid grid-cols-[44px_repeat(7,1fr)]" style={{ minHeight: `${HOURS.length * HOUR_HEIGHT}px` }}>
          {/* Time labels */}
          <div className="relative">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-1.5 text-[9px] font-medium"
                style={{
                  top: `${(h - START_HOUR) * HOUR_HEIGHT - 5}px`,
                  color: 'var(--color-textMuted)',
                }}
              >
                {format(setMinutes(setHours(new Date(), h), 0), 'h a')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((_day, dayIdx) => (
            <div
              key={dayIdx}
              className="relative border-l"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {/* Hour gridlines */}
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t"
                  style={{
                    top: `${(h - START_HOUR) * HOUR_HEIGHT}px`,
                    borderColor: 'var(--color-border)',
                    opacity: 0.4,
                  }}
                />
              ))}

              {/* Events */}
              {(chatsByDay.get(dayIdx) || []).map(chat => {
                const { top, height } = getEventPosition(chat);
                return (
                  <EventBlock
                    key={chat.id}
                    chat={chat}
                    top={top}
                    height={height}
                    onClick={() => onEventClick?.(chat)}
                  />
                );
              })}

              {/* Current time indicator */}
              {dayIdx === nowDayIndex && nowTop >= 0 && nowTop <= HOURS.length * HOUR_HEIGHT && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: `${nowTop}px` }}
                >
                  <div className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full -ml-1"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    />
                    <div
                      className="flex-1 h-[2px]"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════ */
export function CoffeeChatsCalendar({
  chats,
  onMessage,
  onViewDetails,
}: CoffeeChatsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));

  // Enrich all chats with display status
  const enrichedChats = useMemo(() => chats.map(enrichChat), [chats]);

  // Build date → chats map for small calendar dots (one dot per chat)
  const chatsByDate = useMemo(() => {
    const map = new Map<string, EnrichedChat[]>();

    const addToDate = (key: string, chat: EnrichedChat) => {
      if (!map.has(key)) map.set(key, []);
      // Avoid adding same chat twice on same date
      if (!map.get(key)!.find(c => c.id === chat.id)) {
        map.get(key)!.push(chat);
      }
    };

    enrichedChats.forEach(chat => {
      // Scheduled chats go on their scheduled date
      if (chat.scheduled_at) {
        addToDate(format(parseISO(chat.scheduled_at), 'yyyy-MM-dd'), chat);
      }
      // Pending chats also appear on their preferred dates
      if (chat.displayStatus === 'pending' && chat.preferred_dates) {
        chat.preferred_dates.forEach(pd => {
          addToDate(format(parseISO(pd), 'yyyy-MM-dd'), chat);
        });
      }
    });
    return map;
  }, [enrichedChats]);

  // Chats visible in the current week (scheduled chats + pending chats with preferred dates in this week)
  const weekChats = useMemo(() => {
    const end = addDays(weekStart, 7);
    return enrichedChats.filter(chat => {
      // Scheduled chats
      if (chat.scheduled_at) {
        const d = parseISO(chat.scheduled_at);
        if (d >= weekStart && d < end) return true;
      }
      // Pending chats with preferred_dates that fall in this week
      if (chat.displayStatus === 'pending' && chat.preferred_dates) {
        return chat.preferred_dates.some(pd => {
          const d = parseISO(pd);
          return d >= weekStart && d < end;
        });
      }
      return false;
    });
  }, [enrichedChats, weekStart]);

  // For pending chats without scheduled_at, we use the first preferred_date in the current week
  // as a synthetic scheduled_at so they appear in the week grid
  const weekChatsWithPosition = useMemo(() => {
    const end = addDays(weekStart, 7);
    return weekChats.map(chat => {
      if (chat.scheduled_at) return chat;
      // Pending with preferred_dates — pick the first date in this week
      if (chat.preferred_dates) {
        const dateInWeek = chat.preferred_dates.find(pd => {
          const d = parseISO(pd);
          return d >= weekStart && d < end;
        });
        if (dateInWeek) {
          return { ...chat, scheduled_at: dateInWeek };
        }
      }
      return chat;
    });
  }, [weekChats, weekStart]);

  // Next upcoming chat
  const nextUp = useMemo(() => {
    const now = new Date();
    return enrichedChats
      .filter(c => c.displayStatus === 'upcoming' && c.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
      .find(c => new Date(c.scheduled_at!) >= now) || null;
  }, [enrichedChats]);

  // Sync: clicking small calendar → update week
  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setWeekStart(startOfWeek(date));
  }, []);

  // Sync: navigating week → update small calendar month if needed
  const handleWeekChange = useCallback((newWeekStart: Date) => {
    setWeekStart(newWeekStart);
    const midWeek = addDays(newWeekStart, 3);
    if (!isSameMonth(midWeek, currentMonth)) {
      setCurrentMonth(startOfMonth(midWeek));
    }
    setSelectedDate(midWeek);
  }, [currentMonth]);

  const handleTodayClick = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    setWeekStart(startOfWeek(today));
    setCurrentMonth(startOfMonth(today));
  }, []);

  return (
    <div className="flex gap-4 items-start">
      {/* LEFT SIDEBAR */}
      <div className="w-[260px] flex-shrink-0 space-y-3">
        <SmallMonthCalendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          chatsByDate={chatsByDate}
        />
        <StatusLegend />
        <NextUpCard
          chat={nextUp}
          onMessage={onMessage}
          onViewDetails={onViewDetails}
        />
      </div>

      {/* RIGHT: WEEK CALENDAR */}
      <div className="flex-1 min-w-0">
        <WeekCalendar
          weekStart={weekStart}
          onWeekChange={handleWeekChange}
          onTodayClick={handleTodayClick}
          chats={weekChatsWithPosition}
          onEventClick={onViewDetails}
        />
      </div>
    </div>
  );
}
