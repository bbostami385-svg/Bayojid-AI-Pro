import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Shield,
  LogOut,
  Camera,
  Save,
  X,
  Edit2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "AI enthusiast and developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual tRPC mutation
      console.log("Saving profile:", profileData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual tRPC mutation
      console.log("Changing password");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile, security, and preferences</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-slate-800/50 border-slate-700 sticky top-6">
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-lg mx-auto"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">{profileData.firstName} {profileData.lastName}</h2>
                <p className="text-sm text-gray-400">{profileData.email}</p>
              </div>
              <div className="pt-4 border-t border-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Email verified
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="w-4 h-4 text-blue-500" />
                  2FA enabled
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="profile" className="text-gray-300 data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="text-gray-300 data-[state=active]:text-white">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-gray-300 data-[state=active]:text-white">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="billing" className="text-gray-300 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="p-8 bg-slate-800/50 border-slate-700 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Personal Information</h3>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">First Name</label>
                    <Input
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Last Name</label>
                    <Input
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled
                    className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Phone</label>
                  <Input
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Location</label>
                  <Input
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg p-3 disabled:opacity-50"
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="p-8 bg-slate-800/50 border-slate-700 space-y-6">
                <h3 className="text-xl font-bold text-white">Change Password</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Current Password</label>
                    <Input
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">New Password</label>
                    <Input
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Confirm New Password</label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="bg-purple-500 hover:bg-purple-600 text-white w-full"
                  >
                    {isSaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>

                <div className="border-t border-slate-600 pt-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">2FA is enabled</p>
                      <p className="text-sm text-gray-400">Your account is protected with two-factor authentication</p>
                    </div>
                    <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                      Manage
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="p-8 bg-slate-800/50 border-slate-700 space-y-6">
                <h3 className="text-xl font-bold text-white">Notification Preferences</h3>

                <div className="space-y-4">
                  {[
                    { title: "Email Notifications", desc: "Receive updates via email" },
                    { title: "Push Notifications", desc: "Get push notifications on your device" },
                    { title: "Marketing Emails", desc: "Receive promotional content and offers" },
                    { title: "Security Alerts", desc: "Important security notifications" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <Card className="p-8 bg-slate-800/50 border-slate-700 space-y-6">
                <h3 className="text-xl font-bold text-white">Billing & Subscription</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg">
                    <p className="text-white font-medium">Current Plan: Pro</p>
                    <p className="text-sm text-gray-400">$29/month • Renews on Jan 15, 2025</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Payment Method</h4>
                    <div className="p-4 bg-slate-700/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">VISA</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-gray-400">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-slate-600 text-gray-300">
                        Update
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Billing History</h4>
                    <div className="space-y-2">
                      {[
                        { date: "Dec 15, 2024", amount: "$29.00", status: "Paid" },
                        { date: "Nov 15, 2024", amount: "$29.00", status: "Paid" },
                        { date: "Oct 15, 2024", amount: "$29.00", status: "Paid" },
                      ].map((invoice, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="text-white text-sm">{invoice.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white font-medium">{invoice.amount}</span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Logout Button */}
          <div className="mt-6">
            <Button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
