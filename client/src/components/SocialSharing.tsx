import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Copy,
  Link as LinkIcon,
  BarChart3,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SocialSharingProps {
  conversationId: number;
  conversationTitle: string;
}

export function SocialSharing({ conversationId, conversationTitle }: SocialSharingProps) {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const generateShareMutation = trpc.sharing.generateShareLink.useMutation();
  const shareToTwitterMutation = trpc.sharing.shareToTwitter.useMutation();
  const shareToFacebookMutation = trpc.sharing.shareToFacebook.useMutation();
  const shareToLinkedInMutation = trpc.sharing.shareToLinkedIn.useMutation();
  const shareViaEmailMutation = trpc.sharing.shareViaEmail.useMutation();
  const getShareStatsMutation = trpc.sharing.getShareStatistics.useQuery({ conversationId });

  const handleGenerateLink = async () => {
    try {
      const result = await generateShareMutation.mutateAsync({
        conversationId,
        includeMessages: true,
      });
      setShareUrl(result.shareUrl);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToTwitter = async () => {
    try {
      const result = await shareToTwitterMutation.mutateAsync({
        conversationId,
        message: shareMessage || `আমি এই দুর্দান্ত কথোপকথন শেয়ার করছি: "${conversationTitle}"`,
        includeLink: true,
      });
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Failed to share to Twitter:", error);
    }
  };

  const handleShareToFacebook = async () => {
    try {
      const result = await shareToFacebookMutation.mutateAsync({
        conversationId,
        title: conversationTitle,
        description: shareMessage,
      });
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Failed to share to Facebook:", error);
    }
  };

  const handleShareToLinkedIn = async () => {
    try {
      const result = await shareToLinkedInMutation.mutateAsync({
        conversationId,
        title: conversationTitle,
        description: shareMessage,
      });
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Failed to share to LinkedIn:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          শেয়ার করুন / Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>কথোপকথন শেয়ার করুন / Share Conversation</DialogTitle>
          <DialogDescription>এই কথোপকথন সোশ্যাল মিডিয়ায় শেয়ার করুন</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Link Section */}
          <div className="space-y-3">
            <h3 className="font-semibold">শেয়ারযোগ্য লিংক / Shareable Link</h3>
            {!shareUrl ? (
              <Button onClick={handleGenerateLink} className="w-full">
                <LinkIcon className="w-4 h-4 mr-2" />
                লিংক তৈরি করুন / Generate Link
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? "✓ কপি হয়েছে" : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Share Message */}
          <div className="space-y-3">
            <h3 className="font-semibold">শেয়ার বার্তা / Share Message</h3>
            <Textarea
              placeholder="আপনার বার্তা যোগ করুন (ঐচ্ছিক) / Add your message (optional)"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-3">
            <h3 className="font-semibold">সোশ্যাল মিডিয়ায় শেয়ার করুন / Share on Social Media</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleShareToTwitter}
                className="gap-2 bg-blue-400 hover:bg-blue-500"
              >
                <Twitter className="w-4 h-4" />
                টুইটার / Twitter
              </Button>
              <Button
                onClick={handleShareToFacebook}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Facebook className="w-4 h-4" />
                ফেসবুক / Facebook
              </Button>
              <Button
                onClick={handleShareToLinkedIn}
                className="gap-2 bg-blue-700 hover:bg-blue-800"
              >
                <Linkedin className="w-4 h-4" />
                লিংকডইন / LinkedIn
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                ইমেইল / Email
              </Button>
            </div>
          </div>

          {/* Share Statistics */}
          {getShareStatsMutation.data && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  শেয়ার পরিসংখ্যান / Share Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {getShareStatsMutation.data.totalShares}
                    </div>
                    <div className="text-sm text-gray-600">মোট শেয়ার / Total Shares</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {getShareStatsMutation.data.views}
                    </div>
                    <div className="text-sm text-gray-600">মোট ভিউ / Total Views</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>টুইটার / Twitter:</span>
                    <Badge>{getShareStatsMutation.data.sharesByPlatform.twitter}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ফেসবুক / Facebook:</span>
                    <Badge>{getShareStatsMutation.data.sharesByPlatform.facebook}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>লিংকডইন / LinkedIn:</span>
                    <Badge>{getShareStatsMutation.data.sharesByPlatform.linkedin}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
