import { motion } from 'framer-motion';

interface OceanMindMapProps {
  scores: Record<string, number>;
  labels?: Record<string, string>;
  colors?: Record<string, string>;
  centerLabel?: string;
  centerSubLabel?: string;
  onDimensionClick?: (key: string) => void;
  selectedDimension?: string | null;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const DEFAULT_COLORS: Record<string, string> = {
  openness: '#8B5CF6',
  conscientiousness: '#10B981',
  extraversion: '#F59E0B',
  agreeableness: '#EC4899',
  neuroticism: '#06B6D4',
};

const DEFAULT_LABELS: Record<string, string> = {
  openness: 'Open',
  conscientiousness: 'Conscient.',
  extraversion: 'Extrav.',
  agreeableness: 'Agree.',
  neuroticism: 'Stability',
};

const SIZE_CONFIG = {
  sm: { viewBox: '0 0 460 380', cx: 230, cy: 190, distance: 130, centerR: 48, connectorDist: 65 },
  md: { viewBox: '0 0 660 500', cx: 330, cy: 250, distance: 180, centerR: 65, connectorDist: 90 },
  lg: { viewBox: '0 0 660 500', cx: 330, cy: 250, distance: 180, centerR: 65, connectorDist: 90 },
};

export function OceanMindMap({
  scores,
  labels = DEFAULT_LABELS,
  colors = DEFAULT_COLORS,
  centerLabel = 'YOUR',
  centerSubLabel = 'OCEAN',
  onDimensionClick,
  selectedDimension,
  animated = true,
  size = 'md',
}: OceanMindMapProps) {
  const config = SIZE_CONFIG[size];
  const keys = Object.keys(scores);

  // Position nodes evenly around center
  const dimensions = keys.map((key, i) => {
    const angle = -90 + (i * 360) / keys.length;
    return { key, angle };
  });

  return (
    <svg viewBox={config.viewBox} className="w-full mx-auto" style={{ maxWidth: '600px' }}>
      <defs>
        <filter id="mindmap-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="mindmap-center-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      {dimensions.map(({ key, angle }) => {
        const radian = (angle * Math.PI) / 180;
        const score = scores[key] ?? 0;
        const color = colors[key] || '#8B5CF6';
        const isSelected = selectedDimension === key;
        const nodeRadius = 54 + (score / 100) * 10;

        const endX = config.cx + Math.cos(radian) * (config.distance - nodeRadius);
        const endY = config.cy + Math.sin(radian) * (config.distance - nodeRadius);
        const connectorX = config.cx + Math.cos(radian) * config.connectorDist;
        const connectorY = config.cy + Math.sin(radian) * config.connectorDist;

        return (
          <g key={`line-${key}`}>
            {animated ? (
              <motion.line
                x1={connectorX}
                y1={connectorY}
                x2={endX}
                y2={endY}
                stroke={isSelected ? color : 'var(--color-border)'}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={isSelected ? 'none' : '6 3'}
                opacity={isSelected ? 1 : 0.5}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isSelected ? 1 : 0.5 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            ) : (
              <line
                x1={connectorX}
                y1={connectorY}
                x2={endX}
                y2={endY}
                stroke={isSelected ? color : 'var(--color-border)'}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={isSelected ? 'none' : '6 3'}
                opacity={isSelected ? 1 : 0.5}
              />
            )}
            <circle
              cx={connectorX}
              cy={connectorY}
              r="6"
              fill={isSelected ? color : 'var(--color-border)'}
            />
          </g>
        );
      })}

      {/* Center circle */}
      {animated ? (
        <motion.circle
          cx={config.cx}
          cy={config.cy}
          r={config.centerR}
          fill="url(#mindmap-center-gradient)"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeDasharray="5 3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        />
      ) : (
        <circle
          cx={config.cx}
          cy={config.cy}
          r={config.centerR}
          fill="url(#mindmap-center-gradient)"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />
      )}
      <text
        x={config.cx}
        y={config.cy - 10}
        textAnchor="middle"
        fill="var(--color-accent)"
        fontSize="14"
        fontWeight="600"
      >
        {centerLabel}
      </text>
      <text
        x={config.cx}
        y={config.cy + 10}
        textAnchor="middle"
        fill="var(--color-textMuted)"
        fontSize="12"
      >
        {centerSubLabel}
      </text>

      {/* Dimension nodes */}
      {dimensions.map(({ key, angle }, i) => {
        const radian = (angle * Math.PI) / 180;
        const x = config.cx + Math.cos(radian) * config.distance;
        const y = config.cy + Math.sin(radian) * config.distance;
        const color = colors[key] || '#8B5CF6';
        const score = scores[key] ?? 0;
        const isSelected = selectedDimension === key;
        const nodeRadius = 54 + (score / 100) * 10;
        const label = labels[key] || key;

        const nodeContent = (
          <g
            onClick={() => onDimensionClick?.(key)}
            className={onDimensionClick ? 'cursor-pointer' : undefined}
          >
            {/* Selection glow */}
            {isSelected && (
              <circle
                cx={x}
                cy={y}
                r={nodeRadius + 10}
                fill="none"
                stroke={color}
                strokeWidth="3"
                opacity="0.4"
                filter="url(#mindmap-glow)"
              />
            )}

            {/* Node circle */}
            <circle
              cx={x}
              cy={y}
              r={nodeRadius}
              fill={`${color}${isSelected ? '30' : '18'}`}
              stroke={color}
              strokeWidth={isSelected ? 4 : 2.5}
              className="transition-all duration-300"
            />

            {/* Score */}
            <text
              x={x}
              y={y - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              fontSize="20"
              fontWeight="bold"
            >
              {Math.round(score)}
            </text>

            {/* Label */}
            <text
              x={x}
              y={y + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-textSecondary)"
              fontSize="11"
              fontWeight="500"
            >
              {label}
            </text>
          </g>
        );

        if (!animated) return <g key={`node-${key}`}>{nodeContent}</g>;

        return (
          <motion.g
            key={`node-${key}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4, type: 'spring' }}
          >
            {nodeContent}
          </motion.g>
        );
      })}
    </svg>
  );
}
