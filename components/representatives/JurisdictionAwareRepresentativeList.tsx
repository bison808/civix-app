/**
 * Jurisdiction-Aware Representative List Component
 * Displays representatives filtered based on jurisdiction type
 * Shows appropriate messaging for incorporated vs unincorporated areas
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Users, 
  Building2, 
  MapPin, 
  Flag,
  AlertTriangle,
  CheckCircle,
  Info 
} from 'lucide-react';
import JurisdictionInfo from './JurisdictionInfo';
import RepresentativeCard from './RepresentativeCard';
import { RepresentativeCardSkeleton } from './RepresentativeCardSkeleton';
import { useJurisdictionAwareRepresentatives } from '@/hooks/useJurisdictionAwareRepresentatives';

interface JurisdictionAwareRepresentativeListProps {
  zipCode: string;
  className?: string;
  showJurisdictionInfo?: boolean;
  groupByLevel?: boolean;
}

const JurisdictionAwareRepresentativeList: React.FC<JurisdictionAwareRepresentativeListProps> = ({
  zipCode,
  className = '',
  showJurisdictionInfo = true,
  groupByLevel = true
}) => {
  const {
    federal,
    state,
    local,
    total,
    breakdown,
    jurisdiction,
    areaInfo,
    loading,
    error,
    refreshData,
    isUnincorporatedArea,
    hasLocalRepresentatives,
    getExclusionReason
  } = useJurisdictionAwareRepresentatives(zipCode);

  const renderRepresentativeSection = (
    title: string,
    representatives: any[],
    icon: React.ReactNode,
    levelType: 'federal' | 'state' | 'local'
  ) => {
    const isExcluded = levelType === 'local' && !hasLocalRepresentatives();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
            <Badge variant="outline" className="text-sm">
              {representatives.length}
            </Badge>
          </div>
          {isExcluded && (
            <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">
              Not Applicable
            </Badge>
          )}
        </div>

        {isExcluded ? (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-700">
                  {getExclusionReason()}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {representatives.map((rep, index) => (
              <RepresentativeCard
                key={rep.id || index}
                representative={rep}
              />
            ))}
          </div>
        )}

        {!isExcluded && representatives.length === 0 && !loading && (
          <Card className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No {title.toLowerCase()} found for this area.</p>
          </Card>
        )}
      </div>
    );
  };

  const renderSummaryStats = () => (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Representative Summary</h3>
          <p className="text-sm text-gray-600 mt-1">
            {total} total representatives across {breakdown.federal > 0 ? 1 : 0 + breakdown.state > 0 ? 1 : 0 + breakdown.local > 0 ? 1 : 0} levels of government
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{breakdown.federal}</div>
            <div className="text-xs text-gray-600">Federal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{breakdown.state}</div>
            <div className="text-xs text-gray-600">State</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{breakdown.local}</div>
            <div className="text-xs text-gray-600">Local</div>
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showJurisdictionInfo && (
          <Card className="p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, index) => (
            <RepresentativeCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center border-red-200 bg-red-50">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Representatives</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Jurisdiction Information */}
      {showJurisdictionInfo && jurisdiction && areaInfo && (
        <JurisdictionInfo
          jurisdiction={jurisdiction}
          areaInfo={areaInfo}
          zipCode={zipCode}
          showDetailedInfo={true}
        />
      )}

      {/* Summary Statistics */}
      {renderSummaryStats()}

      {/* Representatives by Level */}
      {groupByLevel ? (
        <div className="space-y-8">
          {/* Federal Representatives */}
          {renderRepresentativeSection(
            'Federal Representatives',
            federal,
            <Flag className="w-5 h-5 text-blue-600" />,
            'federal'
          )}

          <Separator className="my-6" />

          {/* State Representatives */}
          {renderRepresentativeSection(
            'State Representatives',
            state,
            <Building2 className="w-5 h-5 text-green-600" />,
            'state'
          )}

          <Separator className="my-6" />

          {/* Local Representatives */}
          {renderRepresentativeSection(
            'Local Representatives',
            local,
            <MapPin className="w-5 h-5 text-purple-600" />,
            'local'
          )}
        </div>
      ) : (
        // All representatives in one list
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Representatives</h3>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...federal, ...state, ...local].map((rep, index) => (
              <RepresentativeCard
                key={rep.id || index}
                representative={rep}
              />
            ))}
          </div>
        </div>
      )}

      {/* No representatives found */}
      {total === 0 && !loading && (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Representatives Found
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't find representative information for ZIP code {zipCode}.
          </p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      )}

      {/* Data source and accuracy info */}
      {jurisdiction && (
        <Card className="p-3 bg-gray-50 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-3 h-3" />
              <span>
                Data source: {jurisdiction.source} • 
                Confidence: {Math.round(jurisdiction.confidence * 100)}% • 
                Updated: {new Date(jurisdiction.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            {isUnincorporatedArea() && (
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700">
                Unincorporated Area
              </Badge>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default JurisdictionAwareRepresentativeList;