import { communicationsAPI, aiEngineAPI } from './api/client';
import {
  Feedback,
  FeedbackSubmission,
  FeedbackAggregation,
  FeedbackFilter,
  FeedbackListResponse,
  FeedbackStats,
} from '../types/feedback.types';

class FeedbackService {
  async submitFeedback(data: FeedbackSubmission): Promise<Feedback> {
    const response = await communicationsAPI.post('/api/feedback', data);
    return await response.json();
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

    const response = await communicationsAPI.get(
      `/api/feedback${params.toString() ? `?${params.toString()}` : ''}`
    );
    return await response.json();
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    const response = await communicationsAPI.get(`/api/feedback/${id}`);
    return await response.json();
  }

  async updateFeedback(id: string, data: Partial<Feedback>): Promise<Feedback> {
    const response = await communicationsAPI.put(`/api/feedback/${id}`, data);
    return await response.json();
  }

  async deleteFeedback(id: string): Promise<{ message: string }> {
    const response = await communicationsAPI.delete(`/api/feedback/${id}`);
    return await response.json();
  }

  async voteFeedback(id: string, voteType: 'up' | 'down'): Promise<Feedback> {
    const response = await communicationsAPI.post(`/api/feedback/${id}/vote`, { voteType });
    return await response.json();
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

    const response = await aiEngineAPI.get(
      `/api/ai/feedback-aggregation${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return await response.json();
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

    const response = await communicationsAPI.get(
      `/api/feedback/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return await response.json();
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    const response = await communicationsAPI.get(`/api/users/${userId}/feedback`);
    return await response.json();
  }

  async getBillFeedback(billId: string): Promise<Feedback[]> {
    const response = await communicationsAPI.get(`/api/bills/${billId}/feedback`);
    return await response.json();
  }

  async getRepresentativeFeedback(representativeId: string): Promise<Feedback[]> {
    const response = await communicationsAPI.get(`/api/representatives/${representativeId}/feedback`);
    return await response.json();
  }

  async getTrendingFeedback(limit: number = 10): Promise<Feedback[]> {
    const response = await communicationsAPI.get(`/api/feedback/trending?limit=${limit}`);
    return await response.json();
  }

  async getRecentFeedback(limit: number = 10): Promise<Feedback[]> {
    const response = await communicationsAPI.get(`/api/feedback/recent?limit=${limit}`);
    return await response.json();
  }

  async reportFeedback(id: string, reason: string): Promise<{ message: string }> {
    const response = await communicationsAPI.post(`/api/feedback/${id}/report`, { reason });
    return await response.json();
  }

  async generateFeedbackSummary(feedbackIds: string[]): Promise<string> {
    const response = await aiEngineAPI.post('/api/ai/feedback-summary', { feedbackIds });
    const data = await response.json() as { summary: string };
    return data.summary;
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }> {
    const response = await aiEngineAPI.post('/api/ai/analyze-sentiment', { text });
    return await response.json() as {
      sentiment: 'positive' | 'negative' | 'neutral';
      confidence: number;
    };
  }

  async suggestTags(content: string): Promise<string[]> {
    const response = await aiEngineAPI.post('/api/ai/suggest-tags', { content });
    const data = await response.json() as { tags: string[] };
    return data.tags;
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;