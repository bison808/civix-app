'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Type,
  Palette,
  Contrast,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Keyboard,
  Mouse,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  Star,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  audioDescriptions: boolean;
  colorBlindFriendly: boolean;
  fontSize: number;
  colorScheme: 'default' | 'dark' | 'high-contrast';
  voiceSpeed: number;
  focusIndicator: 'default' | 'enhanced' | 'high-visibility';
}

interface AccessibilityEnhancedLegislativeInterfaceProps {
  children: React.ReactNode;
  className?: string;
}

interface ScreenReaderAnnouncementProps {
  message: string;
  priority: 'polite' | 'assertive';
  onComplete?: () => void;
}

interface KeyboardNavigationProps {
  items: Array<{ id: string; label: string; element: HTMLElement }>;
  onItemSelect: (id: string) => void;
}

interface AccessibilityControlPanelProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// ========================================================================================
// SCREEN READER ANNOUNCEMENT COMPONENT
// ========================================================================================

function ScreenReaderAnnouncement({ message, priority, onComplete }: ScreenReaderAnnouncementProps) {
  useEffect(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    const timer = setTimeout(() => {
      document.body.removeChild(announcement);
      onComplete?.();
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [message, priority, onComplete]);
  
  return null;
}

// ========================================================================================
// KEYBOARD NAVIGATION MANAGER
// ========================================================================================

function KeyboardNavigationManager({ items, onItemSelect }: KeyboardNavigationProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onItemSelect(items[focusedIndex]?.id);
          break;
        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex, onItemSelect]);
  
  // Focus the current item
  useEffect(() => {
    if (items[focusedIndex]?.element) {
      items[focusedIndex].element.focus();
    }
  }, [focusedIndex, items]);
  
  return null;
}

// ========================================================================================
// ACCESSIBILITY CONTROL PANEL
// ========================================================================================

function AccessibilityControlPanel({ 
  settings, 
  onSettingsChange, 
  isOpen, 
  onToggle 
}: AccessibilityControlPanelProps) {
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className="mb-2 shadow-lg"
        size="lg"
        aria-label="Toggle accessibility controls"
        aria-expanded={isOpen}
      >
        <Settings className="h-5 w-5 mr-2" />
        Accessibility
      </Button>

      {/* Control Panel */}
      {isOpen && (
        <Card className="w-80 shadow-xl border-2 border-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Accessibility Settings
            </CardTitle>
            <p className="text-sm text-gray-600">
              Customize your experience for better accessibility
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Visual Settings */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Visual Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="high-contrast"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Contrast className="h-4 w-4" />
                    High Contrast
                  </label>
                  <input
                    id="high-contrast"
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => updateSetting('highContrast', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="large-text"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    Large Text
                  </label>
                  <input
                    id="large-text"
                    type="checkbox"
                    checked={settings.largeText}
                    onChange={(e) => updateSetting('largeText', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="color-blind-friendly"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    Color Blind Friendly
                  </label>
                  <input
                    id="color-blind-friendly"
                    type="checkbox"
                    checked={settings.colorBlindFriendly}
                    onChange={(e) => updateSetting('colorBlindFriendly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size: {settings.fontSize}px
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
                      aria-label="Decrease font size"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                      className="flex-1"
                      aria-label="Font size slider"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 2))}
                      aria-label="Increase font size"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Settings */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Audio Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="screen-reader"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    Screen Reader
                  </label>
                  <input
                    id="screen-reader"
                    type="checkbox"
                    checked={settings.screenReader}
                    onChange={(e) => updateSetting('screenReader', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="audio-descriptions"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Audio Descriptions
                  </label>
                  <input
                    id="audio-descriptions"
                    type="checkbox"
                    checked={settings.audioDescriptions}
                    onChange={(e) => updateSetting('audioDescriptions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                {settings.screenReader && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice Speed: {settings.voiceSpeed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.voiceSpeed}
                      onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))}
                      className="w-full"
                      aria-label="Voice speed slider"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Settings */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Navigation Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="keyboard-navigation"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Keyboard className="h-4 w-4" />
                    Enhanced Keyboard Navigation
                  </label>
                  <input
                    id="keyboard-navigation"
                    type="checkbox"
                    checked={settings.keyboardNavigation}
                    onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="reduced-motion"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Mouse className="h-4 w-4" />
                    Reduced Motion
                  </label>
                  <input
                    id="reduced-motion"
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Indicator
                  </label>
                  <select
                    value={settings.focusIndicator}
                    onChange={(e) => updateSetting('focusIndicator', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="default">Default</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="high-visibility">High Visibility</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onSettingsChange({
                  screenReader: false,
                  highContrast: false,
                  largeText: false,
                  reducedMotion: false,
                  keyboardNavigation: true,
                  audioDescriptions: false,
                  colorBlindFriendly: false,
                  fontSize: 16,
                  colorScheme: 'default',
                  voiceSpeed: 1,
                  focusIndicator: 'default'
                })}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ========================================================================================
// ACCESSIBLE BILL CARD COMPONENT
// ========================================================================================

function AccessibleBillCard({ 
  bill, 
  settings,
  onSelect 
}: { 
  bill: any;
  settings: AccessibilitySettings;
  onSelect: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnnounced, setIsAnnounced] = useState(false);

  const handleClick = () => {
    onSelect(bill.id);
    if (settings.screenReader && !isAnnounced) {
      setIsAnnounced(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const ariaLabel = `Bill ${bill.billNumber}: ${bill.title}. Status: ${bill.status}. Last action: ${bill.lastActionDate}. Click to view details.`;

  return (
    <>
      <Card
        ref={cardRef}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          settings.highContrast && "border-2 border-black bg-white text-black",
          settings.focusIndicator === 'enhanced' && "focus:ring-4 focus:ring-blue-400",
          settings.focusIndicator === 'high-visibility' && "focus:ring-4 focus:ring-yellow-400 focus:bg-yellow-50"
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        aria-describedby={`bill-summary-${bill.id}`}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 
                  className={cn(
                    "font-semibold line-clamp-2",
                    settings.largeText && "text-lg",
                    settings.highContrast && "text-black"
                  )}
                  style={{ fontSize: settings.largeText ? settings.fontSize + 4 : settings.fontSize }}
                >
                  {bill.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs",
                      settings.highContrast && "border-black text-black bg-white",
                      settings.colorBlindFriendly && "bg-blue-100 text-blue-900 border-blue-500"
                    )}
                    role="status"
                    aria-label={`Bill number ${bill.billNumber}`}
                  >
                    {bill.billNumber}
                  </Badge>
                  
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      settings.highContrast && "border-black text-black bg-gray-200",
                      settings.colorBlindFriendly && getColorBlindFriendlyStatusColor(bill.status)
                    )}
                    role="status"
                    aria-label={`Current status: ${bill.status}`}
                  >
                    {bill.status}
                  </Badge>
                </div>
              </div>
            </div>

            <p 
              id={`bill-summary-${bill.id}`}
              className={cn(
                "text-sm text-gray-600 line-clamp-3",
                settings.highContrast && "text-black"
              )}
              style={{ fontSize: settings.fontSize - 2 }}
            >
              {bill.summary}
            </p>

            <div className="flex items-center justify-between pt-2 border-t">
              <span 
                className={cn(
                  "text-xs text-gray-500",
                  settings.highContrast && "text-black"
                )}
                aria-label={`Last action date: ${bill.lastActionDate}`}
              >
                Last action: {bill.lastActionDate}
              </span>
              
              <div className="flex items-center gap-1">
                <span className="sr-only">View bill details</span>
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 text-gray-400",
                    settings.highContrast && "text-black"
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader Announcement */}
      {settings.screenReader && isAnnounced && (
        <ScreenReaderAnnouncement
          message={`Selected bill ${bill.billNumber}: ${bill.title}`}
          priority="polite"
          onComplete={() => setIsAnnounced(false)}
        />
      )}
    </>
  );
}

// ========================================================================================
// UTILITY FUNCTIONS
// ========================================================================================

function getColorBlindFriendlyStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'passed':
    case 'signed':
    case 'law':
      return 'bg-green-100 text-green-900 border-green-500 pattern-dots';
    case 'failed':
    case 'vetoed':
      return 'bg-red-100 text-red-900 border-red-500 pattern-diagonal';
    case 'committee':
      return 'bg-blue-100 text-blue-900 border-blue-500 pattern-vertical';
    case 'floor vote':
      return 'bg-orange-100 text-orange-900 border-orange-500 pattern-horizontal';
    default:
      return 'bg-gray-100 text-gray-900 border-gray-500';
  }
}

// ========================================================================================
// MAIN ACCESSIBILITY-ENHANCED INTERFACE
// ========================================================================================

export default function AccessibilityEnhancedLegislativeInterface({ 
  children,
  className 
}: AccessibilityEnhancedLegislativeInterfaceProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardNavigation: true,
    audioDescriptions: false,
    colorBlindFriendly: false,
    fontSize: 16,
    colorScheme: 'default',
    voiceSpeed: 1,
    focusIndicator: 'default'
  });
  
  const [controlPanelOpen, setControlPanelOpen] = useState(false);
  const [skipLinkFocused, setSkipLinkFocused] = useState(false);

  // Mock bills data for demonstration
  const mockBills = [
    {
      id: '1',
      title: 'California Climate Action and Clean Energy Jobs Act',
      billNumber: 'AB 123',
      status: 'Committee',
      summary: 'Establishes comprehensive climate action framework and creates clean energy jobs program.',
      lastActionDate: '2025-08-20'
    },
    {
      id: '2',
      title: 'Housing Affordability and First-Time Buyer Assistance',
      billNumber: 'SB 456',
      status: 'Passed',
      summary: 'Provides assistance to first-time homebuyers and increases housing development incentives.',
      lastActionDate: '2025-08-19'
    }
  ];

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Apply high contrast
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    
    // Apply color blind friendly patterns
    if (settings.colorBlindFriendly) {
      document.body.classList.add('color-blind-friendly');
    } else {
      document.body.classList.remove('color-blind-friendly');
    }
  }, [settings]);

  const handleBillSelect = (billId: string) => {
    console.log('Selected bill:', billId);
  };

  const handleSkipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      setSkipLinkFocused(true);
      setTimeout(() => setSkipLinkFocused(false), 2000);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
        <Button
          onClick={handleSkipToContent}
          className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </Button>
      </div>

      {/* Accessibility Status Bar */}
      {(settings.screenReader || settings.highContrast || settings.largeText) && (
        <div 
          className={cn(
            "bg-blue-100 border-b border-blue-200 px-4 py-2",
            settings.highContrast && "bg-yellow-100 border-yellow-500 text-black"
          )}
          role="status"
          aria-label="Accessibility features active"
        >
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>Accessibility Enhanced</span>
            </div>
            
            <div className="flex items-center gap-4">
              {settings.screenReader && <span>Screen Reader: ON</span>}
              {settings.highContrast && <span>High Contrast: ON</span>}
              {settings.largeText && <span>Large Text: ON</span>}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <header 
        className="bg-white border-b border-gray-200 px-6 py-4"
        role="banner"
      >
        <h1 
          className={cn(
            "text-2xl font-bold text-gray-900",
            settings.highContrast && "text-black"
          )}
          style={{ fontSize: settings.fontSize + 8 }}
        >
          Legislative Information System
        </h1>
        <p 
          className={cn(
            "text-gray-600 mt-1",
            settings.highContrast && "text-black"
          )}
        >
          Accessible civic engagement platform for all citizens
        </p>
      </header>

      {/* Main Content */}
      <main 
        id="main-content"
        className={cn(
          "px-6 py-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
          skipLinkFocused && "ring-2 ring-blue-500 ring-inset"
        )}
        role="main"
        tabIndex={-1}
        aria-label="Main content area"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Section Header */}
          <div>
            <h2 
              className={cn(
                "text-xl font-semibold text-gray-900 mb-4",
                settings.highContrast && "text-black"
              )}
              style={{ fontSize: settings.fontSize + 4 }}
            >
              Recent Legislative Activity
            </h2>
            <p 
              className={cn(
                "text-gray-600",
                settings.highContrast && "text-black"
              )}
            >
              Stay informed about the latest bills and legislative developments
            </p>
          </div>

          {/* Bills List */}
          <div 
            className="space-y-4"
            role="region"
            aria-label="List of legislative bills"
            aria-describedby="bills-description"
          >
            <div id="bills-description" className="sr-only">
              A list of recent legislative bills. Use arrow keys to navigate and Enter to select.
            </div>
            
            {mockBills.map((bill, index) => (
              <AccessibleBillCard
                key={bill.id}
                bill={bill}
                settings={settings}
                onSelect={handleBillSelect}
              />
            ))}
          </div>

          {/* Instructions for Screen Reader Users */}
          <div className="sr-only" role="complementary">
            <h3>Navigation Instructions</h3>
            <ul>
              <li>Use Tab to move between interactive elements</li>
              <li>Use Enter or Space to activate buttons and links</li>
              <li>Use arrow keys to navigate through bill cards</li>
              <li>Press Alt+A to open accessibility settings</li>
            </ul>
          </div>
        </div>

        {children}
      </main>

      {/* Accessibility Control Panel */}
      <AccessibilityControlPanel
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={controlPanelOpen}
        onToggle={() => setControlPanelOpen(!controlPanelOpen)}
      />

      {/* Keyboard shortcut handler */}
      <div className="sr-only">
        <button
          onClick={() => setControlPanelOpen(true)}
          onKeyDown={(e) => {
            if (e.altKey && e.key === 'a') {
              e.preventDefault();
              setControlPanelOpen(true);
            }
          }}
          aria-label="Press Alt+A to open accessibility settings"
        >
          Open Accessibility Settings (Alt+A)
        </button>
      </div>

      {/* Additional CSS for accessibility features */}
      <style jsx>{`
        .high-contrast {
          background: white !important;
          color: black !important;
        }
        
        .high-contrast * {
          border-color: black !important;
        }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .color-blind-friendly .pattern-dots {
          background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
          background-size: 8px 8px;
        }
        
        .color-blind-friendly .pattern-diagonal {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 4px);
        }
        
        .color-blind-friendly .pattern-vertical {
          background-image: repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px);
        }
        
        .color-blind-friendly .pattern-horizontal {
          background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px);
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        @media (prefers-contrast: high) {
          .card {
            border: 2px solid black !important;
          }
        }
      `}</style>
    </div>
  );
}