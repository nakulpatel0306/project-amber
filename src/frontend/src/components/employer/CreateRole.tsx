import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Sparkles,
  Briefcase,
  AlertCircle,
  FileText,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { JOB_SECTORS } from '../../utils/constants';

type CreateRoleStep = 'basics' | 'details' | 'culture' | 'review' | 'saving' | 'complete';

interface RoleFormData {
  title: string;
  sector: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
  preferredTraits: string[];
  teamSize: string;
  reportingTo: string;
}

const traitOptions = [
  { value: 'collaborative', label: 'Collaborative' },
  { value: 'independent', label: 'Independent' },
  { value: 'creative', label: 'Creative' },
  { value: 'analytical', label: 'Analytical' },
  { value: 'detail-oriented', label: 'Detail-Oriented' },
  { value: 'big-picture', label: 'Big-Picture Thinker' },
  { value: 'fast-paced', label: 'Thrives In Fast Pace' },
  { value: 'methodical', label: 'Methodical' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'direct', label: 'Direct Communicator' },
  { value: 'adaptable', label: 'Adaptable' },
  { value: 'structured', label: 'Prefers Structure' },
];

const STEPS = [
  { key: 'basics', label: 'Basics', icon: Briefcase },
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'culture', label: 'Culture Fit', icon: Heart },
  { key: 'review', label: 'Review', icon: Check },
] as const;

function parseSalary(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (value.toLowerCase().includes('k') || num < 1000) {
    return num * 1000;
  }
  return num;
}

const fadeSlide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

export function CreateRole() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [step, setStep] = useState<CreateRoleStep>('basics');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    title: '',
    sector: '',
    location: '',
    locationType: 'remote',
    employmentType: 'full_time',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    preferredTraits: [],
    teamSize: '',
    reportingTo: '',
  });

  const updateField = <K extends keyof RoleFormData>(field: K, value: RoleFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTrait = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTraits: prev.preferredTraits.includes(trait)
        ? prev.preferredTraits.filter(t => t !== trait)
        : [...prev.preferredTraits, trait],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setStep('saving');
    setSubmitError(null);

    try {
      const { data: employer, error: employerError } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (employerError || !employer) {
        throw new Error('No employer profile found. Please complete your company setup first.');
      }

      const requirementsArray = formData.requirements
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      const { error: insertError } = await supabase
        .from('roles')
        .insert({
          employer_id: employer.id,
          title: formData.title,
          description: formData.description,
          requirements: requirementsArray,
          nice_to_have: formData.preferredTraits,
          location: formData.location,
          work_style: formData.locationType,
          salary_min: parseSalary(formData.salaryMin),
          salary_max: parseSalary(formData.salaryMax),
          employment_type: formData.employmentType,
          status: 'active',
        });

      if (insertError) throw insertError;

      success('Role created!', `${formData.title} is now live and ready for matching.`);
      setStep('complete');
    } catch (err) {
      console.error('Error creating role:', err);
      const message = err instanceof Error ? err.message : 'Failed to create role. Please try again.';
      setSubmitError(message);
      showError('Failed to create role', message);
      setStep('review');
    }
  };

  const canProceedFromBasics = formData.title && formData.sector && formData.location && formData.salaryMin && formData.salaryMax;
  const canProceedFromDetails = formData.description && formData.requirements && formData.teamSize && formData.reportingTo;
  const canProceedFromCulture = formData.preferredTraits.length >= 2;

  const sectorLabel = JOB_SECTORS.find(s => s.id === formData.sector)?.label || formData.sector;
  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  // Saving screen
  if (step === 'saving') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-background)' }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Loader2
            className="w-12 h-12 mx-auto mb-6 animate-spin"
            style={{ color: 'var(--color-accent)' }}
          />
          <h2
            className="text-2xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Creating your role...
          </h2>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Setting up candidate matching //
          </p>
        </motion.div>
      </div>
    );
  }

  // Complete screen
  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-background)' }}>
        <motion.div
          className="w-full max-w-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)',
            }}
          >
            <Check className="w-10 h-10 text-white" />
          </div>

          <h2
            className="text-2xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Role Created
          </h2>
          <p
            className="text-sm mb-1"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {formData.title} is now live
          </p>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em] mb-8"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Matching candidates to your culture preferences //
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/app/employer/roles')}
            >
              View All Roles
            </Button>
            <Button
              onClick={() => navigate('/app/employer/candidates')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse Candidates
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-4xl mx-auto px-6 py-8 w-full">

        {/* Header — bento-card with stat pills matching other pages */}
        <motion.div
          className="bento-card p-6 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)' }}
            >
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
              >
                Create A New Role
              </h1>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Define the position and ideal candidate //
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                {STEPS.map((s, i) => {
                  const isActive = s.key === step;
                  const isComplete = currentStepIndex > i;
                  const color = isActive ? '#f59e0b' : isComplete ? '#10B981' : undefined;
                  return (
                    <span
                      key={s.key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        background: color
                          ? `linear-gradient(135deg, ${color}18, ${color}08)`
                          : 'var(--color-surface)',
                        border: `1px solid ${color ? `${color}30` : 'var(--color-border)'}`,
                        color: color || 'var(--color-textMuted)',
                      }}
                    >
                      {isComplete ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{
                            backgroundColor: color ? `${color}20` : 'var(--color-border)',
                            color: color || 'var(--color-textMuted)',
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                      <span style={{ color: isActive ? 'var(--color-text)' : isComplete ? '#10B981' : 'var(--color-textMuted)' }}>
                        {s.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="bento-card mb-6"
            {...fadeSlide}
          >
            {step === 'basics' && (
              <div className="space-y-5">
                <div>
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-2"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Job Title //
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => updateField('title', e.target.value)}
                    placeholder="e.g. Senior Product Designer"
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-3"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Sector / Department //
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_SECTORS.map(sector => {
                      const isSelected = formData.sector === sector.id;
                      return (
                        <button
                          key={sector.id}
                          type="button"
                          onClick={() => updateField('sector', sector.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            backgroundColor: isSelected
                              ? 'var(--color-accent)'
                              : 'var(--color-surface)',
                            border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            color: isSelected
                              ? 'white'
                              : 'var(--color-textSecondary)',
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {sector.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-3"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Location //
                  </label>
                  <div className="flex gap-2 mb-3">
                    {(['remote', 'hybrid', 'onsite'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => updateField('locationType', type)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor:
                            formData.locationType === type
                              ? 'var(--color-accent)'
                              : 'var(--color-surface)',
                          border: `1px solid ${formData.locationType === type ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          color:
                            formData.locationType === type
                              ? 'white'
                              : 'var(--color-textSecondary)',
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => updateField('location', e.target.value)}
                    placeholder={
                      formData.locationType === 'remote'
                        ? 'e.g. US, Worldwide, PST timezone'
                        : 'e.g. San Francisco, CA'
                    }
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-2"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      Employment Type //
                    </label>
                    <div className="relative">
                      <select
                        value={formData.employmentType}
                        onChange={e => updateField('employmentType', e.target.value as RoleFormData['employmentType'])}
                        className="w-full appearance-none px-4 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      >
                        <option value="full_time">Full-Time</option>
                        <option value="part_time">Part-Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-textMuted)' }} />
                    </div>
                  </div>

                  <div>
                    <label
                      className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-2"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      Salary Range //
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.salaryMin}
                        onChange={e => updateField('salaryMin', e.target.value)}
                        placeholder="80k"
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                      <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>—</span>
                      <input
                        type="text"
                        value={formData.salaryMax}
                        onChange={e => updateField('salaryMax', e.target.value)}
                        placeholder="120k"
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-5">
                <div>
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-2"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Role Description //
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-2"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Requirements (one per line) //
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={e => updateField('requirements', e.target.value)}
                    placeholder={"3+ years experience in product design\nProficiency with Figma\nStrong communication skills"}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-2"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      Team Size //
                    </label>
                    <input
                      type="text"
                      value={formData.teamSize}
                      onChange={e => updateField('teamSize', e.target.value)}
                      placeholder="e.g. 5 people"
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="font-mono text-[10px] uppercase tracking-[0.25em] block mb-2"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      Reports To //
                    </label>
                    <input
                      type="text"
                      value={formData.reportingTo}
                      onChange={e => updateField('reportingTo', e.target.value)}
                      placeholder="e.g. Head of Design"
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 'culture' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)' }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3
                        className="text-base font-bold tracking-tight"
                        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
                      >
                        Ideal Candidate Traits
                      </h3>
                      <p
                        className="font-mono text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        Select at least 2 traits //
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {traitOptions.map(trait => {
                      const isSelected = formData.preferredTraits.includes(trait.value);
                      return (
                        <button
                          key={trait.value}
                          onClick={() => toggleTrait(trait.value)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                          style={{
                            backgroundColor: isSelected
                              ? 'var(--color-accent)'
                              : 'var(--color-surface)',
                            border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            color: isSelected
                              ? 'white'
                              : 'var(--color-textSecondary)',
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {trait.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="bento-card"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <p
                    className="text-xs"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    These traits will be combined with your company culture profile to find candidates who are the best cultural fit for this specific role.
                  </p>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-5">
                {submitError && (
                  <div
                    className="p-3 rounded-xl flex items-start gap-3"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
                    <p className="text-xs" style={{ color: '#ef4444' }}>{submitError}</p>
                  </div>
                )}

                {/* Role title header */}
                <div>
                  <h3
                    className="text-lg font-bold tracking-tight"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
                  >
                    {formData.title}
                  </h3>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.25em] mt-0.5"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {sectorLabel} //
                  </p>
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b18, #f59e0b08)',
                      border: '1px solid #f59e0b30',
                      color: 'var(--color-text)',
                    }}
                  >
                    <MapPin className="w-3 h-3" style={{ color: '#f59e0b' }} />
                    {formData.locationType.charAt(0).toUpperCase() + formData.locationType.slice(1)} · {formData.location}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF618, #8B5CF608)',
                      border: '1px solid #8B5CF630',
                      color: 'var(--color-text)',
                    }}
                  >
                    <Clock className="w-3 h-3" style={{ color: '#8B5CF6' }} />
                    {formData.employmentType.replace('_', '-').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  {(formData.salaryMin || formData.salaryMax) && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #10B98118, #10B98108)',
                        border: '1px solid #10B98130',
                        color: 'var(--color-text)',
                      }}
                    >
                      <DollarSign className="w-3 h-3" style={{ color: '#10B981' }} />
                      {formData.salaryMin && formData.salaryMax
                        ? `${formData.salaryMin} – ${formData.salaryMax}`
                        : formData.salaryMin || formData.salaryMax}
                    </span>
                  )}
                  {formData.teamSize && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #EC489918, #EC489908)',
                        border: '1px solid #EC489930',
                        color: 'var(--color-text)',
                      }}
                    >
                      <Users className="w-3 h-3" style={{ color: '#EC4899' }} />
                      Team of {formData.teamSize}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4
                    className="text-base font-bold tracking-tight mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Description
                  </h4>
                  <p
                    className="text-sm whitespace-pre-wrap leading-relaxed"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {formData.description}
                  </p>
                </div>

                {/* Requirements */}
                <div>
                  <h4
                    className="text-base font-bold tracking-tight mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Requirements
                  </h4>
                  <div className="space-y-1.5">
                    {formData.requirements.split('\n').filter(Boolean).map((req, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{req.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traits */}
                <div>
                  <h4
                    className="text-base font-bold tracking-tight mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Ideal Candidate Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredTraits.map(trait => {
                      const label = traitOptions.find(t => t.value === trait)?.label || trait;
                      return (
                        <span
                          key={trait}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b18, #f59e0b08)',
                            border: '1px solid #f59e0b30',
                            color: 'var(--color-accent)',
                          }}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 'basics') navigate('/app/employer');
              else if (step === 'details') setStep('basics');
              else if (step === 'culture') setStep('details');
              else if (step === 'review') setStep('culture');
            }}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            {step === 'basics' ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onClick={() => {
              if (step === 'basics') setStep('details');
              else if (step === 'details') setStep('culture');
              else if (step === 'culture') setStep('review');
              else if (step === 'review') handleSubmit();
            }}
            disabled={
              (step === 'basics' && !canProceedFromBasics) ||
              (step === 'details' && !canProceedFromDetails) ||
              (step === 'culture' && !canProceedFromCulture)
            }
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {step === 'review' ? 'Publish Role' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
