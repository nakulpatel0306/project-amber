import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, X, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

// Major cities and tech hubs - sorted alphabetically
const LOCATIONS = [
  'Remote',
  // North America
  'San Francisco, CA',
  'New York, NY',
  'Los Angeles, CA',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Chicago, IL',
  'Denver, CO',
  'Miami, FL',
  'San Diego, CA',
  'Atlanta, GA',
  'Dallas, TX',
  'Houston, TX',
  'Phoenix, AZ',
  'Portland, OR',
  'San Jose, CA',
  'Palo Alto, CA',
  'Mountain View, CA',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Montreal, Canada',
  'Calgary, Canada',
  'Ottawa, Canada',
  // Europe
  'London, UK',
  'Berlin, Germany',
  'Munich, Germany',
  'Paris, France',
  'Amsterdam, Netherlands',
  'Dublin, Ireland',
  'Stockholm, Sweden',
  'Barcelona, Spain',
  'Madrid, Spain',
  'Zurich, Switzerland',
  'Vienna, Austria',
  'Copenhagen, Denmark',
  'Oslo, Norway',
  'Helsinki, Finland',
  'Lisbon, Portugal',
  'Milan, Italy',
  'Rome, Italy',
  'Brussels, Belgium',
  'Warsaw, Poland',
  'Prague, Czech Republic',
  'Budapest, Hungary',
  'Tallinn, Estonia',
  // Asia Pacific
  'Singapore',
  'Hong Kong',
  'Tokyo, Japan',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Bangalore, India',
  'Mumbai, India',
  'Delhi, India',
  'Hyderabad, India',
  'Beijing, China',
  'Shanghai, China',
  'Shenzhen, China',
  'Seoul, South Korea',
  'Taipei, Taiwan',
  'Auckland, New Zealand',
  'Jakarta, Indonesia',
  'Kuala Lumpur, Malaysia',
  'Bangkok, Thailand',
  'Ho Chi Minh City, Vietnam',
  'Manila, Philippines',
  // Middle East & Africa
  'Tel Aviv, Israel',
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Riyadh, Saudi Arabia',
  'Cape Town, South Africa',
  'Johannesburg, South Africa',
  'Lagos, Nigeria',
  'Nairobi, Kenya',
  'Cairo, Egypt',
  // Latin America
  'São Paulo, Brazil',
  'Mexico City, Mexico',
  'Buenos Aires, Argentina',
  'Bogotá, Colombia',
  'Santiago, Chile',
  'Lima, Peru',
].sort((a, b) => {
  // Keep "Remote" at the top
  if (a === 'Remote') return -1;
  if (b === 'Remote') return 1;
  return a.localeCompare(b);
});

export function LocationPicker({
  value,
  onChange,
  label = 'Location',
  placeholder = 'Select location',
  error,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLocations = search
    ? LOCATIONS.filter(loc => loc.toLowerCase().includes(search.toLowerCase()))
    : LOCATIONS;

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

  const handleSelect = (location: string) => {
    if (location === 'Other') {
      setShowCustomInput(true);
      setIsOpen(false);
      setSearch('');
    } else {
      onChange(location);
      setIsOpen(false);
      setSearch('');
      setShowCustomInput(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setShowCustomInput(false);
  };

  // Check if current value is a custom location (not in predefined list)
  const isCustomLocation = value && !LOCATIONS.includes(value);

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

      {/* Show custom input OR dropdown button */}
      {(showCustomInput || isCustomLocation) ? (
        <div className="relative">
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--color-textMuted)' }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter city, state/country"
            className={cn(
              'w-full pl-10 pr-20 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2',
              error
                ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
                : 'border-[var(--color-border)] focus:ring-[var(--color-accent)]'
            )}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setIsOpen(true);
              }}
              className="text-xs px-2 py-1 rounded hover:bg-[var(--color-background)]"
              style={{ color: 'var(--color-accent)' }}
            >
              Browse
            </button>
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
          </div>
        </div>
      ) : (
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
                  placeholder="Search cities..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>

            {/* Location list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                <>
                  {filteredLocations.map(location => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => handleSelect(location)}
                      className={cn(
                        'w-full px-4 py-2.5 text-sm text-left transition-colors',
                        'hover:bg-[var(--color-surface)]',
                        value === location && 'bg-[var(--color-accent)]/10'
                      )}
                      style={{
                        color: value === location ? 'var(--color-accent)' : 'var(--color-text)'
                      }}
                    >
                      {location}
                    </button>
                  ))}
                  {/* Other option */}
                  <button
                    type="button"
                    onClick={() => handleSelect('Other')}
                    className={cn(
                      'w-full px-4 py-2.5 text-sm text-left transition-colors border-t',
                      'hover:bg-[var(--color-surface)]'
                    )}
                    style={{
                      color: 'var(--color-textMuted)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    Other location...
                  </button>
                </>
              ) : (
                <div className="px-4 py-3 text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  No locations found.{' '}
                  <button
                    type="button"
                    onClick={() => handleSelect('Other')}
                    className="underline"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Enter custom location
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
