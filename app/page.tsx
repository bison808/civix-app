'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/core/Button';
import { CitznLogo } from '@/components/CitznLogo';
import Tooltip from '@/components/ui/Tooltip';
// Dynamic import for authApi to prevent bundle bloat
import { MapPin, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load heavy components to improve initial load
const LazyOnboardingFlow = lazy(() => import('@/components/onboarding/OnboardingFlow'));

// Note: Framer Motion removed for better performance - using CSS animations instead

// Loading component for lazy-loaded components
const ComponentLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="animate-pulse bg-gray-200 h-8 rounded" />}>
    {children}
  </Suspense>
);

export default function OptimizedLandingPage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationInfo, setLocationInfo] = useState<{ city?: string; state?: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(false);

  useEffect(() => {
    // Check if user has visited before and prefers animations
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setIsFirstTime(!hasVisited);
    setEnableAnimations(!prefersReducedMotion);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Dynamic import to prevent authApi from loading in main bundle
      const { authApi } = await import('@/services/authApi');
      const response = await authApi.verifyZipCode(zipCode);
      if (response.valid) {
        // Store ZIP and location info
        localStorage.setItem('userZipCode', zipCode);
        localStorage.setItem('hasVisitedBefore', 'true');
        document.cookie = `userZipCode=${zipCode}; path=/; max-age=86400`;
        
        if (response.city && response.state) {
          setLocationInfo({ city: response.city, state: response.state });
          localStorage.setItem('userLocation', JSON.stringify({
            city: response.city,
            state: response.state,
            county: response.county
          }));
        }
        
        setShowConfirmation(true);
        setCurrentStep(1);
      } else {
        setError('Please enter a valid 5-digit ZIP code');
        // Simple shake animation without heavy motion library
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

  const SuccessIcon = () => (
    <div className={`w-20 h-20 bg-green-100 rounded-full flex items-center justify-center ${enableAnimations ? 'animate-bounce-once' : ''}`}>
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 ${enableAnimations ? 'animate-fade-in' : ''}`}>
      
      {/* Progress Indicator - Only show when needed */}
      {currentStep > 0 && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <ComponentLoader>
            <LazyOnboardingFlow 
              currentStep={currentStep - 1}
              totalSteps={3}
              className="max-w-2xl mx-auto pt-4 px-4"
            />
          </ComponentLoader>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-4xl space-y-6 sm:space-y-8">
          
          {/* Logo Section */}
          <div className="text-center">
            <CitznLogo size="2xl" showTagline={true} animated={enableAnimations} />
            
            {/* Hero Section */}
            <div className="mt-6 space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Your Voice in Democracy
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Track bills, contact representatives, and stay informed about the issues that matter to your community.
              </p>
            </div>
            
            {/* Welcome message for first-time users */}
            {isFirstTime && (
              <p className={`mt-4 text-sm text-gray-600 ${enableAnimations ? 'animate-fade-in-delay' : ''}`}>
                <Sparkles className="inline w-4 h-4 text-yellow-500 mr-1" />
                Welcome! Let's get you started
              </p>
            )}
            
            {/* Key Features Preview */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900">Track Bills</h3>
                <p className="text-sm text-gray-600">Follow legislation that affects you</p>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="font-semibold text-gray-900">Your Reps</h3>
                <p className="text-sm text-gray-600">Connect with your representatives</p>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🗳️</span>
                </div>
                <h3 className="font-semibold text-gray-900">Stay Engaged</h3>
                <p className="text-sm text-gray-600">Make informed civic decisions</p>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span>🔒</span> Secure
              </span>
              <span className="flex items-center gap-2">
                <span>🙈</span> Private
              </span>
              <span className="flex items-center gap-2">
                <span>⚡</span> No spam
              </span>
            </div>
          </div>

          {/* Main Content */}
          {showConfirmation && locationInfo ? (
            /* Location Confirmation - Lightweight version */
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <SuccessIcon />
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Perfect!</h2>
                  <p className="text-lg text-gray-700 mt-2">
                    <MapPin className="inline w-5 h-5 text-delta mr-1" />
                    {locationInfo.city}, {locationInfo.state} {zipCode}
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 text-center">
                  🎯 We'll show you bills and representatives that directly affect your area
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/feed')}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="group"
                >
                  <span>Browse Bills & Representatives</span>
                  <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  onClick={() => router.push('/register')}
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="group"
                >
                  <span>Create Account to Vote</span>
                  <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-2">
                  You can browse anonymously or create an account for voting
                </p>
              </div>
            </div>
          ) : (
            /* ZIP Code Form */
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    Enter your ZIP code
                  </label>
                  <Tooltip
                    content="We use your ZIP code to show you bills and representatives specific to your area. Your data is never sold or shared."
                    position="left"
                  />
                </div>
                
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading || zipCode.length !== 5}
                className={cn(
                  "group relative overflow-hidden",
                  zipCode.length === 5 && enableAnimations && "animate-pulse-subtle"
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying location...
                  </span>
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              </form>
            </div>
          )}

          {/* Learn more section */}
          {!showConfirmation && (
            <div className="text-center mt-8">
              <button 
                className="text-sm text-delta hover:underline font-medium"
                onClick={() => alert('Help section would open here')}
              >
                Learn how CITZN works →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Optimized CSS - moved to external stylesheet for better caching */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-delay {
          0% { opacity: 0; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes bounce-once {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-30px,0); }
          70% { transform: translate3d(0,-15px,0); }
          90% { transform: translate3d(0,-4px,0); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-delay { animation: fade-in-delay 1s ease-out; }
        .animate-bounce-once { animation: bounce-once 0.8s ease-out; }
        .animate-pulse-subtle { animation: pulse-subtle 2s infinite; }
      `}</style>
    </div>
  );
}