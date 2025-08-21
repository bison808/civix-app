import React from 'react';
import { CheckCircle, XCircle, MinusCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/core/Card';
import { Representative } from '@/types/representatives.types';
import { cn } from '@/lib/utils';

interface Vote {
  billId: string;
  title: string;
  vote: 'yes' | 'no' | 'abstain' | 'pending';
  communitySupport: number;
  date?: string;
}

interface RepresentativeScorecardProps {
  representative: Representative;
  votes: Vote[];
}

export default function RepresentativeScorecard({ 
  representative, 
  votes 
}: RepresentativeScorecardProps) {
  const getVoteIcon = (vote: string) => {
    switch(vote) {
      case 'yes': return <CheckCircle className="text-green-600" size={20} />;
      case 'no': return <XCircle className="text-red-600" size={20} />;
      case 'abstain': return <MinusCircle className="text-gray-600" size={20} />;
      case 'pending': return <Clock className="text-yellow-600" size={20} />;
      default: return null;
    }
  };

  const getAlignmentColor = (vote: string, support: number) => {
    const aligned = (vote === 'yes' && support > 50) || (vote === 'no' && support < 50);
    return aligned ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const getAlignmentText = (vote: string, support: number) => {
    const aligned = (vote === 'yes' && support > 50) || (vote === 'no' && support < 50);
    return aligned ? 'Aligned' : 'Misaligned';
  };

  const getAlignmentIcon = (vote: string, support: number) => {
    const aligned = (vote === 'yes' && support > 50) || (vote === 'no' && support < 50);
    return aligned ? 
      <TrendingUp className="text-green-600" size={16} /> : 
      <TrendingDown className="text-red-600" size={16} />;
  };

  const calculateOverallAlignment = () => {
    let aligned = 0;
    let total = 0;
    
    votes.forEach(vote => {
      if (vote.vote !== 'pending') {
        total++;
        if ((vote.vote === 'yes' && vote.communitySupport > 50) || 
            (vote.vote === 'no' && vote.communitySupport < 50)) {
          aligned++;
        }
      }
    });
    
    return total > 0 ? Math.round((aligned / total) * 100) : 0;
  };

  const overallAlignment = calculateOverallAlignment();

  return (
    <Card variant="default" padding="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Voting Scorecard</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Overall Alignment:</span>
            <span className={cn(
              'text-lg font-bold',
              overallAlignment >= 70 ? 'text-green-600' :
              overallAlignment >= 40 ? 'text-yellow-600' :
              'text-red-600'
            )}>
              {overallAlignment}%
            </span>
          </div>
        </div>

        {/* Alignment Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={cn(
              'h-3 rounded-full transition-all duration-500',
              overallAlignment >= 70 ? 'bg-green-500' :
              overallAlignment >= 40 ? 'bg-yellow-500' :
              'bg-red-500'
            )}
            style={{ width: `${overallAlignment}%` }}
          />
        </div>

        {/* Recent Votes */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Recent Votes</h3>
          {votes.map((vote) => (
            <div
              key={vote.billId}
              className={cn(
                'p-3 rounded-lg border transition-all hover:shadow-md',
                getAlignmentColor(vote.vote, vote.communitySupport)
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getVoteIcon(vote.vote)}
                    <span className="font-medium text-sm">{vote.billId}</span>
                    <span className="text-xs text-gray-500">{vote.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{vote.title}</p>
                  
                  {/* Community Support Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Community Support</span>
                        <span>{vote.communitySupport}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${vote.communitySupport}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Alignment Badge */}
                <div className="ml-4">
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    (vote.vote === 'yes' && vote.communitySupport > 50) || 
                    (vote.vote === 'no' && vote.communitySupport < 50)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}>
                    {getAlignmentIcon(vote.vote, vote.communitySupport)}
                    {getAlignmentText(vote.vote, vote.communitySupport)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Voting Summary */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Voting Summary</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <CheckCircle className="text-green-600 mx-auto mb-1" size={24} />
              <div className="text-lg font-bold">{votes.filter(v => v.vote === 'yes').length}</div>
              <div className="text-xs text-gray-600">Yes Votes</div>
            </div>
            <div className="text-center">
              <XCircle className="text-red-600 mx-auto mb-1" size={24} />
              <div className="text-lg font-bold">{votes.filter(v => v.vote === 'no').length}</div>
              <div className="text-xs text-gray-600">No Votes</div>
            </div>
            <div className="text-center">
              <MinusCircle className="text-gray-600 mx-auto mb-1" size={24} />
              <div className="text-lg font-bold">{votes.filter(v => v.vote === 'abstain').length}</div>
              <div className="text-xs text-gray-600">Abstained</div>
            </div>
            <div className="text-center">
              <Clock className="text-yellow-600 mx-auto mb-1" size={24} />
              <div className="text-lg font-bold">{votes.filter(v => v.vote === 'pending').length}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}