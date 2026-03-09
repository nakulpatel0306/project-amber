import { useState } from 'react';
import { UserPlus, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  subtitle?: string;
  archetype?: { name: string; key: string };
  overallScore: number;
  avatarUrl?: string | null;
  onConnect: (message: string, meetInvite?: { proposed_times: string[]; duration_minutes: number }) => Promise<void>;
}

const DURATION_OPTIONS = [15, 30, 45, 60];
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM',
];

export function ConnectModal({
  isOpen,
  onClose,
  name,
  subtitle,
  archetype,
  overallScore,
  avatarUrl,
  onConnect,
}: ConnectModalProps) {
  const [message, setMessage] = useState(
    `I'd like to connect and discuss how our work styles align.`
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [duration, setDuration] = useState(30);
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  const wordCount = message.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const meetInvite = showCalendar && preferredDates.length > 0
        ? {
            proposed_times: preferredDates.map(d => {
              const [timePart, ampm] = preferredTime.split(' ');
              const [hStr, mStr] = timePart.split(':');
              let h = parseInt(hStr);
              if (ampm === 'PM' && h !== 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
              const dt = new Date(d);
              dt.setHours(h, parseInt(mStr), 0, 0);
              return dt.toISOString();
            }),
            duration_minutes: duration,
          }
        : undefined;
      await onConnect(message, meetInvite);
      setMessage('');
      setPreferredDates([]);
      setShowCalendar(false);
      onClose();
    } catch {
      // Error handled by parent via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={showCalendar ? '700px' : '384px'}
      dialogClassName="transition-[max-width] duration-700 ease-in-out"
    >
      <div className="flex gap-0 overflow-hidden">
        {/* Left side — main form */}
        <div className={`flex-1 min-w-0 ${showCalendar ? 'pr-5' : ''} transition-[padding] duration-700 ease-in-out`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: avatarUrl ? undefined : 'var(--color-surfaceHover)' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{initial}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{name}</h3>
                <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
                  {overallScore}%
                </span>
              </div>
              {subtitle && (
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{subtitle}</p>
              )}
              {archetype && (
                <span
                  className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium -ml-1.5 mt-1"
                  style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}
                >
                  {archetype.name}
                </span>
              )}
            </div>
          </div>

          {/* Message field */}
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-textSecondary)' }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={e => {
                const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                if (words.length <= 100) setMessage(e.target.value);
              }}
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm resize-none"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                border: `1px solid ${message.trim().length === 0 ? 'var(--color-warning)' : 'var(--color-border)'}`,
              }}
            />
            <p className="text-right text-[10px] mt-1" style={{ color: wordCount >= 90 ? 'var(--color-warning)' : 'var(--color-textMuted)' }}>
              {wordCount}/100 words
            </p>
          </div>

          {/* Coffee chat toggle */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 w-full py-2 px-3 rounded-xl transition-colors"
            style={{
              backgroundColor: showCalendar ? 'var(--color-surfaceHover)' : 'transparent',
              border: '1px solid var(--color-border)',
            }}
          >
            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
            <span className="text-xs font-medium flex-1 text-left" style={{ color: 'var(--color-textSecondary)' }}>
              Include A Coffee Chat Invite
            </span>
            <ChevronRight
              className="w-3.5 h-3.5 transition-transform duration-700 ease-in-out"
              style={{
                color: 'var(--color-textMuted)',
                transform: showCalendar ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        </div>

        {/* Right side — calendar panel, expands outward */}
        <div
          className="transition-all duration-700 ease-in-out overflow-hidden flex-shrink-0"
          style={{
            width: showCalendar ? '292px' : '0px',
            opacity: showCalendar ? 1 : 0,
            borderLeft: showCalendar ? '1px solid var(--color-border)' : 'none',
            paddingLeft: showCalendar ? '20px' : '0px',
          }}
        >
          {showCalendar && (
            <div>
              {/* Duration picker */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'var(--color-textSecondary)' }}>
                  <Clock className="w-3.5 h-3.5" />
                  Duration
                </label>
                <div className="flex gap-1.5">
                  {DURATION_OPTIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: duration === d ? 'var(--color-accent)' : 'var(--color-background)',
                        color: duration === d ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
                        border: `1px solid ${duration === d ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      }}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Date picker */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'var(--color-textSecondary)' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  Preferred Dates
                </label>
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
                >
                  <DatePicker
                    selectedDates={preferredDates}
                    onChange={setPreferredDates}
                    minDate={minDate}
                    maxSelections={5}
                  />
                </div>
              </div>

              {/* Time picker */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'var(--color-textSecondary)' }}>
                  <Clock className="w-3.5 h-3.5" />
                  Preferred Time
                </label>
                <div
                  className="grid grid-cols-3 gap-1 max-h-28 overflow-y-auto p-2 rounded-xl"
                  style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
                >
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPreferredTime(t)}
                      className="py-1 px-1 rounded-lg text-[10px] font-medium transition-colors"
                      style={{
                        backgroundColor: preferredTime === t ? 'var(--color-accent)' : 'transparent',
                        color: preferredTime === t ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting} disabled={message.trim().length === 0}>
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          Send Request
        </Button>
      </ModalFooter>
    </Modal>
  );
}
