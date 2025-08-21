'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { motion } from '@/utils/accessibility';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  focusIndicators: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReaderMode: false,
  focusIndicators: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('a11y-settings');
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    }
    return defaultSettings;
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.setProperty('--base-font-size', fontSizes[settings.fontSize]);
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
    
    // Save to localStorage
    localStorage.setItem('a11y-settings', JSON.stringify(settings));
  }, [settings]);

  // Detect system preferences
  useEffect(() => {
    const prefersReducedMotion = motion.prefersReducedMotion();
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    }
  }, []);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('a11y-settings');
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}