'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  Users,
  Video,
  Bell,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Play,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LegislativeCalendarEvent } from '@/types/legislative-comprehensive.types';

interface InteractiveLegislativeCalendarProps {
  events: LegislativeCalendarEvent[];
  userCommitteeIds?: string[];
  className?: string;
}

interface CalendarEventCardProps {
  event: LegislativeCalendarEvent;
  isUserRelevant: boolean;
  onRegister: (eventId: string) => void;
  onSetReminder: (eventId: string) => void;
  onViewDetails: (event: LegislativeCalendarEvent) => void;
}

interface EventFilters {
  timeframe: 'week' | 'month' | 'quarter';
  chamber: 'All' | 'House' | 'Senate';
  eventType: 'All' | 'Hearing' | 'Markup' | 'Floor Vote';
  publicAccess: boolean;
  userRelevant: boolean;
}

// ========================================================================================
// CALENDAR EVENT CARD WITH CIVIC PARTICIPATION
// ========================================================================================

function CalendarEventCard({ 
  event, 
  isUserRelevant, 
  onRegister, 
  onSetReminder,
  onViewDetails 
}: CalendarEventCardProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);

  const handleRegister = () => {
    setIsRegistered(!isRegistered);
    onRegister(event.eventId);
  };

  const handleSetReminder = () => {
    setHasReminder(!hasReminder);
    onSetReminder(event.eventId);
  };

  const isUpcoming = new Date(event.date) > new Date();
  const isToday = new Date(event.date).toDateString() === new Date().toDateString();
  const isPast = new Date(event.date) < new Date() && !isToday;

  const getStatusBadge = () => {
    if (isPast) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          Completed
        </Badge>
      );
    }
    if (isToday) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <Clock className="h-3 w-3 mr-1" />
          Today
        </Badge>
      );
    }
    return (
      <Badge 
        variant={event.status === 'Scheduled' ? 'default' : 'secondary'}
        className={event.status === 'Scheduled' ? 'bg-green-100 text-green-800 border-green-300' : ''}
      >
        {event.status}
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 border-2",
      isUserRelevant ? "border-blue-200 bg-blue-50/30" : "border-gray-200",
      isPast && "opacity-75"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
              {isUserRelevant && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Relevant
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              {event.startTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{event.startTime}</span>
                  {event.endTime && <span>- {event.endTime}</span>}
                </div>
              )}
              
              {event.location.room && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location.room}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge()}
              <Badge variant="outline" className="text-xs">
                {event.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {event.chamber}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Description */}
        {event.description && (
          <p className="text-sm text-gray-700 line-clamp-3">{event.description}</p>
        )}

        {/* Bills on Agenda */}
        {event.bills.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bills on Agenda ({event.bills.length})
            </h4>
            <div className="space-y-2">
              {event.bills.slice(0, 3).map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="font-medium text-sm">{bill.billNumber}</span>
                    <p className="text-xs text-gray-600 line-clamp-1">{bill.title}</p>
                  </div>
                  <Badge 
                    variant={bill.priority === 'High' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {bill.action || bill.priority}
                  </Badge>
                </div>
              ))}
              {event.bills.length > 3 && (
                <p className="text-xs text-gray-600 text-center py-1">
                  +{event.bills.length - 3} more bills
                </p>
              )}
            </div>
          </div>
        )}

        {/* Witnesses/Speakers */}
        {event.witnesses && event.witnesses.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Speakers & Witnesses
            </h4>
            <div className="space-y-1">
              {event.witnesses.slice(0, 2).map((witness, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{witness.name}</span>
                  {witness.title && <span className="text-gray-600"> - {witness.title}</span>}
                  {witness.organization && <span className="text-gray-500"> ({witness.organization})</span>}
                </div>
              ))}
              {event.witnesses.length > 2 && (
                <p className="text-xs text-gray-600">+{event.witnesses.length - 2} more speakers</p>
              )}
            </div>
          </div>
        )}

        {/* Public Access Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 mb-2">Public Access</h4>
          
          {event.publicAccess.openToPublic ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Open to the Public</span>
              </div>
              
              {event.publicAccess.registrationRequired && (
                <div className="flex items-center gap-2 text-blue-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Registration Required</span>
                </div>
              )}
              
              {event.publicAccess.broadcastAvailable && (
                <div className="flex items-center gap-2 text-purple-700">
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Live Stream Available</span>
                </div>
              )}

              {event.publicAccess.webcastUrl && (
                <div className="flex items-center gap-2 text-blue-700">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Online Viewing Available</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Closed Session - Not Open to Public</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isUpcoming && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {event.publicAccess.openToPublic && (
                <>
                  {event.publicAccess.registrationRequired && (
                    <Button 
                      size="sm"
                      onClick={handleRegister}
                      className={cn(
                        isRegistered && "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Registered
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Register
                        </>
                      )}
                    </Button>
                  )}
                  
                  {event.publicAccess.webcastUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={event.publicAccess.webcastUrl} target="_blank" rel="noopener noreferrer">
                        <Play className="h-3 w-3 mr-1" />
                        Watch Live
                      </a>
                    </Button>
                  )}
                </>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSetReminder}
                className={cn(hasReminder && "text-blue-600")}
              >
                <Bell className={cn("h-3 w-3 mr-1", hasReminder && "fill-blue-600")} />
                {hasReminder ? 'Reminder Set' : 'Set Reminder'}
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => onViewDetails(event)}>
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
          </div>
        )}

        {/* Past Event Actions */}
        {isPast && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {event.publicAccess.archiveUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={event.publicAccess.archiveUrl} target="_blank" rel="noopener noreferrer">
                    <Video className="h-3 w-3 mr-1" />
                    Watch Archive
                  </a>
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={() => onViewDetails(event)}>
                <FileText className="h-3 w-3 mr-1" />
                View Summary
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// CALENDAR FILTER CONTROLS
// ========================================================================================

function CalendarFilters({ 
  filters, 
  onFiltersChange, 
  totalEvents, 
  filteredCount,
  className 
}: {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  totalEvents: number;
  filteredCount: number;
  className?: string;
}) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Calendar Filters
        </CardTitle>
        <div className="text-sm text-gray-600">
          Showing {filteredCount} of {totalEvents} events
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeframe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => onFiltersChange({ ...filters, timeframe: period })}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors capitalize",
                  filters.timeframe === period
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Chamber */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chamber
          </label>
          <select
            value={filters.chamber}
            onChange={(e) => onFiltersChange({ ...filters, chamber: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Chambers</option>
            <option value="House">Assembly</option>
            <option value="Senate">Senate</option>
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type
          </label>
          <select
            value={filters.eventType}
            onChange={(e) => onFiltersChange({ ...filters, eventType: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Events</option>
            <option value="Hearing">Committee Hearings</option>
            <option value="Markup">Bill Markups</option>
            <option value="Floor Vote">Floor Votes</option>
          </select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={filters.publicAccess}
              onChange={(e) => onFiltersChange({ ...filters, publicAccess: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Open to Public Only</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={filters.userRelevant}
              onChange={(e) => onFiltersChange({ ...filters, userRelevant: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Your Committees Only</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// MAIN INTERACTIVE LEGISLATIVE CALENDAR
// ========================================================================================

export default function InteractiveLegislativeCalendar({ 
  events, 
  userCommitteeIds = [],
  className 
}: InteractiveLegislativeCalendarProps) {
  const [filters, setFilters] = useState<EventFilters>({
    timeframe: 'month',
    chamber: 'All',
    eventType: 'All',
    publicAccess: false,
    userRelevant: false
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  const filteredEvents = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();
    
    // Calculate date range based on timeframe
    switch (filters.timeframe) {
      case 'week':
        cutoffDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        break;
      case 'quarter':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
        break;
    }

    return events.filter(event => {
      const eventDate = new Date(event.date);
      
      // Date range filter
      if (eventDate > cutoffDate) return false;

      // Chamber filter
      if (filters.chamber !== 'All' && event.chamber !== filters.chamber) return false;

      // Event type filter
      if (filters.eventType !== 'All' && event.type !== filters.eventType) return false;

      // Public access filter
      if (filters.publicAccess && !event.publicAccess.openToPublic) return false;

      // User relevant filter
      if (filters.userRelevant) {
        const isUserRelevant = userCommitteeIds.some(id => event.eventId.includes(id));
        if (!isUserRelevant) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, filters, userCommitteeIds]);

  const handleRegister = (eventId: string) => {
    console.log('Register for event:', eventId);
    // Handle registration logic
  };

  const handleSetReminder = (eventId: string) => {
    console.log('Set reminder for event:', eventId);
    // Handle reminder logic
  };

  const handleViewDetails = (event: LegislativeCalendarEvent) => {
    console.log('View details for event:', event.eventId);
    // Handle view details logic
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-4 gap-6", className)}>
      {/* Filter Sidebar */}
      <div className="lg:col-span-1">
        <CalendarFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalEvents={events.length}
          filteredCount={filteredEvents.length}
          className="sticky top-4"
        />
      </div>

      {/* Main Calendar Content */}
      <div className="lg:col-span-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Legislative Calendar</h2>
            <p className="text-gray-600">
              Track upcoming hearings, markups, and votes you can participate in
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Subscribe to Calendar
            </Button>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">
              No legislative events match your current filters for the selected timeframe.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setFilters({
                timeframe: 'month',
                chamber: 'All',
                eventType: 'All',
                publicAccess: false,
                userRelevant: false
              })}
            >
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event) => {
              const isUserRelevant = userCommitteeIds.some(id => 
                event.eventId.includes(id)
              );

              return (
                <CalendarEventCard
                  key={event.eventId}
                  event={event}
                  isUserRelevant={isUserRelevant}
                  onRegister={handleRegister}
                  onSetReminder={handleSetReminder}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}