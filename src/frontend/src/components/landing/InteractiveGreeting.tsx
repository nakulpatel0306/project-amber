import { useState, useEffect } from 'react';

function getGreeting(): { greeting: string; emoji: string; subtext: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'good morning',
      emoji: '☀️',
      subtext: 'grab a coffee and find your dream job',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'good afternoon',
      emoji: '🌤️',
      subtext: "perfect time to explore new opportunities",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: 'good evening',
      emoji: '🌅',
      subtext: 'wind down with some career browsing',
    };
  } else {
    return {
      greeting: 'burning the midnight oil?',
      emoji: '🌙',
      subtext: "the best ideas come late at night",
    };
  }
}

export function InteractiveGreeting() {
  const [greetingData, setGreetingData] = useState(getGreeting);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreetingData(getGreeting());
    }, 60000);

    // Animate in
    setTimeout(() => setIsVisible(true), 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <span className="text-lg">{greetingData.emoji}</span>
      <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
        {greetingData.greeting} — {greetingData.subtext}
      </span>
    </div>
  );
}
