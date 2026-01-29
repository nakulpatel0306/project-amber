import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '../ui/Button';

type CreateRoleStep = 'basics' | 'details' | 'culture' | 'review' | 'saving' | 'complete';

interface RoleFormData {
  title: string;
  department: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  employmentType: 'full-time' | 'part-time' | 'contract';
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
  preferredTraits: string[];
  teamSize: string;
  reportingTo: string;
}

const traitOptions = [
  { value: 'collaborative', label: 'collaborative' },
  { value: 'independent', label: 'independent' },
  { value: 'creative', label: 'creative' },
  { value: 'analytical', label: 'analytical' },
  { value: 'detail-oriented', label: 'detail-oriented' },
  { value: 'big-picture', label: 'big-picture thinker' },
  { value: 'fast-paced', label: 'thrives in fast pace' },
  { value: 'methodical', label: 'methodical' },
  { value: 'empathetic', label: 'empathetic' },
  { value: 'direct', label: 'direct communicator' },
  { value: 'adaptable', label: 'adaptable' },
  { value: 'structured', label: 'prefers structure' },
];

export function CreateRole() {
  const navigate = useNavigate();
  const [step, setStep] = useState<CreateRoleStep>('basics');
  const [formData, setFormData] = useState<RoleFormData>({
    title: '',
    department: '',
    location: '',
    locationType: 'remote',
    employmentType: 'full-time',
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
    setStep('saving');
    // TODO: Save to API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep('complete');
  };

  const canProceedFromBasics = formData.title && formData.department && formData.location;
  const canProceedFromDetails = formData.description && formData.requirements;
  const canProceedFromCulture = formData.preferredTraits.length >= 2;

  // Saving screen
  if (step === 'saving') {
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
            creating your role...
          </h2>
          <p
            className="text-sm"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            setting up candidate matching
          </p>
        </div>
      </div>
    );
  }

  // Complete screen
  if (step === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="w-full max-w-lg text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-success), #059669)',
            }}
          >
            <Check className="w-10 h-10 text-white" />
          </div>

          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            role created!
          </h2>
          <p
            className="text-sm mb-2"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {formData.title} is now live
          </p>
          <p
            className="text-sm mb-8"
            style={{ color: 'var(--color-textMuted)' }}
          >
            we'll start matching candidates based on your culture preferences
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/app/employer/roles')}
            >
              view all roles
            </Button>
            <Button
              onClick={() => navigate('/app/employer/candidates')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              browse candidates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          create a new role
        </h1>
        <p style={{ color: 'var(--color-textSecondary)' }}>
          define the position and the type of person who'd thrive in it
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: 'basics', label: 'basics' },
          { key: 'details', label: 'details' },
          { key: 'culture', label: 'culture fit' },
          { key: 'review', label: 'review' },
        ].map((s, i, arr) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  step === s.key
                    ? 'var(--color-accent)'
                    : arr.findIndex(x => x.key === step) > i
                    ? 'var(--color-success)'
                    : 'var(--color-border)',
                color:
                  step === s.key || arr.findIndex(x => x.key === step) > i
                    ? 'white'
                    : 'var(--color-textMuted)',
              }}
            >
              {arr.findIndex(x => x.key === step) > i ? (
                <Check className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className="text-sm hidden sm:block"
              style={{
                color: step === s.key ? 'var(--color-text)' : 'var(--color-textMuted)',
              }}
            >
              {s.label}
            </span>
            {i < arr.length - 1 && (
              <div
                className="flex-1 h-0.5 ml-2"
                style={{
                  backgroundColor:
                    arr.findIndex(x => x.key === step) > i
                      ? 'var(--color-success)'
                      : 'var(--color-border)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div
        className="p-6 rounded-2xl border mb-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {step === 'basics' && (
          <div className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                job title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="e.g. Senior Product Designer"
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
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={e => updateField('department', e.target.value)}
                placeholder="e.g. Design, Engineering, Marketing"
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
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                location
              </label>
              <div className="flex gap-3 mb-3">
                {(['remote', 'hybrid', 'onsite'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => updateField('locationType', type)}
                    className="px-4 py-2 rounded-lg border text-sm transition-all"
                    style={{
                      backgroundColor:
                        formData.locationType === type
                          ? 'rgba(217, 119, 6, 0.1)'
                          : 'transparent',
                      borderColor:
                        formData.locationType === type
                          ? 'var(--color-accent)'
                          : 'var(--color-border)',
                      color:
                        formData.locationType === type
                          ? 'var(--color-accent)'
                          : 'var(--color-textSecondary)',
                    }}
                  >
                    {type}
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
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  employment type
                </label>
                <select
                  value={formData.employmentType}
                  onChange={e => updateField('employmentType', e.target.value as RoleFormData['employmentType'])}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option value="full-time">full-time</option>
                  <option value="part-time">part-time</option>
                  <option value="contract">contract</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  salary range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.salaryMin}
                    onChange={e => updateField('salaryMin', e.target.value)}
                    placeholder="80k"
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <span style={{ color: 'var(--color-textMuted)' }}>-</span>
                  <input
                    type="text"
                    value={formData.salaryMax}
                    onChange={e => updateField('salaryMax', e.target.value)}
                    placeholder="120k"
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
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
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                role description
              </label>
              <textarea
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder="describe the role, responsibilities, and what a typical day looks like..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={e => updateField('requirements', e.target.value)}
                placeholder="list the skills, experience, and qualifications needed..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  team size
                </label>
                <input
                  type="text"
                  value={formData.teamSize}
                  onChange={e => updateField('teamSize', e.target.value)}
                  placeholder="e.g. 5 people"
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
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  reports to
                </label>
                <input
                  type="text"
                  value={formData.reportingTo}
                  onChange={e => updateField('reportingTo', e.target.value)}
                  placeholder="e.g. Head of Design"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
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
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                <h3
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  what traits would help someone thrive in this role?
                </h3>
              </div>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-textMuted)' }}
              >
                select at least 2 traits that describe the ideal candidate's personality
              </p>

              <div className="flex flex-wrap gap-2">
                {traitOptions.map(trait => {
                  const isSelected = formData.preferredTraits.includes(trait.value);
                  return (
                    <button
                      key={trait.value}
                      onClick={() => toggleTrait(trait.value)}
                      className="px-4 py-2 rounded-full border text-sm transition-all"
                      style={{
                        backgroundColor: isSelected
                          ? 'rgba(217, 119, 6, 0.1)'
                          : 'transparent',
                        borderColor: isSelected
                          ? 'var(--color-accent)'
                          : 'var(--color-border)',
                        color: isSelected
                          ? 'var(--color-accent)'
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
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <p
                className="text-xs"
                style={{ color: 'var(--color-textMuted)' }}
              >
                these traits will be combined with your company culture profile to find candidates who are the best cultural fit for this specific role
              </p>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div>
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                {formData.title}
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                {formData.department}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  {formData.locationType} · {formData.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  {formData.employmentType}
                </span>
              </div>
              {(formData.salaryMin || formData.salaryMax) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {formData.salaryMin && formData.salaryMax
                      ? `$${formData.salaryMin} - $${formData.salaryMax}`
                      : formData.salaryMin || formData.salaryMax}
                  </span>
                </div>
              )}
              {formData.teamSize && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    team of {formData.teamSize}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h4
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                description
              </h4>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                {formData.description}
              </p>
            </div>

            <div>
              <h4
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                requirements
              </h4>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                {formData.requirements}
              </p>
            </div>

            <div>
              <h4
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                ideal candidate traits
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.preferredTraits.map(trait => (
                  <span
                    key={trait}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(217, 119, 6, 0.1)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
          {step === 'basics' ? 'cancel' : 'back'}
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
          {step === 'review' ? 'publish role' : 'continue'}
        </Button>
      </div>
    </div>
  );
}
