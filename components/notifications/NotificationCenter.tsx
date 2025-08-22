'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell,
  BellRing,
  AlertCircle,
  CheckCircle,
  Clock,
  Vote,
  Users,
  Calendar,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Star,
  Archive,
  Trash2,
  ExternalLink
} from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
}

interface Notification {
  id: string;
  type: 'bill_update' | 'vote_scheduled' | 'bill_passed' | 'representative_action' | 'system' | 'educational';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  billId?: string;
  representativeId?: string;
  metadata?: {
    billNumber?: string;
    voteDate?: string;
    chamber?: string;
    status?: string;
  };
}

interface NotificationSettings {
  billUpdates: boolean;
  voteAlerts: boolean;
  representativeActions: boolean;
  weeklyDigest: boolean;
  importantOnly: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    billUpdates: true,
    voteAlerts: true,
    representativeActions: true,
    weeklyDigest: true,
    importantOnly: false,
    emailNotifications: true,
    pushNotifications: true
  });

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'vote_scheduled',
        title: 'Important Vote Tomorrow',
        message: 'H.R. 1234 Healthcare Access Act is scheduled for a floor vote tomorrow at 2:00 PM EST.',
        timestamp: '2025-01-22T14:30:00Z',
        isRead: false,
        isImportant: true,
        actionUrl: '/bill/hr-1234',
        billId: 'hr-1234',
        metadata: {
          billNumber: 'H.R. 1234',
          voteDate: '2025-01-23T19:00:00Z',
          chamber: 'House'
        }
      },
      {
        id: '2',
        type: 'bill_update',
        title: 'Bill Status Change',
        message: 'S. 567 Climate Action Bill has moved from committee to floor consideration.',
        timestamp: '2025-01-22T10:15:00Z',
        isRead: false,
        isImportant: false,
        actionUrl: '/bill/s-567',
        billId: 's-567',
        metadata: {
          billNumber: 'S. 567',
          status: 'Floor Consideration',
          chamber: 'Senate'
        }
      },
      {
        id: '3',
        type: 'representative_action',
        title: 'Your Representative Voted',
        message: 'Rep. Jane Smith voted YES on H.R. 999 Infrastructure Investment Act.',
        timestamp: '2025-01-21T16:45:00Z',
        isRead: true,
        isImportant: false,
        representativeId: 'jane-smith',
        metadata: {
          billNumber: 'H.R. 999'
        }
      },
      {
        id: '4',
        type: 'bill_passed',
        title: 'Bill Passed!',
        message: 'Great news! H.R. 888 Student Loan Relief Act has passed the House and moves to the Senate.',
        timestamp: '2025-01-21T11:30:00Z',
        isRead: true,
        isImportant: true,
        actionUrl: '/bill/hr-888',
        billId: 'hr-888',
        metadata: {
          billNumber: 'H.R. 888',
          chamber: 'House',
          status: 'Passed'
        }
      },
      {
        id: '5',
        type: 'educational',
        title: 'New Learning Resource',
        message: 'Check out our new guide: "Understanding Committee Markup Process"',
        timestamp: '2025-01-20T09:00:00Z',
        isRead: true,
        isImportant: false,
        actionUrl: '/education/committee-markup'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'vote_scheduled': return Vote;
      case 'bill_update': return Clock;
      case 'bill_passed': return CheckCircle;
      case 'representative_action': return Users;
      case 'educational': return Star;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type'], isImportant: boolean) => {
    if (isImportant) return 'text-red-600 bg-red-50';
    
    switch (type) {
      case 'vote_scheduled': return 'text-orange-600 bg-orange-50';
      case 'bill_update': return 'text-blue-600 bg-blue-50';
      case 'bill_passed': return 'text-green-600 bg-green-50';
      case 'representative_action': return 'text-purple-600 bg-purple-50';
      case 'educational': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'important': return notification.isImportant;
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={24} className="text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              {importantCount > 0 && ` • ${importantCount} important`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-500" />
        {(['all', 'unread', 'important'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-all capitalize",
              filter === filterOption
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {filterOption}
            {filterOption === 'unread' && unreadCount > 0 && (
              <span className="ml-1">({unreadCount})</span>
            )}
            {filterOption === 'important' && importantCount > 0 && (
              <span className="ml-1">({importantCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card variant="default" padding="md" className="border-l-4 border-l-blue-400">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notification Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Content Types</h4>
                {[
                  { key: 'billUpdates', label: 'Bill status updates', icon: Clock },
                  { key: 'voteAlerts', label: 'Upcoming votes', icon: Vote },
                  { key: 'representativeActions', label: 'Representative actions', icon: Users },
                  { key: 'weeklyDigest', label: 'Weekly summary', icon: Calendar }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings[key as keyof NotificationSettings] as boolean}
                      onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Icon size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Delivery Options</h4>
                {[
                  { key: 'importantOnly', label: 'Important notifications only' },
                  { key: 'emailNotifications', label: 'Email notifications' },
                  { key: 'pushNotifications', label: 'Push notifications' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings[key as keyof NotificationSettings] as boolean}
                      onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'important' ? 'No important notifications' : 
               'No notifications'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' ? "You're all caught up!" : 
               filter === 'important' ? "No urgent items right now." : 
               "We'll notify you when something important happens."}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClasses = getNotificationColor(notification.type, notification.isImportant);
            
            return (
              <Card 
                key={notification.id}
                variant="default" 
                padding="md"
                className={cn(
                  "transition-all cursor-pointer hover:shadow-sm",
                  !notification.isRead && "border-l-4 border-l-blue-400 bg-blue-50/30",
                  notification.isImportant && "ring-1 ring-red-200"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn("p-2 rounded-lg flex-shrink-0", colorClasses)}>
                    <Icon size={20} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={cn(
                        "font-medium text-gray-900",
                        !notification.isRead && "font-semibold"
                      )}>
                        {notification.title}
                        {notification.isImportant && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Important
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <p className={cn(
                      "text-sm text-gray-600 mb-2",
                      !notification.isRead && "text-gray-800"
                    )}>
                      {notification.message}
                    </p>
                    
                    {/* Metadata */}
                    {notification.metadata && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        {notification.metadata.billNumber && (
                          <span className="font-medium">{notification.metadata.billNumber}</span>
                        )}
                        {notification.metadata.chamber && (
                          <span>{notification.metadata.chamber}</span>
                        )}
                        {notification.metadata.voteDate && (
                          <span>Vote: {new Date(notification.metadata.voteDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Action */}
                    {notification.actionUrl && (
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        View Details
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                  
                  {/* Read indicator */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}