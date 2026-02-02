import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  GripVertical,
  Users,
  Target,
  Zap,
  Heart,
  TrendingUp,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth, isDevMode } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import {
  employerQuestions,
  type AssessmentOption,
} from '../../data/assessmentQuestions';
import {
  cultureEngine,
  type AssessmentResponse,
  type EmployerCultureProfile,
} from '../../lib/personalityEngine';
import { cn } from '../../utils/cn';
import { EmployerSetupModal } from './EmployerSetupModal';

interface AssessmentState {
  currentIndex: number;
  responses: Record<string, AssessmentResponse>;
  startedAt: number;
}

export function CultureAssessment() {
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
  const [cultureProfile, setCultureProfile] = useState<EmployerCultureProfile | null>(null);

  // Profile completion check
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Cooldown check (24 hours between assessments)
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  const [lastAssessmentAt, setLastAssessmentAt] = useState<Date | null>(null);

  const currentQuestion = employerQuestions[state.currentIndex];
  const progress = ((state.currentIndex + 1) / employerQuestions.length) * 100;

  // Check if profile is complete and cooldown status before allowing assessment
  useEffect(() => {
    if (!user) return;

    const checkProfileAndCooldown = async () => {
      setIsCheckingProfile(true);
      try {
        const { data: employer } = await supabase
          .from('employers')
          .select('company_name, description, culture_quiz_completed, updated_at')
          .eq('user_id', user.id)
          .single();

        // Dev mode bypasses profile requirement
        const profileComplete = isDevMode() || !!(employer?.company_name || employer?.description);
        setHasCompletedProfile(profileComplete);

        // Check cooldown (24 hours = 86400000 ms) - only if already completed once
        if (employer?.culture_quiz_completed && employer?.updated_at) {
          const lastCompleted = new Date(employer.updated_at);
          setLastAssessmentAt(lastCompleted);
          const timeSince = Date.now() - lastCompleted.getTime();
          const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

          if (timeSince < cooldownMs) {
            setCooldownRemaining(cooldownMs - timeSince);
          } else {
            setCooldownRemaining(null);
          }
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        setHasCompletedProfile(isDevMode()); // Dev mode still works
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfileAndCooldown();
  }, [user]);

  // Update cooldown timer
  useEffect(() => {
    if (cooldownRemaining === null || cooldownRemaining <= 0) return;

    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev === null || prev <= 1000) {
          clearInterval(interval);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownRemaining]);

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

    // Process response in culture engine
    cultureEngine.processResponse(response, {
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

    if (state.currentIndex < employerQuestions.length - 1) {
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
      // Generate culture profile from engine
      const generatedProfile = cultureEngine.generateCultureProfile(user.id);
      setCultureProfile(generatedProfile);

      // Save to database
      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          assessment_type: 'employer_culture',
          responses: state.responses,
          started_at: new Date(state.startedAt).toISOString(),
          completed_at: new Date().toISOString(),
        });

      if (assessmentError) throw assessmentError;

      // Update employer record with culture scores
      const { error: employerError } = await supabase
        .from('employers')
        .update({
          openness_preference: generatedProfile.idealCandidateOCEAN.openness,
          conscientiousness_preference: generatedProfile.idealCandidateOCEAN.conscientiousness,
          extraversion_preference: generatedProfile.idealCandidateOCEAN.extraversion,
          agreeableness_preference: generatedProfile.idealCandidateOCEAN.agreeableness,
          neuroticism_preference: generatedProfile.idealCandidateOCEAN.neuroticism,
          culture_values: generatedProfile.valuesPriority,
          culture_quiz_completed: true,
        })
        .eq('user_id', user.id);

      if (employerError) throw employerError;

      setIsComplete(true);
      success('Culture profile complete!', 'You can now start matching with candidates.');
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
            <Building2 className="w-6 h-6 text-white" />
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
            <Building2 className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            set up your company first
          </h1>
          <p
            className="mb-6"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            before defining your culture, please set up your company profile. this helps candidates learn about your organization.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setShowSetupModal(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              set up company
            </Button>
            <Link to="/app/employer">
              <Button variant="ghost" className="w-full">
                back to dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Employer Setup Modal */}
        <EmployerSetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onComplete={handleSetupComplete}
        />
      </div>
    );
  }

  // Show cooldown screen (24-hour wait between assessments)
  if (cooldownRemaining && cooldownRemaining > 0) {
    const hours = Math.floor(cooldownRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((cooldownRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((cooldownRemaining % (1000 * 60)) / 1000);

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
            <Clock className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            assessment cooldown
          </h1>
          <p
            className="mb-6"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            you've recently completed the culture assessment. you can retake it again in:
          </p>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-4 mb-6">
            <div
              className="p-4 rounded-xl min-w-[80px]"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                {hours.toString().padStart(2, '0')}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                hours
              </div>
            </div>
            <div
              className="p-4 rounded-xl min-w-[80px]"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                {minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                minutes
              </div>
            </div>
            <div
              className="p-4 rounded-xl min-w-[80px]"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                {seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                seconds
              </div>
            </div>
          </div>

          {lastAssessmentAt && (
            <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
              last completed: {lastAssessmentAt.toLocaleDateString()} at {lastAssessmentAt.toLocaleTimeString()}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Link to="/app/employer/insights">
              <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                view your insights
              </Button>
            </Link>
            <Link to="/app/employer/candidates">
              <Button variant="ghost" className="w-full">
                browse candidates
              </Button>
            </Link>
            <div
              className="flex items-center justify-center gap-2 text-sm"
              style={{ color: 'var(--color-textMuted)' }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>retake available in {hours}h {minutes}m</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (isComplete && cultureProfile) {
    return <CultureAssessmentComplete profile={cultureProfile} />;
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
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Culture Assessment
              </p>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                Question {state.currentIndex + 1} of {employerQuestions.length}
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
              state.currentIndex === employerQuestions.length - 1
                ? <CheckCircle2 className="w-4 h-4" />
                : <ArrowRight className="w-4 h-4" />
            }
          >
            {state.currentIndex === employerQuestions.length - 1 ? 'Complete' : 'Continue'}
          </Button>
        </div>

        {/* Question dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {employerQuestions.map((_, index) => (
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
// QUESTION TYPE COMPONENTS (Same as candidate)
// ============================================

function ScenarioOptions({
  options,
  selected,
  onSelect,
}: {
  options: AssessmentOption[];
  selected: string | null;
  onSelect: (id: string) => void;
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
                <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                  {option.text}
                </p>
                {option.description && (
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
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
  // Calculate percentage for positioning the value indicator
  const percentage = ((value - config.min) / (config.max - config.min)) * 100;

  return (
    <div className="space-y-6">
      <div
        className="relative pt-12 pb-6 px-4 rounded-2xl"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {/* Value indicator that moves with slider */}
        <div
          className="absolute -top-1 px-4 py-2 rounded-full font-bold text-lg transform -translate-x-1/2 transition-all duration-100"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            left: `calc(${percentage}% + ${(50 - percentage) * 0.16}px)`, // Adjust for padding
          }}
        >
          {value}
        </div>

        <input
          type="range"
          min={config.min}
          max={config.max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percentage}%, var(--color-border) ${percentage}%, var(--color-border) 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <p className="max-w-[40%]" style={{ color: 'var(--color-textSecondary)' }}>
          {config.minLabel}
        </p>
        <p className="max-w-[40%] text-right" style={{ color: 'var(--color-textSecondary)' }}>
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

  const handleDragStart = (id: string) => setDraggedItem(id);

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

  const handleDragEnd = () => setDraggedItem(null);

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
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
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
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>{option.text}</p>
              {option.description && (
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>{option.description}</p>
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

function ReflectionQuestion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share your thoughts..."
        rows={5}
        className="w-full px-5 py-4 rounded-2xl text-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '2px solid var(--color-border)' }}
      />
      <p className="text-right text-sm mt-2" style={{ color: 'var(--color-textMuted)' }}>
        {value.length} characters
      </p>
    </div>
  );
}

// ============================================
// COMPLETION SCREEN
// ============================================

function CultureAssessmentComplete({ profile }: { profile: EmployerCultureProfile }) {
  const navigate = useNavigate();

  const getCultureIcon = (type: string) => {
    if (type.includes('Innovator')) return <Zap className="w-10 h-10 text-white" />;
    if (type.includes('Achievement')) return <Target className="w-10 h-10 text-white" />;
    if (type.includes('Collaborative')) return <Heart className="w-10 h-10 text-white" />;
    return <Building2 className="w-10 h-10 text-white" />;
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}
          >
            {getCultureIcon(profile.cultureType)}
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Your Company Culture Profile
          </h1>
          <div
            className="inline-block px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            {profile.cultureType}
          </div>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-textSecondary)' }}>
            {profile.cultureDescription}
          </p>
        </div>

        {/* Culture Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className="p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Users className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Team Dynamics
            </h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              {profile.teamDynamics}
            </p>
          </div>
          <div
            className="p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Target className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Decision Culture
            </h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              {profile.decisionCulture}
            </p>
          </div>
        </div>

        {/* Culture Dimensions */}
        <div
          className="p-6 rounded-2xl border mb-8"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text)' }}>
            Culture Dimensions
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Innovation Focus', value: profile.innovationLevel, low: 'Optimize', high: 'Disrupt' },
              { label: 'Work Intensity', value: profile.workIntensity, low: 'Sustainable', high: 'Intense' },
              { label: 'Hierarchy Level', value: profile.hierarchyLevel, low: 'Flat', high: 'Structured' },
              { label: 'Transparency', value: profile.transparencyLevel, low: 'Need to Know', high: 'Radical' },
            ].map(({ label, value, low, high }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between">
                  <p className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                  <p className="font-bold" style={{ color: 'var(--color-accent)' }}>{value}</p>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${value}%`,
                      background: 'linear-gradient(90deg, var(--color-accent), var(--color-accentHover))',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  <span>{low}</span>
                  <span>{high}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ideal Candidate Profile */}
        <div
          className="p-6 rounded-2xl border mb-8"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Ideal Candidate Profile
          </h2>
          <p className="mb-4" style={{ color: 'var(--color-textSecondary)' }}>
            Based on your culture, candidates with these personality traits will thrive at your company:
          </p>
          <div className="space-y-3">
            {[
              { key: 'openness', label: 'Openness to Experience' },
              { key: 'conscientiousness', label: 'Conscientiousness' },
              { key: 'extraversion', label: 'Extraversion' },
              { key: 'agreeableness', label: 'Agreeableness' },
              { key: 'neuroticism', label: 'Emotional Stability' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <p className="w-40 text-sm" style={{ color: 'var(--color-text)' }}>{label}</p>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${key === 'neuroticism'
                        ? 100 - profile.idealCandidateOCEAN[key as keyof typeof profile.idealCandidateOCEAN]
                        : profile.idealCandidateOCEAN[key as keyof typeof profile.idealCandidateOCEAN]}%`,
                      backgroundColor: 'var(--color-accent)',
                    }}
                  />
                </div>
                <p className="w-12 text-right font-medium" style={{ color: 'var(--color-accent)' }}>
                  {key === 'neuroticism'
                    ? 100 - profile.idealCandidateOCEAN[key as keyof typeof profile.idealCandidateOCEAN]
                    : profile.idealCandidateOCEAN[key as keyof typeof profile.idealCandidateOCEAN]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Priority */}
        <div
          className="p-6 rounded-2xl border mb-8"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Your Top Values
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.valuesPriority.map((value, index) => (
              <span
                key={value}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: index === 0 ? 'var(--color-accent)' : 'var(--color-background)',
                  color: index === 0 ? 'white' : 'var(--color-text)',
                }}
              >
                {index + 1}. {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate('/app/employer/insights')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            view detailed insights
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CultureAssessment;
