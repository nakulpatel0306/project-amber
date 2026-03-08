import { useState } from 'react';
import { UserPlus, Sparkles, Calendar, Clock } from 'lucide-react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ScoreRing } from '../ui/ScoreRing';
import { DatePicker } from '../ui/DatePicker';
import { avatarGradient } from '../../utils/matchHelpers';

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
  const [message, setMessage] = useState('');
  const [includeMeetInvite, setIncludeMeetInvite] = useState(false);
  const [duration, setDuration] = useState(30);
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const meetInvite = includeMeetInvite && preferredDates.length > 0
        ? { proposed_times: preferredDates.map(d => d.toISOString()), duration_minutes: duration }
        : undefined;
      await onConnect(message, meetInvite);
      setMessage('');
      setPreferredDates([]);
      setIncludeMeetInvite(false);
      onClose();
    } catch {
      // Error handled by parent via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: avatarUrl ? undefined : avatarGradient(name) }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">{initial}</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{name}</h3>
            {subtitle && (
              <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>{subtitle}</p>
            )}
            {archetype && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium mt-0.5"
                style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--color-accent)' }}
              >
                <Sparkles className="w-2 h-2" />
                {archetype.name}
              </span>
            )}
          </div>
          <ScoreRing score={overallScore} size={44} />
        </div>

        {/* Message field */}
        <div className="mb-4 text-left">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-textSecondary)' }}>
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="I'd love to connect and learn more about your work!"
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 rounded-xl text-sm resize-none"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          />
          <p className="text-right text-[10px] mt-1" style={{ color: 'var(--color-textMuted)' }}>
            {message.length}/500
          </p>
        </div>

        {/* Include meet invite toggle */}
        <div className="text-left mb-4">
          <button
            onClick={() => setIncludeMeetInvite(!includeMeetInvite)}
            className="flex items-center gap-2 w-full"
          >
            <div
              className={`toggle-switch ${includeMeetInvite ? 'active' : ''}`}
              style={{ flexShrink: 0 }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--color-textSecondary)' }}>
              Include a coffee chat invite?
            </span>
          </button>
        </div>

        {/* Meet invite details */}
        {includeMeetInvite && (
          <div className="text-left space-y-3">
            {/* Duration picker */}
            <div>
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
            <div>
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
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          Send Connect
        </Button>
      </ModalFooter>
    </Modal>
  );
}
