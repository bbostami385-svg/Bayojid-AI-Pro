import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, ArrowLeft, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Profile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    avatar: "",
    bio: "",
    status: "",
  });

  // Queries
  const { data: profile, isLoading: profileLoading } = trpc.profile.getProfile.useQuery();

  // Mutations
  const updateProfileMutation = trpc.profile.updateProfile.useMutation();

  useEffect(() => {
    if (profile) {
      setFormData({
        avatar: profile.avatar || "",
        bio: profile.bio || "",
        status: profile.status || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          avatar: base64,
        }));
        toast.success("অবতার আপলোড হয়েছে / Avatar uploaded");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("অবতার আপলোড ব্যর্থ / Avatar upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfileMutation.mutateAsync(formData);
      toast.success("প্রোফাইল সংরক্ষিত হয়েছে / Profile saved successfully");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("প্রোফাইল সংরক্ষণ ব্যর্থ / Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/", { replace: true })}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              আমার প্রোফাইল / My Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              আপনার প্রোফাইল কাস্টমাইজ করুন / Customize your profile
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle>প্রোফাইল তথ্য / Profile Information</CardTitle>
            <CardDescription>
              আপনার ব্যক্তিগত তথ্য এবং পছন্দ আপডেট করুন / Update your personal information and preferences
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={formData.avatar} alt="Profile avatar" />
                <AvatarFallback className="text-lg font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      অবতার পরিবর্তন করুন / Change Avatar
                    </span>
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PNG, JPG, GIF (সর্বোচ্চ 5MB / Max 5MB)
                </p>
              </div>
            </div>

            {/* User Info Display */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                ব্যবহারকারী / User
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {user?.name || "Unknown User"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user?.email || "No email"}
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                জীবনী / Bio
              </label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="আপনার জীবনী লিখুন / Write your bio..."
                className="min-h-24 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formData.bio.length}/500 অক্ষর / characters
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                স্ট্যাটাস / Status
              </label>
              <Input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                placeholder="আপনার স্ট্যাটাস লিখুন / Write your status..."
                maxLength={100}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formData.status.length}/100 অক্ষর / characters
              </p>
            </div>



            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    সংরক্ষণ করছি / Saving...
                  </>
                ) : (
                  "সংরক্ষণ করুন / Save Changes"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/", { replace: true })}
              >
                বাতিল / Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
