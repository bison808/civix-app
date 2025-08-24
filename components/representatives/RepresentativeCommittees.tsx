'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Committee, CommitteeMeeting } from '@/types/committee.types';
import { Representative } from '@/types/representatives.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import committeeService from '@/services/committee.service';
import { 
  BuildingIcon, 
  CalendarIcon, 
  ClockIcon,
  ExternalLinkIcon,
  LoaderIcon,
  AlertCircleIcon,
  ChevronRightIcon,
  UsersIcon
} from 'lucide-react';

interface RepresentativeCommitteesProps {
  representative: Representative;
  showUpcomingMeetings?: boolean;
  limit?: number;
}

export function RepresentativeCommittees({ 
  representative, 
  showUpcomingMeetings = true,
  limit = 5 
}: RepresentativeCommitteesProps) {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<CommitteeMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommittees = async () => {
      if (!representative.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const repCommittees = await committeeService.getCommitteesByRepresentative(representative.id);
        setCommittees(repCommittees.slice(0, limit));

        if (showUpcomingMeetings) {
          // Fetch upcoming meetings for the first few committees
          const allUpcomingMeetings: CommitteeMeeting[] = [];
          
          for (const committee of repCommittees.slice(0, 3)) {
            try {
              const meetings = await committeeService.getCommitteeMeetings(committee.id, 5, true);
              const upcoming = meetings.filter(m => 
                new Date(m.date) > new Date() && m.status === 'Scheduled'
              );
              allUpcomingMeetings.push(...upcoming);
            } catch (meetingError) {
              console.warn(`Failed to fetch meetings for committee ${committee.id}:`, meetingError);
            }
          }
          
          // Sort by date and take the most recent
          allUpcomingMeetings.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          setUpcomingMeetings(allUpcomingMeetings.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch representative committees:', err);
        setError('Failed to load committee information');
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
  }, [representative.id, limit, showUpcomingMeetings]);

  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'chair':
        return 'Chair';
      case 'vice chair':
        return 'Vice Chair';
      case 'ranking member':
        return 'Ranking Member';
      default:
        return 'Member';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'chair':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vice chair':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ranking member':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">
          <LoaderIcon className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading committee assignments...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">
          <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </Card>
    );
  }

  if (committees.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">
          <BuildingIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Committee Assignments
          </h3>
          <p className="text-gray-600">
            This representative doesn't appear to serve on any committees in our database.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Committee Assignments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BuildingIcon className="h-5 w-5 mr-2" />
            Committee Assignments
          </h3>
          <Badge variant="outline">{committees.length} committees</Badge>
        </div>

        <div className="space-y-4">
          {committees.map(committee => (
            <CommitteeAssignmentCard 
              key={committee.id} 
              committee={committee} 
              representative={representative}
            />
          ))}
        </div>

        {representative.committees && representative.committees.length > limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" >
              View All {representative.committees.length} Committees
            </Button>
          </div>
        )}
      </Card>

      {/* Upcoming Committee Meetings */}
      {showUpcomingMeetings && upcomingMeetings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Upcoming Committee Meetings
            </h3>
            <Link href="/committees">
              <Button variant="outline" >
                View All Meetings
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.map(meeting => (
              <UpcomingMeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Committee Assignment Card Component
interface CommitteeAssignmentCardProps {
  committee: Committee;
  representative: Representative;
}

function CommitteeAssignmentCard({ committee, representative }: CommitteeAssignmentCardProps) {
  // Find the representative's role on this committee
  const memberInfo = committee.members?.find(m => m.representativeId === representative.id);
  const role = memberInfo?.role || 'Member';

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'chair':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vice chair':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ranking member':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Link 
            href={`/committees/${committee.id}`}
            className="text-base font-medium text-gray-900 hover:text-blue-600 hover:underline"
          >
            {committee.name}
          </Link>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" >{committee.chamber}</Badge>
            <Badge variant="outline" className="capitalize">{committee.level}</Badge>
            {role !== 'Member' && (
              <Badge className={getRoleBadgeStyle(role)}>
                {role}
              </Badge>
            )}
          </div>
        </div>
        
        <Link href={`/committees/${committee.id}`}>
          <Button variant="ghost" >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {committee.jurisdiction}
      </p>

      {/* Committee Stats */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Members:</span>
          <span className="ml-1 font-medium">{committee.memberCount}</span>
        </div>
        <div>
          <span className="text-gray-500">Meetings:</span>
          <span className="ml-1 font-medium">{committee.meetingsThisYear || 0}</span>
        </div>
        <div>
          <span className="text-gray-500">Next:</span>
          <span className="ml-1 font-medium text-xs">
            {committee.nextMeetingDate 
              ? new Date(committee.nextMeetingDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })
              : 'TBD'
            }
          </span>
        </div>
      </div>

      {memberInfo?.joinedDate && (
        <div className="mt-2 text-xs text-gray-500">
          Member since {new Date(memberInfo.joinedDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// Upcoming Meeting Card Component
interface UpcomingMeetingCardProps {
  meeting: CommitteeMeeting;
}

function UpcomingMeetingCard({ meeting }: UpcomingMeetingCardProps) {
  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let dateStr = '';
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return timeString ? `${dateStr} at ${timeString}` : dateStr;
  };

  const getStatusColor = (status: CommitteeMeeting['status']) => {
    switch (status) {
      case 'Scheduled':
        return 'text-blue-600';
      case 'In Progress':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <Link 
            href={`/committees/${meeting.committeeId}/meetings/${meeting.id}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline line-clamp-2"
          >
            {meeting.title}
          </Link>
          <div className="text-xs text-gray-600 mt-1">
            <Link 
              href={`/committees/${meeting.committeeId}`}
              className="hover:text-blue-600 hover:underline"
            >
              {meeting.committeeName}
            </Link>
          </div>
        </div>
        
        <Badge variant="outline" className="ml-2">
          {meeting.type}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-3 w-3" />
          <span>{formatDateTime(meeting.date, meeting.time)}</span>
        </div>
        
        <span className={`font-medium ${getStatusColor(meeting.status)}`}>
          {meeting.status}
        </span>
      </div>

      {meeting.bills && meeting.bills.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">Bills:</div>
          <div className="flex flex-wrap gap-1">
            {meeting.bills.slice(0, 3).map(billId => (
              <Badge key={billId} variant="outline"  className="text-xs">
                <Link href={`/bill/${billId}`} className="hover:underline">
                  {billId.toUpperCase()}
                </Link>
              </Badge>
            ))}
            {meeting.bills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{meeting.bills.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RepresentativeCommittees;