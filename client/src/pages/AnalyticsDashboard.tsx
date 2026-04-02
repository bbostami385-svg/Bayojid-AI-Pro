import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Analytics Dashboard - ব্যবহারকারী আচরণ, কথোপকথন মেট্রিক্স এবং রাজস্ব বিশ্লেষণ
 */

interface AnalyticsData {
  userBehavior: {
    totalSessions: number;
    averageSessionDuration: number;
    activeUsers: number;
    newUsers: number;
  };
  conversationMetrics: {
    totalConversations: number;
    averageMessages: number;
    averageResponseTime: number;
    sentimentScore: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    averageTransactionValue: number;
    successRate: number;
    churnRate: number;
  };
  engagementMetrics: {
    highEngagement: number;
    mediumEngagement: number;
    lowEngagement: number;
    inactive: number;
  };
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userBehavior: {
      totalSessions: 0,
      averageSessionDuration: 0,
      activeUsers: 0,
      newUsers: 0
    },
    conversationMetrics: {
      totalConversations: 0,
      averageMessages: 0,
      averageResponseTime: 0,
      sentimentScore: 0
    },
    revenueMetrics: {
      totalRevenue: 0,
      averageTransactionValue: 0,
      successRate: 0,
      churnRate: 0
    },
    engagementMetrics: {
      highEngagement: 0,
      mediumEngagement: 0,
      lowEngagement: 0,
      inactive: 0
    }
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    // এখানে API কল করুন
    // const response = await trpc.analytics.getAnalyticsData.useQuery({ timeRange });
    // setAnalyticsData(response);
    
    // ডেমো ডেটা
    setChartData([
      { date: 'সোম', users: 400, conversations: 240, revenue: 2400 },
      { date: 'মঙ্গল', users: 300, conversations: 221, revenue: 2210 },
      { date: 'বুধ', users: 200, conversations: 229, revenue: 2290 },
      { date: 'বৃহ', users: 278, conversations: 200, revenue: 2000 },
      { date: 'শুক্র', users: 189, conversations: 229, revenue: 2181 },
      { date: 'শনি', users: 239, conversations: 200, revenue: 2500 },
      { date: 'রবি', users: 349, conversations: 210, revenue: 2100 },
    ]);
  };

  const downloadReport = (format: 'pdf' | 'csv') => {
    // রিপোর্ট ডাউনলোড করুন
    console.log(`Downloading ${format} report...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* হেডার */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400">বিস্তারিত ব্যবহারকারী এবং রাজস্ব বিশ্লেষণ</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === 'day' ? 'default' : 'outline'}
              onClick={() => setTimeRange('day')}
              className="text-sm"
            >
              দিন
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              onClick={() => setTimeRange('week')}
              className="text-sm"
            >
              সপ্তাহ
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              onClick={() => setTimeRange('month')}
              className="text-sm"
            >
              মাস
            </Button>
          </div>
        </div>

        {/* মূল মেট্রিক্স কার্ড */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">সক্রিয় ব্যবহারকারী</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{analyticsData.userBehavior.activeUsers}</div>
              <p className="text-xs text-slate-400 mt-1">নতুন: {analyticsData.userBehavior.newUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">মোট কথোপকথন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{analyticsData.conversationMetrics.totalConversations}</div>
              <p className="text-xs text-slate-400 mt-1">গড়: {analyticsData.conversationMetrics.averageMessages} বার্তা</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">মোট রাজস্ব</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">৳{analyticsData.revenueMetrics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">সাফল্য: {analyticsData.revenueMetrics.successRate.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">এনগেজমেন্ট স্কোর</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{((analyticsData.engagementMetrics.highEngagement / (analyticsData.engagementMetrics.highEngagement + analyticsData.engagementMetrics.mediumEngagement + analyticsData.engagementMetrics.lowEngagement + analyticsData.engagementMetrics.inactive)) * 100).toFixed(1)}%</div>
              <p className="text-xs text-slate-400 mt-1">উচ্চ এনগেজড: {analyticsData.engagementMetrics.highEngagement}</p>
            </CardContent>
          </Card>
        </div>

        {/* ট্যাব সেকশন */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-200">সারাংশ</TabsTrigger>
            <TabsTrigger value="users" className="text-slate-200">ব্যবহারকারী</TabsTrigger>
            <TabsTrigger value="conversations" className="text-slate-200">কথোপকথন</TabsTrigger>
            <TabsTrigger value="revenue" className="text-slate-200">রাজস্ব</TabsTrigger>
            <TabsTrigger value="engagement" className="text-slate-200">এনগেজমেন্ট</TabsTrigger>
          </TabsList>

          {/* সারাংশ ট্যাব */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ব্যবহারকারী বৃদ্ধি */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">ব্যবহারকারী বৃদ্ধি</CardTitle>
                  <CardDescription className="text-slate-400">সময়ের সাথে সক্রিয় ব্যবহারকারী</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* রাজস্ব ট্রেন্ড */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">রাজস্ব ট্রেন্ড</CardTitle>
                  <CardDescription className="text-slate-400">দৈনিক রাজস্ব পরিবর্তন</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* কথোপকথন বনাম ব্যবহারকারী */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">কথোপকথন বনাম ব্যবহারকারী</CardTitle>
                <CardDescription className="text-slate-400">প্রতিদিনের তুলনা</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="users" fill="#3b82f6" />
                    <Bar dataKey="conversations" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ব্যবহারকারী ট্যাব */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">ব্যবহারকারী আচরণ</CardTitle>
                <CardDescription className="text-slate-400">সেশন এবং কার্যকলাপ বিশ্লেষণ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">মোট সেশন</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">{analyticsData.userBehavior.totalSessions}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">গড় সেশন সময়</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">{analyticsData.userBehavior.averageSessionDuration.toFixed(1)} মিনিট</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* কথোপকথন ট্যাব */}
          <TabsContent value="conversations" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">কথোপকথন মেট্রিক্স</CardTitle>
                <CardDescription className="text-slate-400">গড় প্রতিক্রিয়া সময় এবং সেন্টিমেন্ট</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">গড় প্রতিক্রিয়া সময়</p>
                    <p className="text-2xl font-bold text-purple-400 mt-1">{analyticsData.conversationMetrics.averageResponseTime.toFixed(0)}ms</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">সেন্টিমেন্ট স্কোর</p>
                    <p className="text-2xl font-bold text-orange-400 mt-1">{analyticsData.conversationMetrics.sentimentScore.toFixed(1)}/10</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* রাজস্ব ট্যাব */}
          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">রাজস্ব বিশ্লেষণ</CardTitle>
                <CardDescription className="text-slate-400">লেনদেন এবং চার্ন রেট</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">গড় লেনদেন মূল্য</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">৳{analyticsData.revenueMetrics.averageTransactionValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">চার্ন রেট</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">{analyticsData.revenueMetrics.churnRate.toFixed(2)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* এনগেজমেন্ট ট্যাব */}
          <TabsContent value="engagement" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">ব্যবহারকারী এনগেজমেন্ট</CardTitle>
                <CardDescription className="text-slate-400">এনগেজমেন্ট স্তর অনুযায়ী বিতরণ</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'উচ্চ', value: analyticsData.engagementMetrics.highEngagement },
                        { name: 'মধ্যম', value: analyticsData.engagementMetrics.mediumEngagement },
                        { name: 'নিম্ন', value: analyticsData.engagementMetrics.lowEngagement },
                        { name: 'নিষ্ক্রিয়', value: analyticsData.engagementMetrics.inactive }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* রিপোর্ট ডাউনলোড */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-slate-200">রিপোর্ট ডাউনলোড</CardTitle>
            <CardDescription className="text-slate-400">বিশ্লেষণ ডেটা রপ্তানি করুন</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => downloadReport('pdf')} className="bg-red-600 hover:bg-red-700">
              PDF ডাউনলোড করুন
            </Button>
            <Button onClick={() => downloadReport('csv')} className="bg-green-600 hover:bg-green-700">
              CSV ডাউনলোড করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
