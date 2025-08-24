import { dataPipelineAPI, aiEngineAPI } from './api/client';
import { enhancedBillTrackingService } from './enhancedBillTracking.service';
import { congressApi } from './congressApi';
import { californiaLegislativeApi } from './californiaLegislativeApi';
import {
  Bill,
  BillFilter,
  BillsResponse,
  SimplifiedBill,
  VoteRecord,
  BillImpact,
} from '../types/bills.types';

class BillsService {
  async getBills(filter?: BillFilter): Promise<BillsResponse> {
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.status) params.append('status', filter.status);
      if (filter.chamber && filter.chamber !== 'All') params.append('chamber', filter.chamber);
      if (filter.sponsor) params.append('sponsor', filter.sponsor);
      if (filter.committee) params.append('committee', filter.committee);
      if (filter.subject) params.append('subject', filter.subject);
      if (filter.searchTerm) params.append('search', filter.searchTerm);
      if (filter.sortBy) params.append('sort', filter.sortBy);
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.dateRange) {
        params.append('startDate', filter.dateRange.start);
        params.append('endDate', filter.dateRange.end);
      }
    }

    const response = await dataPipelineAPI.get(
      `/api/bills${params.toString() ? `?${params.toString()}` : ''}`
    );
    return await response.json() as BillsResponse;
  }

  async getBillById(id: string): Promise<Bill> {
    const response = await dataPipelineAPI.get(`/api/bills/${id}`);
    return await response.json() as Bill;
  }

  async getBillByNumber(billNumber: string): Promise<Bill> {
    const response = await dataPipelineAPI.get(`/api/bills/number/${billNumber}`);
    return await response.json() as Bill;
  }

  async getSimplifiedBill(billId: string, readingLevel?: string): Promise<SimplifiedBill> {
    const params = readingLevel ? `?readingLevel=${readingLevel}` : '';
    const response = await aiEngineAPI.post(`/api/ai/simplify-bill/${billId}${params}`);
    return await response.json() as SimplifiedBill;
  }

  async getBillFullText(billId: string): Promise<string> {
    const response = await dataPipelineAPI.get(`/api/bills/${billId}/full-text`);
    const data = await response.json() as { text: string };
    return data.text;
  }

  async getBillVotes(billId: string): Promise<VoteRecord[]> {
    const response = await dataPipelineAPI.get(`/api/bills/${billId}/votes`);
    return await response.json() as VoteRecord[];
  }

  async getBillImpact(billId: string, zipCode?: string): Promise<BillImpact> {
    const params = zipCode ? `?zipCode=${zipCode}` : '';
    const response = await aiEngineAPI.get(`/api/ai/bill-impact/${billId}${params}`);
    return await response.json() as BillImpact;
  }

  async searchBills(query: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get(`/api/bills/search?q=${encodeURIComponent(query)}`);
    return await response.json() as Bill[];
  }

  async getTrendingBills(limit: number = 10): Promise<Bill[]> {
    const response = await dataPipelineAPI.get(`/api/bills/trending?limit=${limit}`);
    return await response.json() as Bill[];
  }

  async getRecentBills(limit: number = 10): Promise<Bill[]> {
    const response = await dataPipelineAPI.get(`/api/bills/recent?limit=${limit}`);
    return await response.json() as Bill[];
  }

  async getBillsByCommittee(committeeId: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get(`/api/committees/${committeeId}/bills`);
    return await response.json() as Bill[];
  }

  async getBillsBySponsor(sponsorId: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get(`/api/representatives/${sponsorId}/sponsored-bills`);
    return await response.json() as Bill[];
  }

  async getBillsBySubject(subject: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get(`/api/bills/subject/${encodeURIComponent(subject)}`);
    return await response.json() as Bill[];
  }

  async getRelatedBills(billId: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get(`/api/bills/${billId}/related`);
    return await response.json() as Bill[];
  }

  async getBillAmendments(billId: string): Promise<any[]> {
    const response = await dataPipelineAPI.get(`/api/bills/${billId}/amendments`);
    return await response.json() as any[];
  }

  async subscribeToBill(billId: string): Promise<{ message: string }> {
    const response = await dataPipelineAPI.post(`/api/bills/${billId}/subscribe`);
    return await response.json() as { message: string };
  }

  async unsubscribeFromBill(billId: string): Promise<{ message: string }> {
    const response = await dataPipelineAPI.delete(`/api/bills/${billId}/subscribe`);
    return await response.json() as { message: string };
  }

  async getPersonalizedBillsLegacy(zipCode: string, interests?: string[]): Promise<Bill[]> {
    const params = new URLSearchParams();
    params.append('zipCode', zipCode);
    if (interests && interests.length > 0) {
      params.append('interests', interests.join(','));
    }
    
    const response = await aiEngineAPI.get(`/api/ai/personalized-bills?${params.toString()}`);
    return await response.json() as Bill[];
  }

  async compareBills(billIds: string[]): Promise<any> {
    const response = await dataPipelineAPI.post('/api/bills/compare', { billIds });
    return await response.json();
  }

  // Enhanced bill tracking methods
  
  async getBillsByRepresentative(
    representativeId: string,
    includeTypes?: Array<'sponsored' | 'cosponsored' | 'committee' | 'votes'>
  ) {
    return await enhancedBillTrackingService.getBillsByRepresentative(representativeId, includeTypes);
  }

  async getBillsFromUserRepresentatives(zipCode: string): Promise<Bill[]> {
    return await enhancedBillTrackingService.getBillsFromUserRepresentatives(zipCode);
  }

  async trackBillProgress(billId: string) {
    return await enhancedBillTrackingService.trackBillProgress(billId);
  }

  async getPersonalizedBills(zipCode: string, preferences?: any): Promise<Bill[]> {
    return await enhancedBillTrackingService.getPersonalizedBills(zipCode, preferences);
  }

  // Direct API access methods
  
  async getRecentFederalBills(limit?: number, offset?: number): Promise<Bill[]> {
    return await congressApi.fetchRecentBills(limit, offset);
  }

  async getRecentCaliforniaBills(limit?: number, offset?: number): Promise<Bill[]> {
    return await californiaLegislativeApi.fetchRecentBills(limit, offset);
  }

  async searchFederalBills(query: string): Promise<Bill[]> {
    return await congressApi.searchBills(query);
  }

  async searchCaliforniaBills(query: string): Promise<Bill[]> {
    return await californiaLegislativeApi.searchBills(query);
  }

  async getFederalBillById(billId: string): Promise<Bill | null> {
    return await congressApi.getBillById(billId);
  }

  async getCaliforniaBillById(billId: string): Promise<Bill | null> {
    return await californiaLegislativeApi.getBillById(billId);
  }

  // Clear caches
  async clearAllCaches(): Promise<void> {
    enhancedBillTrackingService.clearCache();
    congressApi.clearCache();
    californiaLegislativeApi.clearCache();
  }
}

export const billsService = new BillsService();
export default billsService;