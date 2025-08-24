'use client';

import React from 'react';
import Link from 'next/link';
import { Committee, UserCommitteeInterest } from '@/types/committee.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  UsersIcon, 
  ExternalLinkIcon,
  ClockIcon,
  FileTextIcon,
  MapPinIcon
} from 'lucide-react';

interface CommitteeCardProps {
  committee: Committee;
  userInterests?: UserCommitteeInterest[];
  showFullDetails?: boolean;
  onFollow?: (committeeId: string) => void;
  onUnfollow?: (committeeId: string) => void;
}

export function CommitteeCard({ 
  committee, 
  userInterests = [],
  showFullDetails = false,
  onFollow,
  onUnfollow 
}: CommitteeCardProps) {
  const hasUserRep = userInterests.some(interest => 
    interest.committeeId === committee.id && interest.reason === 'Representative Member'
  );

  const isFollowed = userInterests.some(interest => 
    interest.committeeId === committee.id
  );

  const userInterest = userInterests.find(interest => 
    interest.committeeId === committee.id
  );

  const handleFollowClick = () => {
    if (isFollowed && onUnfollow) {
      onUnfollow(committee.id);
    } else if (!isFollowed && onFollow) {
      onFollow(committee.id);
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {committee.name}
            </h3>
            {hasUserRep && (
              <Badge variant="secondary">
                <UsersIcon className="w-3 h-3 mr-1" />
                Your Rep
              </Badge>
            )}
          </div>
          
          {committee.abbreviation && (
            <p className="text-sm text-gray-500 mb-2">{committee.abbreviation}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline">{committee.chamber}</Badge>
            <Badge variant="outline" className="capitalize">{committee.level}</Badge>
            {committee.isActive && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            )}
          </div>
        </div>
        
        {/* Follow Button */}
        <div className="flex-shrink-0 ml-4">
          <Button 
            variant={isFollowed ? "default" : "outline"} 
                        onClick={handleFollowClick}
            disabled={hasUserRep} // Can't unfollow if user rep is member
          >
            {isFollowed ? 'Following' : 'Follow'}
          </Button>
        </div>
      </div>
      
      {/* Jurisdiction */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Jurisdiction:</p>
        <p className="text-sm text-gray-600">{committee.jurisdiction}</p>
      </div>
      
      {/* Description */}
      {committee.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">{committee.description}</p>
        </div>
      )}

      {/* Leadership */}
      {showFullDetails && (committee.chair || committee.rankingMember) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Leadership</h4>
          <div className="space-y-1">
            {committee.chair && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chair:</span>
                <span className="font-medium">
                  {committee.chair.name} ({committee.chair.party}-{committee.chair.state})
                </span>
              </div>
            )}
            {committee.rankingMember && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ranking Member:</span>
                <span className="font-medium">
                  {committee.rankingMember.name} ({committee.rankingMember.party}-{committee.rankingMember.state})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500 mb-1">Members</p>
          <p className="font-semibold text-gray-900">{committee.memberCount}</p>
        </div>
        
        <div>
          <p className="text-gray-500 mb-1">Meetings</p>
          <p className="font-semibold text-gray-900">{committee.meetingsThisYear || 0}</p>
        </div>
        
        <div>
          <p className="text-gray-500 mb-1">Bills</p>
          <p className="font-semibold text-gray-900">{committee.billsConsidered || 0}</p>
        </div>
        
        <div>
          <p className="text-gray-500 mb-1">Next Meeting</p>
          <p className="font-semibold text-gray-900 text-xs">
            {committee.nextMeetingDate 
              ? new Date(committee.nextMeetingDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })
              : 'TBD'
            }
          </p>
        </div>
      </div>

      {/* User Interest Reason */}
      {userInterest && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium text-blue-900">
              {userInterest.reason === 'Representative Member' && 'Your representative serves on this committee'}
              {userInterest.reason === 'Bill Interest' && 'You\'re following a bill in this committee'}
              {userInterest.reason === 'User Subscribed' && 'You\'re following this committee'}
            </span>
          </div>
          {userInterest.subscriptionDate && (
            <p className="text-xs text-blue-600 mt-1">
              Since {new Date(userInterest.subscriptionDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Link href={`/committees/${committee.id}`}>
            <Button variant="outline" size="sm">
              <FileTextIcon className="w-4 h-4 mr-1" />
              Details
            </Button>
          </Link>
          
          <Link href={`/committees/${committee.id}/meetings`}>
            <Button variant="outline" size="sm">
              <CalendarIcon className="w-4 h-4 mr-1" />
              Meetings
            </Button>
          </Link>
          
          {committee.website && (
            <a href={committee.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLinkIcon className="w-4 h-4 mr-1" />
                Website
              </Button>
            </a>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-400">
          <ClockIcon className="w-3 h-3 inline mr-1" />
          Updated {new Date(committee.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}

export default CommitteeCard;