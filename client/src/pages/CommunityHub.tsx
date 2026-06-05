import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface StudyGroup {
  id: string;
  name: string;
  topic: string;
  memberCount: number;
  maxMembers: number;
  lastActivity: Date;
  role?: "member" | "admin";
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorName: string;
  topic: string;
  tags: string[];
  views: number;
  replies: number;
  likes: number;
  isResolved: boolean;
  createdAt: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
}

export default function CommunityHub() {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
    {
      id: "group_1",
      name: "Advanced Mathematics",
      topic: "Mathematics",
      memberCount: 8,
      maxMembers: 20,
      lastActivity: new Date(),
      role: "member",
    },
    {
      id: "group_2",
      name: "Web Dev Enthusiasts",
      topic: "Programming",
      memberCount: 12,
      maxMembers: 30,
      lastActivity: new Date(Date.now() - 3600000),
      role: "admin",
    },
  ]);

  const [forumThreads] = useState<ForumThread[]>([
    {
      id: "thread_1",
      title: "How to master calculus?",
      content: "I'm struggling with calculus concepts...",
      authorName: "Student A",
      topic: "Mathematics",
      tags: ["calculus", "help"],
      views: 145,
      replies: 8,
      likes: 23,
      isResolved: true,
      createdAt: new Date(),
    },
    {
      id: "thread_2",
      title: "Best resources for learning React",
      content: "Looking for recommended resources...",
      authorName: "Developer B",
      topic: "Programming",
      tags: ["react", "resources"],
      views: 312,
      replies: 15,
      likes: 42,
      isResolved: false,
      createdAt: new Date(Date.now() - 86400000),
    },
  ]);

  const [userBadges] = useState<Badge[]>([
    {
      id: "badge_1",
      name: "First Step",
      description: "Complete your first learning activity",
      icon: "🎯",
      points: 10,
      unlockedAt: new Date(Date.now() - 2592000000),
    },
    {
      id: "badge_2",
      name: "Confidence Builder",
      description: "Reach 80% confidence in any topic",
      icon: "💪",
      points: 75,
      unlockedAt: new Date(Date.now() - 1209600000),
    },
    {
      id: "badge_3",
      name: "Week Warrior",
      description: "Maintain a 7-day learning streak",
      icon: "⚔️",
      points: 50,
      unlockedAt: new Date(Date.now() - 604800000),
    },
  ]);

  const leaderboardData = [
    { rank: 1, name: "Alex Chen", points: 2850, level: 12 },
    { rank: 2, name: "Sarah Johnson", points: 2650, level: 11 },
    { rank: 3, name: "Mike Davis", points: 2420, level: 10 },
    { rank: 4, name: "You", points: 1850, level: 8 },
    { rank: 5, name: "Emma Wilson", points: 1720, level: 7 },
  ];

  const streakData = [
    { day: "Mon", points: 50 },
    { day: "Tue", points: 75 },
    { day: "Wed", points: 60 },
    { day: "Thu", points: 85 },
    { day: "Fri", points: 90 },
    { day: "Sat", points: 100 },
    { day: "Sun", points: 70 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Community Hub</h1>
          <p className="text-purple-200">Connect, collaborate, and grow together</p>
        </div>

        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList className="bg-slate-800 border-purple-500/20">
            <TabsTrigger value="groups">Study Groups</TabsTrigger>
            <TabsTrigger value="forums">Forums</TabsTrigger>
            <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">My Study Groups</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                + Create Group
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyGroups.map((group) => (
                <Card key={group.id} className="bg-slate-800 border-purple-500/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{group.name}</CardTitle>
                        <CardDescription className="text-purple-300">{group.topic}</CardDescription>
                      </div>
                      <Badge variant="outline" className="border-purple-500 text-purple-300">
                        {group.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-200">
                        {group.memberCount}/{group.maxMembers} Members
                      </span>
                      <span className="text-xs text-purple-300">
                        Last active: {group.lastActivity.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(group.memberCount / group.maxMembers) * 100}%` }}
                      ></div>
                    </div>
                    <Button className="w-full border-purple-500/30 text-purple-200" variant="outline">
                      View Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Forums Tab */}
          <TabsContent value="forums" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Discussion Forums</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                + Create Thread
              </Button>
            </div>

            <div className="space-y-4">
              {forumThreads.map((thread) => (
                <Card key={thread.id} className="bg-slate-800 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white">{thread.title}</CardTitle>
                        <CardDescription className="text-purple-300">
                          by {thread.authorName} • {thread.createdAt.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {thread.isResolved && (
                        <Badge className="bg-green-600/20 text-green-400 border-green-500/30">✓ Resolved</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-purple-200">{thread.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {thread.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-purple-500/30 text-purple-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-purple-300">
                      <span>👁️ {thread.views} views</span>
                      <span>💬 {thread.replies} replies</span>
                      <span>❤️ {thread.likes} likes</span>
                    </div>
                    <Button className="w-full border-purple-500/30 text-purple-200" variant="outline">
                      View Thread
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Your Badges & Achievements</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userBadges.map((badge) => (
                <Card key={badge.id} className="bg-slate-800 border-purple-500/20">
                  <CardHeader className="text-center">
                    <div className="text-5xl mb-2">{badge.icon}</div>
                    <CardTitle className="text-white">{badge.name}</CardTitle>
                    <CardDescription className="text-purple-300">{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                      +{badge.points} points
                    </Badge>
                    <p className="text-xs text-purple-300 mt-2">
                      Unlocked {badge.unlockedAt?.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-800 border-purple-500/20 mt-8">
              <CardHeader>
                <CardTitle className="text-white">Locked Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: "👑", name: "Month Master", progress: "5/30 days" },
                    { icon: "🏆", name: "Community Champion", progress: "3/5 groups" },
                    { icon: "💯", name: "Perfect Score", progress: "1/1 needed" },
                  ].map((achievement, idx) => (
                    <div key={idx} className="p-4 bg-slate-700 rounded-lg border border-purple-500/20 opacity-50">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="text-sm text-purple-200 font-semibold">{achievement.name}</p>
                      <p className="text-xs text-purple-300">{achievement.progress}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              {/* Global Leaderboard */}
              <Card className="lg:col-span-2 bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Global Leaderboard</CardTitle>
                  <CardDescription className="text-purple-300">Top learners this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboardData.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          entry.name === "You"
                            ? "bg-purple-600/20 border border-purple-500/30"
                            : "bg-slate-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-purple-300">#{entry.rank}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-600 text-white">
                              {entry.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white font-semibold">{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-200 font-semibold">{entry.points} pts</p>
                          <p className="text-xs text-purple-300">Level {entry.level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Stats */}
              <Card className="bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Current Rank</p>
                    <p className="text-3xl font-bold text-white">#42</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Total Points</p>
                    <p className="text-3xl font-bold text-white">1,850</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-white">23 days</p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Streak Chart */}
            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Weekly Activity</CardTitle>
                <CardDescription className="text-purple-300">Points earned each day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={streakData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #6d28d9" }}
                      labelStyle={{ color: "#e0e7ff" }}
                    />
                    <Bar dataKey="points" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
