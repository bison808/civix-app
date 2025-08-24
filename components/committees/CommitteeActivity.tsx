'use client';

import React from 'react';
import Link from 'next/link';
import { CommitteeActivity } from '@/types/committee.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  FileTextIcon, 
  VoteIcon,
  AlertCircleIcon,
  ClockIcon,
  ExternalLinkIcon
} from 'lucide-react';

interface CommitteeActivityProps {
  activities: CommitteeActivity[];
  loading?: boolean;
  showCommitteeName?: boolean;
  limit?: number;
}

export function CommitteeActivityFeed({ 
  activities, 
  loading = false,
  showCommitteeName = true,
  limit = 10
}: CommitteeActivityProps) {
  
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No recent committee activity</p>
      </Card>
    );
  }

  const displayedActivities = activities.slice(0, limit);

  return (
    <div className="space-y-4">
      {displayedActivities.map((activity) => (
        <CommitteeActivityItem 
          key={activity.id} 
          activity={activity} 
          showCommitteeName={showCommitteeName}
        />
      ))}
    </div>
  );
}

interface ActivityItemProps {
  activity: CommitteeActivity;
  showCommitteeName: boolean;
}

function CommitteeActivityItem({ activity, showCommitteeName }: ActivityItemProps) {
  const getActivityIcon = (type: CommitteeActivity['type']) => {
    switch (type) {
      case 'Meeting Scheduled':
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case 'Bill Referred':
        return <FileTextIcon className="h-5 w-5 text-green-500" />;
      case 'Vote Held':
        return <VoteIcon className="h-5 w-5 text-purple-500" />;
      case 'Report Released':
        return <FileTextIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getImportanceBadge = (importance: CommitteeActivity['importance']) => {
    switch (importance) {
      case 'High':
        return <Badge variant="destructive" >High Priority</Badge>;
      case 'Medium':
        return <Badge variant="secondary" >Medium Priority</Badge>;
      case 'Low':
        return <Badge variant="outline" >Low Priority</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex space-x-3">
        
        {/* Activity Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            {getActivityIcon(activity.type)}
          </div>
        </div>
        
        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                {activity.title}
              </h4>
              {showCommitteeName && (
                <p className="text-xs text-gray-600 mt-1">
                  <Link 
                    href={`/committees/${activity.committeeId}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {activity.committeeName}
                  </Link>
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {getImportanceBadge(activity.importance)}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {activity.description}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDate(activity.date)}
              </span>
              
              {/* Activity Type Badge */}
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              {/* Related Bill Link */}
              {activity.relatedBillId && (
                <Link 
                  href={`/bill/${activity.relatedBillId}`}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View Bill
                </Link>
              )}
              
              {/* Related Meeting Link */}
              {activity.relatedMeetingId && (
                <Link 
                  href={`/committees/${activity.committeeId}/meetings/${activity.relatedMeetingId}`}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Meeting Details
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CommitteeActivityFeed;