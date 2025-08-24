'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download,
  Search,
  Eye,
  BookOpen,
  Filter,
  Calendar,
  FileCheck,
  Archive,
  ExternalLink,
  Bookmark,
  Share,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LegislativeDocument, BillTextVersion } from '@/types/legislative-comprehensive.types';

interface DocumentAccessHubProps {
  documents: LegislativeDocument[];
  billId?: string;
  billNumber?: string;
  className?: string;
}

interface DocumentViewerProps {
  document: LegislativeDocument;
  onClose: () => void;
}

interface DocumentFilters {
  type: 'All' | 'Bill Text' | 'Amendment' | 'Analysis' | 'Fiscal Note' | 'Committee Report';
  version: 'All' | 'Introduced' | 'Amended' | 'Engrossed' | 'Enrolled';
  searchable: boolean;
  downloadable: boolean;
}

// ========================================================================================
// DOCUMENT VIEWER COMPONENT
// ========================================================================================

function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  
  const totalPages = 15; // Mock total pages

  const handleBookmark = () => {
    console.log('Bookmark document:', document.id);
  };

  const handleShare = () => {
    console.log('Share document:', document.id);
  };

  const handlePrint = () => {
    console.log('Print document:', document.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{document.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{document.type}</Badge>
              {document.version && (
                <Badge variant="secondary" className="text-xs">{document.version}</Badge>
              )}
              <span className="text-sm text-gray-500">
                {new Date(document.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBookmark}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in document..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded text-sm w-64"
              />
            </div>
            
            <Button variant="ghost" size="sm">
              <Highlighter className="h-4 w-4 mr-1" />
              Highlight
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                {currentPage} of {totalPages}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div 
            className="bg-white border border-gray-300 mx-auto shadow-lg"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              width: '8.5in',
              minHeight: '11in',
              padding: '1in'
            }}
          >
            {/* Mock Document Content */}
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-bold">{document.title}</h1>
                <p className="text-sm text-gray-600 mt-2">{document.type} - {document.version}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(document.date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-3 text-sm">
                <h2 className="text-lg font-semibold">SECTION 1. FINDINGS AND DECLARATIONS</h2>
                <p>
                  The Legislature finds and declares that the protection and preservation of the 
                  environment and natural resources of the state are fundamental governmental 
                  responsibilities that require immediate action.
                </p>
                
                <h2 className="text-lg font-semibold">SECTION 2. DEFINITIONS</h2>
                <p>
                  For purposes of this act, the following definitions shall apply:
                </p>
                <div className="ml-4">
                  <p>(a) "Environmental protection" means the preservation, enhancement, and 
                  restoration of the natural environment.</p>
                  <p>(b) "Natural resources" includes, but is not limited to, air, water, land, 
                  minerals, forests, fish, and wildlife.</p>
                </div>
                
                <h2 className="text-lg font-semibold">SECTION 3. IMPLEMENTATION</h2>
                <p>
                  The provisions of this act shall be implemented through regulations adopted 
                  by the appropriate state agencies, in consultation with affected stakeholders 
                  and the general public.
                </p>
                
                {/* Search highlights would be implemented here */}
                {searchTerm && (
                  <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Search Results:</strong> Found {Math.floor(Math.random() * 5) + 1} matches for "{searchTerm}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Document ID: {document.id} • Size: {document.size} • Language: {document.language || 'English'}
          </div>
          <div className="flex items-center gap-2">
            {document.downloadable && (
              <Button size="sm" onClick={() => {
                const a = window.document.createElement('a');
                a.href = document.url;
                a.download = '';
                a.click();
              }}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.open(document.url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Open Original
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================================================================
// DOCUMENT CARD COMPONENT
// ========================================================================================

function DocumentCard({ 
  document, 
  onView,
  onDownload 
}: { 
  document: LegislativeDocument;
  onView: (doc: LegislativeDocument) => void;
  onDownload: (doc: LegislativeDocument) => void;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bill Text': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'Amendment': return <FileCheck className="h-5 w-5 text-green-600" />;
      case 'Analysis': return <BookOpen className="h-5 w-5 text-purple-600" />;
      case 'Fiscal Note': return <Archive className="h-5 w-5 text-orange-600" />;
      case 'Committee Report': return <MessageSquare className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    if (document.version === 'Enrolled') {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Final</Badge>;
    }
    if (document.version === 'Introduced') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Original</Badge>;
    }
    if (document.version === 'Amended') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Updated</Badge>;
    }
    return <Badge variant="outline">{document.version}</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon(document.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                  {document.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{document.type}</Badge>
                  {document.version && getStatusBadge()}
                  {document.searchable && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                      <Search className="h-3 w-3 mr-1" />
                      Searchable
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(document.date).toLocaleDateString()}</span>
                  </div>
                  
                  {document.size && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{document.size}</span>
                    </div>
                  )}
                  
                  {document.pages && (
                    <span>{document.pages} page{document.pages !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
            
            {document.summary && (
              <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                {document.summary}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => onView(document)}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                
                {document.downloadable && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDownload(document)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" onClick={() => window.open(document.url, '_blank')}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  External
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {document.language && document.language !== 'English' && (
                  <Badge variant="secondary" className="text-xs">
                    {document.language}
                  </Badge>
                )}
                
                {document.format && (
                  <Badge variant="outline" className="text-xs">
                    {document.format.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// MAIN DOCUMENT ACCESS HUB
// ========================================================================================

export default function DocumentAccessHub({ 
  documents, 
  billId,
  billNumber,
  className 
}: DocumentAccessHubProps) {
  const [filters, setFilters] = useState<DocumentFilters>({
    type: 'All',
    version: 'All',
    searchable: false,
    downloadable: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDocument, setViewingDocument] = useState<LegislativeDocument | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'name'>('date');

  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      // Type filter
      if (filters.type !== 'All' && doc.type !== filters.type) return false;
      
      // Version filter
      if (filters.version !== 'All' && doc.version !== filters.version) return false;
      
      // Searchable filter
      if (filters.searchable && !doc.searchable) return false;
      
      // Downloadable filter
      if (filters.downloadable && !doc.downloadable) return false;
      
      // Search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return doc.title.toLowerCase().includes(search) ||
               (doc.summary && doc.summary.toLowerCase().includes(search));
      }
      
      return true;
    });

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, filters, searchTerm, sortBy]);

  const handleView = (document: LegislativeDocument) => {
    setViewingDocument(document);
  };

  const handleDownload = (document: LegislativeDocument) => {
    console.log('Download document:', document.id);
    // Handle download logic
  };

  const documentTypes = useMemo(() => {
    const types = new Set(documents.map(doc => doc.type));
    return Array.from(types);
  }, [documents]);

  const documentVersions = useMemo(() => {
    const versions = new Set(documents.map(doc => doc.version).filter(Boolean));
    return Array.from(versions);
  }, [documents]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Document Library
            {billNumber && <span className="ml-2 text-blue-600">({billNumber})</span>}
          </h2>
          <p className="text-gray-600">
            Access all versions, analyses, and related documents
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="type">Sort by Type</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="All">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Version Filter */}
            <div>
              <select
                value={filters.version}
                onChange={(e) => setFilters({ ...filters, version: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="All">All Versions</option>
                {documentVersions.map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Checkbox Filters */}
          <div className="flex items-center gap-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.searchable}
                onChange={(e) => setFilters({ ...filters, searchable: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Full-Text Searchable Only</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.downloadable}
                onChange={(e) => setFilters({ ...filters, downloadable: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Downloadable Only</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {filteredDocuments.length} of {documents.length} documents
            </span>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilters({
                type: 'All',
                version: 'All',
                searchable: false,
                downloadable: false
              })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-600 mb-4">
            No documents match your current search criteria.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleView}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
}