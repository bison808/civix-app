import { NextRequest, NextResponse } from 'next/server';
import { legiScanApiClient } from '@/services/legiScanApiClient';

/**
 * Agent Alex - Direct LegiScan Integration Test Endpoint
 * Tests the LegiScan API integration chain directly
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('test') || 'bills';
  
  console.log('[ALEX-LEGISCAN-TEST] Direct LegiScan integration test started:', {
    testType,
    timestamp: new Date().toISOString(),
    apiKeyPresent: !!process.env.LEGISCAN_API_KEY,
    apiKeyLength: process.env.LEGISCAN_API_KEY?.length || 0
  });

  try {
    let testResult;
    
    switch (testType) {
      case 'bills':
        console.log('[ALEX-LEGISCAN-TEST] Testing fetchCaliforniaBills...');
        testResult = await legiScanApiClient.fetchCaliforniaBills(3, 0);
        break;
        
      case 'health':
        console.log('[ALEX-LEGISCAN-TEST] Testing API health...');
        testResult = await legiScanApiClient.testConnection();
        break;
        
      case 'key':
        console.log('[ALEX-LEGISCAN-TEST] Testing API key validation...');
        const keyStatus = {
          hasKey: !!process.env.LEGISCAN_API_KEY,
          keyLength: process.env.LEGISCAN_API_KEY?.length || 0,
          keyPrefix: process.env.LEGISCAN_API_KEY?.substring(0, 8) + '...',
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        };
        testResult = keyStatus;
        break;
        
      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    console.log('[ALEX-LEGISCAN-TEST] Test completed successfully:', {
      testType,
      resultType: typeof testResult,
      resultLength: Array.isArray(testResult) ? testResult.length : 'N/A',
      sample: Array.isArray(testResult) ? 
        testResult.slice(0, 2).map(item => typeof item === 'object' ? 
          { id: item.id, billNumber: item.billNumber, title: item.title?.substring(0, 50) } : item
        ) : testResult
    });

    return NextResponse.json({
      success: true,
      testType,
      result: testResult,
      metadata: {
        timestamp: new Date().toISOString(),
        resultCount: Array.isArray(testResult) ? testResult.length : 1,
        apiKeyStatus: !!process.env.LEGISCAN_API_KEY ? 'present' : 'missing'
      }
    });

  } catch (error) {
    const errorDetails = {
      testType,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      apiKeyPresent: !!process.env.LEGISCAN_API_KEY
    };

    console.error('[ALEX-LEGISCAN-TEST] Test failed:', errorDetails);

    return NextResponse.json({
      success: false,
      error: errorDetails
    }, { status: 500 });
  }
}

/**
 * Usage:
 * - /api/legiscan-test?test=bills - Test California bill fetching
 * - /api/legiscan-test?test=health - Test API health check
 * - /api/legiscan-test?test=key - Test API key configuration
 */