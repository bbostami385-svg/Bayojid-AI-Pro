import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Scissors,
  Palette,
  Type,
  Volume2,
  Zap,
  Download,
  Play,
  Pause,
  RotateCcw,
  Save,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function VideoEditor() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [filterIntensity, setFilterIntensity] = useState(50);
  const [textOverlay, setTextOverlay] = useState("");
  const [musicVolume, setMusicVolume] = useState(50);

  const getPresetsQuery = trpc.videoEditor.getPresets.useQuery();
  const trimVideoMutation = trpc.videoEditor.trimVideo.useMutation();
  const applyFilterMutation = trpc.videoEditor.applyFilter.useMutation();
  const addTextMutation = trpc.videoEditor.addTextOverlay.useMutation();
  const exportVideoMutation = trpc.videoEditor.exportVideo.useMutation();

  const handleApplyFilter = async () => {
    if (!videoUrl || !selectedFilter) return;
    try {
      await applyFilterMutation.mutateAsync({
        videoUrl,
        filter: selectedFilter as any,
        intensity: filterIntensity,
      });
    } catch (error) {
      console.error("Failed to apply filter:", error);
    }
  };

  const handleAddText = async () => {
    if (!videoUrl || !textOverlay) return;
    try {
      await addTextMutation.mutateAsync({
        videoUrl,
        text: textOverlay,
        position: "center",
        fontSize: 24,
        color: "#FFFFFF",
      });
    } catch (error) {
      console.error("Failed to add text:", error);
    }
  };

  const handleExport = async () => {
    if (!videoUrl) return;
    try {
      const result = await exportVideoMutation.mutateAsync({
        projectId: 1,
        format: "mp4",
        quality: "high",
      });
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to export video:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ভিডিও এডিটর / Video Editor</h1>
          <p className="text-gray-600">আপনার ভিডিও সম্পাদনা করুন এবং কাস্টমাইজ করুন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ভিডিও প্রিভিউ / Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {videoUrl ? (
                  <div className="space-y-4">
                    <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                      <video
                        src={videoUrl}
                        className="w-full h-full"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        controls
                      />
                    </div>

                    {/* Playback Controls */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-4 h-4" />
                              বিরাম / Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              চালান / Play
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <RotateCcw className="w-4 h-4" />
                          পুনরায় সেট করুন / Reset
                        </Button>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-1">
                        <Slider
                          value={[currentTime]}
                          max={duration}
                          step={0.1}
                          onValueChange={(value) => setCurrentTime(value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{Math.floor(currentTime)}s</span>
                          <span>{Math.floor(duration)}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">ভিডিও আপলোড করুন / Upload a video</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setVideoUrl(url);
                          }
                        }}
                        className="hidden"
                        id="video-upload"
                      />
                      <Button asChild>
                        <label htmlFor="video-upload">ফাইল নির্বাচন করুন / Select File</label>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Editing Tools */}
          <div className="space-y-4">
            <Tabs defaultValue="filters" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="filters" className="gap-1">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">ফিল্টার</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-1">
                  <Type className="w-4 h-4" />
                  <span className="hidden sm:inline">টেক্সট</span>
                </TabsTrigger>
                <TabsTrigger value="audio" className="gap-1">
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">অডিও</span>
                </TabsTrigger>
              </TabsList>

              {/* Filters Tab */}
              <TabsContent value="filters" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">ফিল্টার প্রয়োগ করুন / Apply Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {getPresetsQuery.data?.filters.map((filter: any) => (
                        <Button
                          key={filter.id}
                          variant={selectedFilter === filter.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedFilter(filter.id)}
                        >
                          {filter.name}
                        </Button>
                      ))}
                    </div>

                    {selectedFilter && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">তীব্রতা / Intensity</label>
                        <Slider
                          value={[filterIntensity]}
                          max={100}
                          step={1}
                          onValueChange={(value) => setFilterIntensity(value[0])}
                        />
                        <div className="text-xs text-gray-600">{filterIntensity}%</div>
                      </div>
                    )}

                    <Button onClick={handleApplyFilter} className="w-full" disabled={!selectedFilter}>
                      <Zap className="w-4 h-4 mr-2" />
                      ফিল্টার প্রয়োগ করুন / Apply
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Text Tab */}
              <TabsContent value="text" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">টেক্সট ওভারলে / Text Overlay</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <input
                      type="text"
                      placeholder="টেক্সট লিখুন... / Enter text..."
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">অবস্থান / Position</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["শীর্ষ", "মধ্য", "নীচ"].map((pos) => (
                          <Button key={pos} variant="outline" size="sm">
                            {pos}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleAddText} className="w-full" disabled={!textOverlay}>
                      <Type className="w-4 h-4 mr-2" />
                      টেক্সট যোগ করুন / Add Text
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Audio Tab */}
              <TabsContent value="audio" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">অডিও নিয়ন্ত্রণ / Audio Control</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">সঙ্গীত ভলিউম / Music Volume</label>
                      <Slider
                        value={[musicVolume]}
                        max={100}
                        step={1}
                        onValueChange={(value) => setMusicVolume(value[0])}
                      />
                      <div className="text-xs text-gray-600">{musicVolume}%</div>
                    </div>

                    <Button variant="outline" className="w-full gap-2">
                      <Volume2 className="w-4 h-4" />
                      সঙ্গীত যোগ করুন / Add Music
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Export Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">রপ্তানি / Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ফরম্যাট / Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["MP4", "WebM"].map((format) => (
                      <Button key={format} variant="outline" size="sm">
                        {format}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">গুণমান / Quality</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["উচ্চ", "অতি উচ্চ"].map((quality) => (
                      <Button key={quality} variant="outline" size="sm">
                        {quality}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleExport} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  রপ্তানি করুন / Export
                </Button>

                <Button variant="outline" className="w-full gap-2">
                  <Save className="w-4 h-4" />
                  প্রকল্প সংরক্ষণ করুন / Save Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
