'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Target,
  MapPin
} from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';
import { Bill } from '@/types';

interface EngagingBillSummaryProps {
  bill: Bill;
  className?: string;
}

interface SummarySection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string | string[] | { pros: string[]; cons: string[] };
  type: 'text' | 'list' | 'pros-cons';
  importance: 'high' | 'medium' | 'low';
}

export default function EngagingBillSummary({ bill, className }: EngagingBillSummaryProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const generateEngagingSummary = (bill: Bill): string => {
    const aiSummary = bill.aiSummary?.simpleSummary;
    if (aiSummary) return aiSummary;

    // Generate an engaging summary from the bill data
    const subjects = bill.subjects.join(', ').toLowerCase();
    let summary = `This ${bill.chamber} bill, "${bill.title}", `;

    if (subjects.includes('health')) {
      summary += "focuses on healthcare policy that could affect medical services and costs for citizens. ";
    } else if (subjects.includes('tax')) {
      summary += "proposes changes to tax policy that could impact your finances and government revenue. ";
    } else if (subjects.includes('education')) {
      summary += "addresses education policy that may affect schools and students in your area. ";
    } else {
      summary += "addresses important policy matters that may affect your community. ";
    }

    summary += `Sponsored by ${bill.sponsor.name} (${bill.sponsor.party}-${bill.sponsor.state}), this legislation is currently ${bill.status.stage.toLowerCase()}.`;

    return summary;
  };

  const generateKeyPoints = (bill: Bill): string[] => {
    if (bill.aiSummary?.keyPoints) return bill.aiSummary.keyPoints;

    // Generate key points from available data
    const points: string[] = [];
    
    points.push(`Introduced in the ${bill.chamber} on ${new Date(bill.introducedDate).toLocaleDateString()}`);
    
    if (bill.subjects.length > 0) {
      points.push(`Addresses: ${bill.subjects.slice(0, 3).join(', ')}`);
    }

    if (bill.committees.length > 0) {
      points.push(`Being reviewed by: ${bill.committees[0]}`);
    }

    points.push(`Current status: ${bill.status.stage}`);

    if (bill.cosponsors.length > 0) {
      points.push(`Supported by ${bill.cosponsors.length} co-sponsor${bill.cosponsors.length > 1 ? 's' : ''}`);
    }

    return points;
  };

  const generateProsAndCons = (bill: Bill): { pros: string[], cons: string[] } => {
    if (bill.aiSummary?.pros && bill.aiSummary?.cons) {
      return { pros: bill.aiSummary.pros, cons: bill.aiSummary.cons };
    }

    // Generate balanced pros/cons based on bill subjects
    const subjects = bill.subjects.join(', ').toLowerCase();
    const pros: string[] = [];
    const cons: string[] = [];

    if (subjects.includes('health')) {
      pros.push('May improve healthcare access and quality');
      cons.push('Could increase healthcare costs or change existing coverage');
    } else if (subjects.includes('tax')) {
      pros.push('May provide tax relief or fund important programs');
      cons.push('Could increase taxes or reduce government services');
    } else if (subjects.includes('environment')) {
      pros.push('May protect environmental resources and public health');
      cons.push('Could impose new regulations on businesses and individuals');
    } else {
      pros.push('Addresses important policy needs');
      cons.push('May have unintended consequences or implementation challenges');
    }

    return { pros, cons };
  };

  const getWhoIsAffected = (bill: Bill): string[] => {
    if (bill.aiSummary?.whoItAffects) return bill.aiSummary.whoItAffects;

    const subjects = bill.subjects.join(', ').toLowerCase();
    const affected: string[] = [];

    if (subjects.includes('health')) {
      affected.push('Patients and healthcare consumers', 'Healthcare providers', 'Insurance companies');
    } else if (subjects.includes('tax')) {
      affected.push('Taxpayers', 'Businesses', 'Government programs');
    } else if (subjects.includes('education')) {
      affected.push('Students and families', 'Teachers and schools', 'Educational institutions');
    } else if (subjects.includes('employment')) {
      affected.push('Workers and job seekers', 'Employers', 'Labor unions');
    } else {
      affected.push('Citizens and communities', 'Local governments', 'Relevant industries');
    }

    return affected.slice(0, 4);
  };

  const sections: SummarySection[] = [
    {
      id: 'overview',
      title: 'The Big Picture',
      icon: Lightbulb,
      content: generateEngagingSummary(bill),
      type: 'text',
      importance: 'high'
    },
    {
      id: 'key-points',
      title: 'Key Details',
      icon: Target,
      content: generateKeyPoints(bill),
      type: 'list',
      importance: 'high'
    },
    {
      id: 'pros-cons',
      title: 'Potential Outcomes',
      icon: Users,
      content: generateProsAndCons(bill),
      type: 'pros-cons',
      importance: 'high'
    },
    {
      id: 'affected',
      title: 'Who This Affects',
      icon: MapPin,
      content: getWhoIsAffected(bill),
      type: 'list',
      importance: 'medium'
    }
  ];

  const getImportanceColor = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high': return 'border-l-red-400 bg-red-50';
      case 'medium': return 'border-l-yellow-400 bg-yellow-50';
      case 'low': return 'border-l-gray-400 bg-gray-50';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Reading level indicator */}
      <Card variant="default" padding="sm" className="bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-blue-900">
              Plain English Summary
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-3 bg-green-500 rounded-sm" />
              <div className="w-1.5 h-3 bg-green-500 rounded-sm" />
              <div className="w-1.5 h-3 bg-gray-300 rounded-sm" />
              <div className="w-1.5 h-3 bg-gray-300 rounded-sm" />
            </div>
            <span className="text-xs text-blue-700">Easy Read</span>
          </div>
        </div>
      </Card>

      {/* Summary sections */}
      {sections.map((section) => {
        const Icon = section.icon;
        const isExpanded = expandedSections.has(section.id);
        
        return (
          <Card 
            key={section.id} 
            variant="default" 
            padding="md" 
            className={cn(
              "border-l-4 transition-all duration-200",
              getImportanceColor(section.importance)
            )}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-3">
                <Icon className="text-gray-600" size={20} />
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                {section.importance === 'high' && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Important
                  </span>
                )}
              </div>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {section.type === 'text' && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {section.content as string}
                  </p>
                )}

                {section.type === 'list' && (
                  <ul className="space-y-2">
                    {(section.content as string[]).map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.type === 'pros-cons' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Pros */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-800 flex items-center gap-2">
                        <ThumbsUp size={16} />
                        Potential Benefits
                      </h4>
                      <ul className="space-y-2">
                        {((section.content as any).pros as string[]).map((pro, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={12} />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-orange-800 flex items-center gap-2">
                        <ThumbsDown size={16} />
                        Potential Concerns
                      </h4>
                      <ul className="space-y-2">
                        {((section.content as any).cons as string[]).map((con, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={12} />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {/* Bottom tip */}
      <Card variant="default" padding="sm" className="bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          💡 <strong>Tip:</strong> This summary is designed to help you understand complex legislation. 
          For the full legal text, view the original bill document.
        </p>
      </Card>
    </div>
  );
}