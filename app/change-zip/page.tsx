'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { CivixLogo } from '@/components/CivixLogo';
import { authApi } from '@/services/authApi';
import { MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChangeZipPage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationInfo, setLocationInfo] = useState<{ city?: string; state?: string } | null>(null);
  const [currentZip, setCurrentZip] = useState('');

  useEffect(() => {
    // Get current ZIP code
    const storedZip = localStorage.getItem('userZipCode');
    if (storedZip) {
      setCurrentZip(storedZip);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyZipCode(zipCode);
      if (response.valid) {
        // Store new ZIP and location info
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

        // Update user data if it exists
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.zipCode = zipCode;
          user.updatedAt = new Date().toISOString();
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Redirect back to settings or dashboard after brief success message
        setTimeout(() => {
          router.push('/settings');
        }, 1500);
        
      } else {
        setError('Please enter a valid 5-digit ZIP code');
        // Simple shake animation
        const input = document.getElementById('zipCode');
        if (input) {
          input.style.animation = 'shake 0.5s';
          setTimeout(() => { input.style.animation = ''; }, 500);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    setZipCode(cleaned);
    
    if (error) setError('');
    
    if (cleaned.length === 5) {
      e.target.classList.add('ring-2', 'ring-delta');
      setTimeout(() => {
        e.target.classList.remove('ring-2', 'ring-delta');
      }, 500);
    }
  };

  // Show success state if location was found
  if (locationInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <CivixLogo size="lg" showTagline={false} />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">ZIP Code Updated!</h1>
          </div>

          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900">Perfect!</h2>
                <p className="text-lg text-gray-700 mt-2">
                  <MapPin className="inline w-5 h-5 text-delta mr-1" />
                  {locationInfo.city}, {locationInfo.state} {zipCode}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Your location has been updated. Redirecting you back to settings...
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <CivixLogo size="lg" showTagline={false} />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Change ZIP Code</h1>
          {currentZip && (
            <p className="mt-2 text-sm text-gray-600">
              Current: {currentZip}
            </p>
          )}
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your new ZIP code
              </label>
              
              <div className="relative">
                <input
                  id="zipCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  value={zipCode}
                  onChange={handleZipChange}
                  className={cn(
                    "w-full px-4 py-4 border-2 rounded-xl text-lg font-medium text-center",
                    "focus:outline-none focus:ring-4 focus:ring-delta/20 focus:border-delta",
                    "transition-all duration-200",
                    error && "border-red-500",
                    zipCode.length === 5 && !error && "border-green-500"
                  )}
                  placeholder="12345"
                  required
                  disabled={loading}
                  aria-label="ZIP code"
                  autoComplete="postal-code"
                  autoFocus
                />
                
                {/* Live validation indicator */}
                {zipCode.length === 5 && !error && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </div>
              
              {/* Error message */}
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠</span> {error}
                </p>
              )}
              
              {/* Helper text */}
              {!error && zipCode.length > 0 && zipCode.length < 5 && (
                <p className="mt-2 text-sm text-gray-500">
                  {5 - zipCode.length} more digit{5 - zipCode.length !== 1 ? 's' : ''} needed
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={loading}
                fullWidth
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || zipCode.length !== 5}
                fullWidth
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update ZIP Code'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}