'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCommittees, useCommitteeActivity } from '@/hooks/useCommittees';
import { Committee, CommitteeFilter } from '@/types/committee.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon, 
  BuildingIcon,
  FilterIcon,
  SearchIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  MapPinIcon
} from 'lucide-react';

export default function CommitteesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CommitteeFilter>({
    level: 'All',
    chamber: 'All',
    hasUserRep: false,
    isActive: true
  });

  // Get user's ZIP code from auth or localStorage
  const userZip = user?.zipCode || localStorage.getItem('userZip') || '';

  const {
    userCommittees,
    userInterests,
    stats,
    loading,
    loadingUserCommittees,
    error,
    searchCommittees,
    refreshCommittees
  } = useCommittees({ userZip, autoFetch: true });

  const {
    activities,
    loading: loadingActivity
  } = useCommitteeActivity({ 
    committeeIds: userCommittees.map(c => c.id),
    limit: 10
  });

  const [showUserCommittees, setShowUserCommittees] = useState(true);
  const [searchResults, setSearchResults] = useState<Committee[]>([]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    await searchCommittees(searchQuery, activeFilter);
  };

  // Filter committees based on current filter
  const filterCommittees = (committees: Committee[]) => {
    return committees.filter(committee => {
      if (activeFilter.chamber && activeFilter.chamber !== 'All' && committee.chamber !== activeFilter.chamber) return false;
      if (activeFilter.level && activeFilter.level !== 'All' && committee.level !== activeFilter.level) return false;
      if (activeFilter.isActive !== undefined && committee.isActive !== activeFilter.isActive) return false;
      return true;
    });
  };

  const displayedCommittees = showUserCommittees 
    ? filterCommittees(userCommittees) 
    : searchResults;

  if (!userZip) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <AlertCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ZIP Code Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please provide your ZIP code to see committees relevant to your representatives.
            </p>
            <Button onClick={() => window.location.href = '/register'}>
              Set Your Location
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Congressional Committees
          </h1>
          <p className="text-lg text-gray-600">
            Track committees where your representatives serve and stay informed about important meetings and votes.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center">
              <BuildingIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Your Committees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.userRelevantCommittees}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingMeetings}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Your Reps on Committees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.representativesOnCommittees}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Bills in Committee</p>
                <p className="text-2xl font-bold text-gray-900">{stats.billsInCommittee}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Committee List */}
          <div className="lg:col-span-2">
            
            {/* Search and Filters */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col space-y-4">
                
                {/* Search Bar */}
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search committees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {/* View Toggle */}
                <div className="flex space-x-2">
                  <Button
                    variant={showUserCommittees ? "default" : "outline"}
                    onClick={() => setShowUserCommittees(true)}
                                      >
                    Your Committees
                  </Button>
                  <Button
                    variant={!showUserCommittees ? "default" : "outline"}
                    onClick={() => setShowUserCommittees(false)}
                                      >
                    Search Results
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={activeFilter.level}
                    onChange={(e) => setActiveFilter({ ...activeFilter, level: e.target.value as any })}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="All">All Levels</option>
                    <option value="federal">Federal</option>
                    <option value="state">State</option>
                    <option value="county">County</option>
                  </select>
                  
                  <select
                    value={activeFilter.chamber}
                    onChange={(e) => setActiveFilter({ ...activeFilter, chamber: e.target.value as any })}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="All">All Chambers</option>
                    <option value="House">House</option>
                    <option value="Senate">Senate</option>
                    <option value="Joint">Joint</option>
                  </select>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activeFilter.hasUserRep}
                      onChange={(e) => setActiveFilter({ ...activeFilter, hasUserRep: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Has Your Rep</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Committee List */}
            {loadingUserCommittees ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading committees...</p>
              </div>
            ) : error ? (
              <Card className="p-6 text-center">
                <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <Button onClick={refreshCommittees} className="mt-4">
                  Try Again
                </Button>
              </Card>
            ) : displayedCommittees.length > 0 ? (
              <div className="space-y-4">
                {displayedCommittees.map(committee => (
                  <CommitteeCard key={committee.id} committee={committee} userInterests={userInterests} />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <BuildingIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {showUserCommittees ? 'No Committee Assignments Found' : 'No Search Results'}
                </h3>
                <p className="text-gray-600">
                  {showUserCommittees 
                    ? 'Your representatives don\'t appear to serve on any committees in our database.'
                    : 'Try a different search term or adjust your filters.'
                  }
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Recent Activity */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {loadingActivity ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 5).map(activity => (
                    <div key={activity.id} className="border-l-4 border-blue-500 pl-3">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.committeeName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No recent activity</p>
              )}
            </Card>

            {/* Your Representatives */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Representatives</h3>
              <div className="space-y-2">
                {userInterests.slice(0, 5).map(interest => (
                  <div key={`${interest.representativeId}-${interest.committeeId}`} className="flex justify-between text-sm">
                    <span className="font-medium">{interest.committeeName}</span>
                    <Badge variant="outline">
                      {interest.reason === 'Representative Member' ? 'Member' : 'Interested'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Committee Card Component
interface CommitteeCardProps {
  committee: Committee;
  userInterests: any[];
}

function CommitteeCard({ committee, userInterests }: CommitteeCardProps) {
  const hasUserRep = userInterests.some(interest => 
    interest.committeeId === committee.id && interest.reason === 'Representative Member'
  );

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{committee.name}</h3>
            {hasUserRep && (
              <Badge variant="secondary">
                <UsersIcon className="w-3 h-3 mr-1" />
                Your Rep
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline">{committee.chamber}</Badge>
            <Badge variant="outline">{committee.level}</Badge>
            {committee.isActive && (
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{committee.jurisdiction}</p>
          
          {committee.description && (
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{committee.description}</p>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Members</p>
          <p className="font-medium">{committee.memberCount}</p>
        </div>
        
        <div>
          <p className="text-gray-500">Meetings This Year</p>
          <p className="font-medium">{committee.meetingsThisYear || 0}</p>
        </div>
        
        <div>
          <p className="text-gray-500">Bills Considered</p>
          <p className="font-medium">{committee.billsConsidered || 0}</p>
        </div>
        
        <div>
          <p className="text-gray-500">Next Meeting</p>
          <p className="font-medium">
            {committee.nextMeetingDate 
              ? new Date(committee.nextMeetingDate).toLocaleDateString()
              : 'TBD'
            }
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon className="w-4 h-4 mr-1" />
            Meetings
          </Button>
        </div>
        
        <Button variant="outline" size="sm">
          Follow
        </Button>
      </div>
    </Card>
  );
}