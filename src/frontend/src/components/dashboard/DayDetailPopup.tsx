import { format, parseISO } from 'date-fns';
import { ExternalLink, CalendarPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import type { UpcomingChat } from './DashboardCalendar';

interface DayDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  scheduledChats: UpcomingChat[];
  unscheduledChats: UpcomingChat[];
  mode: 'schedule' | 'navigate';
  chatsPath?: string;
  onScheduleChat?: (chatId: string, prefilledDate: string) => void;
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

export function DayDetailPopup({
  isOpen,
  onClose,
  selectedDate,
  scheduledChats,
  unscheduledChats,
  mode,
  chatsPath = '/app/chats',
  onScheduleChat,
}: DayDetailPopupProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isEmpty = scheduledChats.length === 0 && unscheduledChats.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={format(selectedDate, 'EEEE, MMM d, yyyy')} size="sm">
      <div className="space-y-4 py-1">
        {/* Scheduled section */}
        {scheduledChats.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-textMuted)' }}>
              Scheduled
            </p>
            <div className="space-y-2">
              {scheduledChats.map((chat, i) => (
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
                    <div className="flex items-center gap-2 mt-0.5">
                      {chat.scheduledAt && (
                        <span className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                          {format(parseISO(chat.scheduledAt), 'h:mm a')}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        {chat.role}
                      </span>
                    </div>
                  </div>
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
                    <Badge variant={getStatusVariant(chat.status)} size="sm">
                      {chat.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unscheduled / Ready to Schedule section */}
        {unscheduledChats.length > 0 && (
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
        {isEmpty && (
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
