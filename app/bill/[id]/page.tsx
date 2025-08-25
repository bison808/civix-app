'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Share2, Calendar, Users, FileText } from 'lucide-react';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import ImpactChart from '@/components/impact/ImpactChart';
import { Bill } from '@/types';
import { api } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function BillDetailPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.id as string;
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    setLoading(true);
    try {
      const data = await api.bills.getById(billId);
      setBill(data || null);
    } catch (error) {
      console.error('Failed to load bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (billId: string, vote: 'like' | 'dislike' | null, comment?: string) => {
    await api.feedback.submitVote(billId, vote || 'like', comment);
    if (bill) {
      setBill({ ...bill, userVote: vote });
    }
  };

  const handleShare = async () => {
    if (navigator.share && bill) {
      try {
        await navigator.share({
          title: bill.title,
          text: bill.aiSummary?.simpleSummary || bill.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-delta" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-14 pb-16">
        <p className="text-gray-500 mb-4">Bill not found</p>
        <Button variant="outline" onClick={() => router.push('/bills')}>
          Return to Bills
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-14 pb-16">
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex-1">
          <h1 className="text-lg font-semibold truncate">{bill.billNumber}</h1>
        </div>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-4 py-6 space-y-6">
          {/* Title and Status */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{bill.title}</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className={cn(
                'px-3 py-1 rounded-full font-medium',
                bill.status.stage === 'Law' ? 'bg-green-100 text-green-700' :
                bill.status.stage === 'Committee' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              )}>
                {bill.status.stage}
              </span>
              {bill.lastActionDate && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar size={14} />
                  <span>Last Action: {formatDate(bill.lastActionDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Simplified Summary */}
          <Card variant="elevated" padding="md">
            <h3 className="font-semibold text-gray-900 mb-2">Simple Version</h3>
            <p className="text-gray-700">{bill.aiSummary?.simpleSummary || bill.summary}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-900">This bill will:</p>
              <ul className="space-y-1">
                {bill.aiSummary?.keyPoints.slice(0, 3).map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-delta mt-1">•</span>
                    <span className="text-sm text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Your Impact */}
          <ImpactChart
            impacts={[]}
            type="personal"
            animated={true}
            interactive={true}
          />

          {/* Feedback */}
          <Card variant="default" padding="md">
            <h3 className="font-semibold text-gray-900 mb-4">How do you feel about this bill?</h3>
            <FeedbackButton
              billId={bill.id}
              initialLikes={0}
              initialDislikes={0}
              userVote={bill.userVote}
              onFeedback={handleFeedback}
              showComment={true}
            />
          </Card>

          {/* Representatives section removed - would need separate API call */}

          {/* View Full Text */}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowFullText(!showFullText)}
          >
            <FileText size={16} className="mr-2" />
            {showFullText ? 'Hide' : 'View'} Full Text
          </Button>

          {showFullText && (
            <Card variant="default" padding="md">
              <h3 className="font-semibold text-gray-900 mb-3">Full Bill Text</h3>
              <p className="text-sm text-gray-600">
                {bill.fullText || bill.summary}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}