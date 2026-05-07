import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Calendar } from 'lucide-react';

/**
 * Cost Tracking and Forecasting Dashboard
 * Display daily/weekly/monthly spend trends per model with forecasting
 */

interface CostData {
  date: string;
  chatgpt: number;
  gemini: number;
  claude: number;
  perplexity: number;
  grok: number;
  total: number;
}

interface ModelCost {
  model: string;
  cost: number;
  percentage: number;
  trend: number;
  requests: number;
  avgCostPerRequest: number;
}

interface Forecast {
  date: string;
  predicted: number;
  confidence: number;
  upper: number;
  lower: number;
}

const COLORS = {
  chatgpt: '#00a4ef',
  gemini: '#ea4335',
  claude: '#9b59b6',
  perplexity: '#f39c12',
  grok: '#1abc9c',
};

export function CostTrackingDashboard() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [costData, setCostData] = useState<CostData[]>([]);
  const [modelCosts, setModelCosts] = useState<ModelCost[]>([]);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(1000);
  const [budgetAlert, setBudgetAlert] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    // Generate mock cost data
    const mockCostData: CostData[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      chatgpt: Math.random() * 50 + 20,
      gemini: Math.random() * 40 + 15,
      claude: Math.random() * 45 + 18,
      perplexity: Math.random() * 30 + 10,
      grok: Math.random() * 25 + 8,
      total: 0,
    }));

    mockCostData.forEach((d) => {
      d.total = d.chatgpt + d.gemini + d.claude + d.perplexity + d.grok;
    });

    setCostData(mockCostData);

    // Calculate model costs
    const modelCosts: ModelCost[] = [
      {
        model: 'ChatGPT',
        cost: 450,
        percentage: 35,
        trend: 5,
        requests: 12000,
        avgCostPerRequest: 0.0375,
      },
      {
        model: 'Gemini',
        cost: 380,
        percentage: 29,
        trend: -3,
        requests: 10000,
        avgCostPerRequest: 0.038,
      },
      {
        model: 'Claude',
        cost: 320,
        percentage: 25,
        trend: 8,
        requests: 8000,
        avgCostPerRequest: 0.04,
      },
      {
        model: 'Perplexity',
        cost: 140,
        percentage: 11,
        trend: 2,
        requests: 5000,
        avgCostPerRequest: 0.028,
      },
      {
        model: 'Grok',
        cost: 110,
        percentage: 8,
        trend: 15,
        requests: 3000,
        avgCostPerRequest: 0.037,
      },
    ];

    setModelCosts(modelCosts);
    setTotalSpend(modelCosts.reduce((sum, m) => sum + m.cost, 0));

    // Check budget alert
    if (modelCosts.reduce((sum, m) => sum + m.cost, 0) > monthlyBudget * 0.8) {
      setBudgetAlert(true);
    }

    // Generate forecast
    const mockForecast: Forecast[] = Array.from({ length: 10 }, (_, i) => {
      const baseCost = 1300 + i * 50;
      return {
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        predicted: baseCost,
        confidence: 85 - i * 2,
        upper: baseCost * 1.15,
        lower: baseCost * 0.85,
      };
    });

    setForecast(mockForecast);
  }, [monthlyBudget]);

  const pieData = modelCosts.map((m) => ({
    name: m.model,
    value: m.cost,
  }));

  const budgetUsagePercent = (totalSpend / monthlyBudget) * 100;
  const budgetRemaining = monthlyBudget - totalSpend;

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Spend (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-600">${totalSpend.toFixed(2)}</span>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Budget Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${budgetRemaining.toFixed(2)}
              </span>
              {budgetRemaining >= 0 ? (
                <TrendingDown className="h-8 w-8 text-green-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{budgetUsagePercent.toFixed(1)}%</span>
                <span>${monthlyBudget}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${budgetUsagePercent > 100 ? 'bg-red-500' : budgetUsagePercent > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Projected End-Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-purple-600">${(totalSpend * 1.1).toFixed(2)}</span>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alert */}
      {budgetAlert && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900">Budget Alert</h3>
            <p className="text-sm text-yellow-800">
              You've used {budgetUsagePercent.toFixed(1)}% of your monthly budget. Consider optimizing your model selection or implementing caching.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Spend Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Model Breakdown</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        {/* Spend Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daily Spend Trends</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={timeRange === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('daily')}
                  >
                    Daily
                  </Button>
                  <Button
                    variant={timeRange === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('weekly')}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={timeRange === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('monthly')}
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="chatgpt" stroke={COLORS.chatgpt} name="ChatGPT" />
                  <Line type="monotone" dataKey="gemini" stroke={COLORS.gemini} name="Gemini" />
                  <Line type="monotone" dataKey="claude" stroke={COLORS.claude} name="Claude" />
                  <Line type="monotone" dataKey="perplexity" stroke={COLORS.perplexity} name="Perplexity" />
                  <Line type="monotone" dataKey="grok" stroke={COLORS.grok} name="Grok" />
                  <Line type="monotone" dataKey="total" stroke="#000" strokeWidth={2} name="Total" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Breakdown */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Model Details */}
            <div className="space-y-3">
              {modelCosts.map((model) => (
                <Card key={model.model}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[model.model.toLowerCase() as keyof typeof COLORS] }}
                        />
                        <span className="font-semibold">{model.model}</span>
                      </div>
                      <Badge variant="outline">{model.percentage}%</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Cost</p>
                        <p className="font-semibold">${model.cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Trend</p>
                        <p className={`font-semibold ${model.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {model.trend > 0 ? '+' : ''}{model.trend}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Requests</p>
                        <p className="font-semibold">{model.requests.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Cost/Req</p>
                        <p className="font-semibold">${model.avgCostPerRequest.toFixed(4)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Forecast */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Cost Forecast</CardTitle>
              <CardDescription>Predicted spend with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Predicted"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="upper"
                    stroke="#dc2626"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Upper Bound"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lower"
                    stroke="#16a34a"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Lower Bound"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Forecast Summary</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Predicted 30-day spend: ${forecast[forecast.length - 1]?.predicted.toFixed(2)}</li>
                  <li>• Confidence level: {forecast[0]?.confidence}%</li>
                  <li>• Expected range: ${forecast[forecast.length - 1]?.lower.toFixed(2)} - ${forecast[forecast.length - 1]?.upper.toFixed(2)}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
