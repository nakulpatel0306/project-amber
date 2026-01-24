import { ArrowRight, Coffee, Users, Sparkles, Heart } from 'lucide-react';

interface WelcomeScreenProps {
  onStartAssessment: () => void;
  onViewDashboard: () => void;
}

const features = [
  {
    title: 'culture assessment',
    description: 'answer 10 quick questions',
    icon: Sparkles,
  },
  {
    title: 'personality matching',
    description: 'find your ideal fit',
    icon: Heart,
  },
  {
    title: 'coffee chat',
    description: 'connect with startups',
    icon: Coffee,
  },
];

export function WelcomeScreen({ onStartAssessment, onViewDashboard }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      {/* hero section */}
      <div className="text-center mb-12">
        {/* logo and brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)',
            }}
          >
            <Coffee className="w-7 h-7 text-white" />
          </div>
        </div>

        <h1
          className="text-2xl font-semibold mb-2 tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          luna culturesync
        </h1>

        <p
          className="text-base max-w-md"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          find startups that match your work style and values
        </p>
      </div>

      {/* features */}
      <div className="w-full max-w-lg mb-10">
        <div className="grid grid-cols-3 gap-4">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="text-center p-4"
            >
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              >
                <Icon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              </div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                {title}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* cta buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={onStartAssessment}
          className="w-full py-4 rounded-xl text-sm font-medium btn-smooth flex items-center justify-center gap-2 group"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accentText)',
          }}
        >
          take the assessment
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          onClick={onViewDashboard}
          className="w-full py-4 rounded-xl text-sm font-medium btn-smooth flex items-center justify-center gap-2 border"
          style={{
            backgroundColor: 'transparent',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <Users className="w-4 h-4" />
          view candidate dashboard
        </button>
      </div>

      {/* footer hint */}
      <div className="mt-12">
        <p
          className="text-xs text-center"
          style={{ color: 'var(--color-textMuted)' }}
        >
          takes about 5 minutes · no signup required
        </p>
      </div>
    </div>
  );
}
