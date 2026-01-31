import { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  DollarSign,
  Building2,
  Save,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../utils/cn';

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
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'On-site' },
  { id: 'flexible', label: 'Flexible' },
];

const COMPANY_SIZES = [
  { id: 'startup', label: 'Startup (1-50)' },
  { id: 'small', label: 'Small (51-200)' },
  { id: 'medium', label: 'Medium (201-1000)' },
  { id: 'large', label: 'Large (1000+)' },
  { id: 'any', label: 'Any Size' },
];

export function CandidateProfileSection() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  const [originalData, setOriginalData] = useState<CandidateData>(data);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (candidate) {
        const loadedData = {
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
        };
        setData(loadedData);
        setOriginalData(loadedData);
      }
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  const handleChange = (field: keyof CandidateData, value: string | number | null) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
      return newData;
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
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
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setOriginalData(data);
      setHasChanges(false);
      success('Work profile updated', 'Your changes have been saved.');
    } catch (err) {
      console.error('Save error:', err);
      showError('Failed to save', 'Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setData(originalData);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          Work Profile
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          Information visible to employers when you apply for jobs
        </p>
      </div>

      {/* Professional Info */}
      <div className="space-y-4">
        <h3
          className="text-sm font-medium flex items-center gap-2"
          style={{ color: 'var(--color-text)' }}
        >
          <User className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Professional Info
        </h3>

        <Input
          label="Professional Headline"
          type="text"
          value={data.headline}
          onChange={(e) => handleChange('headline', e.target.value)}
          placeholder="e.g., Senior Product Designer with 5+ years experience"
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
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell employers about yourself, your experience, and what you're looking for..."
            rows={4}
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
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., San Francisco, CA"
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Years of Experience"
            type="number"
            value={data.years_experience?.toString() || ''}
            onChange={(e) => handleChange('years_experience', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="e.g., 5"
            leftIcon={<Briefcase className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Work Preferences */}
      <div className="space-y-4">
        <h3
          className="text-sm font-medium flex items-center gap-2"
          style={{ color: 'var(--color-text)' }}
        >
          <Building2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Work Preferences
        </h3>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Preferred Work Style
          </label>
          <div className="flex flex-wrap gap-2">
            {WORK_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleChange('preferred_work_style', style.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  data.preferred_work_style === style.id
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
                )}
                style={{
                  color: data.preferred_work_style === style.id ? undefined : 'var(--color-text)',
                }}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Preferred Company Size
          </label>
          <div className="flex flex-wrap gap-2">
            {COMPANY_SIZES.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => handleChange('preferred_company_size', size.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  data.preferred_company_size === size.id
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
                )}
                style={{
                  color: data.preferred_company_size === size.id ? undefined : 'var(--color-text)',
                }}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Salary Expectations (USD/year)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label=""
              type="number"
              value={data.salary_expectation_min?.toString() || ''}
              onChange={(e) => handleChange('salary_expectation_min', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Minimum"
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
            <Input
              label=""
              type="number"
              value={data.salary_expectation_max?.toString() || ''}
              onChange={(e) => handleChange('salary_expectation_max', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Maximum"
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="space-y-4">
        <h3
          className="text-sm font-medium flex items-center gap-2"
          style={{ color: 'var(--color-text)' }}
        >
          <LinkIcon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Links
        </h3>

        <Input
          label="LinkedIn"
          type="url"
          value={data.linkedin_url}
          onChange={(e) => handleChange('linkedin_url', e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
        />

        <Input
          label="GitHub"
          type="url"
          value={data.github_url}
          onChange={(e) => handleChange('github_url', e.target.value)}
          placeholder="https://github.com/yourusername"
        />

        <Input
          label="Portfolio / Website"
          type="url"
          value={data.portfolio_url}
          onChange={(e) => handleChange('portfolio_url', e.target.value)}
          placeholder="https://yourportfolio.com"
        />
      </div>

      {/* Actions */}
      {hasChanges && (
        <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
