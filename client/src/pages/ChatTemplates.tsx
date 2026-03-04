import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ChatTemplates() {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
  });

  // Queries
  const { data: templates, isLoading, refetch } = trpc.templates.list.useQuery();

  // Mutations
  const createMutation = trpc.templates.create.useMutation();
  const updateMutation = trpc.templates.update.useMutation();
  const deleteMutation = trpc.templates.delete.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("শিরোনাম এবং বিষয়বস্তু প্রয়োজন / Title and content are required");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          templateId: editingId,
          ...formData,
        });
        toast.success("টেমপ্লেট আপডেট হয়েছে / Template updated");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("টেমপ্লেট তৈরি হয়েছে / Template created");
      }
      setFormData({ title: "", content: "", category: "" });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("টেমপ্লেট সংরক্ষণ ব্যর্থ / Failed to save template");
    }
  };

  const handleEdit = (template: any) => {
    setFormData({
      title: template.title,
      content: template.content,
      category: template.category || "",
    });
    setEditingId(template.id);
    setIsOpen(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm("এই টেমপ্লেট মুছে ফেলতে চান? / Delete this template?")) return;

    try {
      await deleteMutation.mutateAsync({ templateId });
      toast.success("টেমপ্লেট মুছে ফেলা হয়েছে / Template deleted");
      refetch();
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("টেমপ্লেট মুছতে ব্যর্থ / Failed to delete template");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({ title: "", content: "", category: "" });
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                চ্যাট টেমপ্লেট / Chat Templates
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                দ্রুত প্রতিক্রিয়া টেমপ্লেট তৈরি করুন / Create quick response templates
              </p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                নতুন টেমপ্লেট / New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "টেমপ্লেট সম্পাদনা / Edit Template" : "নতুন টেমপ্লেট / New Template"}
                </DialogTitle>
                <DialogDescription>
                  আপনার চ্যাট টেমপ্লেট তৈরি বা সম্পাদনা করুন / Create or edit your chat template
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    শিরোনাম / Title
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="যেমন: স্বাগত বার্তা / e.g., Welcome Message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    বিষয়বস্তু / Content
                  </label>
                  <Textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="আপনার টেমপ্লেট বিষয়বস্তু লিখুন / Write your template content..."
                    className="min-h-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ক্যাটেগরি / Category (ঐচ্ছিক / Optional)
                  </label>
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="যেমন: গ্রাহক সেবা / e.g., Customer Service"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={handleClose}>
                    বাতিল / Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        সংরক্ষণ করছি / Saving...
                      </>
                    ) : (
                      "সংরক্ষণ করুন / Save"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template: any) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      {template.category && (
                        <CardDescription className="mt-1">
                          {template.category}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                    {template.content}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                    {new Date(template.createdAt).toLocaleDateString("bn-BD")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                এখনও কোন টেমপ্লেট নেই / No templates yet
              </p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="h-4 w-4 mr-2" />
                    প্রথম টেমপ্লেট তৈরি করুন / Create your first template
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
