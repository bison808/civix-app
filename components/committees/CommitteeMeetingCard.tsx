'use client';

import React from 'react';
import Link from 'next/link';
import { CommitteeMeeting } from '@/types/committee.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  UsersIcon,
  FileTextIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  PlayCircleIcon
} from 'lucide-react';

interface CommitteeMeetingCardProps {
  meeting: CommitteeMeeting;
  showCommitteeName?: boolean;
  compact?: boolean;
}

export function CommitteeMeetingCard({ 
  meeting, 
  showCommitteeName = false,
  compact = false 
}: CommitteeMeetingCardProps) {
  
  const getStatusColor = (status: CommitteeMeeting['status']) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Postponed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMeetingTypeIcon = (type: CommitteeMeeting['type']) => {
    switch (type) {
      case 'Hearing':
        return <UsersIcon className="h-4 w-4" />;
      case 'Markup':
        return <FileTextIcon className="h-4 w-4" />;
      case 'Business Meeting':
        return <AlertCircleIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (timeString) {
      return `${dateStr} at ${timeString}`;
    }
    
    return dateStr;
  };

  const isUpcoming = new Date(meeting.date) > new Date() && meeting.status === 'Scheduled';
  const isPast = new Date(meeting.date) <= new Date() || meeting.status === 'Completed';

  if (compact) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUpcoming ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {getMeetingTypeIcon(meeting.type)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {meeting.title}
                </h4>
                {showCommitteeName && (
                  <p className="text-xs text-gray-600 mt-1">{meeting.committeeName}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateTime(meeting.date, meeting.time)}
                </p>
              </div>
              
              <Badge className={getStatusColor(meeting.status)}>
                {meeting.status}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-2">
              {getMeetingTypeIcon(meeting.type)}
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {meeting.title}
              </h3>
            </div>
          </div>
          
          {showCommitteeName && (
            <p className="text-sm text-gray-600 mb-2">
              <Link 
                href={`/committees/${meeting.committeeId}`}
                className="hover:text-blue-600 hover:underline"
              >
                {meeting.committeeName}
              </Link>
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{meeting.type}</Badge>
            <Badge className={getStatusColor(meeting.status)}>
              {meeting.status}
            </Badge>
            {meeting.isPublic && (
              <Badge variant="outline">Public</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {meeting.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">{meeting.description}</p>
        </div>
      )}

      {/* Meeting Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        
        {/* Date & Time */}
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">
              {formatDateTime(meeting.date, meeting.time)}
            </p>
            {meeting.duration && (
              <p className="text-gray-500">Duration: {meeting.duration} minutes</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2">
          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Location</p>
            <p className="text-gray-600">{meeting.location}</p>
          </div>
        </div>
      </div>

      {/* Bills Being Considered */}
      {meeting.bills && meeting.bills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Bills Under Consideration</h4>
          <div className="flex flex-wrap gap-2">
            {meeting.bills.slice(0, 3).map((billId) => (
              <Badge key={billId} variant="outline">
                <Link href={`/bill/${billId}`} className="hover:underline">
                  {billId.toUpperCase()}
                </Link>
              </Badge>
            ))}
            {meeting.bills.length > 3 && (
              <Badge variant="outline">
                +{meeting.bills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Witnesses */}
      {meeting.witnesses && meeting.witnesses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Witnesses ({meeting.witnesses.length})
          </h4>
          <div className="space-y-2">
            {meeting.witnesses.slice(0, 2).map((witness) => (
              <div key={witness.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{witness.name}</p>
                  <p className="text-xs text-gray-600">
                    {witness.title} {witness.organization && `- ${witness.organization}`}
                  </p>
                </div>
              </div>
            ))}
            {meeting.witnesses.length > 2 && (
              <p className="text-xs text-gray-500 pl-11">
                +{meeting.witnesses.length - 2} more witnesses
              </p>
            )}
          </div>
        </div>
      )}

      {/* Documents */}
      {meeting.documents && meeting.documents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Documents ({meeting.documents.length})
          </h4>
          <div className="space-y-1">
            {meeting.documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="flex items-center space-x-2">
                <FileTextIcon className="h-3 w-3 text-gray-400" />
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {doc.title}
                </a>
                <Badge variant="outline" className="text-xs">
                  {doc.type}
                </Badge>
              </div>
            ))}
            {meeting.documents.length > 3 && (
              <p className="text-xs text-gray-500">
                +{meeting.documents.length - 3} more documents
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Link href={`/committees/${meeting.committeeId}/meetings/${meeting.id}`}>
            <Button variant="outline">
              <FileTextIcon className="w-4 h-4 mr-1" />
              Full Details
            </Button>
          </Link>
          
          {meeting.recording && (
            <a href={meeting.recording} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <PlayCircleIcon className="w-4 h-4 mr-1" />
                Recording
              </Button>
            </a>
          )}

          {meeting.transcript && (
            <a href={meeting.transcript} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <FileTextIcon className="w-4 h-4 mr-1" />
                Transcript
              </Button>
            </a>
          )}
        </div>

        {/* Meeting Status Indicator */}
        <div className="text-xs text-gray-500">
          <ClockIcon className="w-3 h-3 inline mr-1" />
          {isUpcoming && 'Upcoming'}
          {isPast && 'Past'}
          {meeting.status === 'In Progress' && 'Live Now'}
        </div>
      </div>
    </Card>
  );
}

export default CommitteeMeetingCard;