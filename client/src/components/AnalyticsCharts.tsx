import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, BarChart, PieChart, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface APIMetric {
  endpoint: string;
  timestamp: Date;
  requests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  errors: number;
  cost: number;
}

export function AnalyticsCharts() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Get all endpoints
  const { data: endpoints } = trpc.apiUsageAnalytics.getAllEndpoints.useQuery();

  // Get trend analysis
  const { data: trendData } = trpc.apiUsageAnalytics.getTrendAnalysis.useQuery(
    selectedEndpoint
      ? {
          endpoint: selectedEndpoint,
          from: new Date(Date.now() - (timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000),
          to: new Date(),
          granularity: timeRange === 'day' ? 'hour' : timeRange === 'week' ? 'day' : 'day',
        }
      : undefined,
    { enabled: !!selectedEndpoint }
  );

  // Get cost analysis
  const { data: costData } = trpc.apiUsageAnalytics.getCostAnalysis.useQuery({
    from: new Date(Date.now() - (timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const calculateSuccessRate = (metrics: APIMetric[]) => {
    if (metrics.length === 0) return 0;
    const totalRequests = metrics.reduce((sum, m) => sum + m.requests, 0);
    const successfulRequests = metrics.reduce((sum, m) => sum + m.successfulRequests, 0);
    return totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : '0';
  };

  const calculateAvgLatency = (metrics: APIMetric[]) => {
    if (metrics.length === 0) return 0;
    const totalLatency = metrics.reduce((sum, m) => sum + m.avgLatency, 0);
    return (totalLatency / metrics.length).toFixed(0);
  };

  const calculateTotalCost = (metrics: APIMetric[]) => {
    return metrics.reduce((sum, m) => sum + m.cost, 0).toFixed(2);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-2xl font-bold">API বিশ্লেষণ</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'day' ? 'default' : 'outline'}
            onClick={() => setTimeRange('day')}
          >
            দিন
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            সপ্তাহ
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            মাস
          </Button>
        </div>
      </div>

      {/* Endpoints Selection */}
      {endpoints && endpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">এন্ডপয়েন্ট নির্বাচন করুন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {endpoints.map((endpoint: string) => (
                <Button
                  key={endpoint}
                  variant={selectedEndpoint === endpoint ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className="text-xs"
                >
                  {endpoint.split('/').pop()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {selectedEndpoint && trendData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Success Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">সাফল্যের হার</CardTitle>
              <CardDescription>{selectedEndpoint}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {calculateSuccessRate(trendData as APIMetric[])}%
                  </div>
                  <p className="text-sm text-gray-500">সফল অনুরোধ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Latency Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">গড় লেটেন্সি</CardTitle>
              <CardDescription>{selectedEndpoint}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {calculateAvgLatency(trendData as APIMetric[])}ms
                  </div>
                  <p className="text-sm text-gray-500">মিলিসেকেন্ডে</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ত্রুটির হার</CardTitle>
              <CardDescription>{selectedEndpoint}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {((trendData as APIMetric[]).reduce((sum, m) => sum + m.errors, 0) / (trendData as APIMetric[]).length).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-500">গড় ত্রুটি</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Requests Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">মোট অনুরোধ</CardTitle>
              <CardDescription>{selectedEndpoint}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {(trendData as APIMetric[]).reduce((sum, m) => sum + m.requests, 0)}
                  </div>
                  <p className="text-sm text-gray-500">সময়কালে</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cost Analysis */}
      {costData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">খরচ বিশ্লেষণ</CardTitle>
            <CardDescription>API ব্যবহারের খরচ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">মোট খরচ</p>
                <p className="text-2xl font-bold">${calculateTotalCost(costData as APIMetric[])}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">গড় খরচ/অনুরোধ</p>
                <p className="text-2xl font-bold">
                  ${(
                    parseFloat(calculateTotalCost(costData as APIMetric[])) /
                    ((costData as APIMetric[]).reduce((sum, m) => sum + m.requests, 0) || 1)
                  ).toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">সর্বোচ্চ খরচের দিন</p>
                <p className="text-2xl font-bold">
                  ${Math.max(...(costData as APIMetric[]).map((m) => m.cost)).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Type Icons */}
      <div className="flex gap-4 justify-center text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <LineChart className="w-8 h-8" />
          <span className="text-xs">ট্রেন্ড</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <BarChart className="w-8 h-8" />
          <span className="text-xs">তুলনা</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PieChart className="w-8 h-8" />
          <span className="text-xs">বিতরণ</span>
        </div>
      </div>
    </div>
  );
}
