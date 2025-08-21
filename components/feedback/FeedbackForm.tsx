import React, { useState } from 'react';
import { X, Send, ThumbsUp, ThumbsDown, MessageSquare, AlertCircle } from 'lucide-react';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface FeedbackFormProps {
  targetId: string;
  targetType: 'representative' | 'bill';
  targetName: string;
  onSubmit: (feedback: FeedbackData) => void;
  onClose: () => void;
  initialSentiment?: 'positive' | 'negative' | 'neutral';
}

interface FeedbackData {
  targetId: string;
  targetType: 'representative' | 'bill';
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  message: string;
  tags: string[];
}

export default function FeedbackForm({
  targetId,
  targetType,
  targetName,
  onSubmit,
  onClose,
  initialSentiment = 'neutral'
}: FeedbackFormProps) {
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | 'neutral'>(initialSentiment);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = targetType === 'representative' ? [
    'Responsiveness',
    'Policy Positions',
    'Communication',
    'Voting Record',
    'Community Engagement',
    'Other'
  ] : [
    'Support',
    'Oppose',
    'Needs Changes',
    'More Information Needed',
    'Impact Concerns',
    'Other'
  ];

  const suggestedTags = targetType === 'representative' ? [
    'accessible', 'responsive', 'transparent', 'effective', 
    'unresponsive', 'out-of-touch', 'needs-improvement'
  ] : [
    'healthcare', 'education', 'economy', 'environment',
    'infrastructure', 'safety', 'rights', 'taxes'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const feedbackData: FeedbackData = {
      targetId,
      targetType,
      sentiment,
      category,
      message,
      tags
    };
    
    await onSubmit(feedbackData);
    setIsSubmitting(false);
  };

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card variant="default" padding="none" className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Provide Feedback on {targetName}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Sentiment Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Overall Sentiment
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSentiment('positive')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                    sentiment === 'positive'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <ThumbsUp size={24} />
                  <span className="text-sm font-medium">Positive</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSentiment('neutral')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                    sentiment === 'neutral'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <MessageSquare size={24} />
                  <span className="text-sm font-medium">Neutral</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSentiment('negative')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                    sentiment === 'negative'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <ThumbsDown size={24} />
                  <span className="text-sm font-medium">Negative</span>
                </button>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your Feedback
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                required
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tags (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-all',
                      tags.includes(tag)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="text-blue-600 mt-0.5" size={16} />
              <p className="text-xs text-blue-700">
                Your feedback will be aggregated with others to show community sentiment. 
                Individual feedback is kept private and never shared directly with representatives.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting || !category || !message}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={16} className="mr-1" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}