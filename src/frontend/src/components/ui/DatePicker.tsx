import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore } from 'date-fns';

interface DatePickerProps {
  selectedDates: Date[];
  onChange: (dates: Date[]) => void;
  minDate?: Date;
  maxSelections?: number;
}

export function DatePicker({
  selectedDates,
  onChange,
  minDate = new Date(),
  maxSelections = 5
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const daysArray: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      daysArray.push(day);
      day = addDays(day, 1);
    }
    return daysArray;
  }, [currentMonth]);

  const isSelected = (day: Date) => selectedDates.some(d => isSameDay(d, day));

  const isDisabled = (day: Date) => {
    if (isBefore(day, minDate) && !isSameDay(day, minDate)) return true;
    return false;
  };

  const handleDateClick = (day: Date) => {
    if (isDisabled(day)) return;

    if (isSelected(day)) {
      onChange(selectedDates.filter(d => !isSameDay(d, day)));
    } else if (selectedDates.length < maxSelections) {
      onChange([...selectedDates, day].sort((a, b) => a.getTime() - b.getTime()));
    }
  };

  const removeDate = (day: Date) => {
    onChange(selectedDates.filter(d => !isSameDay(d, day)));
  };

  return (
    <div>
      {/* Selected dates chips */}
      {selectedDates.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selectedDates.map((date, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              {format(date, 'MMM d')}
              <button
                type="button"
                onClick={() => removeDate(date)}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded-lg hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded-lg hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div
            key={day}
            className="text-center text-[10px] font-medium py-1"
            style={{ color: 'var(--color-textMuted)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          const inCurrentMonth = isSameMonth(day, currentMonth);
          const selected = isSelected(day);
          const disabled = isDisabled(day);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={`
                aspect-square flex items-center justify-center text-xs rounded-lg transition-all
                ${!inCurrentMonth ? 'opacity-30' : ''}
                ${disabled ? 'cursor-not-allowed opacity-30' : 'hover:opacity-80'}
                ${selected ? 'font-semibold' : ''}
              `}
              style={{
                backgroundColor: selected ? 'var(--color-accent)' : 'transparent',
                color: selected ? 'white' : 'var(--color-text)',
              }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--color-textMuted)' }}>
        Select up to {maxSelections} preferred dates ({selectedDates.length}/{maxSelections})
      </p>
    </div>
  );
}
