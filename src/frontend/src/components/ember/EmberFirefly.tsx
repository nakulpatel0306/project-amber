import { cn } from '../../utils/cn';

type Mood = 'neutral' | 'happy' | 'thinking' | 'excited';

interface EmberFireflyProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: Mood;
  animated?: boolean;
  className?: string;
}

const sizeMap = { sm: 40, md: 64, lg: 96, xl: 128 };

const glowIntensity: Record<Mood, { inner: number; outer: number }> = {
  neutral: { inner: 0.35, outer: 0.15 },
  happy: { inner: 0.6, outer: 0.3 },
  thinking: { inner: 0.2, outer: 0.1 },
  excited: { inner: 0.8, outer: 0.45 },
};

export function EmberFirefly({
  size = 'md',
  mood = 'neutral',
  animated = false,
  className,
}: EmberFireflyProps) {
  const px = sizeMap[size];
  const glow = glowIntensity[mood];

  const wingRotate = mood === 'happy' || mood === 'excited' ? -4 : 0;
  const wingAnimation =
    mood === 'excited'
      ? 'ember-wing-flutter'
      : mood === 'happy'
      ? 'ember-wing-flutter-slow'
      : '';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        animated && mood === 'thinking' && 'animate-pulse',
        className
      )}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 100 100"
        width={px}
        height={px}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={mood !== 'thinking' ? 'ember-glow' : 'ember-glow-dim'}
      >
        <defs>
          {/* Core glow */}
          <radialGradient id={`fg-${size}`} cx="50%" cy="58%" r="35%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity={glow.inner} />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity={glow.outer} />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          {/* Body gradient */}
          <linearGradient id={`fb-${size}`} x1="50%" y1="10%" x2="50%" y2="95%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Wing gradient */}
          <linearGradient id={`fw-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.12" />
          </linearGradient>

          {/* Accent line gradient */}
          <linearGradient id={`fc-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0" />
            <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient glow */}
        <ellipse cx="50" cy="56" rx="30" ry="28" fill={`url(#fg-${size})`} />

        {/* Left wing - angular / geometric */}
        <g
          className={wingAnimation}
          style={{
            transformOrigin: '40px 40px',
            transform: `rotate(${wingRotate}deg)`,
          }}
        >
          <path
            d="M40 38 L18 26 L14 34 L22 42 L40 44 Z"
            fill={`url(#fw-${size})`}
            stroke="#F59E0B"
            strokeWidth="0.4"
            strokeOpacity="0.5"
          />
          {/* Circuit traces */}
          <path
            d="M36 39 L26 33 M28 35 L22 38 L18 34"
            stroke="#FBBF24"
            strokeWidth="0.4"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          <circle cx="26" cy="33" r="0.7" fill="#FBBF24" fillOpacity="0.5" />
          <circle cx="18" cy="34" r="0.7" fill="#FBBF24" fillOpacity="0.5" />
          <rect x="20" y="36" width="2" height="1" rx="0.5" fill="#FBBF24" fillOpacity="0.3" />
        </g>

        {/* Right wing - angular / geometric */}
        <g
          className={wingAnimation}
          style={{
            transformOrigin: '60px 40px',
            transform: `rotate(${-wingRotate}deg)`,
            animationDelay: '0.1s',
          }}
        >
          <path
            d="M60 38 L82 26 L86 34 L78 42 L60 44 Z"
            fill={`url(#fw-${size})`}
            stroke="#F59E0B"
            strokeWidth="0.4"
            strokeOpacity="0.5"
          />
          {/* Circuit traces */}
          <path
            d="M64 39 L74 33 M72 35 L78 38 L82 34"
            stroke="#FBBF24"
            strokeWidth="0.4"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          <circle cx="74" cy="33" r="0.7" fill="#FBBF24" fillOpacity="0.5" />
          <circle cx="82" cy="34" r="0.7" fill="#FBBF24" fillOpacity="0.5" />
          <rect x="78" y="36" width="2" height="1" rx="0.5" fill="#FBBF24" fillOpacity="0.3" />
        </g>

        {/* Body - sleek elongated hexagonal shape */}
        <path
          d="M50 28 L62 38 L60 58 L54 72 L46 72 L40 58 L38 38 Z"
          fill={`url(#fb-${size})`}
        />

        {/* Body circuit lines */}
        <path
          d="M50 34 L50 48 M46 40 L54 40 M44 50 L56 50"
          stroke="#FDE68A"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />

        {/* Head - angular diamond/shield */}
        <path
          d="M50 18 L60 30 L56 36 L50 38 L44 36 L40 30 Z"
          fill="#FBBF24"
        />

        {/* Antennae - sharp, angular */}
        <path
          d="M44 24 L38 14 L35 12"
          stroke="#D97706"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M35 12 L33 10"
          stroke="#FBBF24"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <rect x="31.5" y="8.5" width="3" height="3" rx="0.5" fill="#FBBF24" transform="rotate(45, 33, 10)" />

        <path
          d="M56 24 L62 14 L65 12"
          stroke="#D97706"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M65 12 L67 10"
          stroke="#FBBF24"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <rect x="65.5" y="8.5" width="3" height="3" rx="0.5" fill="#FBBF24" transform="rotate(45, 67, 10)" />

        {/* Core energy - abdomen glow */}
        <path
          d="M46 54 L50 50 L54 54 L52 62 L48 62 Z"
          fill="#FDE68A"
          fillOpacity={mood === 'excited' ? '0.7' : '0.4'}
          className={mood === 'excited' ? 'ember-glow-rapid' : ''}
        />

        {/* Tail segment lines */}
        <path
          d="M44 62 L56 62 M45 66 L55 66 M47 70 L53 70"
          stroke="#92400E"
          strokeWidth="0.6"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />

        {/* Bottom point */}
        <path
          d="M48 72 L50 78 L52 72"
          fill="#B45309"
        />
      </svg>
    </div>
  );
}
