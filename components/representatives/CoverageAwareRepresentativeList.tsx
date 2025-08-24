'use client';

import { useState, useEffect } from 'react';
import { MapPin, Building2, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import RepresentativeCard from './RepresentativeCard';
import StateExpansionWaitlist from '../feedback/StateExpansionWaitlist';
import ContextualFeedbackPrompt from '../feedback/ContextualFeedbackPrompt';
import { coverageDetectionService, CoverageLevel, LocationData } from '@/services/coverageDetectionService';
import { Representative } from '@/types';
import { api } from '@/services/api';

interface CoverageAwareRepresentativeListProps {
  zipCode: string;
  className?: string;
}

export default function CoverageAwareRepresentativeList({
  zipCode,
  className
}: CoverageAwareRepresentativeListProps) {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [coverage, setCoverage] = useState<CoverageLevel | null>(null);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (zipCode) {
      loadLocationAndRepresentatives();
    }
  }, [zipCode]);

  const loadLocationAndRepresentatives = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, verify ZIP code and get location data
      const zipResponse = await fetch('/api/auth/verify-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode })
      });

      const zipData = await zipResponse.json();

      if (!zipData.valid) {
        setError('Invalid ZIP code');
        return;
      }

      // Create location data from API response
      const locationData: LocationData = {
        city: zipData.city,
        state: zipData.state,
        county: zipData.county,
        zipCode,
        coordinates: [0, 0], // Default coordinates
        districts: {
          congressional: 0 // Default district
        }
      };

      // Determine coverage level
      const coverage = coverageDetectionService.determineUserExperience(locationData);

      setLocationData(locationData);
      setCoverage(coverage);

      // Load appropriate representatives based on coverage
      await loadRepresentatives(coverage, locationData);
    } catch (err) {
      setError('Failed to load location data');
      console.error('Error loading location and representatives:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRepresentatives = async (coverage: CoverageLevel, locationData: LocationData) => {
    try {
      const reps = await api.representatives.getByZipCode(zipCode);

      // Filter representatives based on coverage level
      let filteredReps = reps;

      if (coverage.type === 'federal_only') {
        // Show only federal representatives
        filteredReps = reps.filter(rep => 
          rep.chamber === 'House' || rep.chamber === 'Senate'
        );
      } else if (coverage.type === 'full_coverage') {
        // Show all representatives (federal, state, local)
        filteredReps = reps;
      } else {
        // Not supported - show empty
        filteredReps = [];
      }

      // Enhance representatives with coverage information
      const enhancedReps = filteredReps.map(rep => ({
        ...rep,
        level: (rep.title === 'Senator' || rep.title === 'Representative' ? 'federal' : 
               rep.title.includes('State') ? 'state' : 'local') as 'federal' | 'state' | 'county' | 'municipal',
        jurisdiction: rep.state || locationData.state,
        approvalRating: Math.floor(Math.random() * 40) + 50,
        responsiveness: Math.floor(Math.random() * 30) + 60,
        totalFeedback: Math.floor(Math.random() * 2000) + 100
      }));

      setRepresentatives(enhancedReps);
    } catch (err) {
      console.error('Failed to load representatives:', err);
      setError('Failed to load representatives');
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Representatives</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!locationData || !coverage) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-600">Unable to determine location data</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Location Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">
            {locationData.city}, {locationData.state}
          </h2>
        </div>
        <p className="text-gray-600 mb-3">{coverage.message}</p>
        
        {/* Coverage Level Indicator */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            coverage.type === 'full_coverage' 
              ? 'bg-green-100 text-green-700'
              : coverage.type === 'federal_only'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
          )}>
            {coverage.type === 'full_coverage' && 'Full Coverage'}
            {coverage.type === 'federal_only' && 'Federal Only'}
            {coverage.type === 'not_supported' && 'Not Supported'}
          </div>
          
          {coverage.showFederal && (
            <span className="text-xs text-gray-500">Federal ✓</span>
          )}
          {coverage.showState && (
            <span className="text-xs text-gray-500">State ✓</span>
          )}
          {coverage.showLocal && (
            <span className="text-xs text-gray-500">Local ✓</span>
          )}
        </div>
      </div>

      {/* Representatives Content Based on Coverage */}
      {coverage.type === 'full_coverage' && (
        <>
          {/* Full Coverage - Show all representatives */}
          {representatives.length > 0 ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Building2 className="mx-auto mb-1 text-purple-600" size={24} />
                  <div className="text-lg font-bold">
                    {representatives.filter(r => r.chamber === 'House' || r.chamber === 'Senate').length}
                  </div>
                  <div className="text-xs text-gray-600">Federal</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Building2 className="mx-auto mb-1 text-green-600" size={24} />
                  <div className="text-lg font-bold">
                    {representatives.filter(r => r.title?.includes('State')).length}
                  </div>
                  <div className="text-xs text-gray-600">State</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Building2 className="mx-auto mb-1 text-orange-600" size={24} />
                  <div className="text-lg font-bold">
                    {representatives.filter(r => r.title?.includes('Mayor') || r.title?.includes('Council')).length}
                  </div>
                  <div className="text-xs text-gray-600">Local</div>
                </div>
              </div>

              {/* Representatives List */}
              <div className="space-y-4">
                {representatives.map((rep) => (
                  <RepresentativeCard
                    key={rep.id}
                    representative={rep}
                    onContact={(method) => {
                      if (method === 'email' && rep.contactInfo.email) {
                        window.location.href = `mailto:${rep.contactInfo.email}`;
                      } else if (method === 'phone') {
                        window.location.href = `tel:${rep.contactInfo.phone}`;
                      }
                    }}
                    onFeedback={(type) => {
                      console.log('Feedback:', rep.id, type);
                    }}
                  />
                ))}
              </div>

              {/* Feedback Prompt for Full Coverage */}
              <ContextualFeedbackPrompt
                context={{ 
                  type: 'after_full_data', 
                  zipCode, 
                  state: locationData.state,
                  page: 'representatives'
                }}
                compact
              />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No representatives found for this area.</p>
              <ContextualFeedbackPrompt
                context={{ 
                  type: 'empty_results', 
                  zipCode, 
                  state: locationData.state,
                  page: 'representatives'
                }}
              />
            </div>
          )}
        </>
      )}

      {coverage.type === 'federal_only' && (
        <>
          {/* Federal Only Coverage */}
          {representatives.length > 0 && (
            <>
              {/* Federal Stats */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="text-blue-600" size={20} />
                  <h3 className="font-medium text-blue-900">Federal Representatives</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Showing {representatives.length} federal representative{representatives.length !== 1 ? 's' : ''} for your area.
                </p>
              </div>

              {/* Federal Representatives List */}
              <div className="space-y-4">
                {representatives.map((rep) => (
                  <RepresentativeCard
                    key={rep.id}
                    representative={rep}
                    onContact={(method) => {
                      if (method === 'email' && rep.contactInfo.email) {
                        window.location.href = `mailto:${rep.contactInfo.email}`;
                      } else if (method === 'phone') {
                        window.location.href = `tel:${rep.contactInfo.phone}`;
                      }
                    }}
                    onFeedback={(type) => {
                      console.log('Feedback:', rep.id, type);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* State Expansion Waitlist */}
          <StateExpansionWaitlist
            state={locationData.state}
            zipCode={zipCode}
            city={locationData.city}
          />
        </>
      )}

      {coverage.type === 'not_supported' && (
        <div className="text-center py-8">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Area Not Supported</h3>
          <p className="text-gray-600 mb-6">
            We don't currently have political data for this area.
          </p>
          
          <StateExpansionWaitlist
            state={locationData.state}
            zipCode={zipCode}
            city={locationData.city}
            variant="card"
          />
        </div>
      )}

      {/* Additional Contextual Feedback */}
      {coverage.type === 'federal_only' && representatives.length > 0 && (
        <ContextualFeedbackPrompt
          context={{ 
            type: 'limited_coverage', 
            zipCode, 
            state: locationData.state,
            page: 'representatives'
          }}
          state={locationData.state}
          compact
        />
      )}
    </div>
  );
}