import React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, Users } from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { Representative } from '@/types';
import { cn } from '@/lib/utils';

interface RepresentativeCardProps {
  representative: Representative;
  onContact?: (method: 'email' | 'phone') => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
  compact?: boolean;
}

export default function RepresentativeCard({ 
  representative, 
  onContact,
  onFeedback,
  compact = false 
}: RepresentativeCardProps) {
  const router = useRouter();

  const getPartyColor = (party: string) => {
    switch(party) {
      case 'D': return 'bg-blue-100 text-blue-800';
      case 'R': return 'bg-red-100 text-red-800';
      case 'I': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelBadge = (level: string) => {
    switch(level) {
      case 'federal': return 'bg-purple-100 text-purple-800';
      case 'state': return 'bg-green-100 text-green-800';
      case 'local': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlignmentColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleClick = () => {
    router.push(`/representatives/${representative.id}`);
  };

  if (compact) {
    return (
      <Card 
        variant="default" 
        padding="sm" 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {representative.photoUrl ? (
              <img 
                src={representative.photoUrl} 
                alt={representative.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {representative.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <div>
              <h4 className="font-medium text-sm">{representative.name}</h4>
              <p className="text-xs text-gray-600">{representative.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2 py-1 rounded-full', getPartyColor(representative.party))}>
              {representative.party}
            </span>
            {representative.scorecard?.overallScore && (
              <span className={cn('text-sm font-bold', getAlignmentColor(representative.scorecard.overallScore))}>
                {representative.scorecard.overallScore}%
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className="hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div 
            className="flex items-start gap-3 flex-1 cursor-pointer"
            onClick={handleClick}
          >
            {representative.photoUrl ? (
              <img 
                src={representative.photoUrl} 
                alt={representative.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">
                  {representative.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {representative.name}
              </h3>
              <p className="text-sm text-gray-600">{representative.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xs px-2 py-0.5 rounded-full', getPartyColor(representative.party))}>
                  {representative.party}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', getLevelBadge(representative.chamber.toLowerCase()))}>
                  {representative.chamber}
                </span>
                {representative.district && (
                  <span className="text-xs text-gray-500">
                    District {representative.district}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
          {/* Alignment Score */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              {representative.scorecard?.overallScore && representative.scorecard?.overallScore >= 50 ? (
                <TrendingUp className="text-green-500" size={20} />
              ) : (
                <TrendingDown className="text-red-500" size={20} />
              )}
            </div>
            <div className={cn('text-lg font-bold', getAlignmentColor(representative.scorecard?.overallScore))}>
              {representative.scorecard?.overallScore || 0}%
            </div>
            <div className="text-xs text-gray-500">Alignment</div>
          </div>

          {/* Approval Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="text-blue-500" size={20} />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {representative.scorecard?.overallScore || 0}%
            </div>
            <div className="text-xs text-gray-500">Approval</div>
          </div>

          {/* Responsiveness */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <span className="text-purple-500 text-sm">⚡</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {representative.scorecard?.overallScore || 0}%
            </div>
            <div className="text-xs text-gray-500">Response</div>
          </div>
        </div>

        {/* Feedback Section - would need to be loaded from feedback API */}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onContact?.('email');
            }}
            className="flex-1"
          >
            <Mail size={16} className="mr-1" />
            Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onContact?.('phone');
            }}
            className="flex-1"
          >
            <Phone size={16} className="mr-1" />
            Call
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleClick}
            className="flex-1"
          >
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}