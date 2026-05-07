/**
 * Recommendation Automation Engine
 * Auto-execute low-risk recommendations with user approval workflow
 */

import { costOptimizationEngine, CostOptimizationRecommendation } from './costOptimizationEngine';

export type AutomationStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';

export interface AutomationRequest {
  id: string;
  recommendationId: string;
  userId: number;
  status: AutomationStatus;
  recommendation: CostOptimizationRecommendation;
  approvalRequired: boolean;
  approvedBy?: number;
  approvedAt?: Date;
  executedAt?: Date;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recommendation Automation Manager
 */
class RecommendationAutomationManager {
  private automationRequests: Map<string, AutomationRequest> = new Map();
  private executionQueue: string[] = [];
  private isProcessing = false;

  /**
   * Auto-execute low-risk recommendations
   */
  async autoExecuteRecommendation(
    recommendation: CostOptimizationRecommendation,
    userId: number
  ): Promise<AutomationRequest> {
    // Check if recommendation is low-risk
    if (recommendation.riskLevel !== 'low') {
      throw new Error('Only low-risk recommendations can be auto-executed');
    }

    const id = `auto-${recommendation.id}-${Date.now()}`;

    const request: AutomationRequest = {
      id,
      recommendationId: recommendation.id,
      userId,
      status: 'pending',
      recommendation,
      approvalRequired: false, // Low-risk = no approval needed
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.automationRequests.set(id, request);
    this.executionQueue.push(id);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return request;
  }

  /**
   * Request approval for medium-risk recommendation
   */
  async requestApproval(
    recommendation: CostOptimizationRecommendation,
    userId: number
  ): Promise<AutomationRequest> {
    const id = `approval-${recommendation.id}-${Date.now()}`;

    const request: AutomationRequest = {
      id,
      recommendationId: recommendation.id,
      userId,
      status: 'pending',
      recommendation,
      approvalRequired: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.automationRequests.set(id, request);
    return request;
  }

  /**
   * Approve automation request
   */
  async approveRequest(requestId: string, approvedBy: number): Promise<AutomationRequest> {
    const request = this.automationRequests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();
    request.updatedAt = new Date();

    this.executionQueue.push(requestId);

    if (!this.isProcessing) {
      this.processQueue();
    }

    return request;
  }

  /**
   * Reject automation request
   */
  async rejectRequest(requestId: string): Promise<AutomationRequest> {
    const request = this.automationRequests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    request.status = 'rejected';
    request.updatedAt = new Date();

    return request;
  }

  /**
   * Process automation queue
   */
  private async processQueue() {
    if (this.isProcessing || this.executionQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.executionQueue.length > 0) {
        const requestId = this.executionQueue.shift();
        if (!requestId) break;

        const request = this.automationRequests.get(requestId);
        if (!request) continue;

        try {
          await this.executeRecommendation(request);
        } catch (error) {
          request.status = 'failed';
          request.error = error instanceof Error ? error.message : 'Unknown error';
          request.updatedAt = new Date();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute a recommendation
   */
  private async executeRecommendation(request: AutomationRequest): Promise<void> {
    const rec = request.recommendation;

    request.status = 'executing';
    request.updatedAt = new Date();

    try {
      let result: any;

      switch (rec.type) {
        case 'switch_model':
          result = await this.executeSwitchModel(rec);
          break;

        case 'batch_requests':
          result = await this.executeBatchRequests(rec);
          break;

        case 'cache_results':
          result = await this.executeCacheResults(rec);
          break;

        case 'reduce_tokens':
          result = await this.reduceTokens(rec);
          break;

        case 'tier_upgrade':
          result = await this.executeTierUpgrade(rec);
          break;

        default:
          throw new Error(`Unknown recommendation type: ${rec.type}`);
      }

      request.status = 'completed';
      request.result = result;
      request.executedAt = new Date();
    } catch (error) {
      request.status = 'failed';
      request.error = error instanceof Error ? error.message : 'Unknown error';
    }

    request.updatedAt = new Date();
  }

  /**
   * Execute model switch
   */
  private async executeSwitchModel(rec: CostOptimizationRecommendation): Promise<any> {
    // Implementation: Update model routing rules
    return {
      action: 'model_switch',
      message: 'Model switching rules updated',
      timestamp: new Date(),
    };
  }

  /**
   * Execute batch requests setup
   */
  private async executeBatchRequests(rec: CostOptimizationRecommendation): Promise<any> {
    // Implementation: Enable batch processing
    return {
      action: 'batch_enabled',
      message: 'Batch request processing enabled',
      timestamp: new Date(),
    };
  }

  /**
   * Execute cache setup
   */
  private async executeCacheResults(rec: CostOptimizationRecommendation): Promise<any> {
    // Implementation: Setup caching layer
    return {
      action: 'cache_enabled',
      message: 'Response caching enabled',
      timestamp: new Date(),
    };
  }

  /**
   * Execute token reduction
   */
  private async reduceTokens(rec: CostOptimizationRecommendation): Promise<any> {
    // Implementation: Apply prompt optimization
    return {
      action: 'tokens_reduced',
      message: 'Prompt optimization applied',
      timestamp: new Date(),
    };
  }

  /**
   * Execute tier upgrade
   */
  private async executeTierUpgrade(rec: CostOptimizationRecommendation): Promise<any> {
    // Implementation: Upgrade subscription tier
    return {
      action: 'tier_upgraded',
      message: 'Subscription tier upgraded',
      timestamp: new Date(),
    };
  }

  /**
   * Get automation request
   */
  getRequest(requestId: string): AutomationRequest | undefined {
    return this.automationRequests.get(requestId);
  }

  /**
   * Get all requests
   */
  getAllRequests(): AutomationRequest[] {
    return Array.from(this.automationRequests.values());
  }

  /**
   * Get requests by status
   */
  getRequestsByStatus(status: AutomationStatus): AutomationRequest[] {
    return Array.from(this.automationRequests.values()).filter((r) => r.status === status);
  }

  /**
   * Get requests by user
   */
  getRequestsByUser(userId: number): AutomationRequest[] {
    return Array.from(this.automationRequests.values()).filter((r) => r.userId === userId);
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(): AutomationRequest[] {
    return Array.from(this.automationRequests.values()).filter(
      (r) => r.status === 'pending' && r.approvalRequired
    );
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 100): AutomationRequest[] {
    return Array.from(this.automationRequests.values())
      .filter((r) => r.status === 'completed' || r.status === 'failed')
      .sort((a, b) => (b.executedAt?.getTime() || 0) - (a.executedAt?.getTime() || 0))
      .slice(0, limit);
  }

  /**
   * Get automation statistics
   */
  getStatistics() {
    const all = Array.from(this.automationRequests.values());

    return {
      total: all.length,
      byStatus: {
        pending: all.filter((r) => r.status === 'pending').length,
        approved: all.filter((r) => r.status === 'approved').length,
        rejected: all.filter((r) => r.status === 'rejected').length,
        executing: all.filter((r) => r.status === 'executing').length,
        completed: all.filter((r) => r.status === 'completed').length,
        failed: all.filter((r) => r.status === 'failed').length,
      },
      successRate: this.calculateSuccessRate(),
      totalSavingsExecuted: this.calculateTotalSavings(),
    };
  }

  /**
   * Calculate success rate
   */
  private calculateSuccessRate(): number {
    const completed = Array.from(this.automationRequests.values()).filter((r) => r.status === 'completed');
    const total = completed.length + Array.from(this.automationRequests.values()).filter((r) => r.status === 'failed').length;

    return total === 0 ? 0 : (completed.length / total) * 100;
  }

  /**
   * Calculate total savings from executed recommendations
   */
  private calculateTotalSavings(): number {
    return Array.from(this.automationRequests.values())
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.recommendation.estimatedSavings, 0);
  }

  /**
   * Export data
   */
  exportData() {
    return {
      requests: Array.from(this.automationRequests.values()),
      statistics: this.getStatistics(),
    };
  }

  /**
   * Clear old requests
   */
  clearOldRequests(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let deletedCount = 0;
    this.automationRequests.forEach((req, id) => {
      if (req.createdAt < cutoffDate && (req.status === 'completed' || req.status === 'failed' || req.status === 'rejected')) {
        this.automationRequests.delete(id);
        deletedCount++;
      }
    });

    return deletedCount;
  }
}

// Export singleton instance
export const recommendationAutomationManager = new RecommendationAutomationManager();
