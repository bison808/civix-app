'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Search, 
  Filter, 
  Vote,
  BookOpen,
  Eye,
  Download,
  ExternalLink
} from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { Badge } from '@/components/ui/badge';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import StandardPageHeader from '@/components/layout/StandardPageHeader';
import ContextualFeedbackPrompt from '@/components/feedback/ContextualFeedbackPrompt';
import StateExpansionWaitlist from '@/components/feedback/StateExpansionWaitlist';
import { VotingRecordCard, VotingRecordList } from '@/components/legislative/VotingRecordCard';
import BillCard from '@/components/bills/BillCard';
import { useAuth } from '@/contexts/AuthContext';
import { coverageDetectionService } from '@/services/coverageDetectionService';
import { useBillVotingRecords, useBillDocuments } from '@/hooks/useComprehensiveLegislative';
import { useBills } from '@/hooks/useBills';
import { billsService } from '@/services/bills.service';
import { cn } from '@/lib/utils';
import type { Bill } from '@/types/bills.types';
import type { VotingRecord, LegislativeDocument } from '@/types/legislative-comprehensive.types';

interface EnhancedBill extends Bill {
  votingRecords?: VotingRecord[];
  documents?: LegislativeDocument[];
  hasRollCallVotes?: boolean;
  hasFullText?: boolean;
  totalVotes?: number;
  passedPreviously?: boolean;
}

const ComprehensiveBillsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [locationData, setLocationData] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [enhancedBills, setEnhancedBills] = useState<EnhancedBill[]>([]);

  // Fetch bills using existing hook
  const { 
    data: bills, 
    isLoading: billsLoading, 
    error: billsError,
    refetch: refetchBills
  } = useBills();

  // Voting records for selected bill
  const {
    votingRecords,
    loading: votingLoading,
    error: votingError
  } = useBillVotingRecords(selectedBill?.id || '');

  // Documents for selected bill  
  const {
    documents,
    loading: documentsLoading,
    error: documentsError
  } = useBillDocuments(selectedBill?.id || '');

  useEffect(() => {
    const loadLocationData = async () => {
      const zipCode = typeof window !== 'undefined' ? localStorage.getItem('userZipCode') : null;
      if (zipCode) {
        try {
          const zipResponse = await fetch('/api/auth/verify-zip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zipCode })
          });
          const zipData = await zipResponse.json();
          
          if (zipData.valid) {
            const locationData = {
              city: zipData.city,
              state: zipData.state,
              county: zipData.county,
              zipCode,
              coordinates: [0, 0] as [number, number],
              districts: { congressional: 0 }
            };
            const coverage = coverageDetectionService.determineUserExperience(locationData);
            setLocationData(locationData);
            setCoverage(coverage);
          }
        } catch (error) {
          console.error('Failed to load location data:', error);
        }
      }
      setIsInitialLoading(false);
    };

    loadLocationData();
  }, []);

  // Enhance bills with comprehensive data when available
  useEffect(() => {
    const enhanceBills = async () => {
      if (!bills?.length) return;

      const enhanced: EnhancedBill[] = await Promise.all(
        bills.map(async (bill) => {
          try {
            // Check if bill has voting records (sample a few for performance)
            const votingRecords = await billsService.getBillVotingRecords(bill.id);
            const documents = await billsService.getBillDocuments(bill.id);
            
            return {
              ...bill,
              votingRecords,
              documents,
              hasRollCallVotes: votingRecords.length > 0,
              hasFullText: documents.some(doc => doc.type === 'Bill Text'),
              totalVotes: votingRecords.reduce((total, record) => total + record.totalVotes, 0),
              passedPreviously: votingRecords.some(record => record.passed)
            };
          } catch (error) {
            // Return basic bill if enhancement fails
            return { ...bill, hasRollCallVotes: false, hasFullText: false };
          }
        })
      );

      setEnhancedBills(enhanced);
    };

    if (bills?.length && showAdvancedFeatures) {
      enhanceBills();
    } else {
      setEnhancedBills(bills?.map(bill => ({ ...bill })) || []);
    }
  }, [bills, showAdvancedFeatures]);

  // Filter bills based on search and status
  const filteredBills = enhancedBills.filter(bill => {
    const matchesSearch = searchQuery === '' || 
      bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || bill.status.stage.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalBills: enhancedBills.length,
    withVotingRecords: enhancedBills.filter(b => b.hasRollCallVotes).length,
    withFullText: enhancedBills.filter(b => b.hasFullText).length,
    activeBills: enhancedBills.filter(b => ['Committee', 'House', 'Senate'].includes(b.status.stage)).length,
    passedBills: enhancedBills.filter(b => b.status.stage === 'Law').length
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bills System...</p>
        </div>
      </div>
    );
  }

  // Handle bill selection
  const handleBillSelect = (bill: Bill) => {
    setSelectedBill(bill);
  };

  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Legislative Bills"
        description="Track California legislative bills with comprehensive voting records, full text access, and representative connections."
        showLogo={true}
        logoSize="md"
      />

      {/* Comprehensive Features Toggle */}
      <Card variant="default" padding="md" className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Comprehensive Legislative Features</h3>
            <p className="text-sm text-gray-600 mt-1">
              Access voting records, full bill texts, and documents
            </p>
          </div>
          <Button
            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
            variant={showAdvancedFeatures ? "primary" : "outline"}
          >
            {showAdvancedFeatures ? "Enabled" : "Enable"} Advanced Features
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {billsLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading legislative bills...</p>
        </div>
      )}

      {/* Error State */}
      {billsError && (
        <Card variant="default" padding="lg" className="mb-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Bills</h3>
            <p className="text-gray-600 mb-4">
              There was an issue loading bill information. This may be due to API limitations or connectivity issues.
            </p>
            <Button onClick={refetchBills} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Success State - Show Bills */}
      {!billsLoading && !billsError && enhancedBills.length > 0 && (
        <>
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card variant="default" padding="md" className="text-center">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
              <p className="text-sm text-gray-600">Total Bills</p>
            </Card>
            
            <Card variant="default" padding="md" className="text-center">
              <Vote className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.withVotingRecords}</p>
              <p className="text-sm text-gray-600">With Vote Records</p>
            </Card>
            
            <Card variant="default" padding="md" className="text-center">
              <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.withFullText}</p>
              <p className="text-sm text-gray-600">Full Text Available</p>
            </Card>
            
            <Card variant="default" padding="md" className="text-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.activeBills}</p>
              <p className="text-sm text-gray-600">Active Bills</p>
            </Card>

            <Card variant="default" padding="md" className="text-center">
              <Calendar className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.passedBills}</p>
              <p className="text-sm text-gray-600">Signed into Law</p>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <Card variant="default" padding="md" className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bills by title, number, or summary..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="introduced">Introduced</option>
                  <option value="committee">In Committee</option>
                  <option value="house">House</option>
                  <option value="senate">Senate</option>
                  <option value="law">Signed into Law</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredBills.length} of {enhancedBills.length} bills
              </div>
            </div>
          </Card>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bills List */}
            <div className="lg:col-span-2">
              {filteredBills.length === 0 ? (
                <Card variant="default" padding="lg" className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bills Found</h3>
                  <p className="text-gray-600">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No bill information is currently available.'
                    }
                  </p>
                  {(searchQuery || filterStatus !== 'all') && (
                    <Button 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('all');
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredBills.map((bill) => (
                    <div 
                      key={bill.id}
                      onClick={() => handleBillSelect(bill)}
                      className={cn(
                        "cursor-pointer hover:shadow-md transition-shadow",
                        selectedBill?.id === bill.id && "ring-2 ring-blue-500"
                      )}
                    >
                      <Card variant="default" padding="md">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {bill.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{bill.billNumber}</Badge>
                              <Badge variant="outline">{bill.chamber === 'House' ? 'Assembly' : 'Senate'}</Badge>
                              <Badge 
                                variant={bill.status.stage === 'Law' ? 'default' : 'secondary'}
                                className={bill.status.stage === 'Law' ? 'bg-green-600' : ''}
                              >
                                {bill.status.stage}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mt-2 line-clamp-2">
                              {bill.summary}
                            </p>
                          </div>

                          {/* Comprehensive Features Indicators */}
                          {showAdvancedFeatures && (
                            <div className="ml-4 flex flex-col gap-2">
                              {bill.hasRollCallVotes && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Vote className="h-4 w-4" />
                                  <span className="text-xs">Votes</span>
                                </div>
                              )}
                              {bill.hasFullText && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <BookOpen className="h-4 w-4" />
                                  <span className="text-xs">Full Text</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Last Action: {new Date(bill.lastActionDate).toLocaleDateString()}
                          </div>
                          
                          {showAdvancedFeatures && bill.totalVotes && (
                            <div className="text-sm text-gray-600">
                              Total Votes: {bill.totalVotes}
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - Selected Bill Details */}
            <div className="lg:col-span-1">
              {selectedBill ? (
                <div className="space-y-6">
                  <Card variant="default" padding="md">
                    <h3 className="font-semibold text-gray-900 mb-3">Selected Bill</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedBill.billNumber}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {selectedBill.title}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status: </span>
                        <Badge variant="outline">{selectedBill.status.stage}</Badge>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">Sponsor: </span>
                        <span className="text-sm text-gray-600">{selectedBill.sponsor.name}</span>
                      </div>
                      
                      {selectedBill.committees.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Committees: </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selectedBill.committees.slice(0, 2).map((committee, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {committee}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t space-y-2">
                        <Button
                          onClick={() => router.push(`/bill/${selectedBill.id}`)}
                          variant="primary"
                          size="sm"
                          fullWidth
                        >
                          View Full Details
                        </Button>
                        
                        {showAdvancedFeatures && (
                          <>
                            {selectedBill.hasRollCallVotes && (
                              <Button variant="outline" size="sm" fullWidth>
                                <Vote className="h-4 w-4 mr-1" />
                                View Vote Records
                              </Button>
                            )}
                            
                            {selectedBill.hasFullText && (
                              <Button variant="outline" size="sm" fullWidth>
                                <Download className="h-4 w-4 mr-1" />
                                Download Full Text
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Voting Records Section */}
                  {showAdvancedFeatures && votingRecords.length > 0 && (
                    <Card variant="default" padding="md">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Vote className="h-5 w-5" />
                        Voting Records
                      </h3>
                      
                      {votingLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Loading votes...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {votingRecords.slice(0, 3).map((record, index) => (
                            <div key={index} className="border rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">
                                  {record.chamber} Vote
                                </div>
                                <Badge variant={record.passed ? 'default' : 'secondary'}>
                                  {record.passed ? 'Passed' : 'Failed'}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {record.yesVotes} Yes, {record.noVotes} No
                              </div>
                            </div>
                          ))}
                          
                          {votingRecords.length > 3 && (
                            <Button variant="ghost" size="sm" fullWidth>
                              View All {votingRecords.length} Votes
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Documents Section */}
                  {showAdvancedFeatures && documents.length > 0 && (
                    <Card variant="default" padding="md">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Bill Documents
                      </h3>
                      
                      {documentsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Loading documents...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {documents.slice(0, 4).map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex-1">
                                <div className="text-sm font-medium">{doc.type}</div>
                                <div className="text-xs text-gray-600">
                                  {new Date(doc.date).toLocaleDateString()}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          
                          {documents.length > 4 && (
                            <Button variant="ghost" size="sm" fullWidth>
                              View All {documents.length} Documents
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  )}
                  
                  <Button
                    onClick={() => setSelectedBill(null)}
                    variant="outline"
                    fullWidth
                  >
                    Clear Selection
                  </Button>
                </div>
              ) : (
                <Card variant="default" padding="md">
                  <h3 className="font-semibold text-gray-900 mb-3">Bill Information</h3>
                  <p className="text-gray-600">
                    Select a bill to view detailed information, voting records, and documents.
                  </p>
                  
                  {showAdvancedFeatures && (
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Vote className="h-4 w-4 text-green-600" />
                        <span>Voting records available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span>Full bill text access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-purple-600" />
                        <span>Document downloads</span>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/representatives')}
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              Your Representatives
            </Button>
            
            <Button
              onClick={() => router.push('/committees')}
              variant="outline"  
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Committee Hearings
            </Button>
            
            <Button
              onClick={() => router.push('/feed')}
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Legislative Feed
            </Button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!billsLoading && !billsError && enhancedBills.length === 0 && (
        <Card variant="default" padding="lg" className="text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Bills Available
            </h2>
            
            <p className="text-gray-600 mb-6">
              Bill information is currently unavailable. This may be due to API limitations or the LegiScan API key not being configured.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/representatives')}
                variant="primary"
                size="lg"
                fullWidth
              >
                View Your Representatives
              </Button>
              
              <Button
                onClick={() => router.push('/committees')}
                variant="outline"
                size="lg"
                fullWidth
              >
                View Committees
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Development Note</span>
              </div>
              <p className="text-sm text-blue-700">
                Full legislative features are available when the LegiScan API key is configured. This includes voting records, full bill texts, and comprehensive documents.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Coverage-Aware Feedback Collection */}
      {coverage && locationData && (
        <div className="mt-8">
          {coverage.type === 'federal_only' ? (
            <StateExpansionWaitlist
              state={locationData.state}
              zipCode={locationData.zipCode}
              city={locationData.city}
            />
          ) : coverage.type === 'full_coverage' ? (
            <ContextualFeedbackPrompt
              context={{
                type: 'after_full_data',
                zipCode: locationData.zipCode,
                state: locationData.state,
                page: 'bills'
              }}
            />
          ) : (
            <ContextualFeedbackPrompt
              context={{
                type: 'empty_results',
                zipCode: locationData.zipCode,
                state: locationData.state,
                page: 'bills'
              }}
            />
          )}
        </div>
      )}

      {/* General Feedback for Bills System */}
      <div className="mt-6">
        <ContextualFeedbackPrompt
          context={{
            type: 'general',
            page: 'bills'
          }}
          compact
        />
      </div>
    </StandardPageLayout>
  );
};

export default ComprehensiveBillsPage;