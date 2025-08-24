'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VotingRecord, LegislatorVotingStats } from '@/types/legislative-comprehensive.types';

interface VotingRecordCardProps {
  votingRecord: VotingRecord;
  showDetails?: boolean;
  className?: string;
}

interface LegislatorVotingStatsProps {
  stats: LegislatorVotingStats;
  className?: string;
}

interface VotingRecordListProps {
  records: VotingRecord[];
  legislatorName?: string;
  maxItems?: number;
  className?: string;
}

// ========================================================================================
// INDIVIDUAL VOTING RECORD CARD
// ========================================================================================

export function VotingRecordCard({ votingRecord, showDetails = false, className }: VotingRecordCardProps) {
  const [expanded, setExpanded] = useState(showDetails);

  const getVoteIcon = (vote: VotingRecord['vote']) => {
    switch (vote) {
      case 'Yea':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Nay':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Not Voting':
        return <MinusCircle className="h-4 w-4 text-yellow-600" />;
      case 'Absent':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <MinusCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVoteBadgeColor = (vote: VotingRecord['vote']) => {
    switch (vote) {
      case 'Yea':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Nay':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Not Voting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Absent':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const votePercentage = votingRecord.totalVotes > 0 
    ? ((votingRecord.yesVotes / votingRecord.totalVotes) * 100).toFixed(1)
    : '0';

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {votingRecord.billTitle}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {votingRecord.billNumber}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {votingRecord.chamber}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatDate(votingRecord.date)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Badge className={cn("border", getVoteBadgeColor(votingRecord.vote))}>
              <span className="flex items-center gap-1">
                {getVoteIcon(votingRecord.vote)}
                {votingRecord.vote}
              </span>
            </Badge>
            
            {votingRecord.passed ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {expanded && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {votingRecord.description}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {votingRecord.yesVotes}
                </div>
                <div className="text-xs text-gray-500">Yes Votes</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                  {votingRecord.noVotes}
                </div>
                <div className="text-xs text-gray-500">No Votes</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-600">
                  {votingRecord.totalVotes}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {votePercentage}%
                </div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <Badge 
                variant={votingRecord.passed ? "default" : "secondary"}
                className={votingRecord.passed ? "bg-green-600" : "bg-red-600"}
              >
                {votingRecord.passed ? 'PASSED' : 'FAILED'}
              </Badge>
              
              {votingRecord.significance && (
                <Badge variant="outline" className="text-xs">
                  {votingRecord.significance} Vote
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 hover:text-blue-800"
          >
            {expanded ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// LEGISLATOR VOTING STATISTICS SUMMARY
// ========================================================================================

export function LegislatorVotingStats({ stats, className }: LegislatorVotingStatsProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Voting Statistics
        </CardTitle>
        <p className="text-sm text-gray-600">
          {stats.legislatorName} ({stats.party}) - District {stats.district}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Vote Breakdown */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Vote Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.voteBreakdown.yea}
              </div>
              <div className="text-sm text-green-700">Yes</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.voteBreakdown.nay}
              </div>
              <div className="text-sm text-red-700">No</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.voteBreakdown.notVoting}
              </div>
              <div className="text-sm text-yellow-700">Not Voting</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {stats.voteBreakdown.absent}
              </div>
              <div className="text-sm text-gray-700">Absent</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.attendanceRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.partyLoyaltyScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Party Loyalty</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.bipartisanScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Bipartisan</div>
            </div>
          </div>
        </div>

        {/* Voting Period */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Analysis Period</h4>
          <p className="text-sm text-gray-600">
            {new Date(stats.votingPeriod.startDate).toLocaleDateString()} - {' '}
            {new Date(stats.votingPeriod.endDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Total Votes Analyzed: {stats.totalVotes}
          </p>
        </div>

        {/* Significant Votes Preview */}
        {stats.significantVotes.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recent Significant Votes</h4>
            <div className="space-y-2">
              {stats.significantVotes.slice(0, 3).map((vote, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium truncate flex-1">
                    {vote.billNumber}: {vote.billTitle}
                  </span>
                  <div className="flex items-center gap-2 ml-2">
                    {getVoteIcon(vote.vote)}
                    <Badge variant="outline" className="text-xs">
                      {vote.vote}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// VOTING RECORD LIST COMPONENT
// ========================================================================================

export function VotingRecordList({ 
  records, 
  legislatorName, 
  maxItems = 10, 
  className 
}: VotingRecordListProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedRecords = showAll ? records : records.slice(0, maxItems);

  if (records.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="text-center py-8">
          <MinusCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Voting Records Available
          </h3>
          <p className="text-gray-600">
            {legislatorName ? `${legislatorName} has no` : 'No'} voting records to display at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {legislatorName ? `${legislatorName}'s Voting Record` : 'Voting Records'}
        </h3>
        <Badge variant="secondary">
          {records.length} Vote{records.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {displayedRecords.map((record, index) => (
          <VotingRecordCard
            key={`${record.rollCallId}-${index}`}
            votingRecord={record}
            showDetails={false}
          />
        ))}
      </div>

      {records.length > maxItems && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? (
              <>Show Less ({maxItems} of {records.length})</>
            ) : (
              <>Show All Votes ({records.length} total)</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ========================================================================================
// UTILITY FUNCTION (DUPLICATE FROM HOOK - FOR COMPONENT USE)
// ========================================================================================

function getVoteIcon(vote: VotingRecord['vote']) {
  switch (vote) {
    case 'Yea':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'Nay':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'Not Voting':
      return <MinusCircle className="h-4 w-4 text-yellow-600" />;
    case 'Absent':
      return <Clock className="h-4 w-4 text-gray-500" />;
    default:
      return <MinusCircle className="h-4 w-4 text-gray-500" />;
  }
}

// Export all components
export default VotingRecordCard;