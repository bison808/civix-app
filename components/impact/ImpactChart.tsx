'use client';

import { useEffect, useRef } from 'react';
import { DollarSign, Heart, GraduationCap, Leaf, Shield, Scale } from 'lucide-react';
import { PersonalImpact } from '@/types';
import { cn } from '@/lib/utils';

interface ImpactChartProps {
  impacts: PersonalImpact[];
  type?: 'personal' | 'community';
  animated?: boolean;
  interactive?: boolean;
}

const categoryIcons = {
  financial: DollarSign,
  healthcare: Heart,
  education: GraduationCap,
  environment: Leaf,
  safety: Shield,
  rights: Scale,
};

const effectColors = {
  positive: 'text-positive bg-positive/10 border-positive/20',
  negative: 'text-negative bg-negative/10 border-negative/20',
  neutral: 'text-gray-600 bg-gray-100 border-gray-200',
};

const magnitudeHeight = {
  high: 'h-24',
  medium: 'h-16',
  low: 'h-10',
};

export default function ImpactChart({
  impacts,
  type = 'personal',
  animated = true,
  interactive = true,
}: ImpactChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animated && chartRef.current) {
      const bars = chartRef.current.querySelectorAll('.impact-bar');
      bars.forEach((bar, index) => {
        setTimeout(() => {
          bar.classList.add('animate-slide-up');
        }, index * 100);
      });
    }
  }, [animated, impacts]);

  if (!impacts || impacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No impact data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {type === 'personal' ? 'How This Affects You' : 'Community Impact'}
      </h3>

      {/* Bar Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-end justify-between gap-2" ref={chartRef}>
          {impacts.map((impact, index) => {
            const Icon = categoryIcons[impact.category];
            return (
              <div
                key={index}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2',
                  interactive && 'cursor-pointer hover:opacity-80 transition-opacity'
                )}
              >
                <div
                  className={cn(
                    'impact-bar w-full rounded-t-lg transition-all duration-500',
                    magnitudeHeight[impact.magnitude],
                    effectColors[impact.effect].split(' ')[1], // bg color
                    animated && 'opacity-0'
                  )}
                  title={impact.description}
                />
                <Icon
                  size={20}
                  className={effectColors[impact.effect].split(' ')[0]} // text color
                />
                <span className="text-xs text-gray-600 text-center capitalize">
                  {impact.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact Details */}
      <div className="space-y-3">
        {impacts.map((impact, index) => {
          const Icon = categoryIcons[impact.category];
          return (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border',
                effectColors[impact.effect],
                interactive && 'cursor-pointer hover:shadow-sm transition-shadow'
              )}
            >
              <Icon size={20} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium capitalize">{impact.category}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                    {impact.magnitude} impact
                  </span>
                </div>
                <p className="text-sm">{impact.description}</p>
                <p className="text-xs mt-1 opacity-75">{impact.timeframe}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}