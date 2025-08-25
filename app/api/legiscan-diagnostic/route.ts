import { NextRequest, NextResponse } from 'next/server';
import { legiScanApiClient } from '@/services/legiScanApiClient';

// GET /api/legiscan-diagnostic
export async function GET(request: NextRequest) {
  console.log('[API] LegiScan diagnostic requested');
  
  try {
    const diagnosticResults = await legiScanApiClient.runProductionDiagnostic();
    
    console.log('[API] Diagnostic completed:', diagnosticResults);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercelEnvironment: process.env.VERCEL_ENV,
      ...diagnosticResults
    });

  } catch (error) {
    console.error('[API] Diagnostic failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown diagnostic error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercelEnvironment: process.env.VERCEL_ENV,
      apiKeyStatus: 'unknown',
      sessionStatus: 'unknown',
      billsStatus: 'unknown',
      apiUsageWorking: false
    }, { status: 500 });
  }
}