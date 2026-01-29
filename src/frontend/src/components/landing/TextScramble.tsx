import { useEffect, useState, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  speed?: number;
}

const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function TextScramble({
  text,
  className = '',
  style,
  delay = 0,
  speed = 30,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text.split('').map(() => ' ').join(''));
  const [isComplete, setIsComplete] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const timeout = setTimeout(() => {
      let iteration = 0;
      const maxIterations = text.length * 3;

      const interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration / 3) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        iteration++;

        if (iteration >= maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay, speed]);

  return (
    <span
      className={`${className} font-mono ${isComplete ? '' : 'opacity-80'}`}
      style={style}
    >
      {displayText}
    </span>
  );
}
