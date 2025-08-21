import React from 'react';
import { Clock, Mail, MessageSquare, Phone, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsivenessIndicatorProps {
  responsiveness: number;
  responseTime: string;
  totalContacts: number;
  lastContact: string;
  trend?: 'up' | 'down' | 'stable';
}

export default function ResponsivenessIndicator({
  responsiveness,
  responseTime,
  totalContacts,
  lastContact,
  trend = 'stable'
}: ResponsivenessIndicatorProps) {
  const getResponsivenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getResponsivenessLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getSpeedIcon = (time: string) => {
    const days = parseInt(time);
    if (days <= 2) return <Zap className="text-green-600" size={20} />;
    if (days <= 5) return <Clock className="text-yellow-600" size={20} />;
    return <Clock className="text-red-600" size={20} />;
  };

  const getTrendIcon = () => {
    switch(trend) {
      case 'up': return <TrendingUp className="text-green-600" size={16} />;
      case 'down': return <TrendingDown className="text-red-600" size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Score Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center',
            getResponsivenessColor(responsiveness).split(' ')[1]
          )}>
            <div className="text-center">
              <div className={cn('text-2xl font-bold', getResponsivenessColor(responsiveness).split(' ')[0])}>
                {responsiveness}%
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{getResponsivenessLabel(responsiveness)}</span>
              {getTrendIcon()}
            </div>
            <p className="text-sm text-gray-600">Response Rate</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            {getSpeedIcon(responseTime)}
            <span className="text-lg font-semibold">{responseTime}</span>
          </div>
          <p className="text-sm text-gray-600">Avg. Response Time</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Response Rate</span>
          <span>{responsiveness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={cn(
              'h-3 rounded-full transition-all duration-500',
              responsiveness >= 80 ? 'bg-green-500' :
              responsiveness >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            )}
            style={{ width: `${responsiveness}%` }}
          />
        </div>
      </div>

      {/* Contact Methods Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Mail className="mx-auto mb-1 text-blue-600" size={24} />
          <div className="text-sm font-semibold">Email</div>
          <div className="text-xs text-gray-600">85% response</div>
          <div className="text-xs text-gray-500">~2 days</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Phone className="mx-auto mb-1 text-green-600" size={24} />
          <div className="text-sm font-semibold">Phone</div>
          <div className="text-xs text-gray-600">92% response</div>
          <div className="text-xs text-gray-500">Same day</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <MessageSquare className="mx-auto mb-1 text-purple-600" size={24} />
          <div className="text-sm font-semibold">Letters</div>
          <div className="text-xs text-gray-600">78% response</div>
          <div className="text-xs text-gray-500">~7 days</div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between pt-3 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Total Contacts</p>
          <p className="text-lg font-semibold">{totalContacts.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Last Contact</p>
          <p className="text-lg font-semibold">{lastContact}</p>
        </div>
      </div>

      {/* Response Quality Indicators */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Response Quality</h4>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Personalized Responses</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '72%' }} />
              </div>
              <span className="text-xs font-medium">72%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Addresses Concerns</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '88%' }} />
              </div>
              <span className="text-xs font-medium">88%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Follow-up Actions</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-purple-500" style={{ width: '65%' }} />
              </div>
              <span className="text-xs font-medium">65%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}