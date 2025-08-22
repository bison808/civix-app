'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  TrendingUp,
  Home,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';
import { Bill } from '@/types';

interface WhyThisMattersProps {
  bill: Bill;
  className?: string;
  compact?: boolean;
}

interface ImpactArea {
  icon: React.ElementType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  color: string;
  bgColor: string;
}

export default function WhyThisMatters({ bill, className, compact = false }: WhyThisMattersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const generateImpactAreas = (bill: Bill): ImpactArea[] => {
    const impacts: ImpactArea[] = [];

    // Analyze bill subjects and generate relevant impacts
    if (bill.subjects.some(s => s.toLowerCase().includes('health'))) {
      impacts.push({
        icon: Heart,
        title: 'Healthcare Impact',
        description: 'May affect healthcare costs, coverage, or access to medical services',
        severity: 'high',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200'
      });
    }

    if (bill.subjects.some(s => s.toLowerCase().includes('tax') || s.toLowerCase().includes('revenue'))) {
      impacts.push({
        icon: DollarSign,
        title: 'Financial Impact',
        description: 'Could change taxes, government spending, or economic policies',
        severity: 'high',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200'
      });
    }

    if (bill.subjects.some(s => s.toLowerCase().includes('education'))) {
      impacts.push({
        icon: GraduationCap,
        title: 'Education Impact',
        description: 'May affect schools, student funding, or educational programs',
        severity: 'medium',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200'
      });
    }

    if (bill.subjects.some(s => s.toLowerCase().includes('employment') || s.toLowerCase().includes('labor'))) {
      impacts.push({
        icon: Briefcase,
        title: 'Employment Impact',
        description: 'Could affect jobs, workplace rights, or labor regulations',
        severity: 'medium',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200'
      });
    }

    if (bill.subjects.some(s => s.toLowerCase().includes('housing'))) {
      impacts.push({
        icon: Home,
        title: 'Housing Impact',
        description: 'May affect housing costs, availability, or homeowner rights',
        severity: 'high',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200'
      });
    }

    // Default impact if no specific categories match
    if (impacts.length === 0) {
      impacts.push({
        icon: Users,
        title: 'Community Impact',
        description: 'This legislation may affect your local community and daily life',
        severity: 'medium',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-200'
      });
    }

    return impacts.slice(0, 3); // Limit to 3 most relevant impacts
  };

  const generateWhyItMatters = (bill: Bill): string => {
    const subjects = bill.subjects.join(', ').toLowerCase();
    
    if (subjects.includes('health')) {
      return "Healthcare decisions affect everyone. This bill could change how you access medical care, what it costs, and what services are available in your community.";
    }
    if (subjects.includes('tax')) {
      return "Tax changes directly impact your wallet. This legislation could affect how much you pay in taxes and what government services receive funding.";
    }
    if (subjects.includes('education')) {
      return "Education policies shape our future. This bill could impact schools in your area, student opportunities, and educational funding.";
    }
    if (subjects.includes('environment')) {
      return "Environmental policies affect the air you breathe and water you drink. This legislation could impact your local environment and climate.";
    }
    if (subjects.includes('transportation')) {
      return "Transportation affects your daily commute and local infrastructure. This bill could impact roads, transit, and travel in your area.";
    }
    
    return "Every piece of legislation has the potential to affect citizens. This bill addresses issues that may impact your community and daily life.";
  };

  const getTimelineImpact = (bill: Bill): string => {
    if (bill.status.stage.toLowerCase().includes('introduced')) {
      return "Early stage - Still being reviewed and debated";
    }
    if (bill.status.stage.toLowerCase().includes('committee')) {
      return "In committee - Being examined by experts";
    }
    if (bill.status.stage.toLowerCase().includes('floor')) {
      return "Up for vote - Decision time is approaching";
    }
    if (bill.status.stage.toLowerCase().includes('passed')) {
      return "Progressing - Moving closer to becoming law";
    }
    return "Active legislation - Currently in the lawmaking process";
  };

  const impactAreas = generateImpactAreas(bill);
  const whyItMatters = generateWhyItMatters(bill);
  const timelineImpact = getTimelineImpact(bill);

  if (compact && !isExpanded) {
    return (
      <Card variant="default" padding="sm" className={cn("cursor-pointer", className)} onClick={() => setIsExpanded(true)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Why This Matters</span>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className={cn("border-l-4 border-l-yellow-400", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={20} />
            <h3 className="font-semibold text-gray-900">Why This Matters to You</h3>
          </div>
          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {/* Main explanation */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            {whyItMatters}
          </p>
        </div>

        {/* Impact areas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <TrendingUp size={14} />
            Potential Impacts
          </h4>
          <div className="grid gap-3">
            {impactAreas.map((impact, index) => {
              const Icon = impact.icon;
              return (
                <div key={index} className={cn("p-3 rounded-lg border", impact.bgColor)}>
                  <div className="flex items-start gap-3">
                    <Icon className={cn("mt-0.5", impact.color)} size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{impact.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{impact.description}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        impact.severity === 'high' ? 'bg-red-100 text-red-700' :
                        impact.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      )}>
                        {impact.severity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline context */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Clock className="text-blue-600 mt-0.5" size={16} />
          <div>
            <p className="text-sm font-medium text-blue-900">Current Status</p>
            <p className="text-xs text-blue-700 mt-1">{timelineImpact}</p>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            💡 <strong>Stay informed:</strong> Follow this bill to get updates when important changes happen
          </p>
        </div>
      </div>
    </Card>
  );
}