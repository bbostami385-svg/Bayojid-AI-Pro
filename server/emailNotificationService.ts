import nodemailer from "nodemailer";

interface PaymentSuccessEmailData {
  userEmail: string;
  userName: string;
  transactionId: string;
  amount: number;
  currency: string;
  productName: string;
  invoiceUrl?: string;
  date: Date;
}

interface PaymentFailedEmailData {
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  reason: string;
  retryUrl: string;
}

interface RefundEmailData {
  userEmail: string;
  userName: string;
  transactionId: string;
  refundAmount: number;
  currency: string;
  reason: string;
  date: Date;
}

interface SubscriptionEmailData {
  userEmail: string;
  userName: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  renewalDate: Date;
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send payment success email
 */
export async function sendPaymentSuccessEmail(data: PaymentSuccessEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .success-badge { display: inline-block; background: #4CAF50; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin-bottom: 20px; }
        .details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Successful! ✓</h1>
        </div>
        <div class="content">
          <p>Dear ${data.userName},</p>
          <p>Thank you for your payment! Your transaction has been successfully processed.</p>
          
          <div class="success-badge">✓ PAYMENT CONFIRMED</div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span class="value">${data.transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Product:</span>
              <span class="value">${data.productName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">${data.amount.toFixed(2)} ${data.currency.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${data.date.toLocaleDateString()}</span>
            </div>
          </div>

          <p>Your account has been updated with the purchased product/service. You can now access all the features included in your plan.</p>
          
          ${
            data.invoiceUrl
              ? `<a href="${data.invoiceUrl}" class="button">Download Invoice</a>`
              : ""
          }
          
          <p style="margin-top: 30px; color: #666;">If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2026 Bayojid AI Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@bayojidai.com",
      to: data.userEmail,
      subject: `Payment Confirmation - ${data.transactionId}`,
      html: htmlContent,
    });
    console.log(`Payment success email sent to ${data.userEmail}`);
  } catch (error) {
    console.error("Failed to send payment success email:", error);
    throw error;
  }
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(data: PaymentFailedEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <p>Dear ${data.userName},</p>
          <p>Unfortunately, your payment could not be processed.</p>
          
          <div class="alert">
            <strong>Reason:</strong> ${data.reason}
          </div>

          <p>Amount: <strong>${data.amount.toFixed(2)} ${data.currency.toUpperCase()}</strong></p>
          
          <p>Please try again with a different payment method or contact your bank for more information.</p>
          
          <a href="${data.retryUrl}" class="button">Retry Payment</a>
          
          <p style="margin-top: 30px; color: #666;">If the problem persists, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2026 Bayojid AI Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@bayojidai.com",
      to: data.userEmail,
      subject: "Payment Failed - Please Retry",
      html: htmlContent,
    });
    console.log(`Payment failed email sent to ${data.userEmail}`);
  } catch (error) {
    console.error("Failed to send payment failed email:", error);
    throw error;
  }
}

/**
 * Send refund email
 */
export async function sendRefundEmail(data: RefundEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Processed</h1>
        </div>
        <div class="content">
          <p>Dear ${data.userName},</p>
          <p>Your refund has been successfully processed.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span class="value">${data.transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Refund Amount:</span>
              <span class="value">${data.refundAmount.toFixed(2)} ${data.currency.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Reason:</span>
              <span class="value">${data.reason}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${data.date.toLocaleDateString()}</span>
            </div>
          </div>

          <p>The refund will appear in your account within 3-5 business days, depending on your bank.</p>
          
          <p style="margin-top: 30px; color: #666;">If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2026 Bayojid AI Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@bayojidai.com",
      to: data.userEmail,
      subject: `Refund Confirmation - ${data.transactionId}`,
      html: htmlContent,
    });
    console.log(`Refund email sent to ${data.userEmail}`);
  } catch (error) {
    console.error("Failed to send refund email:", error);
    throw error;
  }
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionEmail(data: SubscriptionEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Subscription Active! ✓</h1>
        </div>
        <div class="content">
          <p>Dear ${data.userName},</p>
          <p>Welcome to ${data.planName}! Your subscription is now active.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Plan:</span>
              <span class="value">${data.planName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Billing Cycle:</span>
              <span class="value">${data.billingCycle}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">${data.amount.toFixed(2)} ${data.currency.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Next Renewal:</span>
              <span class="value">${data.renewalDate.toLocaleDateString()}</span>
            </div>
          </div>

          <p>You now have access to all premium features. Enjoy!</p>
          
          <p style="margin-top: 30px; color: #666;">You can manage your subscription at any time from your account settings.</p>
        </div>
        <div class="footer">
          <p>© 2026 Bayojid AI Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@bayojidai.com",
      to: data.userEmail,
      subject: `Welcome to ${data.planName}!`,
      html: htmlContent,
    });
    console.log(`Subscription email sent to ${data.userEmail}`);
  } catch (error) {
    console.error("Failed to send subscription email:", error);
    throw error;
  }
}
