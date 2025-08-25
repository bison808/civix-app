import { Bill } from '@/types';
import { legiScanApiClient } from './legiScanApiClient';

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for state bills
const CACHE_KEY_PREFIX = 'ca_leg_api_';

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface CaliforniaBillResponse {
  bill_id: string;
  bill_number: string;
  session_year: string;
  measure_type: string;
  title: string;
  summary?: string;
  status: string;
  last_action_date: string;
  last_action: string;
  introduced_date: string;
  authors: Array<{
    name: string;
    party: string;
    district: string;
    house: string;
  }>;
  co_authors?: Array<{
    name: string;
    party: string;
    district: string;
    house: string;
  }>;
  committees?: Array<{
    name: string;
    location: string;
  }>;
  subjects?: string[];
  urgency?: boolean;
  fiscal_impact?: boolean;
}

interface CaliforniaBillListResponse {
  bills: CaliforniaBillResponse[];
  total: number;
  page: number;
  per_page: number;
}

class CaliforniaLegislativeApiService {
  private baseUrl: string;
  private cache: Map<string, CachedData<any>> = new Map();

  constructor() {
    // California Legislative Information API
    this.baseUrl = process.env.NEXT_PUBLIC_CA_LEGISLATIVE_API_URL || 'https://api.leginfo.ca.gov';
  }

  // Cache management
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Session storage for client-side caching
  private getSessionCached<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = sessionStorage.getItem(CACHE_KEY_PREFIX + key);
      if (!cached) return null;
      
      const parsed: CachedData<T> = JSON.parse(cached);
      const now = Date.now();
      
      if (now - parsed.timestamp > CACHE_DURATION) {
        sessionStorage.removeItem(CACHE_KEY_PREFIX + key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('CA Legislature cache read error:', error);
      return null;
    }
  }

  private setSessionCached<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cached));
    } catch (error: any) {
      if (error && error.name === 'QuotaExceededError') {
        console.warn('CA Legislature session storage quota exceeded, cleaning up...');
        this.cleanupExpiredCache();
      } else {
        console.error('CA Legislature cache write error:', error);
      }
    }
  }

  // Clean up expired cache entries
  private cleanupExpiredCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          try {
            const value = sessionStorage.getItem(key);
            if (value) {
              const parsed: CachedData<any> = JSON.parse(value);
              if (now - parsed.timestamp > CACHE_DURATION) {
                keysToRemove.push(key);
              }
            }
          } catch (parseError) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      console.log(`Cleaned up ${keysToRemove.length} expired CA Legislature cache entries`);
    } catch (error) {
      console.error('CA Legislature cache cleanup failed:', error);
    }
  }

  // Fetch recent California bills
  async fetchRecentBills(
    limit: number = 20,
    offset: number = 0,
    sessionYear?: string
  ): Promise<Bill[]> {
    const cacheKey = `ca_bills_${sessionYear || 'current'}_${limit}_${offset}`;
    
    // Check cache first
    try {
      const cached = this.getSessionCached<Bill[]>(cacheKey);
      if (cached) {
        console.log('Returning cached CA bills');
        return cached;
      }
    } catch (cacheError) {
      console.warn('CA Legislature cache retrieval failed:', cacheError);
    }

    try {
      // Current CA session is 2025-2026
      const currentSession = sessionYear || '2025';
      
      // For now, use realistic CA bills data
      const bills = await this.fetchBillsFromAPI(currentSession, limit, offset);
      
      // Cache the results
      try {
        this.setSessionCached(cacheKey, bills);
      } catch (cacheError) {
        console.warn('Failed to cache CA bills:', cacheError);
      }
      
      return bills;
    } catch (error) {
      console.error('Failed to fetch CA bills from Legislative API:', error);
      
      // Fallback to minimal cached data - NO FAKE DATA
      console.log('Using minimal fallback CA legislative data - LegiScan API temporarily unavailable');
      return this.getMinimalFallbackBills();
    }
  }

  private async fetchBillsFromAPI(
    sessionYear: string,
    limit: number,
    offset: number
  ): Promise<Bill[]> {
    // PRODUCTION REAL API INTEGRATION - Agent Mike Implementation
    console.log('[Production] Fetching REAL California bills from LegiScan API (2025 session)');
    console.log('[Production] API Call Parameters:', { limit, offset, sessionYear });
    
    try {
      // Use LegiScan API client for real legislative data
      const realBills = await legiScanApiClient.fetchCaliforniaBills(limit, offset, sessionYear);
      
      if (realBills.length > 0) {
        console.log(`[Production] SUCCESS: Retrieved ${realBills.length} real California bills from LegiScan`);
        console.log('[Production] Sample bills:', realBills.slice(0, 2).map(b => ({ id: b.id, number: b.billNumber, title: b.title.substring(0, 50) + '...' })));
        return realBills;
      } else {
        console.warn('[Production] LegiScan returned no bills - checking if this is expected');
        return [];
      }
    } catch (error) {
      console.error('[Production] LegiScan API FAILED - this should not happen with proper API key:', error);
      if (error instanceof Error) {
        console.error('[Production] Failure reason:', error.message);
      }
      
      // Fallback to minimal cached data only if LegiScan completely fails
      // This prevents serving fake data as primary source
      const fallbackBills = this.getMinimalFallbackBills();
      console.warn(`[Production] FALLBACK: Using ${fallbackBills.length} fallback bills due to API failure`);
      return fallbackBills;
    }
  }

  // Transform CA legislative data to our Bill type
  private transformCaliforniaBillData(apiData: CaliforniaBillResponse): Bill {
    const billId = `ca-${apiData.measure_type}-${apiData.bill_number}-${apiData.session_year}`;
    const billNumber = `${apiData.measure_type.toUpperCase()} ${apiData.bill_number}`;
    
    return {
      id: billId,
      billNumber: billNumber,
      title: apiData.title || 'Untitled California Bill',
      shortTitle: apiData.title,
      summary: apiData.summary || apiData.title,
      status: {
        stage: this.determineCAStage(apiData.status),
        detail: apiData.status,
        date: apiData.last_action_date
      },
      chamber: this.determineCAChamber(apiData.measure_type),
      introducedDate: apiData.introduced_date,
      lastActionDate: apiData.last_action_date,
      lastAction: apiData.last_action,
      sponsor: {
        id: `ca-${apiData.authors[0]?.name.replace(/\s+/g, '_').toLowerCase() || 'unknown'}`,
        name: apiData.authors[0]?.name || 'Unknown Author',
        party: this.mapCAParty(apiData.authors[0]?.party || ''),
        state: 'CA',
        district: apiData.authors[0]?.district
      },
      cosponsors: apiData.co_authors?.map(coauthor => ({
        id: `ca-${coauthor.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: coauthor.name,
        party: this.mapCAParty(coauthor.party),
        state: 'CA',
        district: coauthor.district
      })) || [],
      committees: apiData.committees?.map(c => c.name) || [],
      subjects: apiData.subjects || [],
      policyArea: apiData.subjects?.[0] || 'General',
      legislativeHistory: [{
        date: apiData.introduced_date,
        action: 'Introduced',
        chamber: this.determineCAChamber(apiData.measure_type),
        actionType: 'introduction'
      }],
      aiSummary: this.generateCABillSummary(apiData)
    };
  }

  private determineCAStage(status: string): Bill['status']['stage'] {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('signed by governor') || statusLower.includes('chaptered')) return 'Law';
    if (statusLower.includes('vetoed')) return 'Vetoed';
    if (statusLower.includes('failed')) return 'Failed';
    if (statusLower.includes('passed assembly') && statusLower.includes('passed senate')) return 'Conference';
    if (statusLower.includes('passed senate')) return 'Senate';
    if (statusLower.includes('passed assembly')) return 'House';
    if (statusLower.includes('committee')) return 'Committee';
    if (statusLower.includes('introduced')) return 'Introduced';
    
    return 'Committee';
  }

  private determineCAChamber(measureType: string): 'House' | 'Senate' {
    const type = measureType.toLowerCase();
    if (type.startsWith('ab') || type.startsWith('acr') || type.startsWith('aca')) {
      return 'House'; // Assembly = House equivalent
    }
    return 'Senate'; // SB, SCR, SCA = Senate
  }

  private mapCAParty(party: string): string {
    switch (party.toLowerCase()) {
      case 'd':
      case 'dem':
      case 'democrat':
        return 'Democrat';
      case 'r':
      case 'rep':
      case 'republican':
        return 'Republican';
      default:
        return party || 'Unknown';
    }
  }

  private generateCABillSummary(apiData: CaliforniaBillResponse): Bill['aiSummary'] {
    return {
      id: `ca-summary-${apiData.bill_id}`,
      billId: `ca-${apiData.measure_type}-${apiData.bill_number}-${apiData.session_year}`,
      title: apiData.title,
      simpleSummary: this.createCASimpleSummary(apiData),
      keyPoints: this.extractCAKeyPoints(apiData),
      pros: ['Addresses important state issue', 'Could benefit Californians', 'Has legislative support'],
      cons: ['Implementation costs', 'Potential unintended effects', 'May face opposition'],
      whoItAffects: this.determineCAffectedGroups(apiData),
      whatItMeans: `This California bill would ${apiData.title?.toLowerCase() || 'address state legislative matters'}`,
      timeline: this.estimateCATimeline(apiData),
      readingLevel: 'middle' as const,
      generatedAt: new Date().toISOString()
    };
  }

  private createCASimpleSummary(apiData: CaliforniaBillResponse): string {
    if (apiData.summary) {
      const summary = apiData.summary
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (summary.length > 300) {
        return summary.substring(0, 297) + '...';
      }
      return summary;
    }
    
    return `This California bill ${apiData.title?.toLowerCase() || 'addresses important state matters'}.`;
  }

  private extractCAKeyPoints(apiData: CaliforniaBillResponse): string[] {
    const points: string[] = [];
    
    if (apiData.title) {
      points.push(`California legislation: ${apiData.title}`);
    }
    
    if (apiData.last_action) {
      points.push(`Status: ${apiData.last_action}`);
    }
    
    if (apiData.subjects && apiData.subjects.length > 0) {
      points.push(`Topics: ${apiData.subjects.slice(0, 3).join(', ')}`);
    }
    
    if (apiData.urgency) {
      points.push('Urgency legislation - takes effect immediately');
    }
    
    if (apiData.fiscal_impact) {
      points.push('Has fiscal impact on state budget');
    }
    
    return points.length > 0 ? points : ['California legislative proposal under consideration'];
  }

  private determineCAffectedGroups(apiData: CaliforniaBillResponse): string[] {
    const groups: string[] = ['California residents'];
    
    if (apiData.subjects) {
      apiData.subjects.forEach(subject => {
        const subjectLower = subject.toLowerCase();
        
        if (subjectLower.includes('education')) groups.push('Students and educators');
        if (subjectLower.includes('health')) groups.push('Healthcare patients and providers');
        if (subjectLower.includes('business')) groups.push('Business owners');
        if (subjectLower.includes('environment')) groups.push('Environmental advocates');
        if (subjectLower.includes('housing')) groups.push('Renters and homeowners');
        if (subjectLower.includes('transport')) groups.push('Commuters and drivers');
      });
    }
    
    return Array.from(new Set(groups));
  }

  private estimateCATimeline(apiData: CaliforniaBillResponse): string {
    const stage = this.determineCAStage(apiData.status);
    
    switch (stage) {
      case 'Law':
        return 'Already signed into California law';
      case 'Vetoed':
        return 'Vetoed by the Governor';
      case 'Conference':
        return 'In conference committee';
      case 'Senate':
      case 'House':
        return 'Under consideration in California Legislature';
      case 'Committee':
        return 'In committee review';
      default:
        return 'Recently introduced in California Legislature';
    }
  }

  // REPLACED: Fake data eliminated - Agent Mike
  // Development-safe California bills for demo/testing when API key not available
  private getMinimalFallbackBills(): Bill[] {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Check if we have an API key - if not, show demo data with clear labeling
    const hasApiKey = !!(process.env.LEGISCAN_API_KEY || process.env.NEXT_PUBLIC_LEGISCAN_API_KEY);
    
    if (!hasApiKey) {
      // Development-safe demo data - clearly labeled as demo
      return this.getDemoCaliforniaBills();
    }
    
    // If we have API key but still failed, show API unavailable message
    const fallbackBills: Bill[] = [
      {
        id: 'ca-api-unavailable',
        billNumber: 'API Notice',
        title: 'LegiScan API Temporarily Unavailable',
        summary: 'California legislative data is temporarily unavailable. Please try again in a few minutes.',
        status: {
          stage: 'Committee',
          detail: 'API service temporarily unavailable',
          date: currentDate
        },
        chamber: 'House',
        introducedDate: currentDate,
        lastActionDate: currentDate,
        lastAction: 'Checking API availability...',
        sponsor: {
          id: 'system',
          name: 'CITZN System',
          party: 'System',
          state: 'CA'
        },
        cosponsors: [],
        committees: [],
        subjects: ['System Notice'],
        policyArea: 'System',
        legislativeHistory: [],
        aiSummary: {
          id: 'system-notice',
          billId: 'ca-api-unavailable',
          title: 'Service Temporarily Unavailable',
          simpleSummary: 'Real California legislative data is temporarily unavailable due to API maintenance.',
          keyPoints: [
            'LegiScan API is temporarily down',
            'Real California bills will load when service is restored',
            'No fake data is being displayed'
          ],
          pros: ['Transparent about data availability'],
          cons: ['Temporary service interruption'],
          whoItAffects: ['Platform users'],
          whatItMeans: 'The platform only shows real legislative data - no fake information.',
          timeline: 'Service restoration in progress',
          readingLevel: 'middle',
          generatedAt: currentDate
        }
      }
    ];

    return fallbackBills;
  }

  // Development-safe demo California bills - clearly labeled as demo data
  private getDemoCaliforniaBills(): Bill[] {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const demoBills: Bill[] = [
      {
        id: 'ca-demo-ab-1-2025',
        billNumber: 'AB 1 (DEMO)',
        title: '[DEMO] California Housing Affordability Act',
        summary: 'DEMO DATA: Real bill tracking will be available when LegiScan API key is configured. This demonstrates the platform\'s capability to display real California legislative data.',
        status: {
          stage: 'Committee',
          detail: 'Demo: In Assembly Housing Committee',
          date: currentDate
        },
        chamber: 'House',
        introducedDate: '2024-12-02',
        lastActionDate: currentDate,
        lastAction: 'Demo: Referred to Assembly Housing Committee',
        sponsor: {
          id: 'ca-demo-sponsor',
          name: '[DEMO] Assembly Member',
          party: 'Democrat',
          state: 'CA',
          district: '15'
        },
        cosponsors: [],
        committees: ['Assembly Housing and Community Development'],
        subjects: ['Housing', 'Demo Data'],
        policyArea: 'Housing',
        legislativeHistory: [{
          date: '2024-12-02',
          action: 'Demo: Introduced in Assembly',
          chamber: 'House',
          actionType: 'introduction'
        }],
        aiSummary: {
          id: 'ca-demo-summary-ab-1',
          billId: 'ca-demo-ab-1-2025',
          title: '[DEMO] California Housing Affordability Act',
          simpleSummary: 'DEMO DATA: This shows how real California bills will be displayed. Configure LegiScan API key to see actual legislative data.',
          keyPoints: [
            'This is demonstration data only',
            'Real California bills will show when LegiScan API key is configured',
            'Platform is ready for real legislative data',
            'Demo shows data structure and display format'
          ],
          pros: [
            'Demonstrates platform capabilities',
            'Shows real data format',
            'Ready for production deployment'
          ],
          cons: [
            'Demo data only',
            'Requires API key for real data',
            'Limited to demonstration purposes'
          ],
          whoItAffects: ['Demo users', 'Platform developers', 'Future California residents'],
          whatItMeans: 'This demonstrates how real California legislative data will appear once API access is configured.',
          timeline: 'Demo: Configure LegiScan API key to access real California legislative data',
          readingLevel: 'middle',
          generatedAt: currentDate
        }
      },
      {
        id: 'ca-demo-sb-2-2025',
        billNumber: 'SB 2 (DEMO)',
        title: '[DEMO] California Climate Action Plan',
        summary: 'DEMO DATA: Shows how California Senate bills will be displayed. Real legislative data will replace this when LegiScan API key is configured.',
        status: {
          stage: 'Committee',
          detail: 'Demo: In Senate Environmental Quality Committee',
          date: currentDate
        },
        chamber: 'Senate',
        introducedDate: '2024-12-09',
        lastActionDate: currentDate,
        lastAction: 'Demo: Referred to Senate Environmental Quality Committee',
        sponsor: {
          id: 'ca-demo-senator',
          name: '[DEMO] State Senator',
          party: 'Democrat',
          state: 'CA',
          district: '11'
        },
        cosponsors: [],
        committees: ['Senate Environmental Quality'],
        subjects: ['Climate Change', 'Demo Data'],
        policyArea: 'Environment',
        legislativeHistory: [{
          date: '2024-12-09',
          action: 'Demo: Introduced in Senate',
          chamber: 'Senate',
          actionType: 'introduction'
        }],
        aiSummary: {
          id: 'ca-demo-summary-sb-2',
          billId: 'ca-demo-sb-2-2025',
          title: '[DEMO] California Climate Action Plan',
          simpleSummary: 'DEMO DATA: Represents how real California Senate environmental bills will be displayed with full details.',
          keyPoints: [
            'Demonstration of Senate bill format',
            'Shows environmental policy area display',
            'Demonstrates AI summary capabilities',
            'Ready for real LegiScan API integration'
          ],
          pros: [
            'Shows complete data structure',
            'Demonstrates policy categorization',
            'Ready for production data'
          ],
          cons: [
            'Demo data only',
            'Awaiting API key configuration',
            'Not real legislative content'
          ],
          whoItAffects: ['Demo users', 'Environmental advocates', 'Platform testers'],
          whatItMeans: 'Shows how real California environmental legislation will be displayed and analyzed.',
          timeline: 'Demo: Production ready - awaiting LegiScan API key',
          readingLevel: 'middle',
          generatedAt: currentDate
        }
      }
    ];

    return demoBills;
  }

  // Search California bills - Agent Mike Implementation
  async searchBills(query: string): Promise<Bill[]> {
    try {
      // Use LegiScan API client for real search
      return await legiScanApiClient.searchBills(query);
    } catch (error) {
      console.error('LegiScan search failed:', error);
      // Fallback to local search on cached bills
      const bills = await this.fetchRecentBills();
      
      const searchTerm = query.toLowerCase();
      return bills.filter(bill => 
        bill.title.toLowerCase().includes(searchTerm) ||
        bill.summary.toLowerCase().includes(searchTerm) ||
        bill.billNumber.toLowerCase().includes(searchTerm) ||
        bill.subjects.some(s => s.toLowerCase().includes(searchTerm))
      );
    }
  }

  // Get CA bill by ID - Agent Mike Implementation
  async getBillById(billId: string): Promise<Bill | null> {
    try {
      // Try LegiScan API first for detailed bill information
      if (billId.includes('legiscan')) {
        const legiScanId = billId.replace('ca-legiscan-', '');
        return await legiScanApiClient.getBillDetails(legiScanId);
      }
      
      // Fallback to cached bills search
      const bills = await this.fetchRecentBills();
      return bills.find(b => b.id === billId) || null;
    } catch (error) {
      console.error('Failed to get bill details:', error);
      return null;
    }
  }

  // Clear cache
  public clearCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      console.log(`Cleared ${keysToRemove.length} CA Legislature cache entries`);
    } catch (error) {
      console.error('CA Legislature cache clear failed:', error);
    }
  }
}

export const californiaLegislativeApi = new CaliforniaLegislativeApiService();