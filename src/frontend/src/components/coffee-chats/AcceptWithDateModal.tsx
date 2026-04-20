import { useState, useEffect } from 'react';
import { Calendar, Check, CalendarPlus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ScheduleModal } from './ScheduleModal';

interface AcceptWithDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (scheduledAt: string) => void;
  partnerName: string;
  preferredDates: string[];
  customDates: string[];
  onAddCustomDate: (scheduledAt: string) => void;
}

export function AcceptWithDateModal({
  isOpen,
  onClose,
  onAccept,
  partnerName,
  preferredDates,
  customDates,
  onAddCustomDate,
}: AcceptWithDateModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setIsSubmitting(false);
      setScheduleOpen(false);
    }
  }, [isOpen]);

  const handleAccept = async () => {
    if (!selectedDate) return;
    setIsSubmitting(true);
    try {
      await onAccept(selectedDate);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedulePicked = (scheduledAt: string) => {
    onAddCustomDate(scheduledAt);
    setSelectedDate(scheduledAt);
    setScheduleOpen(false);
  };

  const allDates = [...preferredDates, ...customDates];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Accept & Schedule" size="sm">
        <div className="py-2">
          <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>{partnerName}</span> proposed the following times. Select one to schedule the meeting:
          </p>

          <div className="space-y-2 mb-6 max-h-[280px] overflow-y-auto pr-1">
            {allDates.map((dateStr, idx) => {
              const date = new Date(dateStr);
              const isSelected = selectedDate === dateStr;
              const isCustom = idx >= preferredDates.length;
              return (
                <button
                  key={`${dateStr}-${idx}`}
                  onClick={() => setSelectedDate(dateStr)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                    borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                    color: isSelected ? 'var(--color-accentText)' : 'var(--color-text)',
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="flex-1 text-left text-sm font-medium">
                    {date.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-sm">
                    {date.toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                  {isCustom && !isSelected && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}
                    >
                      New
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="outline" onClick={() => setScheduleOpen(true)}>
              <CalendarPlus className="w-4 h-4 mr-1" />
              Reschedule
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!selectedDate}
              isLoading={isSubmitting}
            >
              <Check className="w-4 h-4 mr-1" />
              Accept & Schedule
            </Button>
          </div>
        </div>
      </Modal>

      <ScheduleModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSchedule={handleReschedulePicked}
      />
    </>
  );
}
