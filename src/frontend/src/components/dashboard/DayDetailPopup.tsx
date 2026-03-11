import { format, parseISO } from 'date-fns';
import { ExternalLink, CalendarPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import type { UpcomingChat } from './DashboardCalendar';
import { deriveDisplayStatus, sortChatsForDateView, type DisplayStatus } from '../../utils/coffeeChatStatus';
import type { ChatStatus } from '../coffee-chats/CoffeeChatCard';

const DOT_COLORS: Record<string, string> = {
  pending: '#9CA3AF',
  upcoming: '#3B82F6',
  completed: '#22C55E',
  cancelled: '#EF4444',
  declined: '#EF4444',
};

const STATUS_LABELS: Record<DisplayStatus, string> = {
  pending: 'Pending',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
};

interface DayDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  allChats?: UpcomingChat[];
  scheduledChats?: UpcomingChat[];
  unscheduledChats: UpcomingChat[];
  mode: 'schedule' | 'navigate';
  chatsPath?: string;
  onScheduleChat?: (chatId: string, prefilledDate: string) => void;
  viewerRole?: 'candidate' | 'employer';
}

export function DayDetailPopup({
  isOpen,
  onClose,
  selectedDate,
  allChats = [],
  scheduledChats: _scheduledChats,
  unscheduledChats,
  mode,
  chatsPath = '/app/chats',
  onScheduleChat,
}: DayDetailPopupProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Find all chats that match this date (by scheduledAt or preferredDates)
  const chatsForDate = allChats.filter(chat => {
    if (chat.scheduledAt && format(parseISO(chat.scheduledAt), 'yyyy-MM-dd') === dateStr) return true;
    if (chat.preferredDates) {
      return chat.preferredDates.some(pd => {
        try { return format(parseISO(pd), 'yyyy-MM-dd') === dateStr; } catch { return false; }
      });
    }
    return false;
  });

  // Derive display status and sort: upcoming → pending → completed
  const sortedChats = sortChatsForDateView(
    chatsForDate.map(c => ({
      ...c,
      displayStatus: deriveDisplayStatus(c.status as ChatStatus, c.scheduledAt),
    }))
  );

  const hasChats = sortedChats.length > 0;
  // Also check for unscheduled accepted chats (ready to schedule on this date)
  const hasUnscheduled = unscheduledChats.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={format(selectedDate, 'EEEE, MMM d, yyyy')} size="sm">
      <div className="space-y-4 py-1">
        {/* Coffee chats for this date */}
        {hasChats && (
          <div className="space-y-2">
            {sortedChats.map((chat, i) => (
              <div
                key={chat.id || i}
                className="p-3 rounded-lg flex items-center gap-3"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                {/* Status dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: DOT_COLORS[chat.displayStatus] || DOT_COLORS.pending }}
                />
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                    <span style={{ color: 'var(--color-textMuted)' }}>
                      {STATUS_LABELS[chat.displayStatus]}
                    </span>
                    {' — '}
                    {chat.person}
                    {chat.company && (
                      <>
                        {' — '}
                        <span style={{ color: 'var(--color-textMuted)' }}>{chat.company}</span>
                      </>
                    )}
                  </p>
                  {/* Time if scheduled */}
                  {chat.scheduledAt && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-textSecondary)' }}>
                      {format(parseISO(chat.scheduledAt), 'h:mm a')}
                      {chat.role && chat.role !== 'Coffee Chat' && (
                        <span style={{ color: 'var(--color-textMuted)' }}> · {chat.role}</span>
                      )}
                    </p>
                  )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unscheduled / Ready to Schedule section */}
        {hasUnscheduled && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-textMuted)' }}>
              Ready to Schedule
            </p>
            <div className="space-y-2">
              {unscheduledChats.map((chat, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg flex items-center gap-3"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
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
                      <span style={{ color: 'var(--color-textMuted)' }}> @ {chat.company}</span>
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {chat.role}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {mode === 'schedule' && chat.id && onScheduleChat ? (
                      <button
                        onClick={() => {
                          onScheduleChat(chat.id!, dateStr);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'var(--color-accent)',
                          color: 'var(--color-accentText)',
                        }}
                      >
                        <CalendarPlus className="w-3 h-3" />
                        Schedule
                      </button>
                    ) : (
                      <Link
                        to={chatsPath}
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        <CalendarPlus className="w-3 h-3" />
                        Schedule
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasChats && !hasUnscheduled && (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              No meetings on this day
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
