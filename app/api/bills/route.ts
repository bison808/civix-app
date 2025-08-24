import { NextRequest, NextResponse } from 'next/server';
import { congressService } from '@/services/congressService';
import { billsService } from '@/services/bills.service';
import { congressApi } from '@/services/congressApi';
import { californiaLegislativeApi } from '@/services/californiaLegislativeApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'federal', 'california', 'all'
    const zipCode = searchParams.get('zipCode');
    const representativeId = searchParams.get('representativeId');
    const topic = searchParams.get('topic');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let bills = [];

    try {
      // Handle different bill sources
      if (zipCode) {
        // Get bills from user's representatives
        bills = await billsService.getBillsFromUserRepresentatives(zipCode);
      } else if (representativeId) {
        // Get bills from specific representative
        const activity = await billsService.getBillsByRepresentative(representativeId);
        bills = [...activity.sponsoredBills, ...activity.cosponsoredBills, ...activity.committeeBills];
      } else if (source === 'federal') {
        // Get federal bills only
        bills = await congressApi.fetchRecentBills(limit, offset);
      } else if (source === 'california') {
        // Get California bills only
        bills = await californiaLegislativeApi.fetchRecentBills(limit, offset);
      } else {
        // Get mixed federal and state bills
        const federalBills = await congressApi.fetchRecentBills(Math.ceil(limit / 2), offset);
        const californiaBills = await californiaLegislativeApi.fetchRecentBills(Math.floor(limit / 2), offset);
        bills = [...federalBills, ...californiaBills];
      }
    } catch (error) {
      console.error('Failed to fetch enhanced bills, using fallback:', error);
      
      // Fallback to original congress service
      try {
        bills = await congressService.getRecentBills();
      } catch (fallbackError) {
        console.error('All data sources failed:', fallbackError);
        throw new Error('Unable to fetch bill data from any source');
      }
    }

    // Apply filters
    let filteredBills = [...bills];
    
    if (topic) {
      filteredBills = filteredBills.filter(bill => 
        bill.subjects.some(s => s.toLowerCase().includes(topic.toLowerCase()))
      );
    }
    
    if (status) {
      filteredBills = filteredBills.filter(bill => 
        bill.status.stage === status
      );
    }
    
    // Create response with caching headers
    const response = NextResponse.json(filteredBills);
    
    // Cache for 5 minutes on CDN and 1 minute in browser
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600, max-age=60');
    response.headers.set('CDN-Cache-Control', 'max-age=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'max-age=300');
    
    // Add ETag for conditional requests
    const etag = `"${Buffer.from(JSON.stringify(filteredBills)).toString('base64').substring(0, 27)}"`;
    response.headers.set('ETag', etag);
    
    // Check if client has valid cached version
    const clientEtag = request.headers.get('If-None-Match');
    if (clientEtag === etag) {
      return new NextResponse(null, { status: 304 });
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}