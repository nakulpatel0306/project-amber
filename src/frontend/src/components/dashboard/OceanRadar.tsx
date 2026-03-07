interface OceanRadarProps {
  scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

const DIMENSIONS = [
  { key: 'openness', label: 'O', fullLabel: 'Openness' },
  { key: 'conscientiousness', label: 'C', fullLabel: 'Conscientiousness' },
  { key: 'extraversion', label: 'E', fullLabel: 'Extraversion' },
  { key: 'agreeableness', label: 'A', fullLabel: 'Agreeableness' },
  { key: 'neuroticism', label: 'N', fullLabel: 'Stability' },
] as const;

export function OceanRadar({ scores }: OceanRadarProps) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 80;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [25, 50, 75, 100];

  const values = [
    scores.openness,
    scores.conscientiousness,
    scores.extraversion,
    scores.agreeableness,
    100 - scores.neuroticism, // Show as Stability
  ];

  const dataPoints = values.map((v, i) => getPoint(i, v));

  return (
    <div className="bento-card">
      <h3
        className="text-sm font-semibold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        OCEAN Profile
      </h3>

      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid rings */}
          {rings.map(pct => {
            const ringPoints = Array.from({ length: 5 }, (_, i) => {
              const p = getPoint(i, pct);
              return `${p.x},${p.y}`;
            }).join(' ');
            return (
              <polygon
                key={pct}
                points={ringPoints}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={0.5}
                opacity={pct === 100 ? 0.6 : 0.3}
              />
            );
          })}

          {/* Axis lines */}
          {Array.from({ length: 5 }, (_, i) => {
            const p = getPoint(i, 100);
            return (
              <line
                key={i}
                x1={cx} y1={cy}
                x2={p.x} y2={p.y}
                stroke="var(--color-border)"
                strokeWidth={0.5}
                opacity={0.3}
              />
            );
          })}

          {/* Data shape */}
          <polygon
            points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(240, 144, 48, 0.12)"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            filter="url(#radarGlow)"
          />

          {/* Data dots */}
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x} cy={p.y}
              r={3}
              fill="var(--color-accent)"
            />
          ))}

          {/* Labels */}
          {DIMENSIONS.map((dim, i) => {
            const p = getPoint(i, 115);
            return (
              <text
                key={dim.key}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-textMuted)"
                fontSize={9}
                fontWeight={600}
                fontFamily="Inter, sans-serif"
              >
                {dim.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Dimension scores */}
      <div className="grid grid-cols-5 gap-1 mt-1">
        {DIMENSIONS.map((dim, i) => (
          <div key={dim.key} className="text-center">
            <p className="text-[10px] font-medium" style={{ color: 'var(--color-textMuted)' }}>
              {dim.fullLabel}
            </p>
            <p className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
              {values[i]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
