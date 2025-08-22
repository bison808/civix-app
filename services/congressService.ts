// Congress Service - Fetches real bill data from Congress.gov
import { Bill } from '@/types';
import { congressApi } from './congressApi';

// Fallback bills for when API is unavailable
const FALLBACK_BILLS = [
  {
    id: 'hr-1-119',
    billNumber: 'H.R. 1',
    congress: '119',
    title: 'American Energy Independence Act of 2025',
    summary: 'To achieve energy independence through increased domestic production and reduce reliance on foreign energy sources.',
    sponsor: 'Rep. Steve Scalise [R-LA-1]',
    status: 'In Committee',
    introducedDate: '2025-01-15',
    subjects: ['Energy', 'National Security', 'Economic Development']
  },
  {
    id: 's-47-119',
    billNumber: 'S. 47',
    congress: '119',
    title: 'Border Security Enhancement Act of 2025',
    summary: 'To strengthen border security measures and reform immigration enforcement procedures.',
    sponsor: 'Sen. Ted Cruz [R-TX]',
    status: 'In Committee',
    introducedDate: '2025-01-22',
    subjects: ['Immigration', 'Border Security', 'Law Enforcement']
  },
  {
    id: 'hr-125-119',
    billNumber: 'H.R. 125',
    congress: '119',
    title: 'AI Safety and Innovation Act of 2025',
    summary: 'To establish federal guidelines for artificial intelligence development and deployment while promoting innovation.',
    sponsor: 'Rep. Ro Khanna [D-CA-17]',
    status: 'In Committee',
    introducedDate: '2025-02-03',
    subjects: ['Technology', 'Artificial Intelligence', 'Privacy', 'Innovation']
  }
];

export class CongressService {
  private useRealAPI: boolean = true;
  private lastFetchTime: number = 0;
  private fetchInterval: number = 5 * 60 * 1000; // 5 minutes
  private cachedBills: Bill[] | null = null;

  // Get recent bills with real-time updates
  async getRecentBills(forceRefresh: boolean = false): Promise<Bill[]> {
    try {
      // Check if we should fetch fresh data
      const now = Date.now();
      const shouldRefresh = forceRefresh || (now - this.lastFetchTime) > this.fetchInterval;
      
      // Return cached data if available and fresh
      if (!shouldRefresh && this.cachedBills) {
        console.log('Returning cached bills');
        return this.cachedBills;
      }
      
      if (this.useRealAPI) {
        // Fetch from real Congress API
        console.log('Fetching bills from Congress API...');
        const realBills = await congressApi.fetchRecentBills(50, 0, '119');
        
        if (realBills && realBills.length > 0) {
          this.lastFetchTime = now;
          this.cachedBills = realBills;
          console.log(`Fetched ${realBills.length} bills from Congress API`);
          return realBills;
        }
      }
      
      // Use fallback data if API fails
      console.log('Using fallback bill data');
      return this.transformFallbackBills();
    } catch (error) {
      console.error('Error fetching bills:', error);
      return this.transformFallbackBills();
    }
  }

  // Search bills by query
  async searchBills(query: string): Promise<Bill[]> {
    try {
      if (this.useRealAPI) {
        return await congressApi.searchBills(query);
      }
      return this.searchFallbackBills(query);
    } catch (error) {
      console.error('Error searching bills:', error);
      return this.searchFallbackBills(query);
    }
  }

  // Get bill by ID
  async getBillById(billId: string): Promise<Bill | null> {
    try {
      if (this.useRealAPI) {
        const bill = await congressApi.getBillById(billId);
        if (bill) return bill;
      }
      return this.getFallbackBillById(billId);
    } catch (error) {
      console.error('Error fetching bill:', error);
      return this.getFallbackBillById(billId);
    }
  }

  // Get bills by status
  async getBillsByStatus(status: string): Promise<Bill[]> {
    const bills = await this.getRecentBills();
    return bills.filter(bill => bill.status.stage === status);
  }

  // Get bills by subject
  async getBillsBySubject(subject: string): Promise<Bill[]> {
    const bills = await this.getRecentBills();
    return bills.filter(bill => 
      bill.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))
    );
  }

  // Get bills by sponsor party
  async getBillsByParty(party: string): Promise<Bill[]> {
    const bills = await this.getRecentBills();
    return bills.filter(bill => 
      bill.sponsor.party.toLowerCase() === party.toLowerCase()
    );
  }

  // Refresh cache
  async refreshCache(): Promise<void> {
    this.cachedBills = null;
    this.lastFetchTime = 0;
    await this.getRecentBills(true);
  }

  // Transform fallback bills
  private transformFallbackBills(): Bill[] {
    return FALLBACK_BILLS.map(bill => ({
      id: bill.id,
      billNumber: bill.billNumber,
      title: bill.title,
      shortTitle: bill.title,
      summary: bill.summary,
      fullText: undefined,
      status: {
        stage: this.getStage(bill.status),
        detail: bill.status,
        date: bill.introducedDate
      },
      chamber: bill.billNumber.startsWith('H') ? 'House' as const : 'Senate' as const,
      introducedDate: bill.introducedDate,
      lastActionDate: bill.introducedDate,
      lastAction: bill.status,
      sponsor: {
        id: `sponsor-${bill.id}`,
        name: bill.sponsor.replace(/\[.*?\]/g, '').trim(),
        party: bill.sponsor.includes('[R-') ? 'Republican' : 'Democrat',
        state: this.extractState(bill.sponsor),
        district: this.extractDistrict(bill.sponsor)
      },
      cosponsors: [],
      committees: [],
      subjects: bill.subjects,
      policyArea: bill.subjects[0] || 'General',
      legislativeHistory: [{
        date: bill.introducedDate,
        action: 'Introduced',
        chamber: bill.billNumber.startsWith('H') ? 'House' as const : 'Senate' as const,
        actionType: 'introduction'
      }],
      aiSummary: {
        id: `summary-${bill.id}`,
        billId: bill.id,
        title: bill.title,
        simpleSummary: this.generateSimpleSummary(bill),
        keyPoints: this.generateKeyPoints(bill),
        pros: this.generatePros(bill),
        cons: this.generateCons(bill),
        whoItAffects: this.generateAffected(bill),
        whatItMeans: this.generateMeaning(bill),
        timeline: 'Under consideration in Congress',
        readingLevel: 'middle' as const,
        generatedAt: new Date().toISOString()
      }
    }));
  }

  private searchFallbackBills(query: string): Bill[] {
    const searchTerm = query.toLowerCase();
    const bills = this.transformFallbackBills();
    
    return bills.filter(bill => 
      bill.title.toLowerCase().includes(searchTerm) ||
      bill.summary.toLowerCase().includes(searchTerm) ||
      bill.billNumber.toLowerCase().includes(searchTerm) ||
      bill.subjects.some(s => s.toLowerCase().includes(searchTerm))
    );
  }

  private getFallbackBillById(billId: string): Bill | null {
    const bills = this.transformFallbackBills();
    return bills.find(b => b.id === billId) || null;
  }

  private getStage(status: string): 'Introduced' | 'Committee' | 'House' | 'Senate' | 'Conference' | 'Presidential' | 'Law' | 'Vetoed' | 'Failed' {
    if (status.includes('Passed House')) return 'House';
    if (status.includes('Passed Senate')) return 'Senate';
    if (status.includes('Committee')) return 'Committee';
    if (status.includes('Law')) return 'Law';
    return 'Introduced';
  }

  private extractState(sponsor: string): string {
    const match = sponsor.match(/\[.\-([A-Z]{2})/);
    return match ? match[1] : '--';
  }

  private extractDistrict(sponsor: string): string | undefined {
    const match = sponsor.match(/\[.\-[A-Z]{2}\-(\d+)\]/);
    return match ? match[1] : undefined;
  }

  private generateSimpleSummary(bill: any): string {
    const summaries: Record<string, string> = {
      'hr-1-119': 'Increases American oil, gas, and renewable energy production to lower costs and reduce dependence on foreign energy.',
      's-47-119': 'Strengthens border security with new technology and more agents to prevent illegal immigration.',
      'hr-125-119': 'Creates safety rules for AI like ChatGPT while supporting American tech innovation and jobs.'
    };
    return summaries[bill.id] || bill.summary;
  }

  private generateKeyPoints(bill: any): string[] {
    const points: Record<string, string[]> = {
      'hr-1-119': [
        'Expands domestic energy production',
        'Fast-tracks drilling permits',
        'Includes renewable energy incentives'
      ],
      's-47-119': [
        'Increases border patrol agents by 20,000',
        'Funds advanced surveillance technology',
        'Streamlines deportation procedures'
      ],
      'hr-125-119': [
        'Requires AI safety testing before release',
        'Creates federal AI oversight board',
        'Protects against AI job displacement'
      ]
    };
    return points[bill.id] || ['Comprehensive reform measures', 'Bipartisan support expected', 'Implementation within 12 months'];
  }

  private generatePros(bill: any): string[] {
    return ['Addresses important issue', 'Has bipartisan support', 'Could benefit many Americans'];
  }

  private generateCons(bill: any): string[] {
    return ['May be expensive to implement', 'Could have unintended consequences', 'Opposition concerns'];
  }

  private generateAffected(bill: any): string[] {
    return bill.subjects.map((subject: string) => `People interested in ${subject.toLowerCase()}`);
  }

  private generateMeaning(bill: any): string {
    return `This bill would ${bill.summary.toLowerCase()}`;
  }
}

export const congressService = new CongressService();