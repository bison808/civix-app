'use client';

import { useState, useEffect } from 'react';
import ContextualFeedbackPrompt from './ContextualFeedbackPrompt';
import StateExpansionWaitlist from './StateExpansionWaitlist';
import { coverageDetectionService } from '@/services/coverageDetectionService';

interface SmartFeedbackFooterProps {
  page: string;
  variant?: 'compact' | 'full';
  className?: string;
  showExpansionWaitlist?: boolean;
}

export default function SmartFeedbackFooter({
  page,
  variant = 'compact',
  className = '',
  showExpansionWaitlist = true
}: SmartFeedbackFooterProps) {
  const [locationData, setLocationData] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocationData();
  }, []);

  const loadLocationData = async () => {
    const zipCode = typeof window !== 'undefined' ? localStorage.getItem('userZipCode') : null;
    if (zipCode) {
      try {
        const zipResponse = await fetch('/api/auth/verify-zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zipCode })
        });
        const zipData = await zipResponse.json();
        
        if (zipData.valid) {
          const locationData = {
            city: zipData.city,
            state: zipData.state,
            county: zipData.county,
            zipCode,
            coordinates: [0, 0] as [number, number],
            districts: { congressional: 0 }
          };
          const coverage = coverageDetectionService.determineUserExperience(locationData);
          setLocationData(locationData);
          setCoverage(coverage);
        }
      } catch (error) {
        console.error('Failed to load location data:', error);
      }
    }
    setLoading(false);
  };

  if (loading || !coverage || !locationData) {
    return (
      <div className={className}>
        {/* Fallback general feedback */}
        <ContextualFeedbackPrompt
          context={{ type: 'general', page }}
          compact={variant === 'compact'}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {coverage.type === 'federal_only' && showExpansionWaitlist ? (
        <div className="space-y-4">
          <StateExpansionWaitlist
            state={locationData.state}
            zipCode={locationData.zipCode}
            city={locationData.city}
            variant={variant === 'compact' ? 'inline' : 'card'}
          />
          
          {variant === 'full' && (
            <ContextualFeedbackPrompt
              context={{
                type: 'limited_coverage',
                zipCode: locationData.zipCode,
                state: locationData.state,
                page
              }}
              state={locationData.state}
              compact={false}
            />
          )}
        </div>
      ) : coverage.type === 'full_coverage' ? (
        <ContextualFeedbackPrompt
          context={{
            type: 'after_full_data',
            zipCode: locationData.zipCode,
            state: locationData.state,
            page
          }}
          compact={variant === 'compact'}
        />
      ) : (
        <ContextualFeedbackPrompt
          context={{
            type: 'general',
            zipCode: locationData.zipCode,
            state: locationData.state,
            page
          }}
          compact={variant === 'compact'}
        />
      )}
    </div>
  );
}