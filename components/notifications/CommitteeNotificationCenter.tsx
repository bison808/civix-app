'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CommitteeNotification, 
  NotificationPreferences 
} from '@/services/committee-notifications.service';
import committeeNotificationService from '@/services/committee-notifications.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BellIcon, 
  CalendarIcon, 
  FileTextIcon,
  VoteIcon,
  BuildingIcon,
  XIcon,
  SettingsIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon
} from 'lucide-react';

interface CommitteeNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommitteeNotificationCenter({ 
  isOpen, 
  onClose 
}: CommitteeNotificationCenterProps) {
  const [notifications, setNotifications] = useState<CommitteeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
    
    // Set up polling for new notifications
    const interval = setInterval(loadNotifications, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const allNotifications = committeeNotificationService.getNotifications(50);
    const unread = committeeNotificationService.getUnreadNotifications();
    
    setNotifications(allNotifications);
    setUnreadCount(unread.length);
  };

  const loadPreferences = () => {
    const prefs = committeeNotificationService.getPreferences();
    setPreferences(prefs);
  };

  const handleMarkAsRead = (notificationId: string) => {
    committeeNotificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    committeeNotificationService.markAllAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (notificationId: string) => {
    committeeNotificationService.deleteNotification(notificationId);
    loadNotifications();
  };

  const handleClearAll = () => {
    committeeNotificationService.clearAllNotifications();
    loadNotifications();
  };

  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    if (preferences) {
      const updatedPrefs = { ...preferences, ...newPrefs };
      committeeNotificationService.updatePreferences(updatedPrefs);
      setPreferences(updatedPrefs);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                                onClick={() => setShowSettings(!showSettings)}
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                                onClick={onClose}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                                    onClick={handleMarkAllAsRead}
                >
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                                onClick={handleClearAll}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && preferences && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.committeeNotifications.enabled}
                  onChange={(e) => updatePreferences({
                    committeeNotifications: {
                      ...preferences.committeeNotifications,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm">Enable committee notifications</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.committeeNotifications.meetingReminders}
                  onChange={(e) => updatePreferences({
                    committeeNotifications: {
                      ...preferences.committeeNotifications,
                      meetingReminders: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm">Meeting reminders</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.committeeNotifications.billUpdates}
                  onChange={(e) => updatePreferences({
                    committeeNotifications: {
                      ...preferences.committeeNotifications,
                      billUpdates: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm">Bill updates</span>
              </label>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">Remind me</span>
                <select
                  value={preferences.committeeNotifications.leadTimeMinutes}
                  onChange={(e) => updatePreferences({
                    committeeNotifications: {
                      ...preferences.committeeNotifications,
                      leadTimeMinutes: parseInt(e.target.value)
                    }
                  })}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
                <span className="text-sm">before meetings</span>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">
                Committee updates and meeting reminders will appear here.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                  onClick={onClose}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Individual Notification Item Component
interface NotificationItemProps {
  notification: CommitteeNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onClick 
}: NotificationItemProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'meeting_scheduled':
      case 'meeting_starting':
        return <CalendarIcon className="h-4 w-4" />;
      case 'bill_referred':
        return <FileTextIcon className="h-4 w-4" />;
      case 'vote_scheduled':
        return <VoteIcon className="h-4 w-4" />;
      case 'markup_scheduled':
        return <BuildingIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-blue-600 bg-blue-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the relevant page
      window.location.href = notification.actionUrl;
    }
    
    onClick();
  };

  return (
    <div
      className={`p-3 mb-2 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
        notification.isRead 
          ? 'bg-white border-gray-200' 
          : 'bg-blue-50 border-blue-200'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        
        {/* Icon */}
        <div className={`p-2 rounded-full ${getPriorityColor()}`}>
          {getNotificationIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className={`text-sm font-medium ${
              notification.isRead ? 'text-gray-900' : 'text-blue-900'
            }`}>
              {notification.title}
            </h4>
            
            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
              {notification.priority === 'urgent' && (
                <Badge variant="destructive">Urgent</Badge>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <XIcon className="h-3 w-3 text-gray-400" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{notification.committeeName}</span>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3" />
              <span>{formatTime(notification.createdAt)}</span>
            </div>
          </div>
          
          {notification.actionUrl && (
            <div className="mt-2">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLinkIcon className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          )}
        </div>
        
        {/* Unread Indicator */}
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
}

export default CommitteeNotificationCenter;