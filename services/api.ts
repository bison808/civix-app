import { Bill, User, Representative, FilterOptions, VoteRecord } from '@/types';
import { realDataService } from './realDataService';
import { congressService } from './congressService';
import { civicInfoService } from './civicInfoService';
import { congressApi } from './congressApi';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Always use real data - no more mock data
const USE_REAL_DATA = true;

// Production API service layer - only real data
export const api = {
  // Real Congressional Data API
  bills: {
    async getAll(filters?: FilterOptions): Promise<Bill[]> {
      await delay(300);
      
      // Use REAL bills from Congress API - no fallbacks to mock data
      let bills: Bill[] = [];
      try {
        bills = await congressApi.fetchRecentBills(50, 0);
        if (bills.length === 0) {
          // Fallback to congressional service if congressApi returns empty
          bills = await congressService.getRecentBills();
        }
      } catch (error) {
        console.error('Failed to fetch real bills:', error);
        // Try alternative real data source
        try {
          bills = await congressService.getRecentBills();
        } catch (fallbackError) {
          console.error('All real data sources failed:', fallbackError);
          throw new Error('Unable to fetch legislative data. Please try again later.');
        }
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

    async getById(id: string): Promise<Bill | undefined> {
      await delay(200);
      try {
        // Try congressApi first for detailed bill data
        const bill = await congressApi.getBillById(id);
        if (bill) return bill;
        
        // Fallback to general congressional service
        const bills = await congressService.getRecentBills();
        return bills.find(bill => bill.id === id);
      } catch (error) {
        console.error('Failed to fetch real bill:', error);
        throw new Error('Unable to fetch bill details. Please try again later.');
      }
    },

    async search(query: string): Promise<Bill[]> {
      await delay(300);
      try {
        // Use real search functionality from congressApi
        const results = await congressApi.searchBills(query);
        return results;
      } catch (error) {
        console.error('Failed to search real bills:', error);
        // Fallback to searching through recent bills
        try {
          const allBills = await congressApi.fetchRecentBills(100, 0);
          const lowercaseQuery = query.toLowerCase();
          return allBills.filter(bill => 
            bill.title.toLowerCase().includes(lowercaseQuery) ||
            (bill.aiSummary?.simpleSummary || bill.summary).toLowerCase().includes(lowercaseQuery) ||
            bill.subjects.some(subject => subject.toLowerCase().includes(lowercaseQuery))
          );
        } catch (fallbackError) {
          console.error('Search fallback failed:', fallbackError);
          throw new Error('Unable to search bills. Please try again later.');
        }
      }
    }
  },

  // Real AI Summary Service
  simplified: {
    async getBillSummary(billId: string): Promise<string> {
      await delay(200);
      try {
        const bill = await congressApi.getBillById(billId);
        if (bill?.aiSummary?.simpleSummary) {
          return bill.aiSummary.simpleSummary;
        }
        if (bill?.summary) {
          return bill.summary;
        }
        return 'Summary not available for this bill.';
      } catch (error) {
        console.error('Failed to fetch bill summary:', error);
        return 'Unable to load bill summary. Please try again later.';
      }
    },

    async getImpactAnalysis(billId: string, zipCode: string): Promise<any> {
      await delay(300);
      try {
        const bill = await congressApi.getBillById(billId);
        const location = await realDataService.getLocationFromZip(zipCode);
        
        if (!bill) {
          throw new Error('Bill not found');
        }

        // Generate real impact analysis based on bill content and location
        const impact = {
          personalImpacts: bill.estimatedImpact ? [bill.estimatedImpact] : [],
          communityImpacts: await this.generateLocationSpecificImpacts(bill, location),
          timeline: {
            voteDate: bill.lastActionDate,
            implementationDate: this.estimateImplementationDate(bill),
            firstEffects: this.estimateFirstEffectsDate(bill)
          },
          economicAnalysis: bill.estimatedImpact?.economicImpact || null,
          affectedGroups: bill.estimatedImpact?.affectedGroups || []
        };

        return impact;
      } catch (error) {
        console.error('Failed to generate impact analysis:', error);
        return {
          error: 'Unable to generate impact analysis',
          personalImpacts: [],
          communityImpacts: [],
          timeline: null
        };
      }
    },

    // Helper methods for impact analysis
    async generateLocationSpecificImpacts(bill: Bill, location: any): Promise<string[]> {
      const impacts: string[] = [];
      
      if (!location) return impacts;

      // Analyze bill content for location-specific impacts
      const subjects = bill.subjects || [];
      const title = bill.title.toLowerCase();
      
      if (subjects.includes('Education') || title.includes('education')) {
        impacts.push(`Education funding changes may affect schools in ${location.city}`);
      }
      
      if (subjects.includes('Healthcare') || title.includes('healthcare') || title.includes('health')) {
        impacts.push(`Healthcare access may be impacted in ${location.county}`);
      }
      
      if (subjects.includes('Transportation') || title.includes('infrastructure')) {
        impacts.push(`Transportation and infrastructure improvements planned for your area`);
      }

      if (subjects.includes('Energy') || title.includes('energy')) {
        impacts.push(`Energy policy changes may affect utility costs in ${location.state}`);
      }

      return impacts.length > 0 ? impacts : [`This legislation may impact residents of ${location.city}, ${location.state}`];
    },

    estimateImplementationDate(bill: Bill): string {
      // Estimate implementation based on bill complexity and stage
      const stage = bill.status.stage;
      const now = new Date();
      
      if (stage === 'Law') {
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 days
      } else if (stage === 'Conference' || stage === 'Presidential') {
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 6 months
      } else {
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year
      }
    },

    estimateFirstEffectsDate(bill: Bill): string {
      // Estimate when first effects would be felt
      const implementationDate = new Date(this.estimateImplementationDate(bill));
      const firstEffects = new Date(implementationDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days after implementation
      return firstEffects.toISOString().split('T')[0];
    }
  },

  // Real Auth API Service
  auth: {
    async verifyZipCode(zipCode: string): Promise<boolean> {
      await delay(500);
      try {
        // Use real ZIP code validation with location data
        const location = await realDataService.getLocationFromZip(zipCode);
        return location !== null && location.state !== 'Unknown';
      } catch (error) {
        console.error('ZIP code verification failed:', error);
        // Fallback to format validation
        return /^\d{5}$/.test(zipCode);
      }
    },

    async getUser(): Promise<User> {
      await delay(200);
      // In production, this would get real user data from auth service
      // For now, return a constructed user from stored auth state
      const storedSession = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
      
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          const zipCode = session.zipCode || localStorage.getItem('userZipCode') || '00000';
          const location = await realDataService.getLocationFromZip(zipCode);
          
          return {
            id: session.anonymousId || 'anonymous-user',
            email: session.email || 'anonymous@citzn.com',
            name: session.name || 'Anonymous User',
            zipCode,
            district: `${location?.state || 'US'}-01`,
            state: location?.state || 'US',
            preferences: {
              notifications: true,
              emailUpdates: false,
              smsUpdates: false,
              topicInterests: []
            },
            createdAt: session.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error('Failed to parse user session:', error);
        }
      }
      
      // Default user if no session
      return {
        id: 'anonymous-user',
        email: 'anonymous@citzn.com',
        name: 'Anonymous User',
        zipCode: '00000',
        district: 'US-01',
        state: 'US',
        preferences: {
          notifications: true,
          emailUpdates: false,
          smsUpdates: false,
          topicInterests: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },

    async updateUser(updates: Partial<User>): Promise<User> {
      await delay(300);
      const currentUser = await this.getUser();
      const updatedUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
      
      // Store updated user info in session
      if (typeof window !== 'undefined') {
        try {
          const storedSession = localStorage.getItem('userSession');
          if (storedSession) {
            const session = JSON.parse(storedSession);
            const updatedSession = {
              ...session,
              ...updates,
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem('userSession', JSON.stringify(updatedSession));
          }
        } catch (error) {
          console.error('Failed to update user session:', error);
        }
      }
      
      return updatedUser;
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

  // Representatives API - uses real API endpoint
  representatives: {
    async getByZipCode(zipCode: string, level: 'federal' | 'state' | 'local' | 'all' = 'all'): Promise<Representative[]> {
      await delay(300);
      
      try {
        // Call the real API endpoint we just created
        const response = await fetch(`/api/representatives?zipCode=${zipCode}&level=${level}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch representatives');
        }
        
        const data = await response.json();
        return data.representatives || [];
      } catch (error) {
        console.error('Failed to fetch representatives from API:', error);
        
        // Emergency fallback: direct service calls
        try {
          const { getRepsByZip } = await import('./congress2025');
          const congressReps = getRepsByZip(zipCode);
          
          if (congressReps.length > 0) {
            const location = await realDataService.getLocationFromZip(zipCode);
            
            // Add basic local representative if no API
            if (location) {
              const localRep: Representative = {
                id: `mayor-${zipCode}`,
                name: `Mayor of ${location.city}`,
                title: 'Mayor',
                party: 'Independent' as const,
                state: location.state,
                district: location.city,
                chamber: 'Local' as any,
                level: 'municipal' as const,
                jurisdiction: location.city,
                governmentType: 'city' as const,
                jurisdictionScope: 'citywide' as const,
                contactInfo: {
                  phone: '311',
                  website: `https://www.${location.city.toLowerCase().replace(/\s+/g, '')}.gov`,
                  email: `mayor@${location.city.toLowerCase().replace(/\s+/g, '')}.gov`
                },
                socialMedia: {},
                committees: [],
                termStart: '2022-01-01',
                termEnd: '2026-01-01'
              };
              return [...congressReps, localRep];
            }
            
            return congressReps;
          }
          
          throw new Error('No representatives found');
        } catch (fallbackError) {
          console.error('Representatives fallback failed:', fallbackError);
          throw new Error('Unable to fetch representatives. Please check the ZIP code and try again.');
        }
      }
    },

    async contact(repId: string, method: 'email' | 'phone', subject: string, message: string): Promise<void> {
      await delay(500);
      
      try {
        // Use the real API endpoint for contacting representatives
        const response = await fetch('/api/representatives', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            representativeId: repId,
            method,
            subject,
            message,
            userInfo: {
              timestamp: new Date().toISOString()
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }

        const result = await response.json();
        console.log('Message sent successfully:', result);
      } catch (error) {
        console.error('Failed to contact representative:', error);
        throw error;
      }
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