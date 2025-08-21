import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Heart, GraduationCap, Leaf, Shield, Users } from 'lucide-react';
import Card from '@/components/core/Card';
import { PersonalImpact } from '@/types';
import { cn } from '@/lib/utils';

interface BillImpactSummaryProps {
  billId: string;
  impacts: PersonalImpact[];
  communityImpacts?: string[];
  timeline?: {
    voteDate?: string;
    implementationDate?: string;
    firstEffects?: string;
  };
}

export default function BillImpactSummary({
  billId,
  impacts,
  communityImpacts = [],
  timeline
}: BillImpactSummaryProps) {
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'financial': return <DollarSign className="text-green-600" size={20} />;
      case 'healthcare': return <Heart className="text-red-600" size={20} />;
      case 'education': return <GraduationCap className="text-blue-600" size={20} />;
      case 'environment': return <Leaf className="text-green-600" size={20} />;
      case 'safety': return <Shield className="text-purple-600" size={20} />;
      case 'rights': return <Users className="text-orange-600" size={20} />;
      default: return null;
    }
  };

  const getEffectIcon = (effect: string) => {
    switch(effect) {
      case 'positive': return <TrendingUp className="text-green-600" size={16} />;
      case 'negative': return <TrendingDown className="text-red-600" size={16} />;
      default: return null;
    }
  };

  const getEffectColor = (effect: string) => {
    switch(effect) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-700';
      case 'negative': return 'bg-red-50 border-red-200 text-red-700';
      case 'neutral': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getMagnitudeLabel = (magnitude: string) => {
    switch(magnitude) {
      case 'high': return 'High Impact';
      case 'medium': return 'Moderate Impact';
      case 'low': return 'Low Impact';
      default: return magnitude;
    }
  };

  const getMagnitudeColor = (magnitude: string) => {
    switch(magnitude) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Group impacts by category
  const groupedImpacts = impacts.reduce((acc, impact) => {
    if (!acc[impact.category]) {
      acc[impact.category] = [];
    }
    acc[impact.category].push(impact);
    return acc;
  }, {} as Record<string, PersonalImpact[]>);

  return (
    <div className="space-y-4">
      {/* Personal Impacts */}
      <Card variant="default" padding="md">
        <h3 className="text-lg font-semibold mb-4">How This Affects You</h3>
        
        {Object.entries(groupedImpacts).map(([category, categoryImpacts]) => (
          <div key={category} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(category)}
              <span className="text-sm font-medium capitalize">{category}</span>
            </div>
            
            <div className="space-y-2 ml-7">
              {categoryImpacts.map((impact, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border',
                    getEffectColor(impact.effect)
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getEffectIcon(impact.effect)}
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        getMagnitudeColor(impact.magnitude)
                      )}>
                        {getMagnitudeLabel(impact.magnitude)}
                      </span>
                    </div>
                    {impact.timeframe && (
                      <span className="text-xs text-gray-600">
                        {impact.timeframe}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{impact.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {impacts.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No personal impacts identified yet
          </p>
        )}
      </Card>

      {/* Community Impacts */}
      {communityImpacts.length > 0 && (
        <Card variant="default" padding="md">
          <h3 className="text-lg font-semibold mb-4">Community Impact</h3>
          <ul className="space-y-2">
            {communityImpacts.map((impact, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{impact}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Timeline */}
      {timeline && (
        <Card variant="default" padding="md">
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300" />
            
            <div className="space-y-4">
              {timeline.voteDate && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold z-10">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vote Date</p>
                    <p className="text-xs text-gray-600">
                      {new Date(timeline.voteDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {timeline.implementationDate && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold z-10">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Implementation</p>
                    <p className="text-xs text-gray-600">
                      {new Date(timeline.implementationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {timeline.firstEffects && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold z-10">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">First Effects</p>
                    <p className="text-xs text-gray-600">
                      {new Date(timeline.firstEffects).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Summary Box */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {impacts.filter(i => i.effect === 'positive').length}
          </div>
          <div className="text-xs text-green-700">Positive Impacts</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {impacts.filter(i => i.effect === 'negative').length}
          </div>
          <div className="text-xs text-red-700">Negative Impacts</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {impacts.filter(i => i.effect === 'neutral').length}
          </div>
          <div className="text-xs text-gray-700">Neutral Impacts</div>
        </div>
      </div>
    </div>
  );
}