import { NextResponse } from 'next/server';
import { congressService } from '@/services/congressService';

export async function GET() {
  try {
    console.log('Testing Congress API integration...');
    
    // Test fetching recent bills
    const bills = await congressService.getRecentBills(true);
    
    return NextResponse.json({
      success: true,
      message: 'Congress API integration test',
      stats: {
        totalBills: bills.length,
        source: bills.length > 3 ? 'Congress API (Live Data)' : 'Fallback Data',
        sampleBills: bills.slice(0, 3).map(bill => ({
          id: bill.id,
          number: bill.billNumber,
          title: bill.title,
          sponsor: bill.sponsor.name,
          status: bill.status.stage,
          introducedDate: bill.introducedDate,
          hasAISummary: !!bill.aiSummary,
          subjects: bill.subjects
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}