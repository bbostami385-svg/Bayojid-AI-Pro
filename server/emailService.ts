/**
 * Email Service for Automated Reports
 * Handles sending emails with report attachments and notifications
 */

import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  cc?: string[];
  bcc?: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  subject: string;
  template: (data: Record<string, any>) => string;
  description: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private templates: Map<string, ReportTemplate> = new Map();
  private emailQueue: Array<{ options: EmailOptions; retries: number }> = [];
  private maxRetries = 3;

  constructor(config?: EmailConfig) {
    if (config) {
      this.initializeTransporter(config);
    }
    this.initializeTemplates();
  }

  private initializeTransporter(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  private initializeTemplates() {
    // Daily Analytics Report Template
    this.registerTemplate({
      id: 'daily_analytics',
      name: 'Daily Analytics Report',
      subject: 'Daily Analytics Report - {{date}}',
      template: (data) => `
        <h2>Daily Analytics Report</h2>
        <p>Date: ${data.date}</p>
        <h3>Key Metrics</h3>
        <ul>
          <li>Total Users: ${data.totalUsers}</li>
          <li>Active Users: ${data.activeUsers}</li>
          <li>Average Engagement: ${data.avgEngagement}%</li>
          <li>New Users: ${data.newUsers}</li>
        </ul>
        <h3>Top Activities</h3>
        <ul>
          ${data.topActivities?.map((activity: any) => `<li>${activity.name}: ${activity.count}</li>`).join('')}
        </ul>
      `,
      description: 'Daily summary of analytics metrics',
    });

    // Weekly Performance Report Template
    this.registerTemplate({
      id: 'weekly_performance',
      name: 'Weekly Performance Report',
      subject: 'Weekly Performance Report - Week of {{startDate}}',
      template: (data) => `
        <h2>Weekly Performance Report</h2>
        <p>Week of ${data.startDate} to ${data.endDate}</p>
        <h3>Performance Summary</h3>
        <table border="1" cellpadding="10">
          <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Change</th>
          </tr>
          <tr>
            <td>Total Users</td>
            <td>${data.totalUsers}</td>
            <td>${data.userChange > 0 ? '+' : ''}${data.userChange}%</td>
          </tr>
          <tr>
            <td>Engagement Rate</td>
            <td>${data.engagementRate}%</td>
            <td>${data.engagementChange > 0 ? '+' : ''}${data.engagementChange}%</td>
          </tr>
          <tr>
            <td>Churn Rate</td>
            <td>${data.churnRate}%</td>
            <td>${data.churnChange > 0 ? '+' : ''}${data.churnChange}%</td>
          </tr>
        </table>
      `,
      description: 'Weekly performance metrics and trends',
    });

    // User Segmentation Report Template
    this.registerTemplate({
      id: 'segmentation_report',
      name: 'User Segmentation Report',
      subject: 'User Segmentation Report',
      template: (data) => `
        <h2>User Segmentation Report</h2>
        <h3>Segment Breakdown</h3>
        <table border="1" cellpadding="10">
          <tr>
            <th>Segment</th>
            <th>User Count</th>
            <th>Avg Engagement</th>
            <th>Churn Rate</th>
          </tr>
          ${data.segments
            ?.map(
              (segment: any) => `
            <tr>
              <td>${segment.name}</td>
              <td>${segment.userCount}</td>
              <td>${segment.avgEngagement}%</td>
              <td>${segment.churnRate}%</td>
            </tr>
          `
            )
            .join('')}
        </table>
      `,
      description: 'Detailed user segmentation analysis',
    });

    // Alert Template
    this.registerTemplate({
      id: 'system_alert',
      name: 'System Alert',
      subject: 'System Alert: {{alertType}}',
      template: (data) => `
        <h2>System Alert</h2>
        <p><strong>Alert Type:</strong> ${data.alertType}</p>
        <p><strong>Severity:</strong> ${data.severity}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Time:</strong> ${data.timestamp}</p>
        ${data.action ? `<p><strong>Recommended Action:</strong> ${data.action}</p>` : ''}
      `,
      description: 'System alerts and notifications',
    });
  }

  public registerTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template);
  }

  public getTemplate(templateId: string): ReportTemplate | undefined {
    return this.templates.get(templateId);
  }

  public getAllTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email transporter not initialized. Email not sent.');
      this.emailQueue.push({ options, retries: 0 });
      return false;
    }

    try {
      await this.transporter.sendMail(options);
      console.log(`Email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      this.emailQueue.push({ options, retries: 0 });
      return false;
    }
  }

  public async sendReport(
    templateId: string,
    to: string | string[],
    data: Record<string, any>,
    attachments?: Array<{ filename: string; content: string | Buffer; contentType?: string }>
  ): Promise<boolean> {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return false;
    }

    const subject = template.subject.replace(/{{(\w+)}}/g, (match, key) => data[key] || match);
    const html = template.template(data);

    return this.sendEmail({
      to,
      subject,
      html,
      attachments,
    });
  }

  public async sendBulkEmails(
    recipients: Array<{ email: string; data: Record<string, any> }>,
    templateId: string,
    attachments?: Array<{ filename: string; content: string | Buffer; contentType?: string }>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const success = await this.sendReport(templateId, recipient.email, recipient.data, attachments);
      if (success) {
        sent++;
      } else {
        failed++;
      }
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { sent, failed };
  }

  public async retryFailedEmails(): Promise<number> {
    let retried = 0;

    for (let i = this.emailQueue.length - 1; i >= 0; i--) {
      const { options, retries } = this.emailQueue[i];

      if (retries < this.maxRetries) {
        const success = await this.sendEmail(options);
        if (success) {
          this.emailQueue.splice(i, 1);
          retried++;
        } else {
          this.emailQueue[i].retries++;
        }
      } else {
        console.warn(`Email to ${options.to} exceeded max retries`);
        this.emailQueue.splice(i, 1);
      }
    }

    return retried;
  }

  public getQueueSize(): number {
    return this.emailQueue.length;
  }

  public getQueuedEmails(): Array<{ options: EmailOptions; retries: number }> {
    return [...this.emailQueue];
  }

  public clearQueue(): void {
    this.emailQueue = [];
  }

  public async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  public generateCSVAttachment(data: any[], filename: string): { filename: string; content: string } {
    if (data.length === 0) {
      return { filename, content: '' };
    }

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((header) => `"${row[header] || ''}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    return { filename, content: csv };
  }

  public generateHTMLAttachment(
    html: string,
    filename: string
  ): { filename: string; content: string; contentType: string } {
    return {
      filename,
      content: html,
      contentType: 'text/html',
    };
  }
}

// Export singleton instance
let emailService: EmailService | null = null;

export function initializeEmailService(config?: EmailConfig): EmailService {
  if (!emailService) {
    emailService = new EmailService(config);
  }
  return emailService;
}

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}
