'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCommittees, useCommitteeMeetings } from '@/hooks/useCommittees';
import committeeService from '@/services/committee.service';
import { Committee, CommitteeMember } from '@/types/committee.types';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import Badge from '@/components/core/Badge';
import { Separator } from '@/components/ui/separator';
import CommitteeMeetingCard from '@/components/committees/CommitteeMeetingCard';
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon, 
  BuildingIcon,
  ExternalLinkIcon,
  PhoneIcon,
  GlobeIcon,
  ChevronLeftIcon,
  LoaderIcon,
  AlertCircleIcon
} from 'lucide-react';

export default function CommitteeDetailPage() {
  const params = useParams();
  const committeeId = params.id as string;
  
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    meetings,
    upcomingMeetings,
    pastMeetings,
    loading: loadingMeetings
  } = useCommitteeMeetings({
    committeeId,
    limit: 20,
    includeUpcoming: true,
    autoRefresh: true
  });

  // Fetch committee details
  useEffect(() => {
    const fetchCommittee = async () => {
      if (!committeeId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const committeeData = await committeeService.getCommitteeMembers(committeeId);
        if (committeeData) {
          setCommittee(committeeData);
        } else {
          setError('Committee not found');
        }
      } catch (err) {
        console.error('Failed to fetch committee:', err);
        setError('Failed to load committee details');
      } finally {
        setLoading(false);
      }
    };

    fetchCommittee();
  }, [committeeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <LoaderIcon className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading committee details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !committee) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Committee Not Found'}
            </h2>
            <p className="text-gray-600 mb-4">
              The committee you're looking for doesn't exist or couldn't be loaded.
            </p>
            <Link href="/committees">
              <Button>
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Committees
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/committees" className="text-blue-600 hover:text-blue-800 text-sm">
                  Committees
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-900 text-sm font-medium truncate">
                {committee.name}
              </li>
            </ol>
          </nav>
        </div>

        {/* Committee Header */}
        <Card variant="default" padding="lg" className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {committee.name}
                </h1>
                {committee.abbreviation && (
                  <Badge variant="outline">
                    {committee.abbreviation}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{committee.chamber}</Badge>
                <Badge variant="outline" className="capitalize">{committee.level}</Badge>
                {committee.isActive && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-700 mb-4">{committee.jurisdiction}</p>
              
              {committee.description && (
                <p className="text-gray-600 leading-relaxed">{committee.description}</p>
              )}
            </div>
            
            <div className="flex space-x-2 ml-6">
              <Button>
                Follow Committee
              </Button>
              {committee.website && (
                <a href={committee.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLinkIcon className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Contact Info */}
          {committee.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4" />
              <span>{committee.phone}</span>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {/* Committee Stats */}
            <Card variant="default" padding="lg" className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Committee Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{committee.memberCount}</div>
                  <div className="text-sm text-gray-500">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{committee.meetingsThisYear || 0}</div>
                  <div className="text-sm text-gray-500">Meetings This Year</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{committee.billsConsidered || 0}</div>
                  <div className="text-sm text-gray-500">Bills Considered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{upcomingMeetings.length}</div>
                  <div className="text-sm text-gray-500">Upcoming Meetings</div>
                </div>
              </div>
            </Card>

            {/* Upcoming Meetings */}
            {upcomingMeetings.length > 0 && (
              <Card variant="default" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
                  <Link href={`/committees/${committeeId}/meetings`}>
                    <Button variant="outline" size="sm">
                      View All Meetings
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingMeetings.slice(0, 3).map(meeting => (
                    <CommitteeMeetingCard key={meeting.id} meeting={meeting} compact />
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            {pastMeetings.length > 0 && (
              <Card variant="default" padding="lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Meetings</h2>
                <div className="space-y-4">
                  {pastMeetings.slice(0, 3).map(meeting => (
                    <CommitteeMeetingCard key={meeting.id} meeting={meeting} compact />
                  ))}
                </div>
                {pastMeetings.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link href={`/committees/${committeeId}/meetings`}>
                      <Button variant="outline">
                        View All Past Meetings
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Leadership */}
            <Card variant="default" padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leadership</h3>
              <div className="space-y-3">
                {committee.chair && (
                  <CommitteeMemberCard member={committee.chair} />
                )}
                {committee.vicChair && (
                  <CommitteeMemberCard member={committee.vicChair} />
                )}
                {committee.rankingMember && (
                  <CommitteeMemberCard member={committee.rankingMember} />
                )}
              </div>
            </Card>

            {/* Members */}
            <Card variant="default" padding="md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                <Badge variant="outline">{committee.memberCount} total</Badge>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {committee.members.slice(0, 10).map(member => (
                  <CommitteeMemberCard key={member.representativeId} member={member} compact />
                ))}
                {committee.memberCount > 10 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm">
                      View All {committee.memberCount} Members
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Subcommittees */}
            {committee.subcommittees && committee.subcommittees.length > 0 && (
              <Card variant="default" padding="md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subcommittees</h3>
                <div className="space-y-2">
                  {committee.subcommittees.map(subcommitteeId => (
                    <div key={subcommitteeId} className="text-sm">
                      <Link 
                        href={`/committees/${subcommitteeId}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Subcommittee {subcommitteeId}
                      </Link>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Committee Member Card Component
interface CommitteeMemberCardProps {
  member: CommitteeMember;
  compact?: boolean;
}

function CommitteeMemberCard({ member, compact = false }: CommitteeMemberCardProps) {
  const getRoleColor = (role: string) => {
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

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'Democrat':
        return 'text-blue-600';
      case 'Republican':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex-1">
          <Link 
            href={`/representatives/${member.representativeId}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            {member.name}
          </Link>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs ${getPartyColor(member.party)}`}>
              {member.party}
            </span>
            <span className="text-xs text-gray-500">
              {member.state}{member.district ? `-${member.district}` : ''}
            </span>
          </div>
        </div>
        {member.role !== 'Member' && (
          <Badge className={getRoleColor(member.role)}>
            {member.role}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <Link 
            href={`/representatives/${member.representativeId}`}
            className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
          >
            {member.name}
          </Link>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-sm font-medium ${getPartyColor(member.party)}`}>
              {member.party}
            </span>
            <span className="text-sm text-gray-500">
              {member.state}{member.district ? `-${member.district}` : ''}
            </span>
          </div>
        </div>
        
        <Badge className={getRoleColor(member.role)}>
          {member.role}
        </Badge>
      </div>
      
      {(member.seniority || member.joinedDate) && (
        <div className="text-xs text-gray-500 space-y-1">
          {member.seniority && (
            <div>Seniority: {member.seniority} years</div>
          )}
          {member.joinedDate && (
            <div>Joined: {new Date(member.joinedDate).toLocaleDateString()}</div>
          )}
        </div>
      )}
    </Card>
  );
}