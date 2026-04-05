/**
 * API Usage Analytics Service
 * Tracks and analyzes long-term API usage trends
 */

export type TimeGranularity = 'minute' | 'hour' | 'day' | 'week' | 'month';

export interface APIUsageMetric {
  id: string;
  endpoint: string;
  timestamp: Date;
  granularity: TimeGranularity;
  requests: number;
  successfulRequests: number;
  failedRequests: number;
  totalLatency: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  errors: number;
  timeouts: number;
  throttled: number;
  bytes: number;
  cost: number;
}

export interface APITrendAnalysis {
  endpoint: string;
  period: {
    from: Date;
    to: Date;
  };
  granularity: TimeGranularity;
  metrics: APIUsageMetric[];
  summary: {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    peakLatency: number;
    totalCost: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    trendPercentage: number;
  };
}

export interface EndpointComparison {
  endpoints: string[];
  period: {
    from: Date;
    to: Date;
  };
  comparison: {
    endpoint: string;
    requests: number;
    successRate: number;
    avgLatency: number;
    cost: number;
    trend: string;
  }[];
}

export interface CostAnalysis {
  period: {
    from: Date;
    to: Date;
  };
  totalCost: number;
  costByEndpoint: Record<string, number>;
  costByDay: Record<string, number>;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  costPerRequest: number;
  forecast: {
    estimatedMonthlyCost: number;
    estimatedYearlyCost: number;
  };
}

const usageMetrics: Map<string, APIUsageMetric[]> = new Map();
const endpointMetrics: Map<string, APIUsageMetric[]> = new Map();
const costHistory: Map<string, number> = new Map();

/**
 * Record API usage
 */
export function recordAPIUsage(
  endpoint: string,
  latency: number,
  success: boolean,
  options?: {
    bytes?: number;
    cost?: number;
    error?: boolean;
    timeout?: boolean;
    throttled?: boolean;
  }
): APIUsageMetric {
  const now = new Date();
  const metricId = `metric-${endpoint}-${now.getTime()}`;

  const metric: APIUsageMetric = {
    id: metricId,
    endpoint,
    timestamp: now,
    granularity: 'minute',
    requests: 1,
    successfulRequests: success ? 1 : 0,
    failedRequests: success ? 0 : 1,
    totalLatency: latency,
    avgLatency: latency,
    minLatency: latency,
    maxLatency: latency,
    errors: options?.error ? 1 : 0,
    timeouts: options?.timeout ? 1 : 0,
    throttled: options?.throttled ? 1 : 0,
    bytes: options?.bytes || 0,
    cost: options?.cost || 0,
  };

  // Store in endpoint metrics
  if (!endpointMetrics.has(endpoint)) {
    endpointMetrics.set(endpoint, []);
  }
  endpointMetrics.get(endpoint)!.push(metric);

  // Store in time-based metrics
  const timeKey = getTimeKey(now, 'hour');
  if (!usageMetrics.has(timeKey)) {
    usageMetrics.set(timeKey, []);
  }
  usageMetrics.get(timeKey)!.push(metric);

  // Track cost
  const costKey = `cost-${endpoint}-${now.toISOString().split('T')[0]}`;
  const currentCost = costHistory.get(costKey) || 0;
  costHistory.set(costKey, currentCost + (options?.cost || 0));

  return metric;
}

/**
 * Get API trend analysis
 */
export function getAPITrendAnalysis(
  endpoint: string,
  period: { from: Date; to: Date },
  granularity: TimeGranularity = 'day'
): APITrendAnalysis {
  const metrics = endpointMetrics.get(endpoint) || [];
  const filteredMetrics = metrics.filter(
    (m) => m.timestamp >= period.from && m.timestamp <= period.to
  );

  // Aggregate metrics by granularity
  const aggregated = aggregateMetrics(filteredMetrics, granularity);

  // Calculate summary
  const totalRequests = aggregated.reduce((sum, m) => sum + m.requests, 0);
  const successfulRequests = aggregated.reduce((sum, m) => sum + m.successfulRequests, 0);
  const totalLatency = aggregated.reduce((sum, m) => sum + m.totalLatency, 0);
  const totalCost = aggregated.reduce((sum, m) => sum + m.cost, 0);

  const avgLatency = totalRequests > 0 ? totalLatency / totalRequests : 0;
  const peakLatency = Math.max(...aggregated.map((m) => m.maxLatency), 0);
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

  // Calculate trend
  const firstHalf = aggregated.slice(0, Math.floor(aggregated.length / 2));
  const secondHalf = aggregated.slice(Math.floor(aggregated.length / 2));

  const firstHalfAvg =
    firstHalf.length > 0 ? firstHalf.reduce((sum, m) => sum + m.requests, 0) / firstHalf.length : 0;
  const secondHalfAvg =
    secondHalf.length > 0 ? secondHalf.reduce((sum, m) => sum + m.requests, 0) / secondHalf.length : 0;

  const trendPercentage =
    firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  const trend: 'increasing' | 'decreasing' | 'stable' =
    trendPercentage > 5 ? 'increasing' : trendPercentage < -5 ? 'decreasing' : 'stable';

  return {
    endpoint,
    period,
    granularity,
    metrics: aggregated,
    summary: {
      totalRequests,
      successRate,
      avgLatency,
      peakLatency,
      totalCost,
      trend,
      trendPercentage,
    },
  };
}

/**
 * Compare endpoints
 */
export function compareEndpoints(
  endpoints: string[],
  period: { from: Date; to: Date }
): EndpointComparison {
  const comparison = endpoints.map((endpoint) => {
    const analysis = getAPITrendAnalysis(endpoint, period, 'day');
    return {
      endpoint,
      requests: analysis.summary.totalRequests,
      successRate: analysis.summary.successRate,
      avgLatency: analysis.summary.avgLatency,
      cost: analysis.summary.totalCost,
      trend: `${analysis.summary.trend} (${analysis.summary.trendPercentage.toFixed(1)}%)`,
    };
  });

  return {
    endpoints,
    period,
    comparison,
  };
}

/**
 * Get cost analysis
 */
export function getCostAnalysis(period: { from: Date; to: Date }): CostAnalysis {
  const costByEndpoint: Record<string, number> = {};
  const costByDay: Record<string, number> = {};
  let totalCost = 0;

  // Aggregate costs
  for (const [key, cost] of costHistory) {
    if (key.startsWith('cost-')) {
      const [, endpoint, date] = key.split('-');
      const costDate = new Date(date);

      if (costDate >= period.from && costDate <= period.to) {
        costByEndpoint[endpoint] = (costByEndpoint[endpoint] || 0) + cost;
        costByDay[date] = (costByDay[date] || 0) + cost;
        totalCost += cost;
      }
    }
  }

  // Calculate trend
  const days = Object.entries(costByDay).sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
  const firstHalfDays = days.slice(0, Math.floor(days.length / 2));
  const secondHalfDays = days.slice(Math.floor(days.length / 2));

  const firstHalfCost = firstHalfDays.reduce((sum, [, cost]) => sum + cost, 0);
  const secondHalfCost = secondHalfDays.reduce((sum, [, cost]) => sum + cost, 0);

  const costTrend: 'increasing' | 'decreasing' | 'stable' =
    secondHalfCost > firstHalfCost ? 'increasing' : secondHalfCost < firstHalfCost ? 'decreasing' : 'stable';

  // Calculate cost per request
  let totalRequests = 0;
  for (const metrics of endpointMetrics.values()) {
    totalRequests += metrics.filter((m) => m.timestamp >= period.from && m.timestamp <= period.to).length;
  }
  const costPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

  // Forecast
  const daysDiff = Math.ceil((period.to.getTime() - period.from.getTime()) / (1000 * 60 * 60 * 24));
  const avgDailyCost = daysDiff > 0 ? totalCost / daysDiff : 0;
  const estimatedMonthlyCost = avgDailyCost * 30;
  const estimatedYearlyCost = avgDailyCost * 365;

  return {
    period,
    totalCost,
    costByEndpoint,
    costByDay,
    costTrend,
    costPerRequest,
    forecast: {
      estimatedMonthlyCost,
      estimatedYearlyCost,
    },
  };
}

/**
 * Get endpoint statistics
 */
export function getEndpointStats(endpoint: string): {
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  totalCost: number;
  lastUsed: Date | null;
} {
  const metrics = endpointMetrics.get(endpoint) || [];

  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      successRate: 0,
      avgLatency: 0,
      totalCost: 0,
      lastUsed: null,
    };
  }

  const totalRequests = metrics.length;
  const successfulRequests = metrics.filter((m) => m.successfulRequests > 0).length;
  const avgLatency = metrics.reduce((sum, m) => sum + m.avgLatency, 0) / totalRequests;
  const totalCost = metrics.reduce((sum, m) => sum + m.cost, 0);
  const lastUsed = metrics[metrics.length - 1]?.timestamp || null;

  return {
    totalRequests,
    successRate: (successfulRequests / totalRequests) * 100,
    avgLatency,
    totalCost,
    lastUsed,
  };
}

/**
 * Get all endpoints
 */
export function getAllEndpoints(): string[] {
  return Array.from(endpointMetrics.keys());
}

/**
 * Get usage by time range
 */
export function getUsageByTimeRange(
  timeRange: { from: Date; to: Date },
  granularity: TimeGranularity = 'day'
): {
  timestamp: Date;
  requests: number;
  avgLatency: number;
  cost: number;
}[] {
  const results: Record<string, any> = {};

  for (const metrics of usageMetrics.values()) {
    for (const metric of metrics) {
      if (metric.timestamp >= timeRange.from && metric.timestamp <= timeRange.to) {
        const timeKey = getTimeKey(metric.timestamp, granularity);

        if (!results[timeKey]) {
          results[timeKey] = {
            timestamp: parseTimeKey(timeKey),
            requests: 0,
            totalLatency: 0,
            cost: 0,
          };
        }

        results[timeKey].requests += metric.requests;
        results[timeKey].totalLatency += metric.totalLatency;
        results[timeKey].cost += metric.cost;
      }
    }
  }

  return Object.values(results)
    .map((r) => ({
      timestamp: r.timestamp,
      requests: r.requests,
      avgLatency: r.requests > 0 ? r.totalLatency / r.requests : 0,
      cost: r.cost,
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Cleanup old metrics
 */
export function cleanupOldMetrics(daysOld: number = 90): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  let cleaned = 0;

  for (const [endpoint, metrics] of endpointMetrics) {
    const filtered = metrics.filter((m) => m.timestamp >= cutoffDate);
    if (filtered.length < metrics.length) {
      cleaned += metrics.length - filtered.length;
      endpointMetrics.set(endpoint, filtered);
    }
  }

  console.log(`[Analytics] Cleaned up ${cleaned} old metrics`);

  return cleaned;
}

// Helper functions

function getTimeKey(date: Date, granularity: TimeGranularity): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  switch (granularity) {
    case 'minute':
      return `${year}-${month}-${day}T${hour}:${minute}`;
    case 'hour':
      return `${year}-${month}-${day}T${hour}`;
    case 'day':
      return `${year}-${month}-${day}`;
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 1) / 7)).padStart(2, '0')}`;
    case 'month':
      return `${year}-${month}`;
  }
}

function parseTimeKey(key: string): Date {
  if (key.includes('W')) {
    // Week format
    const [year, week] = key.split('-W');
    const date = new Date(parseInt(year), 0, 1);
    date.setDate(date.getDate() + (parseInt(week) - 1) * 7);
    return date;
  } else if (key.includes('T')) {
    return new Date(key);
  } else {
    return new Date(key);
  }
}

function aggregateMetrics(metrics: APIUsageMetric[], granularity: TimeGranularity): APIUsageMetric[] {
  const aggregated: Record<string, APIUsageMetric> = {};

  for (const metric of metrics) {
    const timeKey = getTimeKey(metric.timestamp, granularity);

    if (!aggregated[timeKey]) {
      aggregated[timeKey] = {
        id: `agg-${timeKey}`,
        endpoint: metric.endpoint,
        timestamp: parseTimeKey(timeKey),
        granularity,
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalLatency: 0,
        avgLatency: 0,
        minLatency: Infinity,
        maxLatency: 0,
        errors: 0,
        timeouts: 0,
        throttled: 0,
        bytes: 0,
        cost: 0,
      };
    }

    const agg = aggregated[timeKey];
    agg.requests += metric.requests;
    agg.successfulRequests += metric.successfulRequests;
    agg.failedRequests += metric.failedRequests;
    agg.totalLatency += metric.totalLatency;
    agg.minLatency = Math.min(agg.minLatency, metric.minLatency);
    agg.maxLatency = Math.max(agg.maxLatency, metric.maxLatency);
    agg.errors += metric.errors;
    agg.timeouts += metric.timeouts;
    agg.throttled += metric.throttled;
    agg.bytes += metric.bytes;
    agg.cost += metric.cost;
  }

  // Calculate averages
  for (const agg of Object.values(aggregated)) {
    agg.avgLatency = agg.requests > 0 ? agg.totalLatency / agg.requests : 0;
    if (agg.minLatency === Infinity) {
      agg.minLatency = 0;
    }
  }

  return Object.values(aggregated).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
