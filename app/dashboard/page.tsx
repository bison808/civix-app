'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Users, FileText, Activity, 
  ThumbsUp, ThumbsDown, AlertCircle, CheckCircle 
} from 'lucide-react';
import Card from '@/components/core/Card';
import { Bill, Representative } from '@/types';
import { api } from '@/services/api';
import { CivixLogo } from '@/components/CivixLogo';

export default function DashboardPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBills: 0,
    activeBills: 0,
    passedBills: 0,
    totalReps: 0,
    federalReps: 0,
    stateReps: 0,
    localReps: 0,
    userEngagement: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load bills
      const billsData = await api.bills.getAll();
      setBills(billsData);
      
      // Load representatives
      const zipCode = localStorage.getItem('userZipCode') || '90210';
      const repsData = await api.representatives.getByZipCode(zipCode);
      setRepresentatives(repsData);
      
      // Calculate stats
      setStats({
        totalBills: billsData.length,
        activeBills: billsData.filter(b => b.status.stage === 'Committee' || b.status.stage === 'Introduced').length,
        passedBills: billsData.filter(b => b.status.stage === 'House' || b.status.stage === 'Senate' || b.status.stage === 'Law').length,
        totalReps: repsData.length,
        federalReps: repsData.filter(r => r.title === 'Senator' || r.title === 'Representative').length,
        stateReps: repsData.filter(r => r.title.includes('State')).length,
        localReps: repsData.filter(r => r.title === 'Mayor' || r.title.includes('Council')).length,
        userEngagement: Math.floor(Math.random() * 30) + 70 // Mock engagement score
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card variant="default" padding="sm" className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </Card>
  );

  const RecentActivity = () => (
    <Card variant="default" padding="md">
      <h3 className="font-semibold mb-3">Recent Activity</h3>
      <div className="space-y-2">
        {bills.slice(0, 3).map(bill => (
          <div 
            key={bill.id} 
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => router.push(`/bill/${bill.id}`)}
          >
            <div className={`w-2 h-2 rounded-full ${
              bill.status.stage === 'Law' ? 'bg-green-500' : 
              bill.status.stage === 'Committee' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{bill.billNumber}</p>
              <p className="text-xs text-gray-500 truncate">{bill.title}</p>
            </div>
            <span className="text-xs text-gray-400">{bill.status.stage}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="flex-1 flex flex-col pt-14 pb-16">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {loading ? (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg h-32 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 rounded-lg h-24 animate-pulse" />
              <div className="bg-gray-100 rounded-lg h-24 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="bg-gradient-to-br from-delta to-delta/80 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">
                Welcome to CIVIX Dashboard
              </h2>
              <p className="text-white/80 text-sm">
                Your civic engagement hub for {localStorage.getItem('userLocation') ? 
                  JSON.parse(localStorage.getItem('userLocation') || '{}').city : 'your area'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                  <Activity size={14} className="text-white" />
                  <span className="text-xs text-white">{stats.userEngagement}% Active</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                icon={FileText} 
                label="Total Bills" 
                value={stats.totalBills}
                color="bg-blue-500"
              />
              <StatCard 
                icon={TrendingUp} 
                label="Active Bills" 
                value={stats.activeBills}
                color="bg-yellow-500"
              />
              <StatCard 
                icon={CheckCircle} 
                label="Passed" 
                value={stats.passedBills}
                color="bg-green-500"
              />
              <StatCard 
                icon={Users} 
                label="Your Reps" 
                value={stats.totalReps}
                color="bg-purple-500"
              />
            </div>

            {/* Representatives Breakdown */}
            <Card variant="default" padding="md">
              <h3 className="font-semibold mb-3">Your Representatives</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Federal</span>
                  <span className="font-semibold">{stats.federalReps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">State</span>
                  <span className="font-semibold">{stats.stateReps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Local</span>
                  <span className="font-semibold">{stats.localReps}</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/representatives')}
                className="mt-3 w-full py-2 bg-delta/10 text-delta rounded-lg text-sm font-medium"
              >
                View All Representatives
              </button>
            </Card>

            {/* Recent Activity */}
            <RecentActivity />

            {/* Quick Actions */}
            <Card variant="default" padding="md">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => router.push('/feed')}
                  className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
                >
                  📋 View Bills
                </button>
                <button 
                  onClick={() => router.push('/impact')}
                  className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
                >
                  📊 Impact Analysis
                </button>
                <button 
                  onClick={() => router.push('/representatives')}
                  className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
                >
                  👥 Contact Reps
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
                >
                  ⚙️ Settings
                </button>
              </div>
            </Card>

            {/* Engagement Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-2">
                <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Stay Engaged!</p>
                  <p className="text-xs text-blue-700 mt-1">
                    You have {stats.activeBills} active bills that could affect your community. 
                    Review them and share your feedback with your representatives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}