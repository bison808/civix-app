'use client';

import { useState } from 'react';
import { Users, Mail, Phone, ExternalLink, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Representative } from '@/types';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface RepresentativeConnectionProps {
  representatives: Representative[];
  billId: string;
  billTitle: string;
  onContactRep?: (rep: Representative) => void;
  className?: string;
}

export default function RepresentativeConnection({ 
  representatives, 
  billId, 
  billTitle,
  onContactRep,
  className 
}: RepresentativeConnectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showingCount, setShowingCount] = useState(2);

  const handleContactRep = (rep: Representative) => {
    if (onContactRep) {
      onContactRep(rep);
    }
  };

  const visibleReps = isExpanded ? representatives : representatives.slice(0, showingCount);
  const hasMoreReps = representatives.length > showingCount;

  if (representatives.length === 0) {
    return (
      <Card variant="outlined" padding="sm" className={className}>
        <div className="text-center py-4">
          <Users size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            No representatives found for this bill
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users size={20} />
          Your Representatives ({representatives.length})
        </h4>
        {hasMoreReps && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-delta hover:text-delta/80"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp size={16} /></>
            ) : (
              <>Show All <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visibleReps.map((rep) => (
          <div key={rep.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-delta/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-delta">
                      {rep.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{rep.name}</h5>
                    <p className="text-sm text-gray-600">{rep.title} • {rep.party}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    {rep.district || rep.state}
                  </div>
                  {rep.committees && rep.committees.length > 0 && (
                    <div>
                      Committees: {rep.committees.map(c => c.name).join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {rep.contactInfo?.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactRep(rep)}
                      className="flex items-center gap-1"
                    >
                      <Mail size={14} />
                      Email
                    </Button>
                  )}
                  {rep.contactInfo?.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${rep.contactInfo?.phone}`, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Phone size={14} />
                      Call
                    </Button>
                  )}
                  {rep.contactInfo?.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(rep.contactInfo.website!, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink size={14} />
                      Website
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Vote Position (if available) */}
              {rep.votePosition && (
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  rep.votePosition === 'yes' && "bg-green-100 text-green-800",
                  rep.votePosition === 'no' && "bg-red-100 text-red-800",
                  rep.votePosition === 'abstain' && "bg-gray-100 text-gray-800"
                )}>
                  {rep.votePosition.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {representatives.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Contact your representatives about this bill:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>"{billTitle}"</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Let them know your position and ask questions about their stance.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}