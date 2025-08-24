'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { CivixLogo } from '@/components/CivixLogo';

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  
  // Profile form
  const [profileData, setProfileData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    zipCode: '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Security questions form
  const [securityData, setSecurityData] = useState({
    question1: '',
    answer1: '',
    question2: '',
    answer2: '',
  });

  const securityQuestions = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your elementary school?",
    "What is the name of the street you grew up on?",
    "What was your first car's make and model?",
    "What is your favorite movie?",
    "What was the name of your best friend in high school?",
  ];

  useEffect(() => {
    // Load user data from localStorage or session
    const sessionToken = localStorage.getItem('sessionToken');
    const userData = localStorage.getItem('user');
    
    if (!sessionToken) {
      router.push('/login');
      return;
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        setProfileData({
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          zipCode: localStorage.getItem('userZipCode') || '',
        });
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, [router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Profile updated successfully');
        // Update localStorage
        localStorage.setItem('userZipCode', profileData.zipCode);
        const userData = { ...profileData };
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setError(result.error || 'Profile update failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profileData.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(result.error || 'Password change failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!securityData.question1 || !securityData.answer1 || !securityData.question2 || !securityData.answer2) {
      setError('Please fill in both security questions and answers');
      setLoading(false);
      return;
    }

    if (securityData.question1 === securityData.question2) {
      setError('Please choose different questions for each security question');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/setup-security-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profileData.email,
          question1: securityData.question1,
          answer1: securityData.answer1,
          question2: securityData.question2,
          answer2: securityData.answer2,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Security questions set up successfully');
      } else {
        setError(result.error || 'Failed to set up security questions');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formType: string) => {
    const { name, value } = e.target;
    
    if (formType === 'profile') {
      setProfileData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'password') {
      setPasswordData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'security') {
      setSecurityData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <CivixLogo size="md" showTagline={false} />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your profile, password, and security settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'profile', name: 'Profile', icon: '👤' },
                { id: 'password', name: 'Password', icon: '🔒' },
                { id: 'security', name: 'Security', icon: '🛡️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setError('');
                    setSuccess('');
                  }}
                  className={`${
                    activeTab === tab.id
                      ? 'border-delta text-delta'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange(e, 'profile')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange(e, 'profile')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      maxLength={5}
                      pattern="[0-9]{5}"
                      value={profileData.zipCode}
                      onChange={(e) => handleInputChange(e, 'profile')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                      placeholder="12345"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used to find your representatives</p>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
                  
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => handleInputChange(e, 'password')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => handleInputChange(e, 'password')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be 8+ characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => handleInputChange(e, 'password')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    >
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Questions</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Set up security questions to recover your username if you forget your email address.
                  </p>
                  
                  <div>
                    <label htmlFor="question1" className="block text-sm font-medium text-gray-700 mb-1">
                      Security Question 1
                    </label>
                    <select
                      id="question1"
                      name="question1"
                      required
                      value={securityData.question1}
                      onChange={(e) => handleInputChange(e, 'security')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                    >
                      <option value="">Choose a question...</option>
                      {securityQuestions.map((question, index) => (
                        <option key={index} value={question}>{question}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="answer1" className="block text-sm font-medium text-gray-700 mb-1">
                      Answer 1
                    </label>
                    <input
                      id="answer1"
                      name="answer1"
                      type="text"
                      required
                      value={securityData.answer1}
                      onChange={(e) => handleInputChange(e, 'security')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                      placeholder="Your answer (case insensitive)"
                    />
                  </div>

                  <div>
                    <label htmlFor="question2" className="block text-sm font-medium text-gray-700 mb-1">
                      Security Question 2
                    </label>
                    <select
                      id="question2"
                      name="question2"
                      required
                      value={securityData.question2}
                      onChange={(e) => handleInputChange(e, 'security')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                    >
                      <option value="">Choose a question...</option>
                      {securityQuestions.map((question, index) => (
                        <option key={index} value={question}>{question}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="answer2" className="block text-sm font-medium text-gray-700 mb-1">
                      Answer 2
                    </label>
                    <input
                      id="answer2"
                      name="answer2"
                      type="text"
                      required
                      value={securityData.answer2}
                      onChange={(e) => handleInputChange(e, 'security')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                      placeholder="Your answer (case insensitive)"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || !securityData.question1 || !securityData.answer1 || !securityData.question2 || !securityData.answer2}
                    >
                      {loading ? 'Setting Up...' : 'Set Up Security Questions'}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Security</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>✅ Password protected</p>
                <p>✅ Secure sessions</p>
                <p>✅ Rate limiting enabled</p>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    localStorage.clear();
                    router.push('/login');
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}