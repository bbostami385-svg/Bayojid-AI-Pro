import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface QuotaMetric {
  name: string;
  used: number;
  limit: number;
  unit: string;
  resetDate?: Date;
}

interface QuotaMonitorProps {
  tier?: 'free' | 'pro' | 'enterprise';
  metrics?: QuotaMetric[];
  onUpgrade?: () => void;
}

const DEFAULT_QUOTAS = {
  free: {
    messages: { limit: 100, unit: 'messages/month' },
    api_calls: { limit: 1000, unit: 'calls/month' },
    exports: { limit: 10, unit: 'exports/month' },
    storage: { limit: 1, unit: 'GB' },
    collaborations: { limit: 0, unit: 'shared chats' },
  },
  pro: {
    messages: { limit: 10000, unit: 'messages/month' },
    api_calls: { limit: 100000, unit: 'calls/month' },
    exports: { limit: 1000, unit: 'exports/month' },
    storage: { limit: 100, unit: 'GB' },
    collaborations: { limit: 50, unit: 'shared chats' },
  },
  enterprise: {
    messages: { limit: -1, unit: 'unlimited' },
    api_calls: { limit: -1, unit: 'unlimited' },
    exports: { limit: -1, unit: 'unlimited' },
    storage: { limit: -1, unit: 'unlimited' },
    collaborations: { limit: -1, unit: 'unlimited' },
  },
};

export function QuotaMonitor({ tier = 'free', metrics = [], onUpgrade }: QuotaMonitorProps) {
  const [quotas, setQuotas] = useState<Record<string, QuotaMetric>>({});
  const [warningThreshold] = useState(0.8); // 80%

  useEffect(() => {
    // Initialize quotas from metrics or defaults
    if (metrics.length > 0) {
      const quotaMap: Record<string, QuotaMetric> = {};
      metrics.forEach(metric => {
        quotaMap[metric.name] = metric;
      });
      setQuotas(quotaMap);
    } else {
      // Use default quotas for tier
      const tierQuotas = DEFAULT_QUOTAS[tier];
      const quotaMap: Record<string, QuotaMetric> = {};
      
      Object.entries(tierQuotas).forEach(([key, value]) => {
        quotaMap[key] = {
          name: key.replace(/_/g, ' ').toUpperCase(),
          used: Math.floor(Math.random() * (value.limit * 0.5)),
          limit: value.limit,
          unit: value.unit,
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
      });
      setQuotas(quotaMap);
    }
  }, [tier, metrics]);

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return (used / limit) * 100;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= warningThreshold * 100) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= warningThreshold * 100) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Usage & Quota</h2>
          <p className="text-sm text-muted-foreground">
            Your {tier.toUpperCase()} plan quota status
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {tier.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(quotas).map(([key, quota]) => {
          const percentage = getUsagePercentage(quota.used, quota.limit);
          const isUnlimited = quota.limit === -1;
          const isWarning = percentage >= warningThreshold * 100 && percentage < 100;
          const isExceeded = percentage >= 100;

          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{quota.name}</CardTitle>
                  {isUnlimited ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : isExceeded ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : isWarning ? (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isUnlimited ? (
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-green-600">Unlimited</p>
                    <p className="text-xs text-muted-foreground">No limits on this plan</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} {quota.unit}
                      </span>
                      <span className={`font-semibold ${getStatusColor(percentage)}`}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />
                    {quota.resetDate && (
                      <p className="text-xs text-muted-foreground">
                        Resets on {quota.resetDate.toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tier !== 'enterprise' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm">Need more capacity?</CardTitle>
            <CardDescription>
              Upgrade to {tier === 'free' ? 'Pro' : 'Enterprise'} for higher limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={onUpgrade}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Upgrade Plan
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
