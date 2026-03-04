import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Zap, Star, Users, Download, Trash2, Edit, Copy } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CustomAIModels() {
  const [activeTab, setActiveTab] = useState("my-models");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "",
    systemPrompt: "",
    isPublic: false,
  });

  const userModelsQuery = trpc.customModels.getUserCustomModels.useQuery({});
  const publicModelsQuery = trpc.customModels.getPublicCustomModels.useQuery({
    limit: 20,
    sortBy: "popular",
  });

  const createModelMutation = trpc.customModels.createCustomModel.useMutation();
  const deleteModelMutation = trpc.customModels.deleteCustomModel.useMutation();
  const cloneModelMutation = trpc.customModels.cloneCustomModel.useMutation();

  const handleCreateModel = async () => {
    try {
      await createModelMutation.mutateAsync({
        ...formData,
        tags: [],
      });
      setFormData({
        name: "",
        description: "",
        personality: "",
        systemPrompt: "",
        isPublic: false,
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to create model:", error);
    }
  };

  const handleDeleteModel = async (modelId: number) => {
    if (confirm("এই মডেল মুছে ফেলতে চান? / Delete this model?")) {
      try {
        await deleteModelMutation.mutateAsync({ modelId });
      } catch (error) {
        console.error("Failed to delete model:", error);
      }
    }
  };

  const handleCloneModel = async (sourceModelId: number, sourceName: string) => {
    try {
      await cloneModelMutation.mutateAsync({
        sourceModelId,
        newName: `${sourceName} (কপি / Copy)`,
      });
    } catch (error) {
      console.error("Failed to clone model:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">কাস্টম AI মডেল / Custom AI Models</h1>
            <p className="text-gray-600">আপনার নিজস্ব AI ব্যক্তিত্ব তৈরি করুন / Create your own AI personality</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন মডেল / New Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>নতুন AI মডেল তৈরি করুন / Create New AI Model</DialogTitle>
                <DialogDescription>আপনার কাস্টম AI ব্যক্তিত্ব সংজ্ঞায়িত করুন</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">মডেল নাম / Model Name</label>
                  <Input
                    placeholder="যেমন: বন্ধুত্বপূর্ণ সহায়ক / e.g., Friendly Assistant"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">বর্ণনা / Description</label>
                  <Textarea
                    placeholder="এই মডেল কী করে তা বর্ণনা করুন"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ব্যক্তিত্ব / Personality</label>
                  <Textarea
                    placeholder="এই মডেলের ব্যক্তিত্ব বৈশিষ্ট্য বর্ণনা করুন"
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">সিস্টেম প্রম্পট / System Prompt</label>
                  <Textarea
                    placeholder="AI এর জন্য সিস্টেম নির্দেশনা"
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    এটি জনসাধারণের জন্য উপলব্ধ করুন / Make this model public
                  </label>
                </div>

                <Button onClick={handleCreateModel} className="w-full">
                  মডেল তৈরি করুন / Create Model
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-models">আমার মডেল / My Models</TabsTrigger>
            <TabsTrigger value="marketplace">মার্কেটপ্লেস / Marketplace</TabsTrigger>
          </TabsList>

          {/* My Models Tab */}
          <TabsContent value="my-models" className="space-y-4">
            {userModelsQuery.data?.models && userModelsQuery.data.models.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userModelsQuery.data.models.map((model: any) => (
                  <Card key={model.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">{model.description}</CardDescription>
                        </div>
                        {model.isPublic && <Badge>জনসাধারণ / Public</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{model.personality}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Edit className="w-3 h-3" />
                          সম্পাদনা
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleCloneModel(model.id, model.name)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-600"
                          onClick={() => handleDeleteModel(model.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">কোনো কাস্টম মডেল নেই / No custom models yet</p>
                <Button onClick={() => setShowCreateDialog(true)}>প্রথম মডেল তৈরি করুন / Create Your First Model</Button>
              </Card>
            )}
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicModelsQuery.data?.models && publicModelsQuery.data.models.length > 0 ? (
                publicModelsQuery.data.models.map((model: any) => (
                  <Card key={model.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {model.creator} দ্বারা / by {model.creator}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{model.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{model.rating}</span>
                          <span className="text-xs text-gray-500">({model.totalRatings})</span>
                        </div>
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {model.followers}
                        </Badge>
                      </div>
                      <Button className="w-full gap-2">
                        <Download className="w-4 h-4" />
                        ব্যবহার করুন / Use
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full text-center py-12">
                  <p className="text-gray-600">কোনো জনসাধারণের মডেল নেই / No public models available</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
