import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Plus, Filter, RefreshCw } from 'lucide-react';

interface ReportData {
  id: string;
  name: string;
  type: 'activity' | 'revenue' | 'performance' | 'team' | 'custom';
  dateRange: { from: Date; to: Date };
  metrics: string[];
  data: Record<string, unknown>[];
  createdAt: Date;
  updatedAt: Date;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  filters: Record<string, unknown>;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  isActive: boolean;
}

const AdvancedReportingDashboard: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [filterMetrics, setFilterMetrics] = useState<string[]>([]);

  // Sample data for demonstration
  const sampleActivityData = [
    { date: '2024-04-01', conversations: 45, messages: 320, users: 28 },
    { date: '2024-04-02', conversations: 52, messages: 380, users: 35 },
    { date: '2024-04-03', conversations: 48, messages: 350, users: 32 },
    { date: '2024-04-04', conversations: 61, messages: 420, users: 42 },
    { date: '2024-04-05', conversations: 55, messages: 390, users: 38 },
  ];

  const sampleRevenueData = [
    { date: '2024-04-01', stripe: 450, sslcommerz: 280, total: 730 },
    { date: '2024-04-02', stripe: 520, sslcommerz: 320, total: 840 },
    { date: '2024-04-03', stripe: 480, sslcommerz: 300, total: 780 },
    { date: '2024-04-04', stripe: 610, sslcommerz: 380, total: 990 },
    { date: '2024-04-05', stripe: 550, sslcommerz: 350, total: 900 },
  ];

  const samplePerformanceData = [
    { model: 'ChatGPT', avgResponseTime: 1200, accuracy: 92, cost: 0.002 },
    { model: 'Gemini', avgResponseTime: 950, accuracy: 88, cost: 0.0015 },
    { model: 'Claude', avgResponseTime: 1100, accuracy: 95, cost: 0.0025 },
    { model: 'Perplexity', avgResponseTime: 1050, accuracy: 90, cost: 0.0018 },
  ];

  const sampleTeamData = [
    { name: 'Owners', value: 1, color: '#3b82f6' },
    { name: 'Admins', value: 3, color: '#8b5cf6' },
    { name: 'Members', value: 12, color: '#ec4899' },
    { name: 'Guests', value: 8, color: '#f59e0b' },
  ];

  const handleCreateReport = () => {
    setIsCreatingReport(true);
  };

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exporting report as ${format}`);
    // TODO: Implement export logic
  };

  const handleScheduleReport = () => {
    console.log('Scheduling report');
    // TODO: Implement scheduling logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Reporting Dashboard</h1>
          <p className="text-slate-400">Create, customize, and analyze detailed reports</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleCreateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Report
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="activity" className="text-slate-300">Activity</TabsTrigger>
            <TabsTrigger value="revenue" className="text-slate-300">Revenue</TabsTrigger>
            <TabsTrigger value="performance" className="text-slate-300">Performance</TabsTrigger>
            <TabsTrigger value="team" className="text-slate-300">Team</TabsTrigger>
            <TabsTrigger value="custom" className="text-slate-300">Custom Reports</TabsTrigger>
          </TabsList>

          {/* Activity Report */}
          <TabsContent value="activity">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Activity Report</CardTitle>
                <CardDescription className="text-slate-400">
                  Conversations, messages, and user activity trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sampleActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                      <Legend />
                      <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="messages" stroke="#8b5cf6" strokeWidth={2} />
                      <Line type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Total Conversations</p>
                          <p className="text-3xl font-bold text-white">261</p>
                          <p className="text-green-400 text-sm">+12% from last week</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Total Messages</p>
                          <p className="text-3xl font-bold text-white">1,840</p>
                          <p className="text-green-400 text-sm">+8% from last week</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Active Users</p>
                          <p className="text-3xl font-bold text-white">175</p>
                          <p className="text-green-400 text-sm">+15% from last week</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportReport('pdf')}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button
                      onClick={() => handleExportReport('csv')}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export as CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Report */}
          <TabsContent value="revenue">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue Report</CardTitle>
                <CardDescription className="text-slate-400">
                  Payment processing and revenue trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sampleRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                      <Legend />
                      <Bar dataKey="stripe" fill="#3b82f6" />
                      <Bar dataKey="sslcommerz" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Total Revenue</p>
                          <p className="text-3xl font-bold text-white">$4,240</p>
                          <p className="text-green-400 text-sm">+18% from last week</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Stripe Revenue</p>
                          <p className="text-3xl font-bold text-white">$2,610</p>
                          <p className="text-slate-400 text-sm">61.6% of total</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">SSLCommerz Revenue</p>
                          <p className="text-3xl font-bold text-white">$1,630</p>
                          <p className="text-slate-400 text-sm">38.4% of total</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Report */}
          <TabsContent value="performance">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI Model Performance</CardTitle>
                <CardDescription className="text-slate-400">
                  Comparison of different AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300">Model</th>
                          <th className="text-left py-3 px-4 text-slate-300">Avg Response Time</th>
                          <th className="text-left py-3 px-4 text-slate-300">Accuracy</th>
                          <th className="text-left py-3 px-4 text-slate-300">Cost per Request</th>
                        </tr>
                      </thead>
                      <tbody>
                        {samplePerformanceData.map((row) => (
                          <tr key={row.model} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-3 px-4 text-white">{row.model}</td>
                            <td className="py-3 px-4 text-slate-300">{row.avgResponseTime}ms</td>
                            <td className="py-3 px-4">
                              <span className="text-green-400">{row.accuracy}%</span>
                            </td>
                            <td className="py-3 px-4 text-slate-300">${row.cost.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={samplePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="model" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Bar dataKey="accuracy" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>

                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={samplePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="model" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Bar dataKey="avgResponseTime" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Report */}
          <TabsContent value="team">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Team Composition</CardTitle>
                <CardDescription className="text-slate-400">
                  Team members by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sampleTeamData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sampleTeamData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  {sampleTeamData.map((item) => (
                    <Card key={item.name} className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-400 text-sm">{item.name}</p>
                            <p className="text-2xl font-bold text-white">{item.value}</p>
                          </div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Reports */}
          <TabsContent value="custom">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Custom Reports</CardTitle>
                <CardDescription className="text-slate-400">
                  Create and manage custom reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customReports.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400 mb-4">No custom reports yet</p>
                      <Button
                        onClick={handleCreateReport}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Report
                      </Button>
                    </div>
                  ) : (
                    customReports.map((report) => (
                      <Card key={report.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-white font-semibold">{report.name}</h3>
                              <p className="text-slate-400 text-sm">{report.description}</p>
                              <p className="text-slate-500 text-xs mt-1">
                                Frequency: {report.frequency} • Recipients: {report.recipients.length}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:bg-slate-600"
                            >
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedReportingDashboard;
