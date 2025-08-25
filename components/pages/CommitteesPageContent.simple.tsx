'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Users, Calendar, TrendingUp, AlertCircle, Search } from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function CommitteesPageContentSimple() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder data for basic functionality
  const committees = [
    {
      id: '1',
      name: 'House Committee on Education and Labor',
      chamber: 'House',
      jurisdiction: ['Education Policy', 'Labor Relations', 'Worker Safety'],
      members: ['Rep. Virginia Foxx (R-NC)', 'Rep. Bobby Scott (D-VA)'],
      currentBills: ['H.R. 1234', 'H.R. 5678']
    },
    {
      id: '2', 
      name: 'Senate Committee on Health, Education, Labor and Pensions',
      chamber: 'Senate',
      jurisdiction: ['Healthcare Policy', 'Education Standards', 'Employment Law'],
      members: ['Sen. Bernie Sanders (I-VT)', 'Sen. Bill Cassidy (R-LA)'],
      currentBills: ['S. 2345', 'S. 6789']
    }
  ];

  const stats = {
    totalCommittees: committees.length,
    houseCommittees: committees.filter(c => c.chamber === 'House').length,
    senateCommittees: committees.filter(c => c.chamber === 'Senate').length,
    upcomingHearings: 5,
    activeBills: committees.reduce((total, c) => total + c.currentBills.length, 0),
    totalMembers: committees.reduce((total, c) => total + c.members.length, 0)
  };

  const filteredCommittees = committees.filter(committee =>
    searchQuery === '' || 
    committee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    committee.jurisdiction.some(j => j.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Legislative Committees
            </h1>
            <p className="text-lg text-gray-600">
              Explore congressional committees, track hearings, and follow your representatives' committee work.
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card variant="default" padding="md" className="text-center">
              <Building className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalCommittees}</p>
              <p className="text-sm text-gray-600">Active Committees</p>
            </Card>
            
            <Card variant="default" padding="md" className="text-center">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingHearings}</p>
              <p className="text-sm text-gray-600">Upcoming Hearings</p>
            </Card>
            
            <Card variant="default" padding="md" className="text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              <p className="text-sm text-gray-600">Total Members</p>
            </Card>
            
            <Card variant="default" padding="md" className="text-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.activeBills}</p>
              <p className="text-sm text-gray-600">Bills in Committee</p>
            </Card>
          </div>

          {/* Search Controls */}
          <Card variant="default" padding="md" className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search committees by name or jurisdiction..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                Showing {filteredCommittees.length} of {committees.length} committees
              </div>
            </div>
          </Card>

          {/* Committee List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredCommittees.length === 0 ? (
              <Card variant="default" padding="lg" className="text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Committees Found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria.
                </p>
                <Button 
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </Card>
            ) : (
              filteredCommittees.map((committee) => (
                <Card key={committee.id} variant="default" padding="md" className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {committee.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {committee.chamber}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Jurisdiction:</h4>
                        <div className="flex flex-wrap gap-2">
                          {committee.jurisdiction.map((area, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Members:</strong> {committee.members.length}
                        </div>
                        <div>
                          <strong>Active Bills:</strong> {committee.currentBills.length}
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/representatives')}
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              View Your Representatives
            </Button>
            
            <Button
              onClick={() => router.push('/bills')}
              variant="outline"  
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              View Bills in Committee
            </Button>
            
            <Button
              onClick={() => router.push('/feed')}
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Legislative Activity
            </Button>
          </div>

          {/* API Notice */}
          <div className="mt-8">
            <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Development Note</span>
              </div>
              <p className="text-sm text-blue-700">
                This is a simplified view showing sample data. Full committee features with real-time data will be available when connected to the LegiScan API.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}