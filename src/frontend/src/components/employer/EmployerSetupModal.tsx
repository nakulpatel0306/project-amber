import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Users,
  Link as LinkIcon,
  MapPin,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils/cn';

interface EmployerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface EmployerData {
  company_name: string;
  company_description: string;
  company_size: string;
  industry: string;
  location: string;
  website_url: string;
  linkedin_url: string;
}

const COMPANY_SIZES = [
  { id: 'startup', label: 'Startup', description: '1-50 employees' },
  { id: 'small', label: 'Small', description: '51-200 employees' },
  { id: 'medium', label: 'Medium', description: '201-1000 employees' },
  { id: 'large', label: 'Large', description: '1000+ employees' },
  { id: 'enterprise', label: 'Enterprise', description: '10,000+ employees' },
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Consulting',
  'Non-profit',
  'Other',
];

const STEPS = [
  { id: 'intro', title: 'Welcome', icon: Sparkles },
  { id: 'company', title: 'Company', icon: Building2 },
  { id: 'details', title: 'Details', icon: Users },
  { id: 'links', title: 'Links', icon: LinkIcon },
];

export function EmployerSetupModal({ isOpen, onClose, onComplete }: EmployerSetupModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { success, error: showError } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<EmployerData>({
    company_name: '',
    company_description: '',
    company_size: 'small',
    industry: '',
    location: '',
    website_url: '',
    linkedin_url: '',
  });

  // Load existing employer data if any
  useEffect(() => {
    if (!user || !isOpen) return;

    const loadEmployerData = async () => {
      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (employer) {
        setData({
          company_name: employer.company_name || '',
          company_description: employer.company_description || '',
          company_size: employer.company_size || 'small',
          industry: employer.industry || '',
          location: employer.location || '',
          website_url: employer.website_url || '',
          linkedin_url: employer.linkedin_url || '',
        });
      }
    };

    loadEmployerData();
  }, [user, isOpen]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
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
      // Update employer data
      const { error: employerError } = await supabase
        .from('employers')
        .update({
          company_name: data.company_name || null,
          company_description: data.company_description || null,
          company_size: data.company_size || null,
          industry: data.industry || null,
          location: data.location || null,
          website_url: data.website_url || null,
          linkedin_url: data.linkedin_url || null,
        })
        .eq('user_id', user.id);

      if (employerError) throw employerError;

      // Mark onboarding as complete
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      // Refresh profile to update the onboarding_completed flag in context
      await refreshProfile();

      success('Company setup complete!', 'You can update these details anytime in settings.');
      onComplete();
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
                  <Building2 className="w-10 h-10 text-white" />
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
                  Let's set up your company profile to find the perfect candidates.
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  This only takes a few minutes. You can skip and complete it later.
                </p>
              </div>
            )}

            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Tell Us About Your Company
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Help candidates understand who you are
                  </p>
                </div>

                <Input
                  label="Company Name"
                  type="text"
                  value={data.company_name}
                  onChange={(e) => setData({ ...data, company_name: e.target.value })}
                  placeholder="e.g., Acme Corporation"
                  leftIcon={<Building2 className="w-4 h-4" />}
                />

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Company Description
                  </label>
                  <textarea
                    value={data.company_description}
                    onChange={(e) => setData({ ...data, company_description: e.target.value })}
                    placeholder="Tell candidates about your company, mission, and what makes you unique..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Industry
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => setData({ ...data, industry })}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          data.industry === industry
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
                        )}
                        style={{
                          color: data.industry === industry ? undefined : 'var(--color-text)',
                        }}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Company Details
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Help us match you with the right candidates
                  </p>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Company Size
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {COMPANY_SIZES.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setData({ ...data, company_size: size.id })}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all',
                          data.company_size === size.id
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                            : 'border-[var(--color-border)] hover:border-[var(--color-borderHover)]'
                        )}
                        style={{
                          backgroundColor: data.company_size === size.id
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

                <Input
                  label="Headquarters Location"
                  type="text"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
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
                    Company Links
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Help candidates learn more about you
                  </p>
                </div>

                <Input
                  label="Company Website"
                  type="url"
                  value={data.website_url}
                  onChange={(e) => setData({ ...data, website_url: e.target.value })}
                  placeholder="https://yourcompany.com"
                  leftIcon={<Globe className="w-4 h-4" />}
                />

                <Input
                  label="LinkedIn Company Page"
                  type="url"
                  value={data.linkedin_url}
                  onChange={(e) => setData({ ...data, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/company/yourcompany"
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
                      Click "Complete Setup" to save your company profile. Next, take the culture quiz to start matching with candidates.
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
                  rightIcon={!isSaving ? <CheckCircle2 className="w-4 h-4" /> : undefined}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
