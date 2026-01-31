import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Circle,
  GripVertical,
  Brain,
  Target,
  Compass,
  Lightbulb,
  User,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import {
  candidateQuestions,
  type AssessmentOption,
} from '../../data/assessmentQuestions';
import {
  personalityEngine,
  type AssessmentResponse,
  type CandidateProfile,
} from '../../lib/personalityEngine';
import { cn } from '../../utils/cn';
import { CandidateSetupModal } from './CandidateSetupModal';

interface AssessmentState {
  currentIndex: number;
  responses: Record<string, AssessmentResponse>;
  startedAt: number;
}

export function Assessment() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [state, setState] = useState<AssessmentState>({
    currentIndex: 0,
    responses: {},
    startedAt: Date.now(),
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(50);
  const [rankingOrder, setRankingOrder] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  // Profile completion check
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const currentQuestion = candidateQuestions[state.currentIndex];
  const progress = ((state.currentIndex + 1) / candidateQuestions.length) * 100;

  // Check if profile is complete before allowing assessment
  useEffect(() => {
    if (!user) return;

    const checkProfileCompletion = async () => {
      setIsCheckingProfile(true);
      try {
        const { data: candidate } = await supabase
          .from('candidates')
          .select('headline, bio')
          .eq('user_id', user.id)
          .single();

        // Profile is complete if they have a headline or bio filled out
        setHasCompletedProfile(!!(candidate?.headline || candidate?.bio));
      } catch (err) {
        console.error('Error checking profile:', err);
        setHasCompletedProfile(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [user]);

  // Initialize ranking order when question changes
  useEffect(() => {
    if (currentQuestion?.type === 'ranking' && currentQuestion.options) {
      setRankingOrder(currentQuestion.options.map(o => o.id));
    }
  }, [state.currentIndex, currentQuestion]);

  // Load previous answer if going back
  useEffect(() => {
    const previousResponse = state.responses[currentQuestion?.id];
    if (previousResponse) {
      if (previousResponse.answerId) setSelectedAnswer(previousResponse.answerId);
      if (previousResponse.sliderValue !== undefined) setSliderValue(previousResponse.sliderValue);
      if (previousResponse.rankingOrder) setRankingOrder(previousResponse.rankingOrder);
      if (previousResponse.reflectionText) setReflectionText(previousResponse.reflectionText);
    } else {
      setSelectedAnswer(null);
      setSliderValue(50);
      setReflectionText('');
    }
  }, [state.currentIndex, currentQuestion?.id, state.responses]);

  const saveResponse = () => {
    const response: AssessmentResponse = {
      questionId: currentQuestion.id,
      timestamp: Date.now(),
    };

    if (currentQuestion.type === 'slider') {
      response.sliderValue = sliderValue;
    } else if (currentQuestion.type === 'ranking') {
      response.rankingOrder = rankingOrder;
    } else if (currentQuestion.type === 'reflection') {
      response.reflectionText = reflectionText;
    } else {
      response.answerId = selectedAnswer || undefined;
    }

    // Process response in engine
    personalityEngine.processResponse(response, {
      type: currentQuestion.type,
      options: currentQuestion.options,
      sliderConfig: currentQuestion.sliderConfig,
    });

    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [currentQuestion.id]: response,
      },
    }));

    return response;
  };

  const handleNext = () => {
    saveResponse();

    if (state.currentIndex < candidateQuestions.length - 1) {
      setState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      setSelectedAnswer(null);
    } else {
      completeAssessment();
    }
  };

  const handlePrev = () => {
    if (state.currentIndex > 0) {
      setState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    }
  };

  const completeAssessment = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Generate profile from engine
      const generatedProfile = personalityEngine.generateCandidateProfile(user.id);
      setProfile(generatedProfile);

      // Save to database
      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          assessment_type: 'candidate_personality',
          responses: state.responses,
          started_at: new Date(state.startedAt).toISOString(),
          completed_at: new Date().toISOString(),
        });

      if (assessmentError) throw assessmentError;

      // Update candidate record with scores
      const { error: candidateError } = await supabase
        .from('candidates')
        .update({
          openness_score: generatedProfile.ocean.openness,
          conscientiousness_score: generatedProfile.ocean.conscientiousness,
          extraversion_score: generatedProfile.ocean.extraversion,
          agreeableness_score: generatedProfile.ocean.agreeableness,
          neuroticism_score: generatedProfile.ocean.neuroticism,
          top_traits: generatedProfile.constellations.map(c => c.name),
          assessment_status: 'completed',
          assessment_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (candidateError) throw candidateError;

      setIsComplete(true);
      success('Assessment complete!', 'Your personality profile is ready.');
    } catch (err) {
      console.error('Assessment error:', err);
      showError('Failed to save', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentQuestion.type === 'slider') return true;
    if (currentQuestion.type === 'ranking') return rankingOrder.length > 0;
    if (currentQuestion.type === 'reflection') return reflectionText.trim().length > 10;
    return selectedAnswer !== null;
  };

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setHasCompletedProfile(true);
  };

  // Show loading state while checking profile
  if (isCheckingProfile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center animate-pulse"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Brain className="w-6 h-6 text-white" />
          </div>
          <p style={{ color: 'var(--color-textMuted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile incomplete prompt
  if (!hasCompletedProfile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div
          className="max-w-md w-full p-8 rounded-2xl border text-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
          >
            <User className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            complete your profile first
          </h1>
          <p
            className="mb-6"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            before taking the personality assessment, please set up your candidate profile. this helps us match you with the right opportunities.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setShowSetupModal(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              set up profile
            </Button>
            <Link to="/app/dashboard">
              <Button variant="ghost" className="w-full">
                back to dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Candidate Setup Modal */}
        <CandidateSetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onComplete={handleSetupComplete}
        />
      </div>
    );
  }

  // Show completion screen
  if (isComplete && profile) {
    return <AssessmentComplete profile={profile} />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div
          className="h-1 transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--color-accent), var(--color-accentHover))',
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Personality Assessment
              </p>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                Question {state.currentIndex + 1} of {candidateQuestions.length}
              </p>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textSecondary)' }}
          >
            {currentQuestion.category}
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h1
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            {currentQuestion.question}
          </h1>
          {currentQuestion.description && (
            <p
              className="text-lg"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {currentQuestion.description}
            </p>
          )}
        </div>

        {/* Answer Section */}
        <div className="mb-12">
          {currentQuestion.type === 'scenario' || currentQuestion.type === 'metaphor' || currentQuestion.type === 'tradeoff' ? (
            <ScenarioOptions
              options={currentQuestion.options || []}
              selected={selectedAnswer}
              onSelect={setSelectedAnswer}
              isMetaphor={currentQuestion.type === 'metaphor'}
            />
          ) : currentQuestion.type === 'slider' ? (
            <SliderQuestion
              config={currentQuestion.sliderConfig!}
              value={sliderValue}
              onChange={setSliderValue}
            />
          ) : currentQuestion.type === 'ranking' ? (
            <RankingQuestion
              options={currentQuestion.options || []}
              order={rankingOrder}
              onReorder={setRankingOrder}
            />
          ) : currentQuestion.type === 'reflection' ? (
            <ReflectionQuestion
              value={reflectionText}
              onChange={setReflectionText}
            />
          ) : null}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={state.currentIndex === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            isLoading={isSubmitting}
            rightIcon={
              state.currentIndex === candidateQuestions.length - 1
                ? <CheckCircle2 className="w-4 h-4" />
                : <ArrowRight className="w-4 h-4" />
            }
          >
            {state.currentIndex === candidateQuestions.length - 1 ? 'Complete' : 'Continue'}
          </Button>
        </div>

        {/* Question dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {candidateQuestions.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === state.currentIndex
                  ? 'w-6 bg-[var(--color-accent)]'
                  : index < state.currentIndex
                  ? 'bg-[var(--color-success)]'
                  : 'bg-[var(--color-border)]'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// QUESTION TYPE COMPONENTS
// ============================================

function ScenarioOptions({
  options,
  selected,
  onSelect,
  isMetaphor: _isMetaphor,
}: {
  options: AssessmentOption[];
  selected: string | null;
  onSelect: (id: string) => void;
  isMetaphor: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((option) => {
        const isSelected = selected === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              'p-5 rounded-2xl border-2 text-left transition-all',
              'hover:border-[var(--color-accent)] hover:shadow-md',
              isSelected && 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
            )}
            style={{
              borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: isSelected ? undefined : 'var(--color-surface)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  isSelected && 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                )}
                style={{ borderColor: isSelected ? undefined : 'var(--color-border)' }}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div>
                <p
                  className="font-semibold mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  {option.text}
                </p>
                {option.description && (
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SliderQuestion({
  config,
  value,
  onChange,
}: {
  config: { min: number; max: number; minLabel: string; maxLabel: string };
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-8">
      <div
        className="relative py-8 px-4 rounded-2xl"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <input
          type="range"
          min={config.min}
          max={config.max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${value}%, var(--color-border) ${value}%, var(--color-border) 100%)`,
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-2 px-4 py-2 rounded-full font-bold text-lg"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
          }}
        >
          {value}
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <p
          className="max-w-[40%]"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          {config.minLabel}
        </p>
        <p
          className="max-w-[40%] text-right"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          {config.maxLabel}
        </p>
      </div>
    </div>
  );
}

function RankingQuestion({
  options,
  order,
  onReorder,
}: {
  options: AssessmentOption[];
  order: string[];
  onReorder: (order: string[]) => void;
}) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      const newOrder = [...order];
      const draggedIndex = newOrder.indexOf(draggedItem);
      const targetIndex = newOrder.indexOf(targetId);
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      onReorder(newOrder);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-3">
      {order.map((id, index) => {
        const option = options.find(o => o.id === id);
        if (!option) return null;

        return (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(id)}
            onDragOver={(e) => handleDragOver(e, id)}
            onDragEnd={handleDragEnd}
            className={cn(
              'p-4 rounded-xl border-2 flex items-center gap-4 cursor-grab transition-all',
              draggedItem === id && 'opacity-50'
            )}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <GripVertical className="w-5 h-5" style={{ color: 'var(--color-textMuted)' }} />
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: index === 0 ? 'var(--color-accent)' : 'var(--color-background)',
                color: index === 0 ? 'white' : 'var(--color-textSecondary)',
              }}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                {option.text}
              </p>
              {option.description && (
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {option.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-center text-sm" style={{ color: 'var(--color-textMuted)' }}>
        Drag to reorder from most to least important
      </p>
    </div>
  );
}

function ReflectionQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share your thoughts..."
        rows={5}
        className="w-full px-5 py-4 rounded-2xl text-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '2px solid var(--color-border)',
        }}
      />
      <p
        className="text-right text-sm mt-2"
        style={{ color: 'var(--color-textMuted)' }}
      >
        {value.length} characters
      </p>
    </div>
  );
}

// ============================================
// COMPLETION SCREEN
// ============================================

function AssessmentComplete({ profile }: { profile: CandidateProfile }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            Your Personality Profile
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {profile.personalitySummary}
          </p>
        </div>

        {/* OCEAN Scores */}
        <div
          className="p-6 rounded-2xl border mb-8"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Personality Dimensions (OCEAN)
          </h2>
          <div className="space-y-4">
            {[
              { key: 'openness', label: 'Openness', desc: 'Curiosity & creativity' },
              { key: 'conscientiousness', label: 'Conscientiousness', desc: 'Organization & reliability' },
              { key: 'extraversion', label: 'Extraversion', desc: 'Social energy' },
              { key: 'agreeableness', label: 'Agreeableness', desc: 'Cooperation & empathy' },
              { key: 'neuroticism', label: 'Emotional Stability', desc: 'Stress resilience' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{desc}</p>
                  </div>
                  <p className="font-bold text-lg" style={{ color: 'var(--color-accent)' }}>
                    {key === 'neuroticism'
                      ? 100 - profile.ocean[key as keyof typeof profile.ocean]
                      : profile.ocean[key as keyof typeof profile.ocean]}
                  </p>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${key === 'neuroticism' ? 100 - profile.ocean[key as keyof typeof profile.ocean] : profile.ocean[key as keyof typeof profile.ocean]}%`,
                      background: 'linear-gradient(90deg, var(--color-accent), var(--color-accentHover))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constellations */}
        {profile.constellations.length > 0 && (
          <div
            className="p-6 rounded-2xl border mb-8"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Target className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Your Trait Constellations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.constellations.map((constellation, index) => (
                <div
                  key={constellation.name}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: index === 0 ? 'var(--color-accent)' : 'var(--color-border)',
                      }}
                    >
                      {constellation.icon === 'lightbulb' && <Lightbulb className="w-5 h-5 text-white" />}
                      {constellation.icon === 'layers' && <Target className="w-5 h-5 text-white" />}
                      {constellation.icon === 'compass' && <Compass className="w-5 h-5 text-white" />}
                      {!['lightbulb', 'layers', 'compass'].includes(constellation.icon) && (
                        <Sparkles className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                        {constellation.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-accent)' }}>
                        {constellation.strength}% match
                      </p>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    {constellation.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Growth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className="p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {profile.strengthAreas.map((strength) => (
                <li key={strength} className="flex items-center gap-2">
                  <Circle className="w-2 h-2" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-textSecondary)' }}>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Compass className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
              Growth Areas
            </h3>
            <ul className="space-y-2">
              {profile.growthAreas.length > 0 ? profile.growthAreas.map((area) => (
                <li key={area} className="flex items-center gap-2">
                  <Circle className="w-2 h-2" style={{ color: 'var(--color-warning)' }} />
                  <span style={{ color: 'var(--color-textSecondary)' }}>{area}</span>
                </li>
              )) : (
                <li style={{ color: 'var(--color-textMuted)' }}>Keep being awesome!</li>
              )}
            </ul>
          </div>
        </div>

        {/* Ideal Environment */}
        {profile.idealEnvironment.length > 0 && (
          <div
            className="p-6 rounded-2xl border mb-8"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Your Ideal Work Environment
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.idealEnvironment.map((env) => (
                <span
                  key={env}
                  className="px-4 py-2 rounded-full text-sm"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                  }}
                >
                  {env}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate('/app/dashboard')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            View Your Matches
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Assessment;
