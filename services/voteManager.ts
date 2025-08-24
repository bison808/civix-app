import { VoteRecord } from '@/types';

interface BillVote {
  billId: string;
  vote: 'support' | 'oppose' | null;
  timestamp: string;
  hasContacted: boolean;
  hasShared: boolean;
}

interface VoteStats {
  totalVotes: number;
  supportPercentage: number;
  opposePercentage: number;
  userVote: 'support' | 'oppose' | null;
}

class VoteManager {
  private readonly STORAGE_KEY = 'citzn_user_votes';
  private readonly STATS_CACHE_KEY = 'citzn_vote_stats';
  private votes: Map<string, BillVote> = new Map();

  constructor() {
    this.loadVotes();
  }

  private loadVotes(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.votes = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load votes:', error);
      this.votes = new Map();
    }
  }

  private saveVotes(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const obj = Object.fromEntries(this.votes);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Failed to save votes:', error);
    }
  }

  public recordVote(billId: string, vote: 'support' | 'oppose' | null): void {
    const existing = this.votes.get(billId);
    
    if (vote === null) {
      this.votes.delete(billId);
    } else {
      this.votes.set(billId, {
        billId,
        vote,
        timestamp: new Date().toISOString(),
        hasContacted: existing?.hasContacted || false,
        hasShared: existing?.hasShared || false
      });
    }
    
    this.saveVotes();
    this.simulateServerSync(billId, vote);
  }

  public getVote(billId: string): BillVote | undefined {
    return this.votes.get(billId);
  }

  public getAllVotes(): BillVote[] {
    return Array.from(this.votes.values());
  }

  public markContacted(billId: string): void {
    const vote = this.votes.get(billId);
    if (vote) {
      vote.hasContacted = true;
      this.votes.set(billId, vote);
      this.saveVotes();
    }
  }

  public markShared(billId: string): void {
    const vote = this.votes.get(billId);
    if (vote) {
      vote.hasShared = true;
      this.votes.set(billId, vote);
      this.saveVotes();
    }
  }

  public async getVoteStats(billId: string): Promise<VoteStats> {
    // Check cache first
    const cached = this.getCachedStats(billId);
    if (cached) return cached;

    // Simulate fetching community stats from server
    // In production, this would be an API call
    const realStats = await this.getRealVoteStats(billId);
    
    // Add user's vote to the stats
    const userVote = this.votes.get(billId);
    realStats.userVote = userVote?.vote || null;
    
    // Cache the stats
    this.cacheStats(billId, realStats);
    
    return realStats;
  }

  private getCachedStats(billId: string): VoteStats | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = sessionStorage.getItem(`${this.STATS_CACHE_KEY}_${billId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < 5 * 60 * 1000) { // 5 minute cache
          return parsed.stats;
        }
      }
    } catch (error) {
      console.error('Failed to get cached stats:', error);
    }
    
    return null;
  }

  private cacheStats(billId: string, stats: VoteStats): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(
        `${this.STATS_CACHE_KEY}_${billId}`,
        JSON.stringify({
          stats,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error('Failed to cache stats:', error);
    }
  }

  // ELIMINATED: generateMockStats() - replaced with real vote data integration
  private async getRealVoteStats(billId: string): Promise<VoteStats> {
    try {
      // In production, this would fetch real community voting data from API
      // For now, we'll use a placeholder that returns reasonable defaults
      // TODO: Implement real API endpoint for community vote statistics
      
      const response = await fetch(`/api/bills/${billId}/votes`);
      if (response.ok) {
        const voteData = await response.json();
        return {
          totalVotes: voteData.totalVotes || 0,
          supportPercentage: voteData.supportPercentage || 0,
          opposePercentage: voteData.opposePercentage || 0,
          userVote: null // Will be set by caller
        };
      }
    } catch (error) {
      console.warn(`Could not fetch vote stats for ${billId}:`, error);
    }
    
    // Return empty stats instead of mock data
    return {
      totalVotes: 0,
      supportPercentage: 0,
      opposePercentage: 0,
      userVote: null
    };
  }

  private async simulateServerSync(billId: string, vote: 'support' | 'oppose' | null): Promise<void> {
    // In production, this would sync with the backend
    console.log('Syncing vote to server:', { billId, vote });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  public getCivicScore(): number {
    const votes = this.getAllVotes();
    let score = 0;
    
    // Points for voting
    score += votes.length * 10;
    
    // Bonus points for taking action
    votes.forEach(vote => {
      if (vote.hasContacted) score += 20;
      if (vote.hasShared) score += 5;
    });
    
    return Math.min(score, 1000); // Cap at 1000
  }

  public getEngagementLevel(): 'bronze' | 'silver' | 'gold' | 'platinum' {
    const score = this.getCivicScore();
    if (score >= 500) return 'platinum';
    if (score >= 250) return 'gold';
    if (score >= 100) return 'silver';
    return 'bronze';
  }
}

export const voteManager = new VoteManager();