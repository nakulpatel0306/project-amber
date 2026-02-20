import {
  Coffee,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ExternalLink,
  Star,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';

export type ChatStatus = 'pending' | 'accepted' | 'scheduled' | 'completed' | 'cancelled';

export interface CoffeeChatData {
  id: string;
  candidate_id: string;
  employer_id: string;
  role_id?: string | null;
  status: ChatStatus;
  message?: string | null;
  initiated_by: 'candidate' | 'employer';
  scheduled_at?: string | null;
  meeting_link?: string | null;
  rating?: number | null;
  feedback?: string | null;
  created_at: string;
  // Joined data
  partner_name: string;
  partner_company?: string;
  partner_location?: string;
  match_score?: number;
  role_title?: string;
}

interface CoffeeChatCardProps {
  chat: CoffeeChatData;
  userRole: 'candidate' | 'employer';
  onAccept?: (chatId: string) => void;
  onDecline?: (chatId: string) => void;
  onSchedule?: (chatId: string) => void;
  onComplete?: (chatId: string) => void;
  onFeedback?: (chatId: string) => void;
  onViewMatch?: (chatId: string) => void;
}

const statusConfig: Record<ChatStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  accepted: { label: 'Accepted', color: 'var(--color-success)', bg: 'rgba(22, 163, 74, 0.1)' },
  scheduled: { label: 'Scheduled', color: 'var(--color-accent)', bg: 'rgba(217, 119, 6, 0.1)' },
  completed: { label: 'Completed', color: 'var(--color-textMuted)', bg: 'rgba(120, 113, 108, 0.1)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-error)', bg: 'rgba(220, 38, 38, 0.1)' },
};

export function CoffeeChatCard({
  chat,
  userRole,
  onAccept,
  onDecline,
  onSchedule,
  onComplete,
  onFeedback,
  onViewMatch,
}: CoffeeChatCardProps) {
  const status = statusConfig[chat.status];
  const isIncoming = chat.initiated_by !== userRole;

  const scheduledDate = chat.scheduled_at
    ? new Date(chat.scheduled_at)
    : null;

  return (
    <div
      className="p-5 rounded-2xl border transition-all hover:shadow-sm"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
          }}
        >
          <Coffee className="w-6 h-6 text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {chat.partner_name}
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            {isIncoming && chat.status === 'pending' && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}
              >
                Incoming
              </span>
            )}
          </div>

          {chat.partner_company && (
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              {chat.partner_company}
            </p>
          )}

          {chat.role_title && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
              re: {chat.role_title}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
            {chat.partner_location && (
              <span className="flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                <MapPin className="w-3 h-3" /> {chat.partner_location}
              </span>
            )}
            {scheduledDate && (
              <span className="flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                <Calendar className="w-3 h-3" />
                {scheduledDate.toLocaleDateString()} at{' '}
                {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {chat.match_score && (
              <span className="flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
                <Star className="w-3 h-3" /> {chat.match_score}% match
              </span>
            )}
          </div>

          {chat.message && (
            <div
              className="mt-3 p-3 rounded-xl text-sm"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)' }}
            >
              <MessageCircle className="w-3.5 h-3.5 inline mr-1.5" style={{ color: 'var(--color-textMuted)' }} />
              {chat.message}
            </div>
          )}

          {chat.rating && (
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5"
                  style={{
                    color: i < chat.rating! ? 'var(--color-warning)' : 'var(--color-border)',
                    fill: i < chat.rating! ? 'var(--color-warning)' : 'none',
                  }}
                />
              ))}
              {chat.feedback && (
                <span className="text-xs ml-2" style={{ color: 'var(--color-textMuted)' }}>
                  "{chat.feedback}"
                </span>
              )}
            </div>
          )}
        </div>

        {/* Match score circle */}
        {chat.match_score && chat.match_score > 0 && (
          <div className="text-right flex-shrink-0 hidden sm:block">
            <div
              className="text-lg font-bold"
              style={{
                color: chat.match_score >= 80
                  ? 'var(--color-success)'
                  : chat.match_score >= 65
                  ? 'var(--color-accent)'
                  : 'var(--color-textMuted)',
              }}
            >
              {chat.match_score}%
            </div>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>match</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {/* Pending: Accept / Decline (only for receiver) */}
        {chat.status === 'pending' && isIncoming && (
          <>
            <Button size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={() => onAccept?.(chat.id)}>
              Accept
            </Button>
            <Button size="sm" variant="outline" leftIcon={<XCircle className="w-4 h-4" />} onClick={() => onDecline?.(chat.id)}>
              Decline
            </Button>
          </>
        )}

        {/* Pending: Waiting (for sender) */}
        {chat.status === 'pending' && !isIncoming && (
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
            <Clock className="w-3.5 h-3.5" /> Waiting for response...
          </span>
        )}

        {/* Accepted: Schedule */}
        {chat.status === 'accepted' && (
          <Button size="sm" leftIcon={<Calendar className="w-4 h-4" />} onClick={() => onSchedule?.(chat.id)}>
            Schedule
          </Button>
        )}

        {/* Scheduled: Join / Practice / Complete */}
        {chat.status === 'scheduled' && (
          <>
            {chat.meeting_link && (
              <a href={chat.meeting_link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>
                  Join Meeting
                </Button>
              </a>
            )}
            <Button size="sm" variant="outline" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={() => onComplete?.(chat.id)}>
              Mark Complete
            </Button>
          </>
        )}

        {/* Completed: Feedback */}
        {chat.status === 'completed' && !chat.rating && (
          <Button size="sm" variant="outline" leftIcon={<Star className="w-4 h-4" />} onClick={() => onFeedback?.(chat.id)}>
            Leave Feedback
          </Button>
        )}

        {/* View Match in Ember */}
        {onViewMatch && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={() => onViewMatch(chat.id)}
          >
            View Match
          </Button>
        )}

        {/* Cancel option for non-completed chats */}
        {chat.status !== 'completed' && chat.status !== 'cancelled' && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => onDecline?.(chat.id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
