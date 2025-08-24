'use client';

import { useState } from 'react';
import { Mail, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { expansionFeedbackService } from '@/services/expansionFeedbackService';

interface StateExpansionWaitlistProps {
  state: string;
  zipCode: string;
  city?: string;
  className?: string;
  variant?: 'card' | 'inline' | 'modal';
  onSignup?: (email: string) => void;
}

export default function StateExpansionWaitlist({
  state,
  zipCode,
  city = 'your area',
  className,
  variant = 'card',
  onSignup
}: StateExpansionWaitlistProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!expansionFeedbackService.isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await expansionFeedbackService.collectExpansionRequest(
        email,
        zipCode,
        state,
        city,
        message || `Interested in ${state} state and local political data`
      );

      setIsSubmitted(true);
      onSignup?.(email);

      // Clear form after a delay
      setTimeout(() => {
        setEmail('');
        setMessage('');
      }, 2000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'inline') {
    if (isSubmitted) {
      return (
        <div className={cn('flex items-center gap-2 text-green-600', className)}>
          <CheckCircle size={16} />
          <span className="text-sm">Thanks! We'll notify you when {state} data is available.</span>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)}>
        <div className="relative">
          <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '...' : 'Join Waitlist'}
        </button>
        {error && (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </form>
    );
  }

  // Card variant (default)
  return (
    <div className={cn(
      'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg p-6',
      className
    )}>
      {isSubmitted ? (
        <div className="text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">You're on the list!</h3>
          <p className="text-gray-700">
            We'll email you as soon as {state} state and local political data becomes available.
          </p>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>What's next?</strong> We're actively working on expanding to {state}. 
              Your request helps us prioritize which states to add first.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Coming Soon to {state}!
              </h3>
              <p className="text-gray-700">
                We currently show federal representatives for {city}. 
                Join our waitlist to be the first to know when we add {state} state legislature, 
                local officials, and municipal data.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you most like to see? (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., State legislature bills, city council meetings, local ballot measures..."
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Adding to Waitlist...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Join the Waitlist
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Why join the waitlist?</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Be the first to access {state} political data</li>
              <li>• Help us prioritize which features to build first</li>
              <li>• Get notified about beta testing opportunities</li>
              <li>• No spam - just important updates about your state</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}