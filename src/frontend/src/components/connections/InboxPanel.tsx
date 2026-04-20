import { useState } from 'react';
import { X, UserPlus, Clock, Check, Calendar, MessageCircle, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConnections } from '../../contexts/ConnectionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { avatarGradient } from '../../utils/matchHelpers';
import { ScheduleModal } from '../coffee-chats/ScheduleModal';
import type { Connection } from '../../types/connections.types';

interface InboxPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function InboxPanel({ isOpen, onClose }: InboxPanelProps) {
  const navigate = useNavigate();
  const { isEmployer } = useAuth();
  const { pendingReceived, acceptConnection, rejectConnection } = useConnections();
  const { success: showSuccess, error: showError } = useToast();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [selectedTimeIdx, setSelectedTimeIdx] = useState<Record<string, number>>({});
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [connectionToSchedule, setConnectionToSchedule] = useState<Connection | null>(null);

  const handleAccept = async (conn: Connection, customScheduledAt?: string) => {
    setAcceptingId(conn.id);
    try {
      const hasMeetInvite = conn.meet_invite && conn.meet_invite.status === 'pending';
      const hasProposedTimes = hasMeetInvite && conn.meet_invite!.proposed_times.length > 0;
      const timeIdx = selectedTimeIdx[conn.id];

      // Determine the confirmed time
      let confirmedTime: string | undefined;
      if (customScheduledAt) {
        // Custom time from ScheduleModal
        confirmedTime = customScheduledAt;
      } else if (hasProposedTimes && timeIdx !== undefined) {
        // Selected from proposed times
        confirmedTime = conn.meet_invite!.proposed_times[timeIdx];
      }

      await acceptConnection(conn.id, {
        acceptMeetInvite: !!hasMeetInvite || !!customScheduledAt,
        confirmedTime,
      });
      showSuccess('Connected!', confirmedTime
        ? `Meeting scheduled with ${conn.sender_name || 'this user'}`
        : `You're now connected with ${conn.sender_name || 'this user'}`
      );
    } catch {
      showError('Error', 'Failed to accept connection');
    } finally {
      setAcceptingId(null);
      setConnectionToSchedule(null);
    }
  };

  const handleAcceptWithSchedule = (conn: Connection) => {
    // Open schedule modal for the user to pick a time
    setConnectionToSchedule(conn);
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = (scheduledAt: string, _meetingLink?: string) => {
    if (connectionToSchedule) {
      handleAccept(connectionToSchedule, scheduledAt);
    }
    setScheduleModalOpen(false);
  };

  const handleDecline = async (conn: Connection) => {
    try {
      await rejectConnection(conn.id);
      showSuccess('Declined', 'Connection request declined');
    } catch {
      showError('Error', 'Failed to decline connection');
    }
  };

  const handleViewProfile = (conn: Connection) => {
    const targetId = conn.sender_id;
    const basePath = isEmployer ? '/app/employer/ember' : '/app/ember';
    navigate(`${basePath}?deepdive=${targetId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm border-l animate-slide-in-right"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Connection Requests
            </h2>
            {pendingReceived.length > 0 && (
              <span
                className="flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 5px',
                }}
              >
                {pendingReceived.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {pendingReceived.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <UserPlus className="w-10 h-10 mb-3 opacity-20" style={{ color: 'var(--color-textMuted)' }} />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                No pending requests
              </p>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                When someone wants to connect, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {pendingReceived.map(conn => {
                const senderName = conn.sender_name || 'Unknown';
                const initial = senderName.charAt(0).toUpperCase();
                const hasMeetInvite = conn.meet_invite && conn.meet_invite.status === 'pending';

                return (
                  <div key={conn.id} className="p-4 space-y-3">
                    {/* Sender info */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: avatarGradient(senderName) }}
                      >
                        <span className="text-sm font-bold text-white">{initial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                            {senderName}
                          </p>
                          <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo(conn.created_at)}
                          </span>
                        </div>
                        {(conn.sender_company) && (
                          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                            {conn.sender_company}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {conn.message && (
                      <div
                        className="p-2.5 rounded-lg text-xs leading-relaxed"
                        style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)' }}
                      >
                        <MessageCircle className="w-3 h-3 inline mr-1.5" style={{ color: 'var(--color-textMuted)' }} />
                        {conn.message}
                      </div>
                    )}

                    {/* Meet invite - proposed times */}
                    {hasMeetInvite && conn.meet_invite!.proposed_times.length > 0 && (
                      <div
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: 'var(--color-background)' }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Calendar className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                          <span className="text-[10px] font-medium" style={{ color: 'var(--color-textSecondary)' }}>
                            Proposed meeting times ({conn.meet_invite!.duration_minutes}min)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {conn.meet_invite!.proposed_times.map((timeStr, idx) => {
                            const start = new Date(timeStr);
                            const durationMin = conn.meet_invite!.duration_minutes || 30;
                            const end = new Date(start.getTime() + durationMin * 60_000);
                            const dateLabel = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                            const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
                            const timeLabel = `${start.toLocaleTimeString(undefined, timeOpts)} – ${end.toLocaleTimeString(undefined, timeOpts)}`;
                            const isSelected = selectedTimeIdx[conn.id] === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedTimeIdx(prev => ({ ...prev, [conn.id]: idx }))}
                                className="px-2 py-1 rounded-lg text-[11px] font-medium transition-colors"
                                style={{
                                  backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                                  color: isSelected ? 'var(--color-accentText)' : 'var(--color-text)',
                                  border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                }}
                              >
                                {dateLabel} · {timeLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {hasMeetInvite && conn.meet_invite!.proposed_times.length > 0 ? (
                        // Has proposed times - show Accept (with selected time) or Schedule (custom)
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(conn)}
                            isLoading={acceptingId === conn.id}
                            disabled={selectedTimeIdx[conn.id] === undefined}
                            className="flex-1"
                            title={selectedTimeIdx[conn.id] === undefined ? 'Select a time above' : undefined}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {selectedTimeIdx[conn.id] !== undefined ? 'Accept & Schedule' : 'Select Time'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcceptWithSchedule(conn)}
                            title="Set a different time"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        // No proposed times - show Accept with Schedule option
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptWithSchedule(conn)}
                            isLoading={acceptingId === conn.id}
                            className="flex-1"
                          >
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            Accept & Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAccept(conn)}
                            title="Accept without scheduling"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDecline(conn)}
                        style={{ color: 'var(--color-error)' }}
                      >
                        Decline
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleViewProfile(conn)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal for setting custom time */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setConnectionToSchedule(null);
        }}
        onSchedule={handleScheduleSubmit}
      />
    </>
  );
}
