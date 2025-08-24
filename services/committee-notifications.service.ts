import { CommitteeActivity, Committee, CommitteeMeeting } from '@/types/committee.types';

export interface CommitteeNotification {
  id: string;
  type: 'meeting_scheduled' | 'meeting_starting' | 'bill_referred' | 'vote_scheduled' | 'markup_scheduled';
  title: string;
  message: string;
  committeeId: string;
  committeeName: string;
  relatedItemId?: string; // Meeting ID, Bill ID, etc.
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledTime?: string; // When the notification should be sent
  createdAt: string;
  isRead: boolean;
  actionUrl?: string; // Deep link to relevant page
}

export interface NotificationPreferences {
  committeeNotifications: {
    enabled: boolean;
    meetingReminders: boolean;
    billUpdates: boolean;
    voteAlerts: boolean;
    leadTimeMinutes: number; // How many minutes before meeting to notify
  };
  deliveryMethods: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // e.g., "22:00"
    endTime: string; // e.g., "07:00"
  };
}

class CommitteeNotificationService {
  private notifications: CommitteeNotification[] = [];
  private preferences: NotificationPreferences;

  constructor() {
    // Default notification preferences
    this.preferences = {
      committeeNotifications: {
        enabled: true,
        meetingReminders: true,
        billUpdates: true,
        voteAlerts: true,
        leadTimeMinutes: 60 // 1 hour before meeting
      },
      deliveryMethods: {
        inApp: true,
        email: false,
        push: false
      },
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "07:00"
      }
    };

    this.loadPreferences();
    this.loadNotifications();
  }

  // Load user preferences from localStorage (client-side only)
  private loadPreferences(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      const saved = localStorage.getItem('committee_notification_preferences');
      if (saved) {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
  }

  // Save preferences to localStorage (client-side only)
  private savePreferences(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      localStorage.setItem('committee_notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }

  // Load notifications from localStorage (client-side only)
  private loadNotifications(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      const saved = localStorage.getItem('committee_notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
        // Remove old notifications (older than 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        this.notifications = this.notifications.filter(n => 
          new Date(n.createdAt) > weekAgo
        );
        this.saveNotifications();
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  }

  // Save notifications to localStorage (client-side only)
  private saveNotifications(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      localStorage.setItem('committee_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.warn('Failed to save notifications:', error);
    }
  }

  // Get all notifications
  getNotifications(limit?: number): CommitteeNotification[] {
    const sorted = this.notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // Get unread notifications
  getUnreadNotifications(): CommitteeNotification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.saveNotifications();
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  // Create notification from committee meeting
  createMeetingNotification(meeting: CommitteeMeeting, type: 'meeting_scheduled' | 'meeting_starting'): void {
    if (!this.preferences.committeeNotifications.enabled || 
        !this.preferences.committeeNotifications.meetingReminders) {
      return;
    }

    const notification: CommitteeNotification = {
      id: `${type}_${meeting.id}_${Date.now()}`,
      type,
      title: type === 'meeting_scheduled' 
        ? 'Committee Meeting Scheduled'
        : 'Committee Meeting Starting Soon',
      message: type === 'meeting_scheduled'
        ? `${meeting.committeeName} has scheduled a ${meeting.type.toLowerCase()}: ${meeting.title}`
        : `${meeting.committeeName} meeting "${meeting.title}" starts in ${this.preferences.committeeNotifications.leadTimeMinutes} minutes`,
      committeeId: meeting.committeeId,
      committeeName: meeting.committeeName,
      relatedItemId: meeting.id,
      priority: this.determinePriority(meeting, type),
      scheduledTime: type === 'meeting_starting' 
        ? new Date(new Date(meeting.date).getTime() - this.preferences.committeeNotifications.leadTimeMinutes * 60000).toISOString()
        : undefined,
      createdAt: new Date().toISOString(),
      isRead: false,
      actionUrl: `/committees/${meeting.committeeId}/meetings/${meeting.id}`
    };

    this.addNotification(notification);
  }

  // Create notification from committee activity
  createActivityNotification(activity: CommitteeActivity): void {
    if (!this.preferences.committeeNotifications.enabled) return;

    let shouldNotify = false;
    switch (activity.type) {
      case 'Bill Referred':
        shouldNotify = this.preferences.committeeNotifications.billUpdates;
        break;
      case 'Vote Held':
        shouldNotify = this.preferences.committeeNotifications.voteAlerts;
        break;
      default:
        shouldNotify = true;
    }

    if (!shouldNotify) return;

    const notification: CommitteeNotification = {
      id: `activity_${activity.id}_${Date.now()}`,
      type: this.mapActivityTypeToNotificationType(activity.type),
      title: activity.title,
      message: `${activity.committeeName}: ${activity.description}`,
      committeeId: activity.committeeId,
      committeeName: activity.committeeName,
      relatedItemId: activity.relatedBillId || activity.relatedMeetingId,
      priority: this.mapImportanceToPriority(activity.importance),
      createdAt: new Date().toISOString(),
      isRead: false,
      actionUrl: activity.relatedBillId 
        ? `/bill/${activity.relatedBillId}`
        : `/committees/${activity.committeeId}`
    };

    this.addNotification(notification);
  }

  // Add notification and handle delivery
  private addNotification(notification: CommitteeNotification): void {
    // Check quiet hours
    if (this.isQuietHours()) {
      // Schedule notification for later
      notification.scheduledTime = this.getNextActiveTime().toISOString();
    }

    this.notifications.push(notification);
    this.saveNotifications();

    // Trigger delivery based on preferences
    this.deliverNotification(notification);
  }

  // Deliver notification through enabled channels
  private deliverNotification(notification: CommitteeNotification): void {
    if (this.preferences.deliveryMethods.inApp) {
      this.showInAppNotification(notification);
    }

    if (this.preferences.deliveryMethods.push && 'serviceWorker' in navigator) {
      this.showPushNotification(notification);
    }

    // Email would require server-side implementation
    if (this.preferences.deliveryMethods.email) {
      console.log('Email notification would be sent:', notification);
    }
  }

  // Show in-app notification (browser notification API)
  private showInAppNotification(notification: CommitteeNotification): void {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/citzn-logo-new.webp',
        badge: '/citzn-logo-new.webp',
        tag: notification.id,
        data: {
          url: notification.actionUrl
        }
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showInAppNotification(notification);
        }
      });
    }
  }

  // Show push notification via service worker
  private showPushNotification(notification: CommitteeNotification): void {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/citzn-logo-new.webp',
        badge: '/citzn-logo-new.webp',
        tag: notification.id,
        data: {
          url: notification.actionUrl
        }
      });
    });
  }

  // Check if current time is within quiet hours
  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.preferences.quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Get next time outside of quiet hours
  private getNextActiveTime(): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [endHour, endMin] = this.preferences.quietHours.endTime.split(':').map(Number);
    const nextActive = new Date(now);
    nextActive.setHours(endHour, endMin, 0, 0);
    
    if (nextActive <= now) {
      nextActive.setDate(nextActive.getDate() + 1);
    }
    
    return nextActive;
  }

  // Determine notification priority based on meeting and type
  private determinePriority(meeting: CommitteeMeeting, type: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (type === 'meeting_starting') return 'high';
    if (meeting.type === 'Markup' || meeting.bills?.length) return 'medium';
    return 'low';
  }

  // Map activity type to notification type
  private mapActivityTypeToNotificationType(activityType: string): CommitteeNotification['type'] {
    switch (activityType) {
      case 'Bill Referred': return 'bill_referred';
      case 'Vote Held': return 'vote_scheduled';
      case 'Meeting Scheduled': return 'meeting_scheduled';
      default: return 'meeting_scheduled';
    }
  }

  // Map activity importance to notification priority
  private mapImportanceToPriority(importance: 'Low' | 'Medium' | 'High'): 'low' | 'medium' | 'high' | 'urgent' {
    switch (importance) {
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'medium';
    }
  }

  // Get user preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Update user preferences
  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
  }

  // Schedule notifications for upcoming meetings
  async scheduleUpcomingMeetingNotifications(meetings: CommitteeMeeting[]): Promise<void> {
    for (const meeting of meetings) {
      if (meeting.status !== 'Scheduled') continue;
      
      const meetingTime = new Date(meeting.date);
      const notificationTime = new Date(
        meetingTime.getTime() - this.preferences.committeeNotifications.leadTimeMinutes * 60000
      );
      
      // Only schedule if notification time is in the future
      if (notificationTime > new Date()) {
        // In a real implementation, this would use a job scheduler or server-side cron
        setTimeout(() => {
          this.createMeetingNotification(meeting, 'meeting_starting');
        }, notificationTime.getTime() - Date.now());
      }
    }
  }
}

export const committeeNotificationService = new CommitteeNotificationService();
export default committeeNotificationService;