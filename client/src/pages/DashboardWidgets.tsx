import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, X, Settings, Grid3x3, List } from 'lucide-react';

interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, unknown>;
  isVisible: boolean;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  isDefault: boolean;
}

const DashboardWidgets: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'widget-1',
      type: 'metric',
      title: 'Total Conversations',
      size: 'small',
      config: { value: 1245, change: '+12%', trend: 'up' },
      isVisible: true,
    },
    {
      id: 'widget-2',
      type: 'metric',
      title: 'Active Users',
      size: 'small',
      config: { value: 342, change: '+8%', trend: 'up' },
      isVisible: true,
    },
    {
      id: 'widget-3',
      type: 'metric',
      title: 'Total Revenue',
      size: 'small',
      config: { value: '$12,450', change: '+15%', trend: 'up' },
      isVisible: true,
    },
    {
      id: 'widget-4',
      type: 'chart',
      title: 'Activity Trend',
      size: 'large',
      config: { chartType: 'line' },
      isVisible: true,
    },
    {
      id: 'widget-5',
      type: 'chart',
      title: 'Revenue Distribution',
      size: 'medium',
      config: { chartType: 'bar' },
      isVisible: true,
    },
  ]);

  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample data for charts
  const activityData = [
    { date: '2024-04-01', conversations: 45, messages: 320 },
    { date: '2024-04-02', conversations: 52, messages: 380 },
    { date: '2024-04-03', conversations: 48, messages: 350 },
    { date: '2024-04-04', conversations: 61, messages: 420 },
    { date: '2024-04-05', conversations: 55, messages: 390 },
  ];

  const revenueData = [
    { method: 'Stripe', amount: 8450 },
    { method: 'SSLCommerz', amount: 4000 },
  ];

  const handleAddWidget = () => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: 'metric',
      title: 'New Widget',
      size: 'small',
      config: {},
      isVisible: true,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const handleToggleWidget = (id: string) => {
    setWidgets(
      widgets.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w))
    );
  };

  const handleResizeWidget = (id: string, newSize: 'small' | 'medium' | 'large') => {
    setWidgets(
      widgets.map((w) => (w.id === id ? { ...w, size: newSize } : w))
    );
  };

  const getWidgetColSpan = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-2';
      case 'large':
        return 'col-span-3';
      default:
        return 'col-span-1';
    }
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.isVisible) return null;

    return (
      <div
        key={widget.id}
        className={`${getWidgetColSpan(widget.size)} bg-slate-800 border border-slate-700 rounded-lg p-4`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{widget.title}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => setEditingWidget(widget.id)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => handleRemoveWidget(widget.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {widget.type === 'metric' && (
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">{widget.config.value}</p>
            <p className={`text-sm ${widget.config.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {widget.config.change} from last period
            </p>
          </div>
        )}

        {widget.type === 'chart' && widget.config.chartType === 'line' && (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Line type="monotone" dataKey="conversations" stroke="#3b82f6" />
              <Line type="monotone" dataKey="messages" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {widget.type === 'chart' && widget.config.chartType === 'bar' && (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="method" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {editingWidget === widget.id && (
          <div className="mt-4 p-3 bg-slate-700/50 rounded border border-slate-600">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm">Widget Size</label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant={widget.size === size ? 'default' : 'outline'}
                    onClick={() => handleResizeWidget(widget.id, size)}
                    className={widget.size === size ? 'bg-blue-600' : 'border-slate-600 text-slate-300'}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setEditingWidget(null)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Widgets</h1>
          <p className="text-slate-400">Customize your dashboard with draggable widgets</p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleAddWidget}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>

          <div className="flex gap-2 ml-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              className={viewMode === 'grid' ? 'bg-blue-600' : 'border-slate-600 text-slate-300'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              className={viewMode === 'list' ? 'bg-blue-600' : 'border-slate-600 text-slate-300'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Widgets Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {widgets.map((widget) => renderWidget(widget))}
          </div>
        ) : (
          <div className="space-y-4">
            {widgets.map((widget) => (
              <Card key={widget.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{widget.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        Type: {widget.type} • Size: {widget.size}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => handleToggleWidget(widget.id)}
                      >
                        {widget.isVisible ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => handleRemoveWidget(widget.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Widget Library */}
        <Card className="mt-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Available Widgets</CardTitle>
            <CardDescription className="text-slate-400">
              Drag widgets from the library to add them to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'metric', label: 'Metric Card' },
                { type: 'chart', label: 'Line Chart' },
                { type: 'chart', label: 'Bar Chart' },
                { type: 'table', label: 'Data Table' },
                { type: 'list', label: 'List View' },
                { type: 'chart', label: 'Pie Chart' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors text-center"
                >
                  <p className="text-slate-300 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Layout */}
        <div className="mt-6 flex gap-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Save Layout
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgets;
