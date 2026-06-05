import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface LearningPath {
  id: string;
  topic: string;
  progress: number;
  level: "beginner" | "intermediate" | "advanced";
  completedSteps: number;
  totalSteps: number;
  confidence: number;
  lastActivity: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export default function LearningDashboard() {
  const { user } = useAuth();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);

  // Mock data - replace with actual tRPC calls
  useEffect(() => {
    // Simulate loading learning paths
    setLearningPaths([
      {
        id: "path1",
        topic: "Advanced Mathematics",
        progress: 65,
        level: "intermediate",
        completedSteps: 13,
        totalSteps: 20,
        confidence: 72,
        lastActivity: new Date(),
      },
      {
        id: "path2",
        topic: "Web Development",
        progress: 45,
        level: "beginner",
        completedSteps: 9,
        totalSteps: 20,
        confidence: 58,
        lastActivity: new Date(Date.now() - 86400000),
      },
      {
        id: "path3",
        topic: "Data Science",
        progress: 80,
        level: "advanced",
        completedSteps: 16,
        totalSteps: 20,
        confidence: 85,
        lastActivity: new Date(Date.now() - 172800000),
      },
    ]);

    setAchievements([
      {
        id: "ach1",
        title: "First Step",
        description: "Complete your first learning step",
        icon: "🎯",
        unlockedAt: new Date(Date.now() - 604800000),
      },
      {
        id: "ach2",
        title: "Confidence Builder",
        description: "Reach 70% confidence in a topic",
        icon: "💪",
        unlockedAt: new Date(Date.now() - 345600000),
      },
      {
        id: "ach3",
        title: "Mastery",
        description: "Complete a learning path",
        icon: "🏆",
        unlockedAt: new Date(Date.now() - 86400000),
      },
    ]);

    // Simulate progress data
    setProgressData([
      { week: "Week 1", confidence: 45, performance: 50 },
      { week: "Week 2", confidence: 52, performance: 58 },
      { week: "Week 3", confidence: 61, performance: 65 },
      { week: "Week 4", confidence: 68, performance: 72 },
      { week: "Week 5", confidence: 75, performance: 78 },
    ]);
  }, []);

  const totalProgress = learningPaths.length > 0 ? Math.round(learningPaths.reduce((sum, p) => sum + p.progress, 0) / learningPaths.length) : 0;
  const averageConfidence = learningPaths.length > 0 ? Math.round(learningPaths.reduce((sum, p) => sum + p.confidence, 0) / learningPaths.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Learning Dashboard</h1>
          <p className="text-purple-200">Welcome back, {user?.name}! Continue your learning journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalProgress}%</div>
              <Progress value={totalProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{averageConfidence}%</div>
              <p className="text-xs text-purple-300 mt-2">↑ 12% from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Active Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{learningPaths.length}</div>
              <p className="text-xs text-purple-300 mt-2">Topics in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{achievements.length}</div>
              <p className="text-xs text-purple-300 mt-2">Unlocked badges</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="paths" className="space-y-4">
          <TabsList className="bg-slate-800 border-purple-500/20">
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="progress">Progress Chart</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-4">
            {learningPaths.map((path) => (
              <Card key={path.id} className="bg-slate-800 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{path.topic}</CardTitle>
                      <CardDescription className="text-purple-300">
                        Step {path.completedSteps} of {path.totalSteps}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-purple-500 text-purple-300">
                      {path.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-purple-200">Progress</span>
                      <span className="text-sm font-semibold text-white">{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-purple-300 mb-1">Confidence Level</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${path.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-white">{path.confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-purple-300 mb-1">Last Activity</p>
                      <p className="text-sm text-white">
                        {path.lastActivity.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Progress Chart Tab */}
          <TabsContent value="progress">
            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Progress Over Time</CardTitle>
                <CardDescription className="text-purple-300">Your confidence and performance trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #6d28d9" }}
                      labelStyle={{ color: "#e0e7ff" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="confidence" stroke="#a78bfa" strokeWidth={2} name="Confidence" />
                    <Line type="monotone" dataKey="performance" stroke="#60a5fa" strokeWidth={2} name="Performance" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="bg-slate-800 border-purple-500/20">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <CardTitle className="text-white">{achievement.title}</CardTitle>
                    <CardDescription className="text-purple-300">{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-xs text-purple-300">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Personalized Recommendations</CardTitle>
                <CardDescription className="text-purple-300">Based on your learning progress and style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-700 rounded-lg border border-purple-500/20">
                  <h4 className="font-semibold text-white mb-2">📚 Next Topic to Master</h4>
                  <p className="text-purple-200">Based on your progress, we recommend focusing on "Advanced Functions" to strengthen your mathematics foundation.</p>
                  <Button className="mt-3 bg-purple-600 hover:bg-purple-700">Start Learning</Button>
                </div>

                <div className="p-4 bg-slate-700 rounded-lg border border-purple-500/20">
                  <h4 className="font-semibold text-white mb-2">⚡ Quick Review Needed</h4>
                  <p className="text-purple-200">Your confidence in "Calculus Basics" has dipped. A quick 15-minute review session could help boost it back up.</p>
                  <Button className="mt-3 bg-blue-600 hover:bg-blue-700">Review Now</Button>
                </div>

                <div className="p-4 bg-slate-700 rounded-lg border border-purple-500/20">
                  <h4 className="font-semibold text-white mb-2">🎯 Challenge Yourself</h4>
                  <p className="text-purple-200">You're doing great in Web Development! Try the advanced project to test your skills.</p>
                  <Button className="mt-3 bg-green-600 hover:bg-green-700">Take Challenge</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
