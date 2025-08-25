import { NextRequest, NextResponse } from 'next/server';

/**
 * Agent Alex - Deep LegiScan API Debug Endpoint
 * Exposes the exact API call to LegiScan to see what's failing
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  console.log('[ALEX-LEGISCAN-DEBUG] Deep LegiScan debug started:', {
    timestamp: new Date().toISOString(),
    apiKeyPresent: !!process.env.LEGISCAN_API_KEY,
    apiKeyLength: process.env.LEGISCAN_API_KEY?.length || 0
  });

  try {
    // Import the client dynamically to get fresh instance
    const { legiScanApiClient } = await import('@/services/legiScanApiClient');
    
    // Get the API key used by the client
    const apiKey = process.env.LEGISCAN_API_KEY || process.env.NEXT_PUBLIC_LEGISCAN_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'No API key found',
        environment: process.env.NODE_ENV,
        checked: ['LEGISCAN_API_KEY', 'NEXT_PUBLIC_LEGISCAN_API_KEY']
      }, { status: 400 });
    }

    console.log('[ALEX-LEGISCAN-DEBUG] Making direct LegiScan API call...');
    
    // Try different endpoint variations and HTTP methods
    const testRequests = [
      // GET requests
      { 
        url: `https://api.legiscan.com/?op=getMasterListByState&id=CA&api_key=${apiKey}`,
        method: 'GET'
      },
      {
        url: `https://api.legiscan.com/?op=getStateList&api_key=${apiKey}`,
        method: 'GET'
      },
      // POST requests with form data
      {
        url: 'https://api.legiscan.com/',
        method: 'POST',
        body: new URLSearchParams({
          op: 'getMasterListByState',
          id: 'CA',
          api_key: apiKey
        }).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      },
      {
        url: 'https://api.legiscan.com/',
        method: 'POST',
        body: new URLSearchParams({
          op: 'getStateList',
          api_key: apiKey
        }).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      },
      // JSON POST requests
      {
        url: 'https://api.legiscan.com/',
        method: 'POST',
        body: JSON.stringify({
          op: 'getMasterListByState',
          id: 'CA',
          api_key: apiKey
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    ];
    
    console.log('[ALEX-LEGISCAN-DEBUG] Will try', testRequests.length, 'different requests...');
    
    // Try multiple header combinations to bypass Cloudflare
    const baseHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/html, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache'
    };

    let response;
    let requestUsed = 0;
    
    // Try each request configuration
    for (let i = 0; i < testRequests.length; i++) {
      const testRequest = testRequests[i];
      console.log(`[ALEX-LEGISCAN-DEBUG] Trying request ${i + 1}:`, testRequest.method, testRequest.url.replace(apiKey, '***'));
      
      try {
        const headers = { ...baseHeaders, ...(testRequest.headers || {}) };
        
        response = await fetch(testRequest.url, {
          method: testRequest.method,
          headers,
          body: testRequest.body
        });
        
        const responseText = await response.text();
        
        // Check if it's JSON (API response) vs HTML (webpage)
        const isJson = responseText.trim().startsWith('{') || responseText.trim().startsWith('[');
        
        if (response.ok && isJson) {
          console.log(`[ALEX-LEGISCAN-DEBUG] SUCCESS! Request ${i + 1} returned JSON!`);
          requestUsed = i;
          // Put the response text back for processing
          response = { 
            ...response, 
            text: () => Promise.resolve(responseText),
            responseText 
          };
          break;
        } else if (response.ok) {
          console.log(`[ALEX-LEGISCAN-DEBUG] Request ${i + 1} returned HTML (${responseText.length} chars)`);
        } else {
          console.log(`[ALEX-LEGISCAN-DEBUG] Request ${i + 1} failed with status:`, response.status);
        }
      } catch (error) {
        console.log(`[ALEX-LEGISCAN-DEBUG] Request ${i + 1} failed:`, error.message);
      }
    }
    
    if (!response || !response.responseText) {
      throw new Error('All request configurations failed to return JSON');
    }

    const responseText = response.responseText;
    
    console.log('[ALEX-LEGISCAN-DEBUG] Raw response status:', response.status);
    console.log('[ALEX-LEGISCAN-DEBUG] Raw response headers:', Object.fromEntries(response.headers.entries()));
    console.log('[ALEX-LEGISCAN-DEBUG] Raw response length:', responseText.length);
    console.log('[ALEX-LEGISCAN-DEBUG] Raw response preview:', responseText.substring(0, 500));

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('[ALEX-LEGISCAN-DEBUG] Parsed JSON status:', responseData.status);
      
      if (responseData.masterlist) {
        const bills = Object.keys(responseData.masterlist);
        console.log('[ALEX-LEGISCAN-DEBUG] Found bills count:', bills.length);
        console.log('[ALEX-LEGISCAN-DEBUG] First 3 bill IDs:', bills.slice(0, 3));
        
        if (bills.length > 0) {
          const firstBill = responseData.masterlist[bills[0]];
          console.log('[ALEX-LEGISCAN-DEBUG] First bill sample:', {
            bill_id: firstBill?.bill_id,
            bill_number: firstBill?.bill_number,
            title: firstBill?.title?.substring(0, 100)
          });
        }
      }
      
    } catch (parseError) {
      console.error('[ALEX-LEGISCAN-DEBUG] JSON parse failed:', parseError);
      responseData = { error: 'Failed to parse JSON', rawResponse: responseText.substring(0, 1000) };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      apiKeyUsed: `${apiKey.substring(0, 8)}...${apiKey.substring(-4)}`,
      requestUsed: requestUsed,
      workingRequest: {
        method: testRequests[requestUsed].method,
        url: testRequests[requestUsed].url.replace(apiKey, '***'),
        hasBody: !!testRequests[requestUsed].body
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorDetails = {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };

    console.error('[ALEX-LEGISCAN-DEBUG] Debug test failed:', errorDetails);

    return NextResponse.json({
      success: false,
      error: errorDetails
    }, { status: 500 });
  }
}

/**
 * Usage: /api/debug-legiscan - Direct LegiScan API call debug
 */