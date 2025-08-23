'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { CitznLogo } from '@/components/CitznLogo';
import Button from '@/components/core/Button';

export default function AlphaAccessPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Alpha access codes - you can change these
  const VALID_CODES = [
    'CITZN2025',
    'ALPHATEST',
    'BETATESTER',
    'DEMOCRACY',
    'VOTENOW'
  ];

  useEffect(() => {
    // Check if already has alpha access
    const hasAccess = localStorage.getItem('alphaAccess');
    if (hasAccess === 'granted') {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (VALID_CODES.includes(accessCode.toUpperCase())) {
      // Grant access
      localStorage.setItem('alphaAccess', 'granted');
      localStorage.setItem('alphaUser', 'true');
      setIsValid(true);
      setError('');
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setError('Invalid access code. Please check with the CITZN team.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <CitznLogo size="xl" animated={true} />
          </div>

          {isValid ? (
            // Success State
            <div className="text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Alpha!</h2>
              <p className="text-gray-600">Access granted. Redirecting...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Alpha Access Required
                </h1>
                <p className="text-gray-600 text-sm">
                  CITZN is currently in private alpha testing. 
                  Enter your access code to continue.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Access Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="accessCode"
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta focus:border-delta"
                      placeholder="Enter your code"
                      required
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="flex items-center justify-center gap-2"
                >
                  Access Alpha
                  <ArrowRight size={18} />
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500">
                  Don\'t have an access code?{' '}
                  <a 
                    href="https://civix.vote" 
                    className="text-delta hover:underline font-medium"
                  >
                    Request Access
                  </a>
                </p>
              </div>

              {/* Features Preview */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">What\'s in Alpha:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Real congressional bills from 2025</li>
                  <li>• AI-powered bill summaries</li>
                  <li>• Contact your representatives</li>
                  <li>• Impact analysis for your area</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Version Badge */}
        <div className="text-center mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/50 text-gray-700">
            Alpha v0.1.0 • Private Testing
          </span>
        </div>
      </div>
    </div>
  );
}