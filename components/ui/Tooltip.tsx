'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  trigger?: 'hover' | 'click' | 'focus';
  showIcon?: boolean;
  iconType?: 'help' | 'info';
  className?: string;
  contentClassName?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  trigger = 'hover',
  showIcon = true,
  iconType = 'help',
  className,
  contentClassName
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const tooltipRect = tooltipRef.current!.getBoundingClientRect();
      const offset = 8;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + offset;
          break;
      }

      // Keep tooltip within viewport
      const padding = 8;
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

      setTooltipPosition({ top, left });
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isVisible, position]);

  const handleShow = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const handleHide = () => {
    if (trigger !== 'click') {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  };

  const handleTriggerEvents = () => {
    const events: any = {};

    if (trigger === 'hover') {
      events.onMouseEnter = handleShow;
      events.onMouseLeave = handleHide;
    } else if (trigger === 'click') {
      events.onClick = handleShow;
    } else if (trigger === 'focus') {
      events.onFocus = handleShow;
      events.onBlur = handleHide;
    }

    return events;
  };

  const Icon = iconType === 'help' ? HelpCircle : Info;

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("inline-flex items-center", className)}
        {...handleTriggerEvents()}
      >
        {children || (
          showIcon && (
            <button
              type="button"
              className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Show help"
            >
              <Icon size={16} />
            </button>
          )
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Click outside to close for click trigger */}
            {trigger === 'click' && (
              <div
                className="fixed inset-0 z-[9997]"
                onClick={() => setIsVisible(false)}
              />
            )}

            {/* Tooltip Portal */}
            <motion.div
              ref={tooltipRef}
              className={cn(
                "fixed z-[9998] px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl",
                "max-w-xs pointer-events-none",
                contentClassName
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              }}
            >
              {/* Arrow */}
              <div
                className={cn(
                  "absolute w-2 h-2 bg-gray-900 transform rotate-45",
                  position === 'top' && "bottom-[-4px] left-1/2 -translate-x-1/2",
                  position === 'bottom' && "top-[-4px] left-1/2 -translate-x-1/2",
                  position === 'left' && "right-[-4px] top-1/2 -translate-y-1/2",
                  position === 'right' && "left-[-4px] top-1/2 -translate-y-1/2"
                )}
              />
              
              {/* Content */}
              <div className="relative">
                {content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Floating help bubble for first-time users
export function HelpBubble({ 
  content, 
  onDismiss,
  position = 'bottom-right' 
}: {
  content: string;
  onDismiss?: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed z-50 max-w-sm",
            positionClasses[position]
          )}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-delta to-purple-600 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <HelpCircle size={16} className="text-white" />
                  </div>
                  <span className="text-white font-medium text-sm">Quick Tip</span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700">{content}</p>
              <button
                onClick={handleDismiss}
                className="mt-3 text-xs text-delta hover:underline"
              >
                Got it!
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}