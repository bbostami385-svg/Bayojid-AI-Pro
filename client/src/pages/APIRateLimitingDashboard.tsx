import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface APIEndpoint {
  name: string;
  method: string;
  path: string;
  rateLimit: number;
  window: string;
  currentUsage: number;
  resetAt: Date;
  status: 'healthy' | 'warning' | 'critical';
}

interface RateLimitMetric {
  timestamp: Date;
  endpoint: string;
  requests: number;
  errors: number;
  avgLatency: number;
}

const APIRateLimitingDashboard: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('stripe');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);

  // Sample API endpoints data
  const endpoints: APIEndpoint[] = [
    {
      name: 'Stripe Payments',
      method: 'POST',
      path: '/api/stripe/payment',
      rateLimit: 1000,
      window: '1 hour',
      currentUsage: 847,
      resetAt: new Date(Date.now() + 15 * 60000),
      status: 'warning',
    },
    {
      name: 'SSLCommerz Payments',
      method: 'POST',
      path: '/api/sslcommerz/payment',
      rateLimit: 500,
      window: '1 hour',
      currentUsage: 245,
      resetAt: new Date(Date.now() + 20 * 60000),
      status: 'healthy',
    },
    {
      name: 'Chat Messages',
      method: 'POST',
      path: '/api/chat/message',
      rateLimit: 5000,
      window: '1 hour',
      currentUsage: 3200,
      resetAt: new Date(Date.now() + 10 * 60000),
      status: 'healthy',
    },
    {
      name: 'AI Model Query',
      method: 'POST',
      path: '/api/ai/query',
      rateLimit: 2000,
      window: '1 hour',
      currentUsage: 1950,
      resetAt: new Date(Date.now() + 12 * 60000),
      status: 'critical',
    },
    {
      name: 'Analytics Export',
      method: 'GET',
      path: '/api/analytics/export',
      rateLimit: 100,
      window: '1 hour',
      currentUsage: 45,
      resetAt: new Date(Date.now() + 18 * 60000),
      status: 'healthy',
    },
  ];

  // Sample usage data
  const usageData = [
    { time: '00:00', stripe: 120, sslcommerz: 45, chat: 320, ai: 180 },
    { time: '04:00', stripe: 95, sslcommerz: 38, chat: 280, ai: 150 },
    { time: '08:00', stripe: 210, sslcommerz: 85, chat: 450, ai: 280 },
    { time: '12:00', stripe: 340, sslcommerz: 120, chat: 680, ai: 420 },
    { time: '16:00', stripe: 280, sslcommerz: 95, chat: 550, ai: 350 },
    { time: '20:00', stripe: 230, sslcommerz: 75, chat: 420, ai: 280 },
    { time: '24:00', stripe: 150, sslcommerz: 55, chat: 320, ai: 200 },
  ];

  // Sample error data
  const errorData = [
    { time: '00:00', errors: 2, timeouts: 0, throttled: 0 },
    { time: '04:00', errors: 1, timeouts: 0, throttled: 0 },
    { time: '08:00', errors: 3, timeouts: 1, throttled: 0 },
    { time: '12:00', errors: 5, timeouts: 2, throttled: 1 },
    { time: '16:00', errors: 4, timeouts: 1, throttled: 0 },
    { time: '20:00', errors: 3, timeouts: 0, throttled: 0 },
    { time: '24:00', errors: 2, timeouts: 0, throttled: 0 },
  ];

  // Sample distribution data
  const distributionData = [
    { name: 'Stripe', value: 847, color: '#3b82f6' },
    { name: 'SSLCommerz', value: 245, color: '#10b981' },
    { name: 'Chat', value: 3200, color: '#8b5cf6' },
    { name: 'AI Model', value: 1950, color: '#f59e0b' },
    { name: 'Analytics', value: 45, color: '#ef4444' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-900/20 border-green-700';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'critical':
        return 'bg-red-900/20 border-red-700';
      default:
        return 'bg-slate-900/20 border-slate-700';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const formatResetTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Rate Limiting Dashboard</h1>
          <p className="text-slate-400">Monitor API usage, quotas, and rate limit status in real-time</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Requests (24h)</p>
                  <p className="text-3xl font-bold text-white">6,287</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Error Rate</p>
                  <p className="text-3xl font-bold text-white">0.32%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Latency</p>
                  <p className="text-3xl font-bold text-white">245ms</p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Critical Alerts</p>
                  <p className="text-3xl font-bold text-white">1</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-300">Overview</TabsTrigger>
            <TabsTrigger value="endpoints" className="text-slate-300">Endpoints</TabsTrigger>
            <TabsTrigger value="errors" className="text-slate-300">Errors</TabsTrigger>
            <TabsTrigger value="alerts" className="text-slate-300">Alerts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Usage Chart */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">API Request Volume (24h)</CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time request distribution across endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                      <Legend />
                      <Area type="monotone" dataKey="stripe" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                      <Area type="monotone" dataKey="sslcommerz" stackId="1" stroke="#10b981" fill="#10b981" />
                      <Area type="monotone" dataKey="chat" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                      <Area type="monotone" dataKey="ai" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribution Pie Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Request Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Usage by Endpoint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {distributionData.map((item) => (
                        <div key={item.name}>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-300 text-sm">{item.name}</span>
                            <span className="text-white font-semibold">{item.value}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(item.value / 3200) * 100}%`,
                                backgroundColor: item.color,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">API Endpoints Status</CardTitle>
                <CardDescription className="text-slate-400">
                  Current rate limit usage for each endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoints.map((endpoint) => {
                    const percentage = getUsagePercentage(endpoint.currentUsage, endpoint.rateLimit);
                    return (
                      <div
                        key={endpoint.path}
                        className={`p-4 rounded-lg border ${getStatusBgColor(endpoint.status)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{endpoint.name}</h3>
                            <p className="text-slate-400 text-sm">
                              {endpoint.method} {endpoint.path}
                            </p>
                          </div>
                          <span className={`text-sm font-semibold ${getStatusColor(endpoint.status)}`}>
                            {endpoint.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Usage</span>
                            <span className="text-white">
                              {endpoint.currentUsage} / {endpoint.rateLimit} ({percentage}%)
                            </span>
                          </div>

                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentage >= 90
                                  ? 'bg-red-500'
                                  : percentage >= 75
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Window: {endpoint.window}</span>
                            <span>Resets in: {formatResetTime(endpoint.resetAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Error Analysis (24h)</CardTitle>
                <CardDescription className="text-slate-400">
                  Errors, timeouts, and throttled requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Bar dataKey="errors" fill="#ef4444" />
                    <Bar dataKey="timeouts" fill="#f59e0b" />
                    <Bar dataKey="throttled" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Alerts</CardTitle>
                <CardDescription className="text-slate-400">
                  Critical and warning alerts for API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Critical Alert */}
                  <div className="p-4 rounded-lg bg-red-900/20 border border-red-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">AI Model Query - Critical Usage</h4>
                        <p className="text-slate-300 text-sm mt-1">
                          API endpoint is at 97.5% of rate limit. Requests may be throttled soon.
                        </p>
                        <p className="text-slate-400 text-xs mt-2">Triggered 5 minutes ago</p>
                      </div>
                      <Button variant="outline" className="border-red-700 text-red-400 hover:bg-red-900/50">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Warning Alert */}
                  <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-700">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">Stripe Payments - High Usage</h4>
                        <p className="text-slate-300 text-sm mt-1">
                          API endpoint is at 84.7% of rate limit. Consider optimizing requests.
                        </p>
                        <p className="text-slate-400 text-xs mt-2">Triggered 15 minutes ago</p>
                      </div>
                      <Button variant="outline" className="border-yellow-700 text-yellow-400 hover:bg-yellow-900/50">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700">
                    <p className="text-slate-300 text-sm">
                      💡 Tip: Set up webhook alerts to get notified when endpoints approach rate limits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default APIRateLimitingDashboard;
