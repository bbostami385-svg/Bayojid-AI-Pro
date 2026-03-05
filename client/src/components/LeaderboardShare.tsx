import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check } from "lucide-react";

interface LeaderboardShareProps {
  rank: number;
  points: number;
  username: string;
}

export function LeaderboardShare({ rank, points, username }: LeaderboardShareProps) {
  const [customMessage, setCustomMessage] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<"twitter" | "facebook" | "linkedin" | "whatsapp" | null>(null);
  const [copied, setCopied] = useState(false);

  const shareMutation = trpc.leaderboardSharing.shareLeaderboardToSocial.useMutation();
  const customShareMutation = trpc.leaderboardSharing.createCustomShareMessage.useMutation();
  const { data: shareStats } = trpc.leaderboardSharing.getShareStatistics.useQuery();

  const handleShare = (platform: "twitter" | "facebook" | "linkedin" | "whatsapp") => {
    shareMutation.mutate({
      platform,
      rank,
      points,
      username,
    });
    setSelectedPlatform(platform);
  };

  const handleCustomShare = () => {
    customShareMutation.mutate({
      rank,
      points,
      customMessage: customMessage || undefined,
    });
  };

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const defaultMessage = `আমি AI Chat লিডারবোর্ডে #${rank} স্থানে আছি ${points} পয়েন্ট নিয়ে! 🏆`;

  return (
    <div className="space-y-6">
      {/* Share Statistics */}
      {shareStats && (
        <Card>
          <CardHeader>
            <CardTitle>শেয়ার পরিসংখ্যান / Share Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{shareStats.totalShares}</p>
                <p className="text-xs text-muted-foreground">মোট শেয়ার</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  <Twitter className="w-5 h-5 inline" /> {shareStats.sharesByPlatform.twitter}
                </p>
                <p className="text-xs text-muted-foreground">Twitter</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  <Facebook className="w-5 h-5 inline" /> {shareStats.sharesByPlatform.facebook}
                </p>
                <p className="text-xs text-muted-foreground">Facebook</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  <Linkedin className="w-5 h-5 inline" /> {shareStats.sharesByPlatform.linkedin}
                </p>
                <p className="text-xs text-muted-foreground">LinkedIn</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  <MessageCircle className="w-5 h-5 inline" /> {shareStats.sharesByPlatform.whatsapp}
                </p>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Media Share */}
      <Card>
        <CardHeader>
          <CardTitle>সোশ্যাল মিডিয়ায় শেয়ার করুন / Share on Social Media</CardTitle>
          <CardDescription>আপনার লিডারবোর্ড র‍্যাঙ্কিং বন্ধুদের সাথে শেয়ার করুন</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant={selectedPlatform === "twitter" ? "default" : "outline"}
              onClick={() => handleShare("twitter")}
              className="w-full"
              disabled={shareMutation.isPending}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant={selectedPlatform === "facebook" ? "default" : "outline"}
              onClick={() => handleShare("facebook")}
              className="w-full"
              disabled={shareMutation.isPending}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant={selectedPlatform === "linkedin" ? "default" : "outline"}
              onClick={() => handleShare("linkedin")}
              className="w-full"
              disabled={shareMutation.isPending}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              variant={selectedPlatform === "whatsapp" ? "default" : "outline"}
              onClick={() => handleShare("whatsapp")}
              className="w-full"
              disabled={shareMutation.isPending}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {shareMutation.data && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">✓ {shareMutation.data.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle>কাস্টম মেসেজ / Custom Message</CardTitle>
          <CardDescription>আপনার নিজস্ব বার্তা দিয়ে শেয়ার করুন</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">শেয়ার মেসেজ / Share Message</label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={defaultMessage}
              className="min-h-24"
            />
            <p className="text-xs text-muted-foreground mt-2">
              খালি রেখে দিলে ডিফল্ট মেসেজ ব্যবহার হবে
            </p>
          </div>

          <Button
            onClick={handleCustomShare}
            disabled={customShareMutation.isPending}
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            কাস্টম মেসেজ তৈরি করুন
          </Button>

          {customShareMutation.data && (
            <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">শেয়ার লিংক:</p>
              <div className="space-y-2">
                {Object.entries(customShareMutation.data.shareLinks).map(([platform, url]) => (
                  <div key={platform} className="flex items-center gap-2">
                    <Input
                      value={url}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyMessage(url)}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Bonus */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-purple-900">শেয়ার বোনাস / Share Bonus</h3>
              <p className="text-sm text-purple-700 mt-1">
                প্রতিটি শেয়ারের জন্য 5 বোনাস পয়েন্ট পান!
              </p>
            </div>
            <Badge className="bg-purple-600 text-white">+5 পয়েন্ট</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
