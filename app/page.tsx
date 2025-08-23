'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Button from '@/components/core/Button';
import { CivixLogo } from '@/components/CivixLogo';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import Tooltip from '@/components/ui/Tooltip';
import { authApi } from '@/services/authApi';
import { MapPin, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import Framer Motion normally for now - will optimize later
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancedLandingPage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationInfo, setLocationInfo] = useState<{ city?: string; state?: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    setIsFirstTime(!hasVisited);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
        
        // Show confirmation with animation
        setShowConfirmation(true);
        setCurrentStep(1);
        
        // Don't auto-proceed - let user click Continue button
        // This allows proper choice between anonymous browsing and registration
      } else {
        setError('Please enter a valid 5-digit ZIP code');
        // Shake animation for error
        const input = document.getElementById('zipCode');
        input?.classList.add('animate-shake');
        setTimeout(() => input?.classList.remove('animate-shake'), 500);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const hasValidSession = authApi.isAuthenticatedForMiddleware();
    if (hasValidSession) {
      router.push('/feed');
    } else {
      router.push('/register');
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    setZipCode(cleaned);
    
    // Clear error when user starts typing
    if (error) setError('');
    
    // Auto-format display (e.g., show as formatted but store as clean)
    if (cleaned.length === 5) {
      // Visual feedback when complete
      e.target.classList.add('ring-2', 'ring-delta');
      setTimeout(() => {
        e.target.classList.remove('ring-2', 'ring-delta');
      }, 500);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress Indicator at Top */}
      {currentStep > 0 && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <OnboardingFlow 
            currentStep={currentStep - 1}
            totalSteps={3}
            className="max-w-2xl mx-auto pt-4 px-4"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          
          {/* Animated Logo */}
          <motion.div 
            className="text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CivixLogo size="2xl" showTagline={true} animated={true} />
            
            {/* Welcome message for first-time users */}
            {isFirstTime && (
              <motion.p
                className="mt-4 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="inline w-4 h-4 text-yellow-500 mr-1" />
                Welcome! Let\'s get you started in 30 seconds
              </motion.p>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {showConfirmation && locationInfo ? (
              /* Enhanced Location Confirmation */
              <motion.div
                key="confirmation"
                className="space-y-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center space-y-4">
                  {/* Success Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="inline-flex"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Perfect!</h2>
                    <p className="text-lg text-gray-700 mt-2">
                      <MapPin className="inline w-5 h-5 text-delta mr-1" />
                      {locationInfo.city}, {locationInfo.state} {zipCode}
                    </p>
                  </div>
                </div>
                
                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm text-blue-800 text-center">
                    🎯 We\'ll show you bills and representatives that directly affect your area
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
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
                </motion.div>

              </motion.div>
            ) : (
              /* ZIP Code Form with Enhanced UX */
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
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
                        "transition-all duration-200 touch-feedback",
                        error && "border-red-500 animate-shake",
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
                      <motion.div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Error message with animation */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="mt-2 text-sm text-red-600 flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <span>⚠</span> {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
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
                    zipCode.length === 5 && "animate-pulse-subtle"
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

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span>🔒</span> Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🙈</span> Private
                  </span>
                  <span className="flex items-center gap-1">
                    <span>⚡</span> No spam
                  </span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Additional help for new users */}
          {!showConfirmation && isFirstTime && (
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-gray-600">
                First time here? No worries!
              </p>
              <button 
                className="text-sm text-delta hover:underline font-medium"
                onClick={() => {
                  // Could trigger a modal or expanded help section
                  alert('Help section would open here');
                }}
              >
                Learn how CITZN works →
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add CSS for subtle animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        
        .animate-shake {
          animation: shake 0.5s;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}