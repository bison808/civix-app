import { communicationsAPI, aiEngineAPI } from './api/client';
import {
  Feedback,
  FeedbackSubmission,
  FeedbackAggregation,
  FeedbackFilter,
  FeedbackResponse as FeedbackListResponse,
  FeedbackStats,
} from '../types/feedback.types';

class FeedbackService {
  async submitFeedback(data: FeedbackSubmission): Promise<Feedback> {
    const response = await communicationsAPI.post<Feedback>('/api/feedback', data);
    return response.data;
  }

  async getFeedback(filter?: FeedbackFilter): Promise<FeedbackListResponse> {
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.type) params.append('type', filter.type);
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      if (filter.billId) params.append('billId', filter.billId);
      if (filter.representativeId) params.append('representativeId', filter.representativeId);
      if (filter.userId) params.append('userId', filter.userId);
      if (filter.sentiment) params.append('sentiment', filter.sentiment);
      if (filter.urgency) params.append('urgency', filter.urgency);
      if (filter.searchTerm) params.append('search', filter.searchTerm);
      if (filter.sortBy) params.append('sort', filter.sortBy);
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.dateRange) {
        params.append('startDate', filter.dateRange.start);
        params.append('endDate', filter.dateRange.end);
      }
    }

    const response = await communicationsAPI.get<FeedbackListResponse>(
      `/api/feedback${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    const response = await communicationsAPI.get<Feedback>(`/api/feedback/${id}`);
    return response.data;
  }

  async updateFeedback(id: string, data: Partial<Feedback>): Promise<Feedback> {
    const response = await communicationsAPI.put<Feedback>(`/api/feedback/${id}`, data);
    return response.data;
  }

  async deleteFeedback(id: string): Promise<{ message: string }> {
    const response = await communicationsAPI.delete<{ message: string }>(`/api/feedback/${id}`);
    return response.data;
  }

  async voteFeedback(id: string, voteType: 'up' | 'down'): Promise<Feedback> {
    const response = await communicationsAPI.post<Feedback>(`/api/feedback/${id}/vote`, { voteType });
    return response.data;
  }

  async getFeedbackAggregation(params: {
    topic?: string;
    billId?: string;
    representativeId?: string;
    period?: { start: string; end: string };
  }): Promise<FeedbackAggregation> {
    const queryParams = new URLSearchParams();
    if (params.topic) queryParams.append('topic', params.topic);
    if (params.billId) queryParams.append('billId', params.billId);
    if (params.representativeId) queryParams.append('representativeId', params.representativeId);
    if (params.period) {
      queryParams.append('startDate', params.period.start);
      queryParams.append('endDate', params.period.end);
    }

    const response = await aiEngineAPI.get<FeedbackAggregation>(
      `/api/ai/feedback-aggregation${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  }

  async getFeedbackStats(params?: {
    billId?: string;
    representativeId?: string;
    period?: { start: string; end: string };
  }): Promise<FeedbackStats> {
    const queryParams = new URLSearchParams();
    if (params?.billId) queryParams.append('billId', params.billId);
    if (params?.representativeId) queryParams.append('representativeId', params.representativeId);
    if (params?.period) {
      queryParams.append('startDate', params.period.start);
      queryParams.append('endDate', params.period.end);
    }

    const response = await communicationsAPI.get<FeedbackStats>(
      `/api/feedback/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    const response = await communicationsAPI.get<Feedback[]>(`/api/users/${userId}/feedback`);
    return response.data;
  }

  async getBillFeedback(billId: string): Promise<Feedback[]> {
    const response = await communicationsAPI.get<Feedback[]>(`/api/bills/${billId}/feedback`);
    return response.data;
  }

  async getRepresentativeFeedback(representativeId: string): Promise<Feedback[]> {
    const response = await communicationsAPI.get<Feedback[]>(`/api/representatives/${representativeId}/feedback`);
    return response.data;
  }

  async getTrendingFeedback(limit: number = 10): Promise<Feedback[]> {
    const response = await communicationsAPI.get<Feedback[]>(`/api/feedback/trending?limit=${limit}`);
    return response.data;
  }

  async getRecentFeedback(limit: number = 10): Promise<Feedback[]> {
    const response = await communicationsAPI.get<Feedback[]>(`/api/feedback/recent?limit=${limit}`);
    return response.data;
  }

  async reportFeedback(id: string, reason: string): Promise<{ message: string }> {
    const response = await communicationsAPI.post<{ message: string }>(`/api/feedback/${id}/report`, { reason });
    return response.data;
  }

  async generateFeedbackSummary(feedbackIds: string[]): Promise<string> {
    const response = await aiEngineAPI.post<{ summary: string }>('/api/ai/feedback-summary', { feedbackIds });
    return response.data.summary;
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }> {
    const response = await aiEngineAPI.post<{
      sentiment: 'positive' | 'negative' | 'neutral';
      confidence: number;
    }>('/api/ai/analyze-sentiment', { text });
    return response.data;
  }

  async suggestTags(content: string): Promise<string[]> {
    const response = await aiEngineAPI.post<{ tags: string[] }>('/api/ai/suggest-tags', { content });
    return response.data.tags;
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;