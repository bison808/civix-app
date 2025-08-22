'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/core/Button';
import { CivixLogo } from '@/components/CivixLogo';
// import OnboardingCarousel from '@/components/onboarding/OnboardingCarousel';
import { authApi } from '@/services/authApi';

export default function LandingPage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationInfo, setLocationInfo] = useState<{ city?: string; state?: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyZipCode(zipCode);
      if (response.valid) {
        // Store ZIP and location info in localStorage and cookies
        localStorage.setItem('userZipCode', zipCode);
        document.cookie = `userZipCode=${zipCode}; path=/; max-age=86400`;
        if (response.city && response.state) {
          setLocationInfo({ city: response.city, state: response.state });
          localStorage.setItem('userLocation', JSON.stringify({
            city: response.city,
            state: response.state,
            county: response.county
          }));
        }
        
        // Show confirmation before proceeding
        setShowConfirmation(true);
        
        // Auto-proceed after 2 seconds or let user click continue
        setTimeout(() => {
          if (showConfirmation) {
            // Check if user already has a session that middleware will accept
            const hasValidSession = authApi.isAuthenticatedForMiddleware();
            if (hasValidSession) {
              router.push('/feed');
            } else {
              router.push('/register');
            }
          }
        }, 2000);
      } else {
        setError('Please enter a valid 5-digit ZIP code');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Check if user already has a session that middleware will accept
    const hasValidSession = authApi.isAuthenticatedForMiddleware();
    if (hasValidSession) {
      router.push('/feed');
    } else {
      router.push('/register');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Logo */}
        <div className="text-center">
          <CivixLogo size="xl" showTagline={true} animated={true} />
        </div>

        {showConfirmation && locationInfo ? (
          /* Location Confirmation */
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-2xl">📍</div>
              <h2 className="text-xl font-semibold">Location Confirmed</h2>
              <p className="text-gray-600">
                {locationInfo.city}, {locationInfo.state} {zipCode}
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                We'll show you bills and representatives that affect your area
              </p>
            </div>

            <Button
              onClick={handleContinue}
              variant="primary"
              size="lg"
              fullWidth
            >
              Continue to Registration
            </Button>
          </div>
        ) : (
          /* ZIP Code Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your ZIP code to get started
              </label>
              <input
                id="zipCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                value={zipCode}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  console.log('ZIP code input:', cleaned, 'length:', cleaned.length);
                  setZipCode(cleaned);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-delta focus:border-delta touch-feedback"
                placeholder="90210"
                required
                disabled={loading}
                aria-label="ZIP code"
                autoComplete="postal-code"
              />
              {error && (
                <p className="mt-2 text-sm text-negative">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading || zipCode.length !== 5}
              className={zipCode.length === 5 ? 'opacity-100' : 'opacity-50'}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify & Start'}
            </Button>
          </form>
        )}

        {/* Privacy Note */}
        {!showConfirmation && (
          <div className="text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700 underline">
              Why we need this
            </button>
            <p className="mt-2 text-xs text-gray-500">
              We use your ZIP code to show you bills and representatives specific to your area
            </p>
          </div>
        )}
        </div>
      </div>
  );
}