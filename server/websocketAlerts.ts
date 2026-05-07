/**
 * WebSocket Alert Notifications System
 * Real-time alert delivery to admin dashboards
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { modelPerformanceAlertManager, PerformanceAlert } from './modelPerformanceAlerts';

export interface AlertSubscription {
  userId: number;
  socketId: string;
  alertTypes: string[];
  models: string[];
  minSeverity: 'info' | 'warning' | 'critical';
}

/**
 * WebSocket Alert Manager
 */
class WebSocketAlertManager {
  private io: SocketIOServer | null = null;
  private subscriptions: Map<string, AlertSubscription> = new Map();
  private alertHistory: PerformanceAlert[] = [];

  /**
   * Initialize WebSocket alert system
   */
  initialize(io: SocketIOServer) {
    this.io = io;

    // Listen to performance alerts
    modelPerformanceAlertManager.onAlert((alert) => {
      this.broadcastAlert(alert);
      this.storeAlertHistory(alert);
    });

    // Setup WebSocket event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`[Alerts] Admin connected: ${socket.id}`);

      // Subscribe to alerts
      socket.on('subscribe_alerts', (data: Partial<AlertSubscription>) => {
        const subscription: AlertSubscription = {
          userId: data.userId || 0,
          socketId: socket.id,
          alertTypes: data.alertTypes || ['response_time', 'success_rate', 'cost_spike', 'availability', 'quality_drop'],
          models: data.models || ['chatgpt', 'gemini', 'claude', 'perplexity', 'grok'],
          minSeverity: data.minSeverity || 'warning',
        };

        this.subscriptions.set(socket.id, subscription);
        console.log(`[Alerts] Admin subscribed to alerts: ${socket.id}`);

        // Send current active alerts
        const activeAlerts = modelPerformanceAlertManager.getActiveAlerts();
        socket.emit('current_alerts', activeAlerts);
      });

      // Unsubscribe from alerts
      socket.on('unsubscribe_alerts', () => {
        this.subscriptions.delete(socket.id);
        console.log(`[Alerts] Admin unsubscribed: ${socket.id}`);
      });

      // Get alert history
      socket.on('get_alert_history', (limit: number = 100) => {
        const history = this.alertHistory.slice(-limit);
        socket.emit('alert_history', history);
      });

      // Get alerts by model
      socket.on('get_model_alerts', (model: string) => {
        const alerts = modelPerformanceAlertManager.getModelAlerts(model);
        socket.emit('model_alerts', { model, alerts });
      });

      // Get alerts by severity
      socket.on('get_alerts_by_severity', (severity: 'info' | 'warning' | 'critical') => {
        const alerts = modelPerformanceAlertManager.getAlertsBySeverity(severity);
        socket.emit('severity_alerts', { severity, alerts });
      });

      // Resolve alert
      socket.on('resolve_alert', (alertId: string) => {
        modelPerformanceAlertManager.resolveAlert(alertId);
        this.broadcastAlertResolved(alertId);
      });

      // Get alert statistics
      socket.on('get_alert_stats', () => {
        const stats = modelPerformanceAlertManager.getStatistics();
        socket.emit('alert_stats', stats);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.subscriptions.delete(socket.id);
        console.log(`[Alerts] Admin disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast alert to subscribed admins
   */
  private broadcastAlert(alert: PerformanceAlert) {
    if (!this.io) return;

    this.subscriptions.forEach((subscription, socketId) => {
      // Check if subscription matches alert
      if (
        subscription.alertTypes.includes(alert.type) &&
        subscription.models.includes(alert.model) &&
        this.getSeverityLevel(alert.severity) >= this.getSeverityLevel(subscription.minSeverity)
      ) {
        this.io?.to(socketId).emit('new_alert', alert);

        // Also emit to admin room
        this.io?.to('admin_alerts').emit('new_alert', alert);
      }
    });
  }

  /**
   * Broadcast alert resolved event
   */
  private broadcastAlertResolved(alertId: string) {
    if (!this.io) return;

    this.io?.to('admin_alerts').emit('alert_resolved', { alertId });
  }

  /**
   * Store alert in history
   */
  private storeAlertHistory(alert: PerformanceAlert) {
    this.alertHistory.push(alert);

    // Keep only last 1000 alerts
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
  }

  /**
   * Get severity level for comparison
   */
  private getSeverityLevel(severity: string): number {
    switch (severity) {
      case 'critical':
        return 3;
      case 'warning':
        return 2;
      case 'info':
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Send alert to specific user
   */
  sendAlertToUser(userId: number, alert: PerformanceAlert) {
    if (!this.io) return;

    // Find sockets for this user
    this.subscriptions.forEach((subscription, socketId) => {
      if (subscription.userId === userId) {
        this.io?.to(socketId).emit('direct_alert', alert);
      }
    });
  }

  /**
   * Send alert to all admins
   */
  sendAlertToAllAdmins(alert: PerformanceAlert) {
    if (!this.io) return;
    this.io?.to('admin_alerts').emit('broadcast_alert', alert);
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get subscriptions by model
   */
  getSubscriptionsByModel(model: string): AlertSubscription[] {
    return Array.from(this.subscriptions.values()).filter((sub) => sub.models.includes(model));
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics() {
    return {
      activeSubscriptions: this.subscriptions.size,
      totalAlertsInHistory: this.alertHistory.length,
      recentAlerts: this.alertHistory.slice(-10),
      performanceStats: modelPerformanceAlertManager.getStatistics(),
    };
  }

  /**
   * Export all data
   */
  exportData() {
    return {
      subscriptions: Array.from(this.subscriptions.values()),
      alertHistory: this.alertHistory,
      performanceData: modelPerformanceAlertManager.exportAlerts(),
    };
  }
}

// Export singleton instance
export const websocketAlertManager = new WebSocketAlertManager();
