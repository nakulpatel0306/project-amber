import { useMemo } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];

function generateHeatmapData(matchCount: number): number[][] {
  // Seed-based pseudorandom for consistency
  let seed = matchCount * 17 + 42;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  return DAYS.map((_, dayIdx) => {
    return HOURS.map((_, hourIdx) => {
      // Higher density during business hours Tue-Thu, 10am-2pm
      let base = rand() * 0.4;
      if (dayIdx >= 1 && dayIdx <= 3) base += 0.2;
      if (hourIdx >= 1 && hourIdx <= 4) base += 0.2;
      if (dayIdx >= 1 && dayIdx <= 3 && hourIdx >= 1 && hourIdx <= 4) base += 0.15;
      // Weekend drop
      if (dayIdx >= 5) base *= 0.3;
      return Math.min(1, Math.max(0, base));
    });
  });
}

function getCellColor(value: number): string {
  if (value < 0.2) return 'rgba(240, 144, 48, 0.05)';
  if (value < 0.4) return 'rgba(240, 144, 48, 0.15)';
  if (value < 0.6) return 'rgba(240, 144, 48, 0.3)';
  if (value < 0.8) return 'rgba(240, 144, 48, 0.55)';
  return 'rgba(240, 144, 48, 0.85)';
}

interface ChatHeatmapProps {
  matchCount?: number;
}

export function ChatHeatmap({ matchCount = 0 }: ChatHeatmapProps) {
  const data = useMemo(() => generateHeatmapData(matchCount), [matchCount]);

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Optimal Chat Slots
        </h3>
        <div className="flex items-center gap-3">
          {[
            { label: 'Available', opacity: 0.15 },
            { label: 'Acceptable', opacity: 0.4 },
            { label: 'Ideal', opacity: 0.85 },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: `rgba(240, 144, 48, ${item.opacity})` }}
              />
              <span
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Column headers (hours) */}
          <div className="flex mb-1" style={{ paddingLeft: 36 }}>
            {HOURS.map(hour => (
              <div
                key={hour}
                className="flex-1 text-center text-[10px] font-medium"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <span
                className="w-8 text-[10px] font-medium text-right flex-shrink-0"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {day}
              </span>
              <div className="flex flex-1 gap-1">
                {data[dayIdx].map((value, hourIdx) => (
                  <div
                    key={hourIdx}
                    className="flex-1 aspect-square rounded-md transition-colors"
                    style={{
                      backgroundColor: getCellColor(value),
                      minHeight: 24,
                    }}
                    title={`${day} ${HOURS[hourIdx]}: ${Math.round(value * 100)}% match density`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
