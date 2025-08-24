'use client';

import { useState } from 'react';
import { Mail, Send, MessageSquare, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { expansionFeedbackService, FeedbackContext } from '@/services/expansionFeedbackService';

interface ContextualFeedbackPromptProps {
  context: FeedbackContext;
  state?: string;
  className?: string;
  onClose?: () => void;
  onSubmit?: () => void;
  compact?: boolean;
}

export default function ContextualFeedbackPrompt({
  context,
  state,
  className,
  onClose,
  onSubmit,
  compact = false
}: ContextualFeedbackPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = expansionFeedbackService.getFeedbackPromptConfig(context, state);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (config.showEmail) {
        if (!email) {
          setError('Please enter your email address');
          return;
        }
        if (!expansionFeedbackService.isValidEmail(email)) {
          setError('Please enter a valid email address');
          return;
        }
      }

      if (!message.trim()) {
        setError('Please enter your feedback');
        return;
      }

      // Submit expansion request if it's for limited coverage
      if (context.type === 'limited_coverage' && context.state && context.zipCode) {
        await expansionFeedbackService.collectExpansionRequest(
          email,
          context.zipCode,
          context.state,
          'Unknown City', // Could be enhanced with actual city data
          message
        );
      } else {
        // Submit general feedback
        await expansionFeedbackService.submitFeedback(
          'general',
          message,
          context,
          email || undefined
        );
      }

      setIsSubmitted(true);
      onSubmit?.();

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        onClose?.();
      }, 2000);
    } catch (err) {
      setError(expansionFeedbackService.getErrorMessage('NETWORK_ERROR'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <MessageSquare size={14} />
          {config.buttonText}
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {config.showEmail ? 'Join Waitlist' : 'Share Feedback'}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {isSubmitted ? (
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
                  <p className="text-green-600 font-medium">Thank you for your feedback!</p>
                  {config.showEmail && (
                    <p className="text-sm text-gray-600 mt-2">
                      We'll notify you when {state} data becomes available.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">{config.message}</p>

                  {config.showEmail && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {config.showEmail ? 'Additional Comments (Optional)' : 'Your Feedback'}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={config.placeholder || 'Tell us what you think...'}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || (!message.trim() && !config.showEmail)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          {config.buttonText}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full card version
  return (
    <div className={cn(
      'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4',
      config.priority === 'high' && 'from-purple-50 to-pink-50 border-purple-200',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className={cn(
              'text-blue-600',
              config.priority === 'high' && 'text-purple-600'
            )} size={20} />
            <h4 className="font-medium text-gray-900">
              {config.showEmail ? 'Join Our Waitlist' : 'We Love Feedback!'}
            </h4>
          </div>
          <p className="text-sm text-gray-700 mb-3">{config.message}</p>
          
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors',
                config.priority === 'high' && 'bg-purple-600 hover:bg-purple-700'
              )}
            >
              {config.showEmail ? <Mail size={16} /> : <Send size={16} />}
              {config.buttonText}
            </button>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && !isSubmitted && (
        <div className="mt-4 space-y-4 bg-white rounded-lg p-4 border">
          {config.showEmail && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.showEmail ? 'Additional Comments (Optional)' : 'Your Feedback'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={config.placeholder || 'Tell us what you think...'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!message.trim() && !config.showEmail)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isSubmitted && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
          <p className="text-green-700 font-medium">Thank you for your feedback!</p>
          {config.showEmail && (
            <p className="text-sm text-green-600 mt-1">
              We'll notify you when {state} data becomes available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}