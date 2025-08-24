'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/core/Button';
import { CivixLogo } from '@/components/CivixLogo';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function PreviewPage() {
  const router = useRouter();
  const [enableAnimations, setEnableAnimations] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnableAnimations(!prefersReducedMotion);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 ${enableAnimations ? 'animate-fade-in' : ''}`}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-4xl space-y-6 sm:space-y-8">
          
          {/* Logo Section */}
          <div className="text-center">
            <CivixLogo size="2xl" showTagline={true} animated={enableAnimations} />
            
            {/* Hero Section */}
            <div className="mt-6 space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Your Voice in Democracy
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Track bills, contact representatives, and stay informed about the issues that matter to your community.
              </p>
            </div>
            
            {/* Welcome message */}
            <p className={`mt-4 text-sm text-gray-600 ${enableAnimations ? 'animate-fade-in-delay' : ''}`}>
              <Sparkles className="inline w-4 h-4 text-yellow-500 mr-1" />
              Welcome! Let's get you started
            </p>
            
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

          {/* Call to Action */}
          <div className="max-w-md mx-auto space-y-4">
            <Button
              onClick={() => router.push('/register')}
              variant="primary"
              size="lg"
              fullWidth
              className="group"
            >
              <span>Get Started - Create Account</span>
              <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              size="lg"
              fullWidth
            >
              Already have an account? Sign In
            </Button>
          </div>

          {/* Learn more section */}
          <div className="text-center mt-8">
            <button 
              className="text-sm text-delta hover:underline font-medium"
              onClick={() => alert('Learn more section - coming soon!')}
            >
              Learn how CITZN works →
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-delay {
          0% { opacity: 0; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-delay { animation: fade-in-delay 1s ease-out; }
      `}</style>
    </div>
  );
}