'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { CivixLogo } from '@/components/CivixLogo';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import WelcomeAnimation from '@/components/onboarding/WelcomeAnimation';
import Tooltip from '@/components/ui/Tooltip';
import { authApi } from '@/services/authApi';
import { RegisterRequest } from '@/types/auth.types';
import { 
  Shield, 
  User, 
  Mail, 
  Eye, 
  EyeOff,
  Zap,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EnhancedRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false,
    stayAnonymous: true,
    allowAnalytics: false,
    dataRetentionDays: 365,
  });
  
  const [zipCode, setZipCode] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedZip = localStorage.getItem('userZipCode');
    const storedLocation = localStorage.getItem('userLocation');
    
    if (!storedZip) {
      router.push('/');
      return;
    }
    
    setZipCode(storedZip);
    if (storedLocation) {
      setLocation(JSON.parse(storedLocation));
    }
  }, [router]);

  const validateField = (name: string, value: any) => {
    const errors: Record<string, string> = {};
    
    if (!formData.stayAnonymous) {
      if (name === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
      }
      
      if (name === 'password' && value) {
        if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
      }
    }
    
    setValidationErrors(prev => {
      const newErrors = { ...prev, ...errors };
      if (errors[name]) {
        newErrors[name] = errors[name];
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validate on change if field has been touched
    if (touchedFields.has(name)) {
      validateField(name, newValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouchedFields(prev => new Set(prev).add(name));
    validateField(name, value);
  };

  const handleQuickStart = async () => {
    setLoading(true);
    try {
      const registerData: RegisterRequest = {
        zipCode,
        acceptTerms: true,
        privacySettings: {
          dataRetentionDays: 365,
          allowAnalytics: false,
          allowPublicProfile: false,
        },
      };
      
      const response = await authApi.register(registerData);
      if (response.success) {
        setupSession(response);
        setShowWelcome(true);
        setTimeout(() => {
          window.location.href = '/feed';
        }, 3000);
      }
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registerData: RegisterRequest = {
        zipCode,
        acceptTerms: formData.acceptTerms,
        privacySettings: {
          dataRetentionDays: formData.dataRetentionDays,
          allowAnalytics: formData.allowAnalytics,
          allowPublicProfile: !formData.stayAnonymous,
        },
      };

      if (!formData.stayAnonymous && (formData.firstName || formData.lastName || formData.email)) {
        registerData.optionalIdentity = {
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          email: formData.email || undefined,
        };
      }

      const response = await authApi.register(registerData);

      if (response.success) {
        setupSession(response);
        setShowWelcome(true);
        
        setTimeout(() => {
          router.push('/feed');
        }, 3000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const setupSession = (response: any) => {
    localStorage.setItem('sessionToken', response.sessionToken);
    localStorage.setItem('anonymousId', response.anonymousId);
    localStorage.setItem('userZipCode', zipCode);
    localStorage.setItem('alphaAccess', 'granted');
    localStorage.setItem('isFirstTimeUser', 'true');
    
    const userData = {
      id: response.anonymousId,
      email: formData.email || '',
      name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Anonymous User',
      zipCode: zipCode,
      preferences: {
        notifications: true,
        emailUpdates: formData.allowAnalytics
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    const isSecure = window.location.protocol === 'https:';
    const cookieOptions = `path=/; max-age=86400; samesite=lax${isSecure ? '; secure' : ''}`;
    
    document.cookie = `sessionToken=${response.sessionToken}; ${cookieOptions}`;
    document.cookie = `anonymousId=${response.anonymousId}; ${cookieOptions}`;
    document.cookie = `verificationLevel=anonymous; ${cookieOptions}`;
    document.cookie = `userZipCode=${zipCode}; ${cookieOptions}`;
  };

  if (showWelcome) {
    return (
      <WelcomeAnimation
        userName={formData.firstName || 'Citizen'}
        onComplete={() => router.push('/feed')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <OnboardingFlow 
          currentStep={1}
          totalSteps={3}
          className="max-w-2xl mx-auto py-4 px-4"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <motion.div 
          className="w-full max-w-md space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center">
            <CivixLogo size="lg" showTagline={false} />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Choose Your Privacy Level</h1>
            <p className="mt-2 text-sm text-gray-600">
              {location ? `${location.city}, ${location.state} ${zipCode}` : zipCode}
            </p>
          </div>

          {/* Quick Start Option */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-r from-delta/5 to-purple-600/5 border-delta/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-delta/10 rounded-lg">
                  <Zap className="w-6 h-6 text-delta" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Quick Anonymous Start</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Jump right in with full privacy protection. You can add details later.
                  </p>
                  <Button
                    onClick={handleQuickStart}
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    disabled={loading}
                  >
                    {loading ? 'Setting up...' : 'Start Anonymously →'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500">
                or customize your account
              </span>
            </div>
          </div>

          {/* Main Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anonymous Mode Toggle with Animation */}
              <motion.div 
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  formData.stayAnonymous 
                    ? "bg-green-50 border-green-200" 
                    : "bg-blue-50 border-blue-200"
                )}
                whileTap={{ scale: 0.98 }}
              >
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="stayAnonymous"
                    checked={formData.stayAnonymous}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <p className="font-medium text-gray-900">Stay Anonymous</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Full privacy protection. Add your info anytime later.
                    </p>
                  </div>
                </label>
              </motion.div>

              {/* Optional Identity Fields with Smooth Transition */}
              <AnimatePresence>
                {!formData.stayAnonymous && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                          <Tooltip content="Optional - helps personalize your experience" />
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                        <Tooltip content="Optional - for account recovery and updates" />
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={cn(
                            "w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2",
                            validationErrors.email && touchedFields.has('email')
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-delta"
                          )}
                          placeholder="you@example.com"
                        />
                        {formData.email && !validationErrors.email && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                      </div>
                      {validationErrors.email && touchedFields.has('email') && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Privacy Settings with Icons */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Privacy Settings
                </h3>
                
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="allowAnalytics"
                    checked={formData.allowAnalytics}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Help improve CITZN with anonymous usage data
                  </span>
                </label>
              </div>

              {/* Terms with Enhanced Styling */}
              <div className="pt-4 border-t">
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I accept the{' '}
                    <button type="button" className="text-delta hover:underline">
                      Terms
                    </button>
                    {' '}and{' '}
                    <button type="button" className="text-delta hover:underline">
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/')}
                  disabled={loading}
                  fullWidth
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !formData.acceptTerms}
                  fullWidth
                  className="group"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account →'
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Sign In Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-delta hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}