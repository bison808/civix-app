'use client';

import { TrendingUp, TrendingDown, Minus, MapPin, Clock, Users } from 'lucide-react';
import Card from '@/components/core/Card';
import { PersonalImpact } from '@/types';
import { cn } from '@/lib/utils';

interface ImpactSummaryProps {
  impacts: PersonalImpact[];
  location?: string;
  affectedPeople?: number;
  timeline?: {
    voteDate?: string;
    implementationDate?: string;
    firstEffects?: string;
  };
}

export default function ImpactSummary({
  impacts,
  location = 'Your area',
  affectedPeople,
  timeline,
}: ImpactSummaryProps) {
  // Calculate overall impact
  const positiveCount = impacts.filter(i => i.effect === 'positive').length;
  const negativeCount = impacts.filter(i => i.effect === 'negative').length;
  const overallEffect = positiveCount > negativeCount ? 'positive' : 
                        negativeCount > positiveCount ? 'negative' : 'neutral';

  const getOverallIcon = () => {
    switch (overallEffect) {
      case 'positive':
        return <TrendingUp className="text-positive" size={24} />;
      case 'negative':
        return <TrendingDown className="text-negative" size={24} />;
      default:
        return <Minus className="text-gray-500" size={24} />;
    }
  };

  const getOverallText = () => {
    switch (overallEffect) {
      case 'positive':
        return 'Overall Positive Impact';
      case 'negative':
        return 'Overall Negative Impact';
      default:
        return 'Mixed Impact';
    }
  };

  const formatTimeframe = (date?: string) => {
    if (!date) return 'TBD';
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Past';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Overall Impact Card */}
      <Card variant="elevated" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getOverallIcon()}
            <div>
              <h3 className="font-semibold text-gray-900">{getOverallText()}</h3>
              <p className="text-sm text-gray-600">
                {positiveCount} positive, {negativeCount} negative effects
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-2">
            <MapPin className="text-gray-500" size={16} />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-medium">{location}</p>
            </div>
          </div>
        </Card>

        {affectedPeople && (
          <Card variant="default" padding="sm">
            <div className="flex items-center gap-2">
              <Users className="text-gray-500" size={16} />
              <div>
                <p className="text-xs text-gray-500">Affected</p>
                <p className="text-sm font-medium">
                  {affectedPeople.toLocaleString()} people
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Timeline */}
      {timeline && (
        <Card variant="default" padding="md">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Timeline
          </h4>
          <div className="space-y-3">
            {timeline.voteDate && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  new Date(timeline.voteDate) > new Date() ? 'bg-delta' : 'bg-gray-300'
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium">Vote Date</p>
                  <p className="text-xs text-gray-500">
                    {formatTimeframe(timeline.voteDate)}
                  </p>
                </div>
              </div>
            )}
            {timeline.implementationDate && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Implementation</p>
                  <p className="text-xs text-gray-500">
                    {formatTimeframe(timeline.implementationDate)}
                  </p>
                </div>
              </div>
            )}
            {timeline.firstEffects && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <div className="flex-1">
                  <p className="text-sm font-medium">First Effects</p>
                  <p className="text-xs text-gray-500">
                    {formatTimeframe(timeline.firstEffects)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Key Impacts */}
      <Card variant="default" padding="md">
        <h4 className="font-medium text-gray-900 mb-3">Key Changes</h4>
        <ul className="space-y-2">
          {impacts.slice(0, 3).map((impact, index) => (
            <li key={index} className="flex items-start gap-2">
              <span
                className={cn(
                  'inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                  impact.effect === 'positive' ? 'bg-positive' :
                  impact.effect === 'negative' ? 'bg-negative' :
                  'bg-gray-400'
                )}
              />
              <span className="text-sm text-gray-700">{impact.description}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}