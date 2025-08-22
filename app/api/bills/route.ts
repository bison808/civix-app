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
    
    return NextResponse.json(filteredBills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}