'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Users, FileText, Activity, 
  CheckCircle, Calendar, MapPin, ArrowRight
} from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { CivixLogo } from '@/components/CivixLogo';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPlaceholderPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-delta mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Enhanced Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back!
              </h1>
              <p className="text-gray-600">
                Here's your civic engagement overview
              </p>
            </div>
            <CivixLogo size="sm" />
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="default" padding="md" className="text-center">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">127</p>
            <p className="text-sm text-gray-600">Bills Tracked</p>
            <p className="text-xs text-green-600 mt-1">+12 this week</p>
          </Card>
          
          <Card variant="default" padding="md" className="text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">25</p>
            <p className="text-sm text-gray-600">Representatives</p>
            <p className="text-xs text-blue-600 mt-1">All levels</p>
          </Card>
          
          <Card variant="default" padding="md" className="text-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">45</p>
            <p className="text-sm text-gray-600">Votes Cast</p>
            <p className="text-xs text-purple-600 mt-1">This session</p>
          </Card>
          
          <Card variant="default" padding="md" className="text-center">
            <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">8.2</p>
            <p className="text-sm text-gray-600">Engagement Score</p>
            <p className="text-xs text-orange-600 mt-1">Above average</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Activity */}
            <Card variant="default" padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Legislative Activity
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Infrastructure Investment Act passed committee
                    </p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Healthcare Committee meeting scheduled
                    </p>
                    <p className="text-xs text-gray-600">Tomorrow at 2:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Education Funding Bill introduced
                    </p>
                    <p className="text-xs text-gray-600">Yesterday</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-800 mb-3">
                  Enhanced dashboard with real-time tracking is being integrated
                </p>
                <Button
                  onClick={() => router.push('/feed')}
                  variant="outline"
                  size="sm"
                >
                  View Current Feed <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card variant="default" padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push('/bills')}
                  variant="outline"
                  size="md"
                  className="h-16 flex-col"
                >
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-sm">Bills</span>
                </Button>
                
                <Button
                  onClick={() => router.push('/committees')}
                  variant="outline"
                  size="md"
                  className="h-16 flex-col"
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-sm">Committees</span>
                </Button>
                
                <Button
                  onClick={() => router.push('/representatives')}
                  variant="outline"
                  size="md"
                  className="h-16 flex-col"
                >
                  <MapPin className="w-5 h-5 mb-1" />
                  <span className="text-sm">Reps</span>
                </Button>
                
                <Button
                  onClick={() => router.push('/my-votes')}
                  variant="outline"
                  size="md"
                  className="h-16 flex-col"
                >
                  <TrendingUp className="w-5 h-5 mb-1" />
                  <span className="text-sm">My Votes</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Your Location */}
            <Card variant="default" padding="md">
              <h3 className="font-semibold text-gray-900 mb-3">Your Location</h3>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-delta" />
                <span className="text-sm text-gray-900">ZIP Code: 90210</span>
              </div>
              <p className="text-xs text-gray-600">
                Beverly Hills, CA
              </p>
            </Card>

            {/* Engagement Level */}
            <Card variant="default" padding="md">
              <h3 className="font-semibold text-gray-900 mb-3">Engagement Level</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full w-4/5"></div>
                </div>
                <span className="text-sm font-medium text-orange-600">82%</span>
              </div>
              <p className="text-xs text-gray-600">
                You're more engaged than 75% of users
              </p>
            </Card>

            {/* Upcoming Events */}
            <Card variant="default" padding="md">
              <h3 className="font-semibold text-gray-900 mb-3">Upcoming</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">City Council Meeting</p>
                  <p className="text-gray-600">March 15, 7:00 PM</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Budget Vote</p>
                  <p className="text-gray-600">March 22, 10:00 AM</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholderPage;