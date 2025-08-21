'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AnonymousModeToggleProps {
  showDescription?: boolean;
  className?: string;
}

export default function AnonymousModeToggle({
  showDescription = true,
  className = '',
}: AnonymousModeToggleProps) {
  const { user, updatePrivacySettings } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingState, setPendingState] = useState(false);

  if (!user) return null;

  const isAnonymous = user.verificationLevel === 'anonymous';

  const handleToggle = async (newState: boolean) => {
    if (!newState && !isAnonymous) {
      // Going from public to anonymous - show confirmation
      setPendingState(newState);
      setShowConfirmDialog(true);
    } else {
      // Going from anonymous to public or already anonymous
      await updateMode(newState);
    }
  };

  const updateMode = async (makePublic: boolean) => {
    setIsUpdating(true);
    try {
      await updatePrivacySettings({
        allowPublicProfile: makePublic,
      });
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className={`${className}`}>
        <div className="flex items-start space-x-3">
          <button
            onClick={() => handleToggle(!isAnonymous)}
            disabled={isUpdating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnonymous
                ? 'bg-gray-300'
                : 'bg-delta'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Toggle anonymous mode"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnonymous ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-900">
              Anonymous Mode {isAnonymous ? 'On' : 'Off'}
            </label>
            {showDescription && (
              <p className="text-xs text-gray-500 mt-1">
                {isAnonymous
                  ? 'Your identity is protected. Participate without revealing personal information.'
                  : 'Your profile is public. Other users can see your name and activity.'}
              </p>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAnonymous ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          <span className="text-xs text-gray-600">
            {isAnonymous ? 'Privacy Protected' : 'Public Profile Active'}
          </span>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Return to Anonymous Mode?</h3>
            <p className="text-gray-600 mb-4">
              Switching back to anonymous mode will:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Hide your name from public view</li>
              <li>Make your activity history private</li>
              <li>Reset your influence weight to standard</li>
              <li>Remove your public profile</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMode(pendingState)}
                className="flex-1 px-4 py-2 bg-delta text-white rounded-lg hover:bg-delta-dark"
              >
                Go Anonymous
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}