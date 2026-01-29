export function AnimatedBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large gradient blob - top right */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full animate-blob opacity-30"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Medium blob - bottom left */}
      <div
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full animate-blob animation-delay-2000 opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-accentHover) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Small accent blob - center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full animate-blob animation-delay-4000 opacity-10"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}
