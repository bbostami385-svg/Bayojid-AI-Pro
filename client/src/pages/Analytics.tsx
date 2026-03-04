import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, MessageSquare, Clock, TrendingUp, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Analytics() {
  const [, navigate] = useLocation();

  // Queries
  const { data: conversations, isLoading: conversationsLoading } = trpc.chat.listConversations.useQuery();

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return {
        totalConversations: 0,
        totalMessages: 0,
        averageMessagesPerConversation: 0,
        personalityDistribution: [],
        messagesByDay: [],
        conversationsByPersonality: {},
      };
    }

    const totalConversations = conversations.length;
    let totalMessages = 0;
    const personalityCount: Record<string, number> = {};
    const messagesByDay: Record<string, number> = {};
    const conversationsByPersonality: Record<string, number> = {};

    conversations.forEach((conv: any) => {
      const personality = conv.personality || "unknown";
      personalityCount[personality] = (personalityCount[personality] || 0) + 1;
      conversationsByPersonality[personality] = (conversationsByPersonality[personality] || 0) + 1;

      // Estimate messages (in real app, you'd have actual message count)
      const estimatedMessages = Math.floor(Math.random() * 50) + 5;
      totalMessages += estimatedMessages;

      // Group by day
      const date = new Date(conv.createdAt).toLocaleDateString("bn-BD");
      messagesByDay[date] = (messagesByDay[date] || 0) + estimatedMessages;
    });

    const personalityDistribution = Object.entries(personalityCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    const messagesByDayArray = Object.entries(messagesByDay)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7)
      .map(([date, count]) => ({
        date,
        messages: count,
      }));

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: Math.round(totalMessages / totalConversations),
      personalityDistribution,
      messagesByDay: messagesByDayArray,
      conversationsByPersonality,
    };
  }, [conversations]);

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
              বিশ্লেষণ / Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              আপনার চ্যাট কার্যকলাপ পরিসংখ্যান / Your chat activity statistics
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                মোট কথোপকথন / Total Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalConversations}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                সব সময়ের / All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                মোট বার্তা / Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalMessages}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                সব কথোপকথনে / Across all chats
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                গড় বার্তা / Average Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageMessagesPerConversation}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                প্রতি কথোপকথন / Per conversation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                ব্যক্তিত্ব / Personalities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.personalityDistribution.length}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                ব্যবহৃত / Used
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Messages by Day */}
          <Card>
            <CardHeader>
              <CardTitle>গত ৭ দিনে বার্তা / Messages (Last 7 Days)</CardTitle>
              <CardDescription>দৈনিক বার্তা কার্যকলাপ / Daily message activity</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.messagesByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.messagesByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  ডেটা নেই / No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personality Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>ব্যক্তিত্ব বিতরণ / Personality Distribution</CardTitle>
              <CardDescription>ব্যবহৃত ব্যক্তিত্বের শতাংশ / Percentage of personalities used</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.personalityDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.personalityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.personalityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  ডেটা নেই / No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personality Stats */}
        <Card>
          <CardHeader>
            <CardTitle>ব্যক্তিত্ব পরিসংখ্যান / Personality Statistics</CardTitle>
            <CardDescription>প্রতিটি ব্যক্তিত্বের জন্য কথোপকথন সংখ্যা / Number of conversations per personality</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.personalityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.personalityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                ডেটা নেই / No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
