import React, { useState } from 'react';
import { X, Send, Mail, Phone, MapPin, FileText, AlertCircle } from 'lucide-react';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { Representative } from '@/types/representatives.types';
import { cn } from '@/lib/utils';

interface ContactRepresentativeProps {
  representative: Representative;
  onClose: () => void;
  onSend?: (data: ContactData) => void;
}

interface ContactData {
  method: 'email' | 'phone' | 'letter';
  subject: string;
  message: string;
  includeContactInfo: boolean;
  topics: string[];
}

export default function ContactRepresentative({
  representative,
  onClose,
  onSend
}: ContactRepresentativeProps) {
  const [method, setMethod] = useState<'email' | 'phone' | 'letter'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeContactInfo, setIncludeContactInfo] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectTemplates = [
    'Support for Bill',
    'Opposition to Bill',
    'Constituent Concern',
    'Request for Town Hall',
    'Policy Question',
    'Thank You',
    'Other'
  ];

  const topicOptions = [
    'Healthcare', 'Education', 'Economy', 'Environment',
    'Infrastructure', 'Public Safety', 'Immigration', 'Veterans Affairs',
    'Social Security', 'Tax Policy', 'Foreign Policy', 'Civil Rights'
  ];

  const messageTemplates = {
    support: `Dear ${representative.title} ${representative.name},\n\nI am writing as your constituent to express my support for [BILL/ISSUE].\n\n[YOUR REASONS]\n\nThank you for your service to our community.\n\nSincerely,\n[YOUR NAME]`,
    oppose: `Dear ${representative.title} ${representative.name},\n\nI am writing as your constituent to express my opposition to [BILL/ISSUE].\n\n[YOUR CONCERNS]\n\nI urge you to vote against this measure.\n\nSincerely,\n[YOUR NAME]`,
    concern: `Dear ${representative.title} ${representative.name},\n\nI am writing to bring to your attention an issue affecting our community.\n\n[DESCRIBE ISSUE]\n\nI would appreciate your attention to this matter.\n\nSincerely,\n[YOUR NAME]`
  };

  const handleSend = async () => {
    setIsSubmitting(true);
    
    const contactData: ContactData = {
      method,
      subject,
      message,
      includeContactInfo,
      topics
    };

    if (onSend) {
      await onSend(contactData);
    } else {
      // Default behavior - open email client or phone
      if (method === 'email') {
        window.location.href = `mailto:${representative.contactInfo?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      } else if (method === 'phone') {
        window.location.href = `tel:${representative.contactInfo?.phone}`;
      }
    }
    
    setIsSubmitting(false);
    onClose();
  };

  const toggleTopic = (topic: string) => {
    setTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const loadTemplate = (template: keyof typeof messageTemplates) => {
    setMessage(messageTemplates[template]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card variant="default" padding="none" className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold">
              Contact {representative.title} {representative.name}
            </h2>
            <p className="text-sm text-gray-600">
              {representative.party} - {representative.state} {representative.district ? `District ${representative.district}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Contact Method */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Contact Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMethod('email')}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                  method === 'email'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Mail size={24} />
                <span className="text-sm font-medium">Email</span>
              </button>
              <button
                onClick={() => setMethod('phone')}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                  method === 'phone'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Phone size={24} />
                <span className="text-sm font-medium">Phone</span>
              </button>
              <button
                onClick={() => setMethod('letter')}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                  method === 'letter'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <FileText size={24} />
                <span className="text-sm font-medium">Letter</span>
              </button>
            </div>
          </div>

          {method === 'phone' ? (
            <div className="space-y-4">
              {/* Phone Script */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Calling Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• State your name and that you're a constituent</li>
                  <li>• Mention your ZIP code: {localStorage.getItem('userZipCode')}</li>
                  <li>• Be brief and specific about your concern</li>
                  <li>• Ask for the representative's position on the issue</li>
                  <li>• Thank the staff member for their time</li>
                </ul>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="text-gray-600" size={20} />
                  <span className="font-medium">{representative.contactInfo?.phone}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Office hours: Monday-Friday, 9:00 AM - 5:00 PM
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Subject
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value=""
                    onChange={(e) => setSubject(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Quick templates...</option>
                    {subjectTemplates.map(template => (
                      <option key={template} value={template}>{template}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Topics */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Topics (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {topicOptions.map(topic => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm transition-all',
                        topics.includes(topic)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => loadTemplate('support')}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Support Template
                    </button>
                    <span className="text-xs text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={() => loadTemplate('oppose')}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Oppose Template
                    </button>
                    <span className="text-xs text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={() => loadTemplate('concern')}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Concern Template
                    </button>
                  </div>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={8}
                  required
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {message.length} characters
                </div>
              </div>

              {/* Privacy Options */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="includeContact"
                  checked={includeContactInfo}
                  onChange={(e) => setIncludeContactInfo(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="includeContact" className="text-sm text-gray-700">
                  Include my contact information for a response
                </label>
              </div>
            </>
          )}

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="text-blue-600 mt-0.5" size={16} />
            <p className="text-xs text-blue-700">
              Your message will be sent directly to the representative's office. 
              {includeContactInfo 
                ? ' Your contact information will be included for a potential response.'
                : ' Your message will be sent anonymously.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSend}
            className="flex-1"
            disabled={isSubmitting || (method !== 'phone' && (!subject || !message))}
          >
            {isSubmitting ? (
              'Sending...'
            ) : (
              <>
                <Send size={16} className="mr-1" />
                {method === 'phone' ? 'Call Now' : 'Send Message'}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}