// Data synchronization manager with incremental updates and real-time notifications
import { legislativeCacheManager } from '../utils/legislativeCacheManager';
import { legislativeApiClient } from './legislativeApiClient';

interface SyncConfig {
  entity: string;
  endpoint: string;
  syncInterval: number; // milliseconds
  batchSize: number;
  priority: number;
  incrementalField: string; // Field to use for incremental sync (lastModified, updatedAt, etc.)
  dependencies: string[]; // Other entities that depend on this one
}

interface SyncState {
  entity: string;
  lastSyncTime: number;
  lastSyncId?: string;
  status: 'idle' | 'syncing' | 'error' | 'paused';
  errorCount: number;
  totalRecords: number;
  syncedRecords: number;
  errorMessages: string[];
}

interface ChangeSet {
  entity: string;
  changes: Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    data?: any;
    timestamp: number;
  }>;
  metadata: {
    syncTime: number;
    source: string;
    batchId: string;
  };
}

interface NotificationSubscription {
  entityType: string;
  entityId?: string;
  userId: string;
  callback: (change: any) => void;
}

class DataSyncManager {
  private syncConfigs: Map<string, SyncConfig> = new Map();
  private syncStates: Map<string, SyncState> = new Map();
  private syncTimers: Map<string, NodeJS.Timeout> = new Map();
  private notificationSubscriptions: NotificationSubscription[] = [];
  private syncQueue: Array<{entity: string, priority: number, timestamp: number}> = [];
  private isProcessingSyncQueue = false;
  private webSocket: WebSocket | null = null;

  constructor() {
    this.initializeSyncConfigs();
    this.loadSyncStates();
    this.startSyncScheduler();
    this.initializeWebSocket();
  }

  private initializeSyncConfigs() {
    const configs: SyncConfig[] = [
      {
        entity: 'bills',
        endpoint: '/bills',
        syncInterval: 15 * 60 * 1000, // 15 minutes for active bills
        batchSize: 100,
        priority: 9,
        incrementalField: 'lastAction.actionDate',
        dependencies: ['bill_actions', 'bill_committees']
      },
      {
        entity: 'bill_actions',
        endpoint: '/bill/{billId}/actions',
        syncInterval: 5 * 60 * 1000, // 5 minutes for bill actions
        batchSize: 50,
        priority: 8,
        incrementalField: 'actionDate',
        dependencies: []
      },
      {
        entity: 'committees',
        endpoint: '/committees',
        syncInterval: 2 * 60 * 60 * 1000, // 2 hours for committees
        batchSize: 50,
        priority: 6,
        incrementalField: 'lastUpdated',
        dependencies: ['committee_meetings', 'committee_members']
      },
      {
        entity: 'committee_meetings',
        endpoint: '/committee/{committeeId}/meetings',
        syncInterval: 30 * 60 * 1000, // 30 minutes for meetings
        batchSize: 25,
        priority: 7,
        incrementalField: 'scheduledDate',
        dependencies: []
      },
      {
        entity: 'representatives',
        endpoint: '/representatives',
        syncInterval: 24 * 60 * 60 * 1000, // Daily for representatives
        batchSize: 100,
        priority: 5,
        incrementalField: 'lastUpdated',
        dependencies: ['representative_committees', 'representative_bills']
      },
      {
        entity: 'user_engagement',
        endpoint: '/user/{userId}/engagement',
        syncInterval: 60 * 1000, // 1 minute for user engagement
        batchSize: 100,
        priority: 10, // Highest priority
        incrementalField: 'timestamp',
        dependencies: []
      }
    ];

    for (const config of configs) {
      this.syncConfigs.set(config.entity, config);
      this.syncStates.set(config.entity, {
        entity: config.entity,
        lastSyncTime: 0,
        status: 'idle',
        errorCount: 0,
        totalRecords: 0,
        syncedRecords: 0,
        errorMessages: []
      });
    }
  }

  private loadSyncStates() {
    // Load sync states from localStorage or API
    try {
      const stored = localStorage.getItem('citzn_sync_states');
      if (stored) {
        const states = JSON.parse(stored);
        for (const [entity, state] of Object.entries(states as Record<string, SyncState>)) {
          this.syncStates.set(entity, { ...state, status: 'idle' });
        }
      }
    } catch (error) {
      console.warn('Failed to load sync states:', error);
    }
  }

  private saveSyncStates() {
    try {
      const states = Object.fromEntries(this.syncStates.entries());
      localStorage.setItem('citzn_sync_states', JSON.stringify(states));
    } catch (error) {
      console.warn('Failed to save sync states:', error);
    }
  }

  // Main synchronization orchestration
  private startSyncScheduler() {
    // Start individual sync timers
    for (const [entity, config] of this.syncConfigs.entries()) {
      this.scheduleSync(entity, config.syncInterval);
    }

    // Process sync queue every 5 seconds
    setInterval(() => {
      if (!this.isProcessingSyncQueue) {
        this.processSyncQueue();
      }
    }, 5000);

    // Save states every minute
    setInterval(() => {
      this.saveSyncStates();
    }, 60 * 1000);
  }

  private scheduleSync(entity: string, interval: number) {
    const existing = this.syncTimers.get(entity);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.enqueueSyncTask(entity);
      this.scheduleSync(entity, interval); // Reschedule
    }, interval);

    this.syncTimers.set(entity, timer);
  }

  private enqueueSyncTask(entity: string, priority?: number) {
    const config = this.syncConfigs.get(entity);
    if (!config) return;

    const syncTask = {
      entity,
      priority: priority || config.priority,
      timestamp: Date.now()
    };

    // Insert maintaining priority order
    const insertIndex = this.syncQueue.findIndex(
      task => task.priority < syncTask.priority || 
              (task.priority === syncTask.priority && task.timestamp > syncTask.timestamp)
    );

    if (insertIndex === -1) {
      this.syncQueue.push(syncTask);
    } else {
      this.syncQueue.splice(insertIndex, 0, syncTask);
    }
  }

  private async processSyncQueue() {
    if (this.syncQueue.length === 0) return;

    this.isProcessingSyncQueue = true;

    try {
      while (this.syncQueue.length > 0) {
        const task = this.syncQueue.shift()!;
        await this.performSync(task.entity);
        
        // Small delay between syncs to prevent overwhelming APIs
        await this.wait(1000);
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isProcessingSyncQueue = false;
    }
  }

  // Core synchronization logic
  private async performSync(entity: string): Promise<ChangeSet | null> {
    const config = this.syncConfigs.get(entity);
    const state = this.syncStates.get(entity);

    if (!config || !state) {
      console.warn(`No config/state found for entity: ${entity}`);
      return null;
    }

    if (state.status === 'syncing') {
      console.log(`Sync already in progress for: ${entity}`);
      return null;
    }

    state.status = 'syncing';
    state.syncedRecords = 0;
    state.errorMessages = [];

    try {
      const changeSet = await this.fetchIncrementalChanges(entity, config, state);
      
      if (changeSet && changeSet.changes.length > 0) {
        await this.applyChanges(changeSet);
        await this.notifySubscribers(changeSet);
        
        // Update sync state
        state.lastSyncTime = Date.now();
        state.syncedRecords = changeSet.changes.length;
        state.errorCount = 0;
        
        // Trigger dependent entity syncs
        await this.triggerDependentSyncs(config.dependencies);
      }

      state.status = 'idle';
      return changeSet;

    } catch (error) {
      console.error(`Sync failed for ${entity}:`, error);
      
      state.status = 'error';
      state.errorCount++;
      state.errorMessages.push(`${new Date().toISOString()}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Exponential backoff for failed syncs
      const backoffDelay = Math.min(30000 * Math.pow(2, state.errorCount), 300000); // Max 5 minutes
      setTimeout(() => {
        if (state.errorCount < 5) { // Max 5 retries
          this.enqueueSyncTask(entity, config.priority - 1); // Lower priority for retries
        }
      }, backoffDelay);

      return null;
    }
  }

  private async fetchIncrementalChanges(
    entity: string, 
    config: SyncConfig, 
    state: SyncState
  ): Promise<ChangeSet | null> {
    const params: any = {
      limit: config.batchSize,
      orderBy: config.incrementalField,
      orderDirection: 'asc'
    };

    // Add incremental filter
    if (state.lastSyncTime > 0) {
      params[`${config.incrementalField}_gt`] = new Date(state.lastSyncTime).toISOString();
    }

    // Handle special cases for parameterized endpoints
    let endpoint = config.endpoint;
    if (endpoint.includes('{')) {
      // This would need to be resolved based on context
      // For now, skip parameterized endpoints in incremental sync
      return null;
    }

    // Fetch data using legislative API client
    const response = await legislativeApiClient.request('congress', {
      endpoint,
      method: 'GET',
      params,
      priority: config.priority
    });

    if (!response || typeof response !== 'object' || !('results' in response) || !(response as any).results) {
      return null;
    }

    // Convert API response to change set format
    const changes = (response as any).results.map((item: any) => {
      const existingItem = legislativeCacheManager.get(entity, item.id);
      
      return {
        id: item.id,
        type: existingItem ? 'update' as const : 'create' as const,
        data: item,
        timestamp: new Date(item[config.incrementalField]).getTime()
      };
    });

    return {
      entity,
      changes,
      metadata: {
        syncTime: Date.now(),
        source: 'api_incremental',
        batchId: this.generateBatchId()
      }
    };
  }

  private async applyChanges(changeSet: ChangeSet): Promise<void> {
    const cacheUpdates: Array<{key: string, data: any}> = [];

    for (const change of changeSet.changes) {
      switch (change.type) {
        case 'create':
        case 'update':
          // Update cache
          legislativeCacheManager.set(changeSet.entity, change.id, change.data);
          cacheUpdates.push({
            key: `${changeSet.entity}_${change.id}`,
            data: change.data
          });
          break;

        case 'delete':
          // Remove from cache (would need to extend cache manager)
          console.log(`Deleting ${changeSet.entity}_${change.id} from cache`);
          break;
      }
    }

    // Batch update related caches
    await this.updateRelatedCaches(changeSet, cacheUpdates);
  }

  private async updateRelatedCaches(changeSet: ChangeSet, updates: Array<{key: string, data: any}>): Promise<void> {
    // Update user engagement tracking
    if (changeSet.entity === 'bills') {
      // Notify users following these bills
      for (const update of updates) {
        await this.notifyFollowers(update.key, update.data);
      }
    }

    // Update search indices (would integrate with search service)
    if (['bills', 'representatives', 'committees'].includes(changeSet.entity)) {
      await this.updateSearchIndex(changeSet.entity, updates);
    }
  }

  private async notifyFollowers(itemKey: string, data: any): Promise<void> {
    // This would integrate with user follow tracking
    const [entityType, entityId] = itemKey.split('_', 2);
    
    // Find users following this item
    // For now, we'll simulate this
    const followers = await this.getUsersFollowingItem(entityType, entityId);
    
    for (const userId of followers) {
      await this.sendNotification(userId, {
        type: 'item_update',
        entityType,
        entityId,
        data,
        timestamp: Date.now()
      });
    }
  }

  private async updateSearchIndex(entity: string, updates: Array<{key: string, data: any}>): Promise<void> {
    // This would integrate with search indexing service
    console.log(`Updating search index for ${entity}:`, updates.length, 'items');
  }

  // Real-time notifications via WebSocket
  private initializeWebSocket() {
    if (typeof window === 'undefined') return; // Server-side

    try {
      // This would connect to your real-time service
      this.webSocket = new WebSocket('ws://localhost:3000/legislative-updates');
      
      this.webSocket.onopen = () => {
        console.log('Connected to real-time legislative updates');
      };

      this.webSocket.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          this.handleRealTimeUpdate(update);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };

      this.webSocket.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

    } catch (error) {
      console.warn('WebSocket connection failed:', error);
    }
  }

  private async handleRealTimeUpdate(update: any) {
    const { entity, id, type, data } = update;

    // Update cache immediately
    if (type === 'update' || type === 'create') {
      legislativeCacheManager.set(entity, id, data, 'active');
    }

    // Notify subscribers
    await this.notifyRealTimeSubscribers(entity, id, update);

    // Schedule dependent syncs if needed
    const config = this.syncConfigs.get(entity);
    if (config && config.dependencies.length > 0) {
      await this.triggerDependentSyncs(config.dependencies);
    }
  }

  private async triggerDependentSyncs(dependencies: string[]): Promise<void> {
    for (const dependency of dependencies) {
      // Add to sync queue with normal priority
      this.enqueueSyncTask(dependency);
    }
  }

  // Subscription management
  subscribeToUpdates(subscription: NotificationSubscription): () => void {
    this.notificationSubscriptions.push(subscription);
    
    return () => {
      const index = this.notificationSubscriptions.indexOf(subscription);
      if (index > -1) {
        this.notificationSubscriptions.splice(index, 1);
      }
    };
  }

  private async notifySubscribers(changeSet: ChangeSet): Promise<void> {
    const relevantSubscriptions = this.notificationSubscriptions.filter(sub => 
      sub.entityType === changeSet.entity
    );

    for (const subscription of relevantSubscriptions) {
      for (const change of changeSet.changes) {
        if (!subscription.entityId || subscription.entityId === change.id) {
          try {
            subscription.callback({
              ...change,
              entity: changeSet.entity,
              metadata: changeSet.metadata
            });
          } catch (error) {
            console.warn('Subscription callback failed:', error);
          }
        }
      }
    }
  }

  private async notifyRealTimeSubscribers(entity: string, id: string, update: any): Promise<void> {
    const relevantSubscriptions = this.notificationSubscriptions.filter(sub => 
      sub.entityType === entity && (!sub.entityId || sub.entityId === id)
    );

    for (const subscription of relevantSubscriptions) {
      try {
        subscription.callback(update);
      } catch (error) {
        console.warn('Real-time subscription callback failed:', error);
      }
    }
  }

  // Public API methods
  async forceSyncEntity(entity: string): Promise<ChangeSet | null> {
    this.enqueueSyncTask(entity, 10); // High priority
    
    // Wait for sync to complete
    return new Promise((resolve) => {
      const checkSync = () => {
        const state = this.syncStates.get(entity);
        if (state && state.status !== 'syncing') {
          resolve(state.status === 'idle' ? {} as ChangeSet : null);
        } else {
          setTimeout(checkSync, 1000);
        }
      };
      checkSync();
    });
  }

  pauseSync(entity: string): void {
    const state = this.syncStates.get(entity);
    if (state) {
      state.status = 'paused';
    }
    
    const timer = this.syncTimers.get(entity);
    if (timer) {
      clearTimeout(timer);
      this.syncTimers.delete(entity);
    }
  }

  resumeSync(entity: string): void {
    const state = this.syncStates.get(entity);
    const config = this.syncConfigs.get(entity);
    
    if (state && config) {
      state.status = 'idle';
      this.scheduleSync(entity, config.syncInterval);
    }
  }

  getSyncStatus(): Record<string, SyncState> {
    return Object.fromEntries(this.syncStates.entries());
  }

  // Utility methods
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getUsersFollowingItem(entityType: string, entityId: string): Promise<string[]> {
    // This would query user follows from your backend
    return [];
  }

  private async sendNotification(userId: string, notification: any): Promise<void> {
    // This would send push notifications or in-app notifications
    console.log(`Notifying user ${userId}:`, notification);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    // Clear all timers
    for (const timer of this.syncTimers.values()) {
      clearTimeout(timer);
    }
    this.syncTimers.clear();

    // Close WebSocket
    if (this.webSocket) {
      this.webSocket.close();
    }

    // Save final state
    this.saveSyncStates();

    // Wait for ongoing syncs to complete
    let attempts = 0;
    while (attempts < 30) { // Wait up to 30 seconds
      const activeSyncs = Array.from(this.syncStates.values())
        .filter(state => state.status === 'syncing');
      
      if (activeSyncs.length === 0) break;
      
      await this.wait(1000);
      attempts++;
    }
  }
}

// Export singleton instance
export const dataSyncManager = new DataSyncManager();
export default dataSyncManager;