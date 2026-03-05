import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Reputation() {
  const [activeTab, setActiveTab] = useState("profile");
  const [period, setPeriod] = useState<"all_time" | "monthly" | "weekly">("all_time");

  // Fetch reputation data
  const { data: reputation } = trpc.reputation.getUserReputation.useQuery({});
  const { data: rank } = trpc.reputation.getUserRank.useQuery({ period });
  const { data: leaderboard } = trpc.reputation.getLeaderboard.useQuery({ period, limit: 100 });
  const { data: badges } = trpc.reputation.getAvailableBadges.useQuery();
  const { data: achievements } = trpc.reputation.getAchievements.useQuery({});
  const { data: history } = trpc.reputation.getReputationHistory.useQuery({ limit: 20 });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">খ্যাতি এবং লিডারবোর্ড / Reputation & Leaderboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">প্রোফাইল / Profile</TabsTrigger>
          <TabsTrigger value="leaderboard">লিডারবোর্ড / Leaderboard</TabsTrigger>
          <TabsTrigger value="badges">ব্যাজ / Badges</TabsTrigger>
          <TabsTrigger value="history">ইতিহাস / History</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>মোট পয়েন্ট / Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{reputation?.totalPoints || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">লেভেল {reputation?.level}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>র‍্যাঙ্ক / Rank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">#{rank?.rank || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {rank?.percentile || 0}th percentile
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>পরবর্তী লেভেল / Next Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={rank?.pointsToNextRank ? 100 - rank.pointsToNextRank : 0} />
                  <p className="text-sm text-muted-foreground">
                    {rank?.pointsToNextRank || 0} পয়েন্ট বাকি
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reputation Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>খ্যাতি বিভাজন / Reputation Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>মডেল শেয়ার / Model Shares</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded h-2">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{
                          width: `${((reputation?.reputationBreakdown?.modelShares || 0) / (reputation?.totalPoints || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">
                      {reputation?.reputationBreakdown?.modelShares || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>টেমপ্লেট শেয়ার / Template Shares</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded h-2">
                      <div
                        className="bg-green-500 h-2 rounded"
                        style={{
                          width: `${((reputation?.reputationBreakdown?.templateShares || 0) / (reputation?.totalPoints || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">
                      {reputation?.reputationBreakdown?.templateShares || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>রেটিং / Ratings</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded"
                        style={{
                          width: `${((reputation?.reputationBreakdown?.ratings || 0) / (reputation?.totalPoints || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">
                      {reputation?.reputationBreakdown?.ratings || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>ব্যাজ / Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reputation?.badges?.map((badge: any) => (
                  <div key={badge.id} className="text-center p-4 border rounded-lg">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={period === "all_time" ? "default" : "outline"}
              onClick={() => setPeriod("all_time" as const)}
            >
              সব সময় / All Time
            </Button>
            <Button
              variant={period === "monthly" ? "default" : "outline"}
              onClick={() => setPeriod("monthly" as const)}
            >
              মাসিক / Monthly
            </Button>
            <Button
              variant={period === "weekly" ? "default" : "outline"}
              onClick={() => setPeriod("weekly" as const)}
            >
              সাপ্তাহিক / Weekly
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>শীর্ষ ব্যবহারকারী / Top Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard?.leaderboard?.map((user: any) => (
                  <div
                    key={user.userId}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold w-8 text-center">#{user.rank}</div>
                      <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          লেভেল {user.level} • {user.modelCount} মডেল • {user.templateCount} টেমপ্লেট
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{user.points}</div>
                      <p className="text-sm text-muted-foreground">পয়েন্ট</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>উপলব্ধ ব্যাজ / Available Badges</CardTitle>
              <CardDescription>এই ব্যাজগুলি অর্জন করুন এবং আপনার খ্যাতি বৃদ্ধি করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges?.badges?.map((badge: any) => (
                  <div key={badge.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{badge.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <div className="mt-2">
                          <Badge variant={badge.rarity === "rare" ? "secondary" : "outline"}>
                            {badge.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{badge.requirement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>খ্যাতি ইতিহাস / Reputation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history?.history?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                    <Badge variant={item.points > 0 ? "default" : "destructive"}>
                      {item.points > 0 ? "+" : ""}{item.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
