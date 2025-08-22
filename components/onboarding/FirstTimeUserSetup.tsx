'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuidedTour, { TourStep } from './GuidedTour';
import { HelpBubble } from '@/components/ui/Tooltip';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Search, 
  Bell, 
  BarChart3,
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FirstTimeUserSetupProps {
  onComplete: () => void;
}

export default function FirstTimeUserSetup({ onComplete }: FirstTimeUserSetupProps) {
  const [showTour, setShowTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [showWelcomeBubbles, setShowWelcomeBubbles] = useState(true);
  const [dismissedBubbles, setDismissedBubbles] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check if user is truly first-time
    const isFirstTime = localStorage.getItem('isFirstTimeUser');
    const hasCompletedTour = localStorage.getItem('hasCompletedTour');
    
    if (isFirstTime && !hasCompletedTour) {
      // Show welcome bubbles first, then offer tour
      setTimeout(() => {
        setShowTour(true);
      }, 2000);
    }
  }, []);

  const tourSteps: TourStep[] = [
    {
      target: '[data-tour="bill-card"]',
      title: 'Your First Bill',
      content: 'This is a bill card. Each card shows a summary of legislation that might affect you. Click to read more details.',
      position: 'right'
    },
    {
      target: '[data-tour="vote-buttons"]',
      title: 'Make Your Voice Heard',
      content: 'Use these buttons to support or oppose bills. Your votes help us understand community sentiment.',
      position: 'top',
      action: {
        label: 'Try voting on this bill',
        onClick: () => {
          const button = document.querySelector('[data-tour="vote-buttons"] button');
          button?.classList.add('animate-pulse');
          setTimeout(() => button?.classList.remove('animate-pulse'), 2000);
        }
      }
    },
    {
      target: '[data-tour="search"]',
      title: 'Find Specific Bills',
      content: 'Use the search to find bills on topics you care about, like healthcare, education, or the environment.',
      position: 'bottom'
    },
    {
      target: '[data-tour="engagement-dashboard"]',
      title: 'Track Your Impact',
      content: 'Your engagement dashboard shows your civic participation and how your views align with your community.',
      position: 'left'
    },
    {
      target: '[data-tour="notifications"]',
      title: 'Stay Updated',
      content: 'Get notified when bills you\'ve voted on change status or when new bills affect your area.',
      position: 'bottom'
    }
  ];

  const handleTourComplete = () => {
    setShowTour(false);
    setTourCompleted(true);
    localStorage.setItem('hasCompletedTour', 'true');
    localStorage.removeItem('isFirstTimeUser');
    
    // Show completion celebration
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const handleSkipTour = () => {
    setShowTour(false);
    localStorage.setItem('hasCompletedTour', 'true');
    localStorage.removeItem('isFirstTimeUser');
    onComplete();
  };

  const dismissBubble = (id: string) => {
    setDismissedBubbles(prev => new Set(prev).add(id));
  };

  return (
    <>
      {/* Guided Tour */}
      <GuidedTour
        steps={tourSteps}
        isActive={showTour}
        onComplete={handleTourComplete}
        onSkip={handleSkipTour}
      />

      {/* Welcome Bubbles */}
      {showWelcomeBubbles && !dismissedBubbles.has('welcome') && (
        <HelpBubble
          content="🎉 Welcome to CITZN! Ready for a quick tour to get you started?"
          position="top-right"
          onDismiss={() => dismissBubble('welcome')}
        />
      )}

      {/* Contextual Help Bubbles */}
      {!showTour && showWelcomeBubbles && (
        <>
          {!dismissedBubbles.has('voting-tip') && (
            <motion.div
              className="fixed bottom-20 left-4 z-40 max-w-xs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 5 }}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp size={16} className="text-white" />
                      <span className="text-white font-medium text-sm">Pro Tip</span>
                    </div>
                    <button
                      onClick={() => dismissBubble('voting-tip')}
                      className="text-white/80 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700">
                    Your votes are anonymous and help show legislators what their constituents think about bills.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!dismissedBubbles.has('search-tip') && (
            <motion.div
              className="fixed top-20 right-4 z-40 max-w-xs"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 8 }}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search size={16} className="text-white" />
                      <span className="text-white font-medium text-sm">Search Tip</span>
                    </div>
                    <button
                      onClick={() => dismissBubble('search-tip')}
                      className="text-white/80 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700">
                    Try searching for topics like "healthcare", "education", or "climate" to find relevant bills.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Tour Completion Celebration */}
      <AnimatePresence>
        {tourCompleted && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </motion.div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">You're All Set!</h3>
              <p className="text-gray-600 mb-4">
                You're ready to start making your voice heard in democracy. 
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Happy voting!</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Trigger Button - Always Available */}
      <button
        onClick={() => setShowTour(true)}
        className="fixed bottom-4 right-4 z-30 bg-delta text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="Start guided tour"
        aria-label="Start guided tour"
      >
        <Sparkles size={20} />
      </button>

      {/* Add tour-specific styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 9999;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.3), 0 0 20px rgba(124, 58, 237, 0.2);
          border-radius: 8px;
        }
        
        .tour-highlight::after {
          content: '';
          position: absolute;
          inset: -8px;
          background: linear-gradient(45deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1));
          border-radius: 12px;
          z-index: -1;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}