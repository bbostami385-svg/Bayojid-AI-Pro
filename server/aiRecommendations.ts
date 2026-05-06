/**
 * AI-Powered Recommendations Service
 * Uses LLM to generate optimization recommendations
 */

import { invokeLLM } from './server/_core/llm';

export interface Recommendation {
  id: string;
  type: 'report_schedule' | 'segment_criteria' | 'user_engagement' | 'quota_optimization';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  estimatedImpact: string;
  createdAt: Date;
  implemented: boolean;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  avgEngagement: number;
  churnRate: number;
  topActivities: Array<{ name: string; count: number }>;
  userSegments: Array<{ name: string; size: number; engagement: number }>;
  reportMetrics: Record<string, any>;
}

export class AIRecommendationService {
  private recommendations: Map<string, Recommendation> = new Map();
  private analysisHistory: Array<{ timestamp: Date; data: AnalyticsData }> = [];

  /**
   * Generate recommendations based on analytics data
   */
  public async generateRecommendations(analyticsData: AnalyticsData): Promise<Recommendation[]> {
    try {
      this.analysisHistory.push({
        timestamp: new Date(),
        data: analyticsData,
      });

      const prompt = this.buildAnalysisPrompt(analyticsData);
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are an AI analytics expert. Analyze the provided metrics and generate specific, actionable recommendations for optimizing user engagement, report scheduling, and quota management. Return recommendations in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'recommendations',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['report_schedule', 'segment_criteria', 'user_engagement', 'quota_optimization'] },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      action: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      confidence: { type: 'number', minimum: 0, maximum: 100 },
                      estimatedImpact: { type: 'string' },
                    },
                    required: ['type', 'title', 'description', 'action', 'priority', 'confidence', 'estimatedImpact'],
                  },
                },
              },
              required: ['recommendations'],
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);

      const recommendations: Recommendation[] = parsed.recommendations.map((rec: any, index: number) => ({
        id: `rec_${Date.now()}_${index}`,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        action: rec.action,
        priority: rec.priority,
        confidence: rec.confidence,
        estimatedImpact: rec.estimatedImpact,
        createdAt: new Date(),
        implemented: false,
      }));

      // Store recommendations
      recommendations.forEach((rec) => {
        this.recommendations.set(rec.id, rec);
      });

      return recommendations;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  /**
   * Get optimization suggestions for report scheduling
   */
  public async getReportSchedulingSuggestions(analyticsData: AnalyticsData): Promise<string> {
    try {
      const prompt = `Based on the following analytics data, suggest optimal report scheduling:
        - Total Users: ${analyticsData.totalUsers}
        - Active Users: ${analyticsData.activeUsers}
        - Avg Engagement: ${analyticsData.avgEngagement}%
        - Churn Rate: ${analyticsData.churnRate}%
        
        Consider user activity patterns and provide specific recommendations for daily, weekly, and monthly reports.`;

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are an analytics expert. Provide specific, actionable recommendations for report scheduling.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Failed to get report scheduling suggestions:', error);
      return '';
    }
  }

  /**
   * Get segment optimization suggestions
   */
  public async getSegmentOptimizationSuggestions(analyticsData: AnalyticsData): Promise<string> {
    try {
      const segmentSummary = analyticsData.userSegments.map((seg) => `${seg.name}: ${seg.size} users (${seg.engagement}% engagement)`).join(', ');

      const prompt = `Based on the following user segments, suggest optimizations:
        ${segmentSummary}
        
        Provide recommendations for:
        1. New segments to create
        2. Segment criteria adjustments
        3. Targeting strategies for low-engagement segments`;

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a user segmentation expert. Provide specific recommendations for optimizing user segments.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Failed to get segment optimization suggestions:', error);
      return '';
    }
  }

  /**
   * Get engagement optimization suggestions
   */
  public async getEngagementOptimizationSuggestions(analyticsData: AnalyticsData): Promise<string> {
    try {
      const topActivities = analyticsData.topActivities.map((act) => `${act.name}: ${act.count}`).join(', ');

      const prompt = `Based on the following engagement metrics, suggest improvements:
        - Average Engagement: ${analyticsData.avgEngagement}%
        - Churn Rate: ${analyticsData.churnRate}%
        - Top Activities: ${topActivities}
        
        Provide specific strategies to:
        1. Increase overall engagement
        2. Reduce churn rate
        3. Promote high-value activities`;

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a user engagement expert. Provide specific, data-driven recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Failed to get engagement optimization suggestions:', error);
      return '';
    }
  }

  /**
   * Get quota optimization suggestions
   */
  public async getQuotaOptimizationSuggestions(analyticsData: AnalyticsData): Promise<string> {
    try {
      const prompt = `Based on the following usage metrics, suggest quota optimizations:
        - Total Users: ${analyticsData.totalUsers}
        - Active Users: ${analyticsData.activeUsers}
        - Average Engagement: ${analyticsData.avgEngagement}%
        
        Provide recommendations for:
        1. Optimal quota tiers
        2. Quota allocation by user segment
        3. Premium feature pricing`;

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a pricing and quota optimization expert. Provide specific recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Failed to get quota optimization suggestions:', error);
      return '';
    }
  }

  /**
   * Mark recommendation as implemented
   */
  public markAsImplemented(recommendationId: string): void {
    const rec = this.recommendations.get(recommendationId);
    if (rec) {
      rec.implemented = true;
    }
  }

  /**
   * Get all recommendations
   */
  public getAllRecommendations(): Recommendation[] {
    return Array.from(this.recommendations.values());
  }

  /**
   * Get pending recommendations
   */
  public getPendingRecommendations(): Recommendation[] {
    return Array.from(this.recommendations.values()).filter((r) => !r.implemented);
  }

  /**
   * Get high-priority recommendations
   */
  public getHighPriorityRecommendations(): Recommendation[] {
    return Array.from(this.recommendations.values())
      .filter((r) => r.priority === 'high' && !r.implemented)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Build analysis prompt
   */
  private buildAnalysisPrompt(data: AnalyticsData): string {
    return `Analyze the following analytics data and generate optimization recommendations:

Analytics Summary:
- Total Users: ${data.totalUsers}
- Active Users: ${data.activeUsers} (${((data.activeUsers / data.totalUsers) * 100).toFixed(1)}% active)
- Average Engagement: ${data.avgEngagement}%
- Churn Rate: ${data.churnRate}%

Top Activities:
${data.topActivities.map((act) => `- ${act.name}: ${act.count} events`).join('\n')}

User Segments:
${data.userSegments.map((seg) => `- ${seg.name}: ${seg.size} users (${seg.engagement}% engagement)`).join('\n')}

Based on this data, generate 5-7 specific, actionable recommendations for optimization.`;
  }

  /**
   * Get analysis history
   */
  public getAnalysisHistory(): Array<{ timestamp: Date; data: AnalyticsData }> {
    return [...this.analysisHistory];
  }

  /**
   * Clear old recommendations
   */
  public clearOldRecommendations(daysOld: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const toDelete: string[] = [];

    this.recommendations.forEach((rec, id) => {
      if (rec.createdAt < cutoffDate && rec.implemented) {
        toDelete.push(id);
      }
    });

    toDelete.forEach((id) => this.recommendations.delete(id));
  }
}

// Export singleton instance
let aiRecommendationService: AIRecommendationService | null = null;

export function initializeAIRecommendations(): AIRecommendationService {
  if (!aiRecommendationService) {
    aiRecommendationService = new AIRecommendationService();
  }
  return aiRecommendationService;
}

export function getAIRecommendationService(): AIRecommendationService {
  if (!aiRecommendationService) {
    aiRecommendationService = new AIRecommendationService();
  }
  return aiRecommendationService;
}
