/**
 * User Segmentation Manager Component
 * Displays and manages user segments with analytics
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Segment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  avgEngagement: number;
  churnRate: number;
}

export const SegmentationManager: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: 'high_engagement',
      name: 'High Engagement Users',
      description: 'Users with engagement score > 70%',
      userCount: 450,
      avgEngagement: 85,
      churnRate: 1.2,
    },
    {
      id: 'at_risk',
      name: 'At-Risk Users',
      description: 'Users with low engagement or inactive for 7+ days',
      userCount: 200,
      avgEngagement: 25,
      churnRate: 8.9,
    },
    {
      id: 'premium_users',
      name: 'Premium Subscribers',
      description: 'Users with premium subscription',
      userCount: 320,
      avgEngagement: 78,
      churnRate: 2.1,
    },
  ]);

  const [showNewSegment, setShowNewSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');

  const handleCreateSegment = () => {
    if (newSegmentName.trim()) {
      const newSegment: Segment = {
        id: `custom_${Date.now()}`,
        name: newSegmentName,
        description: 'Custom segment',
        userCount: 0,
        avgEngagement: 0,
        churnRate: 0,
      };
      setSegments([...segments, newSegment]);
      setNewSegmentName('');
      setShowNewSegment(false);
    }
  };

  const chartData = segments.map((seg) => ({
    name: seg.name.substring(0, 15),
    users: seg.userCount,
    engagement: seg.avgEngagement,
    churn: seg.churnRate,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Segmentation</h2>
        <Button onClick={() => setShowNewSegment(!showNewSegment)}>
          {showNewSegment ? 'Cancel' : 'Create Segment'}
        </Button>
      </div>

      {showNewSegment && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Segment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Segment name"
              value={newSegmentName}
              onChange={(e) => setNewSegmentName(e.target.value)}
            />
            <Button onClick={handleCreateSegment}>Create</Button>
          </CardContent>
        </Card>
      )}

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => (
          <Card key={segment.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-lg">{segment.name}</CardTitle>
              <CardDescription>{segment.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Users</p>
                  <p className="text-2xl font-bold">{segment.userCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Engagement</p>
                  <p className="text-2xl font-bold text-green-600">{segment.avgEngagement}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Churn</p>
                  <p className="text-2xl font-bold text-red-600">{segment.churnRate}%</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">Active</Badge>
                <Badge variant="secondary">Managed</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Segment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement vs Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="churn" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
