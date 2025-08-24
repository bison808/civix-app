'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Mail, Phone, Globe, MapPin, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import { Representative } from '@/types';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import RepresentativeProfile from '@/components/representatives/RepresentativeProfile';
import RepresentativeScorecard from '@/components/representatives/RepresentativeScorecard';
import ResponsivenessIndicator from '@/components/representatives/ResponsivenessIndicator';
import FeedbackHistory from '@/components/feedback/FeedbackHistory';
import ContactRepresentative from '@/components/representatives/ContactRepresentative';
import RepresentativeCommittees from '@/components/representatives/RepresentativeCommittees';

export default function RepresentativeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [representative, setRepresentative] = useState<Representative | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [feedbackStats, setFeedbackStats] = useState({
    approval: 0,
    disapproval: 0,
    totalFeedback: 0,
    responsiveness: 0,
    responseTime: '3 days'
  });

  useEffect(() => {
    loadRepresentative();
    loadFeedbackStats();
  }, [params.id]);

  const loadRepresentative = async () => {
    setLoading(true);
    try {
      const zipCode = localStorage.getItem('userZipCode') || '90210';
      const reps = await api.representatives.getByZipCode(zipCode);
      const rep = reps.find(r => r.id === params.id);
      setRepresentative(rep || null);
    } catch (error) {
      console.error('Failed to load representative:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackStats = async () => {
    // This would fetch from the real API
    setFeedbackStats({
      approval: 72,
      disapproval: 28,
      totalFeedback: 1234,
      responsiveness: 85,
      responseTime: '3 days'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!representative) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Representative not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white safe-top">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-lg font-semibold">{representative.name}</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowContactModal(true)}
        >
          Contact
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Profile Section */}
          <RepresentativeProfile 
            representative={representative}
            feedbackStats={feedbackStats}
          />

          {/* Responsiveness Section */}
          <Card variant="default" padding="md">
            <h2 className="text-lg font-semibold mb-4">Responsiveness</h2>
            <ResponsivenessIndicator
              responsiveness={feedbackStats.responsiveness}
              responseTime={feedbackStats.responseTime}
              totalContacts={342}
              lastContact="2 days ago"
            />
          </Card>

          {/* Committee Assignments Section */}
          <RepresentativeCommittees 
            representative={representative}
            showUpcomingMeetings={true}
            limit={5}
          />

          {/* Scorecard Section */}
          <RepresentativeScorecard
            representative={representative}
            votes={[
              { billId: 'HB-2024', title: 'Education Funding Act', vote: 'yes', communitySupport: 82 },
              { billId: 'SB-445', title: 'Healthcare Access Bill', vote: 'yes', communitySupport: 75 },
              { billId: 'HB-891', title: 'Tax Reform Bill', vote: 'no', communitySupport: 35 },
              { billId: 'SB-102', title: 'Climate Action Act', vote: 'yes', communitySupport: 68 },
              { billId: 'HB-333', title: 'Infrastructure Bill', vote: 'yes', communitySupport: 90 },
            ]}
          />

          {/* Community Feedback Section */}
          <Card variant="default" padding="md">
            <h2 className="text-lg font-semibold mb-4">Community Feedback</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <ThumbsUp className="mx-auto mb-2 text-green-600" size={32} />
                <div className="text-2xl font-bold text-green-600">{feedbackStats.approval}%</div>
                <div className="text-sm text-gray-600">Approval</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <ThumbsDown className="mx-auto mb-2 text-red-600" size={32} />
                <div className="text-2xl font-bold text-red-600">{feedbackStats.disapproval}%</div>
                <div className="text-sm text-gray-600">Disapproval</div>
              </div>
            </div>
            <FeedbackHistory representativeId={representative.id} />
          </Card>

          {/* Contact Information */}
          <Card variant="default" padding="md">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <a
                href={`mailto:${representative.contactInfo.email}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="text-gray-600" size={20} />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-gray-600">{representative.contactInfo.email}</div>
                </div>
              </a>
              <a
                href={`tel:${representative.contactInfo.phone}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="text-gray-600" size={20} />
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <div className="text-sm text-gray-600">{representative.contactInfo.phone}</div>
                </div>
              </a>
              {representative.contactInfo.website && (
                <a
                  href={representative.contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Globe className="text-gray-600" size={20} />
                  <div>
                    <div className="text-sm font-medium">Website</div>
                    <div className="text-sm text-gray-600">{representative.contactInfo.website}</div>
                  </div>
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactRepresentative
          representative={representative}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}