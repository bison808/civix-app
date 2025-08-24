'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { CivixLogo } from '@/components/CivixLogo';
import { authApi } from '@/services/authApi';

export default function VerifyPage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState('');
  const [currentZip, setCurrentZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationInfo, setLocationInfo] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Check if user has a session
    const sessionToken = authApi.getSessionToken();
    if (!sessionToken) {
      router.push('/login');
      return;
    }

    // Get current ZIP if exists
    const storedZip = localStorage.getItem('userZipCode');
    if (storedZip) {
      setCurrentZip(storedZip);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyZipCode(zipCode);
      
      if (response.valid) {
        // Store new ZIP and location
        localStorage.setItem('userZipCode', zipCode);
        if (response.city && response.state) {
          setLocationInfo({
            city: response.city,
            state: response.state,
            county: response.county,
          });
          localStorage.setItem('userLocation', JSON.stringify({
            city: response.city,
            state: response.state,
            county: response.county,
          }));
        }
        
        setShowConfirmation(true);
        
        // Auto-proceed after showing confirmation
        setTimeout(() => {
          router.push('/feed');
        }, 2000);
      } else {
        setError('Please enter a valid 5-digit ZIP code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentZip) {
      router.push('/feed');
    } else {
      setError('Please verify your ZIP code to continue');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <CivixLogo size="lg" showTagline={false} />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {currentZip ? 'Update Your Location' : 'Verify Your Location'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {currentZip 
              ? `Current ZIP: ${currentZip}. Enter a new ZIP code to update.`
              : 'We need your ZIP code to show relevant bills and representatives'}
          </p>
        </div>

        <Card className="p-6">
          {showConfirmation && locationInfo ? (
            <div className="space-y-4 text-center animate-fadeIn">
              <div className="text-4xl">✅</div>
              <h2 className="text-xl font-semibold">Location Updated!</h2>
              <p className="text-gray-600">
                {locationInfo.city}, {locationInfo.state} {zipCode}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-delta"
                  placeholder="90210"
                  required
                  disabled={loading}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-1">Why we need this</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Show bills that affect your area</li>
                  <li>• Find your local representatives</li>
                  <li>• Calculate local impact of legislation</li>
                  <li>• Connect you with your community</li>
                </ul>
              </div>

              <div className="flex gap-3">
                {currentZip && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSkip}
                    disabled={loading}
                    fullWidth
                  >
                    Keep Current
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || zipCode.length !== 5}
                  fullWidth
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="text-center">
          <button
            onClick={() => router.push('/settings')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
}