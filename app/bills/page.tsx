'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { CivixLogo } from '@/components/CivixLogo';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import StandardPageHeader from '@/components/layout/StandardPageHeader';
import { useAuth } from '@/contexts/AuthContext';

const BillsPlaceholderPage = () => {
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
          <p className="text-gray-600">Loading Bills System...</p>
        </div>
      </div>
    );
  }

  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Legislative Bills System"
        description="Track bills from your representatives and stay informed about legislation that matters to you."
        showLogo={true}
        logoSize="md"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card variant="default" padding="md" className="text-center">
          <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">500+</p>
          <p className="text-sm text-gray-600">Active Bills</p>
        </Card>
        
        <Card variant="default" padding="md" className="text-center">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">25</p>
          <p className="text-sm text-gray-600">Your Representatives</p>
        </Card>
        
        <Card variant="default" padding="md" className="text-center">
          <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-600">Tracked by You</p>
        </Card>
        
        <Card variant="default" padding="md" className="text-center">
          <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">8</p>
          <p className="text-sm text-gray-600">Upcoming Votes</p>
        </Card>
      </div>

      {/* Main Content */}
      <Card variant="default" padding="lg" className="text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bills & Committee System
          </h2>
          
          <p className="text-gray-600 mb-6">
            The enhanced Bills and Committee tracking system is being integrated. 
            This will provide comprehensive bill tracking, committee monitoring, 
            and legislative engagement tools.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/feed')}
              variant="primary"
              size="lg"
              fullWidth
            >
              View Current Bill Feed
            </Button>
            
            <Button
              onClick={() => router.push('/representatives')}
              variant="outline"
              size="lg"
              fullWidth
            >
              View Your Representatives
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
            <p className="text-sm text-blue-700">
              Enhanced bill filtering, committee tracking, and legislative analytics
            </p>
          </div>
        </div>
      </Card>
    </StandardPageLayout>
  );
};

export default BillsPlaceholderPage;