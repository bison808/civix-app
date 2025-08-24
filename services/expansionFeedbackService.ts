import { feedbackService } from './feedback.service';

export interface ExpansionRequest {
  email: string;
  zipCode: string;
  state: string;
  city: string;
  priority: 'high' | 'medium' | 'low';
  requestType: 'state_expansion' | 'local_data' | 'feature_request' | 'general_feedback';
  message?: string;
  referralSource?: string;
  timestamp: string;
}

export interface FeedbackContext {
  type: 'after_search' | 'empty_results' | 'limited_coverage' | 'general' | 'after_full_data';
  zipCode?: string;
  state?: string;
  page?: string;
  userAgent?: string;
}

export interface FeedbackPromptConfig {
  showEmail: boolean;
  message: string;
  buttonText: string;
  placeholder?: string;
  priority: 'high' | 'medium' | 'low';
}

class ExpansionFeedbackService {
  // Collect expansion requests for non-California states
  async collectExpansionRequest(
    email: string,
    zipCode: string,
    state: string,
    city: string,
    message?: string
  ): Promise<void> {
    const expansionRequest: ExpansionRequest = {
      email,
      zipCode,
      state,
      city,
      priority: this.calculatePriority(state),
      requestType: 'state_expansion',
      message,
      timestamp: new Date().toISOString()
    };

    // Submit through existing feedback service with expansion-specific category
    await feedbackService.submitFeedback({
      type: 'general',
      category: 'suggestion',
      content: JSON.stringify(expansionRequest),
      tags: [`state:${state}`, `zip:${zipCode}`, `expansion_request`],
      urgency: this.mapPriorityToUrgency(expansionRequest.priority)
    });

    // Track expansion interest analytics
    this.trackExpansionInterest(state, zipCode);
  }

  // Submit general feedback with context
  async submitFeedback(
    type: 'missing_data' | 'feature_request' | 'general' | 'bug_report' | 'data_accuracy',
    message: string,
    context: FeedbackContext,
    email?: string
  ): Promise<void> {
    // Map the input type to valid FeedbackCategory
    const validCategory: 'suggestion' | 'question' | 'complaint' | 'concern' = 
      type === 'feature_request' ? 'suggestion' :
      type === 'missing_data' ? 'question' :
      type === 'bug_report' ? 'complaint' :
      'concern';

    await feedbackService.submitFeedback({
      type: 'general',
      category: validCategory,
      content: message,
      tags: [
        context.page ? `page:${context.page}` : '',
        context.zipCode ? `zip:${context.zipCode}` : '',
        context.state ? `state:${context.state}` : '',
        `context:${context.type}`,
        email ? 'has_email' : 'no_email'
      ].filter(Boolean)
    });
  }

  // Get contextual feedback prompt configuration
  getFeedbackPromptConfig(context: FeedbackContext, state?: string): FeedbackPromptConfig {
    switch (context.type) {
      case 'limited_coverage':
        return {
          showEmail: true,
          message: `We're working to add ${state} state and local data. Join the waitlist to be notified when it's available!`,
          buttonText: 'Join Waitlist',
          placeholder: 'Enter your email for updates...',
          priority: 'high'
        };

      case 'empty_results':
        return {
          showEmail: true,
          message: 'Not finding what you need? Help us improve by letting us know what you\'re looking for.',
          buttonText: 'Send Feedback',
          placeholder: 'Tell us what you were hoping to find...',
          priority: 'medium'
        };

      case 'after_search':
        return {
          showEmail: false,
          message: 'How was this information helpful? We\'d love your feedback.',
          buttonText: 'Share Feedback',
          priority: 'low'
        };

      case 'after_full_data':
        return {
          showEmail: false,
          message: 'We love feedback! Help us improve your experience.',
          buttonText: 'Give Feedback',
          priority: 'low'
        };

      default:
        return {
          showEmail: true,
          message: 'Have feedback or suggestions? We\'d love to hear from you!',
          buttonText: 'Send Feedback',
          priority: 'medium'
        };
    }
  }

  // Calculate priority based on state population and user activity
  private calculatePriority(state: string): 'high' | 'medium' | 'low' {
    // High-population states get higher priority
    const highPriorityStates = ['TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI', 'WA'];
    const mediumPriorityStates = ['AZ', 'TN', 'MA', 'IN', 'MD', 'MO', 'WI', 'CO', 'MN', 'SC'];

    if (highPriorityStates.includes(state)) return 'high';
    if (mediumPriorityStates.includes(state)) return 'medium';
    return 'low';
  }

  private mapPriorityToUrgency(priority: 'high' | 'medium' | 'low'): 'low' | 'medium' | 'high' | 'critical' {
    switch (priority) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'low';
    }
  }

  // Track expansion interest for analytics
  private trackExpansionInterest(state: string, zipCode: string): void {
    // Simple analytics tracking (could be enhanced with actual analytics service)
    if (typeof window !== 'undefined') {
      try {
        const expansionData = JSON.parse(
          localStorage.getItem('expansion_requests') || '[]'
        ) as Array<{ state: string; zipCode: string; timestamp: string }>;

        expansionData.push({
          state,
          zipCode,
          timestamp: new Date().toISOString()
        });

        // Keep only last 100 entries
        if (expansionData.length > 100) {
          expansionData.splice(0, expansionData.length - 100);
        }

        localStorage.setItem('expansion_requests', JSON.stringify(expansionData));
      } catch (error) {
        console.warn('Failed to track expansion interest:', error);
      }
    }
  }

  // Get expansion request statistics
  async getExpansionStats(): Promise<{
    totalRequests: number;
    byState: Record<string, number>;
    byPriority: Record<string, number>;
    recentRequests: ExpansionRequest[];
  }> {
    try {
      // Get expansion feedback from the main feedback service
      const expansionFeedback = await feedbackService.getFeedback({
        category: 'state_expansion',
        limit: 1000
      });

      const requests = expansionFeedback.feedback.map((feedback: any) => {
        try {
          return JSON.parse(feedback.content) as ExpansionRequest;
        } catch {
          return null;
        }
      }).filter(Boolean) as ExpansionRequest[];

      const byState: Record<string, number> = {};
      const byPriority: Record<string, number> = { high: 0, medium: 0, low: 0 };

      requests.forEach(request => {
        byState[request.state] = (byState[request.state] || 0) + 1;
        byPriority[request.priority] = (byPriority[request.priority] || 0) + 1;
      });

      return {
        totalRequests: requests.length,
        byState,
        byPriority,
        recentRequests: requests
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 50)
      };
    } catch (error) {
      console.error('Failed to get expansion stats:', error);
      return {
        totalRequests: 0,
        byState: {},
        byPriority: { high: 0, medium: 0, low: 0 },
        recentRequests: []
      };
    }
  }

  // Get most requested states for Phase 2 planning
  async getMostRequestedStates(limit = 10): Promise<Array<{
    state: string;
    count: number;
    priority: 'high' | 'medium' | 'low';
    latestRequest: string;
  }>> {
    const stats = await this.getExpansionStats();
    
    return Object.entries(stats.byState)
      .map(([state, count]) => {
        const stateRequests = stats.recentRequests.filter(r => r.state === state);
        const avgPriority = this.calculateAveragePriority(stateRequests.map(r => r.priority));
        const latestRequest = stateRequests[0]?.timestamp || '';

        return {
          state,
          count,
          priority: avgPriority,
          latestRequest
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private calculateAveragePriority(priorities: string[]): 'high' | 'medium' | 'low' {
    const priorityScores = { high: 3, medium: 2, low: 1 };
    const totalScore = priorities.reduce((sum, p) => sum + priorityScores[p as keyof typeof priorityScores], 0);
    const avgScore = totalScore / priorities.length;

    if (avgScore >= 2.5) return 'high';
    if (avgScore >= 1.5) return 'medium';
    return 'low';
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get user-friendly error messages
  getErrorMessage(error: string): string {
    switch (error) {
      case 'INVALID_EMAIL':
        return 'Please enter a valid email address';
      case 'INVALID_ZIP':
        return 'Please enter a valid ZIP code';
      case 'NETWORK_ERROR':
        return 'Network error. Please try again.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

export const expansionFeedbackService = new ExpansionFeedbackService();
export default expansionFeedbackService;