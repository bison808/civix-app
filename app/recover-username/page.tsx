'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { CivixLogo } from '@/components/CivixLogo';

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

export default function RecoverUsernamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recoveredEmail, setRecoveredEmail] = useState('');
  const [emailHint, setEmailHint] = useState('');
  const [formData, setFormData] = useState({
    zipCode: '',
    firstName: '',
    lastName: '',
    answer1: '',
    answer2: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/recover-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zipCode: formData.zipCode,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          answer1: formData.answer1,
          answer2: formData.answer2,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setRecoveredEmail(result.email);
        setEmailHint(result.hint);
      } else {
        if (response.status === 429) {
          setError('Too many username recovery attempts. Please try again later.');
        } else {
          setError(result.error || 'Username recovery failed');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <CivixLogo size="lg" showTagline={false} />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Username Found</h1>
          </div>

          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Your username (email) is:
                </p>
                <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                  {recoveredEmail}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {emailHint}
                </p>
              </div>
              
              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => router.push('/login')}
                  variant="primary"
                  fullWidth
                >
                  Continue to Login
                </Button>
                <Button
                  onClick={() => router.push('/forgot-password')}
                  variant="secondary"
                  fullWidth
                >
                  Reset Password
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <CivixLogo size="lg" showTagline={false} />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Recover Username</h1>
          <p className="mt-2 text-sm text-gray-600">
            Forgot your email? We'll help you find it using your security information.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                required
                maxLength={5}
                pattern="[0-9]{5}"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                placeholder="12345"
              />
              <p className="text-xs text-gray-500 mt-1">
                The ZIP code associated with your account
              </p>
            </div>

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

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-900">Security Questions</h3>
              
              <div>
                <label htmlFor="answer1" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Answer 1 <span className="text-red-500">*</span>
                </label>
                <input
                  id="answer1"
                  name="answer1"
                  type="text"
                  required
                  value={formData.answer1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                  placeholder="Your answer to the first security question"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Answer to your first security question (case insensitive)
                </p>
              </div>

              <div>
                <label htmlFor="answer2" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Answer 2 <span className="text-red-500">*</span>
                </label>
                <input
                  id="answer2"
                  name="answer2"
                  type="text"
                  required
                  value={formData.answer2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
                  placeholder="Your answer to the second security question"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Answer to your second security question (case insensitive)
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Security questions must be set up on your account for username recovery to work. 
                If you haven't set them up, please contact support.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/login')}
                disabled={loading}
                fullWidth
              >
                Back to Login
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !formData.zipCode || !formData.answer1 || !formData.answer2}
                fullWidth
              >
                {loading ? 'Searching...' : 'Recover Username'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your email?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-delta hover:underline font-medium"
            >
              Sign In
            </button>
            {' '}or{' '}
            <button
              onClick={() => router.push('/forgot-password')}
              className="text-delta hover:underline font-medium"
            >
              Reset Password
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}