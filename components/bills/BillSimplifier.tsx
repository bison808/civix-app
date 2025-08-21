import React, { useState } from 'react';
import { FileText, Eye, EyeOff, Info, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface BillSimplifierProps {
  originalText: string;
  simplifiedText: string;
  keyPoints?: string[];
  technicalTerms?: { term: string; definition: string }[];
}

export default function BillSimplifier({
  originalText,
  simplifiedText,
  keyPoints = [],
  technicalTerms = []
}: BillSimplifierProps) {
  const [viewMode, setViewMode] = useState<'simplified' | 'original' | 'compare'>('simplified');
  const [showTerms, setShowTerms] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Split text into sections for better readability
  const splitIntoSections = (text: string) => {
    const sections = text.split(/\n\n+/).filter(s => s.trim());
    return sections;
  };

  const simplifiedSections = splitIntoSections(simplifiedText);
  const originalSections = splitIntoSections(originalText);

  return (
    <div className="space-y-4">
      {/* View Mode Selector */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setViewMode('simplified')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium',
            viewMode === 'simplified'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Zap size={16} />
          Simplified
        </button>
        <button
          onClick={() => setViewMode('original')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium',
            viewMode === 'original'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <FileText size={16} />
          Original
        </button>
        <button
          onClick={() => setViewMode('compare')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium',
            viewMode === 'compare'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Eye size={16} />
          Compare
        </button>
      </div>

      {/* Key Points */}
      {keyPoints.length > 0 && viewMode !== 'original' && (
        <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Key Points</h4>
              <ul className="space-y-1">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Content Display */}
      {viewMode === 'simplified' && (
        <Card variant="default" padding="md">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="text-yellow-500" size={20} />
            Plain English Version
          </h3>
          <div className="space-y-3">
            {simplifiedSections.map((section, index) => (
              <div key={index} className="text-sm text-gray-700 leading-relaxed">
                {section}
              </div>
            ))}
          </div>
        </Card>
      )}

      {viewMode === 'original' && (
        <Card variant="default" padding="md">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="text-gray-500" size={20} />
            Original Legal Text
          </h3>
          <div className="space-y-3">
            {originalSections.map((section, index) => (
              <div key={index} className="text-sm text-gray-700 leading-relaxed font-mono">
                {section}
              </div>
            ))}
          </div>
        </Card>
      )}

      {viewMode === 'compare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default" padding="md">
            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Zap className="text-yellow-500" size={16} />
              Simplified
            </h4>
            <div className="space-y-3 text-sm">
              {simplifiedSections.map((section, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <p className="text-gray-700 leading-relaxed">{section}</p>
                </div>
              ))}
            </div>
          </Card>
          
          <Card variant="default" padding="md">
            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <FileText className="text-gray-500" size={16} />
              Original
            </h4>
            <div className="space-y-3 text-sm">
              {originalSections.slice(0, simplifiedSections.length).map((section, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="text-gray-700 leading-relaxed font-mono text-xs">
                    {section.substring(0, 200)}
                    {section.length > 200 && '...'}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Technical Terms Glossary */}
      {technicalTerms.length > 0 && (
        <Card variant="default" padding="md">
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between text-left"
          >
            <h4 className="font-semibold">Legal Terms Explained</h4>
            {showTerms ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showTerms && (
            <div className="mt-3 space-y-2">
              {technicalTerms.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <dt className="font-medium text-sm text-gray-900 mb-1">
                    {item.term}
                  </dt>
                  <dd className="text-sm text-gray-600">
                    {item.definition}
                  </dd>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Reading Level Indicator */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-4 bg-green-500 rounded-sm" />
            <div className="w-2 h-4 bg-green-500 rounded-sm" />
            <div className="w-2 h-4 bg-gray-300 rounded-sm" />
            <div className="w-2 h-4 bg-gray-300 rounded-sm" />
            <div className="w-2 h-4 bg-gray-300 rounded-sm" />
          </div>
          <span className="text-sm text-gray-600">
            {viewMode === 'simplified' ? '8th Grade Reading Level' : 'College Reading Level'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {viewMode === 'simplified' ? '~3 min read' : '~10 min read'}
        </span>
      </div>
    </div>
  );
}