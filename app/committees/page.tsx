'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { CivixLogo } from '@/components/CivixLogo';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import StandardPageHeader from '@/components/layout/StandardPageHeader';
import { useAuth } from '@/contexts/AuthContext';

const CommitteesPlaceholderPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-delta mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Committee System...</p>
        </div>
      </div>
    );
  }

  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Congressional Committees"
        description="Track committees where your representatives serve and stay informed about important meetings and votes."
        showLogo={true}
        logoSize="md"
      />

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card variant="default" padding="md" className="text-center">
          <Building className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">45</p>
          <p className="text-sm text-gray-600">Active Committees</p>
        </Card>
        
        <Card variant="default" padding="md" className="text-center">
          <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-600">Upcoming Meetings</p>
        </Card>
        
        <Card variant="default" padding="md" className="text-center">
          <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">8</p>
          <p className="text-sm text-gray-600">Your Reps on Committees</p>
        </Card>
        
        <Card variant="default" padding="md" className="text-center">
          <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">156</p>
          <p className="text-sm text-gray-600">Bills in Committee</p>
        </Card>
      </div>

      {/* Main Content */}
      <Card variant="default" padding="lg" className="text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-purple-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Committee Tracking System
          </h2>
          
          <p className="text-gray-600 mb-6">
            The comprehensive committee monitoring system is being integrated. 
            This will provide detailed committee information, meeting schedules, 
            member activities, and bill progression tracking.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/representatives')}
              variant="primary"
              size="lg"
              fullWidth
            >
              View Your Representatives
            </Button>
            
            <Button
              onClick={() => router.push('/feed')}
              variant="outline"
              size="lg"
              fullWidth
            >
              View Legislative Activity
            </Button>
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-purple-800 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
            <p className="text-sm text-purple-700">
              Committee member tracking, meeting notifications, and bill status updates
            </p>
          </div>
        </div>
      </Card>

      {/* Feature Preview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" padding="md">
          <h3 className="font-semibold text-gray-900 mb-2">Committee Membership</h3>
          <p className="text-sm text-gray-600">
            Track which committees your representatives serve on and their roles.
          </p>
        </Card>
        
        <Card variant="default" padding="md">
          <h3 className="font-semibold text-gray-900 mb-2">Meeting Schedules</h3>
          <p className="text-sm text-gray-600">
            Get notified about upcoming committee meetings and hearings.
          </p>
        </Card>
        
        <Card variant="default" padding="md">
          <h3 className="font-semibold text-gray-900 mb-2">Bill Progression</h3>
          <p className="text-sm text-gray-600">
            Follow how bills move through different committees.
          </p>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default CommitteesPlaceholderPage;