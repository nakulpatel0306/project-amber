import { ArrowRight, RefreshCw, Search, TrendingUp, HelpCircle, Sparkles } from 'lucide-react';
import { EmberFirefly } from '../ember/EmberFirefly';
import { CoffeeChatData } from './CoffeeChatCard';

interface CoffeeChatFollowUpProps {
  chat: CoffeeChatData;
}

interface FollowUpConfig {
  header: string;
  subheader: string;
  suggestions: { text: string; icon: React.ReactNode }[];
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

function getFollowUpConfig(rating: number): FollowUpConfig {
  if (rating >= 4) {
    return {
      header: 'Strong Connection',
      subheader: 'Next Steps',
      suggestions: [
        {
          text: 'Consider moving to a formal interview',
          icon: <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />,
        },
        {
          text: 'Schedule a follow-up to discuss the role in depth',
          icon: <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />,
        },
        {
          text: 'Share this match with your hiring team',
          icon: <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />,
        },
      ],
      accentColor: 'var(--color-success)',
      bgColor: 'rgba(22, 163, 74, 0.05)',
      borderColor: 'rgba(22, 163, 74, 0.2)',
    };
  }

  if (rating === 3) {
    return {
      header: 'Worth Another Look',
      subheader: 'Consider These Factors',
      suggestions: [
        {
          text: 'Reflect on what aspects felt aligned',
          icon: <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />,
        },
        {
          text: 'Think about whether the gaps are dealbreakers',
          icon: <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />,
        },
        {
          text: 'A second conversation might reveal more',
          icon: <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />,
        },
      ],
      accentColor: 'var(--color-warning)',
      bgColor: 'rgba(245, 158, 11, 0.05)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
    };
  }

  return {
    header: 'Other Options',
    subheader: 'Explore These Instead',
    suggestions: [
      {
        text: 'Check your other high-scoring matches',
        icon: <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />,
      },
      {
        text: 'Consider what made this one feel off',
        icon: <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />,
      },
      {
        text: 'Sometimes personality differences become strengths over time',
        icon: <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />,
      },
    ],
    accentColor: 'var(--color-textMuted)',
    bgColor: 'rgba(120, 113, 108, 0.05)',
    borderColor: 'rgba(120, 113, 108, 0.15)',
  };
}

export function CoffeeChatFollowUp({ chat }: CoffeeChatFollowUpProps) {
  if (chat.status !== 'completed' || chat.rating == null) {
    return null;
  }

  const config = getFollowUpConfig(chat.rating);

  return (
    <div
      className="mt-2 bento-card overflow-hidden relative"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      {/* EmberFirefly in corner */}
      <div className="absolute top-3 right-3 opacity-60">
        <EmberFirefly size="sm" mood="happy" />
      </div>

      <div className="p-4">
        <h4
          className="text-base font-bold mb-0.5"
          style={{ color: config.accentColor }}
        >
          {config.header}
        </h4>
        <p
          className="text-xs mb-3"
          style={{ color: 'var(--color-textMuted)' }}
        >
          {config.subheader}
        </p>

        <ul className="space-y-2">
          {config.suggestions.map((suggestion, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 mt-0.5">{suggestion.icon}</span>
              <span style={{ color: 'var(--color-textSecondary)' }}>
                {suggestion.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
