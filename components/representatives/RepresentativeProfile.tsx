import React from 'react';
import { MapPin, Calendar, Users, TrendingUp, Award, Briefcase, GraduationCap } from 'lucide-react';
import Card from '@/components/core/Card';
import { Representative } from '@/types';
import { cn } from '@/lib/utils';

interface RepresentativeProfileProps {
  representative: Representative;
  feedbackStats: {
    approval: number;
    disapproval: number;
    totalFeedback: number;
    responsiveness: number;
    responseTime: string;
  };
}

export default function RepresentativeProfile({ 
  representative, 
  feedbackStats 
}: RepresentativeProfileProps) {
  const getPartyFullName = (party: string) => {
    switch(party) {
      case 'D': return 'Democrat';
      case 'R': return 'Republican';
      case 'I': return 'Independent';
      default: return party;
    }
  };

  const getPartyColor = (party: string) => {
    switch(party) {
      case 'D': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'R': return 'bg-red-100 text-red-800 border-red-200';
      case 'I': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'federal': return '🏛️';
      case 'state': return '🏢';
      case 'local': return '🏘️';
      default: return '🏛️';
    }
  };

  return (
    <Card variant="default" padding="lg">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          {representative.photoUrl ? (
            <img 
              src={representative.photoUrl} 
              alt={representative.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-2xl font-bold text-gray-600">
                {representative.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{representative.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{representative.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border',
                    getPartyColor(representative.party)
                  )}>
                    {getPartyFullName(representative.party)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <span>{getLevelIcon(representative.chamber.toLowerCase())}</span>
                    <span className="capitalize">{representative.chamber.toLowerCase()} Level</span>
                  </span>
                </div>
              </div>
              
              {/* Alignment Score Badge */}
              {representative.scorecard?.overallScore && (
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-700">
                    {representative.scorecard?.overallScore}%
                  </div>
                  <div className="text-xs text-blue-600 font-medium">Alignment</div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-700">
                  {feedbackStats.approval}%
                </div>
                <div className="text-xs text-green-600">Approval</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-700">
                  {feedbackStats.responsiveness}%
                </div>
                <div className="text-xs text-purple-600">Response Rate</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-700">
                  {feedbackStats.responseTime}
                </div>
                <div className="text-xs text-blue-600">Avg Response</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-700">
                  {feedbackStats.totalFeedback}
                </div>
                <div className="text-xs text-orange-600">Feedbacks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {representative.district && (
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-400" size={16} />
              <span className="text-sm text-gray-600">District {representative.district}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={16} />
            <span className="text-sm text-gray-600">In office since 2019</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Briefcase className="text-gray-400" size={16} />
            <span className="text-sm text-gray-600">3rd Term</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="text-gray-400" size={16} />
            <span className="text-sm text-gray-600">Serves 750,000 constituents</span>
          </div>
        </div>

        {/* Key Committees */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Committee Memberships</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              Education & Labor
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              Budget
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              Healthcare
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              Environment
            </span>
          </div>
        </div>

        {/* Key Issues */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Priority Issues</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              🎓 Education Reform
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              🏥 Healthcare Access
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              💼 Job Creation
            </span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
              🌱 Climate Action
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}