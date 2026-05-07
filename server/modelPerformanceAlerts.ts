/**
 * Model Performance Alerts System
 * Monitor AI model performance and trigger alerts
 */

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'response_time' | 'success_rate' | 'cost_spike' | 'availability' | 'quality_drop';

export interface PerformanceAlert {
  id: string;
  model: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface AlertThreshold {
  model: string;
  responseTimeMax: number; // ms
  successRateMin: number; // percentage
  costSpikePercent: number; // percentage increase
  availabilityMin: number; // percentage
}

/**
 * Model Performance Alert Manager
 */
class ModelPerformanceAlertManager {
  private alerts: Map<string, PerformanceAlert> = new Map();
  private thresholds: Map<string, AlertThreshold> = new Map();
  private alertListeners: Set<(alert: PerformanceAlert) => void> = new Set();

  constructor() {
    this.initializeThresholds();
  }

  /**
   * Initialize default thresholds for each model
   */
  private initializeThresholds() {
    const models = ['chatgpt', 'gemini', 'claude', 'perplexity', 'grok'];

    models.forEach((model) => {
      this.thresholds.set(model, {
        model,
        responseTimeMax: 5000, // 5 seconds
        successRateMin: 95, // 95%
        costSpikePercent: 50, // 50% increase
        availabilityMin: 99, // 99%
      });
    });
  }

  /**
   * Set custom threshold for a model
   */
  setThreshold(model: string, threshold: Partial<AlertThreshold>) {
    const existing = this.thresholds.get(model);
    if (existing) {
      this.thresholds.set(model, { ...existing, ...threshold });
    }
  }

  /**
   * Get threshold for a model
   */
  getThreshold(model: string): AlertThreshold | undefined {
    return this.thresholds.get(model);
  }

  /**
   * Check response time and create alert if needed
   */
  checkResponseTime(model: string, responseTime: number) {
    const threshold = this.thresholds.get(model);
    if (!threshold) return;

    if (responseTime > threshold.responseTimeMax) {
      this.createAlert({
        model,
        type: 'response_time',
        severity: responseTime > threshold.responseTimeMax * 2 ? 'critical' : 'warning',
        message: `${model} response time is ${responseTime}ms (threshold: ${threshold.responseTimeMax}ms)`,
        threshold: threshold.responseTimeMax,
        currentValue: responseTime,
      });
    }
  }

  /**
   * Check success rate and create alert if needed
   */
  checkSuccessRate(model: string, successRate: number) {
    const threshold = this.thresholds.get(model);
    if (!threshold) return;

    if (successRate < threshold.successRateMin) {
      this.createAlert({
        model,
        type: 'success_rate',
        severity: successRate < threshold.successRateMin * 0.9 ? 'critical' : 'warning',
        message: `${model} success rate dropped to ${successRate}% (threshold: ${threshold.successRateMin}%)`,
        threshold: threshold.successRateMin,
        currentValue: successRate,
      });
    }
  }

  /**
   * Check cost spike and create alert if needed
   */
  checkCostSpike(model: string, currentCost: number, previousCost: number) {
    const threshold = this.thresholds.get(model);
    if (!threshold || previousCost === 0) return;

    const percentIncrease = ((currentCost - previousCost) / previousCost) * 100;

    if (percentIncrease > threshold.costSpikePercent) {
      this.createAlert({
        model,
        type: 'cost_spike',
        severity: percentIncrease > threshold.costSpikePercent * 2 ? 'critical' : 'warning',
        message: `${model} cost increased by ${percentIncrease.toFixed(1)}% (from $${previousCost.toFixed(2)} to $${currentCost.toFixed(2)})`,
        threshold: threshold.costSpikePercent,
        currentValue: percentIncrease,
      });
    }
  }

  /**
   * Check availability and create alert if needed
   */
  checkAvailability(model: string, availability: number) {
    const threshold = this.thresholds.get(model);
    if (!threshold) return;

    if (availability < threshold.availabilityMin) {
      this.createAlert({
        model,
        type: 'availability',
        severity: availability < threshold.availabilityMin * 0.9 ? 'critical' : 'warning',
        message: `${model} availability is ${availability}% (threshold: ${threshold.availabilityMin}%)`,
        threshold: threshold.availabilityMin,
        currentValue: availability,
      });
    }
  }

  /**
   * Check quality metrics and create alert if needed
   */
  checkQuality(model: string, qualityScore: number) {
    // Quality score: 0-100
    const qualityThreshold = 70;

    if (qualityScore < qualityThreshold) {
      this.createAlert({
        model,
        type: 'quality_drop',
        severity: qualityScore < qualityThreshold * 0.8 ? 'critical' : 'warning',
        message: `${model} quality score dropped to ${qualityScore} (threshold: ${qualityThreshold})`,
        threshold: qualityThreshold,
        currentValue: qualityScore,
      });
    }
  }

  /**
   * Create a new alert
   */
  private createAlert(data: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved' | 'resolvedAt'>) {
    const id = `${data.model}-${data.type}-${Date.now()}`;

    // Check if similar alert already exists
    const existingAlert = Array.from(this.alerts.values()).find(
      (a) => a.model === data.model && a.type === data.type && !a.resolved
    );

    if (existingAlert) {
      // Update existing alert
      existingAlert.currentValue = data.currentValue;
      existingAlert.timestamp = new Date();
      this.notifyListeners(existingAlert);
      return;
    }

    const alert: PerformanceAlert = {
      ...data,
      id,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.set(id, alert);
    this.notifyListeners(alert);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
    }
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter((a) => !a.resolved);
  }

  /**
   * Get alerts for a specific model
   */
  getModelAlerts(model: string): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter((a) => a.model === model && !a.resolved);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter((a) => a.severity === severity && !a.resolved);
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): PerformanceAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Subscribe to alert events
   */
  onAlert(callback: (alert: PerformanceAlert) => void) {
    this.alertListeners.add(callback);
    return () => this.alertListeners.delete(callback);
  }

  /**
   * Notify all listeners of a new alert
   */
  private notifyListeners(alert: PerformanceAlert) {
    this.alertListeners.forEach((listener) => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Error in alert listener:', error);
      }
    });
  }

  /**
   * Get alert statistics
   */
  getStatistics() {
    const allAlerts = Array.from(this.alerts.values());
    const activeAlerts = allAlerts.filter((a) => !a.resolved);

    const bySeverity = {
      critical: activeAlerts.filter((a) => a.severity === 'critical').length,
      warning: activeAlerts.filter((a) => a.severity === 'warning').length,
      info: activeAlerts.filter((a) => a.severity === 'info').length,
    };

    const byType = {
      response_time: activeAlerts.filter((a) => a.type === 'response_time').length,
      success_rate: activeAlerts.filter((a) => a.type === 'success_rate').length,
      cost_spike: activeAlerts.filter((a) => a.type === 'cost_spike').length,
      availability: activeAlerts.filter((a) => a.type === 'availability').length,
      quality_drop: activeAlerts.filter((a) => a.type === 'quality_drop').length,
    };

    const byModel: Record<string, number> = {};
    activeAlerts.forEach((a) => {
      byModel[a.model] = (byModel[a.model] || 0) + 1;
    });

    return {
      totalActive: activeAlerts.length,
      totalResolved: allAlerts.filter((a) => a.resolved).length,
      bySeverity,
      byType,
      byModel,
    };
  }

  /**
   * Clear old alerts (older than N days)
   */
  clearOldAlerts(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let deletedCount = 0;
    this.alerts.forEach((alert, id) => {
      if (alert.timestamp < cutoffDate && alert.resolved) {
        this.alerts.delete(id);
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Export alerts data
   */
  exportAlerts() {
    return {
      alerts: Array.from(this.alerts.values()),
      thresholds: Array.from(this.thresholds.values()),
      statistics: this.getStatistics(),
    };
  }
}

// Export singleton instance
export const modelPerformanceAlertManager = new ModelPerformanceAlertManager();
