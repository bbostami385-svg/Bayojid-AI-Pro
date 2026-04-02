import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Admin Dashboard - ব্যবহারকারী ম্যানেজমেন্ট, পেমেন্ট মনিটরিং এবং সিস্টেম স্ট্যাটাস
 */

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  pendingPayments: number;
  totalTransactions: number;
  successRate: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  subscription: 'free' | 'pro' | 'premium';
  createdAt: Date;
  lastActive: Date;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  gateway: string;
  date: Date;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalTransactions: 0,
    successRate: 0
  });

  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // ড্যাশবোর্ড ডেটা লোড করুন
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // এখানে API কল করুন
    // const response = await trpc.admin.getDashboardStats.useQuery();
    // setStats(response);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* হেডার */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">সিস্টেম পরিচালনা এবং মনিটরিং</p>
        </div>

        {/* পরিসংখ্যান কার্ড */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">মোট ব্যবহারকারী</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-400">{stats.totalUsers}</div>
              <p className="text-slate-400 text-sm mt-2">সক্রিয়: {stats.activeUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">মোট রাজস্ব</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">৳{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-slate-400 text-sm mt-2">লেনদেন: {stats.totalTransactions}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">পেমেন্ট সাফল্যের হার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-400">{stats.successRate.toFixed(1)}%</div>
              <p className="text-slate-400 text-sm mt-2">অপেক্ষমাণ: {stats.pendingPayments}</p>
            </CardContent>
          </Card>
        </div>

        {/* ট্যাব সেকশন */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-200">সারাংশ</TabsTrigger>
            <TabsTrigger value="users" className="text-slate-200">ব্যবহারকারী</TabsTrigger>
            <TabsTrigger value="payments" className="text-slate-200">পেমেন্ট</TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-200">বিশ্লেষণ</TabsTrigger>
          </TabsList>

          {/* সারাংশ ট্যাব */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* রাজস্ব চার্ট */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">মাসিক রাজস্ব</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* লেনদেন চার্ট */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">লেনদেনের স্ট্যাটাস</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'সফল', value: 70 },
                          { name: 'অপেক্ষমাণ', value: 20 },
                          { name: 'ব্যর্থ', value: 10 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ব্যবহারকারী ট্যাব */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">ব্যবহারকারী তালিকা</CardTitle>
                <CardDescription className="text-slate-400">সব ব্যবহারকারীর তথ্য</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-300">
                    <thead className="border-b border-slate-700">
                      <tr>
                        <th className="text-left py-3 px-4">নাম</th>
                        <th className="text-left py-3 px-4">ইমেইল</th>
                        <th className="text-left py-3 px-4">সাবস্ক্রিপশন</th>
                        <th className="text-left py-3 px-4">যোগদান</th>
                        <th className="text-left py-3 px-4">শেষ সক্রিয়</th>
                        <th className="text-left py-3 px-4">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.subscription === 'premium' ? 'bg-purple-500/20 text-purple-300' :
                              user.subscription === 'pro' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-slate-500/20 text-slate-300'
                            }`}>
                              {user.subscription}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString('bn-BD')}</td>
                          <td className="py-3 px-4">{new Date(user.lastActive).toLocaleDateString('bn-BD')}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" className="text-xs">
                              বিস্তারিত
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* পেমেন্ট ট্যাব */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">সম্প্রতি লেনদেন</CardTitle>
                <CardDescription className="text-slate-400">শেষ ১০টি লেনদেন</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-300">
                    <thead className="border-b border-slate-700">
                      <tr>
                        <th className="text-left py-3 px-4">লেনদেন ID</th>
                        <th className="text-left py-3 px-4">পরিমাণ</th>
                        <th className="text-left py-3 px-4">গেটওয়ে</th>
                        <th className="text-left py-3 px-4">স্ট্যাটাস</th>
                        <th className="text-left py-3 px-4">তারিখ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4 font-mono text-xs">{tx.id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">৳{tx.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">{tx.gateway}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tx.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                              tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(tx.date).toLocaleDateString('bn-BD')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* বিশ্লেষণ ট্যাব */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">ব্যবহারকারী বৃদ্ধি</CardTitle>
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
