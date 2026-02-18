import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RadarChartProps {
  scores: Record<string, number>;
  labels?: Record<string, string>;
  colors?: Record<string, string>;
  size?: number;
  animated?: boolean;
  showLabels?: boolean;
  onDimensionClick?: (key: string) => void;
  selectedDimension?: string | null;
}

const DEFAULT_COLORS: Record<string, string> = {
  openness: '#8B5CF6',
  conscientiousness: '#10B981',
  extraversion: '#F59E0B',
  agreeableness: '#EC4899',
  neuroticism: '#06B6D4',
};

const DEFAULT_LABELS: Record<string, string> = {
  openness: 'Openness',
  conscientiousness: 'Conscientiousness',
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  neuroticism: 'Stability',
};

export function RadarChart({
  scores,
  labels = DEFAULT_LABELS,
  colors = DEFAULT_COLORS,
  size = 300,
  animated = true,
  showLabels = true,
  onDimensionClick,
  selectedDimension,
}: RadarChartProps) {
  const [isVisible, setIsVisible] = useState(!animated);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  const keys = Object.keys(scores);
  const count = keys.length;
  const center = size / 2;
  const radius = size * 0.35;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getAxisEnd = (index: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const getLabelPos = (index: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const labelRadius = radius + 30;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  // Build polygon path for the data
  const dataPoints = keys.map((key, i) => getPoint(i, isVisible ? scores[key] : 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Grid rings
  const rings = [20, 40, 60, 80, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full mx-auto" style={{ maxWidth: `${size}px` }}>
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((ring) => {
        const ringPoints = keys.map((_, i) => getPoint(i, ring));
        const ringPath = ringPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return (
          <path
            key={ring}
            d={ringPath}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1"
            opacity={0.3}
          />
        );
      })}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const end = getAxisEnd(i);
        return (
          <line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={end.x}
            y2={end.y}
            stroke="var(--color-border)"
            strokeWidth="1"
            opacity={0.3}
          />
        );
      })}

      {/* Data polygon */}
      <motion.path
        d={dataPath}
        fill="url(#radarFill)"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        initial={animated ? { opacity: 0 } : undefined}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Data points */}
      {keys.map((key, i) => {
        const point = getPoint(i, isVisible ? scores[key] : 0);
        const isSelected = selectedDimension === key;
        const color = colors[key] || 'var(--color-accent)';

        return (
          <g
            key={`point-${key}`}
            onClick={() => onDimensionClick?.(key)}
            className={onDimensionClick ? 'cursor-pointer' : undefined}
          >
            {isSelected && (
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill={color}
                opacity={0.2}
              />
            )}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={isSelected ? 6 : 4.5}
              fill={color}
              stroke="var(--color-surface)"
              strokeWidth="2"
              initial={animated ? { scale: 0 } : undefined}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.3, type: 'spring' }}
            />
          </g>
        );
      })}

      {/* Labels */}
      {showLabels && keys.map((key, i) => {
        const pos = getLabelPos(i);
        const color = colors[key] || 'var(--color-textSecondary)';
        const isSelected = selectedDimension === key;

        return (
          <g
            key={`label-${key}`}
            onClick={() => onDimensionClick?.(key)}
            className={onDimensionClick ? 'cursor-pointer' : undefined}
          >
            <text
              x={pos.x}
              y={pos.y - 8}
              textAnchor="middle"
              fill={isSelected ? color : 'var(--color-textSecondary)'}
              fontSize="11"
              fontWeight={isSelected ? '600' : '500'}
            >
              {labels[key] || key}
            </text>
            <text
              x={pos.x}
              y={pos.y + 6}
              textAnchor="middle"
              fill={color}
              fontSize="13"
              fontWeight="700"
            >
              {scores[key]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
