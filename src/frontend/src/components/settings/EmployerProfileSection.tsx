import { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Link as LinkIcon,
  Users,
  Save,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LocationPicker } from '../ui/LocationPicker';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { cn } from '../../utils/cn';

interface EmployerData {
  company_name: string;
  description: string;
  company_size: string;
  industry: string;
  location: string;
  company_website: string;
}

const COMPANY_SIZES = [
  { id: '1-10', label: 'Startup (1-10)' },
  { id: '11-50', label: 'Small (11-50)' },
  { id: '51-200', label: 'Growing (51-200)' },
  { id: '201-500', label: 'Mid-size (201-500)' },
  { id: '500+', label: 'Enterprise (500+)' },
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

export function EmployerProfileSection() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [data, setData] = useState<EmployerData>({
    company_name: '',
    description: '',
    company_size: '11-50',
    industry: '',
    location: '',
    company_website: '',
  });

  const [originalData, setOriginalData] = useState<EmployerData>(data);
  const [dataLoaded, setDataLoaded] = useState(false);

  const showLoader = useMinLoader(isLoading);

  // Use user.id as dependency to prevent unnecessary reloads
  const userId = user?.id;

  useEffect(() => {
    if (!userId || dataLoaded) return;

    const loadData = async () => {
      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (employer) {
        const loadedData = {
          company_name: employer.company_name || '',
          description: employer.description || '',
          company_size: employer.company_size || '11-50',
          industry: employer.industry || '',
          location: employer.location || '',
          company_website: employer.company_website || '',
        };
        setData(loadedData);
        setOriginalData(loadedData);
      }
      setIsLoading(false);
      setDataLoaded(true);
    };

    loadData();
  }, [userId, dataLoaded]);

  const handleChange = (field: keyof EmployerData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Track changes separately using useEffect to avoid stale closures
  useEffect(() => {
    if (dataLoaded) {
      setHasChanges(JSON.stringify(data) !== JSON.stringify(originalData));
    }
  }, [data, originalData, dataLoaded]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('employers')
        .upsert({
          user_id: user.id,
          company_name: data.company_name || 'My Company',
          description: data.description || null,
          company_size: data.company_size || null,
          industry: data.industry || null,
          location: data.location || null,
          company_website: data.company_website || null,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setOriginalData(data);
      setHasChanges(false);
      success('Company profile updated', 'Your changes have been saved.');
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

  if (showLoader) {
    return (
      <CoffeeBrewLoader variant="fullscreen" message="Loading company profile..." />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          Company Profile
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          Information visible to candidates when they view your job postings
        </p>
      </div>

      {/* Company Info */}
      <div className="space-y-4">
        <h3
          className="text-sm font-medium flex items-center gap-2"
          style={{ color: 'var(--color-text)' }}
        >
          <Building2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Company Information
        </h3>

        <Input
          label="Company Name"
          type="text"
          value={data.company_name}
          onChange={(e) => handleChange('company_name', e.target.value)}
          placeholder="e.g., Acme Corporation"
        />

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Company Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Tell candidates about your company, mission, and culture..."
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
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Industry
            </label>
            <select
              value={data.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
          <LocationPicker
            label="Headquarters"
            value={data.location}
            onChange={(location) => handleChange('location', location)}
            placeholder="Select headquarters location"
          />
        </div>
      </div>

      {/* Company Size */}
      <div className="space-y-4">
        <h3
          className="text-sm font-medium flex items-center gap-2"
          style={{ color: 'var(--color-text)' }}
        >
          <Users className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Company Size
        </h3>

        <div className="flex flex-wrap gap-2">
          {COMPANY_SIZES.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => handleChange('company_size', size.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                data.company_size === size.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
              )}
              style={{
                color: data.company_size === size.id ? undefined : 'var(--color-text)',
              }}
            >
              {size.label}
            </button>
          ))}
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
          label="Company Website"
          type="url"
          value={data.company_website}
          onChange={(e) => handleChange('company_website', e.target.value)}
          placeholder="https://yourcompany.com"
          leftIcon={<Globe className="w-4 h-4" />}
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
