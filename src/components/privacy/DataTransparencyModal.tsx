'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/authApi';

interface DataTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataTransparencyModal({
  isOpen,
  onClose,
}: DataTransparencyModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stored' | 'usage' | 'rights'>('stored');
  const [dataDownloadUrl, setDataDownloadUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !user) return null;

  const handleDownloadData = () => {
    // Create JSON file with user data
    const userData = {
      exportDate: new Date().toISOString(),
      anonymousId: user.anonymousId,
      verificationLevel: user.verificationLevel,
      zipCode: user.zipCode,
      location: user.location,
      email: user.email || 'Not provided',
      firstName: user.firstName || 'Not provided',
      lastName: user.lastName || 'Not provided',
      privacySettings: user.privacySettings,
      sessionInfo: {
        currentSession: user.sessionToken ? 'Active' : 'Inactive',
      },
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    setDataDownloadUrl(url);

    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `civix-data-${user.anonymousId}-${Date.now()}.json`;
    a.click();
  };

  const handleDeleteData = async () => {
    try {
      await authApi.requestDataDeletion(user.anonymousId);
      setShowDeleteConfirm(false);
      onClose();
      // Show success message
      alert('Data deletion request submitted. Your data will be deleted within 30 days.');
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      alert('Failed to submit deletion request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Data Transparency Center</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['stored', 'usage', 'rights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === tab
                  ? 'text-delta border-b-2 border-delta'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'stored' && 'What We Store'}
              {tab === 'usage' && 'How It\'s Used'}
              {tab === 'rights' && 'Your Rights'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'stored' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Data We Store About You</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Anonymous ID</p>
                  <p className="text-sm text-gray-600 font-mono">{user.anonymousId}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Verification Status</p>
                  <p className="text-sm text-gray-600 capitalize">{user.verificationLevel}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Location Data</p>
                  <p className="text-sm text-gray-600">
                    ZIP: {user.zipCode || 'Not set'}
                    {user.location && ` (${user.location.city}, ${user.location.state})`}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Optional Identity</p>
                  <p className="text-sm text-gray-600">
                    {user.email || user.firstName || user.lastName 
                      ? `${user.firstName || ''} ${user.lastName || ''} ${user.email ? `(${user.email})` : ''}`.trim()
                      : 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Privacy Settings</p>
                  <ul className="text-sm text-gray-600 mt-1">
                    <li>• Analytics: {user.privacySettings?.allowAnalytics ? 'Enabled' : 'Disabled'}</li>
                    <li>• Public Profile: {user.privacySettings?.allowPublicProfile ? 'Enabled' : 'Disabled'}</li>
                    <li>• Data Retention: {user.privacySettings?.dataRetentionDays || 365} days</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleDownloadData}
                className="w-full px-4 py-2 bg-delta text-white rounded-lg hover:bg-delta-dark"
              >
                Download My Data (JSON)
              </button>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">How Your Data Is Used</h3>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-medium text-gray-800">Content Personalization</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Your ZIP code helps us show bills and representatives relevant to your area.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-medium text-gray-800">Anonymous Analytics</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Aggregated data helps us understand community engagement patterns without identifying individuals.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-medium text-gray-800">Influence Calculation</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Verified voters receive increased influence weight in community feedback metrics.
                  </p>
                </div>
                
                <div className="border-l-4 border-yellow-400 pl-4">
                  <h4 className="font-medium text-gray-800">Security & Fraud Prevention</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Session tokens and anonymous IDs help prevent abuse while maintaining privacy.
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>We Never:</strong> Sell your data, share with third parties without consent, 
                  or use it for advertising purposes.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rights' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Your Privacy Rights</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Right to Access
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Download all data we have about you at any time.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Right to Correction
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Update or correct your information through account settings.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Right to Deletion
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Request complete deletion of your data and account.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Right to Portability
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Export your data in standard formats for use elsewhere.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Request Data Deletion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Confirm Data Deletion</h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete all your data including:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Your anonymous profile</li>
              <li>All voting history</li>
              <li>Saved preferences</li>
              <li>Account settings</li>
            </ul>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteData}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}