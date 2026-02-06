import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, X, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'India',
  'China',
  'Japan',
  'Brazil',
  'Mexico',
  'Spain',
  'Italy',
  'Netherlands',
  'South Korea',
  'Singapore',
  'Ireland',
  'Sweden',
  'Switzerland',
  'Poland',
  'Belgium',
  'Austria',
  'Portugal',
  'Denmark',
  'Norway',
  'Finland',
  'New Zealand',
  'South Africa',
  'United Arab Emirates',
  'Saudi Arabia',
  'Israel',
  'Indonesia',
  'Malaysia',
  'Thailand',
  'Vietnam',
  'Philippines',
  'Argentina',
  'Colombia',
  'Chile',
  'Peru',
  'Egypt',
  'Nigeria',
  'Kenya',
  'Pakistan',
  'Bangladesh',
  'Russia',
  'Turkey',
  'Greece',
  'Czech Republic',
  'Romania',
  'Hungary',
  'Ukraine',
  'Hong Kong',
  'Taiwan',
  'Iceland',
  'Luxembourg',
  'Malta',
  'Cyprus',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Slovenia',
  'Croatia',
  'Serbia',
  'Bulgaria',
  'Slovakia',
  'Remote',
].sort();

export function LocationPicker({
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select country',
  error,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCountries = search
    ? COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full rounded-xl border text-sm transition-colors duration-150 text-left',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'pl-10 pr-10 py-2.5',
            error
              ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
              : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
          )}
          style={{
            backgroundColor: 'var(--color-surface)',
            color: value ? 'var(--color-text)' : 'var(--color-textMuted)',
          }}
        >
          {value || placeholder}
        </button>

        <div
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <MapPin className="w-4 h-4" />
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-[var(--color-background)]"
              style={{ color: 'var(--color-textMuted)' }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
            style={{ color: 'var(--color-textMuted)' }}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-[9999] mt-1 w-full rounded-xl border shadow-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
            }}
          >
            {/* Search */}
            <div className="p-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--color-textMuted)' }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>

            {/* Country list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map(country => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={cn(
                      'w-full px-4 py-2.5 text-sm text-left transition-colors',
                      'hover:bg-[var(--color-surface)]',
                      value === country && 'bg-[var(--color-accent)]/10'
                    )}
                    style={{
                      color: value === country ? 'var(--color-accent)' : 'var(--color-text)'
                    }}
                  >
                    {country}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
