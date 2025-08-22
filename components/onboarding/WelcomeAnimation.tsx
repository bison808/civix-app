'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Vote, Users, TrendingUp } from 'lucide-react';

interface WelcomeAnimationProps {
  userName?: string;
  onComplete?: () => void;
  duration?: number;
}

export default function WelcomeAnimation({ 
  userName = 'Citizen', 
  onComplete,
  duration = 3000 
}: WelcomeAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const icons = [
    { Icon: Vote, delay: 0.2, x: -60, y: -40 },
    { Icon: Users, delay: 0.4, x: 60, y: -40 },
    { Icon: TrendingUp, delay: 0.6, x: 0, y: 50 },
  ];

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-delta/95 to-purple-600/95 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center text-white relative">
            {/* Floating Icons */}
            {icons.map(({ Icon, delay, x, y }, index) => (
              <motion.div
                key={index}
                className="absolute"
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.2, 1, 0],
                  x: [0, x * 0.5, x, 0],
                  y: [0, y * 0.5, y, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay,
                  times: [0, 0.3, 0.7, 1]
                }}
              >
                <Icon size={32} className="text-white/80" />
              </motion.div>
            ))}

            {/* Center Sparkle */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.5, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1 }}
              className="mb-6"
            >
              <Sparkles size={64} className="text-white" />
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold mb-2">
                Welcome, {userName}!
              </h1>
              <p className="text-lg text-white/90">
                Let\'s make democracy work for you
              </p>
            </motion.div>

            {/* Progress Dots */}
            <motion.div 
              className="flex justify-center gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white/60 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}