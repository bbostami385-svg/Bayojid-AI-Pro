import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Bell, Trash2, Check, Settings, Volume2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Notifications() {
  const [selectedTab, setSelectedTab] = useState("notifications");

  const notificationsQuery = trpc.notifications.getNotifications.useQuery({});
  const preferencesQuery = trpc.notifications.getPreferences.useQuery();
  const statsQuery = trpc.notifications.getStatistics.useQuery();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const deleteNotificationMutation = trpc.notifications.deleteNotification.useMutation();
  const updatePreferencesMutation = trpc.notifications.updatePreferences.useMutation();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId });
      notificationsQuery.refetch();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      notificationsQuery.refetch();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync({ notificationId });
      notificationsQuery.refetch();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    try {
      await updatePreferencesMutation.mutateAsync({
        [key]: value,
      } as any);
      preferencesQuery.refetch();
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ai_response":
        return "🤖";
      case "share":
        return "📤";
      case "rating":
        return "⭐";
      case "community":
        return "👥";
      case "system":
        return "⚙️";
      default:
        return "📢";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">নোটিফিকেশন / Notifications</h1>
          <p className="text-gray-600">আপনার সমস্ত বিজ্ঞপ্তি এবং পছন্দগুলি পরিচালনা করুন</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">নোটিফিকেশন</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">পছন্দ</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <span>📊</span>
              <span className="hidden sm:inline">পরিসংখ্যান</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                <Check className="w-4 h-4 mr-2" />
                সব পড়া হিসেবে চিহ্নিত করুন / Mark All Read
              </Button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notificationsQuery.data?.notifications?.map((notification: any) => (
                <Card key={notification.id} className={notification.read ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString("bn-BD")}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {notificationsQuery.data?.notifications?.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">কোন নোটিফিকেশন নেই / No notifications</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>নোটিফিকেশন ধরন / Notification Types</CardTitle>
                <CardDescription>কোন ধরনের নোটিফিকেশন পেতে চান তা নির্বাচন করুন</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferencesQuery.data && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">AI প্রতিক্রিয়া / AI Response</label>
                      <Switch
                        checked={preferencesQuery.data.aiResponse}
                        onCheckedChange={(value) =>
                          handlePreferenceChange("aiResponse", value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">শেয়ার নোটিফিকেশন / Share</label>
                      <Switch
                        checked={preferencesQuery.data.shareNotifications}
                        onCheckedChange={(value) =>
                          handlePreferenceChange("shareNotifications", value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">রেটিং / Ratings</label>
                      <Switch
                        checked={preferencesQuery.data.ratingNotifications}
                        onCheckedChange={(value) =>
                          handlePreferenceChange("ratingNotifications", value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">কমিউনিটি / Community</label>
                      <Switch
                        checked={preferencesQuery.data.communityNotifications}
                        onCheckedChange={(value) =>
                          handlePreferenceChange("communityNotifications", value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">সিস্টেম / System</label>
                      <Switch
                        checked={preferencesQuery.data.systemNotifications}
                        onCheckedChange={(value) =>
                          handlePreferenceChange("systemNotifications", value)
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ডেলিভারি পদ্ধতি / Delivery Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferencesQuery.data && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">পুশ নোটিফিকেশন / Push</label>
                      <Switch
                        checked={preferencesQuery.data.pushNotifications}
                        onCheckedChange={(value) =>
                          handlePreferenceChange("pushNotifications", value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">ইমেল / Email</label>
                      <Switch
                        checked={preferencesQuery.data.emailNotifications}
                        onCheckedChange={(value) =>
                          handlePreferenceChange("emailNotifications", value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        <Volume2 className="w-4 h-4 inline mr-2" />
                        শব্দ / Sound
                      </label>
                      <Switch
                        checked={preferencesQuery.data.soundEnabled}
                        onCheckedChange={(value) =>
                          handlePreferenceChange("soundEnabled", value)
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  শান্ত সময় / Quiet Hours
                </CardTitle>
                <CardDescription>এই সময়ে নোটিফিকেশন পাবেন না</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferencesQuery.data?.quietHours && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">সক্ষম করুন / Enable</label>
                      <Switch checked={preferencesQuery.data.quietHours.enabled} />
                    </div>

                    {preferencesQuery.data.quietHours.enabled && (
                      <>
                        <div>
                          <label className="text-sm font-medium">শুরু / Start Time</label>
                          <input
                            type="time"
                            defaultValue={preferencesQuery.data.quietHours.startTime}
                            className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">শেষ / End Time</label>
                          <input
                            type="time"
                            defaultValue={preferencesQuery.data.quietHours.endTime}
                            className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">মোট নোটিফিকেশন / Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {statsQuery.data?.totalNotifications || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">অপড়া / Unread</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {statsQuery.data?.unreadCount || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">আজ / Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {statsQuery.data?.todayCount || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">এই সপ্তাহে / This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {statsQuery.data?.thisWeekCount || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ধরন অনুযায়ী / By Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statsQuery.data?.byType && (
                  <>
                    {Object.entries(statsQuery.data.byType).map(([type, count]: any) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {type.replace("_", " ")}
                        </span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
