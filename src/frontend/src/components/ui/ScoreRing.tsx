import { getMatchColor } from '../../utils/matchHelpers';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  fontSize?: string;
}

export function ScoreRing({ score, size = 52, strokeWidth = 3, label, fontSize = 'text-xs' }: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getMatchColor(score);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${fontSize} font-bold`} style={{ color }}>{score}</span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] leading-tight" style={{ color: 'var(--color-textMuted)' }}>{label}</span>
      )}
    </div>
  );
}
