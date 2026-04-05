/**
 * AI Model Performance Benchmarking Service
 * Tracks and compares performance metrics across different AI models
 */

export interface ModelPerformanceMetrics {
  modelId: string;
  modelName: string;
  responseTime: number; // milliseconds
  accuracy: number; // 0-100
  costPerRequest: number; // USD
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  errorRate: number; // 0-100
  uptime: number; // 0-100
  qualityScore: number; // 0-100
  timestamp: Date;
}

export interface BenchmarkResult {
  id: string;
  testName: string;
  models: ModelPerformanceMetrics[];
  winner: string; // Best overall model
  createdAt: Date;
  duration: number; // milliseconds
}

export interface ModelComparison {
  metric: string;
  models: Array<{
    modelId: string;
    modelName: string;
    value: number;
    rank: number;
  }>;
}

const benchmarkResults: Map<string, BenchmarkResult> = new Map();
const performanceHistory: Map<string, ModelPerformanceMetrics[]> = new Map();

/**
 * Record model performance
 */
export function recordPerformance(metrics: ModelPerformanceMetrics): void {
  if (!performanceHistory.has(metrics.modelId)) {
    performanceHistory.set(metrics.modelId, []);
  }

  performanceHistory.get(metrics.modelId)!.push(metrics);

  // Keep only last 1000 records per model
  const history = performanceHistory.get(metrics.modelId)!;
  if (history.length > 1000) {
    history.shift();
  }
}

/**
 * Run benchmark test
 */
export function runBenchmark(
  testName: string,
  models: ModelPerformanceMetrics[]
): BenchmarkResult {
  const benchmarkId = `bench-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  // Calculate overall scores
  const scoredModels = models.map((model) => ({
    ...model,
    overallScore: calculateOverallScore(model),
  }));

  // Find winner
  const winner = scoredModels.reduce((best, current) =>
    current.overallScore > best.overallScore ? current : best
  );

  const result: BenchmarkResult = {
    id: benchmarkId,
    testName,
    models: scoredModels,
    winner: winner.modelId,
    createdAt: new Date(),
    duration: Date.now() - startTime,
  };

  benchmarkResults.set(benchmarkId, result);

  // Record performance
  models.forEach((model) => recordPerformance(model));

  return result;
}

/**
 * Calculate overall score for a model
 */
function calculateOverallScore(metrics: ModelPerformanceMetrics): number {
  const weights = {
    responseTime: 0.2,
    accuracy: 0.3,
    cost: 0.15,
    errorRate: 0.15,
    uptime: 0.1,
    quality: 0.1,
  };

  // Normalize metrics (0-100 scale)
  const normalizedResponseTime = Math.max(0, 100 - (metrics.responseTime / 10)); // Lower is better
  const normalizedCost = Math.max(0, 100 - metrics.costPerRequest * 1000); // Lower is better
  const normalizedErrorRate = 100 - metrics.errorRate; // Lower is better

  const score =
    normalizedResponseTime * weights.responseTime +
    metrics.accuracy * weights.accuracy +
    normalizedCost * weights.cost +
    normalizedErrorRate * weights.errorRate +
    metrics.uptime * weights.uptime +
    metrics.qualityScore * weights.quality;

  return Math.min(100, Math.max(0, score));
}

/**
 * Get model comparison
 */
export function compareModels(modelIds: string[], metric: keyof ModelPerformanceMetrics): ModelComparison {
  const comparison: ModelComparison = {
    metric: metric as string,
    models: [],
  };

  const modelMetrics: Array<{
    modelId: string;
    modelName: string;
    value: number;
  }> = [];

  for (const modelId of modelIds) {
    const history = performanceHistory.get(modelId) || [];
    if (history.length === 0) continue;

    // Calculate average for the metric
    let sum = 0;
    let count = 0;

    for (const record of history) {
      const value = getMetricValue(record, metric);
      if (value !== null) {
        sum += value;
        count++;
      }
    }

    if (count > 0) {
      modelMetrics.push({
        modelId,
        modelName: history[0].modelName,
        value: sum / count,
      });
    }
  }

  // Sort and rank
  modelMetrics.sort((a, b) => {
    // For cost and error rate, lower is better
    if (metric === 'costPerRequest' || metric === 'errorRate') {
      return a.value - b.value;
    }
    // For others, higher is better
    return b.value - a.value;
  });

  comparison.models = modelMetrics.map((m, index) => ({
    ...m,
    rank: index + 1,
  }));

  return comparison;
}

/**
 * Get metric value
 */
function getMetricValue(
  metrics: ModelPerformanceMetrics,
  metric: keyof ModelPerformanceMetrics
): number | null {
  const value = metrics[metric];

  if (typeof value === 'number') {
    return value;
  }

  if (metric === 'tokenUsage' && typeof value === 'object' && value !== null) {
    return (value as any).total;
  }

  return null;
}

/**
 * Get model statistics
 */
export function getModelStats(modelId: string) {
  const history = performanceHistory.get(modelId) || [];
  if (history.length === 0) return null;

  const avgResponseTime = history.reduce((sum, m) => sum + m.responseTime, 0) / history.length;
  const avgAccuracy = history.reduce((sum, m) => sum + m.accuracy, 0) / history.length;
  const avgCost = history.reduce((sum, m) => sum + m.costPerRequest, 0) / history.length;
  const avgErrorRate = history.reduce((sum, m) => sum + m.errorRate, 0) / history.length;
  const avgUptime = history.reduce((sum, m) => sum + m.uptime, 0) / history.length;
  const avgQuality = history.reduce((sum, m) => sum + m.qualityScore, 0) / history.length;

  const totalTokens = history.reduce((sum, m) => sum + m.tokenUsage.total, 0);

  return {
    modelId,
    modelName: history[0].modelName,
    recordCount: history.length,
    avgResponseTime: Math.round(avgResponseTime),
    avgAccuracy: Math.round(avgAccuracy * 100) / 100,
    avgCost: Math.round(avgCost * 10000) / 10000,
    avgErrorRate: Math.round(avgErrorRate * 100) / 100,
    avgUptime: Math.round(avgUptime * 100) / 100,
    avgQuality: Math.round(avgQuality * 100) / 100,
    totalTokensUsed: totalTokens,
    overallScore: calculateOverallScore({
      modelId,
      modelName: history[0].modelName,
      responseTime: avgResponseTime,
      accuracy: avgAccuracy,
      costPerRequest: avgCost,
      tokenUsage: { input: 0, output: 0, total: totalTokens },
      errorRate: avgErrorRate,
      uptime: avgUptime,
      qualityScore: avgQuality,
      timestamp: new Date(),
    }),
  };
}

/**
 * Get benchmark result
 */
export function getBenchmarkResult(benchmarkId: string): BenchmarkResult | undefined {
  return benchmarkResults.get(benchmarkId);
}

/**
 * Get all benchmarks
 */
export function getAllBenchmarks(): BenchmarkResult[] {
  return Array.from(benchmarkResults.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Get recent benchmarks
 */
export function getRecentBenchmarks(limit: number = 10): BenchmarkResult[] {
  return getAllBenchmarks().slice(0, limit);
}

/**
 * Get performance trend
 */
export function getPerformanceTrend(modelId: string, days: number = 7) {
  const history = performanceHistory.get(modelId) || [];
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

  const recentRecords = history.filter((m) => m.timestamp.getTime() > cutoffTime);

  if (recentRecords.length === 0) return null;

  // Group by day
  const byDay: Map<string, ModelPerformanceMetrics[]> = new Map();

  for (const record of recentRecords) {
    const date = new Date(record.timestamp);
    const dayKey = date.toISOString().split('T')[0];

    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, []);
    }
    byDay.get(dayKey)!.push(record);
  }

  // Calculate daily averages
  const trend = Array.from(byDay.entries()).map(([date, records]) => {
    const avgResponseTime = records.reduce((sum, m) => sum + m.responseTime, 0) / records.length;
    const avgAccuracy = records.reduce((sum, m) => sum + m.accuracy, 0) / records.length;
    const avgCost = records.reduce((sum, m) => sum + m.costPerRequest, 0) / records.length;
    const avgErrorRate = records.reduce((sum, m) => sum + m.errorRate, 0) / records.length;

    return {
      date,
      avgResponseTime: Math.round(avgResponseTime),
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      avgCost: Math.round(avgCost * 10000) / 10000,
      avgErrorRate: Math.round(avgErrorRate * 100) / 100,
      recordCount: records.length,
    };
  });

  return {
    modelId,
    modelName: recentRecords[0].modelName,
    days,
    trend,
  };
}

/**
 * Export benchmark data
 */
export function exportBenchmarkData(): string {
  const data = {
    benchmarks: Array.from(benchmarkResults.values()),
    performanceHistory: Array.from(performanceHistory.entries()).map(([modelId, history]) => ({
      modelId,
      records: history,
    })),
    exportedAt: new Date(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Get cost analysis
 */
export function getCostAnalysis(modelIds: string[]) {
  const analysis: Array<{
    modelId: string;
    modelName: string;
    avgCostPerRequest: number;
    totalCost: number;
    requestCount: number;
  }> = [];

  for (const modelId of modelIds) {
    const history = performanceHistory.get(modelId) || [];
    if (history.length === 0) continue;

    const totalCost = history.reduce((sum, m) => sum + m.costPerRequest, 0);
    const avgCost = totalCost / history.length;

    analysis.push({
      modelId,
      modelName: history[0].modelName,
      avgCostPerRequest: Math.round(avgCost * 10000) / 10000,
      totalCost: Math.round(totalCost * 100) / 100,
      requestCount: history.length,
    });
  }

  // Sort by total cost
  analysis.sort((a, b) => b.totalCost - a.totalCost);

  return analysis;
}

/**
 * Clear old performance data
 */
export function clearOldPerformanceData(maxAgeDays: number = 30): number {
  const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let cleared = 0;

  for (const [modelId, history] of performanceHistory) {
    const originalLength = history.length;
    const filtered = history.filter((m) => m.timestamp.getTime() > cutoffTime);

    if (filtered.length < originalLength) {
      performanceHistory.set(modelId, filtered);
      cleared += originalLength - filtered.length;
    }
  }

  console.log(`[Benchmarking] Cleared ${cleared} old performance records`);
  return cleared;
}
