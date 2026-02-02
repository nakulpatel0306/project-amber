import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Briefcase,
  Link as LinkIcon,
  MapPin,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils/cn';

interface CandidateSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  redirectToAssessment?: boolean;
}

interface CandidateData {
  headline: string;
  bio: string;
  location: string;
  years_experience: number | null;
  preferred_work_style: string;
  preferred_company_size: string;
  salary_expectation_min: number | null;
  salary_expectation_max: number | null;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
}

const WORK_STYLES = [
  { id: 'remote', label: 'Remote', description: 'Work from anywhere' },
  { id: 'hybrid', label: 'Hybrid', description: 'Mix of office and remote' },
  { id: 'onsite', label: 'On-site', description: 'Work at the office' },
  { id: 'flexible', label: 'Flexible', description: 'Open to all options' },
];

const COMPANY_SIZES = [
  { id: 'startup', label: 'Startup', description: '1-50 employees' },
  { id: 'small', label: 'Small', description: '51-200 employees' },
  { id: 'medium', label: 'Medium', description: '201-1000 employees' },
  { id: 'large', label: 'Large', description: '1000+ employees' },
  { id: 'any', label: 'Any Size', description: 'Open to all' },
];

const STEPS = [
  { id: 'intro', title: 'Welcome', icon: Sparkles },
  { id: 'basic', title: 'About You', icon: User },
  { id: 'preferences', title: 'Preferences', icon: Briefcase },
  { id: 'links', title: 'Links', icon: LinkIcon },
];

export function CandidateSetupModal({ isOpen, onClose, onComplete, redirectToAssessment = true }: CandidateSetupModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<CandidateData>({
    headline: '',
    bio: '',
    location: '',
    years_experience: null,
    preferred_work_style: 'flexible',
    preferred_company_size: 'any',
    salary_expectation_min: null,
    salary_expectation_max: null,
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });

  // Load existing candidate data and resume from last step
  useEffect(() => {
    if (!user || !isOpen) return;

    const loadCandidateData = async () => {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (candidate) {
        setData({
          headline: candidate.headline || '',
          bio: candidate.bio || '',
          location: candidate.location || '',
          years_experience: candidate.years_experience,
          preferred_work_style: candidate.preferred_work_style || 'flexible',
          preferred_company_size: candidate.preferred_company_size || 'any',
          salary_expectation_min: candidate.salary_expectation_min,
          salary_expectation_max: candidate.salary_expectation_max,
          linkedin_url: candidate.linkedin_url || '',
          github_url: candidate.github_url || '',
          portfolio_url: candidate.portfolio_url || '',
        });
        // Resume from saved step (but not past the last step)
        if (candidate.setup_step && candidate.setup_step > 0 && candidate.setup_step < STEPS.length) {
          setCurrentStep(candidate.setup_step);
        }
      }
    };

    loadCandidateData();
  }, [user, isOpen]);

  // Save step data to database
  const saveStepData = async (step: number) => {
    if (!user) return;

    try {
      let upsertData: Record<string, unknown> = {
        user_id: user.id,
        setup_step: step,
      };

      // Include relevant data based on completed step
      if (step >= 1) {
        // Basic info step completed
        upsertData = {
          ...upsertData,
          headline: data.headline || null,
          bio: data.bio || null,
          location: data.location || null,
          years_experience: data.years_experience,
        };
      }
      if (step >= 2) {
        // Preferences step completed
        upsertData = {
          ...upsertData,
          preferred_work_style: data.preferred_work_style || null,
          preferred_company_size: data.preferred_company_size || null,
          salary_expectation_min: data.salary_expectation_min,
          salary_expectation_max: data.salary_expectation_max,
        };
      }
      if (step >= 3) {
        // Links step completed
        upsertData = {
          ...upsertData,
          linkedin_url: data.linkedin_url || null,
          github_url: data.github_url || null,
          portfolio_url: data.portfolio_url || null,
        };
      }

      await supabase
        .from('candidates')
        .upsert(upsertData, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Error saving step data:', err);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      // Save current step data before moving to next
      await saveStepData(nextStep);
      setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    // Mark setup as completed even if skipped
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      // Refresh profile to update the onboarding_completed flag in context
      await refreshProfile();
    }
    onClose();
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Upsert candidate data - creates record if doesn't exist, updates if it does
      const { error: candidateError } = await supabase
        .from('candidates')
        .upsert({
          user_id: user.id,
          headline: data.headline || null,
          bio: data.bio || null,
          location: data.location || null,
          years_experience: data.years_experience,
          preferred_work_style: data.preferred_work_style || null,
          preferred_company_size: data.preferred_company_size || null,
          salary_expectation_min: data.salary_expectation_min,
          salary_expectation_max: data.salary_expectation_max,
          linkedin_url: data.linkedin_url || null,
          github_url: data.github_url || null,
          portfolio_url: data.portfolio_url || null,
          setup_step: STEPS.length,  // Mark all steps complete
          setup_completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (candidateError) throw candidateError;

      // Mark onboarding as complete
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      // Refresh profile to update the onboarding_completed flag in context
      await refreshProfile();

      success('Profile setup complete!', 'Now take the personality assessment to get matched.');
      onComplete();

      // Redirect to assessment page after completing setup
      if (redirectToAssessment) {
        navigate('/app/personality');
      }
    } catch (err) {
      console.error('Setup error:', err);
      showError('Setup failed', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Progress bar */}
          <div
            className="h-1 transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--color-accent), var(--color-accentHover))',
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <div className="flex items-center gap-2">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    index < currentStep
                      ? 'bg-[var(--color-success)]'
                      : index === currentStep
                      ? 'bg-[var(--color-accent)]'
                      : 'bg-[var(--color-surface)]'
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <step.icon
                      className="w-4 h-4"
                      style={{
                        color: index === currentStep ? 'white' : 'var(--color-textMuted)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Skip for now
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step 0: Intro */}
            {currentStep === 0 && (
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
                  }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ color: 'var(--color-text)' }}
                >
                  Welcome, {firstName}!
                </h2>
                <p
                  className="text-lg mb-6"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  Let's set up your profile to find the perfect job match.
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  This only takes a few minutes. You can skip and complete it later.
                </p>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Tell Us About Yourself
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Help employers understand who you are
                  </p>
                </div>

                <Input
                  label="Professional Headline"
                  type="text"
                  value={data.headline}
                  onChange={(e) => setData({ ...data, headline: e.target.value })}
                  placeholder="e.g., Senior Product Designer with 5+ years experience"
                  leftIcon={<User className="w-4 h-4" />}
                />

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Bio
                  </label>
                  <textarea
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder="Tell us a bit about yourself, your experience, and what you're looking for..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    type="text"
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    value={data.years_experience?.toString() || ''}
                    onChange={(e) => setData({ ...data, years_experience: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="e.g., 5"
                    leftIcon={<Briefcase className="w-4 h-4" />}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Your Work Preferences
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Help us find jobs that match your ideal work environment
                  </p>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Preferred Work Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {WORK_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setData({ ...data, preferred_work_style: style.id })}
                        className={cn(
                          'p-4 rounded-xl border text-left transition-all',
                          data.preferred_work_style === style.id
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                            : 'border-[var(--color-border)] hover:border-[var(--color-borderHover)]'
                        )}
                        style={{
                          backgroundColor: data.preferred_work_style === style.id
                            ? undefined
                            : 'var(--color-surface)',
                        }}
                      >
                        <p
                          className="font-medium text-sm"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {style.label}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: 'var(--color-textMuted)' }}
                        >
                          {style.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Preferred Company Size
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {COMPANY_SIZES.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setData({ ...data, preferred_company_size: size.id })}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all',
                          data.preferred_company_size === size.id
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                            : 'border-[var(--color-border)] hover:border-[var(--color-borderHover)]'
                        )}
                        style={{
                          backgroundColor: data.preferred_company_size === size.id
                            ? undefined
                            : 'var(--color-surface)',
                        }}
                      >
                        <p
                          className="font-medium text-sm"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {size.label}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: 'var(--color-textMuted)' }}
                        >
                          {size.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Salary Expectations (USD/year)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label=""
                      type="number"
                      value={data.salary_expectation_min?.toString() || ''}
                      onChange={(e) => setData({ ...data, salary_expectation_min: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Minimum"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                    <Input
                      label=""
                      type="number"
                      value={data.salary_expectation_max?.toString() || ''}
                      onChange={(e) => setData({ ...data, salary_expectation_max: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Maximum"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Links */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Share Your Work
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Optional: Add links to showcase your experience
                  </p>
                </div>

                <Input
                  label="LinkedIn Profile"
                  type="url"
                  value={data.linkedin_url}
                  onChange={(e) => setData({ ...data, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  leftIcon={<LinkIcon className="w-4 h-4" />}
                />

                <Input
                  label="GitHub Profile"
                  type="url"
                  value={data.github_url}
                  onChange={(e) => setData({ ...data, github_url: e.target.value })}
                  placeholder="https://github.com/yourusername"
                  leftIcon={<LinkIcon className="w-4 h-4" />}
                />

                <Input
                  label="Portfolio / Website"
                  type="url"
                  value={data.portfolio_url}
                  onChange={(e) => setData({ ...data, portfolio_url: e.target.value })}
                  placeholder="https://yourportfolio.com"
                  leftIcon={<LinkIcon className="w-4 h-4" />}
                />

                <div
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <CheckCircle2
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--color-success)' }}
                  />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text)' }}
                    >
                      You're all set!
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      Click "Complete Setup" to save your profile and start the personality assessment. You can update these details anytime in settings.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between p-6 pt-0"
          >
            <div>
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              )}
            </div>
            <div>
              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {currentStep === 0 ? 'Get Started' : 'Continue'}
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  isLoading={isSaving}
                  rightIcon={!isSaving ? <ArrowRight className="w-4 h-4" /> : undefined}
                >
                  Complete & Take Assessment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
