import { useState, useMemo } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function generateChartData(baseMatches: number, baseRequests: number) {
  let seed = baseMatches * 13 + baseRequests * 7 + 99;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const matches: number[] = [];

  for (let i = 0; i < 7; i++) {
    const matchBase = baseMatches * (0.6 + rand() * 0.8);
    matches.push(Math.round(Math.max(0, matchBase)));
  }

  return { matches };
}

interface MatchFlowChartProps {
  matchesAvailable: number;
  avgMatchScore: number;
}

export function MatchFlowChart({ matchesAvailable, avgMatchScore }: MatchFlowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { matches } = useMemo(
    () => generateChartData(matchesAvailable, matchesAvailable * 2),
    [matchesAvailable]
  );

  const maxVal = Math.max(...matches, 1);

  const width = 500;
  const height = 200;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 24;
  const padBottom = 28;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const barWidth = chartW / DAYS.length * 0.6;
  const barGap = chartW / DAYS.length;

  const getBarX = (i: number) => padLeft + i * barGap + (barGap - barWidth) / 2;
  const getBarHeight = (v: number) => (v / maxVal) * chartH;

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const val = pct * maxVal;
    const y = padTop + chartH - (pct * chartH);
    return { y, label: Math.round(val) };
  });

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Match Flow
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-accent)' }} />
          <span
            className="text-[10px] uppercase tracking-wider font-medium"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Active Matches
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: 360 }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={width - padRight}
                y2={tick.y}
                stroke="var(--color-border)"
                strokeWidth={0.5}
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 6}
                y={tick.y + 3}
                textAnchor="end"
                fill="var(--color-textMuted)"
                fontSize={9}
                fontFamily="Inter, sans-serif"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {DAYS.map((day, i) => (
            <text
              key={day}
              x={getBarX(i) + barWidth / 2}
              y={height - 4}
              textAnchor="middle"
              fill="var(--color-textMuted)"
              fontSize={9}
              fontFamily="Inter, sans-serif"
            >
              {day}
            </text>
          ))}

          {/* Bars */}
          {matches.map((v, i) => {
            const barH = getBarHeight(v);
            const x = getBarX(i);
            const y = padTop + chartH - barH;
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Invisible hover zone */}
                <rect
                  x={padLeft + i * barGap}
                  y={padTop}
                  width={barGap}
                  height={chartH}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                />

                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(0, barH)}
                  rx={barWidth / 2}
                  ry={barWidth / 2}
                  fill="var(--color-accent)"
                  opacity={isHovered ? 1 : 0.75}
                  className="transition-opacity"
                />

                {/* Value label above bar */}
                {isHovered && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fill="var(--color-accent)"
                    fontSize={11}
                    fontWeight={700}
                    fontFamily="Inter, sans-serif"
                  >
                    {v}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hover tooltip */}
          {hoveredIndex !== null && (
            <g>
              <rect
                x={Math.min(Math.max(getBarX(hoveredIndex) - 40, padLeft), width - padRight - 90)}
                y={Math.max(padTop, padTop + chartH - getBarHeight(matches[hoveredIndex]) - 50)}
                width={90}
                height={36}
                rx={6}
                fill="var(--color-surface)"
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={Math.min(Math.max(getBarX(hoveredIndex) - 32, padLeft + 8), width - padRight - 82)}
                y={Math.max(padTop + 16, padTop + chartH - getBarHeight(matches[hoveredIndex]) - 32)}
                fill="var(--color-accent)"
                fontSize={12}
                fontWeight={700}
                fontFamily="Inter, sans-serif"
              >
                {matches[hoveredIndex]} matches
              </text>
              <text
                x={Math.min(Math.max(getBarX(hoveredIndex) - 32, padLeft + 8), width - padRight - 82)}
                y={Math.max(padTop + 28, padTop + chartH - getBarHeight(matches[hoveredIndex]) - 20)}
                fill="var(--color-textMuted)"
                fontSize={9}
                fontFamily="Inter, sans-serif"
              >
                Score: {avgMatchScore}%
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
