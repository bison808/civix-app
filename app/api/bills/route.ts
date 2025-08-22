import { NextRequest, NextResponse } from 'next/server';
import { mockBills } from '@/services/mockData';
import { congressService } from '@/services/congressService';

export async function GET(request: NextRequest) {
  try {
    // Try to get real bills from Congress API
    let bills = [];
    
    try {
      bills = await congressService.getRecentBills();
    } catch (error) {
      console.error('Failed to fetch real bills, using mock data:', error);
      bills = mockBills;
    }
    
    // Apply any filters from query params
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const status = searchParams.get('status');
    
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