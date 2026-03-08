interface PersonalityPolygonProps {
  scores: number[]; // 5 OCEAN values 0-100
  size?: number;
  color?: string;
}

export function PersonalityPolygon({
  scores,
  size = 28,
  color = 'var(--color-accent)',
}: PersonalityPolygonProps) {
  if (scores.length < 5) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 2;

  // Generate 5 pentagon vertices
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Outer pentagon (background)
  const outerPoints = Array.from({ length: 5 }, (_, i) => {
    const p = getPoint(i, 100);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Data polygon
  const dataPoints = scores.map((score, i) => {
    const p = getPoint(i, score);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
    >
      <defs>
        <filter id={`polyGlow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer frame */}
      <polygon
        points={outerPoints}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={0.5}
      />
      {/* Data shape */}
      <polygon
        points={dataPoints}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={1}
        filter={`url(#polyGlow-${size})`}
      />
    </svg>
  );
}
