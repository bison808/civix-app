'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, CheckCircle, AlertTriangle, Loader2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

// Common US ZIP codes for auto-complete (expanded beyond just California)
const POPULAR_ZIP_CODES = [
  // California
  { zip: '90210', city: 'Beverly Hills', state: 'CA', county: 'Los Angeles' },
  { zip: '94102', city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  { zip: '95014', city: 'Cupertino', state: 'CA', county: 'Santa Clara' },
  { zip: '92101', city: 'San Diego', state: 'CA', county: 'San Diego' },
  // New York
  { zip: '10001', city: 'New York', state: 'NY', county: 'New York' },
  { zip: '10013', city: 'New York', state: 'NY', county: 'New York' },
  { zip: '11201', city: 'Brooklyn', state: 'NY', county: 'Kings' },
  // Texas
  { zip: '75201', city: 'Dallas', state: 'TX', county: 'Dallas' },
  { zip: '77001', city: 'Houston', state: 'TX', county: 'Harris' },
  { zip: '78701', city: 'Austin', state: 'TX', county: 'Travis' },
  // Florida
  { zip: '33101', city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  { zip: '32801', city: 'Orlando', state: 'FL', county: 'Orange' },
  // Illinois
  { zip: '60601', city: 'Chicago', state: 'IL', county: 'Cook' },
  // Washington
  { zip: '98101', city: 'Seattle', state: 'WA', county: 'King' },
  // Massachusetts
  { zip: '02108', city: 'Boston', state: 'MA', county: 'Suffolk' },
];

interface ZipCodeSuggestion {
  zip: string;
  city: string;
  state: string;
  county: string;
}

interface EnhancedZipInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidZip?: (zipData: ZipCodeSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  showLocationIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

export default function EnhancedZipInput({
  value,
  onChange,
  onValidZip,
  placeholder = 'Enter your ZIP code...',
  disabled = false,
  showLocationIcon = true,
  className = '',
  size = 'md',
  autoFocus = false
}: EnhancedZipInputProps) {
  const [suggestions, setSuggestions] = useState<ZipCodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState<'none' | 'valid' | 'invalid' | 'supported' | 'limited'>('none');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'text-sm h-9 px-3',
    md: 'text-base h-11 px-4',
    lg: 'text-lg h-12 px-4'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // Filter suggestions based on input
  useEffect(() => {
    if (value.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      setValidationState('none');
      return;
    }

    if (value.length >= 2) {
      const filtered = POPULAR_ZIP_CODES.filter(item =>
        item.zip.startsWith(value) ||
        item.city.toLowerCase().includes(value.toLowerCase()) ||
        item.county.toLowerCase().includes(value.toLowerCase()) ||
        item.state.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && value !== filtered[0]?.zip);
    }

    // Validate ZIP code format and state
    if (value.length === 5) {
      validateZipCode(value);
    } else {
      setValidationState('none');
    }
  }, [value]);

  const validateZipCode = async (zip: string) => {
    setIsValidating(true);
    
    // Basic format validation
    if (!/^\d{5}$/.test(zip)) {
      setValidationState('invalid');
      setIsValidating(false);
      return;
    }

    try {
      // Call the real ZIP verification API
      const response = await fetch('/api/auth/verify-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode: zip })
      });

      const data = await response.json();

      if (data.valid) {
        if (data.coverage === 'full_coverage') {
          setValidationState('supported');
          onValidZip?.({ 
            zip, 
            city: data.city, 
            state: data.state,
            county: data.county 
          });
        } else if (data.coverage === 'federal_only') {
          setValidationState('limited');
          onValidZip?.({ 
            zip, 
            city: data.city, 
            state: data.state,
            county: data.county 
          });
        } else {
          setValidationState('valid');
          onValidZip?.({ 
            zip, 
            city: data.city, 
            state: data.state,
            county: data.county 
          });
        }
      } else {
        setValidationState('invalid');
      }
    } catch (error) {
      // Fall back to basic validation if API fails
      const exactMatch = POPULAR_ZIP_CODES.find(item => item.zip === zip);
      
      if (exactMatch) {
        setValidationState(exactMatch.state === 'CA' ? 'supported' : 'limited');
        onValidZip?.(exactMatch);
      } else {
        // Basic US ZIP code range check
        const zipNum = parseInt(zip);
        if (zipNum >= 501 && zipNum <= 99950) {
          setValidationState('limited');
          onValidZip?.({ zip, city: 'Unknown', state: 'Unknown', county: 'Unknown' });
        } else {
          setValidationState('invalid');
        }
      }
    }
    
    setIsValidating(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: ZipCodeSuggestion) => {
    onChange(suggestion.zip);
    onValidZip?.(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="animate-spin text-gray-400" size={iconSizes[size]} />;
    }

    switch (validationState) {
      case 'supported':
        return <CheckCircle className="text-green-500" size={iconSizes[size]} />;
      case 'limited':
        return <Globe className="text-blue-500" size={iconSizes[size]} />;
      case 'valid':
        return <CheckCircle className="text-green-500" size={iconSizes[size]} />;
      case 'invalid':
        return <AlertTriangle className="text-red-500" size={iconSizes[size]} />;
      default:
        return showLocationIcon ? <MapPin className="text-gray-400" size={iconSizes[size]} /> : null;
    }
  };

  const getValidationMessage = () => {
    switch (validationState) {
      case 'invalid':
        return 'Please enter a valid 5-digit ZIP code';
      case 'supported':
        return 'Full political data available';
      case 'limited':
        return 'Federal representatives available';
      case 'valid':
        return 'Valid ZIP code';
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'w-full border border-gray-300 rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500',
            sizeClasses[size],
            showLocationIcon || validationState !== 'none' ? 'pr-12' : '',
            validationState === 'invalid' 
              ? 'border-red-300 focus:ring-red-500' 
              : validationState === 'supported' 
                ? 'border-green-300 focus:ring-green-500' 
                : validationState === 'limited'
                  ? 'border-blue-300 focus:ring-blue-500'
                  : validationState === 'valid'
                    ? 'border-green-300 focus:ring-green-500'
                    : ''
          )}
          maxLength={5}
          inputMode="numeric"
          autoComplete="postal-code"
        />
        
        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {/* Validation Message */}
      {validationState !== 'none' && (
        <p className={cn(
          'mt-1 text-sm',
          validationState === 'invalid' 
            ? 'text-red-600' 
            : validationState === 'supported'
              ? 'text-green-600'
              : validationState === 'limited'
                ? 'text-blue-600'
                : 'text-green-600'
        )}>
          {getValidationMessage()}
        </p>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.zip}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                'flex items-center justify-between border-b border-gray-100 last:border-b-0',
                selectedIndex === index ? 'bg-blue-50 text-blue-900' : ''
              )}
            >
              <div className="flex items-center gap-3">
                <MapPin className="text-gray-400 flex-shrink-0" size={16} />
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.zip}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.city}, {suggestion.state} • {suggestion.county} County
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Educational Helper */}
      {value.length === 0 && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <Search size={12} />
          Try searching by ZIP code, city, state, or county name
        </div>
      )}
    </div>
  );
}