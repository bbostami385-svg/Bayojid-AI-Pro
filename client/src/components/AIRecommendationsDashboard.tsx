/**
 * AI Recommendations Dashboard Component
 * Displays AI-powered optimization recommendations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Recommendation {
  id: string;
  type: 'report_schedule' | 'segment_criteria' | 'user_engagement' | 'quota_optimization';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  estimatedImpact: string;
  implemented: boolean;
}

export const AIRecommendationsDashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 'rec_1',
      type: 'report_schedule',
      title: 'Optimize Daily Report Schedule',
      description: 'Based on user activity patterns, shift daily reports to 9 AM UTC',
      action: 'Update report schedule',
      priority: 'high',
      confidence: 92,
      estimatedImpact: '+15% report engagement',
      implemented: false,
    },
    {
      id: 'rec_2',
      type: 'segment_criteria',
      title: 'Create "Dormant Users" Segment',
      description: 'Identify and target users inactive for 30+ days with re-engagement campaigns',
      action: 'Create new segment',
      priority: 'high',
      confidence: 88,
      estimatedImpact: '+8% retention rate',
      implemented: false,
    },
    {
      id: 'rec_3',
      type: 'user_engagement',
      title: 'Promote High-Value Features',
      description: 'Users engaging with chat features show 3x higher retention',
      action: 'Adjust feature recommendations',
      priority: 'medium',
      confidence: 85,
      estimatedImpact: '+12% engagement',
      implemented: false,
    },
    {
      id: 'rec_4',
      type: 'quota_optimization',
      title: 'Adjust Premium Tier Pricing',
      description: 'Current pricing underutilizes premium features by 40%',
      action: 'Review pricing strategy',
      priority: 'medium',
      confidence: 78,
      estimatedImpact: '+22% premium conversions',
      implemented: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'implemented'>('pending');

  const handleImplementRecommendation = (id: string) => {
    setRecommendations(
      recommendations.map((rec) =>
        rec.id === id ? { ...rec, implemented: true } : rec
      )
    );
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeTab === 'pending') return !rec.implemented;
    if (activeTab === 'implemented') return rec.implemented;
    return true;
  });

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const typeIcons = {
    report_schedule: '📅',
    segment_criteria: '👥',
    user_engagement: '📈',
    quota_optimization: '💰',
  };

  const impactData = [
    { name: 'Current', engagement: 72, retention: 85, revenue: 65 },
    { name: 'With Recs', engagement: 84, retention: 93, revenue: 87 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          AI-Powered Recommendations
        </h2>
        <Badge variant="outline">
          {recommendations.filter((r) => !r.implemented).length} Pending
        </Badge>
      </div>

      {/* Impact Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Projected Impact</CardTitle>
          <CardDescription>Expected improvements if all recommendations are implemented</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={impactData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="engagement" fill="#3b82f6" name="Engagement %" />
              <Bar dataKey="retention" fill="#10b981" name="Retention %" />
              <Bar dataKey="revenue" fill="#f59e0b" name="Revenue Impact %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          All ({recommendations.length})
        </Button>
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({recommendations.filter((r) => !r.implemented).length})
        </Button>
        <Button
          variant={activeTab === 'implemented' ? 'default' : 'outline'}
          onClick={() => setActiveTab('implemented')}
        >
          Implemented ({recommendations.filter((r) => r.implemented).length})
        </Button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec) => (
          <Card key={rec.id} className={rec.implemented ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{typeIcons[rec.type]}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{rec.title}</h3>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">Priority</p>
                      <Badge className={priorityColors[rec.priority]}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="text-lg font-bold">{rec.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Estimated Impact</p>
                      <p className="text-lg font-bold text-green-600">{rec.estimatedImpact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Action</p>
                      <p className="text-sm font-medium">{rec.action}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {rec.implemented ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">Implemented</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleImplementRecommendation(rec.id)}
                    >
                      Implement
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {recommendations.filter((r) => r.priority === 'high' && !r.implemented).length}
            </p>
            <p className="text-xs text-gray-500">Recommendations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(
                recommendations
                  .filter((r) => !r.implemented)
                  .reduce((sum, r) => sum + r.confidence, 0) /
                  Math.max(recommendations.filter((r) => !r.implemented).length, 1)
              )}
              %
            </p>
            <p className="text-xs text-gray-500">Of pending recommendations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">+18%</p>
            <p className="text-xs text-gray-500">Expected improvement</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
