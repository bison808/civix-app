import React from 'react';
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Users, BarChart3, PieChart } from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface AggregatedFeedbackProps {
  targetId: string;
  targetType: 'representative' | 'bill';
  data?: {
    totalFeedback: number;
    positive: number;
    negative: number;
    neutral: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
    topCategories: { category: string; count: number; sentiment: string }[];
    demographics?: {
      byAge: { range: string; positive: number; negative: number }[];
      byDistrict: { district: string; positive: number; negative: number }[];
    };
  };
}

export default function AggregatedFeedback({
  targetId,
  targetType,
  data = {
    totalFeedback: 1234,
    positive: 782,
    negative: 312,
    neutral: 140,
    trend: 'up',
    trendPercentage: 12,
    topCategories: [
      { category: 'Responsiveness', count: 234, sentiment: 'positive' },
      { category: 'Voting Record', count: 189, sentiment: 'negative' },
      { category: 'Communication', count: 156, sentiment: 'positive' },
      { category: 'Policy Positions', count: 123, sentiment: 'neutral' }
    ],
    demographics: {
      byAge: [
        { range: '18-24', positive: 65, negative: 35 },
        { range: '25-34', positive: 72, negative: 28 },
        { range: '35-44', positive: 58, negative: 42 },
        { range: '45-54', positive: 61, negative: 39 },
        { range: '55+', positive: 70, negative: 30 }
      ],
      byDistrict: [
        { district: 'District 1', positive: 68, negative: 32 },
        { district: 'District 2', positive: 55, negative: 45 },
        { district: 'District 3', positive: 72, negative: 28 }
      ]
    }
  }
}: AggregatedFeedbackProps) {
  const positivePercentage = Math.round((data.positive / data.totalFeedback) * 100);
  const negativePercentage = Math.round((data.negative / data.totalFeedback) * 100);
  const neutralPercentage = Math.round((data.neutral / data.totalFeedback) * 100);

  const getTrendIcon = () => {
    if (data.trend === 'up') return <TrendingUp className="text-green-600" size={20} />;
    if (data.trend === 'down') return <TrendingDown className="text-red-600" size={20} />;
    return null;
  };

  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      case 'neutral': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Sentiment */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Community Sentiment</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            <span>{data.totalFeedback.toLocaleString()} feedbacks</span>
          </div>
        </div>

        {/* Sentiment Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ThumbsUp className="text-green-600" size={16} />
                <span className="text-sm font-medium">Positive</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {positivePercentage}% ({data.positive})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${positivePercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ThumbsDown className="text-red-600" size={16} />
                <span className="text-sm font-medium">Negative</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {negativePercentage}% ({data.negative})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-red-500 transition-all duration-500"
                style={{ width: `${negativePercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600" />
                <span className="text-sm font-medium">Neutral</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {neutralPercentage}% ({data.neutral})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${neutralPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
          {getTrendIcon()}
          <span className={cn(
            'text-sm font-medium',
            data.trend === 'up' ? 'text-green-600' : 
            data.trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          )}>
            {data.trend === 'up' ? '+' : data.trend === 'down' ? '-' : ''}
            {data.trendPercentage}% from last month
          </span>
        </div>
      </Card>

      {/* Top Categories */}
      <Card variant="default" padding="md">
        <h3 className="text-lg font-semibold mb-4">Top Feedback Categories</h3>
        <div className="space-y-2">
          {data.topCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium">{category.category}</p>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    getSentimentColor(category.sentiment)
                  )}>
                    {category.sentiment}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {category.count} mentions
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Demographics Breakdown */}
      {data.demographics && (
        <Card variant="default" padding="md">
          <h3 className="text-lg font-semibold mb-4">Demographic Breakdown</h3>
          
          {/* By Age */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">By Age Group</h4>
            <div className="space-y-2">
              {data.demographics.byAge.map((age) => (
                <div key={age.range} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-12">{age.range}</span>
                  <div className="flex-1 flex h-6 rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${age.positive}%` }}
                    >
                      {age.positive}%
                    </div>
                    <div
                      className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${age.negative}%` }}
                    >
                      {age.negative}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By District */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">By District</h4>
            <div className="grid grid-cols-3 gap-3">
              {data.demographics.byDistrict.map((district) => (
                <div key={district.district} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">{district.district}</p>
                  <div className="text-lg font-bold text-green-600">
                    {district.positive}%
                  </div>
                  <div className="text-xs text-gray-500">positive</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Sentiment Over Time (Placeholder) */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sentiment Trend</h3>
          <BarChart3 className="text-gray-400" size={20} />
        </div>
        <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Chart visualization coming soon</p>
        </div>
      </Card>
    </div>
  );
}