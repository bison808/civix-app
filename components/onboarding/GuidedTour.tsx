'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourStep {
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface GuidedTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function GuidedTour({ 
  steps, 
  isActive, 
  onComplete, 
  onSkip 
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentTourStep = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentTourStep) return;

    const updateTargetPosition = () => {
      const element = document.querySelector(currentTourStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });

        // Add highlight class
        element.classList.add('tour-highlight');
      }
    };

    // Initial position
    updateTargetPosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updateTargetPosition);
    window.addEventListener('resize', updateTargetPosition);

    return () => {
      // Remove highlight from previous element
      const element = document.querySelector(currentTourStep.target);
      if (element) {
        element.classList.remove('tour-highlight');
      }
      
      window.removeEventListener('scroll', updateTargetPosition);
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [isActive, currentTourStep]);

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

  const handleSkip = () => {
    // Clean up any highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    onSkip?.();
  };

  const getTooltipPosition = () => {
    if (!targetRect || !tooltipRef.current) return {};

    const position = currentTourStep.position || 'bottom';
    const tooltipWidth = 320;
    const tooltipHeight = tooltipRef.current?.offsetHeight || 200;
    const offset = 16;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipHeight - offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + offset;
        break;
    }

    // Keep tooltip within viewport
    const padding = 16;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    return { top, left };
  };

  if (!isActive) return null;

  const tooltipPosition = getTooltipPosition();

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop with spotlight */}
          <motion.div
            className="fixed inset-0 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
          >
            <div className="absolute inset-0 bg-black/60" />
            {targetRect && (
              <motion.div
                className="absolute bg-transparent border-4 border-white/30 rounded-lg"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  top: targetRect.top - 8,
                  left: targetRect.left - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                }}
              >
                <div className="absolute inset-0 bg-white/10 rounded-lg animate-pulse" />
              </motion.div>
            )}
          </motion.div>

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            className="fixed z-[9999] w-80 bg-white rounded-xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={tooltipPosition}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-delta to-purple-600 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-90">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button
                  onClick={handleSkip}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Skip tour"
                >
                  <X size={16} />
                </button>
              </div>
              <h3 className="text-lg font-semibold">{currentTourStep.title}</h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {currentTourStep.content}
              </p>

              {/* Custom Action */}
              {currentTourStep.action && (
                <button
                  onClick={currentTourStep.action.onClick}
                  className="w-full mb-3 px-4 py-2 bg-delta/10 text-delta rounded-lg font-medium hover:bg-delta/20 transition-colors"
                >
                  {currentTourStep.action.label}
                </button>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors",
                    currentStep === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <ChevronLeft size={16} />
                  <span className="text-sm">Back</span>
                </button>

                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentStep
                          ? "w-6 bg-delta"
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-3 py-1.5 bg-delta text-white rounded-lg hover:bg-delta/90 transition-colors"
                >
                  <span className="text-sm">
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}