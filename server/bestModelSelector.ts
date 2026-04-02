/**
 * স্বয়ংক্রিয় সেরা মডেল নির্বাচন সিস্টেম
 * পারফরম্যান্স মেট্রিক্স অনুযায়ী সেরা মডেল বেছে নেয়
 */

import { AIModelPerformanceTracker } from './aiModelIntegration';

export interface ModelSelectionCriteria {
  prioritizeSpeed?: boolean;
  prioritizeAccuracy?: boolean;
  maxErrorRate?: number;
  minResponseTime?: number;
  maxResponseTime?: number;
}

export class BestModelSelector {
  private performanceTracker: AIModelPerformanceTracker;
  private selectionHistory: Array<{ model: string; timestamp: number; reason: string }> = [];
  private lastSelectedModel: string | null = null;

  constructor(performanceTracker: AIModelPerformanceTracker) {
    this.performanceTracker = performanceTracker;
  }

  /**
   * সেরা মডেল স্বয়ংক্রিয়ভাবে নির্বাচন করুন
   */
  selectBestModel(criteria?: ModelSelectionCriteria): { model: string; reason: string } | null {
    const stats = this.performanceTracker.getAllStats();

    if (stats.length === 0) {
      return null;
    }

    // ফিল্টার করুন - শর্ত অনুযায়ী
    let filteredStats = stats;

    if (criteria?.maxErrorRate !== undefined) {
      filteredStats = filteredStats.filter(s => s.errorRate <= criteria.maxErrorRate!);
    }

    if (criteria?.minResponseTime !== undefined) {
      filteredStats = filteredStats.filter(s => s.averageResponseTime >= criteria.minResponseTime!);
    }

    if (criteria?.maxResponseTime !== undefined) {
      filteredStats = filteredStats.filter(s => s.averageResponseTime <= criteria.maxResponseTime!);
    }

    if (filteredStats.length === 0) {
      // যদি কোনো মডেল শর্ত পূরণ না করে, সব মডেল বিবেচনা করুন
      filteredStats = stats;
    }

    // স্কোর গণনা করুন
    const scored = filteredStats.map(stat => {
      let score = 0;
      let reason = '';

      if (criteria?.prioritizeSpeed) {
        // গতি অগ্রাধিকার - কম সময় = উচ্চ স্কোর
        score = 100 - (stat.averageResponseTime / 10); // 10ms প্রতি পয়েন্ট
        reason = 'গতি অগ্রাধিকার';
      } else if (criteria?.prioritizeAccuracy) {
        // নির্ভুলতা অগ্রাধিকার - কম ত্রুটি = উচ্চ স্কোর
        score = 100 - stat.errorRate;
        reason = 'নির্ভুলতা অগ্রাধিকার';
      } else {
        // ভারসাম্যপূর্ণ স্কোর
        const speedScore = 100 - (stat.averageResponseTime / 10);
        const accuracyScore = 100 - stat.errorRate;
        score = (speedScore + accuracyScore) / 2;
        reason = 'ভারসাম্যপূর্ণ পারফরম্যান্স';
      }

      return {
        model: stat.model,
        score,
        reason,
        stat
      };
    });

    // সর্বোচ্চ স্কোর সহ মডেল নির্বাচন করুন
    const best = scored.reduce((prev, current) =>
      current.score > prev.score ? current : prev
    );

    // ইতিহাসে যোগ করুন
    this.selectionHistory.push({
      model: best.model,
      timestamp: Date.now(),
      reason: best.reason
    });

    // শেষ নির্বাচিত মডেল আপডেট করুন
    this.lastSelectedModel = best.model;

    return {
      model: best.model,
      reason: `${best.reason} (স্কোর: ${Math.round(best.score)}%)`
    };
  }

  /**
   * দ্রুততম মডেল পান
   */
  getFastestModel(): { model: string; responseTime: number } | null {
    const stats = this.performanceTracker.getAllStats();
    if (stats.length === 0) return null;

    const fastest = stats.reduce((prev, current) =>
      current.averageResponseTime < prev.averageResponseTime ? current : prev
    );

    return {
      model: fastest.model,
      responseTime: Math.round(fastest.averageResponseTime)
    };
  }

  /**
   * সবচেয়ে নির্ভরযোগ্য মডেল পান (সবচেয়ে কম ত্রুটি)
   */
  getMostReliableModel(): { model: string; errorRate: number } | null {
    const stats = this.performanceTracker.getAllStats();
    if (stats.length === 0) return null;

    const mostReliable = stats.reduce((prev, current) =>
      current.errorRate < prev.errorRate ? current : prev
    );

    return {
      model: mostReliable.model,
      errorRate: Math.round(mostReliable.errorRate * 100) / 100
    };
  }

  /**
   * মডেল র‍্যাঙ্কিং পান
   */
  getRanking(): Array<{ rank: number; model: string; score: number; responseTime: number; errorRate: number }> {
    const stats = this.performanceTracker.getAllStats();

    const scored = stats.map(stat => {
      const speedScore = 100 - (stat.averageResponseTime / 10);
      const accuracyScore = 100 - stat.errorRate;
      const overallScore = (speedScore + accuracyScore) / 2;

      return {
        model: stat.model,
        score: Math.round(overallScore),
        responseTime: Math.round(stat.averageResponseTime),
        errorRate: Math.round(stat.errorRate * 100) / 100
      };
    });

    // স্কোর অনুযায়ী সাজান
    return scored
      .sort((a, b) => b.score - a.score)
      .map((item, idx) => ({
        rank: idx + 1,
        ...item
      }));
  }

  /**
   * নির্বাচন ইতিহাস পান
   */
  getSelectionHistory(limit: number = 10): Array<{ model: string; timestamp: number; reason: string }> {
    return this.selectionHistory.slice(-limit);
  }

  /**
   * শেষ নির্বাচিত মডেল পান
   */
  getLastSelectedModel(): string | null {
    return this.lastSelectedModel;
  }

  /**
   * মডেল তুলনা করুন
   */
  compareModels(models: string[]): Array<{
    model: string;
    responseTime: number;
    errorRate: number;
    score: number;
    recommendation: string;
  }> {
    const stats = this.performanceTracker.getAllStats();
    const modelStats = stats.filter(s => models.includes(s.model));

    return modelStats.map(stat => {
      const speedScore = 100 - (stat.averageResponseTime / 10);
      const accuracyScore = 100 - stat.errorRate;
      const overallScore = (speedScore + accuracyScore) / 2;

      let recommendation = '';
      if (stat.averageResponseTime < 1000) {
        recommendation = '⚡ দ্রুত';
      } else if (stat.errorRate < 5) {
        recommendation = '✓ নির্ভরযোগ্য';
      } else {
        recommendation = '→ মধ্যম';
      }

      return {
        model: stat.model,
        responseTime: Math.round(stat.averageResponseTime),
        errorRate: Math.round(stat.errorRate * 100) / 100,
        score: Math.round(overallScore),
        recommendation
      };
    });
  }

  /**
   * পারফরম্যান্স রিপোর্ট তৈরি করুন
   */
  generateReport(): {
    bestOverall: string;
    fastest: string;
    mostReliable: string;
    ranking: Array<any>;
    recommendations: string[];
  } {
    const best = this.selectBestModel();
    const fastest = this.getFastestModel();
    const mostReliable = this.getMostReliableModel();
    const ranking = this.getRanking();

    const recommendations: string[] = [];

    if (fastest) {
      recommendations.push(`দ্রুত মডেল: ${fastest.model} (${fastest.responseTime}ms)`);
    }

    if (mostReliable) {
      recommendations.push(`নির্ভরযোগ্য মডেল: ${mostReliable.model} (${mostReliable.errorRate}% ত্রুটি)`);
    }

    if (best) {
      recommendations.push(`সেরা সামগ্রিক: ${best.model}`);
    }

    return {
      bestOverall: best?.model || 'N/A',
      fastest: fastest?.model || 'N/A',
      mostReliable: mostReliable?.model || 'N/A',
      ranking,
      recommendations
    };
  }
}

/**
 * গ্লোবাল সেরা মডেল সিলেক্টর ইনস্ট্যান্স
 */
let globalBestModelSelector: BestModelSelector | null = null;

export function initializeBestModelSelector(performanceTracker: AIModelPerformanceTracker): BestModelSelector {
  if (!globalBestModelSelector) {
    globalBestModelSelector = new BestModelSelector(performanceTracker);
  }
  return globalBestModelSelector;
}

export function getBestModelSelector(): BestModelSelector | null {
  return globalBestModelSelector;
}
