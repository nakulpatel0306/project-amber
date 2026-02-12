import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Brain,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { EmberFirefly } from '../ember/EmberFirefly';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { situationalJudgmentQuestions } from '../../data/assessmentQuestions';
import { PersonalityEngine, type OCEANScores } from '../../lib/personalityEngine';

const ACCENT = '#F59E0B';

export function SituationalJudgmentAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [_isSaving, setIsSaving] = useState(false);
  const [oceanScores, setOceanScores] = useState<OCEANScores | null>(null);

  const question = situationalJudgmentQuestions[currentQuestion];
  const progress = ((currentQuestion + (answers[question?.id] !== undefined ? 1 : 0)) / situationalJudgmentQuestions.length) * 100;

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleSliderChange = (value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < situationalJudgmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);
    setIsSaving(true);

    const engine = new PersonalityEngine();

    for (const q of situationalJudgmentQuestions) {
      const answer = answers[q.id];
      if (answer === undefined) continue;

      if (q.type === 'slider') {
        engine.processResponse(
          { questionId: q.id, sliderValue: answer as number, timestamp: Date.now() },
          { type: q.type, sliderConfig: q.sliderConfig }
        );
      } else {
        engine.processResponse(
          { questionId: q.id, answerId: answer as string, timestamp: Date.now() },
          { type: q.type, options: q.options }
        );
      }
    }

    const scores = engine.calculateOCEAN();
    setOceanScores(scores);

    if (user) {
      try {
        await supabase
          .from('candidates')
          .update({
            situational_judgment_data: {
              answers,
              ocean_scores: scores,
              completed_at: new Date().toISOString(),
            },
          })
          .eq('user_id', user.id);

        showSuccess('Assessment Complete!', 'Your situational judgment results have been added to your profile.');
      } catch (err) {
        console.error('Error saving situational judgment data:', err);
      }
    }

    setIsSaving(false);
  };

  // Results view
  if (isComplete && oceanScores) {
    const dimensionInfo: Record<string, { label: string; color: string }> = {
      openness: { label: 'Openness', color: '#8B5CF6' },
      conscientiousness: { label: 'Conscientiousness', color: '#10B981' },
      extraversion: { label: 'Extraversion', color: '#F59E0B' },
      agreeableness: { label: 'Agreeableness', color: '#EC4899' },
      neuroticism: { label: 'Emotional Stability', color: '#06B6D4' },
    };

    const sortedDimensions = Object.entries(oceanScores)
      .map(([key, value]) => ({
        key,
        value: key === 'neuroticism' ? 100 - value : value,
        ...dimensionInfo[key],
      }))
      .sort((a, b) => b.value - a.value);

    return (
      <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="p-8 rounded-2xl border text-center" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <EmberFirefly size="lg" mood="happy" animated />
            <h1 className="text-2xl font-bold mt-4 mb-2" style={{ color: 'var(--color-text)' }}>Situational Judgment Results</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--color-textSecondary)' }}>
              Here's what your workplace responses reveal about your behavioral tendencies
            </p>

            <div className="space-y-4 mb-8 text-left">
              {sortedDimensions.map(({ key, value, label, color }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                    <span className="text-xs font-medium" style={{ color }}>{value}/100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl mb-6 text-left" style={{ backgroundColor: 'var(--color-background)' }}>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Profile Enhanced</p>
                  <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    Your situational judgment responses have been factored into your personality profile with a 15% weight, improving the accuracy of your behavioral predictions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/app/insights')} leftIcon={<Brain className="w-4 h-4" />}>View Full Profile</Button>
              <Button onClick={() => navigate('/app/matches')} rightIcon={<ArrowRight className="w-4 h-4" />}>Find Matches</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slider value for current question
  const sliderVal = (answers[question.id] as number) ?? 50;
  const sliderPercentage = question.sliderConfig
    ? ((sliderVal - question.sliderConfig.min) / (question.sliderConfig.max - question.sliderConfig.min)) * 100
    : 0;

  // Question view
  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${ACCENT}15` }}>
              <Shield className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Situational Judgment</h1>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                Question {currentQuestion + 1} of {situationalJudgmentQuestions.length}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/app/insights')} className="text-sm px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface)]" style={{ color: 'var(--color-textMuted)' }}>Exit</button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full mb-8 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: ACCENT }} />
        </div>

        {/* Question card */}
        <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: ACCENT }}>{question.category}</p>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{question.question}</h2>
          {question.description && (
            <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>{question.description}</p>
          )}

          {/* Slider question */}
          {question.type === 'slider' && question.sliderConfig && (
            <div className="space-y-4">
              <div
                className="relative pt-14 pb-8 px-5 rounded-2xl"
                style={{ backgroundColor: 'var(--color-background)', '--slider-color': ACCENT } as React.CSSProperties}
              >
                <div
                  className="absolute top-2 px-3.5 py-1.5 rounded-xl font-bold text-base transform -translate-x-1/2 transition-all duration-150 shadow-md"
                  style={{
                    backgroundColor: ACCENT,
                    color: 'white',
                    left: `calc(${sliderPercentage}% + ${(50 - sliderPercentage) * 0.2}px)`,
                  }}
                >
                  {sliderVal}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ backgroundColor: ACCENT }} />
                </div>
                <input
                  type="range"
                  min={question.sliderConfig.min}
                  max={question.sliderConfig.max}
                  value={sliderVal}
                  onChange={e => handleSliderChange(parseInt(e.target.value))}
                  className="w-full slider-thumb"
                  style={{
                    background: `linear-gradient(to right, ${ACCENT} 0%, ${ACCENT} ${sliderPercentage}%, var(--color-border) ${sliderPercentage}%, var(--color-border) 100%)`,
                  }}
                />
                <div className="flex justify-between mt-2 px-0.5">
                  {[0, 25, 50, 75, 100].map(tick => (
                    <div key={tick} className="w-0.5 h-1.5 rounded-full" style={{ backgroundColor: sliderPercentage >= tick ? ACCENT : 'var(--color-border)', opacity: 0.5 }} />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-sm px-1">
                <p className="max-w-[40%] font-medium" style={{ color: 'var(--color-textSecondary)' }}>{question.sliderConfig.minLabel}</p>
                <p className="max-w-[40%] text-right font-medium" style={{ color: 'var(--color-textSecondary)' }}>{question.sliderConfig.maxLabel}</p>
              </div>
            </div>
          )}

          {/* Multiple choice options */}
          {question.options && (
            <div className={`grid gap-3 ${question.options.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {question.options.map(option => {
                const isSelected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      backgroundColor: isSelected ? `${ACCENT}12` : 'var(--color-background)',
                      border: isSelected ? `2px solid ${ACCENT}` : '1px solid var(--color-border)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ borderColor: isSelected ? ACCENT : 'var(--color-border)', backgroundColor: isSelected ? ACCENT : 'transparent' }}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{option.text}</p>
                        {option.description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-textMuted)' }}>{option.description}</p>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={currentQuestion === 0} leftIcon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
          <Button
            onClick={handleNext}
            disabled={answers[question.id] === undefined}
            rightIcon={currentQuestion === situationalJudgmentQuestions.length - 1 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          >
            {currentQuestion === situationalJudgmentQuestions.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
