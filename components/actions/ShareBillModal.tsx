'use client';

import { useState } from 'react';
import { X, Twitter, Facebook, Link2, MessageCircle, Copy, Check, Share2 } from 'lucide-react';
import { Bill } from '@/types';
import { voteManager } from '@/services/voteManager';
import { cn } from '@/lib/utils';

interface ShareBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
  userPosition?: 'support' | 'oppose' | null;
}

export default function ShareBillModal({ 
  isOpen, 
  onClose, 
  bill,
  userPosition 
}: ShareBillModalProps) {
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<'twitter' | 'facebook' | 'whatsapp' | 'link' | null>(null);

  if (!isOpen) return null;

  const shareUrl = `https://citznvote.netlify.app/bill/${bill.id}`;
  const position = userPosition ? (userPosition === 'support' ? 'support' : 'oppose') : 'learn about';
  
  const shareText = userPosition 
    ? `I ${position} ${bill.billNumber}: ${bill.title}. Make your voice heard!`
    : `Learn about ${bill.billNumber}: ${bill.title} and make your voice heard!`;

  const handleShare = (selectedPlatform: typeof platform) => {
    setPlatform(selectedPlatform);
    
    // Mark as shared in voteManager
    voteManager.markShared(bill.id);

    switch (selectedPlatform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=CivicEngagement,CITZN`,
          '_blank',
          'width=550,height=420'
        );
        break;
      
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
          '_blank'
        );
        break;
      
      case 'link':
        handleCopyLink();
        break;
    }

    // Close modal after a delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Share2 size={20} />
            Share This Bill
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Bill Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-semibold text-sm">{bill.billNumber}</div>
            <div className="text-gray-700 mt-1">{bill.title}</div>
            {userPosition && (
              <div className="mt-2 text-sm">
                Your position: <span className={cn(
                  "font-medium",
                  userPosition === 'support' ? "text-green-600" : "text-red-600"
                )}>
                  {userPosition === 'support' ? 'Support' : 'Oppose'}
                </span>
              </div>
            )}
          </div>

          {/* Share Message Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Message
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              {shareText}
            </div>
          </div>

          {/* Share Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share On
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('twitter')}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                  platform === 'twitter'
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                )}
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Twitter</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                  platform === 'facebook'
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-600 hover:bg-blue-50"
                )}
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Facebook</span>
              </button>

              <button
                onClick={() => handleShare('whatsapp')}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                  platform === 'whatsapp'
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-500 hover:bg-green-50"
                )}
              >
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('link')}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                  platform === 'link' || copied
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-purple-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Why Share */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex gap-2">
              <div className="text-amber-600 text-lg">💡</div>
              <div className="text-sm text-amber-800">
                <div className="font-medium mb-1">Why share?</div>
                <div>Spreading awareness helps build community support and shows representatives that people care about this issue.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}