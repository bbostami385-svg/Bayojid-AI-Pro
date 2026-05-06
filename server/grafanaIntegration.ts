/**
 * Grafana Integration Service
 * Manages dashboards, metrics, and analytics visualization
 */

import axios, { AxiosInstance } from 'axios';

export interface GrafanaConfig {
  baseUrl: string;
  apiKey: string;
  orgId?: number;
}

export interface Dashboard {
  id: number;
  uid: string;
  title: string;
  description: string;
  tags: string[];
  panels: Panel[];
}

export interface Panel {
  id: number;
  title: string;
  type: 'graph' | 'stat' | 'gauge' | 'table' | 'piechart';
  targets: Target[];
}

export interface Target {
  refId: string;
  expr: string; // Prometheus query
}

export interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export class GrafanaIntegrationService {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private orgId: number;

  constructor(config: GrafanaConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.orgId = config.orgId || 1;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create dashboard
   */
  public async createDashboard(title: string, description: string, tags: string[]): Promise<Dashboard> {
    try {
      const dashboard = {
        dashboard: {
          title,
          description,
          tags,
          timezone: 'browser',
          panels: [],
          refresh: '30s',
          time: {
            from: 'now-6h',
            to: 'now',
          },
        },
        overwrite: true,
      };

      const response = await this.client.post('/api/dashboards/db', dashboard);
      console.log('Dashboard created:', response.data);

      return {
        id: response.data.id,
        uid: response.data.uid,
        title,
        description,
        tags,
        panels: [],
      };
    } catch (error) {
      console.error('Failed to create dashboard:', error);
      throw error;
    }
  }

  /**
   * Add panel to dashboard
   */
  public async addPanelToDashboard(
    dashboardUid: string,
    panelTitle: string,
    panelType: string,
    query: string
  ): Promise<Panel> {
    try {
      const dashboard = await this.getDashboard(dashboardUid);

      const newPanel: Panel = {
        id: dashboard.panels.length + 1,
        title: panelTitle,
        type: panelType as any,
        targets: [
          {
            refId: 'A',
            expr: query,
          },
        ],
      };

      dashboard.panels.push(newPanel);

      const updatePayload = {
        dashboard: {
          ...dashboard,
          panels: dashboard.panels,
        },
        overwrite: true,
      };

      await this.client.post(`/api/dashboards/db`, updatePayload);
      console.log('Panel added to dashboard');

      return newPanel;
    } catch (error) {
      console.error('Failed to add panel:', error);
      throw error;
    }
  }

  /**
   * Get dashboard
   */
  public async getDashboard(dashboardUid: string): Promise<Dashboard> {
    try {
      const response = await this.client.get(`/api/dashboards/uid/${dashboardUid}`);
      const data = response.data.dashboard;

      return {
        id: data.id,
        uid: data.uid,
        title: data.title,
        description: data.description || '',
        tags: data.tags || [],
        panels: data.panels || [],
      };
    } catch (error) {
      console.error('Failed to get dashboard:', error);
      throw error;
    }
  }

  /**
   * List all dashboards
   */
  public async listDashboards(): Promise<Dashboard[]> {
    try {
      const response = await this.client.get('/api/search?type=dash-db');
      return response.data.map((dash: any) => ({
        id: dash.id,
        uid: dash.uid,
        title: dash.title,
        description: '',
        tags: dash.tags || [],
        panels: [],
      }));
    } catch (error) {
      console.error('Failed to list dashboards:', error);
      throw error;
    }
  }

  /**
   * Delete dashboard
   */
  public async deleteDashboard(dashboardUid: string): Promise<void> {
    try {
      await this.client.delete(`/api/dashboards/uid/${dashboardUid}`);
      console.log('Dashboard deleted');
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
      throw error;
    }
  }

  /**
   * Create data source
   */
  public async createDataSource(name: string, type: string, url: string): Promise<any> {
    try {
      const dataSource = {
        name,
        type,
        url,
        access: 'proxy',
        isDefault: false,
      };

      const response = await this.client.post('/api/datasources', dataSource);
      console.log('Data source created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create data source:', error);
      throw error;
    }
  }

  /**
   * Create alert
   */
  public async createAlert(
    dashboardUid: string,
    panelId: number,
    alertName: string,
    condition: string,
    threshold: number
  ): Promise<any> {
    try {
      const alert = {
        name: alertName,
        condition,
        data: [
          {
            refId: 'A',
            queryType: '',
            model: {
              expr: condition,
              interval: '',
              refId: 'A',
            },
            datasourceUid: 'prometheus_uid',
            relativeTimeRange: {
              from: 600,
              to: 0,
            },
          },
        ],
        noDataState: 'NoData',
        execErrState: 'Alerting',
        for: '5m',
        annotations: {
          description: `Alert triggered when ${alertName} exceeds ${threshold}`,
            summary: alertName,
        },
        labels: {},
      };

      const response = await this.client.post('/api/v1/rules', alert);
      console.log('Alert created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  }

  /**
   * Query metrics
   */
  public async queryMetrics(query: string, start: Date, end: Date, step: string = '15s'): Promise<Metric[]> {
    try {
      const startTime = Math.floor(start.getTime() / 1000);
      const endTime = Math.floor(end.getTime() / 1000);

      const response = await this.client.get('/api/datasources/proxy/1/query', {
        params: {
          query,
          start: startTime,
          end: endTime,
          step,
        },
      });

      const metrics: Metric[] = [];
      if (response.data.data && response.data.data.result) {
        response.data.data.result.forEach((result: any) => {
          result.values.forEach((value: any) => {
            metrics.push({
              name: query,
              value: parseFloat(value[1]),
              timestamp: new Date(value[0] * 1000),
              labels: result.metric,
            });
          });
        });
      }

      return metrics;
    } catch (error) {
      console.error('Failed to query metrics:', error);
      throw error;
    }
  }

  /**
   * Get dashboard stats
   */
  public async getDashboardStats(): Promise<Record<string, any>> {
    try {
      const dashboards = await this.listDashboards();
      const response = await this.client.get('/api/health');

      return {
        totalDashboards: dashboards.length,
        grafanaVersion: response.data.version,
        database: response.data.database,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Test connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      console.log('Grafana connection successful:', response.data);
      return true;
    } catch (error) {
      console.error('Grafana connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
let grafanaService: GrafanaIntegrationService | null = null;

export function initializeGrafanaIntegration(config: GrafanaConfig): GrafanaIntegrationService {
  if (!grafanaService) {
    grafanaService = new GrafanaIntegrationService(config);
  }
  return grafanaService;
}

export function getGrafanaIntegration(): GrafanaIntegrationService | null {
  return grafanaService;
}
