import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ModerationDashboard() {
  const [activeTab, setActiveTab] = useState("reports");

  // Fetch moderation data
  const { data: stats } = trpc.moderation.getModerationStats.useQuery();
  const { data: reports } = trpc.moderation.getPendingReports.useQuery({
    status: "pending",
    limit: 20,
  });
  const { data: queue } = trpc.moderation.getModerationQueue.useQuery();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">মডারেশন ড্যাশবোর্ড / Moderation Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">মোট রিপোর্ট / Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground">সব সময় / All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">অপেক্ষমাণ / Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingReports || 0}</div>
            <p className="text-xs text-muted-foreground">পর্যালোচনার জন্য অপেক্ষা করছে</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">সমাধান করা / Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.resolvedReports || 0}</div>
            <p className="text-xs text-muted-foreground">সফলভাবে সমাধান করা</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">নিষিদ্ধ ব্যবহারকারী / Banned Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.bannedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">সক্রিয় নিষেধ</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">রিপোর্ট / Reports</TabsTrigger>
          <TabsTrigger value="queue">কিউ / Queue</TabsTrigger>
          <TabsTrigger value="stats">পরিসংখ্যান / Stats</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>অপেক্ষমাণ রিপোর্ট / Pending Reports</CardTitle>
              <CardDescription>পর্যালোচনার জন্য অপেক্ষা করছে এমন রিপোর্ট</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.reports?.map((report: any) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{report.contentType}</p>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                      <Badge variant="outline">{report.reason}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        অনুমোদন / Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        প্রত্যাখ্যান / Reject
                      </Button>
                      <Button size="sm" variant="destructive">
                        কন্টেন্ট সরান / Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>মডারেশন কিউ / Moderation Queue</CardTitle>
              <CardDescription>পর্যালোচনার জন্য অপেক্ষা করছে এমন আইটেম</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {queue?.queue?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                    <Badge variant={item.priority === "high" ? "destructive" : "secondary"}>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>রিপোর্ট পরিসংখ্যান / Report Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>স্প্যাম / Spam</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded h-2">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${(stats?.reportsByReason?.spam || 0) / 2}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">{stats?.reportsByReason?.spam || 0}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>অনুপযুক্ত / Inappropriate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded h-2">
                      <div
                        className="bg-orange-500 h-2 rounded"
                        style={{ width: `${(stats?.reportsByReason?.inappropriate || 0) / 2}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">
                      {stats?.reportsByReason?.inappropriate || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>আক্রমণাত্মক / Offensive</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded h-2">
                      <div
                        className="bg-red-500 h-2 rounded"
                        style={{ width: `${(stats?.reportsByReason?.offensive || 0) / 2}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">{stats?.reportsByReason?.offensive || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
