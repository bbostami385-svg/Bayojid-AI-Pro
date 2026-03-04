import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

export function MediaGeneration() {
  const [activeTab, setActiveTab] = useState("text-to-image");
  const [loading, setLoading] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<any>(null);

  // Text to Image
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState<string>("realistic");

  // Image to Video
  const [imageUrl, setImageUrl] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState(8);

  // Text to Video
  const [textVideoPrompt, setTextVideoPrompt] = useState("");
  const [textVideoDuration, setTextVideoDuration] = useState(8);
  const [textVideoStyle, setTextVideoStyle] = useState("realistic");

  // Get subscription limits
  const { data: subscriptionData } = trpc.subscription.getCurrentSubscription.useQuery();
  const { data: usageData } = trpc.usage.getTodayUsage.useQuery();
  const { data: quotaData } = trpc.usage.checkQuota.useQuery({ type: "video" });

  // Mutations
  const generateImageMutation = trpc.media.generateImageFromText.useMutation();
  const generateImageToVideoMutation = trpc.media.generateVideoFromImage.useMutation();
  const generateTextToVideoMutation = trpc.media.generateVideoFromText.useMutation();

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    setLoading(true);
    try {
      const result = await generateImageMutation.mutateAsync({
        prompt: imagePrompt,
        style: imageStyle as any,
      });

      setGeneratedMedia({
        type: "image",
        url: result.imageUrl,
        prompt: result.prompt,
      });
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImageToVideo = async () => {
    if (!imageUrl.trim() || !videoPrompt.trim()) return;

    setLoading(true);
    try {
      const result = await generateImageToVideoMutation.mutateAsync({
        imageUrl,
        prompt: videoPrompt,
        duration: videoDuration,
      });

      setGeneratedMedia({
        type: "video",
        url: result.videoUrl,
        prompt: result.prompt,
        duration: result.duration,
        quality: result.quality,
      });
    } catch (error) {
      console.error("Video generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTextToVideo = async () => {
    if (!textVideoPrompt.trim()) return;

    setLoading(true);
    try {
      const result = await generateTextToVideoMutation.mutateAsync({
        prompt: textVideoPrompt,
        duration: textVideoDuration,
        style: textVideoStyle as any,
      });

      setGeneratedMedia({
        type: "video",
        url: result.videoUrl,
        prompt: result.prompt,
        duration: result.duration,
        quality: result.quality,
      });
    } catch (error) {
      console.error("Video generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: "bg-gray-100 text-gray-800",
      pro: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
    };
    return colors[tier] || colors.free;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">মিডিয়া জেনারেশন / Media Generation</h1>
          <p className="text-gray-600">AI দিয়ে ছবি এবং ভিডিও তৈরি করুন / Create images and videos with AI</p>
        </div>

        {/* Subscription Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">আপনার প্ল্যান / Your Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={getTierBadge(subscriptionData?.tier || "free")}>
                  {subscriptionData?.tierName || "ফ্রি / Free"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">আজ ভিডিও / Videos Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageData?.videos.generated || 0}/{usageData?.videos.limit === -1 ? "∞" : usageData?.videos.limit}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">সর্বাধিক সময়কাল / Max Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageData?.videos.maxDuration || 8}s</div>
            </CardContent>
          </Card>
        </div>

        {/* Quota Warning */}
        {quotaData && !quotaData.canGenerate && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{quotaData.reason}</AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text-to-image" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              টেক্সট → ছবি
            </TabsTrigger>
            <TabsTrigger value="image-to-video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              ছবি → ভিডিও
            </TabsTrigger>
            <TabsTrigger value="text-to-video" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              টেক্সট → ভিডিও
            </TabsTrigger>
          </TabsList>

          {/* Text to Image Tab */}
          <TabsContent value="text-to-image">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>টেক্সট থেকে ছবি তৈরি করুন / Generate Image from Text</CardTitle>
                  <CardDescription>আপনার কল্পনা বর্ণনা করুন / Describe your imagination</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">প্রম্পট / Prompt</label>
                    <Textarea
                      placeholder="একটি সুন্দর সমুদ্র সৈকতের দৃশ্য বর্ণনা করুন / Describe a beautiful beach scene..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">স্টাইল / Style</label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="realistic">বাস্তবসম্মত / Realistic</option>
                      <option value="artistic">শিল্পকর্ম / Artistic</option>
                      <option value="cartoon">কার্টুন / Cartoon</option>
                      <option value="abstract">বিমূর্ত / Abstract</option>
                      <option value="photographic">ফটোগ্রাফিক / Photographic</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={loading || !imagePrompt.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        তৈরি হচ্ছে...
                      </>
                    ) : (
                      "ছবি তৈরি করুন"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Image Preview */}
              {generatedMedia?.type === "image" && (
                <Card>
                  <CardHeader>
                    <CardTitle>তৈরি ছবি / Generated Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={generatedMedia.url}
                      alt="Generated"
                      className="w-full h-auto rounded-lg mb-4"
                    />
                    <Button variant="outline" className="w-full" asChild>
                      <a href={generatedMedia.url} download>
                        ডাউনলোড করুন / Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Image to Video Tab */}
          <TabsContent value="image-to-video">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ছবি থেকে ভিডিও তৈরি করুন / Generate Video from Image</CardTitle>
                  <CardDescription>আপনার ছবিকে জীবন্ত করুন / Bring your image to life</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ছবির URL / Image URL</label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">প্রম্পট / Prompt</label>
                    <Textarea
                      placeholder="ছবিতে কী ঘটবে তা বর্ণনা করুন / Describe what happens in the video..."
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      সময়কাল / Duration: {videoDuration}s
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={usageData?.videos.maxDuration || 8}
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateImageToVideo}
                    disabled={loading || !imageUrl.trim() || !videoPrompt.trim() || !quotaData?.canGenerate}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        তৈরি হচ্ছে...
                      </>
                    ) : (
                      "ভিডিও তৈরি করুন"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Video Preview */}
              {generatedMedia?.type === "video" && (
                <Card>
                  <CardHeader>
                    <CardTitle>তৈরি ভিডিও / Generated Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <video
                      src={generatedMedia.url}
                      controls
                      className="w-full h-auto rounded-lg mb-4"
                    />
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="font-medium">সময়কাল / Duration:</span> {generatedMedia.duration}s
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">গুণমান / Quality:</span> {generatedMedia.quality}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={generatedMedia.url} download>
                        ডাউনলোড করুন / Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Text to Video Tab */}
          <TabsContent value="text-to-video">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>টেক্সট থেকে ভিডিও তৈরি করুন / Generate Video from Text</CardTitle>
                  <CardDescription>আপনার গল্প ভিডিওতে রূপান্তরিত করুন / Transform your story into video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">প্রম্পট / Prompt</label>
                    <Textarea
                      placeholder="একটি বিস্তারিত ভিডিও বর্ণনা লিখুন / Write a detailed video description..."
                      value={textVideoPrompt}
                      onChange={(e) => setTextVideoPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">স্টাইল / Style</label>
                    <select
                      value={textVideoStyle}
                      onChange={(e) => setTextVideoStyle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="realistic">বাস্তবসম্মত / Realistic</option>
                      <option value="animated">অ্যানিমেটেড / Animated</option>
                      <option value="cinematic">সিনেমাটিক / Cinematic</option>
                      <option value="documentary">ডকুমেন্টারি / Documentary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      সময়কাল / Duration: {textVideoDuration}s
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={usageData?.videos.maxDuration || 8}
                      value={textVideoDuration}
                      onChange={(e) => setTextVideoDuration(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateTextToVideo}
                    disabled={loading || !textVideoPrompt.trim() || !quotaData?.canGenerate}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        তৈরি হচ্ছে...
                      </>
                    ) : (
                      "ভিডিও তৈরি করুন"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Video Preview */}
              {generatedMedia?.type === "video" && (
                <Card>
                  <CardHeader>
                    <CardTitle>তৈরি ভিডিও / Generated Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <video
                      src={generatedMedia.url}
                      controls
                      className="w-full h-auto rounded-lg mb-4"
                    />
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="font-medium">সময়কাল / Duration:</span> {generatedMedia.duration}s
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">গুণমান / Quality:</span> {generatedMedia.quality}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={generatedMedia.url} download>
                        ডাউনলোড করুন / Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Upgrade CTA */}
        {subscriptionData?.tier === "free" && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle>আরও বেশি সুবিধা পান / Get More Benefits</CardTitle>
              <CardDescription>প্রো বা প্রিমিয়াম প্ল্যানে আপগ্রেড করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">প্রো প্ল্যান / Pro Plan</h4>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>✓ ১০ সেকেন্ড ভিডিও / 10s videos</li>
                    <li>✓ 720p গুণমান / 720p quality</li>
                    <li>✓ ১০টি ভিডিও/দিন / 10 videos/day</li>
                  </ul>
                  <Button className="w-full">$9.99/মাস</Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">প্রিমিয়াম প্ল্যান / Premium Plan</h4>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>✓ ৬০ সেকেন্ড ভিডিও / 60s videos</li>
                    <li>✓ 1080p গুণমান / 1080p quality</li>
                    <li>✓ সীমাহীন ভিডিও / Unlimited videos</li>
                  </ul>
                  <Button className="w-full">$29.99/মাস</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
