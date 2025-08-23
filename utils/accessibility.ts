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

  // Political mapping specific accessibility helpers
  political: {
    // Generate accessible labels for representative cards
    getRepresentativeCardLabel: (representative: {
      name: string;
      title: string;
      party: string;
      district?: string | number;
      level: string;
      approvalRating?: number;
    }): string => {
      const district = representative.district ? `, District ${representative.district}` : '';
      const approval = representative.approvalRating ? `, ${representative.approvalRating}% approval rating` : '';
      return `${representative.name}, ${representative.title}${district}, ${representative.party} party, ${representative.level} level${approval}`;
    },

    // Generate accessible descriptions for government levels
    getGovernmentLevelDescription: (level: string, count: number): string => {
      const descriptions = {
        federal: 'Federal government representatives including US Congress and Executive branch',
        state: 'State government representatives including Governor and State Legislature', 
        county: 'County government representatives including Supervisors and Sheriff',
        municipal: 'City and local government representatives including Mayor and City Council'
      };
      
      const description = descriptions[level as keyof typeof descriptions] || 'Government representatives';
      return `${description}. ${count} representative${count !== 1 ? 's' : ''} found.`;
    },

    // Announce filter changes
    announceFilterChange: (filterType: string, value: string, resultCount: number) => {
      const message = value === 'all' || !value 
        ? `Filter cleared for ${filterType}. Showing ${resultCount} representatives.`
        : `Filtered by ${filterType}: ${value}. Showing ${resultCount} representatives.`;
      
      a11y.announce(message, 'polite');
    },

    // Generate contact method labels
    getContactActionLabel: (method: 'email' | 'phone' | 'website', representativeName: string): string => {
      const actions = {
        email: 'Send email to',
        phone: 'Call',
        website: 'Visit official website for'
      };
      
      return `${actions[method]} ${representativeName}`;
    },

    // Get ZIP code validation messages
    getZipValidationMessage: (validationState: 'valid' | 'invalid' | 'out-of-state' | 'none'): string => {
      const messages = {
        valid: 'Valid California ZIP code entered',
        invalid: 'Please enter a valid 5-digit ZIP code',
        'out-of-state': 'Please enter a California ZIP code to find your representatives',
        none: ''
      };
      
      return messages[validationState];
    },

    // Navigation announcements for screen readers
    announceNavigation: (fromLevel: string, toLevel: string) => {
      const message = `Navigated from ${fromLevel} to ${toLevel} representatives`;
      a11y.announce(message, 'polite');
    },

    // Sort and order announcements
    announceSortChange: (sortBy: string, sortOrder: string, resultCount: number) => {
      const message = `Representatives sorted by ${sortBy} in ${sortOrder} order. ${resultCount} results.`;
      a11y.announce(message, 'polite');
    },

    // Loading state announcements
    announceLoadingState: (isLoading: boolean, context: string = 'representatives') => {
      if (isLoading) {
        a11y.announce(`Loading ${context}...`, 'assertive');
      }
    },

    // Error state announcements
    announceError: (errorMessage: string) => {
      a11y.announce(`Error: ${errorMessage}`, 'assertive');
    }
  },

  // Enhanced keyboard navigation for political UI
  governmentNavigation: {
    // Handle government level carousel navigation
    handleLevelCarousel: (
      event: KeyboardEvent,
      levels: string[],
      currentIndex: number,
      onNavigate: (newIndex: number) => void
    ) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : levels.length - 1;
          onNavigate(prevIndex);
          a11y.political.announceNavigation(levels[currentIndex], levels[prevIndex]);
          break;
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = currentIndex < levels.length - 1 ? currentIndex + 1 : 0;
          onNavigate(nextIndex);
          a11y.political.announceNavigation(levels[currentIndex], levels[nextIndex]);
          break;
        case 'Home':
          event.preventDefault();
          onNavigate(0);
          a11y.political.announceNavigation(levels[currentIndex], levels[0]);
          break;
        case 'End':
          event.preventDefault();
          const lastIndex = levels.length - 1;
          onNavigate(lastIndex);
          a11y.political.announceNavigation(levels[currentIndex], levels[lastIndex]);
          break;
      }
    },

    // Handle representative card list navigation
    handleRepresentativeListNavigation: (
      event: KeyboardEvent,
      currentIndex: number,
      totalItems: number,
      onNavigate: (newIndex: number) => void
    ) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'j': // Vim-style navigation
          event.preventDefault();
          newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
        case 'k': // Vim-style navigation
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
          break;
        case 'Home':
        case 'g':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
        case 'G':
          event.preventDefault();
          newIndex = totalItems - 1;
          break;
        case 'PageDown':
          event.preventDefault();
          newIndex = Math.min(currentIndex + 5, totalItems - 1);
          break;
        case 'PageUp':
          event.preventDefault();
          newIndex = Math.max(currentIndex - 5, 0);
          break;
      }

      if (newIndex !== currentIndex) {
        onNavigate(newIndex);
        a11y.announce(`Representative ${newIndex + 1} of ${totalItems}`, 'polite');
      }
    }
  }
};

// Export individual utilities for tree-shaking
export const { announce, focusManagement, contrast, semantic, keyboard, motion, text, validation, touch } = a11y;