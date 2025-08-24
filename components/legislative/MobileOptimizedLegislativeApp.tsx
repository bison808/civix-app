'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Menu,
  X,
  Search,
  Filter,
  Calendar,
  Users,
  FileText,
  Building,
  ChevronRight,
  ChevronDown,
  Star,
  Bell,
  Settings,
  Eye,
  Bookmark,
  Share,
  Download,
  ExternalLink,
  ArrowUp,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MobileOptimizedLegislativeAppProps {
  children?: React.ReactNode;
  className?: string;
}

interface MobileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

// ========================================================================================
// MOBILE NAVIGATION COMPONENT
// ========================================================================================

function MobileNavigation({ activeSection, onSectionChange }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'bills', label: 'Bills', icon: <FileText className="h-5 w-5" /> },
    { id: 'committees', label: 'Committees', icon: <Building className="h-5 w-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5" /> },
    { id: 'representatives', label: 'Reps', icon: <Users className="h-5 w-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="h-5 w-5" /> }
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-lg text-gray-900">CITZN</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="h-5 w-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Side Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="w-80 max-w-full bg-white h-full shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">Navigation</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="p-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                    activeSection === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 h-16">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                activeSection === item.id
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

// ========================================================================================
// SWIPEABLE CARD COMPONENT
// ========================================================================================

function SwipeableCard({ children, onSwipeLeft, onSwipeRight, className }: SwipeableCardProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 100;

    if (deltaX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (deltaX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setIsDragging(false);
    setCurrentX(0);
    setStartX(0);
  };

  const transform = isDragging ? `translateX(${currentX - startX}px)` : '';

  return (
    <div
      className={cn("transition-transform", className)}
      style={{ transform }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// ========================================================================================
// COLLAPSIBLE SECTION COMPONENT
// ========================================================================================

function CollapsibleSection({ 
  title, 
  icon, 
  badge, 
  children, 
  defaultExpanded = false,
  className 
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn("border border-gray-200 rounded-lg", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ========================================================================================
// MOBILE-OPTIMIZED BILL CARD
// ========================================================================================

function MobileBillCard({ bill }: { bill: any }) {
  const [showActions, setShowActions] = useState(false);

  const handleBookmark = () => {
    console.log('Bookmark bill:', bill.id);
    setShowActions(false);
  };

  const handleShare = () => {
    console.log('Share bill:', bill.id);
    setShowActions(false);
  };

  const handleViewDetails = () => {
    console.log('View bill details:', bill.id);
  };

  return (
    <SwipeableCard
      onSwipeLeft={() => setShowActions(true)}
      onSwipeRight={() => setShowActions(false)}
    >
      <Card className="relative overflow-hidden">
        {/* Quick Actions Overlay */}
        {showActions && (
          <div className="absolute inset-y-0 right-0 w-32 bg-blue-600 flex items-center justify-center z-10">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleBookmark}
                className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full text-white"
              >
                <Bookmark className="h-5 w-5" />
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full text-white"
              >
                <Share className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                  {bill.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {bill.billNumber}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {bill.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {bill.summary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {bill.subjects?.slice(0, 2).map((subject: string) => (
                <Badge key={subject} variant="outline" className="text-xs">
                  {subject}
                </Badge>
              ))}
              {bill.subjects?.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{bill.subjects.length - 2}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-gray-500">
                {bill.lastActionDate}
              </span>
              <Button size="sm" variant="ghost" onClick={handleViewDetails}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SwipeableCard>
  );
}

// ========================================================================================
// MOBILE-OPTIMIZED SEARCH BAR
// ========================================================================================

function MobileSearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Search bills, representatives..."
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
        >
          <Filter className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Quick Filters */}
      {isExpanded && (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Bills', 'Representatives', 'Committees'].map((filter) => (
              <button
                key={filter}
                className="flex-shrink-0 px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {filter}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={() => onSearch(query)}
            className="w-full"
            size="sm"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      )}
    </div>
  );
}

// ========================================================================================
// MAIN MOBILE-OPTIMIZED APP
// ========================================================================================

export default function MobileOptimizedLegislativeApp({ 
  children,
  className 
}: MobileOptimizedLegislativeAppProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Mock data
  const mockBills = [
    {
      id: '1',
      title: 'California Climate Action and Clean Energy Jobs Act',
      billNumber: 'AB 123',
      status: 'Committee',
      summary: 'Establishes comprehensive climate action framework and creates clean energy jobs program.',
      subjects: ['Environment', 'Energy', 'Jobs'],
      lastActionDate: '2025-08-20'
    },
    {
      id: '2',
      title: 'Housing Affordability and First-Time Buyer Assistance',
      billNumber: 'SB 456',
      status: 'Floor Vote',
      summary: 'Provides assistance to first-time homebuyers and increases housing development incentives.',
      subjects: ['Housing', 'Economic Development'],
      lastActionDate: '2025-08-19'
    }
  ];

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Mobile Navigation */}
      <MobileNavigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4 space-y-6">
        {/* Search Bar */}
        <MobileSearchBar onSearch={handleSearch} />

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Bills Tracked</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">Upcoming Hearings</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <CollapsibleSection
              title="Recent Activity"
              icon={<TrendingUp className="h-5 w-5" />}
              badge="3 new"
              defaultExpanded
            >
              <div className="space-y-3">
                {mockBills.map((bill) => (
                  <MobileBillCard key={bill.id} bill={bill} />
                ))}
              </div>
            </CollapsibleSection>

            {/* Your Committees */}
            <CollapsibleSection
              title="Your Committees"
              icon={<Building className="h-5 w-5" />}
              badge="2"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Environmental Quality</div>
                    <div className="text-xs text-gray-600">Assembly Committee</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Housing & Community Development</div>
                    <div className="text-xs text-gray-600">Assembly Committee</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CollapsibleSection>

            {/* Upcoming Events */}
            <CollapsibleSection
              title="Upcoming Events"
              icon={<Calendar className="h-5 w-5" />}
              badge="Next: Tomorrow"
            >
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                  <div className="font-medium text-sm">Committee Hearing</div>
                  <div className="text-xs text-gray-600">Environmental Quality - Tomorrow 2:00 PM</div>
                  <div className="text-xs text-blue-600 mt-1">AB 123 on agenda</div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Bills Section */}
        {activeSection === 'bills' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Legislative Bills</h2>
            {mockBills.map((bill) => (
              <MobileBillCard key={bill.id} bill={bill} />
            ))}
          </div>
        )}

        {/* Other sections would be implemented similarly */}
        {activeSection === 'committees' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Committees</h2>
            <Card>
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Committee features optimized for mobile coming soon.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-30 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}