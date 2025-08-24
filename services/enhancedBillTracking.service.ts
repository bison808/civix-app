import { dataPipelineAPI } from './api/client';
import { congressApi } from './congressApi';
import { californiaLegislativeApi } from './californiaLegislativeApi';
import { representativesService } from './representatives.service';
import { billsCacheService } from './cacheManager.service';
import {
  Bill,
  BillFilter,
  BillsResponse,
} from '../types/bills.types';
import {
  Representative,
} from '../types/representatives.types';

// Extended types for bill-representative connections
export interface BillRepresentativeConnection {
  billId: string;
  representativeId: string;
  connectionType: 'sponsor' | 'cosponsor' | 'committee_member' | 'district_impact' | 'vote';
  strength: 'strong' | 'moderate' | 'weak';
  details?: string;
}

export interface RepresentativeBillActivity {
  representativeId: string;
  representative: Representative;
  sponsoredBills: Bill[];
  cosponsoredBills: Bill[];
  committeeBills: Bill[];
  recentVotes: BillVote[];
  billsAffectingDistrict: Bill[];
}

export interface BillVote {
  billId: string;
  representativeId: string;
  vote: 'yea' | 'nay' | 'present' | 'not_voting';
  date: string;
  chamber: 'House' | 'Senate';
}

export interface UserBillPreferences {
  userId: string;
  interestedSubjects: string[];
  followedRepresentatives: string[];
  trackedBills: string[];
  zipCode?: string;
  notifications: {
    billUpdates: boolean;
    representativeActivity: boolean;
    newBillsFromReps: boolean;
  };
}

class EnhancedBillTrackingService {

  // Get bills connected to specific representative
  async getBillsByRepresentative(
    representativeId: string,
    includeTypes: Array<'sponsored' | 'cosponsored' | 'committee' | 'votes'> = ['sponsored', 'cosponsored']
  ): Promise<RepresentativeBillActivity> {
    try {
      const cacheKey = `${representativeId}_${includeTypes.join('_')}`;
      const cached = billsCacheService.getRepresentativeActivity(cacheKey);
      if (cached) return cached as RepresentativeBillActivity;

      // Get representative details
      const representative = await representativesService.getRepresentativeById(representativeId);
      
      // Initialize result object
      const activity: RepresentativeBillActivity = {
        representativeId,
        representative,
        sponsoredBills: [],
        cosponsoredBills: [],
        committeeBills: [],
        recentVotes: [],
        billsAffectingDistrict: []
      };

      // Fetch sponsored bills
      if (includeTypes.includes('sponsored')) {
        activity.sponsoredBills = await this.getSponsoredBills(representative);
      }

      // Fetch cosponsored bills
      if (includeTypes.includes('cosponsored')) {
        activity.cosponsoredBills = await this.getCosponsoredBills(representative);
      }

      // Fetch committee bills
      if (includeTypes.includes('committee')) {
        activity.committeeBills = await this.getCommitteeBills(representative);
      }

      // Fetch recent votes
      if (includeTypes.includes('votes')) {
        activity.recentVotes = await this.getRecentVotes(representative);
      }

      // Get bills affecting their district
      activity.billsAffectingDistrict = await this.getBillsAffectingDistrict(representative);

      billsCacheService.setRepresentativeActivity(cacheKey, activity);
      return activity;
    } catch (error) {
      console.error('Error fetching bills by representative:', error);
      throw error;
    }
  }

  // Get bills from user's representatives
  async getBillsFromUserRepresentatives(zipCode: string): Promise<Bill[]> {
    try {
      const cacheKey = `user_rep_bills_${zipCode}`;
      const cached = billsCacheService.getBills(cacheKey);
      if (cached) return cached as Bill[];

      // Get user's representatives
      const representatives = await representativesService.getRepresentativesByZipCode(zipCode);
      
      // Collect bills from all representatives
      const allBills: Bill[] = [];
      const seenBillIds = new Set<string>();

      for (const rep of representatives) {
        try {
          const activity = await this.getBillsByRepresentative(rep.id, ['sponsored', 'cosponsored', 'committee']);
          
          // Add sponsored bills
          for (const bill of activity.sponsoredBills) {
            if (!seenBillIds.has(bill.id)) {
              allBills.push({
                ...bill,
                userConnection: {
                  type: 'representative_sponsored',
                  representativeName: rep.name,
                  representativeTitle: rep.title
                }
              });
              seenBillIds.add(bill.id);
            }
          }

          // Add cosponsored bills (with lower priority)
          for (const bill of activity.cosponsoredBills) {
            if (!seenBillIds.has(bill.id)) {
              allBills.push({
                ...bill,
                userConnection: {
                  type: 'representative_cosponsored',
                  representativeName: rep.name,
                  representativeTitle: rep.title
                }
              });
              seenBillIds.add(bill.id);
            }
          }

          // Add committee bills
          for (const bill of activity.committeeBills) {
            if (!seenBillIds.has(bill.id)) {
              allBills.push({
                ...bill,
                userConnection: {
                  type: 'representative_committee',
                  representativeName: rep.name,
                  representativeTitle: rep.title
                }
              });
              seenBillIds.add(bill.id);
            }
          }
        } catch (repError) {
          console.warn(`Error fetching bills for representative ${rep.id}:`, repError);
          continue;
        }
      }

      // Sort by relevance (sponsored > cosponsored > committee) and date
      allBills.sort((a, b) => {
        const priorityA = this.getConnectionPriority(a.userConnection?.type || '');
        const priorityB = this.getConnectionPriority(b.userConnection?.type || '');
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB; // Lower number = higher priority
        }
        
        // Then sort by last action date
        return new Date(b.lastActionDate).getTime() - new Date(a.lastActionDate).getTime();
      });

      billsCacheService.setBills(cacheKey, allBills);
      return allBills;
    } catch (error) {
      console.error('Error fetching bills from user representatives:', error);
      throw error;
    }
  }

  // Track bill progress and notify of changes
  async trackBillProgress(billId: string): Promise<{ 
    bill: Bill; 
    statusChanged: boolean; 
    previousStatus?: string;
  }> {
    try {
      // Get current bill data
      const currentBill = await this.getBillById(billId);
      if (!currentBill) {
        throw new Error(`Bill ${billId} not found`);
      }

      // Check if we have previous status cached
      const statusCacheKey = `status_${billId}`;
      const previousStatusData = billsCacheService.getBillTracking(statusCacheKey) as { status: string; date: string } | null;

      let statusChanged = false;
      let previousStatus: string | undefined;

      if (previousStatusData) {
        previousStatus = previousStatusData.status;
        statusChanged = previousStatusData.status !== currentBill.status.detail;
      }

      // Update status cache
      billsCacheService.setBillTracking(statusCacheKey, {
        status: currentBill.status.detail,
        date: currentBill.lastActionDate
      });

      return {
        bill: currentBill,
        statusChanged,
        previousStatus
      };
    } catch (error) {
      console.error('Error tracking bill progress:', error);
      throw error;
    }
  }

  // Get personalized bill recommendations
  async getPersonalizedBills(
    zipCode: string,
    preferences?: UserBillPreferences
  ): Promise<Bill[]> {
    try {
      const cacheKey = `${zipCode}_${preferences?.userId || 'guest'}`;
      const cached = billsCacheService.getPersonalizedBills(cacheKey);
      if (cached) return cached as Bill[];

      // Start with bills from user's representatives
      const repBills = await this.getBillsFromUserRepresentatives(zipCode);
      
      // Add bills matching user's interests
      let interestBills: Bill[] = [];
      if (preferences?.interestedSubjects?.length) {
        for (const subject of preferences.interestedSubjects) {
          const subjectBills = await this.getBillsBySubject(subject);
          interestBills = interestBills.concat(subjectBills);
        }
      }

      // Combine and deduplicate
      const allBills: Bill[] = [];
      const seenBillIds = new Set<string>();

      // Add representative bills first (higher priority)
      for (const bill of repBills) {
        if (!seenBillIds.has(bill.id)) {
          allBills.push(bill);
          seenBillIds.add(bill.id);
        }
      }

      // Add interest-based bills
      for (const bill of interestBills) {
        if (!seenBillIds.has(bill.id)) {
          allBills.push({
            ...bill,
            userConnection: {
              type: 'subject_interest',
              details: `Matches your interest in ${bill.subjects.find(s => 
                preferences?.interestedSubjects.includes(s)
              )}`
            }
          });
          seenBillIds.add(bill.id);
        }
      }

      // Limit to reasonable number and sort by relevance
      const personalizedBills = allBills
        .slice(0, 50)
        .sort((a, b) => {
          const scoreA = this.calculateRelevanceScore(a, preferences);
          const scoreB = this.calculateRelevanceScore(b, preferences);
          return scoreB - scoreA;
        });

      billsCacheService.setPersonalizedBills(cacheKey, personalizedBills);
      return personalizedBills;
    } catch (error) {
      console.error('Error getting personalized bills:', error);
      throw error;
    }
  }

  // Private helper methods

  private async getSponsoredBills(representative: Representative): Promise<Bill[]> {
    try {
      // For federal representatives, use Congress API
      if (representative.level === 'federal') {
        const federalBills = await congressApi.fetchRecentBills(50);
        return federalBills.filter(bill => 
          bill.sponsor.name.toLowerCase().includes(representative.name.toLowerCase()) ||
          bill.sponsor.state === representative.state
        );
      }

      // For California state representatives, use CA Legislative API
      if (representative.state === 'CA' && representative.level === 'state') {
        const caBills = await californiaLegislativeApi.fetchRecentBills(50);
        return caBills.filter(bill =>
          bill.sponsor.name.toLowerCase().includes(representative.name.toLowerCase())
        );
      }

      return [];
    } catch (error) {
      console.error('Error fetching sponsored bills:', error);
      return [];
    }
  }

  private async getCosponsoredBills(representative: Representative): Promise<Bill[]> {
    try {
      // For federal representatives
      if (representative.level === 'federal') {
        const federalBills = await congressApi.fetchRecentBills(50);
        return federalBills.filter(bill =>
          bill.cosponsors.some(cosponsor =>
            cosponsor.name.toLowerCase().includes(representative.name.toLowerCase())
          )
        );
      }

      // For California state representatives
      if (representative.state === 'CA' && representative.level === 'state') {
        const caBills = await californiaLegislativeApi.fetchRecentBills(50);
        return caBills.filter(bill =>
          bill.cosponsors.some(cosponsor =>
            cosponsor.name.toLowerCase().includes(representative.name.toLowerCase())
          )
        );
      }

      return [];
    } catch (error) {
      console.error('Error fetching cosponsored bills:', error);
      return [];
    }
  }

  private async getCommitteeBills(representative: Representative): Promise<Bill[]> {
    try {
      // Get bills from committees the representative serves on
      const committeeBills: Bill[] = [];
      
      if (representative.committees?.length) {
        for (const committee of representative.committees) {
          // This would ideally call a committee-specific API
          // For now, return bills that mention the committee
          const bills = await this.getBillsByCommittee(committee.name);
          committeeBills.push(...bills);
        }
      }

      return committeeBills;
    } catch (error) {
      console.error('Error fetching committee bills:', error);
      return [];
    }
  }

  private async getRecentVotes(representative: Representative): Promise<BillVote[]> {
    try {
      // This would call the representative's voting record API
      // For now, return mock data structure
      return [];
    } catch (error) {
      console.error('Error fetching recent votes:', error);
      return [];
    }
  }

  private async getBillsAffectingDistrict(representative: Representative): Promise<Bill[]> {
    try {
      // Get bills that specifically affect the representative's district or state
      let bills: Bill[] = [];

      // Federal level - bills affecting the state
      if (representative.level === 'federal') {
        bills = await congressApi.fetchRecentBills(50);
        bills = bills.filter(bill =>
          bill.summary.toLowerCase().includes(representative.state.toLowerCase()) ||
          bill.subjects.some(subject => 
            subject.toLowerCase().includes(representative.state.toLowerCase())
          )
        );
      }

      // State level - bills affecting local areas
      if (representative.level === 'state' && representative.state === 'CA') {
        bills = await californiaLegislativeApi.fetchRecentBills(50);
        // Filter for local impact bills
        bills = bills.filter(bill =>
          bill.summary.toLowerCase().includes('local') ||
          bill.summary.toLowerCase().includes('district') ||
          bill.subjects.includes('Local Government')
        );
      }

      return bills;
    } catch (error) {
      console.error('Error fetching district-affecting bills:', error);
      return [];
    }
  }

  private async getBillById(billId: string): Promise<Bill | null> {
    try {
      // Try Congress API first
      if (billId.includes('-119') || billId.startsWith('hr-') || billId.startsWith('s-')) {
        return await congressApi.getBillById(billId);
      }

      // Try California API
      if (billId.startsWith('ca-')) {
        return await californiaLegislativeApi.getBillById(billId);
      }

      return null;
    } catch (error) {
      console.error('Error fetching bill by ID:', error);
      return null;
    }
  }

  private async getBillsBySubject(subject: string): Promise<Bill[]> {
    try {
      // Search both federal and state bills for the subject
      const federalBills = await congressApi.searchBills(subject);
      const caBills = await californiaLegislativeApi.searchBills(subject);

      return [...federalBills, ...caBills];
    } catch (error) {
      console.error('Error fetching bills by subject:', error);
      return [];
    }
  }

  private async getBillsByCommittee(committeeName: string): Promise<Bill[]> {
    try {
      // This would ideally call a committee-specific API
      // For now, search bills that mention the committee
      const searchTerm = committeeName.toLowerCase();
      const federalBills = await congressApi.searchBills(searchTerm);
      const caBills = await californiaLegislativeApi.searchBills(searchTerm);

      const allBills = [...federalBills, ...caBills];
      return allBills.filter(bill =>
        bill.committees.some(c => c.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error fetching bills by committee:', error);
      return [];
    }
  }

  private getConnectionPriority(connectionType: string): number {
    const priorities: { [key: string]: number } = {
      'representative_sponsored': 1,
      'representative_cosponsored': 2,
      'representative_committee': 3,
      'subject_interest': 4,
      'default': 5
    };

    return priorities[connectionType] || priorities.default;
  }

  private calculateRelevanceScore(bill: Bill, preferences?: UserBillPreferences): number {
    let score = 0;

    // Connection type scoring
    if (bill.userConnection) {
      switch (bill.userConnection.type) {
        case 'representative_sponsored':
          score += 100;
          break;
        case 'representative_cosponsored':
          score += 75;
          break;
        case 'representative_committee':
          score += 50;
          break;
        case 'subject_interest':
          score += 25;
          break;
      }
    }

    // Subject interest scoring
    if (preferences?.interestedSubjects?.length) {
      const matchingSubjects = bill.subjects.filter(subject =>
        preferences.interestedSubjects.some(interest =>
          subject.toLowerCase().includes(interest.toLowerCase())
        )
      ).length;
      score += matchingSubjects * 10;
    }

    // Recency scoring (more recent = higher score)
    const daysSinceLastAction = Math.floor(
      (Date.now() - new Date(bill.lastActionDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, 30 - daysSinceLastAction);

    // Activity scoring (more active bills = higher score)
    switch (bill.status.stage) {
      case 'Committee':
        score += 20;
        break;
      case 'House':
      case 'Senate':
        score += 30;
        break;
      case 'Conference':
        score += 40;
        break;
      case 'Presidential':
        score += 50;
        break;
    }

    return score;
  }

  // Clear cache
  public clearCache(): void {
    billsCacheService.clearAllCaches();
  }
}

export const enhancedBillTrackingService = new EnhancedBillTrackingService();