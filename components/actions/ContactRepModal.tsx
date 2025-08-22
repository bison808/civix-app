'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Mail, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { Representative, Bill } from '@/types';
import { api } from '@/services/api';
import { voteManager } from '@/services/voteManager';
import { cn } from '@/lib/utils';

interface ContactRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
  userPosition: 'support' | 'oppose';
}

export default function ContactRepModal({ 
  isOpen, 
  onClose, 
  bill,
  userPosition 
}: ContactRepModalProps) {
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'message'>('email');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRepresentatives();
    }
  }, [isOpen]);

  const loadRepresentatives = async () => {
    setLoading(true);
    try {
      const zipCode = localStorage.getItem('userZipCode') || '90210';
      const reps = await api.representatives.getByZipCode(zipCode);
      // Filter to federal representatives who would vote on this bill
      const federalReps = reps.filter(rep => 
        rep.chamber === 'House' || rep.chamber === 'Senate'
      );
      setRepresentatives(federalReps);
      if (federalReps.length > 0) {
        setSelectedRep(federalReps[0]);
      }
    } catch (error) {
      console.error('Failed to load representatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMessageTemplate = () => {
    const position = userPosition === 'support' ? 'support' : 'oppose';
    const reason = userPosition === 'support' 
      ? 'I believe this legislation will benefit our community'
      : 'I have concerns about the potential negative impacts of this legislation';

    const email = `Subject: Please ${position} ${bill.billNumber} - ${bill.title}

Dear ${selectedRep?.title} ${selectedRep?.name},

I am writing to you as a constituent from ${localStorage.getItem('userZipCode')} to express my ${position === 'support' ? 'support for' : 'opposition to'} ${bill.billNumber}: ${bill.title}.

${reason} and urge you to vote ${position === 'support' ? 'in favor of' : 'against'} this bill when it comes to the floor.

Key points about this legislation:
${bill.summary.slice(0, 200)}...

As your constituent, I hope you will consider my position on this important matter.

Thank you for your time and service.

Sincerely,
[Your Name]
[Your Address]`;

    const phone = `Hi, I'm calling as a constituent from ZIP ${localStorage.getItem('userZipCode')} to ask ${selectedRep?.title} ${selectedRep?.name} to ${position} ${bill.billNumber}. ${reason.slice(0, 100)}. Thank you.`;

    return contactMethod === 'email' ? email : phone;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getMessageTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!selectedRep) return;

    if (contactMethod === 'email' && selectedRep.contactInfo.email) {
      const subject = `Please ${userPosition} ${bill.billNumber}`;
      const body = encodeURIComponent(getMessageTemplate());
      window.open(`mailto:${selectedRep.contactInfo.email}?subject=${subject}&body=${body}`);
    } else if (contactMethod === 'phone' && selectedRep.contactInfo.phone) {
      window.open(`tel:${selectedRep.contactInfo.phone}`);
    } else if (contactMethod === 'message') {
      // Simulate sending message through platform
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessageSent(true);
      setLoading(false);
    }

    // Mark as contacted
    voteManager.markContacted(bill.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Contact Your Representatives</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading representatives...</p>
            </div>
          ) : messageSent ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
              <p className="text-gray-600">
                Your message has been sent to {selectedRep?.title} {selectedRep?.name}
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Bill Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Regarding:</div>
                <div className="font-semibold">{bill.billNumber}: {bill.title}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Your position: <span className={cn(
                    "font-medium",
                    userPosition === 'support' ? "text-green-600" : "text-red-600"
                  )}>
                    {userPosition === 'support' ? 'Support' : 'Oppose'}
                  </span>
                </div>
              </div>

              {/* Representative Selection */}
              {representatives.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Representative
                  </label>
                  <div className="space-y-2">
                    {representatives.map(rep => (
                      <button
                        key={rep.id}
                        onClick={() => setSelectedRep(rep)}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 text-left transition-all",
                          selectedRep?.id === rep.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{rep.title} {rep.name}</div>
                            <div className="text-sm text-gray-600">
                              {rep.party} - {rep.chamber}
                            </div>
                          </div>
                          {selectedRep?.id === rep.id && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setContactMethod('email')}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      contactMethod === 'email'
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Mail className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm">Email</div>
                  </button>
                  <button
                    onClick={() => setContactMethod('phone')}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      contactMethod === 'phone'
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Phone className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm">Phone</div>
                  </button>
                  <button
                    onClick={() => setContactMethod('message')}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      contactMethod === 'message'
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm">Message</div>
                  </button>
                </div>
              </div>

              {/* Message Template */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {contactMethod === 'phone' ? 'Call Script' : 'Message Template'}
                  </label>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {getMessageTemplate()}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900 mb-1">Tips for contacting:</div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be polite and respectful</li>
                  <li>• State your ZIP code to confirm you're a constituent</li>
                  <li>• Keep your message brief and focused</li>
                  <li>• Thank them for their time and service</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !messageSent && (
          <div className="flex gap-3 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedRep}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                selectedRep
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {contactMethod === 'email' && <Mail size={18} />}
              {contactMethod === 'phone' && <Phone size={18} />}
              {contactMethod === 'message' && <MessageSquare size={18} />}
              {contactMethod === 'message' ? 'Send Message' : `Open ${contactMethod === 'email' ? 'Email' : 'Phone'} App`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}