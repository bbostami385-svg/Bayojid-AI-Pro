/**
 * Automated Billing Reports Service
 * Generates and sends automated billing reports
 */

import { formatCurrency, SupportedCurrency } from "./currencyService";

export interface BillingReport {
  id: string;
  period: "weekly" | "monthly" | "quarterly";
  startDate: Date;
  endDate: Date;
  generatedDate: Date;
  totalRevenue: number;
  totalTransactions: number;
  totalRefunds: number;
  averageTransactionValue: number;
  successRate: number;
  failureRate: number;
  topPaymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  topPlans: Array<{
    planName: string;
    subscriptions: number;
    revenue: number;
  }>;
  churnRate: number;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  currency: SupportedCurrency;
}

export interface ReportRecipient {
  email: string;
  name: string;
  reportTypes: ("weekly" | "monthly" | "quarterly")[];
}

const reportSchedules = {
  weekly: "0 0 * * 1", // Every Monday at midnight
  monthly: "0 0 1 * *", // First day of month at midnight
  quarterly: "0 0 1 */3 *", // First day of every 3 months at midnight
};

/**
 * Generate billing report for a period
 */
export async function generateBillingReport(
  startDate: Date,
  endDate: Date,
  period: "weekly" | "monthly" | "quarterly",
  currency: SupportedCurrency = "usd"
): Promise<BillingReport> {
  // TODO: Fetch data from database
  const mockData = {
    totalRevenue: 15420.5,
    totalTransactions: 245,
    totalRefunds: 3,
    newSubscriptions: 42,
    cancelledSubscriptions: 8,
    successfulTransactions: 242,
  };

  const report: BillingReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    period,
    startDate,
    endDate,
    generatedDate: new Date(),
    totalRevenue: mockData.totalRevenue,
    totalTransactions: mockData.totalTransactions,
    totalRefunds: mockData.totalRefunds,
    averageTransactionValue: mockData.totalRevenue / mockData.totalTransactions,
    successRate: (mockData.successfulTransactions / mockData.totalTransactions) * 100,
    failureRate: ((mockData.totalTransactions - mockData.successfulTransactions) / mockData.totalTransactions) * 100,
    topPaymentMethods: [
      { method: "Stripe Card", count: 180, amount: 11250.5 },
      { method: "SSLCommerz bKash", count: 45, amount: 3120.0 },
      { method: "SSLCommerz Nagad", count: 20, amount: 1050.0 },
    ],
    topPlans: [
      { planName: "Pro Plan", subscriptions: 28, revenue: 8400.0 },
      { planName: "Premium Plan", subscriptions: 10, revenue: 5000.0 },
      { planName: "Basic Plan", subscriptions: 4, revenue: 2020.5 },
    ],
    churnRate: (mockData.cancelledSubscriptions / (mockData.newSubscriptions + mockData.cancelledSubscriptions)) * 100,
    newSubscriptions: mockData.newSubscriptions,
    cancelledSubscriptions: mockData.cancelledSubscriptions,
    currency,
  };

  return report;
}

/**
 * Format report as HTML email
 */
export function formatReportAsHTML(report: BillingReport): string {
  const periodLabel = report.period.charAt(0).toUpperCase() + report.period.slice(1);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
        .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .metric-label { color: #666; }
        .metric-value { font-weight: bold; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th { background: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; }
        .table td { padding: 10px; border-bottom: 1px solid #eee; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${periodLabel} Billing Report</h1>
          <p>${report.startDate.toLocaleDateString()} - ${report.endDate.toLocaleDateString()}</p>
        </div>

        <div class="section">
          <div class="section-title">Revenue Summary</div>
          <div class="metric">
            <span class="metric-label">Total Revenue</span>
            <span class="metric-value">${formatCurrency(report.totalRevenue, report.currency)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Total Transactions</span>
            <span class="metric-value">${report.totalTransactions}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Average Transaction</span>
            <span class="metric-value">${formatCurrency(report.averageTransactionValue, report.currency)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Total Refunds</span>
            <span class="metric-value">${report.totalRefunds}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Success Metrics</div>
          <div class="metric">
            <span class="metric-label">Success Rate</span>
            <span class="metric-value">${report.successRate.toFixed(2)}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Failure Rate</span>
            <span class="metric-value">${report.failureRate.toFixed(2)}%</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Subscription Metrics</div>
          <div class="metric">
            <span class="metric-label">New Subscriptions</span>
            <span class="metric-value">${report.newSubscriptions}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Cancelled Subscriptions</span>
            <span class="metric-value">${report.cancelledSubscriptions}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Churn Rate</span>
            <span class="metric-value">${report.churnRate.toFixed(2)}%</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Top Payment Methods</div>
          <table class="table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Transactions</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${report.topPaymentMethods
                .map(
                  (method) => `
                <tr>
                  <td>${method.method}</td>
                  <td>${method.count}</td>
                  <td>${formatCurrency(method.amount, report.currency)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Top Plans</div>
          <table class="table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Subscriptions</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${report.topPlans
                .map(
                  (plan) => `
                <tr>
                  <td>${plan.planName}</td>
                  <td>${plan.subscriptions}</td>
                  <td>${formatCurrency(plan.revenue, report.currency)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is an automated report generated by Bayojid AI Pro</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Schedule report generation
 */
export function scheduleReportGeneration(
  recipients: ReportRecipient[],
  callback: (report: BillingReport, recipient: ReportRecipient) => Promise<void>
): void {
  // TODO: Implement cron job scheduling
  console.log("[Billing Reports] Report generation scheduled");
  console.log(`[Billing Reports] Recipients: ${recipients.map((r) => r.email).join(", ")}`);
}

/**
 * Get report generation schedule
 */
export function getReportSchedule(period: "weekly" | "monthly" | "quarterly"): string {
  return reportSchedules[period];
}

/**
 * Get report history
 */
export async function getReportHistory(
  period?: "weekly" | "monthly" | "quarterly",
  limit: number = 10
): Promise<BillingReport[]> {
  // TODO: Fetch from database
  return [];
}

/**
 * Export report as CSV
 */
export function exportReportAsCSV(report: BillingReport): string {
  const lines: string[] = [];

  lines.push(`Bayojid AI Pro - ${report.period.toUpperCase()} Billing Report`);
  lines.push(`Period: ${report.startDate.toLocaleDateString()} - ${report.endDate.toLocaleDateString()}`);
  lines.push(`Generated: ${report.generatedDate.toLocaleString()}`);
  lines.push("");

  lines.push("REVENUE SUMMARY");
  lines.push(`Total Revenue,${report.totalRevenue}`);
  lines.push(`Total Transactions,${report.totalTransactions}`);
  lines.push(`Average Transaction,${report.averageTransactionValue}`);
  lines.push(`Total Refunds,${report.totalRefunds}`);
  lines.push("");

  lines.push("SUCCESS METRICS");
  lines.push(`Success Rate,${report.successRate.toFixed(2)}%`);
  lines.push(`Failure Rate,${report.failureRate.toFixed(2)}%`);
  lines.push("");

  lines.push("SUBSCRIPTION METRICS");
  lines.push(`New Subscriptions,${report.newSubscriptions}`);
  lines.push(`Cancelled Subscriptions,${report.cancelledSubscriptions}`);
  lines.push(`Churn Rate,${report.churnRate.toFixed(2)}%`);
  lines.push("");

  lines.push("TOP PAYMENT METHODS");
  lines.push("Method,Transactions,Amount");
  report.topPaymentMethods.forEach((method) => {
    lines.push(`${method.method},${method.count},${method.amount}`);
  });
  lines.push("");

  lines.push("TOP PLANS");
  lines.push("Plan,Subscriptions,Revenue");
  report.topPlans.forEach((plan) => {
    lines.push(`${plan.planName},${plan.subscriptions},${plan.revenue}`);
  });

  return lines.join("\n");
}

/**
 * Get report filename
 */
export function getReportFilename(report: BillingReport): string {
  const date = report.generatedDate.toISOString().split("T")[0];
  return `billing-report-${report.period}-${date}.csv`;
}
