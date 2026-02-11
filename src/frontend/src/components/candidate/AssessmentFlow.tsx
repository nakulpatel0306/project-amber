import { useState } from 'react';
import { Check, Loader2, ArrowRight, Coffee, Sparkles } from 'lucide-react';
import {
  startAssessment,
  submitAnswer,
  getAssessmentResults,
  type Question,
  type AssessmentResults,
} from '../../utils/api';

type AssessmentState = 'welcome' | 'assessment' | 'halfway' | 'calculating' | 'results';

interface AssessmentStep {
  questionId: number;
  answered: boolean;
}

export function AssessmentFlow() {
  const [state, setState] = useState<AssessmentState>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [steps, setSteps] = useState<AssessmentStep[]>([]);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleStartAssessment = async () => {
    if (!name.trim() || !email.trim()) {
      setError('please enter your name and email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await startAssessment({ name: name.trim(), email: email.trim() });
      setCandidateId(response.candidate_id);
      setCurrentQuestion(response.question);
      setCurrentQuestionNumber(response.current_question);
      setTotalQuestions(response.total_questions);

      // Initialize steps
      const initialSteps = Array.from({ length: response.total_questions }, (_, i) => ({
        questionId: i + 1,
        answered: i + 1 < response.current_question,
      }));
      setSteps(initialSteps);

      setState('assessment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to start assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!candidateId || !currentQuestion) return;

    setSelectedAnswer(answer);
    setIsLoading(true);
    setError(null);

    try {
      const response = await submitAnswer({
        candidate_id: candidateId,
        question_id: currentQuestion.id,
        answer,
      });

      // Update steps
      setSteps(prev =>
        prev.map(step =>
          step.questionId === currentQuestion.id ? { ...step, answered: true } : step
        )
      );

      if (response.is_complete) {
        setState('calculating');
        // Simulate calculation time
        setTimeout(async () => {
          try {
            const assessmentResults = await getAssessmentResults(candidateId);
            setResults(assessmentResults);
            setState('results');
          } catch (err) {
            setError('failed to get results');
            setState('assessment');
          }
        }, 2000);
      } else if (response.message.includes('halfway')) {
        setCurrentQuestion(response.next_question);
        setCurrentQuestionNumber(response.current_question);
        setState('halfway');
      } else {
        setCurrentQuestion(response.next_question);
        setCurrentQuestionNumber(response.current_question);
        setSelectedAnswer(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setState('assessment');
    setSelectedAnswer(null);
  };

  // Welcome screen
  if (state === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="w-full max-w-md">
          {/* header */}
          <div className="text-center mb-10">
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
              culture fit assessment
            </h1>
            <p
              className="text-base"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              let's see if we're a great fit! this takes about 5 minutes.
            </p>
          </div>

          {/* form */}
          <div
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-error)',
                }}
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm mb-1.5"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="jane doe"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-1.5"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <button
                onClick={handleStartAssessment}
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-sm font-medium btn-smooth flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 spinner" />
                ) : (
                  <>
                    start assessment
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Halfway confirmation
  if (state === 'halfway') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
          >
            <Sparkles className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
          </div>

          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            you're halfway there!
          </h2>
          <p
            className="text-sm mb-8"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            just 5 more questions to go. ready to continue?
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleContinue}
              className="px-6 py-3 rounded-xl text-sm font-medium btn-smooth flex items-center gap-2"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accentText)',
              }}
            >
              yes, continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* progress */}
          <div className="mt-8">
            <div className="flex justify-center gap-1.5">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    backgroundColor: step.answered
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculating screen
  if (state === 'calculating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="text-center">
          <Loader2
            className="w-12 h-12 mx-auto mb-6 spinner"
            style={{ color: 'var(--color-accent)' }}
          />
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            calculating your fit score...
          </h2>
          <p
            className="text-sm"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            analyzing your responses
          </p>
        </div>
      </div>
    );
  }

  // Results screen
  if (state === 'results' && results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="w-full max-w-md">
          {/* score card */}
          <div
            className="p-8 rounded-2xl border text-center mb-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              }}
            >
              <Check className="w-10 h-10 text-white" />
            </div>

            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: 'var(--color-text)' }}
            >
              assessment complete!
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              here's your culture fit score
            </p>

            <div
              className="text-5xl font-bold mb-2"
              style={{ color: 'var(--color-accent)' }}
            >
              {results.culture_fit_score}
              <span className="text-2xl">/100</span>
            </div>

            <p
              className="text-sm leading-relaxed mt-4"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {results.explanation}
            </p>
          </div>

          {/* traits */}
          <div
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-sm font-medium mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              your top traits
            </h3>
            <div className="flex flex-wrap gap-2">
              {results.top_traits.map((trait, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* score breakdown */}
            <div className="mt-6 space-y-3">
              <ScoreBar label="work style" score={results.work_style_score} />
              <ScoreBar label="communication" score={results.communication_score} />
              <ScoreBar label="values" score={results.values_score} />
            </div>
          </div>

          <p
            className="text-xs text-center mt-6"
            style={{ color: 'var(--color-textMuted)' }}
          >
            we'll be in touch soon with next steps!
          </p>
        </div>
      </div>
    );
  }

  // Assessment questions
  return (
    <div className="flex flex-col min-h-full">
      {/* progress header */}
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
              question {currentQuestionNumber} of {totalQuestions}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {Math.round((currentQuestionNumber / totalQuestions) * 100)}% complete
            </span>
          </div>

          {/* progress bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </div>

          {/* step indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor:
                    step.answered
                      ? 'var(--color-accent)'
                      : i + 1 === currentQuestionNumber
                      ? 'var(--color-accentHover)'
                      : 'var(--color-border)',
                  transform: i + 1 === currentQuestionNumber ? 'scale(1.25)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* question content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm text-center"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-error)',
              }}
            >
              {error}
            </div>
          )}

          {currentQuestion && (
            <div className="message-enter">
              <h2
                className="text-xl font-medium mb-8 text-center leading-relaxed"
                style={{ color: 'var(--color-text)' }}
              >
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = selectedAnswer === option;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSubmitAnswer(option)}
                      disabled={isLoading}
                      className="w-full p-4 rounded-xl border text-left transition-all btn-smooth disabled:opacity-50"
                      style={{
                        backgroundColor: isSelected
                          ? 'rgba(139, 92, 246, 0.1)'
                          : 'var(--color-surface)',
                        borderColor: isSelected
                          ? 'var(--color-accent)'
                          : 'var(--color-border)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            borderColor: isSelected
                              ? 'var(--color-accent)'
                              : 'var(--color-border)',
                            backgroundColor: isSelected
                              ? 'var(--color-accent)'
                              : 'transparent',
                          }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span
                          className="text-sm"
                          style={{
                            color: isSelected
                              ? 'var(--color-text)'
                              : 'var(--color-textSecondary)',
                          }}
                        >
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
          {label}
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
          {score}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            backgroundColor: 'var(--color-accent)',
          }}
        />
      </div>
    </div>
  );
}
