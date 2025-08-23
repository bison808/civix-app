'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Shield, Eye, Type, LogOut } from 'lucide-react';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: {
      newBills: true,
      voteReminders: true,
      repUpdates: true,
      impactAlerts: true,
    },
    privacy: {
      shareZip: true,
      analytics: true,
      publicVotes: false,
    },
    display: {
      simplifyLevel: 'medium',
      textSize: 'medium',
    },
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => {
      const categoryKey = category as keyof typeof prev;
      const categorySettings = prev[categoryKey] as any;
      const settingKey = setting as keyof typeof categorySettings;
      
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: !categorySettings[settingKey],
        },
      };
    });
  };

  const handleSignOut = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <div className="flex-1 flex flex-col pt-14 pb-16">
      {/* Page Title */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20">
        {/* Notifications */}
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <button
                  onClick={() => handleToggle('notifications', key)}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    value ? 'bg-delta' : 'bg-gray-300'
                  )}
                  role="switch"
                  aria-checked={value}
                >
                  <span
                    className={cn(
                      'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                      value && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy */}
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Privacy</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <button
                  onClick={() => handleToggle('privacy', key)}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    value ? 'bg-delta' : 'bg-gray-300'
                  )}
                  role="switch"
                  aria-checked={value}
                >
                  <span
                    className={cn(
                      'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                      value && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Display */}
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Display</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Simplify Level</label>
              <div className="flex gap-2">
                {['basic', 'medium', 'detailed'].map(level => (
                  <button
                    key={level}
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, simplifyLevel: level }
                    }))}
                    className={cn(
                      'flex-1 px-3 py-1.5 rounded-lg text-sm capitalize transition-colors',
                      settings.display.simplifyLevel === level
                        ? 'bg-delta text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Text Size</label>
              <div className="flex gap-2">
                {['small', 'medium', 'large', 'xlarge'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, textSize: size }
                    }))}
                    className={cn(
                      'flex-1 px-3 py-1.5 rounded-lg text-xs transition-colors',
                      settings.display.textSize === size
                        ? 'bg-delta text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <Type size={size === 'small' ? 12 : size === 'medium' ? 14 : size === 'large' ? 16 : 18} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-2 pb-8">
          <Button variant="outline" fullWidth onClick={() => router.push('/onboarding/interests')}>
            Update Interests
          </Button>
          <Button variant="outline" fullWidth onClick={() => router.push('/')}>
            Change ZIP Code
          </Button>
          <Button variant="danger" fullWidth onClick={handleSignOut}>
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}