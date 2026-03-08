import { useNavigate } from 'react-router-dom';
import { Lightbulb, ArrowRight, ClipboardCheck, MessageCircle, Flame, Users } from 'lucide-react';

interface SmartSuggestionsProps {
  hasCompletedAssessment: boolean;
  pendingChats: number;
  matchesAvailable: number;
  connectionsCount: number;
}

export function SmartSuggestions({
  hasCompletedAssessment,
  pendingChats,
  matchesAvailable,
  connectionsCount,
}: SmartSuggestionsProps) {
  const navigate = useNavigate();

  const suggestions = [];

  if (!hasCompletedAssessment) {
    suggestions.push({
      icon: ClipboardCheck,
      text: 'Complete your personality assessment',
      action: () => navigate('/app/personality'),
      color: '#8B5CF6',
    });
  }

  if (pendingChats > 0) {
    suggestions.push({
      icon: MessageCircle,
      text: `Respond to ${pendingChats} pending chat${pendingChats > 1 ? 's' : ''}`,
      action: () => navigate('/app/chats'),
      color: '#F59E0B',
    });
  }

  if (matchesAvailable > 0 && hasCompletedAssessment) {
    suggestions.push({
      icon: Flame,
      text: `Browse ${matchesAvailable} available matches`,
      action: () => navigate('/app/ember'),
      color: '#EC4899',
    });
  }

  if (connectionsCount === 0) {
    suggestions.push({
      icon: Users,
      text: 'Start networking — explore the community',
      action: () => navigate('/app/network'),
      color: '#10B981',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      icon: Flame,
      text: 'Check your latest Ember matches',
      action: () => navigate('/app/ember'),
      color: '#EC4899',
    });
  }

  return (
    <div className="bento-card">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Smart Suggestions
        </h3>
      </div>
      <div className="space-y-2">
        {suggestions.slice(0, 3).map((s, i) => (
          <button
            key={i}
            onClick={s.action}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-[var(--color-surfaceHover)] text-left"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <span className="flex-1 text-xs font-medium" style={{ color: 'var(--color-text)' }}>
              {s.text}
            </span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
