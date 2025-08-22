'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Vote, Search, Bell, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function OnboardingCarousel({ onComplete, onSkip }: OnboardingCarouselProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Search,
      title: 'Stay Informed',
      description: 'We simplify complex government bills into easy-to-understand summaries',
      image: '/illustrations/informed.svg',
      color: 'bg-blue-500',
    },
    {
      icon: Vote,
      title: 'Make Your Voice Heard',
      description: 'Vote on bills and see how your community and representatives are voting',
      image: '/illustrations/vote.svg',
      color: 'bg-green-500',
    },
    {
      icon: Users,
      title: 'Connect with Representatives',
      description: 'Contact your representatives directly and track their voting history',
      image: '/illustrations/connect.svg',
      color: 'bg-purple-500',
    },
    {
      icon: Bell,
      title: 'Never Miss Important Updates',
      description: 'Get notified about bills that matter to you and your community',
      image: '/illustrations/notify.svg',
      color: 'bg-orange-500',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-0">
          {onSkip && (
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Skip onboarding"
            >
              <X size={20} className="text-gray-500" />
            </button>
          )}
          
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-8 bg-delta'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={cn('p-4 rounded-full', currentStepData.color)}>
                <Icon size={32} className="text-white" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Visual Placeholder */}
            <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-sm">
                [Visual illustration here]
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            className={cn(
              'p-2 rounded-lg transition-all',
              currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'hover:bg-gray-100'
            )}
            aria-label="Previous step"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          <button
            onClick={handleNext}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-all',
              'bg-delta text-white hover:bg-delta/90',
              'flex items-center gap-2'
            )}
          >
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <ChevronRight size={16} />
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}