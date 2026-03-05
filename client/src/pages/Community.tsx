import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Heart, Download, Star, Share2, TrendingUp, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Community() {
  const [selectedTab, setSelectedTab] = useState("models");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const modelsQuery = trpc.community.getMarketplaceModels.useQuery({
    search: searchQuery,
    category: selectedCategory,
  });

  const templatesQuery = trpc.community.getMarketplaceTemplates.useQuery({
    search: searchQuery,
    category: selectedCategory,
  });

  const statsQuery = trpc.community.getCommunityStats.useQuery();
  const trendingQuery = trpc.community.getTrendingItems.useQuery();

  const downloadModelMutation = trpc.community.downloadModel.useMutation();
  const downloadTemplateMutation = trpc.community.downloadTemplate.useMutation();
  const followCreatorMutation = trpc.community.followCreator.useMutation();

  const handleDownloadModel = async (modelId: string) => {
    try {
      await downloadModelMutation.mutateAsync({ modelId });
    } catch (error) {
      console.error("Failed to download model:", error);
    }
  };

  const handleDownloadTemplate = async (templateId: string) => {
    try {
      await downloadTemplateMutation.mutateAsync({ templateId });
    } catch (error) {
      console.error("Failed to download template:", error);
    }
  };

  const handleFollowCreator = async (creatorId: string) => {
    try {
      await followCreatorMutation.mutateAsync({ creatorId });
    } catch (error) {
      console.error("Failed to follow creator:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">কমিউনিটি মার্কেটপ্লেস / Community Marketplace</h1>
          <p className="text-gray-600">সম্প্রদায়ের সাথে আপনার মডেল এবং টেমপ্লেট শেয়ার করুন</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {statsQuery.data?.totalModels || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">মডেল / Models</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {statsQuery.data?.totalTemplates || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">টেমপ্লেট / Templates</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {statsQuery.data?.totalUsers || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">ব্যবহারকারী / Users</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {statsQuery.data?.totalDownloads || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">ডাউনলোড / Downloads</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <Input
                placeholder="অনুসন্ধান করুন... / Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="">সব বিভাগ / All Categories</option>
                <option value="creative">সৃজনশীল / Creative</option>
                <option value="technical">প্রযুক্তিগত / Technical</option>
                <option value="friendly">বন্ধুত্বপূর্ণ / Friendly</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="models">মডেল</TabsTrigger>
            <TabsTrigger value="templates">টেমপ্লেট</TabsTrigger>
            <TabsTrigger value="trending">ট্রেন্ডিং</TabsTrigger>
            <TabsTrigger value="creators">ক্রিয়েটর</TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modelsQuery.data?.models?.map((model: any) => (
                <Card key={model.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-4xl">{model.thumbnail}</div>
                      <Badge variant="secondary">{model.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{model.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {model.author}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{model.description}</p>

                    {/* Rating and Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{model.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{model.downloads}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {model.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleDownloadModel(model.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        ডাউনলোড / Download
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesQuery.data?.templates?.map((template: any) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-4xl">{template.thumbnail}</div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.author}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{template.description}</p>

                    {/* Rating and Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{template.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{template.downloads}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {template.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleDownloadTemplate(template.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        ডাউনলোড / Download
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trending Models */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    ট্রেন্ডিং মডেল / Trending Models
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingQuery.data?.trendingModels?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm">{item.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.trend === "up" ? "📈" : "📉"} {item.trendPercent}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trending Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    ট্রেন্ডিং টেমপ্লেট / Trending Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingQuery.data?.trendingTemplates?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm">{item.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.trend === "up" ? "📈" : "📉"} {item.trendPercent}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value="creators" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statsQuery.data?.topCreators?.map((creator: any) => (
                <Card key={creator.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {creator.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold">{creator.models}</div>
                        <p className="text-xs text-gray-600">মডেল</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{creator.templates}</div>
                        <p className="text-xs text-gray-600">টেমপ্লেট</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{creator.followers}</div>
                        <p className="text-xs text-gray-600">ফলোয়ার</p>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleFollowCreator(creator.id)}
                    >
                      অনুসরণ করুন / Follow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
