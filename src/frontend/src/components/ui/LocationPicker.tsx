import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LocationData {
  city: string;
  state: string;
  country: string;
}

interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

// Common countries
const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'India',
  'Singapore',
  'Netherlands',
  'Ireland',
  'Spain',
  'Italy',
  'Japan',
  'Brazil',
  'Mexico',
  'Other',
];

// US States
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
];

// Canadian Provinces
const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon',
];

// UK Countries/Regions
const UK_REGIONS = [
  'England', 'Scotland', 'Wales', 'Northern Ireland',
];

// Australian States
const AU_STATES = [
  'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
  'South Australia', 'Tasmania', 'Victoria', 'Western Australia',
];

// German States
const DE_STATES = [
  'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
  'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia',
  'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia',
];

// Indian States
const IN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other',
];

function getStatesForCountry(country: string): string[] {
  switch (country) {
    case 'United States':
      return US_STATES;
    case 'Canada':
      return CA_PROVINCES;
    case 'United Kingdom':
      return UK_REGIONS;
    case 'Australia':
      return AU_STATES;
    case 'Germany':
      return DE_STATES;
    case 'India':
      return IN_STATES;
    default:
      return [];
  }
}

function getStateLabel(country: string): string {
  switch (country) {
    case 'United States':
      return 'State';
    case 'Canada':
      return 'Province';
    case 'United Kingdom':
      return 'Region';
    case 'Australia':
      return 'State/Territory';
    case 'Germany':
      return 'State';
    case 'India':
      return 'State';
    default:
      return 'State/Province';
  }
}

function parseLocation(locationString: string): LocationData {
  if (!locationString) {
    return { city: '', state: '', country: '' };
  }

  const parts = locationString.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    return { city: parts[0], state: parts[1], country: parts[2] };
  } else if (parts.length === 2) {
    // Could be "City, Country" or "City, State"
    const possibleCountry = parts[1];
    if (COUNTRIES.includes(possibleCountry)) {
      return { city: parts[0], state: '', country: possibleCountry };
    }
    return { city: parts[0], state: parts[1], country: '' };
  } else if (parts.length === 1) {
    return { city: parts[0], state: '', country: '' };
  }

  return { city: '', state: '', country: '' };
}

function formatLocation(data: LocationData): string {
  const parts = [data.city, data.state, data.country].filter(Boolean);
  return parts.join(', ');
}

export function LocationPicker({
  value,
  onChange,
  label = 'Location',
  placeholder = 'Select your location',
  error,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>(() => parseLocation(value));
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update local state when value changes externally
  useEffect(() => {
    setLocationData(parseLocation(value));
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = (field: keyof LocationData, fieldValue: string) => {
    const newData = { ...locationData, [field]: fieldValue };

    // Reset state when country changes
    if (field === 'country' && fieldValue !== locationData.country) {
      newData.state = '';
    }

    setLocationData(newData);
    onChange(formatLocation(newData));
  };

  const handleClear = () => {
    setLocationData({ city: '', state: '', country: '' });
    onChange('');
  };

  const states = getStatesForCountry(locationData.country);
  const stateLabel = getStateLabel(locationData.country);
  const filteredCountries = countrySearch
    ? COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
    : COUNTRIES;

  const displayValue = formatLocation(locationData);

  return (
    <div className="w-full" ref={dropdownRef}>
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
            color: displayValue ? 'var(--color-text)' : 'var(--color-textMuted)',
          }}
        >
          {displayValue || placeholder}
        </button>

        <div
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <MapPin className="w-4 h-4" />
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {displayValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
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
            className="absolute z-50 mt-2 w-full rounded-xl border shadow-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="p-4 space-y-4">
              {/* Country */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  Country
                </label>
                <input
                  type="text"
                  value={countrySearch || locationData.country}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    if (!e.target.value) {
                      handleLocationChange('country', '');
                    }
                  }}
                  onFocus={() => setCountrySearch(locationData.country)}
                  placeholder="Search countries..."
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                {countrySearch && (
                  <div
                    className="mt-1 max-h-32 overflow-y-auto rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {filteredCountries.map(country => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => {
                          handleLocationChange('country', country);
                          setCountrySearch('');
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-[var(--color-background)] transition-colors"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* State/Province (if applicable) */}
              {locationData.country && states.length > 0 && (
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {stateLabel}
                  </label>
                  <select
                    value={locationData.state}
                    onChange={(e) => handleLocationChange('state', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <option value="">Select {stateLabel.toLowerCase()}</option>
                    {states.map(state => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* State/Province for Other countries */}
              {locationData.country && states.length === 0 && (
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    State/Province (optional)
                  </label>
                  <input
                    type="text"
                    value={locationData.state}
                    onChange={(e) => handleLocationChange('state', e.target.value)}
                    placeholder="Enter state or province"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                </div>
              )}

              {/* City */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  City
                </label>
                <input
                  type="text"
                  value={locationData.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  placeholder="Enter city name"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              {/* Done Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                }}
              >
                Done
              </button>
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
