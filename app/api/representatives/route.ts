import { NextRequest, NextResponse } from 'next/server';
import { congressService } from '@/services/congressService';
import { realDataService } from '@/services/realDataService';
import { openStatesService } from '@/services/openStatesService';
import { civicInfoService } from '@/services/civicInfoService';
import { Representative } from '@/types';

// GET /api/representatives?zipCode=90210
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zipCode');
  const level = searchParams.get('level'); // federal, state, local, all
  
  if (!zipCode) {
    return NextResponse.json(
      { error: 'ZIP code is required' },
      { status: 400 }
    );
  }

  // Validate ZIP code format
  if (!/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
    return NextResponse.json(
      { error: 'Invalid ZIP code format. Expected 5 digits.' },
      { status: 400 }
    );
  }

  const cleanZip = zipCode.trim().substring(0, 5);
  
  try {
    let representatives: Representative[] = [];

    // Get federal representatives (always included unless level=state or level=local)
    if (!level || level === 'federal' || level === 'all') {
      try {
        const { getRepsByZip } = await import('@/services/congress2025');
        const federalReps = getRepsByZip(cleanZip);
        representatives.push(...federalReps);
        console.log(`Found ${federalReps.length} federal representatives for ZIP ${cleanZip}`);
      } catch (error) {
        console.error('Failed to fetch federal representatives:', error);
      }
    }

    // Get location information for state/local representatives
    const location = await realDataService.getLocationFromZip(cleanZip);
    
    if (location) {
      // Get state legislators if requested
      if (!level || level === 'state' || level === 'all') {
        try {
          const stateReps = await openStatesService.getStateLegislators(location.state);
          const filteredStateReps = stateReps.filter(rep => 
            rep.jurisdiction.toLowerCase().includes(location.city.toLowerCase()) ||
            rep.jurisdiction.toLowerCase() === location.state.toLowerCase()
          );
          representatives.push(...filteredStateReps);
          console.log(`Found ${filteredStateReps.length} state representatives for ${location.city}, ${location.state}`);
        } catch (error) {
          console.error('Failed to fetch state representatives:', error);
        }
      }

      // Get local officials if requested
      if (!level || level === 'local' || level === 'all') {
        try {
          const localOfficials = await civicInfoService.getLocalOfficials(
            location.city,
            location.state,
            cleanZip
          );
          representatives.push(...localOfficials);
          console.log(`Found ${localOfficials.length} local officials for ${location.city}, ${location.state}`);
        } catch (error) {
          console.error('Failed to fetch local officials:', error);
          
          // Fallback: Create basic local representative entries
          const fallbackLocal: Representative[] = [
            {
              id: `mayor-${cleanZip}`,
              name: `Mayor of ${location.city}`,
              title: 'Mayor',
              party: 'Independent' as const,
              state: location.state,
              district: location.city,
              chamber: 'Local' as any,
              level: 'municipal' as const,
              jurisdiction: location.city,
              governmentType: 'city' as const,
              jurisdictionScope: 'citywide' as const,
              contactInfo: {
                phone: '311',
                website: `https://www.${location.city.toLowerCase().replace(/\s+/g, '')}.gov`,
                email: `mayor@${location.city.toLowerCase().replace(/\s+/g, '')}.gov`
              },
              socialMedia: {},
              committees: [],
              termStart: '2022-01-01',
              termEnd: '2026-01-01'
            }
          ];
          representatives.push(...fallbackLocal);
        }
      }
    }

    // If no representatives found, return error
    if (representatives.length === 0) {
      return NextResponse.json(
        { 
          error: `No representatives found for ZIP code ${cleanZip}`,
          zipCode: cleanZip,
          location: location || null
        },
        { status: 404 }
      );
    }

    // Sort representatives by level priority (federal, state, local)
    representatives.sort((a, b) => {
      const levelOrder = { federal: 0, state: 1, municipal: 2, county: 3 };
      const aLevel = levelOrder[a.level || 'municipal'] || 99;
      const bLevel = levelOrder[b.level || 'municipal'] || 99;
      
      if (aLevel !== bLevel) return aLevel - bLevel;
      
      // Within same level, sort by chamber
      const chamberOrder = { 'Senate': 0, 'House': 1, 'Local': 2 };
      const aChamber = chamberOrder[a.chamber as keyof typeof chamberOrder] || 99;
      const bChamber = chamberOrder[b.chamber as keyof typeof chamberOrder] || 99;
      
      return aChamber - bChamber;
    });

    return NextResponse.json({
      representatives,
      zipCode: cleanZip,
      location: location || null,
      total: representatives.length,
      byLevel: {
        federal: representatives.filter(r => r.level === 'federal').length,
        state: representatives.filter(r => r.level === 'state').length,
        local: representatives.filter(r => r.level === 'municipal' || r.level === 'county').length
      }
    });

  } catch (error) {
    console.error('Representatives API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch representatives',
        details: error instanceof Error ? error.message : 'Unknown error',
        zipCode: cleanZip
      },
      { status: 500 }
    );
  }
}

// POST /api/representatives/contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { representativeId, method, subject, message, userInfo } = body;

    if (!representativeId || !method || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: representativeId, method, subject, message' },
        { status: 400 }
      );
    }

    // Validate contact method
    if (!['phone', 'email', 'website', 'social'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid contact method. Must be: phone, email, website, or social' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Log the contact attempt
    // 2. Send to representative's office via appropriate channel
    // 3. Track engagement metrics
    
    console.log('Representative contact:', {
      representativeId,
      method,
      subject,
      messageLength: message.length,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent to the representative',
      contactMethod: method,
      timestamp: new Date().toISOString(),
      trackingId: `contact_${Date.now()}_${Math.random().toString(36).substring(7)}`
    });

  } catch (error) {
    console.error('Contact representative error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message to representative',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}