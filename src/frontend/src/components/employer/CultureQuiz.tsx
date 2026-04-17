import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: {
    value: string;
    label: string;
    description: string;
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'work-style',
    category: 'work style',
    question: 'how would you describe your team\'s work style?',
    options: [
      { value: 'structured', label: 'structured & planned', description: 'clear processes, defined roles, predictable schedules' },
      { value: 'flexible', label: 'flexible & adaptive', description: 'agile approach, shifting priorities, autonomy in methods' },
      { value: 'collaborative', label: 'highly collaborative', description: 'lots of meetings, pair work, group decisions' },
      { value: 'independent', label: 'independent & focused', description: 'deep work time, minimal meetings, async communication' },
    ],
  },
  {
    id: 'communication',
    category: 'communication',
    question: 'what\'s your preferred communication style?',
    options: [
      { value: 'sync', label: 'real-time & synchronous', description: 'quick calls, instant messaging, immediate responses' },
      { value: 'async', label: 'asynchronous first', description: 'thoughtful docs, scheduled meetings, flexible response times' },
      { value: 'formal', label: 'formal & documented', description: 'written records, clear chains, structured updates' },
      { value: 'casual', label: 'casual & open', description: 'informal chats, open door policy, spontaneous discussions' },
    ],
  },
  {
    id: 'decision-making',
    category: 'decision making',
    question: 'how are decisions typically made?',
    options: [
      { value: 'consensus', label: 'team consensus', description: 'everyone has input, decisions made together' },
      { value: 'leadership', label: 'leadership driven', description: 'managers decide, team executes' },
      { value: 'data', label: 'data informed', description: 'metrics and analysis drive choices' },
      { value: 'expert', label: 'expert ownership', description: 'domain experts make calls in their area' },
    ],
  },
  {
    id: 'growth',
    category: 'growth & learning',
    question: 'how do you support employee growth?',
    options: [
      { value: 'mentorship', label: 'mentorship focused', description: 'senior guidance, 1:1 coaching, shadowing' },
      { value: 'self-directed', label: 'self-directed learning', description: 'learning budgets, time for exploration, choose your path' },
      { value: 'structured', label: 'structured programs', description: 'defined tracks, certifications, formal training' },
      { value: 'experiential', label: 'learn by doing', description: 'stretch assignments, new challenges, fail-fast culture' },
    ],
  },
  {
    id: 'feedback',
    category: 'feedback culture',
    question: 'how does feedback flow in your organization?',
    options: [
      { value: 'continuous', label: 'continuous & informal', description: 'real-time feedback, casual check-ins' },
      { value: 'scheduled', label: 'scheduled reviews', description: 'quarterly or annual formal reviews' },
      { value: 'peer', label: 'peer-driven', description: '360 feedback, team retrospectives' },
      { value: 'metrics', label: 'metrics based', description: 'OKRs, KPIs, performance dashboards' },
    ],
  },
  {
    id: 'values',
    category: 'core values',
    question: 'which value resonates most with your culture?',
    options: [
      { value: 'innovation', label: 'innovation & creativity', description: 'pushing boundaries, trying new things' },
      { value: 'reliability', label: 'reliability & trust', description: 'consistency, dependability, keeping promises' },
      { value: 'speed', label: 'speed & agility', description: 'moving fast, iterating quickly, bias for action' },
      { value: 'quality', label: 'quality & excellence', description: 'high standards, attention to detail, craftsmanship' },
    ],
  },
  {
    id: 'work-life',
    category: 'work-life balance',
    question: 'what\'s your approach to work-life balance?',
    options: [
      { value: 'flexible', label: 'highly flexible', description: 'work when you want, unlimited PTO, trust-based' },
      { value: 'balanced', label: 'structured balance', description: 'clear hours, protected time off, boundaries respected' },
      { value: 'intensive', label: 'intensive periods', description: 'crunch times exist but are followed by recovery' },
      { value: 'integrated', label: 'work-life integration', description: 'blur between work and life, always connected but flexible' },
    ],
  },
  {
    id: 'team-dynamic',
    category: 'team dynamics',
    question: 'how would you describe your team dynamics?',
    options: [
      { value: 'competitive', label: 'friendly competition', description: 'leaderboards, recognition, healthy rivalry' },
      { value: 'supportive', label: 'deeply supportive', description: 'help each other, celebrate together, no blame' },
      { value: 'professional', label: 'professionally friendly', description: 'respectful, cordial, work-focused relationships' },
      { value: 'social', label: 'close-knit social', description: 'friendships, team outings, personal connections' },
    ],
  },
];

type QuizState = 'intro' | 'questions' | 'saving' | 'complete';

export function CultureQuiz() {
  const navigate = useNavigate();
  const [state, setState] = useState<QuizState>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = quizQuestions[currentIndex];
  const progress = ((currentIndex + 1) / quizQuestions.length) * 100;
  const isComplete = Object.keys(answers).length === quizQuestions.length;

  const handleSelectAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (isComplete) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setState('saving');
    // TODO: Save to API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setState('complete');
  };

  // Intro screen
  if (state === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="w-full max-w-lg text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-accent)',
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.25)',
            }}
          >
            <Building2 className="w-8 h-8 text-white" />
          </div>

          <h1
            className="text-2xl font-semibold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            Define Your Company Culture
          </h1>
          <p
            className="text-base mb-8"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Answer 8 questions to help us match you with candidates who'll thrive in your environment
          </p>

          <div
            className="bento-card p-6 mb-8 text-left"
          >
            <h3
              className="text-sm font-medium mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              What You'll Define:
            </h3>
            <div className="space-y-3">
              {['work style', 'communication preferences', 'decision making', 'growth & learning', 'feedback culture', 'core values', 'work-life balance', 'team dynamics'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Check className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setState('questions')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            size="lg"
          >
            Start Quiz
          </Button>

          <p
            className="text-xs mt-4"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Takes about 3 minutes
          </p>
        </div>
      </div>
    );
  }

  // Saving screen
  if (state === 'saving') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="text-center">
          <Loader2
            className="w-12 h-12 mx-auto mb-6 animate-spin"
            style={{ color: 'var(--color-accent)' }}
          />
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Saving Your Culture Profile...
          </h2>
          <p
            className="text-sm"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Analyzing your preferences
          </p>
        </div>
      </div>
    );
  }

  // Complete screen
  if (state === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="w-full max-w-lg text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-success)',
            }}
          >
            <Check className="w-10 h-10 text-white" />
          </div>

          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Culture Profile Complete!
          </h2>
          <p
            className="text-sm mb-8"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            We'll now use this to match you with candidates who fit your culture
          </p>

          <div
            className="bento-card p-6 mb-8"
          >
            <h3
              className="text-sm font-medium mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Your Culture Highlights
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(answers).slice(0, 4).map(([key, value]) => (
                <span
                  key={key}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {value}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/app/employer')}
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/app/employer/roles/new')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Your First Role
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Questions screen
  return (
    <div className="flex flex-col min-h-full">
      {/* Progress header */}
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {currentQuestion.category}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {currentIndex + 1} of {quizQuestions.length}
            </span>
          </div>

          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {quizQuestions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: answers[q.id]
                    ? 'var(--color-accent)'
                    : i === currentIndex
                    ? 'var(--color-accentHover)'
                    : 'var(--color-border)',
                  transform: i === currentIndex ? 'scale(1.25)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <h2
            className="text-xl font-medium mb-8 text-center"
            style={{ color: 'var(--color-text)' }}
          >
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.value)}
                  className="w-full p-4 rounded-xl border text-left transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(217, 119, 6, 0.1)'
                      : 'var(--color-surface)',
                    borderColor: isSelected
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                      style={{
                        borderColor: isSelected
                          ? 'var(--color-accent)'
                          : 'var(--color-border)',
                        backgroundColor: isSelected
                          ? 'var(--color-accent)'
                          : 'transparent',
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium mb-0.5"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {option.label}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div
        className="px-6 py-4 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentIndex === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {currentIndex === quizQuestions.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
