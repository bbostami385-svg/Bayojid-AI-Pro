/**
 * AI Model Usage Tracker
 * Track usage, costs, and performance metrics for all AI models
 */

export type AIModel = 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | 'grok';

export interface ModelUsageRecord {
  id: string;
  userId: number;
  model: AIModel;
  prompt: string;
  response: string;
  tokensUsed: number;
  responseTime: number; // in ms
  cost: number;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export interface ModelStats {
  model: AIModel;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  lastUsed: Date;
  mostCommonUser?: number;
}

export interface UserModelPreference {
  userId: number;
  model: AIModel;
  usageCount: number;
  totalCost: number;
  lastUsed: Date;
}

/**
 * In-memory storage for usage tracking
 * TODO: Migrate to database
 */
class AIModelUsageTracker {
  private usageRecords: Map<string, ModelUsageRecord> = new Map();
  private modelStats: Map<AIModel, ModelStats> = new Map();
  private userPreferences: Map<string, UserModelPreference> = new Map();

  // Model costs per 1K tokens
  private modelCosts: Record<AIModel, number> = {
    chatgpt: 0.03,
    gemini: 0.005,
    claude: 0.015,
    perplexity: 0.002,
    grok: 0.01,
  };

  constructor() {
    this.initializeStats();
  }

  /**
   * Initialize stats for all models
   */
  private initializeStats() {
    const models: AIModel[] = ['chatgpt', 'gemini', 'claude', 'perplexity', 'grok'];
    models.forEach((model) => {
      this.modelStats.set(model, {
        model,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        successRate: 100,
        lastUsed: new Date(),
      });
    });
  }

  /**
   * Record a model usage
   */
  recordUsage(record: Omit<ModelUsageRecord, 'id' | 'cost'>) {
    const cost = this.calculateCost(record.model, record.tokensUsed);
    const id = `${Date.now()}-${Math.random()}`;

    const fullRecord: ModelUsageRecord = {
      ...record,
      id,
      cost,
    };

    // Store record
    this.usageRecords.set(id, fullRecord);

    // Update model stats
    this.updateModelStats(record.model, fullRecord);

    // Update user preferences
    this.updateUserPreferences(record.userId, record.model, cost);

    return fullRecord;
  }

  /**
   * Calculate cost for model usage
   */
  private calculateCost(model: AIModel, tokens: number): number {
    const costPer1k = this.modelCosts[model];
    return (tokens / 1000) * costPer1k;
  }

  /**
   * Update model statistics
   */
  private updateModelStats(model: AIModel, record: ModelUsageRecord) {
    const stats = this.modelStats.get(model);
    if (!stats) return;

    const totalRequests = stats.totalRequests + 1;
    const totalTokens = stats.totalTokens + record.tokensUsed;
    const totalCost = stats.totalCost + record.cost;
    const successCount = record.success ? 1 : 0;
    const previousSuccessCount = Math.round((stats.successRate / 100) * stats.totalRequests);
    const newSuccessCount = previousSuccessCount + successCount;
    const successRate = (newSuccessCount / totalRequests) * 100;

    const totalResponseTime = stats.averageResponseTime * stats.totalRequests + record.responseTime;
    const averageResponseTime = totalResponseTime / totalRequests;

    this.modelStats.set(model, {
      ...stats,
      totalRequests,
      totalTokens,
      totalCost,
      averageResponseTime,
      successRate,
      lastUsed: new Date(),
    });
  }

  /**
   * Update user model preferences
   */
  private updateUserPreferences(userId: number, model: AIModel, cost: number) {
    const key = `${userId}-${model}`;
    const existing = this.userPreferences.get(key);

    if (existing) {
      this.userPreferences.set(key, {
        ...existing,
        usageCount: existing.usageCount + 1,
        totalCost: existing.totalCost + cost,
        lastUsed: new Date(),
      });
    } else {
      this.userPreferences.set(key, {
        userId,
        model,
        usageCount: 1,
        totalCost: cost,
        lastUsed: new Date(),
      });
    }
  }

  /**
   * Get stats for a specific model
   */
  getModelStats(model: AIModel): ModelStats | undefined {
    return this.modelStats.get(model);
  }

  /**
   * Get all model stats
   */
  getAllModelStats(): ModelStats[] {
    return Array.from(this.modelStats.values());
  }

  /**
   * Get user's model preferences
   */
  getUserPreferences(userId: number): UserModelPreference[] {
    return Array.from(this.userPreferences.values()).filter((p) => p.userId === userId);
  }

  /**
   * Get user's favorite model
   */
  getUserFavoriteModel(userId: number): AIModel | undefined {
    const preferences = this.getUserPreferences(userId);
    if (preferences.length === 0) return undefined;

    return preferences.reduce((prev, current) =>
      prev.usageCount > current.usageCount ? prev : current
    ).model;
  }

  /**
   * Get total cost by model
   */
  getTotalCostByModel(): Record<AIModel, number> {
    const costs: Record<AIModel, number> = {
      chatgpt: 0,
      gemini: 0,
      claude: 0,
      perplexity: 0,
      grok: 0,
    };

    this.modelStats.forEach((stats) => {
      costs[stats.model] = stats.totalCost;
    });

    return costs;
  }

  /**
   * Get usage trend for a model (last N days)
   */
  getUsageTrend(model: AIModel, days: number = 7): Record<string, number> {
    const trend: Record<string, number> = {};
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trend[dateStr] = 0;
    }

    this.usageRecords.forEach((record) => {
      const dateStr = record.timestamp.toISOString().split('T')[0];
      if (record.model === model && trend[dateStr] !== undefined) {
        trend[dateStr]++;
      }
    });

    return trend;
  }

  /**
   * Get most used models
   */
  getMostUsedModels(limit: number = 5): ModelStats[] {
    return Array.from(this.modelStats.values())
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, limit);
  }

  /**
   * Get most expensive models
   */
  getMostExpensiveModels(limit: number = 5): ModelStats[] {
    return Array.from(this.modelStats.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  /**
   * Get fastest models
   */
  getFastestModels(limit: number = 5): ModelStats[] {
    return Array.from(this.modelStats.values())
      .sort((a, b) => a.averageResponseTime - b.averageResponseTime)
      .slice(0, limit);
  }

  /**
   * Get most reliable models
   */
  getMostReliableModels(limit: number = 5): ModelStats[] {
    return Array.from(this.modelStats.values())
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  }

  /**
   * Get usage summary
   */
  getUsageSummary() {
    const allStats = Array.from(this.modelStats.values());
    const totalRequests = allStats.reduce((sum, s) => sum + s.totalRequests, 0);
    const totalTokens = allStats.reduce((sum, s) => sum + s.totalTokens, 0);
    const totalCost = allStats.reduce((sum, s) => sum + s.totalCost, 0);
    const averageResponseTime =
      allStats.reduce((sum, s) => sum + s.averageResponseTime, 0) / allStats.length;

    return {
      totalRequests,
      totalTokens,
      totalCost,
      averageResponseTime,
      modelsUsed: allStats.filter((s) => s.totalRequests > 0).length,
      costBreakdown: this.getTotalCostByModel(),
    };
  }

  /**
   * Export usage data
   */
  exportUsageData() {
    return {
      records: Array.from(this.usageRecords.values()),
      stats: Array.from(this.modelStats.values()),
      preferences: Array.from(this.userPreferences.values()),
      summary: this.getUsageSummary(),
    };
  }

  /**
   * Clear old records (older than N days)
   */
  clearOldRecords(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let deletedCount = 0;
    this.usageRecords.forEach((record, id) => {
      if (record.timestamp < cutoffDate) {
        this.usageRecords.delete(id);
        deletedCount++;
      }
    });

    return deletedCount;
  }
}

// Export singleton instance
export const aiModelUsageTracker = new AIModelUsageTracker();
