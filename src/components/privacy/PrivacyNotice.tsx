'use client';

import { useState } from 'react';

interface PrivacyNoticeProps {
  type?: 'registration' | 'data-usage' | 'general';
  dismissible?: boolean;
  className?: string;
}

export default function PrivacyNotice({
  type = 'general',
  dismissible = true,
  className = '',
}: PrivacyNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showFullNotice, setShowFullNotice] = useState(false);

  if (!isVisible) return null;

  const getNoticeContent = () => {
    switch (type) {
      case 'registration':
        return {
          title: 'Your Privacy is Protected',
          summary: 'CITZN uses privacy-first authentication. You can participate anonymously.',
          details: [
            'No personal information required to start',
            'Your ZIP code is only used for local content',
            'Optional identity verification increases influence',
            'You control what information is shared',
            'Request data deletion anytime',
          ],
          icon: '🔒',
        };
      case 'data-usage':
        return {
          title: 'How We Use Your Data',
          summary: 'Your data helps improve civic engagement while protecting privacy.',
          details: [
            'Anonymous analytics improve the platform',
            'Aggregated data shows community trends',
            'K-anonymity protects individual identity',
            'No data sold to third parties',
            'GDPR and CCPA compliant',
          ],
          icon: '📊',
        };
      case 'general':
      default:
        return {
          title: 'Privacy First',
          summary: 'CITZN is built with privacy as a core principle.',
          details: [
            'Zero-knowledge authentication',
            'End-to-end encryption for sensitive data',
            'Anonymous participation by default',
            'Transparent data practices',
            'User-controlled data retention',
          ],
          icon: '🛡️',
        };
    }
  };

  const content = getNoticeContent();

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{content.icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">{content.title}</h3>
              <p className="text-sm text-blue-700 mt-1">{content.summary}</p>
            </div>
            {dismissible && (
              <button
                onClick={() => setIsVisible(false)}
                className="ml-3 text-blue-400 hover:text-blue-600"
                aria-label="Dismiss notice"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Expandable Details */}
          <button
            onClick={() => setShowFullNotice(!showFullNotice)}
            className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
          >
            {showFullNotice ? 'Show less' : 'Learn more'}
          </button>

          {showFullNotice && (
            <div className="mt-3 space-y-2 animate-fadeIn">
              <ul className="space-y-1">
                {content.details.map((detail, index) => (
                  <li key={index} className="flex items-start text-sm text-blue-700">
                    <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-blue-200">
                <a
                  href="/privacy-policy"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Read full privacy policy →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}