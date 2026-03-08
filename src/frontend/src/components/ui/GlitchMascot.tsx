import { useEffect, useRef } from 'react';

interface GlitchMascotProps {
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const sizes = { sm: 48, md: 80, lg: 120 };

export function GlitchMascot({ size = 'md', interactive = false }: GlitchMascotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const leftEyeRef = useRef<SVGCircleElement>(null);
  const rightEyeRef = useRef<SVGCircleElement>(null);
  const headRef = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      if (svgRef.current && leftEyeRef.current && rightEyeRef.current && headRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (mouseRef.current.x - cx) / window.innerWidth;
        const dy = (mouseRef.current.y - cy) / window.innerHeight;
        const eyeShiftX = dx * 3;
        const eyeShiftY = dy * 2;
        const headRotate = dx * 5;

        leftEyeRef.current.setAttribute('cx', String(35 + eyeShiftX));
        leftEyeRef.current.setAttribute('cy', String(32 + eyeShiftY));
        rightEyeRef.current.setAttribute('cx', String(65 + eyeShiftX));
        rightEyeRef.current.setAttribute('cy', String(32 + eyeShiftY));
        headRef.current.style.transform = `rotate(${headRotate}deg)`;
        headRef.current.style.transformOrigin = '50px 30px';
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [interactive]);

  const px = sizes[size];

  return (
    <div className="glitch-mascot animate-float rounded-full" style={{ width: px, height: px }}>
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        width={px}
        height={px}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head - triangle */}
        <polygon
          ref={headRef}
          points="50,8 25,45 75,45"
          fill="var(--color-accent)"
          opacity="0.9"
        />
        {/* Eyes */}
        <circle ref={leftEyeRef} cx="35" cy="32" r="3.5" fill="var(--color-accentText)" />
        <circle ref={rightEyeRef} cx="65" cy="32" r="3.5" fill="var(--color-accentText)" />
        {/* Torso - rectangle */}
        <rect x="32" y="47" width="36" height="28" rx="4" fill="var(--color-accent)" opacity="0.7" />
        {/* Arms */}
        <line x1="32" y1="52" x2="16" y2="62" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="68" y1="52" x2="84" y2="62" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        {/* Legs */}
        <line x1="42" y1="75" x2="38" y2="92" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="58" y1="75" x2="62" y2="92" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        {/* Core glow */}
        <circle cx="50" cy="58" r="5" fill="var(--color-accentText)" opacity="0.3" />
      </svg>
    </div>
  );
}
