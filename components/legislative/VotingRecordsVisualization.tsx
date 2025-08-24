'use client';

import { useState, useMemo } from 'react';
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
  PieChart,
  Activity,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VotingRecord, LegislatorVotingStats } from '@/types/legislative-comprehensive.types';

interface VotingRecordsVisualizationProps {
  records: VotingRecord[];
  legislatorName: string;
  stats: LegislatorVotingStats;
  className?: string;
}

interface VotingChartProps {
  stats: LegislatorVotingStats;
  className?: string;
}

interface VotingTimelineProps {
  records: VotingRecord[];
  className?: string;
}

// ========================================================================================
// INTERACTIVE VOTING CHART COMPONENT
// ========================================================================================

function VotingChart({ stats, className }: VotingChartProps) {
  const [activeChart, setActiveChart] = useState<'pie' | 'performance'>('pie');

  const chartData = [
    { label: 'Yes', value: stats.voteBreakdown.yea, color: 'bg-green-500', textColor: 'text-green-700' },
    { label: 'No', value: stats.voteBreakdown.nay, color: 'bg-red-500', textColor: 'text-red-700' },
    { label: 'Not Voting', value: stats.voteBreakdown.notVoting, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { label: 'Absent', value: stats.voteBreakdown.absent, color: 'bg-gray-500', textColor: 'text-gray-700' }
  ];

  const total = stats.totalVotes;
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Voting Pattern Analysis
          </CardTitle>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveChart('pie')}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                activeChart === 'pie' 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <PieChart className="h-3 w-3 inline mr-1" />
              Breakdown
            </button>
            <button
              onClick={() => setActiveChart('performance')}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                activeChart === 'performance' 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Activity className="h-3 w-3 inline mr-1" />
              Performance
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeChart === 'pie' ? (
          <div className="space-y-6">
            {/* Visual Bar Chart */}
            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className={item.textColor}>
                      {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={cn("h-2 rounded-full transition-all duration-500", item.color)}
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.attendanceRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Attendance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.partyLoyaltyScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Party Loyalty</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-600">
                  {stats.attendanceRate.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700">Participation Rate</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats.attendanceRate >= 90 ? 'Excellent' : 
                   stats.attendanceRate >= 80 ? 'Good' : 
                   stats.attendanceRate >= 70 ? 'Average' : 'Below Average'}
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-purple-600">
                  {stats.partyLoyaltyScore.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-700">Party Alignment</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats.partyLoyaltyScore >= 90 ? 'Very High' : 
                   stats.partyLoyaltyScore >= 70 ? 'High' : 
                   stats.partyLoyaltyScore >= 50 ? 'Moderate' : 'Independent'}
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-orange-600">
                  {stats.bipartisanScore.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-700">Bipartisan Support</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats.bipartisanScore >= 30 ? 'High' : 
                   stats.bipartisanScore >= 15 ? 'Moderate' : 
                   stats.bipartisanScore >= 5 ? 'Low' : 'Very Low'}
                </div>
              </div>
            </div>

            {/* Comparison Context */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">How This Compares</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Attendance:</span> 
                  <span className={cn(
                    "ml-2",
                    stats.attendanceRate >= 85 ? "text-green-600" : 
                    stats.attendanceRate >= 75 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {stats.attendanceRate >= 85 ? "Above Average" : 
                     stats.attendanceRate >= 75 ? "Average" : "Below Average"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Bipartisan Cooperation:</span>
                  <span className={cn(
                    "ml-2",
                    stats.bipartisanScore >= 20 ? "text-green-600" : 
                    stats.bipartisanScore >= 10 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {stats.bipartisanScore >= 20 ? "High" : 
                     stats.bipartisanScore >= 10 ? "Moderate" : "Low"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// VOTING TIMELINE COMPONENT
// ========================================================================================

function VotingTimeline({ records, className }: VotingTimelineProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '90d' | '1y'>('90d');
  const [filterType, setFilterType] = useState<'all' | 'significant'>('all');

  const filteredRecords = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    let filtered = records.filter(record => 
      new Date(record.date) >= cutoffDate
    );

    if (filterType === 'significant') {
      filtered = filtered.filter(record => 
        record.significance === 'High' || record.significance === 'Key'
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 20);
  }, [records, selectedPeriod, filterType]);

  const getVoteIcon = (vote: VotingRecord['vote']) => {
    switch (vote) {
      case 'Yea': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Nay': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Not Voting': return <MinusCircle className="h-4 w-4 text-yellow-600" />;
      case 'Absent': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <MinusCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Voting Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Votes</option>
              <option value="significant">Key Votes</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Votes Found</h3>
            <p className="text-gray-600">
              No voting records found for the selected period and filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredRecords.map((record, index) => (
              <div key={`${record.rollCallId}-${index}`} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                <div className="flex-shrink-0 mt-1">
                  {getVoteIcon(record.vote)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-2">
                        {record.billTitle}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {record.billNumber}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        {record.significance && (
                          <Badge 
                            variant={record.significance === 'High' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {record.significance}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {record.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Badge 
                        variant={record.vote === 'Yea' ? 'default' : 'secondary'}
                        className={cn(
                          "text-xs",
                          record.vote === 'Yea' ? "bg-green-100 text-green-800" :
                          record.vote === 'Nay' ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        )}
                      >
                        {record.vote}
                      </Badge>
                      {record.passed ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredRecords.length > 0 && (
          <div className="text-center mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              <Eye className="h-3 w-3 mr-1" />
              View All Voting History
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// MAIN VOTING RECORDS VISUALIZATION COMPONENT
// ========================================================================================

export default function VotingRecordsVisualization({ 
  records, 
  legislatorName, 
  stats, 
  className 
}: VotingRecordsVisualizationProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {legislatorName}'s Voting Record
        </h2>
        <p className="text-gray-600">
          Comprehensive analysis of {stats.totalVotes} votes from {' '}
          {new Date(stats.votingPeriod.startDate).toLocaleDateString()} to {' '}
          {new Date(stats.votingPeriod.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VotingChart stats={stats} />
        <VotingTimeline records={records} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">
            {((stats.voteBreakdown.yea / stats.totalVotes) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-green-700">Voted Yes</div>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-600">
            {((stats.voteBreakdown.nay / stats.totalVotes) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-red-700">Voted No</div>
        </div>

        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">
            {stats.attendanceRate.toFixed(1)}%
          </div>
          <div className="text-sm text-blue-700">Attendance</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">
            {stats.bipartisanScore.toFixed(1)}%
          </div>
          <div className="text-sm text-purple-700">Bipartisan</div>
        </div>
      </div>
    </div>
  );
}