/**
 * AI Model Analytics Dashboard
 * Display comprehensive analytics for AI model usage
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

export function AIAnalyticsDashboard() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // Fetch analytics data
  const usageSummary = trpc.aiAnalytics.getUsageSummary.useQuery();
  const costAnalysis = trpc.aiAnalytics.getCostAnalysis.useQuery();
  const performanceComparison = trpc.aiAnalytics.getPerformanceComparison.useQuery();
  const recommendations = trpc.aiAnalytics.getRecommendations.useQuery();
  const modelStats = trpc.aiAnalytics.getModelStats.useQuery({ model: undefined });

  const models = ['chatgpt', 'gemini', 'claude', 'perplexity', 'grok'];
  const modelIcons: Record<string, string> = {
    chatgpt: '🤖',
    gemini: '✨',
    claude: '🧠',
    perplexity: '🔍',
    grok: '⚡',
  };

  const modelNames: Record<string, string> = {
    chatgpt: 'ChatGPT',
    gemini: 'Gemini',
    claude: 'Claude',
    perplexity: 'Perplexity',
    grok: 'Grok',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Model Analytics</h1>
        <p className="text-gray-600">Track usage, costs, and performance across all AI models</p>
      </div>

      {/* Summary Cards */}
      {usageSummary.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{usageSummary.data.totalRequests}</div>
              <p className="text-xs text-gray-500 mt-1">API calls made</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(usageSummary.data.totalTokens / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-gray-500 mt-1">Tokens processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${usageSummary.data.totalCost.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Cumulative spend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Models Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{usageSummary.data.modelsUsed}</div>
              <p className="text-xs text-gray-500 mt-1">Active models</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.data && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested models based on performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.data.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <h4 className="font-semibold text-sm mb-2">{rec.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{modelIcons[rec.model || '']}</span>
                    <span className="font-bold">{modelNames[rec.model || '']}</span>
                  </div>
                  <p className="text-xs text-gray-600">{rec.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Comparison */}
      {performanceComparison.data && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>Key metrics for each model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Model</th>
                    <th className="text-center py-2 px-4">Requests</th>
                    <th className="text-center py-2 px-4">Tokens</th>
                    <th className="text-center py-2 px-4">Cost</th>
                    <th className="text-center py-2 px-4">Avg Response</th>
                    <th className="text-center py-2 px-4">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceComparison.data.map((perf) => (
                    <tr key={perf.model} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">
                        <span className="mr-2">{modelIcons[perf.model]}</span>
                        {modelNames[perf.model]}
                      </td>
                      <td className="text-center py-3 px-4">{perf.requests}</td>
                      <td className="text-center py-3 px-4">{(perf.tokens / 1000).toFixed(1)}K</td>
                      <td className="text-center py-3 px-4">${perf.cost.toFixed(4)}</td>
                      <td className="text-center py-3 px-4">{perf.avgResponseTime}ms</td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="outline">{perf.successRate}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Analysis */}
      {costAnalysis.data && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>Breakdown of spending by model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costAnalysis.data.breakdown.map((item) => (
              <div key={item.model} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{modelIcons[item.model]}</span>
                    <span className="font-semibold">{modelNames[item.model]}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.totalCost.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">{item.percentageOfTotal.toFixed(1)}% of total</div>
                  </div>
                </div>

                {/* Cost bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                    style={{ width: `${item.percentageOfTotal}%` }}
                  />
                </div>

                {/* Cost per request */}
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Cost per request: ${item.costPerRequest.toFixed(6)}</span>
                  <span>Requests: {item.totalRequests}</span>
                </div>
              </div>
            ))}

            {/* Total summary */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Spend</span>
                <span className="text-lg font-bold">${costAnalysis.data.totalCost.toFixed(4)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Model Details</CardTitle>
          <CardDescription>Select a model to view detailed statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {models.map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(selectedModel === model ? null : model)}
                className={`p-4 rounded-lg border-2 transition text-center ${
                  selectedModel === model
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{modelIcons[model]}</div>
                <div className="font-semibold text-sm">{modelNames[model]}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline">Export Analytics</Button>
      </div>
    </div>
  );
}
