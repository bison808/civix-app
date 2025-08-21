import { dataPipelineAPI, aiEngineAPI } from './api/client';
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

    const response = await dataPipelineAPI.get<BillsResponse>(
      `/api/bills${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  }

  async getBillById(id: string): Promise<Bill> {
    const response = await dataPipelineAPI.get<Bill>(`/api/bills/${id}`);
    return response.data;
  }

  async getBillByNumber(billNumber: string): Promise<Bill> {
    const response = await dataPipelineAPI.get<Bill>(`/api/bills/number/${billNumber}`);
    return response.data;
  }

  async getSimplifiedBill(billId: string, readingLevel?: string): Promise<SimplifiedBill> {
    const params = readingLevel ? `?readingLevel=${readingLevel}` : '';
    const response = await aiEngineAPI.post<SimplifiedBill>(`/api/ai/simplify-bill/${billId}${params}`);
    return response.data;
  }

  async getBillFullText(billId: string): Promise<string> {
    const response = await dataPipelineAPI.get<{ text: string }>(`/api/bills/${billId}/full-text`);
    return response.data.text;
  }

  async getBillVotes(billId: string): Promise<VoteRecord[]> {
    const response = await dataPipelineAPI.get<VoteRecord[]>(`/api/bills/${billId}/votes`);
    return response.data;
  }

  async getBillImpact(billId: string, zipCode?: string): Promise<BillImpact> {
    const params = zipCode ? `?zipCode=${zipCode}` : '';
    const response = await aiEngineAPI.get<BillImpact>(`/api/ai/bill-impact/${billId}${params}`);
    return response.data;
  }

  async searchBills(query: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get<Bill[]>(`/api/bills/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getTrendingBills(limit: number = 10): Promise<Bill[]> {
    const response = await dataPipelineAPI.get<Bill[]>(`/api/bills/trending?limit=${limit}`);
    return response.data;
  }

  async getRecentBills(limit: number = 10): Promise<Bill[]> {
    const response = await dataPipelineAPI.get<Bill[]>(`/api/bills/recent?limit=${limit}`);
    return response.data;
  }

  async getBillsByCommittee(committeeId: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get<Bill[]>(`/api/committees/${committeeId}/bills`);
    return response.data;
  }

  async getBillsBySponsor(sponsorId: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get<Bill[]>(`/api/representatives/${sponsorId}/sponsored-bills`);
    return response.data;
  }

  async getBillsBySubject(subject: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get<Bill[]>(`/api/bills/subject/${encodeURIComponent(subject)}`);
    return response.data;
  }

  async getRelatedBills(billId: string): Promise<Bill[]> {
    const response = await dataPipelineAPI.get<Bill[]>(`/api/bills/${billId}/related`);
    return response.data;
  }

  async getBillAmendments(billId: string): Promise<any[]> {
    const response = await dataPipelineAPI.get<any[]>(`/api/bills/${billId}/amendments`);
    return response.data;
  }

  async subscribeToBill(billId: string): Promise<{ message: string }> {
    const response = await dataPipelineAPI.post<{ message: string }>(`/api/bills/${billId}/subscribe`);
    return response.data;
  }

  async unsubscribeFromBill(billId: string): Promise<{ message: string }> {
    const response = await dataPipelineAPI.delete<{ message: string }>(`/api/bills/${billId}/subscribe`);
    return response.data;
  }

  async getPersonalizedBills(zipCode: string, interests?: string[]): Promise<Bill[]> {
    const params = new URLSearchParams();
    params.append('zipCode', zipCode);
    if (interests && interests.length > 0) {
      params.append('interests', interests.join(','));
    }
    
    const response = await aiEngineAPI.get<Bill[]>(`/api/ai/personalized-bills?${params.toString()}`);
    return response.data;
  }

  async compareBills(billIds: string[]): Promise<any> {
    const response = await dataPipelineAPI.post<any>('/api/bills/compare', { billIds });
    return response.data;
  }
}

export const billsService = new BillsService();
export default billsService;