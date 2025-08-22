'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Shield, 
  Zap, 
  Check, 
  ChevronRight,
  User,
  Bell,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'current' | 'completed';
}

interface OnboardingFlowProps {
  currentStep: number;
  totalSteps: number;
  onStepComplete?: (step: number) => void;
  className?: string;
}

export default function OnboardingFlow({ 
  currentStep, 
  totalSteps, 
  onStepComplete,
  className 
}: OnboardingFlowProps) {
  const [animatedStep, setAnimatedStep] = useState(currentStep);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStep(currentStep);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const steps: OnboardingStep[] = [
    {
      id: 'civic-intro',
      title: 'Learn the Basics',
      description: 'How government works',
      icon: BookOpen,
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'pending'
    },
    {
      id: 'location',
      title: 'Set Your Location',
      description: 'Help us show relevant bills',
      icon: MapPin,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending'
    },
    {
      id: 'privacy',
      title: 'Choose Privacy',
      description: 'Control your data',
      icon: Shield,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending'
    },
    {
      id: 'preferences',
      title: 'Set Preferences',
      description: 'Personalize your experience',
      icon: Bell,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending'
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      description: 'Start exploring',
      icon: Sparkles,
      status: currentStep >= 4 ? 'completed' : 'pending'
    }
  ];

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-delta to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps Visual */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="flex-1 relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute top-6 left-1/2 w-full h-0.5",
                    isCompleted ? "bg-delta" : "bg-gray-300"
                  )}
                  style={{ width: 'calc(100% - 48px)', left: '60%' }}
                />
              )}
              
              {/* Step Circle */}
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    isActive && "ring-4 ring-delta/20 shadow-lg",
                    isCompleted ? "bg-delta text-white" : 
                    isActive ? "bg-white border-2 border-delta text-delta" : 
                    "bg-gray-100 text-gray-400"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check size={20} />
                    </motion.div>
                  ) : (
                    <Icon size={20} />
                  )}
                </motion.div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-xs font-medium",
                    isActive ? "text-delta" : 
                    isCompleted ? "text-gray-700" : 
                    "text-gray-400"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {currentStep === 0 && (
            <p className="text-sm text-gray-600">
              📚 Let's start with the basics of how your government works for you.
            </p>
          )}
          {currentStep === 1 && (
            <p className="text-sm text-gray-600">
              🎯 Great! Your location helps us show bills that affect you directly.
            </p>
          )}
          {currentStep === 2 && (
            <p className="text-sm text-gray-600">
              🔒 Your privacy matters. Choose what feels right for you.
            </p>
          )}
          {currentStep === 3 && (
            <p className="text-sm text-gray-600">
              ⚡ Almost there! Customize your experience for maximum impact.
            </p>
          )}
          {currentStep === 4 && (
            <p className="text-sm text-gray-600 font-medium">
              🎉 Welcome to CITZN! You\'re ready to make your voice heard.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}