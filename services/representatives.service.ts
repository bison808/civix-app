import { dataPipelineAPI } from './api/client';
import {
  Representative,
  RepresentativeFilter,
  RepresentativesResponse,
  Scorecard,
} from '../types/representatives.types';

class RepresentativesService {
  async getRepresentativesByZipCode(zipCode: string): Promise<Representative[]> {
    const response = await dataPipelineAPI.get<Representative[]>(`/api/representatives/by-zip/${zipCode}`);
    return response.data;
  }

  async getRepresentativeById(id: string): Promise<Representative> {
    const response = await dataPipelineAPI.get<Representative>(`/api/representatives/${id}`);
    return response.data;
  }

  async getRepresentatives(filter?: RepresentativeFilter): Promise<RepresentativesResponse> {
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.chamber && filter.chamber !== 'All') params.append('chamber', filter.chamber);
      if (filter.party) params.append('party', filter.party);
      if (filter.state) params.append('state', filter.state);
      if (filter.searchTerm) params.append('search', filter.searchTerm);
    }

    const response = await dataPipelineAPI.get<RepresentativesResponse>(
      `/api/representatives${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  }

  async getRepresentativeScorecard(id: string): Promise<Scorecard> {
    const response = await dataPipelineAPI.get<Scorecard>(`/api/representatives/${id}/scorecard`);
    return response.data;
  }

  async getRepresentativeVotes(id: string, billId?: string): Promise<any[]> {
    const url = billId 
      ? `/api/representatives/${id}/votes?billId=${billId}`
      : `/api/representatives/${id}/votes`;
    const response = await dataPipelineAPI.get<any[]>(url);
    return response.data;
  }

  async getRepresentativeBills(id: string, type: 'sponsored' | 'cosponsored' = 'sponsored'): Promise<any[]> {
    const response = await dataPipelineAPI.get<any[]>(`/api/representatives/${id}/bills?type=${type}`);
    return response.data;
  }

  async searchRepresentatives(query: string): Promise<Representative[]> {
    const response = await dataPipelineAPI.get<Representative[]>(`/api/representatives/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getRepresentativesByState(state: string): Promise<Representative[]> {
    const response = await dataPipelineAPI.get<Representative[]>(`/api/representatives/state/${state}`);
    return response.data;
  }

  async getRepresentativesByDistrict(state: string, district: string): Promise<Representative[]> {
    const response = await dataPipelineAPI.get<Representative[]>(`/api/representatives/district/${state}/${district}`);
    return response.data;
  }

  async getCommitteeMembers(committeeId: string): Promise<Representative[]> {
    const response = await dataPipelineAPI.get<Representative[]>(`/api/committees/${committeeId}/members`);
    return response.data;
  }

  async compareRepresentatives(ids: string[]): Promise<any> {
    const response = await dataPipelineAPI.post<any>('/api/representatives/compare', { ids });
    return response.data;
  }

  async getRepresentativeContactInfo(id: string): Promise<any> {
    const response = await dataPipelineAPI.get<any>(`/api/representatives/${id}/contact`);
    return response.data;
  }

  async subscribeToRepresentative(id: string): Promise<{ message: string }> {
    const response = await dataPipelineAPI.post<{ message: string }>(`/api/representatives/${id}/subscribe`);
    return response.data;
  }

  async unsubscribeFromRepresentative(id: string): Promise<{ message: string }> {
    const response = await dataPipelineAPI.delete<{ message: string }>(`/api/representatives/${id}/subscribe`);
    return response.data;
  }
}

export const representativesService = new RepresentativesService();
export default representativesService;