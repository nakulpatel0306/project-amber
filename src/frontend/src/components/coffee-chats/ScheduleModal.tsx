import { useState, useEffect, useMemo } from 'react';
import { Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
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
  isBefore,
  format,
} from 'date-fns';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: string, meetingLink?: string) => void;
  initialDate?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ScheduleModal({ isOpen, onClose, onSchedule, initialDate }: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (initialDate) {
      const d = new Date(initialDate + 'T00:00:00');
      setSelectedDate(d);
      setCurrentMonth(d);
    }
  }, [initialDate]);

  // Build calendar grid
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

  const handleSubmit = () => {
    if (!selectedDate || !time) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const scheduledAt = new Date(`${dateStr}T${time}`).toISOString();
    onSchedule(scheduledAt, meetingLink || undefined);
    setSelectedDate(null);
    setTime('');
    setMeetingLink('');
    onClose();
  };

  const handleClose = () => {
    setSelectedDate(null);
    setTime('');
    setMeetingLink('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule Coffee Chat" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
        {/* Left: Calendar */}
        <div>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-textMuted)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-textMuted)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(day => (
              <div
                key={day}
                className="text-center text-[11px] font-medium py-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const inMonth = isSameMonth(day, currentMonth);
              const isPast = isBefore(day, today);
              const disabled = !inMonth || isPast;
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;
              const todayCell = isToday(day);

              return (
                <button
                  key={idx}
                  disabled={disabled}
                  onClick={() => !disabled && setSelectedDate(day)}
                  className="relative flex items-center justify-center py-2 rounded-lg text-sm transition-colors"
                  style={{
                    color: selected
                      ? 'white'
                      : disabled
                      ? 'var(--color-textMuted)'
                      : 'var(--color-text)',
                    backgroundColor: selected
                      ? 'var(--color-accent)'
                      : todayCell && inMonth
                      ? 'var(--color-surfaceHover)'
                      : 'transparent',
                    fontWeight: todayCell || selected ? 600 : 400,
                    opacity: disabled ? 0.35 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          {/* Selected date display */}
          <div
            className="mb-4 p-3 rounded-xl text-center"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            <p className="text-sm font-medium" style={{ color: selectedDate ? 'var(--color-text)' : 'var(--color-textMuted)' }}>
              {selectedDate
                ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                : 'Select a date on the calendar'}
            </p>
          </div>

          {/* Time input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
              Time
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

          {/* Meeting link input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
              <LinkIcon className="w-4 h-4 inline mr-1.5" />
              Meeting Link (optional)
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

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!selectedDate || !time}>
              Schedule Chat
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
