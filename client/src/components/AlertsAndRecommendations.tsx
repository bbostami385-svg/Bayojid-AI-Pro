import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingDown, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Alerts and Recommendations Dashboard
 * Display model performance alerts and cost optimization recommendations
 */

interface PerformanceAlert {
  id: string;
  model: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  estimatedSavings: number;
  savingsPercentage: number;
  priority: 'high' | 'medium' | 'low';
  implementation: string;
  timeToImplement: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export function AlertsAndRecommendations() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  // Mock data - replace with real API calls
  useEffect(() => {
    // Fetch alerts
    const mockAlerts: PerformanceAlert[] = [
      {
        id: '1',
        model: 'chatgpt',
        type: 'response_time',
        severity: 'warning',
        message: 'ChatGPT response time is 4500ms (threshold: 5000ms)',
        timestamp: new Date(),
        resolved: false,
      },
      {
        id: '2',
        model: 'gemini',
        type: 'cost_spike',
        severity: 'critical',
        message: 'Gemini cost increased by 75% (from $10 to $17.50)',
        timestamp: new Date(Date.now() - 3600000),
        resolved: false,
      },
    ];

    const mockRecs: Recommendation[] = [
      {
        id: '1',
        type: 'switch_model',
        title: 'Switch from Gemini to Claude',
        description: 'Claude offers similar performance at 40% lower cost per request',
        estimatedSavings: 150,
        savingsPercentage: 40,
        priority: 'high',
        implementation: 'Gradually migrate requests using A/B testing',
        timeToImplement: '2-3 days',
        riskLevel: 'low',
      },
      {
        id: '2',
        type: 'cache_results',
        title: 'Implement response caching',
        description: '25% of requests are duplicates - caching could eliminate these',
        estimatedSavings: 75,
        savingsPercentage: 25,
        priority: 'high',
        implementation: 'Add Redis caching layer',
        timeToImplement: '1-2 days',
        riskLevel: 'low',
      },
    ];

    setAlerts(mockAlerts);
    setRecommendations(mockRecs);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const totalSavings = recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-600">{activeAlerts.length}</span>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-600">{recommendations.length}</span>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Potential Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-600">${totalSavings}</span>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">Performance Alerts</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">All systems operating normally</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            activeAlerts.map((alert) => (
              <Alert key={alert.id} className={`border-2 ${getSeverityColor(alert.severity)}`}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPriorityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="font-semibold">{alert.model}</span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                      <div className="flex items-center gap-1 text-xs mt-2 text-gray-600">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      Details
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No optimization recommendations at this time</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Estimated Savings</p>
                      <p className="text-lg font-semibold text-green-600">${rec.estimatedSavings}</p>
                      <p className="text-xs text-gray-500">{rec.savingsPercentage}% reduction</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Implementation Time</p>
                      <p className="text-sm font-semibold">{rec.timeToImplement}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Risk Level</p>
                      <Badge
                        variant="outline"
                        className={
                          rec.riskLevel === 'low'
                            ? 'bg-green-50 text-green-700'
                            : rec.riskLevel === 'medium'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-red-50 text-red-700'
                        }
                      >
                        {rec.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-end">
                      <Button
                        size="sm"
                        onClick={() => setSelectedRec(rec)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Implementation:</p>
                    <p className="text-sm text-gray-600">{rec.implementation}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modals */}
      {selectedAlert && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Alert Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Message</p>
              <p>{selectedAlert.message}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Model</p>
              <p>{selectedAlert.model}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedAlert(null)}
              className="w-full"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedRec && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Recommendation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Title</p>
              <p>{selectedRec.title}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Description</p>
              <p>{selectedRec.description}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Implementation</p>
              <p>{selectedRec.implementation}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedRec(null)}
              className="w-full"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
