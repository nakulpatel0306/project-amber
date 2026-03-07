import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, MessageCircle, Sparkles, Coffee } from 'lucide-react';
import { Button } from '../ui/Button';

const TIPS = [
  { icon: Lightbulb, title: 'Lead with curiosity', desc: 'Ask specific questions about their work rather than generic ones.' },
  { icon: MessageCircle, title: "Share, don't pitch", desc: 'Talk about what excites you, not just your resume.' },
  { icon: Sparkles, title: 'End with next steps', desc: 'Suggest a concrete follow-up to keep the connection alive.' },
];

export function ChatPracticeWidget() {
  return (
    <div className="bento-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(217, 119, 6, 0.12)' }}
        >
          <Coffee className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        </div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Practice Coffee Chat
        </h3>
      </div>

      {/* Tips */}
      <div className="space-y-3 mb-4">
        {TIPS.map((tip) => (
          <div key={tip.title} className="flex items-start gap-2.5">
            <tip.icon
              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
              style={{ color: 'var(--color-accent)' }}
            />
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                {tip.title}
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link to="/app/practice">
        <Button
          size="sm"
          variant="ghost"
          rightIcon={<ArrowRight className="w-3 h-3" />}
          className="w-full justify-center"
        >
          Start Practicing
        </Button>
      </Link>
    </div>
  );
}
