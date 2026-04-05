import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit2, Trash2, Download } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ScheduledReport {
  reportId: string;
  name: string;
  reportType: 'activity' | 'revenue' | 'performance' | 'team' | 'custom';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  isActive: boolean;
  lastGeneratedAt?: Date;
  nextScheduledAt?: Date;
}

export function ReportDashboard() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch scheduled reports
  const { data: scheduledReports, refetch } = trpc.reportScheduling.getScheduledReports.useQuery();

  // Get report statistics
  const { data: stats } = trpc.reportScheduling.getReportStats.useQuery();

  // Delete report
  const deleteMutation = trpc.reportScheduling.deleteScheduledReport.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Generate report manually
  const generateMutation = trpc.reportScheduling.generateReportManually.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      activity: 'কার্যকলাপ',
      revenue: 'রাজস্ব',
      performance: 'পারফরম্যান্স',
      team: 'টিম',
      custom: 'কাস্টম',
    };
    return labels[type] || type;
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      once: 'একবার',
      daily: 'দৈনিক',
      weekly: 'সাপ্তাহিক',
      monthly: 'মাসিক',
      quarterly: 'ত্রৈমাসিক',
    };
    return labels[freq] || freq;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl font-bold">রিপোর্ট ড্যাশবোর্ড</h2>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          নতুন রিপোর্ট
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">মোট রিপোর্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">সক্রিয়</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">এই মাসে তৈরি</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">গড় প্রাপক</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRecipients || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {scheduledReports && scheduledReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              কোনো রিপোর্ট নেই। নতুন রিপোর্ট তৈরি করুন।
            </CardContent>
          </Card>
        ) : (
          scheduledReports?.map((report: ScheduledReport) => (
            <Card key={report.reportId} className="hover:bg-gray-50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription>
                      {getReportTypeLabel(report.reportType)} • {getFrequencyLabel(report.frequency)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.isActive ? (
                      <Badge variant="default">সক্রিয়</Badge>
                    ) : (
                      <Badge variant="secondary">নিষ্ক্রিয়</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">প্রাপক</p>
                      <p className="font-medium">{report.recipients.length} জন</p>
                    </div>
                    <div>
                      <p className="text-gray-500">শেষ তৈরি</p>
                      <p className="font-medium">
                        {report.lastGeneratedAt
                          ? new Date(report.lastGeneratedAt).toLocaleDateString('bn-BD')
                          : 'কখনো না'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateMutation.mutate({ reportId: report.reportId })}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      এখনই তৈরি করুন
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit2 className="w-4 h-4 mr-2" />
                      সম্পাদনা করুন
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate({ reportId: report.reportId })}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      মুছুন
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Report Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>নতুন রিপোর্ট তৈরি করুন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">রিপোর্টের নাম</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="রিপোর্টের নাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">রিপোর্টের ধরন</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option value="activity">কার্যকলাপ</option>
                  <option value="revenue">রাজস্ব</option>
                  <option value="performance">পারফরম্যান্স</option>
                  <option value="team">টিম</option>
                  <option value="custom">কাস্টম</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ফ্রিকোয়েন্সি</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option value="once">একবার</option>
                  <option value="daily">দৈনিক</option>
                  <option value="weekly">সাপ্তাহিক</option>
                  <option value="monthly">মাসিক</option>
                  <option value="quarterly">ত্রৈমাসিক</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsCreating(false)} variant="outline">
                  বাতিল
                </Button>
                <Button onClick={() => setIsCreating(false)}>তৈরি করুন</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
