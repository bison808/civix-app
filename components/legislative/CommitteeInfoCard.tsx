'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  FileText,
  Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommitteeInfo, LegislativeCalendarEvent } from '@/types/legislative-comprehensive.types';

interface CommitteeInfoCardProps {
  committee: CommitteeInfo;
  upcomingHearings?: LegislativeCalendarEvent[];
  className?: string;
  compact?: boolean;
}

interface CommitteeListProps {
  committees: CommitteeInfo[];
  className?: string;
  onCommitteeSelect?: (committee: CommitteeInfo) => void;
}

interface CommitteeMemberProps {
  member: CommitteeInfo['members'][0];
  className?: string;
}

interface CommitteeHearingPreviewProps {
  hearings: LegislativeCalendarEvent[];
  committeeName: string;
  className?: string;
}

// ========================================================================================
// COMMITTEE MEMBER COMPONENT
// ========================================================================================

function CommitteeMember({ member, className }: CommitteeMemberProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Chair':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Vice Chair':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Ranking Member':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'd':
      case 'democrat':
        return 'text-blue-600';
      case 'r':
      case 'republican':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn("flex items-center justify-between p-3 bg-gray-50 rounded-lg", className)}>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{member.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("text-sm font-medium", getPartyColor(member.party))}>
            ({member.party})
          </span>
          {member.district && (
            <span className="text-sm text-gray-600">District {member.district}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs", getRoleColor(member.role))}>
          {member.role}
        </Badge>
        {member.role === 'Chair' && (
          <Star className="h-4 w-4 text-yellow-500" />
        )}
      </div>
    </div>
  );
}

// ========================================================================================
// COMMITTEE HEARING PREVIEW
// ========================================================================================

function CommitteeHearingPreview({ hearings, committeeName, className }: CommitteeHearingPreviewProps) {
  if (hearings.length === 0) {
    return (
      <div className={cn("text-center py-6", className)}>
        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No upcoming hearings scheduled</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="font-medium text-gray-900 flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Upcoming Hearings
      </h4>
      
      {hearings.slice(0, 3).map((hearing, index) => (
        <div key={hearing.eventId || index} className="border rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 line-clamp-2">
                {hearing.title}
              </h5>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(hearing.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                
                {hearing.startTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {hearing.startTime}
                  </div>
                )}
                
                {hearing.location.room && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {hearing.location.room}
                  </div>
                )}
              </div>
              
              {hearing.bills.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Bills on Agenda:</div>
                  <div className="flex flex-wrap gap-1">
                    {hearing.bills.slice(0, 3).map((bill, billIndex) => (
                      <Badge key={billIndex} variant="secondary" className="text-xs">
                        {bill.billNumber}
                      </Badge>
                    ))}
                    {hearing.bills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{hearing.bills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="ml-3">
              <Badge 
                variant={hearing.status === 'Scheduled' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {hearing.status}
              </Badge>
            </div>
          </div>
          
          {hearing.publicAccess.openToPublic && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 font-medium">
                  Open to Public
                </span>
                {hearing.publicAccess.broadcastAvailable && (
                  <Badge variant="outline" className="text-xs text-blue-600">
                    Live Stream Available
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {hearings.length > 3 && (
        <Button variant="ghost" className="w-full text-sm">
          View All {hearings.length} Hearings
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}

// ========================================================================================
// MAIN COMMITTEE INFO CARD
// ========================================================================================

export function CommitteeInfoCard({ 
  committee, 
  upcomingHearings = [], 
  className,
  compact = false 
}: CommitteeInfoCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  const getChamberBadgeColor = (chamber: 'House' | 'Senate') => {
    return chamber === 'House' 
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : 'bg-purple-100 text-purple-800 border-purple-300';
  };

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold line-clamp-2">
              {committee.name}
            </CardTitle>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={cn("text-xs", getChamberBadgeColor(committee.chamber))}>
                {committee.chamber === 'House' ? 'Assembly' : 'Senate'}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                {committee.members.length} Member{committee.members.length !== 1 ? 's' : ''}
              </Badge>
              
              {committee.currentBills.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {committee.currentBills.length} Active Bill{committee.currentBills.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          
          {committee.url && (
            <a href={committee.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
        
        {committee.jurisdiction.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-700 mb-1">Jurisdiction:</div>
            <div className="flex flex-wrap gap-1">
              {committee.jurisdiction.slice(0, 4).map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {committee.jurisdiction.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{committee.jurisdiction.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {expanded && (
          <div className="space-y-6">
            {/* Committee Description */}
            {committee.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {committee.description}
                </p>
              </div>
            )}

            {/* Meeting Schedule */}
            {committee.meetingSchedule && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Regular Meeting Schedule
                </h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  {committee.meetingSchedule.regularDays.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Days: </span>
                      {committee.meetingSchedule.regularDays.join(', ')}
                    </div>
                  )}
                  {committee.meetingSchedule.regularTime && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Time: </span>
                      {committee.meetingSchedule.regularTime}
                    </div>
                  )}
                  {committee.meetingSchedule.location && (
                    <div className="text-sm mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {committee.meetingSchedule.location}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Committee Leadership */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Committee Leadership
              </h4>
              
              <div className="space-y-2">
                {/* Chair and Vice Chair first */}
                {committee.members
                  .filter(member => member.role === 'Chair' || member.role === 'Vice Chair')
                  .map((member, index) => (
                    <CommitteeMember key={`leader-${index}`} member={member} />
                  ))
                }
                
                {/* Show first few regular members */}
                {committee.members
                  .filter(member => member.role === 'Member')
                  .slice(0, 3)
                  .map((member, index) => (
                    <CommitteeMember key={`member-${index}`} member={member} />
                  ))
                }
                
                {committee.members.filter(member => member.role === 'Member').length > 3 && (
                  <div className="text-center py-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All {committee.members.length} Members
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Subcommittees */}
            {committee.subcommittees && committee.subcommittees.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Subcommittees</h4>
                <div className="space-y-2">
                  {committee.subcommittees.map((sub, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium text-sm">{sub.name}</div>
                      <div className="text-xs text-gray-600 mt-1">Chair: {sub.chair}</div>
                      {sub.jurisdiction.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sub.jurisdiction.slice(0, 3).map((area, areaIndex) => (
                            <Badge key={areaIndex} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Committee Statistics */}
            {committee.statistics && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Committee Performance
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {committee.statistics.billsConsidered}
                    </div>
                    <div className="text-xs text-blue-700">Bills Considered</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {committee.statistics.billsReported}
                    </div>
                    <div className="text-xs text-green-700">Bills Reported</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {committee.statistics.averageMarkupTime}
                    </div>
                    <div className="text-xs text-purple-700">Avg. Days to Markup</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {(committee.statistics.successRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-orange-700">Success Rate</div>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Hearings */}
            <CommitteeHearingPreview 
              hearings={upcomingHearings} 
              committeeName={committee.name}
            />
          </div>
        )}

        {/* Expand/Collapse Button */}
        <div className="flex justify-center mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 hover:text-blue-800"
          >
            {expanded ? 'Show Less' : 'Show More Details'}
            <ChevronRight className={cn("h-3 w-3 ml-1 transition-transform", expanded && "rotate-90")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// COMMITTEE LIST COMPONENT
// ========================================================================================

export function CommitteeList({ committees, className, onCommitteeSelect }: CommitteeListProps) {
  const [filter, setFilter] = useState<'All' | 'House' | 'Senate'>('All');
  
  const filteredCommittees = committees.filter(committee => {
    if (filter === 'All') return true;
    return committee.chamber === filter;
  });

  if (committees.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="text-center py-8">
          <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Committees Available
          </h3>
          <p className="text-gray-600">
            Committee information is currently unavailable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Legislative Committees</h3>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['All', 'House', 'Senate'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                filter === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {tab} {tab !== 'All' && `(${committees.filter(c => c.chamber === tab).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Committee Cards */}
      <div className="space-y-4">
        {filteredCommittees.map((committee) => (
          <div key={committee.id} onClick={() => onCommitteeSelect?.(committee)}>
            <CommitteeInfoCard 
              committee={committee} 
              compact={true}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
          </div>
        ))}
      </div>

      {filteredCommittees.length === 0 && filter !== 'All' && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">
              No {filter === 'House' ? 'Assembly' : 'Senate'} committees found.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Export main component
export default CommitteeInfoCard;