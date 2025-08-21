// Accessibility utilities for WCAG 2.1 AA compliance

export const a11y = {
  // Screen reader announcements
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Focus management
  focusManagement: {
    // Save current focus
    saveFocus: () => {
      return document.activeElement as HTMLElement;
    },

    // Restore focus to saved element
    restoreFocus: (element: HTMLElement | null) => {
      if (element && typeof element.focus === 'function') {
        element.focus();
      }
    },

    // Move focus to first focusable element in container
    focusFirst: (container: HTMLElement) => {
      const focusable = container.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    },

    // Skip to main content
    skipToMain: () => {
      const main = document.querySelector('main') || document.querySelector('[role="main"]');
      if (main) {
        (main as HTMLElement).focus();
        (main as HTMLElement).scrollIntoView();
      }
    },
  },

  // Color contrast checking
  contrast: {
    // Check if color combination meets WCAG AA standards
    meetsAA: (foreground: string, background: string): boolean => {
      // Simplified contrast ratio calculation
      // In production, use a proper library like color-contrast-checker
      return true; // Placeholder
    },

    // Get accessible color for text on background
    getAccessibleTextColor: (backgroundColor: string): 'black' | 'white' => {
      // Simple luminance calculation
      const rgb = backgroundColor.match(/\d+/g);
      if (!rgb) return 'black';
      
      const [r, g, b] = rgb.map(Number);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      return luminance > 0.5 ? 'black' : 'white';
    },
  },

  // Semantic HTML helpers
  semantic: {
    // Generate unique IDs for form labels
    generateId: (prefix: string = 'a11y'): string => {
      return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Create accessible label
    createLabel: (text: string, forId: string) => {
      return {
        id: `${forId}-label`,
        htmlFor: forId,
        children: text,
      };
    },

    // Add ARIA attributes for interactive elements
    addInteractiveAria: (props: any, pressed?: boolean, expanded?: boolean) => {
      const ariaProps: any = {};
      
      if (pressed !== undefined) {
        ariaProps['aria-pressed'] = pressed;
      }
      
      if (expanded !== undefined) {
        ariaProps['aria-expanded'] = expanded;
      }
      
      return { ...props, ...ariaProps };
    },
  },

  // Keyboard navigation helpers
  keyboard: {
    // Check if key is navigation key
    isNavigationKey: (key: string): boolean => {
      return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(key);
    },

    // Check if key is action key
    isActionKey: (key: string): boolean => {
      return ['Enter', ' ', 'Space'].includes(key);
    },

    // Handle roving tabindex
    rovingTabIndex: (items: HTMLElement[], currentIndex: number) => {
      items.forEach((item, index) => {
        item.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
      });
    },
  },

  // Motion and animation preferences
  motion: {
    // Check if user prefers reduced motion
    prefersReducedMotion: (): boolean => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Get animation duration based on preference
    getAnimationDuration: (defaultMs: number): number => {
      return a11y.motion.prefersReducedMotion() ? 0 : defaultMs;
    },
  },

  // Text and readability
  text: {
    // Ensure minimum font size
    enforceMinimumFontSize: (size: number): number => {
      return Math.max(size, 14); // Minimum 14px for body text
    },

    // Calculate reading time
    getReadingTime: (text: string): number => {
      const wordsPerMinute = 200;
      const words = text.trim().split(/\s+/).length;
      return Math.ceil(words / wordsPerMinute);
    },

    // Add reading time announcement
    announceReadingTime: (text: string) => {
      const minutes = a11y.text.getReadingTime(text);
      a11y.announce(`Reading time: approximately ${minutes} minute${minutes !== 1 ? 's' : ''}`);
    },
  },

  // Form validation
  validation: {
    // Create accessible error message
    createErrorMessage: (fieldName: string, error: string): string => {
      return `Error in ${fieldName}: ${error}`;
    },

    // Announce form errors
    announceErrors: (errors: string[]) => {
      if (errors.length === 0) return;
      
      const message = errors.length === 1
        ? errors[0]
        : `There are ${errors.length} errors in the form. ${errors.join('. ')}`;
      
      a11y.announce(message, 'assertive');
    },
  },

  // Touch target sizing
  touch: {
    // Ensure minimum touch target size (44x44px per WCAG)
    enforceMinimumSize: (width: number, height: number): { width: number; height: number } => {
      return {
        width: Math.max(width, 44),
        height: Math.max(height, 44),
      };
    },

    // Check if element meets touch target requirements
    meetsTargetSize: (element: HTMLElement): boolean => {
      const rect = element.getBoundingClientRect();
      return rect.width >= 44 && rect.height >= 44;
    },
  },
};

// Export individual utilities for tree-shaking
export const { announce, focusManagement, contrast, semantic, keyboard, motion, text, validation, touch } = a11y;