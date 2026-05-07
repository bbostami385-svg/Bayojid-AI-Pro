/**
 * Cost Optimization Engine
 * Generate recommendations to optimize AI model spending
 */

export type RecommendationType = 'switch_model' | 'batch_requests' | 'cache_results' | 'reduce_tokens' | 'tier_upgrade';

export interface CostOptimizationRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  estimatedSavings: number; // in dollars
  savingsPercentage: number;
  priority: 'high' | 'medium' | 'low';
  affectedModel?: string;
  implementation: string;
  timeToImplement: string; // e.g., "1 hour", "1 day"
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface ModelComparison {
  model: string;
  costPerRequest: number;
  responseTime: number;
  successRate: number;
  qualityScore: number;
  totalCost: number;
  requestCount: number;
}

/**
 * Cost Optimization Recommendation Engine
 */
class CostOptimizationEngine {
  private recommendations: Map<string, CostOptimizationRecommendation> = new Map();

  /**
   * Analyze usage patterns and generate recommendations
   */
  analyzeAndRecommend(modelStats: any[], userUsagePatterns: any) {
    const recommendations: CostOptimizationRecommendation[] = [];

    // 1. Check for model switching opportunities
    recommendations.push(...this.findModelSwitchingOpportunities(modelStats));

    // 2. Check for batch processing opportunities
    recommendations.push(...this.findBatchProcessingOpportunities(userUsagePatterns));

    // 3. Check for caching opportunities
    recommendations.push(...this.findCachingOpportunities(userUsagePatterns));

    // 4. Check for token reduction opportunities
    recommendations.push(...this.findTokenReductionOpportunities(modelStats));

    // 5. Check for tier optimization
    recommendations.push(...this.findTierOptimizationOpportunities(userUsagePatterns));

    // Store and return
    recommendations.forEach((rec) => {
      this.recommendations.set(rec.id, rec);
    });

    return recommendations;
  }

  /**
   * Find model switching opportunities
   */
  private findModelSwitchingOpportunities(modelStats: any[]): CostOptimizationRecommendation[] {
    const recommendations: CostOptimizationRecommendation[] = [];

    // Compare models by cost-effectiveness
    const modelComparisons = modelStats.map((stat) => ({
      model: stat.model,
      costPerRequest: stat.totalCost / (stat.totalRequests || 1),
      responseTime: stat.averageResponseTime,
      successRate: stat.successRate,
      qualityScore: this.calculateQualityScore(stat),
      totalCost: stat.totalCost,
      requestCount: stat.totalRequests,
    }));

    // Find expensive models that could be replaced
    modelComparisons.forEach((expensive) => {
      const cheaper = modelComparisons.find(
        (m) =>
          m.costPerRequest < expensive.costPerRequest * 0.7 &&
          m.successRate >= expensive.successRate * 0.95 &&
          m.responseTime <= expensive.responseTime * 1.2
      );

      if (cheaper) {
        const estimatedSavings = expensive.totalCost * 0.3; // 30% savings
        const id = `switch-${expensive.model}-to-${cheaper.model}-${Date.now()}`;

        recommendations.push({
          id,
          type: 'switch_model',
          title: `Switch from ${expensive.model} to ${cheaper.model}`,
          description: `${cheaper.model} offers similar performance at ${(expensive.costPerRequest / cheaper.costPerRequest).toFixed(1)}x lower cost per request`,
          estimatedSavings,
          savingsPercentage: 30,
          priority: 'high',
          affectedModel: expensive.model,
          implementation: `Gradually migrate requests from ${expensive.model} to ${cheaper.model} using A/B testing`,
          timeToImplement: '2-3 days',
          riskLevel: 'low',
          createdAt: new Date(),
        });
      }
    });

    return recommendations;
  }

  /**
   * Find batch processing opportunities
   */
  private findBatchProcessingOpportunities(userUsagePatterns: any): CostOptimizationRecommendation[] {
    const recommendations: CostOptimizationRecommendation[] = [];

    // Check if user has many small requests
    if (userUsagePatterns.averageRequestSize < 100 && userUsagePatterns.dailyRequestCount > 100) {
      const estimatedSavings = userUsagePatterns.monthlySpend * 0.15; // 15% savings

      recommendations.push({
        id: `batch-${Date.now()}`,
        type: 'batch_requests',
        title: 'Implement batch request processing',
        description: 'Group small requests together to reduce API overhead and improve efficiency',
        estimatedSavings,
        savingsPercentage: 15,
        priority: 'medium',
        implementation: 'Implement request batching in your application code',
        timeToImplement: '4-6 hours',
        riskLevel: 'low',
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Find caching opportunities
   */
  private findCachingOpportunities(userUsagePatterns: any): CostOptimizationRecommendation[] {
    const recommendations: CostOptimizationRecommendation[] = [];

    // Check for repeated requests
    if (userUsagePatterns.duplicateRequestPercentage > 20) {
      const estimatedSavings = userUsagePatterns.monthlySpend * userUsagePatterns.duplicateRequestPercentage * 0.01;

      recommendations.push({
        id: `cache-${Date.now()}`,
        type: 'cache_results',
        title: 'Implement response caching',
        description: `${userUsagePatterns.duplicateRequestPercentage.toFixed(1)}% of requests are duplicates - caching could eliminate these`,
        estimatedSavings,
        savingsPercentage: userUsagePatterns.duplicateRequestPercentage * 0.8,
        priority: 'high',
        implementation: 'Add Redis or similar caching layer for API responses',
        timeToImplement: '1-2 days',
        riskLevel: 'low',
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Find token reduction opportunities
   */
  private findTokenReductionOpportunities(modelStats: any[]): CostOptimizationRecommendation[] {
    const recommendations: CostOptimizationRecommendation[] = [];

    // Check for models with high token usage
    modelStats.forEach((stat) => {
      const avgTokensPerRequest = stat.totalTokens / (stat.totalRequests || 1);

      if (avgTokensPerRequest > 1000) {
        const estimatedSavings = stat.totalCost * 0.2; // 20% savings

        recommendations.push({
          id: `tokens-${stat.model}-${Date.now()}`,
          type: 'reduce_tokens',
          title: `Optimize token usage for ${stat.model}`,
          description: `Average ${avgTokensPerRequest.toFixed(0)} tokens per request - consider prompt optimization`,
          estimatedSavings,
          savingsPercentage: 20,
          priority: 'medium',
          affectedModel: stat.model,
          implementation: 'Review and optimize prompts to reduce token consumption',
          timeToImplement: '2-3 hours',
          riskLevel: 'low',
          createdAt: new Date(),
        });
      }
    });

    return recommendations;
  }

  /**
   * Find tier optimization opportunities
   */
  private findTierOptimizationOpportunities(userUsagePatterns: any): CostOptimizationRecommendation[] {
    const recommendations: CostOptimizationRecommendation[] = [];

    // Check if user could benefit from higher tier
    if (userUsagePatterns.monthlySpend > 100 && userUsagePatterns.currentTier === 'free') {
      const estimatedSavings = userUsagePatterns.monthlySpend * 0.25; // 25% savings

      recommendations.push({
        id: `tier-upgrade-${Date.now()}`,
        type: 'tier_upgrade',
        title: 'Upgrade to Pro tier',
        description: 'Your usage justifies a Pro tier subscription with better rates and higher limits',
        estimatedSavings,
        savingsPercentage: 25,
        priority: 'high',
        implementation: 'Upgrade subscription tier in account settings',
        timeToImplement: 'Immediate',
        riskLevel: 'low',
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Calculate quality score for a model
   */
  private calculateQualityScore(stat: any): number {
    // Quality = success rate (50%) + availability (30%) + speed (20%)
    const speedScore = Math.max(0, 100 - (stat.averageResponseTime / 50)); // 0-100
    const successScore = stat.successRate; // 0-100
    const availabilityScore = 100; // Assume 100% if no data

    return successScore * 0.5 + availabilityScore * 0.3 + speedScore * 0.2;
  }

  /**
   * Get all recommendations
   */
  getAllRecommendations(): CostOptimizationRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  /**
   * Get recommendations by priority
   */
  getRecommendationsByPriority(priority: 'high' | 'medium' | 'low'): CostOptimizationRecommendation[] {
    return Array.from(this.recommendations.values()).filter((r) => r.priority === priority);
  }

  /**
   * Get recommendations by type
   */
  getRecommendationsByType(type: RecommendationType): CostOptimizationRecommendation[] {
    return Array.from(this.recommendations.values()).filter((r) => r.type === type);
  }

  /**
   * Calculate total potential savings
   */
  calculateTotalSavings(): number {
    return Array.from(this.recommendations.values()).reduce((sum, r) => sum + r.estimatedSavings, 0);
  }

  /**
   * Get top recommendations
   */
  getTopRecommendations(limit: number = 5): CostOptimizationRecommendation[] {
    return Array.from(this.recommendations.values())
      .sort((a, b) => {
        // Sort by savings amount and priority
        const savingsDiff = b.estimatedSavings - a.estimatedSavings;
        if (savingsDiff !== 0) return savingsDiff;

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, limit);
  }

  /**
   * Get recommendations summary
   */
  getSummary() {
    const all = Array.from(this.recommendations.values());
    const totalSavings = this.calculateTotalSavings();

    return {
      totalRecommendations: all.length,
      byPriority: {
        high: all.filter((r) => r.priority === 'high').length,
        medium: all.filter((r) => r.priority === 'medium').length,
        low: all.filter((r) => r.priority === 'low').length,
      },
      byType: {
        switch_model: all.filter((r) => r.type === 'switch_model').length,
        batch_requests: all.filter((r) => r.type === 'batch_requests').length,
        cache_results: all.filter((r) => r.type === 'cache_results').length,
        reduce_tokens: all.filter((r) => r.type === 'reduce_tokens').length,
        tier_upgrade: all.filter((r) => r.type === 'tier_upgrade').length,
      },
      totalSavings,
      averageSavingsPerRecommendation: totalSavings / (all.length || 1),
    };
  }

  /**
   * Export recommendations
   */
  exportRecommendations() {
    return {
      recommendations: Array.from(this.recommendations.values()),
      summary: this.getSummary(),
    };
  }

  /**
   * Clear old recommendations
   */
  clearOldRecommendations(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let deletedCount = 0;
    this.recommendations.forEach((rec, id) => {
      if (rec.createdAt < cutoffDate) {
        this.recommendations.delete(id);
        deletedCount++;
      }
    });

    return deletedCount;
  }
}

// Export singleton instance
export const costOptimizationEngine = new CostOptimizationEngine();
