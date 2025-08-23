import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Phone, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2,
  MapPin,
  Crown,
  Landmark,
  Home,
  ChevronRight
} from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { Representative } from '@/types';
import { cn } from '@/lib/utils';

interface EnhancedRepresentativeCardProps {
  representative: Representative;
  onContact?: (method: 'email' | 'phone' | 'website') => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
  variant?: 'default' | 'compact' | 'detailed';
  showHierarchy?: boolean;
  className?: string;
}

export default function EnhancedRepresentativeCard({ 
  representative, 
  onContact,
  onFeedback,
  variant = 'default',
  showHierarchy = true,
  className = ''
}: EnhancedRepresentativeCardProps) {
  const router = useRouter();

  // Government level configuration
  const getLevelConfig = (level: string, governmentType: string) => {
    const configs = {
      federal: {
        icon: Crown,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        bgColor: 'bg-purple-50',
        label: 'Federal Government',
        priority: 4
      },
      state: {
        icon: Landmark,
        color: 'bg-green-100 text-green-800 border-green-200',
        bgColor: 'bg-green-50',
        label: 'State Government',
        priority: 3
      },
      county: {
        icon: Building2,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        bgColor: 'bg-blue-50',
        label: 'County Government',
        priority: 2
      },
      municipal: {
        icon: Home,
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        bgColor: 'bg-orange-50',
        label: 'City/Municipal',
        priority: 1
      }
    };

    return configs[level as keyof typeof configs] || configs.municipal;
  };

  const getPartyConfig = (party: string) => {
    const partyMap: { [key: string]: { color: string; fullName: string } } = {
      'D': { color: 'bg-blue-100 text-blue-800 border-blue-200', fullName: 'Democrat' },
      'R': { color: 'bg-red-100 text-red-800 border-red-200', fullName: 'Republican' },
      'I': { color: 'bg-purple-100 text-purple-800 border-purple-200', fullName: 'Independent' },
      'Democrat': { color: 'bg-blue-100 text-blue-800 border-blue-200', fullName: 'Democrat' },
      'Republican': { color: 'bg-red-100 text-red-800 border-red-200', fullName: 'Republican' },
      'Independent': { color: 'bg-purple-100 text-purple-800 border-purple-200', fullName: 'Independent' }
    };
    return partyMap[party] || { color: 'bg-gray-100 text-gray-800 border-gray-200', fullName: party };
  };

  const getAlignmentColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const levelConfig = getLevelConfig(representative.level, representative.governmentType);
  const partyConfig = getPartyConfig(representative.party);
  const LevelIcon = levelConfig.icon;

  const handleClick = () => {
    router.push(`/representatives/${representative.id}`);
  };

  const handleContactClick = (method: 'email' | 'phone' | 'website', e: React.MouseEvent) => {
    e.stopPropagation();
    onContact?.(method);
  };

  // Compact variant for list views
  if (variant === 'compact') {
    return (
      <Card 
        variant="default" 
        padding="sm" 
        className={cn("hover:shadow-md transition-all duration-200 cursor-pointer group", className)}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {representative.photoUrl ? (
              <img 
                src={representative.photoUrl} 
                alt={representative.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {representative.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <div className={cn('absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center', levelConfig.color)}>
              <LevelIcon size={12} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {representative.name}
            </h4>
            <p className="text-sm text-gray-600 truncate">{representative.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs px-2 py-0.5 rounded-full border', partyConfig.color)}>
                {representative.party}
              </span>
              {representative.district && (
                <span className="text-xs text-gray-500">
                  District {representative.district}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action */}
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
        </div>
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <Card 
      variant="default" 
      padding="lg" 
      className={cn("hover:shadow-lg transition-all duration-200", className)}
    >
      <div className="space-y-4">
        {/* Government Level Header */}
        {showHierarchy && (
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border', levelConfig.color)}>
            <LevelIcon size={16} />
            <span className="text-sm font-medium">{levelConfig.label}</span>
            <div className="ml-auto text-xs">Priority {levelConfig.priority}</div>
          </div>
        )}

        {/* Representative Header */}
        <div className="flex items-start gap-4">
          <div 
            className="relative cursor-pointer group"
            onClick={handleClick}
          >
            {representative.photoUrl ? (
              <img 
                src={representative.photoUrl} 
                alt={representative.name}
                className="w-20 h-20 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                <span className="text-xl font-semibold text-gray-600">
                  {representative.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <div className={cn('absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white', levelConfig.color)}>
              <LevelIcon size={12} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate"
              onClick={handleClick}
            >
              {representative.name}
            </h3>
            <p className="text-lg text-gray-700 mb-2">{representative.title}</p>
            
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('text-sm px-3 py-1 rounded-full border font-medium', partyConfig.color)}>
                {partyConfig.fullName}
              </span>
              
              <span className={cn('text-sm px-3 py-1 rounded-full border', levelConfig.color)}>
                {representative.chamber}
              </span>
              
              {representative.district && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>District {representative.district}</span>
                </div>
              )}
            </div>

            {/* Jurisdiction Info */}
            {variant === 'detailed' && (
              <div className="mt-2 text-sm text-gray-600">
                <div>Jurisdiction: {representative.jurisdiction}</div>
                {representative.jurisdictionScope && (
                  <div className="capitalize">Scope: {representative.jurisdictionScope}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-100">
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

        {/* Contact Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleContactClick('email', e)}
            className="flex-1 sm:flex-none"
            disabled={!representative.contactInfo.email}
          >
            <Mail size={16} className="mr-2" />
            Email
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleContactClick('phone', e)}
            className="flex-1 sm:flex-none"
            disabled={!representative.contactInfo.phone}
          >
            <Phone size={16} className="mr-2" />
            Call
          </Button>

          {representative.contactInfo.website && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleContactClick('website', e)}
              className="flex-1 sm:flex-none"
            >
              <ExternalLink size={16} className="mr-2" />
              Website
            </Button>
          )}
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleClick}
            className="flex-1 sm:flex-none ml-auto"
          >
            View Profile
          </Button>
        </div>

        {/* Additional Info for Detailed Variant */}
        {variant === 'detailed' && representative.biography && (
          <div className="pt-3 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">Biography</h4>
            <p className="text-sm text-gray-600 line-clamp-3">
              {representative.biography}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}