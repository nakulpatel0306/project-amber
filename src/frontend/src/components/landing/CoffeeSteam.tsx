export function CoffeeSteam() {
  return (
    <div className="coffee-steam-container">
      <div className="steam steam-1" />
      <div className="steam steam-2" />
      <div className="steam steam-3" />
    </div>
  );
}

export function FloatingCoffeeBeans() {
  const beans = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10,
    size: 12 + Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {beans.map(bean => (
        <div
          key={bean.id}
          className="absolute animate-float-bean opacity-20"
          style={{
            left: `${bean.left}%`,
            bottom: '-50px',
            animationDelay: `${bean.delay}s`,
            animationDuration: `${bean.duration}s`,
          }}
        >
          <svg
            width={bean.size}
            height={bean.size * 1.4}
            viewBox="0 0 20 28"
            fill="var(--color-accent)"
          >
            <ellipse cx="10" cy="14" rx="9" ry="13" />
            <path
              d="M10 3 C8 8, 8 20, 10 25"
              stroke="var(--color-background)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
