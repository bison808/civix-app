'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { CivixLogo } from '@/components/CivixLogo';
import { authApi, RegisterRequest } from '@/services/authApi';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    acceptTerms: false,
    stayAnonymous: true,
    allowAnalytics: false,
    dataRetentionDays: 365,
  });
  
  const [zipCode, setZipCode] = useState('');
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    // Get ZIP code from localStorage
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

      // Only add optional identity if user provides it
      if (!formData.stayAnonymous && (formData.firstName || formData.lastName || formData.email)) {
        registerData.optionalIdentity = {
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          email: formData.email || undefined,
        };
      }

      const response = await authApi.register(registerData);

      if (response.success) {
        // Store session info in localStorage and cookies
        localStorage.setItem('sessionToken', response.sessionToken);
        localStorage.setItem('anonymousId', response.anonymousId);
        localStorage.setItem('userZipCode', zipCode);
        localStorage.setItem('alphaAccess', 'granted');
        
        // Store user data for immediate use
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
        
        // Store in cookies for middleware - ensure they're set properly
        const isSecure = window.location.protocol === 'https:';
        const cookieOptions = `path=/; max-age=86400; samesite=lax${isSecure ? '; secure' : ''}`;
        
        document.cookie = `sessionToken=${response.sessionToken}; ${cookieOptions}`;
        document.cookie = `anonymousId=${response.anonymousId}; ${cookieOptions}`;
        document.cookie = `verificationLevel=anonymous; ${cookieOptions}`;
        document.cookie = `userZipCode=${zipCode}; ${cookieOptions}`;
        
        // Use router.push for better navigation
        setTimeout(() => {
          router.push('/feed');
        }, 500);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <CivixLogo size="lg" showTagline={false} />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            {location ? `${location.city}, ${location.state} ${zipCode}` : zipCode}
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Anonymous Mode Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="stayAnonymous"
                  checked={formData.stayAnonymous}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <div>
                  <p className="font-medium text-blue-900">Stay Anonymous</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Participate without revealing your identity. You can always add your information later.
                  </p>
                </div>
              </label>
            </div>

            {/* Optional Identity Fields */}
            {!formData.stayAnonymous && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name (Optional)
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name (Optional)
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-900">Privacy Settings</h3>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="allowAnalytics"
                  checked={formData.allowAnalytics}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Allow anonymous analytics to improve the platform
                </span>
              </label>

              <div>
                <label htmlFor="retention" className="block text-sm text-gray-700 mb-1">
                  Data retention period
                </label>
                <select
                  id="retention"
                  name="dataRetentionDays"
                  value={formData.dataRetentionDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataRetentionDays: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                  <option value="730">2 years</option>
                </select>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="pt-4 border-t">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="mt-1 mr-2"
                  required
                />
                <span className="text-sm text-gray-700">
                  I accept the{' '}
                  <button type="button" className="text-delta hover:underline">
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-delta hover:underline">
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/')}
                disabled={loading}
                fullWidth
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !formData.acceptTerms}
                fullWidth
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>

            {/* Skip Registration Option */}
            <div className="text-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  // Create anonymous account automatically
                  setLoading(true);
                  try {
                    const registerData: RegisterRequest = {
                      zipCode,
                      acceptTerms: true, // Auto-accept for anonymous users
                      privacySettings: {
                        dataRetentionDays: 365,
                        allowAnalytics: false,
                        allowPublicProfile: false,
                      },
                    };
                    
                    const response = await authApi.register(registerData);
                    if (response.success) {
                      // Store all necessary data in localStorage
                      localStorage.setItem('sessionToken', response.sessionToken);
                      localStorage.setItem('anonymousId', response.anonymousId);
                      localStorage.setItem('userZipCode', zipCode);
                      localStorage.setItem('alphaAccess', 'granted');
                      
                      // Store user data for immediate use
                      const userData = {
                        id: response.anonymousId,
                        email: '',
                        name: 'Anonymous User',
                        zipCode: zipCode,
                        preferences: {
                          notifications: true,
                          emailUpdates: false
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      localStorage.setItem('user', JSON.stringify(userData));
                      
                      // Store user session for AuthContext
                      const sessionData = {
                        anonymousId: response.anonymousId,
                        sessionToken: response.sessionToken,
                        verificationLevel: 'anonymous',
                        zipCode: zipCode
                      };
                      localStorage.setItem('userSession', JSON.stringify(sessionData));
                      
                      // Store in cookies for middleware - ensure they're set properly  
                      const isSecure = window.location.protocol === 'https:';
                      const cookieOptions = `path=/; max-age=86400; samesite=lax${isSecure ? '; secure' : ''}`;
                      
                      document.cookie = `sessionToken=${response.sessionToken}; ${cookieOptions}`;
                      document.cookie = `anonymousId=${response.anonymousId}; ${cookieOptions}`;
                      document.cookie = `verificationLevel=anonymous; ${cookieOptions}`;
                      document.cookie = `userZipCode=${zipCode}; ${cookieOptions}`;
                      
                      // Add longer delay to ensure cookies are definitely set before navigation
                      setTimeout(() => {
                          // Verify cookies are set before navigating
                          console.log('Cookies set:', document.cookie);
                          // Force a full page reload to ensure AuthContext picks up the new session
                          window.location.href = '/feed';
                      }, 1000);
                    }
                  } catch (error) {
                    console.error('Anonymous registration failed:', error);
                    setError('Failed to create anonymous account. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Creating Anonymous Account...' : 'Continue Anonymously'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Skip setup and browse anonymously with full privacy protection
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-delta hover:underline font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}