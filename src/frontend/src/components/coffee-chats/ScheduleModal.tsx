import { useState } from 'react';
import { Calendar, Link as LinkIcon } from 'lucide-react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: string, meetingLink?: string) => void;
}

export function ScheduleModal({ isOpen, onClose, onSchedule }: ScheduleModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const handleSubmit = () => {
    if (!date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    onSchedule(scheduledAt, meetingLink || undefined);
    setDate('');
    setTime('');
    setMeetingLink('');
    onClose();
  };

  // Minimum date is tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Coffee Chat" size="sm">
      <div className="space-y-4 py-2">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            <Calendar className="w-4 h-4 inline mr-1.5" />
            date
          </label>
          <input
            type="date"
            value={date}
            min={minDateStr}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            time
          </label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            <LinkIcon className="w-4 h-4 inline mr-1.5" />
            meeting link (optional)
          </label>
          <input
            type="url"
            value={meetingLink}
            onChange={e => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!date || !time}>
          Schedule Chat
        </Button>
      </ModalFooter>
    </Modal>
  );
}
