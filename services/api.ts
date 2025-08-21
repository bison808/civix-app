import { Bill, User, Representative, FilterOptions, VoteRecord } from '@/types';
import { mockBills, mockUser, mockRepresentatives, mockCARepresentatives, mockTXRepresentatives, mockNYRepresentatives } from './mockData';
import { realDataService } from './realDataService';
import { congressService } from './congressService';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Feature flag to enable real data
const USE_REAL_DATA = true;

// Mock API service layer - will be replaced with real API calls to Agents 1-3
export const api = {
  // Agent 1 Data API Mock
  bills: {
    async getAll(filters?: FilterOptions): Promise<Bill[]> {
      await delay(300);
      
      // Use REAL bills from Congress!
      let bills: Bill[] = [];
      if (USE_REAL_DATA) {
        try {
          bills = await congressService.getRecentBills();
        } catch (error) {
          console.error('Failed to fetch real bills, using mock:', error);
          bills = [...mockBills];
        }
      } else {
        bills = [...mockBills];
      }
      
      if (filters) {
        if (filters.topics && filters.topics.length > 0) {
          bills = bills.filter(bill => 
            bill.subjects.some(subject => filters.topics.includes(subject))
          );
        }
        if (filters.status && filters.status.length > 0) {
          bills = bills.filter(bill => filters.status.includes(bill.status.stage));
        }
        if (filters.sortBy === 'popularity') {
          // Popularity sorting disabled - no likes/dislikes data available
          bills.sort((a, b) => a.title.localeCompare(b.title));
        } else if (filters.sortBy === 'date') {
          bills.sort((a, b) => {
            return new Date(b.lastActionDate).getTime() - new Date(a.lastActionDate).getTime();
          });
        }
      }
      
      return bills;
    },

    async getById(id: string): Promise<Bill | null> {
      await delay(200);
      if (USE_REAL_DATA) {
        try {
          const bills = await congressService.getRecentBills();
          return bills.find(bill => bill.id === id) || null;
        } catch (error) {
          console.error('Failed to fetch real bill, using mock:', error);
        }
      }
      return mockBills.find(bill => bill.id === id) || null;
    },

    async search(query: string): Promise<Bill[]> {
      await delay(300);
      const lowercaseQuery = query.toLowerCase();
      return mockBills.filter(bill => 
        bill.title.toLowerCase().includes(lowercaseQuery) ||
        (bill.aiSummary?.simpleSummary || bill.summary).toLowerCase().includes(lowercaseQuery) ||
        bill.subjects.some(subject => subject.includes(lowercaseQuery))
      );
    }
  },

  // Agent 2 Simplified Content API Mock
  simplified: {
    async getBillSummary(billId: string): Promise<string> {
      await delay(200);
      const bill = mockBills.find(b => b.id === billId);
      return bill?.aiSummary?.simpleSummary || bill?.summary || 'Summary not available';
    },

    async getImpactAnalysis(billId: string, zipCode: string): Promise<any> {
      await delay(300);
      const bill = mockBills.find(b => b.id === billId);
      return {
        personalImpacts: bill?.estimatedImpact ? [bill.estimatedImpact] : [],
        communityImpacts: [
          'More funding for local schools',
          'Better healthcare access in your area',
          'New job opportunities nearby'
        ],
        timeline: {
          voteDate: bill?.lastActionDate,
          implementationDate: '2025-07-01',
          firstEffects: '2025-10-01'
        }
      };
    }
  },

  // Agent 3 Auth API Mock
  auth: {
    async verifyZipCode(zipCode: string): Promise<boolean> {
      await delay(500);
      // Simple validation for demo
      return /^\d{5}$/.test(zipCode);
    },

    async getUser(): Promise<User> {
      await delay(200);
      return mockUser;
    },

    async updateUser(updates: Partial<User>): Promise<User> {
      await delay(300);
      return { ...mockUser, ...updates };
    }
  },

  // Feedback API
  feedback: {
    async submitVote(billId: string, vote: 'like' | 'dislike', comment?: string): Promise<void> {
      await delay(200);
      console.log('Vote submitted:', { billId, vote, comment });
    },

    async getVoteHistory(): Promise<VoteRecord[]> {
      await delay(200);
      return []; // Vote history not available in mockUser
    }
  },

  // Representatives API
  representatives: {
    async getByZipCode(zipCode: string): Promise<Representative[]> {
      await delay(300);
      
      // Try to use real data if enabled
      if (USE_REAL_DATA) {
        try {
          const realReps = await realDataService.getRepresentativesByZip(zipCode);
          if (realReps.length > 0) {
            return realReps;
          }
        } catch (error) {
          console.error('Failed to fetch real representatives, using mock data:', error);
        }
      }
      
      // Fall back to mock data based on ZIP code
      const zipNum = parseInt(zipCode);
      
      if (zipCode.startsWith('90') || zipCode.startsWith('91') || zipCode.startsWith('92') || zipCode.startsWith('93') || zipCode.startsWith('94') || zipCode.startsWith('95') || zipCode.startsWith('96')) {
        // California ZIP codes
        return mockCARepresentatives;
      } else if (zipCode.startsWith('75') || zipCode.startsWith('76') || zipCode.startsWith('77') || zipCode.startsWith('78') || zipCode.startsWith('79')) {
        // Texas ZIP codes
        return mockTXRepresentatives;
      } else if (zipCode.startsWith('10') || zipCode.startsWith('11') || zipCode.startsWith('12') || zipCode.startsWith('13') || zipCode.startsWith('14')) {
        // New York ZIP codes
        return mockNYRepresentatives;
      } else {
        // Default to California for unknown ZIP codes
        return mockCARepresentatives;
      }
    },

    async contact(repId: string, method: 'email' | 'phone', message?: string): Promise<void> {
      await delay(500);
      console.log('Contacting representative:', { repId, method, message });
    }
  },

  // Notifications API
  notifications: {
    async subscribe(token: string, preferences: any): Promise<void> {
      await delay(200);
      console.log('Subscribed to notifications:', { token, preferences });
    },

    async updatePreferences(preferences: any): Promise<void> {
      await delay(200);
      console.log('Updated notification preferences:', preferences);
    }
  }
};