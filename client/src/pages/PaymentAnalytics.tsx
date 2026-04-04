import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, Users, DollarSign, ShoppingCart } from "lucide-react";

interface PaymentMetrics {
  date: string;
  revenue: number;
  transactions: number;
  successRate: number;
}

interface SubscriptionMetrics {
  planName: string;
  count: number;
  revenue: number;
}

export function PaymentAnalytics() {
  // Mock data
  const revenueData: PaymentMetrics[] = [
    { date: "Jan 1", revenue: 1200, transactions: 12, successRate: 95 },
    { date: "Jan 2", revenue: 1900, transactions: 18, successRate: 96 },
    { date: "Jan 3", revenue: 1600, transactions: 14, successRate: 94 },
    { date: "Jan 4", revenue: 2400, transactions: 22, successRate: 97 },
    { date: "Jan 5", revenue: 2100, transactions: 19, successRate: 95 },
    { date: "Jan 6", revenue: 2800, transactions: 25, successRate: 98 },
    { date: "Jan 7", revenue: 3200, transactions: 28, successRate: 97 },
  ];

  const subscriptionData: SubscriptionMetrics[] = [
    { planName: "Basic", count: 45, revenue: 4500 },
    { planName: "Pro", count: 32, revenue: 9600 },
    { planName: "Premium", count: 18, revenue: 8100 },
  ];

  const paymentMethodData = [
    { name: "Stripe", value: 65, color: "#667eea" },
    { name: "SSLCommerz", value: 35, color: "#764ba2" },
  ];

  const [timeRange, setTimeRange] = useState("7d");

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = revenueData.reduce((sum, item) => sum + item.transactions, 0);
  const avgSuccessRate =
    revenueData.reduce((sum, item) => sum + item.successRate, 0) / revenueData.length;
  const totalSubscribers = subscriptionData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Analytics</h1>
          <p className="text-gray-600">Track revenue, transactions, and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last period</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
                <p className="text-xs text-blue-600 mt-1">↑ 8% from last period</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
                <p className="text-xs text-purple-600 mt-1">↑ 2% from last period</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscribers</p>
                <p className="text-2xl font-bold">{totalSubscribers}</p>
                <p className="text-xs text-orange-600 mt-1">↑ 5 new this period</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ fill: "#667eea", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Daily transaction count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="transactions" fill="#764ba2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Revenue breakdown by subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptionData.map((plan, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{plan.planName}</p>
                  <p className="text-sm text-gray-600">{plan.count} active subscribers</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${plan.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    {((plan.revenue / subscriptionData.reduce((sum, p) => sum + p.revenue, 0)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
          <CardDescription>Payment success rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[90, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={{ fill: "#4CAF50", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
