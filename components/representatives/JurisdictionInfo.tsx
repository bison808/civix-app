/**
 * Jurisdiction Information Component
 * Displays area type, government structure, and representative information
 * Based on jurisdiction detection results
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, MapPin, Building2, Users, AlertCircle } from 'lucide-react';
import { JurisdictionDetectionResult } from '@/types/jurisdiction.types';

interface JurisdictionInfoProps {
  jurisdiction: JurisdictionDetectionResult;
  areaInfo: {
    title: string;
    description: string;
    governmentStructure: string;
    representatives: string;
  };
  zipCode: string;
  showDetailedInfo?: boolean;
  className?: string;
}

const JurisdictionInfo: React.FC<JurisdictionInfoProps> = ({
  jurisdiction,
  areaInfo,
  zipCode,
  showDetailedInfo = true,
  className = ''
}) => {
  const getJurisdictionIcon = () => {
    switch (jurisdiction.jurisdiction.type) {
      case 'incorporated_city':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'unincorporated_area':
      case 'census_designated_place':
        return <MapPin className="w-5 h-5 text-green-600" />;
      case 'special_district':
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getJurisdictionColor = () => {
    switch (jurisdiction.jurisdiction.type) {
      case 'incorporated_city':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'unincorporated_area':
      case 'census_designated_place':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'special_district':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getConfidenceBadge = () => {
    const confidence = jurisdiction.confidence;
    if (confidence >= 0.8) {
      return <Badge variant="outline" className="text-green-700 border-green-300">High Confidence</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge variant="outline" className="text-yellow-700 border-yellow-300">Medium Confidence</Badge>;
    } else {
      return <Badge variant="outline" className="text-red-700 border-red-300">Low Confidence</Badge>;
    }
  };

  const getGovernmentLevelBadges = () => {
    return jurisdiction.jurisdiction.governmentLevel.map(level => {
      const colors = {
        federal: 'bg-blue-100 text-blue-800',
        state: 'bg-green-100 text-green-800',
        county: 'bg-yellow-100 text-yellow-800',
        municipal: 'bg-purple-100 text-purple-800'
      };
      
      return (
        <Badge 
          key={level} 
          variant="secondary" 
          className={colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </Badge>
      );
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main jurisdiction card */}
      <Card className={`p-4 border-l-4 ${getJurisdictionColor()}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getJurisdictionIcon()}
            <div>
              <h3 className="font-semibold text-lg">{areaInfo.title}</h3>
              <p className="text-sm text-gray-600 mt-1">ZIP Code: {zipCode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getConfidenceBadge()}
            <Badge variant="outline" className="text-xs">
              {jurisdiction.source}
            </Badge>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-gray-700">{areaInfo.description}</p>
        </div>

        {/* Government levels */}
        <div className="mt-3 flex flex-wrap gap-2">
          {getGovernmentLevelBadges()}
        </div>
      </Card>

      {/* Detailed information */}
      {showDetailedInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Government Structure */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Building2 className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold">Government Structure</h4>
            </div>
            <p className="text-sm text-gray-700">{areaInfo.governmentStructure}</p>
          </Card>

          {/* Representative Info */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold">Your Representatives</h4>
            </div>
            <p className="text-sm text-gray-700">{areaInfo.representatives}</p>
          </Card>
        </div>
      )}

      {/* Special messages for unincorporated areas */}
      {!jurisdiction.jurisdiction.hasLocalRepresentatives && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">
                Unincorporated Area Notice
              </h4>
              <p className="text-sm text-amber-700">
                This area does not have city-level representatives. Local government services 
                are provided directly by {jurisdiction.jurisdiction.county}. You will see 
                county commissioners or supervisors instead of mayors or city council members.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Low confidence warning */}
      {jurisdiction.confidence < 0.5 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">
                Jurisdiction Detection Notice
              </h4>
              <p className="text-sm text-yellow-700">
                We have limited information about the government structure for this area. 
                The representatives shown may not be complete. Please verify with your 
                local government if you need specific information.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default JurisdictionInfo;