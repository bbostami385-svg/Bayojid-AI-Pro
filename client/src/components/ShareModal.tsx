import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Mail, Link2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * শেয়ার মোডাল কম্পোনেন্ট
 */

interface ShareModalProps {
  conversationId: number;
  conversationTitle: string;
  shareUrl?: string;
  onGenerateShareLink?: () => Promise<string>;
}

export function ShareModal({
  conversationId,
  conversationTitle,
  shareUrl,
  onGenerateShareLink
}: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(shareUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * শেয়ার লিংক জেনারেট করুন
   */
  const handleGenerateLink = async () => {
    if (generatedUrl) {
      return;
    }

    try {
      setIsGenerating(true);
      
      if (onGenerateShareLink) {
        const url = await onGenerateShareLink();
        setGeneratedUrl(url);
        toast.success('শেয়ার লিংক তৈরি হয়েছে');
      } else {
        // ডিফল্ট শেয়ার লিংক
        const url = `${window.location.origin}/shared/${conversationId}`;
        setGeneratedUrl(url);
        toast.success('শেয়ার লিংক তৈরি হয়েছে');
      }
    } catch (error) {
      toast.error('শেয়ার লিংক তৈরিতে ব্যর্থ');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * লিংক কপি করুন
   */
  const handleCopyLink = () => {
    if (!generatedUrl) return;

    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopied(true);
      toast.success('লিংক কপি করা হয়েছে');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * ইমেইল শেয়ার করুন
   */
  const handleEmailShare = () => {
    if (!generatedUrl) return;

    const subject = encodeURIComponent(`Bayojid AI Pro: ${conversationTitle}`);
    const body = encodeURIComponent(
      `আমি এই কথোপকথন আপনার সাথে শেয়ার করতে চাই:\n\n${generatedUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  /**
   * সোশ্যাল মিডিয়ায় শেয়ার করুন
   */
  const handleSocialShare = (platform: 'twitter' | 'facebook') => {
    if (!generatedUrl) return;

    const text = encodeURIComponent(`আমি এই AI কথোপকথন Bayojid AI Pro এ শেয়ার করছি: ${conversationTitle}`);
    const url = encodeURIComponent(generatedUrl);

    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          শেয়ার করুন
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>কথোপকথন শেয়ার করুন</DialogTitle>
          <DialogDescription>
            এই কথোপকথন অন্যদের সাথে শেয়ার করার জন্য একটি লিংক তৈরি করুন
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* শেয়ার লিংক তৈরি */}
          {!generatedUrl ? (
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? 'তৈরি করছি...' : 'শেয়ার লিংক তৈরি করুন'}
            </Button>
          ) : (
            <>
              {/* লিংক ডিসপ্লে */}
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <Link2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <Input
                  readOnly
                  value={generatedUrl}
                  className="border-0 bg-transparent text-sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* শেয়ার অপশন */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">শেয়ার করুন:</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEmailShare}
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    ইমেইল
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare('twitter')}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
                    </svg>
                    টুইটার
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare('facebook')}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z" />
                    </svg>
                    ফেসবুক
                  </Button>
                </div>
              </div>

              {/* নতুন লিংক */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGeneratedUrl(null)}
                className="w-full"
              >
                নতুন লিংক তৈরি করুন
              </Button>
            </>
          )}

          {/* তথ্য */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 <strong>টিপ:</strong> শেয়ার করা লিংক যে কেউ দেখতে পারবে। সংবেদনশীল তথ্য শেয়ার করবেন না।
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareModal;
