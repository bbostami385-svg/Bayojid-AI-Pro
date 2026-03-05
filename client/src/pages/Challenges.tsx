import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Challenges() {
  const [selectedTab, setSelectedTab] = useState("active");

  // Fetch challenges data
  const { data: activeChallenges } = trpc.challenges.getActiveChallenges.useQuery();
  const { data: completedChallenges } = trpc.challenges.getCompletedChallenges.useQuery();
  const { data: userStats } = trpc.challenges.getUserChallengeStats.useQuery();
  const { data: weeklyInfo } = trpc.challenges.getWeeklyChallengesInfo.useQuery();

  const completeMutation = trpc.challenges.completeChallenge.useMutation();

  const handleCompleteChallenge = (challengeId: string) => {
    completeMutation.mutate({ challengeId });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">সাপ্তাহিক চ্যালেঞ্জ / Weekly Challenges</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">সম্পূর্ণ চ্যালেঞ্জ / Completed</p>
            <p className="text-3xl font-bold">{userStats?.totalChallengesCompleted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">মোট পয়েন্ট / Total Points</p>
            <p className="text-3xl font-bold">{userStats?.totalPointsEarned}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">বর্তমান স্ট্রীক / Streak</p>
            <p className="text-3xl font-bold">{userStats?.currentStreak}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">পরবর্তী রিসেট / Next Reset</p>
            <p className="text-sm font-medium">
              {weeklyInfo?.timeUntilReset
                ? `${Math.floor(weeklyInfo.timeUntilReset / 86400)} দিন`
                : "শীঘ্রই"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>অর্জিত ব্যাজ / Earned Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {userStats?.badges?.map((badge: any) => (
              <div key={badge.id} className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                <span className="text-2xl">{badge.icon}</span>
                <span className="font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenges Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">সক্রিয় চ্যালেঞ্জ / Active</TabsTrigger>
          <TabsTrigger value="completed">সম্পূর্ণ / Completed</TabsTrigger>
        </TabsList>

        {/* Active Challenges */}
        <TabsContent value="active" className="space-y-4">
          {activeChallenges?.challenges?.map((challenge: any) => (
            <Card key={challenge.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{challenge.icon}</span>
                      <h3 className="text-lg font-bold">{challenge.title}</h3>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty === "easy"
                          ? "সহজ"
                          : challenge.difficulty === "medium"
                            ? "মাঝারি"
                            : "কঠিন"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">{challenge.reward}</p>
                    <p className="text-xs text-muted-foreground">পয়েন্ট</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>অগ্রগতি / Progress</span>
                    <span>
                      {challenge.progress}/{challenge.requirement}
                    </span>
                  </div>
                  <Progress value={(challenge.progress / challenge.requirement) * 100} />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    শেষ হয়: {new Date(challenge.endsAt).toLocaleDateString("bn-BD")}
                  </p>
                  <Button
                    onClick={() => handleCompleteChallenge(challenge.id)}
                    disabled={challenge.progress < challenge.requirement}
                  >
                    {challenge.progress >= challenge.requirement ? "দাবি করুন / Claim" : "চলছে"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Completed Challenges */}
        <TabsContent value="completed" className="space-y-4">
          {completedChallenges?.completed?.map((challenge: any) => (
            <Card key={challenge.id} className="opacity-75">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{challenge.icon}</span>
                      <h3 className="text-lg font-bold">{challenge.title}</h3>
                      <Badge variant="secondary">✓ সম্পূর্ণ</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">+{challenge.reward}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(challenge.completedAt).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Next Milestone */}
      {userStats?.nextMilestone && (
        <Card className="mt-8 border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900">পরবর্তী মাইলফলক / Next Milestone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">{userStats.nextMilestone.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {userStats.nextMilestone.requirement} চ্যালেঞ্জ সম্পূর্ণ করুন এবং {userStats.nextMilestone.reward} পয়েন্ট জিতুন
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>অগ্রগতি</span>
                  <span>
                    {userStats.nextMilestone.progress}/{userStats.nextMilestone.requirement}
                  </span>
                </div>
                <Progress value={(userStats.nextMilestone.progress / userStats.nextMilestone.requirement) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
