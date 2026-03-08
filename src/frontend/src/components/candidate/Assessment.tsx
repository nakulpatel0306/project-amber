import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  GripVertical,
  Brain,
  User,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth, isDevMode } from '../../contexts/AuthContext';
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
  assessmentId: string | null;
}

export function Assessment() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [state, setState] = useState<AssessmentState>({
    currentIndex: 0,
    responses: {},
    startedAt: Date.now(),
    assessmentId: null,
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

  // Check if profile is complete and cooldown status before allowing assessment
  useEffect(() => {
    if (!user) return;

    const checkProfile = async () => {
      setIsCheckingProfile(true);
      try {
        const { data: candidate } = await supabase
          .from('candidates')
          .select('headline, bio, location, years_experience, preferred_work_style, preferred_company_size')
          .eq('user_id', user.id)
          .single();

        // All mandatory fields must be filled (everything except salary expectations and links)
        const profileComplete = isDevMode() || !!(
          candidate?.headline &&
          candidate?.bio &&
          candidate?.location &&
          candidate?.years_experience !== null &&
          candidate?.preferred_work_style &&
          candidate?.preferred_company_size
        );
        setHasCompletedProfile(profileComplete);
      } catch (err) {
        console.error('Error checking profile:', err);
        setHasCompletedProfile(isDevMode()); // Dev mode still works
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user]);

  // Initialize or resume assessment session
  useEffect(() => {
    if (!user || !hasCompletedProfile || isCheckingProfile) return;

    const initializeAssessment = async () => {
      try {
        // Check for existing in-progress assessment
        const { data: existingAssessment } = await supabase
          .from('assessments')
          .select('id, started_at')
          .eq('user_id', user.id)
          .eq('assessment_type', 'candidate_personality')
          .is('completed_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingAssessment) {
          // Resume existing assessment - load saved responses
          const { data: savedResponses } = await supabase
            .from('assessment_responses')
            .select('*')
            .eq('assessment_id', existingAssessment.id);

          if (savedResponses && savedResponses.length > 0) {
            // Convert saved responses to the format expected by the component
            const responses: Record<string, AssessmentResponse> = {};
            let lastAnsweredIndex = -1;

            savedResponses.forEach((r) => {
              const questionId = r.question_code;
              const answer = r.answer as { value?: number; selected?: string; order?: string[]; text?: string } | null;

              const response: AssessmentResponse = {
                questionId,
                timestamp: new Date(r.answered_at).getTime(),
              };

              // Extract answer from JSONB based on answer type
              if (answer) {
                if (answer.value !== undefined) response.sliderValue = answer.value;
                if (answer.selected) response.answerId = answer.selected;
                if (answer.order) response.rankingOrder = answer.order;
                if (answer.text) response.reflectionText = answer.text;
              }

              responses[questionId] = response;

              // Process in personality engine
              const question = candidateQuestions.find(q => q.id === questionId);
              if (question) {
                personalityEngine.processResponse(response, {
                  type: question.type,
                  options: question.options,
                  sliderConfig: question.sliderConfig,
                });
                const questionIndex = candidateQuestions.findIndex(q => q.id === questionId);
                if (questionIndex > lastAnsweredIndex) {
                  lastAnsweredIndex = questionIndex;
                }
              }
            });

            setState(prev => ({
              ...prev,
              assessmentId: existingAssessment.id,
              responses,
              startedAt: new Date(existingAssessment.started_at).getTime(),
              currentIndex: Math.min(lastAnsweredIndex + 1, candidateQuestions.length - 1),
            }));
          } else {
            setState(prev => ({
              ...prev,
              assessmentId: existingAssessment.id,
              startedAt: new Date(existingAssessment.started_at).getTime(),
            }));
          }
        } else {
          // Create new assessment session
          const { data: newAssessment, error } = await supabase
            .from('assessments')
            .insert({
              user_id: user.id,
              assessment_type: 'candidate_personality',
              started_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (error) throw error;

          setState(prev => ({
            ...prev,
            assessmentId: newAssessment.id,
          }));
        }
      } catch (err) {
        console.error('Error initializing assessment:', err);
      }
    };

    initializeAssessment();
  }, [user, hasCompletedProfile, isCheckingProfile]);

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

  // Redirect to results page after completion
  // NOTE: This hook must be before any conditional returns to maintain consistent hook order
  useEffect(() => {
    if (isComplete && profile) {
      navigate('/app/personality/results');
    }
  }, [isComplete, profile, navigate]);

  const saveResponse = async () => {
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

    // Save response to database incrementally
    if (state.assessmentId && user) {
      try {
        // Build JSONB answer based on question type
        let answer: Record<string, unknown>;
        if (response.sliderValue !== undefined) {
          answer = { value: response.sliderValue };
        } else if (response.rankingOrder) {
          answer = { order: response.rankingOrder };
        } else if (response.reflectionText) {
          answer = { text: response.reflectionText };
        } else if (response.answerId) {
          answer = { selected: response.answerId };
        } else {
          answer = {};
        }

        await supabase
          .from('assessment_responses')
          .upsert({
            assessment_id: state.assessmentId,
            user_id: user.id,
            question_code: currentQuestion.id,
            answer,
            answered_at: new Date().toISOString(),
          }, {
            onConflict: 'assessment_id,question_code',
          });
      } catch (err) {
        console.error('Error saving response:', err);
      }
    }

    return response;
  };

  const handleNext = async () => {
    await saveResponse();

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
    if (!user || !state.assessmentId) return;

    setIsSubmitting(true);

    try {
      // Generate profile from engine
      const generatedProfile = personalityEngine.generateCandidateProfile(user.id);
      setProfile(generatedProfile);

      // Update assessment record with final responses and completion time
      const { error: assessmentError } = await supabase
        .from('assessments')
        .update({
          responses: state.responses,
          completed_at: new Date().toISOString(),
        })
        .eq('id', state.assessmentId);

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
        className="h-screen overflow-hidden flex items-center justify-center px-4"
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
            Complete Your Profile First
          </h1>
          <p
            className="mb-6"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Before taking the personality assessment, please set up your candidate profile. This helps us match you with the right opportunities.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setShowSetupModal(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Set Up Profile
            </Button>
            <Link to="/app/dashboard">
              <Button variant="ghost" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Candidate Setup Modal */}
        <CandidateSetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onComplete={handleSetupComplete}
          redirectToAssessment={false}
        />
      </div>
    );
  }

  // Show loading while redirecting
  if (isComplete && profile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="font-medium" style={{ color: 'var(--color-text)' }}>
            generating your personality profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <motion.div
          className="h-1"
          style={{
            backgroundColor: 'var(--color-accent)',
          }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
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

        {/* Question with slide animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
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
          </motion.div>
        </AnimatePresence>

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
  const percentage = ((value - config.min) / (config.max - config.min)) * 100;
  const accentColor = 'var(--color-accent)';

  return (
    <div className="space-y-4">
      <div
        className="relative pt-14 pb-8 px-5 rounded-2xl"
        style={{ backgroundColor: 'var(--color-surface)', '--slider-color': accentColor } as React.CSSProperties}
      >
        {/* Floating value indicator */}
        <div
          className="absolute top-2 px-3.5 py-1.5 rounded-xl font-bold text-base transform -translate-x-1/2 transition-all duration-150 shadow-md"
          style={{
            backgroundColor: accentColor,
            color: 'white',
            left: `calc(${percentage}% + ${(50 - percentage) * 0.2}px)`,
          }}
        >
          {value}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ backgroundColor: accentColor }}
          />
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full slider-thumb"
          style={{
            background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${percentage}%, var(--color-border) ${percentage}%, var(--color-border) 100%)`,
          }}
        />
        {/* Tick marks */}
        <div className="flex justify-between mt-2 px-0.5">
          {[0, 25, 50, 75, 100].map(tick => (
            <div
              key={tick}
              className="w-0.5 h-1.5 rounded-full"
              style={{ backgroundColor: percentage >= tick ? accentColor : 'var(--color-border)', opacity: 0.5 }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-sm px-1">
        <p className="max-w-[40%] font-medium" style={{ color: 'var(--color-textSecondary)' }}>
          {config.minLabel}
        </p>
        <p className="max-w-[40%] text-right font-medium" style={{ color: 'var(--color-textSecondary)' }}>
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

export default Assessment;
