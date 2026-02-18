import { motion } from 'framer-motion';

interface OceanMindMapProps {
  scores: Record<string, number>;
  colors?: Record<string, string>;
  labels?: Record<string, string>;
  centerLabel?: string;
  centerSubLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  onDimensionClick?: (dimension: string) => void;
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
  openness: 'O',
  conscientiousness: 'C',
  extraversion: 'E',
  agreeableness: 'A',
  neuroticism: 'N',
};

const SIZE_CONFIG = {
  sm: { width: 200, height: 200, radius: 70, fontSize: 10, labelOffset: 15 },
  md: { width: 280, height: 280, radius: 100, fontSize: 12, labelOffset: 20 },
  lg: { width: 360, height: 360, radius: 130, fontSize: 14, labelOffset: 25 },
};

export function OceanMindMap({
  scores,
  colors = DEFAULT_COLORS,
  labels = DEFAULT_LABELS,
  centerLabel,
  centerSubLabel,
  size = 'md',
  animated = true,
  onDimensionClick,
  selectedDimension,
}: OceanMindMapProps) {
  const config = SIZE_CONFIG[size];
  const cx = config.width / 2;
  const cy = config.height / 2;
  const dimensions = Object.keys(scores);
  const numDimensions = dimensions.length;

  // Calculate points for polygon
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numDimensions - Math.PI / 2;
    const normalizedValue = (value / 100) * config.radius;
    const x = cx + normalizedValue * Math.cos(angle);
    const y = cy + normalizedValue * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points
  const polygonPoints = dimensions
    .map((dim, i) => {
      const point = getPoint(i, scores[dim] || 0);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // Generate grid circles
  const gridLevels = [25, 50, 75, 100];

  return (
    <svg width={config.width} height={config.height} viewBox={`0 0 ${config.width} ${config.height}`}>
      {/* Background grid circles */}
      {gridLevels.map((level) => (
        <circle
          key={level}
          cx={cx}
          cy={cy}
          r={(level / 100) * config.radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray={level === 100 ? 'none' : '2,2'}
          opacity={0.5}
        />
      ))}

      {/* Grid lines from center to each vertex */}
      {dimensions.map((_, i) => {
        const point = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={point.x}
            y2={point.y}
            stroke="var(--color-border)"
            strokeWidth="1"
            opacity={0.3}
          />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        points={polygonPoints}
        fill="var(--color-accent)"
        fillOpacity={0.2}
        stroke="var(--color-accent)"
        strokeWidth="2"
        initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {dimensions.map((dim, i) => {
        const point = getPoint(i, scores[dim] || 0);
        const color = colors[dim] || 'var(--color-accent)';
        return (
          <motion.circle
            key={dim}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={color}
            stroke="white"
            strokeWidth="2"
            initial={animated ? { opacity: 0, scale: 0 } : undefined}
            animate={animated ? { opacity: 1, scale: 1 } : undefined}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
          />
        );
      })}

      {/* Labels */}
      {dimensions.map((dim, i) => {
        const labelPoint = getPoint(i, 100 + config.labelOffset);
        const color = colors[dim] || 'var(--color-text)';
        const label = labels[dim] || dim.charAt(0).toUpperCase();
        const isSelected = selectedDimension === dim;
        return (
          <motion.text
            key={`label-${dim}`}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize={isSelected ? config.fontSize + 2 : config.fontSize}
            fontWeight={isSelected ? '700' : '600'}
            initial={animated ? { opacity: 0 } : undefined}
            animate={animated ? { opacity: 1 } : undefined}
            transition={{ delay: 0.5 + i * 0.05 }}
            style={{ cursor: onDimensionClick ? 'pointer' : 'default' }}
            onClick={() => onDimensionClick?.(dim)}
          >
            {label}
          </motion.text>
        );
      })}

      {/* Center label */}
      {centerLabel && (
        <g>
          <text
            x={cx}
            y={centerSubLabel ? cy - 6 : cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text)"
            fontSize={config.fontSize}
            fontWeight="700"
          >
            {centerLabel}
          </text>
          {centerSubLabel && (
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-textMuted)"
              fontSize={config.fontSize - 2}
            >
              {centerSubLabel}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
