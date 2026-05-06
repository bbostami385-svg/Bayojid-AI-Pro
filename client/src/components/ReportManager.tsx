/**
 * Report Manager Component
 * Manages scheduled reports and email delivery
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  enabled: boolean;
  nextRunAt: Date;
  lastRunAt?: Date;
}

export const ReportManager: React.FC = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: 'daily_analytics',
      name: 'Daily Analytics Report',
      templateId: 'daily_analytics',
      frequency: 'daily',
      recipients: ['admin@example.com'],
      enabled: true,
      nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastRunAt: new Date(),
    },
    {
      id: 'weekly_performance',
      name: 'Weekly Performance Report',
      templateId: 'weekly_performance',
      frequency: 'weekly',
      recipients: ['admin@example.com', 'team@example.com'],
      enabled: true,
      nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastRunAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'monthly_segmentation',
      name: 'Monthly Segmentation Report',
      templateId: 'segmentation_report',
      frequency: 'monthly',
      recipients: ['admin@example.com'],
      enabled: false,
      nextRunAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [showNewReport, setShowNewReport] = useState(false);

  const handleToggleReport = (reportId: string) => {
    setReports(
      reports.map((report) =>
        report.id === reportId ? { ...report, enabled: !report.enabled } : report
      )
    );
  };

  const handleTriggerReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      alert(`Report "${report.name}" triggered! Sending to ${report.recipients.join(', ')}`);
    }
  };

  const frequencyColors = {
    daily: 'bg-blue-100 text-blue-800',
    weekly: 'bg-purple-100 text-purple-800',
    monthly: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Automated Reports</h2>
        <Button onClick={() => setShowNewReport(!showNewReport)}>
          {showNewReport ? 'Cancel' : 'Schedule Report'}
        </Button>
      </div>

      {showNewReport && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Report name" />
            <Input placeholder="Email recipients (comma-separated)" />
            <select className="w-full border rounded p-2">
              <option>Select frequency...</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <Button onClick={() => setShowNewReport(false)}>Create Report</Button>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{report.name}</h3>
                    <Badge className={frequencyColors[report.frequency]}>
                      {report.frequency}
                    </Badge>
                    <Badge variant={report.enabled ? 'default' : 'secondary'}>
                      {report.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{report.recipients.length} recipient(s)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Next: {report.nextRunAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {report.lastRunAt && (
                    <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Last sent: {report.lastRunAt.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleReport(report.id)}
                  >
                    {report.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTriggerReport(report.id)}
                  >
                    Send Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Email Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle>Email Queue Status</CardTitle>
          <CardDescription>Monitor pending and failed emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Sent Today</p>
              <p className="text-2xl font-bold text-green-600">24</p>
            </div>
            <div className="p-4 bg-red-50 rounded">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">1</p>
            </div>
          </div>
          <Button className="mt-4 w-full" variant="outline">
            Retry Failed Emails
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
