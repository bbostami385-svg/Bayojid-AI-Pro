/**
 * Email Notification Service
 * Sends email notifications for payment events
 */

interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface PaymentNotificationData {
  userEmail: string;
  userName: string;
  transactionId: string;
  amount: string;
  currency: string;
  planName: string;
  subscriptionEndDate: string;
  cardBrand?: string;
  cardNumber?: string;
}

/**
 * Send email via Manus built-in email service
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
    const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

    if (!apiUrl || !apiKey) {
      console.error("[Email] Missing API credentials");
      return false;
    }

    const response = await fetch(`${apiUrl}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        textContent: payload.textContent || payload.htmlContent,
      }),
    });

    if (!response.ok) {
      console.error("[Email] Failed to send email:", response.statusText);
      return false;
    }

    console.log("[Email] Sent successfully to:", payload.to);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessEmail(
  data: PaymentNotificationData
): Promise<boolean> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>পেমেন্ট সফল - AI Chat Application</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 20px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { color: #666; font-weight: 500; }
    .detail-value { color: #333; font-weight: 600; }
    .success-box { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .success-box p { color: #2e7d32; margin: 5px 0; font-size: 14px; }
    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
    .button:hover { background: #45a049; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ পেমেন্ট সফল</h1>
      <p>Payment Confirmation</p>
    </div>

    <div class="content">
      <p>নমস্কার ${data.userName},</p>
      <p style="margin-top: 10px; color: #666;">আপনার পেমেন্ট সফলভাবে প্রক্রিয়া করা হয়েছে। আপনার সাবস্ক্রিপশন এখন সক্রিয়।</p>

      <div class="success-box">
        <p><strong>✓ আপনার সাবস্ক্রিপশন সক্রিয়</strong></p>
        <p>আপনি এখন সমস্ত প্রিমিয়াম ফিচার অ্যাক্সেস করতে পারেন।</p>
      </div>

      <div class="section">
        <div class="section-title">📋 লেনদেন বিবরণ</div>
        <div class="detail-row">
          <span class="detail-label">লেনদেন ID:</span>
          <span class="detail-value">${data.transactionId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">পরিমাণ:</span>
          <span class="detail-value">${data.amount} ${data.currency}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">প্ল্যান:</span>
          <span class="detail-value">${data.planName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">সমাপ্তি তারিখ:</span>
          <span class="detail-value">${data.subscriptionEndDate}</span>
        </div>
        ${
          data.cardBrand
            ? `
        <div class="detail-row">
          <span class="detail-label">পেমেন্ট পদ্ধতি:</span>
          <span class="detail-value">${data.cardBrand} •••• ${data.cardNumber}</span>
        </div>
        `
            : ""
        }
      </div>

      <div class="section">
        <div class="section-title">📦 পরবর্তী পদক্ষেপ</div>
        <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
          • আপনার ড্যাশবোর্ডে লগইন করুন<br>
          • সমস্ত প্রিমিয়াম ফিচার অন্বেষণ করুন<br>
          • আপনার সাবস্ক্রিপশন সেটিংস ম্যানেজ করুন<br>
          • যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন
        </p>
        <a href="https://yourdomain.com/dashboard" class="button">ড্যাশবোর্ডে যান</a>
      </div>

      <div class="section">
        <p style="color: #999; font-size: 12px;">
          এই ইমেলটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে। অনুগ্রহ করে এতে উত্তর দিবেন না।
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>AI Chat Application</strong></p>
      <p>© 2026 সমস্ত অধিকার সংরক্ষিত</p>
      <p>আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ। <a href="https://yourdomain.com/privacy" style="color: #4CAF50; text-decoration: none;">গোপনীয়তা নীতি</a></p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `পেমেন্ট সফল - ${data.planName} প্ল্যান সক্রিয়`,
    htmlContent,
    textContent: `
পেমেন্ট সফল

নমস্কার ${data.userName},

আপনার পেমেন্ট সফলভাবে প্রক্রিয়া করা হয়েছে।

লেনদেন বিবরণ:
- লেনদেন ID: ${data.transactionId}
- পরিমাণ: ${data.amount} ${data.currency}
- প্ল্যান: ${data.planName}
- সমাপ্তি তারিখ: ${data.subscriptionEndDate}

আপনার সাবস্ক্রিপশন এখন সক্রিয়। সমস্ত প্রিমিয়াম ফিচার উপভোগ করুন।

ধন্যবাদ,
AI Chat Application টিম
    `,
  });
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail(
  userEmail: string,
  userName: string,
  transactionId: string,
  reason: string
): Promise<boolean> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>পেমেন্ট ব্যর্থ - AI Chat Application</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #f44336 0%, #e53935 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .content { padding: 40px 20px; }
    .error-box { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .error-box p { color: #c62828; margin: 5px 0; font-size: 14px; }
    .button { display: inline-block; background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
    .button:hover { background: #1976D2; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✗ পেমেন্ট ব্যর্থ</h1>
      <p>Payment Failed</p>
    </div>

    <div class="content">
      <p>নমস্কার ${userName},</p>
      <p style="margin-top: 10px; color: #666;">দুর্ভাগ্যবশত, আপনার পেমেন্ট প্রক্রিয়া করা যায়নি।</p>

      <div class="error-box">
        <p><strong>✗ পেমেন্ট ব্যর্থ</strong></p>
        <p>কারণ: ${reason}</p>
      </div>

      <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;"><strong>লেনদেন ID:</strong> ${transactionId}</p>
        <p style="color: #666; font-size: 14px;">অনুগ্রহ করে আবার চেষ্টা করুন বা আমাদের সাথে যোগাযোগ করুন।</p>
      </div>

      <a href="https://yourdomain.com/payment" class="button">আবার চেষ্টা করুন</a>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          যদি এই সমস্যা অব্যাহত থাকে, অনুগ্রহ করে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>AI Chat Application</strong></p>
      <p>© 2026 সমস্ত অধিকার সংরক্ষিত</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: "পেমেন্ট ব্যর্থ - আবার চেষ্টা করুন",
    htmlContent,
    textContent: `
পেমেন্ট ব্যর্থ

নমস্কার ${userName},

দুর্ভাগ্যবশত, আপনার পেমেন্ট প্রক্রিয়া করা যায়নি।

লেনদেন ID: ${transactionId}
কারণ: ${reason}

অনুগ্রহ করে আবার চেষ্টা করুন বা আমাদের সাথে যোগাযোগ করুন।

ধন্যবাদ,
AI Chat Application টিম
    `,
  });
}

/**
 * Send subscription renewal reminder
 */
export async function sendSubscriptionReminderEmail(
  userEmail: string,
  userName: string,
  planName: string,
  renewalDate: string,
  daysRemaining: number
): Promise<boolean> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>সাবস্ক্রিপশন নবায়ন - AI Chat Application</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .content { padding: 40px 20px; }
    .warning-box { background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .warning-box p { color: #e65100; margin: 5px 0; font-size: 14px; }
    .button { display: inline-block; background: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
    .button:hover { background: #F57C00; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 সাবস্ক্রিপশন নবায়ন</h1>
      <p>Subscription Renewal Reminder</p>
    </div>

    <div class="content">
      <p>নমস্কার ${userName},</p>
      <p style="margin-top: 10px; color: #666;">আপনার ${planName} সাবস্ক্রিপশন ${renewalDate} এ শেষ হবে।</p>

      <div class="warning-box">
        <p><strong>⏰ ${daysRemaining} দিন বাকি</strong></p>
        <p>আপনার সাবস্ক্রিপশন নবায়ন করুন এবং সেবা বিচ্ছিন্ন এড়ান।</p>
      </div>

      <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
        আপনার সাবস্ক্রিপশন নবায়ন করতে নিম্নলিখিত বোতাম ক্লিক করুন:
      </p>

      <a href="https://yourdomain.com/payment" class="button">এখনই নবায়ন করুন</a>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          নবায়ন না করলে আপনার সাবস্ক্রিপশন স্বয়ংক্রিয়ভাবে বাতিল হবে এবং আপনি প্রিমিয়াম ফিচার অ্যাক্সেস করতে পারবেন না।
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>AI Chat Application</strong></p>
      <p>© 2026 সমস্ত অধিকার সংরক্ষিত</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `সাবস্ক্রিপশন নবায়ন - ${daysRemaining} দিন বাকি`,
    htmlContent,
    textContent: `
সাবস্ক্রিপশন নবায়ন

নমস্কার ${userName},

আপনার ${planName} সাবস্ক্রিপশন ${renewalDate} এ শেষ হবে।

${daysRemaining} দিন বাকি

আপনার সাবস্ক্রিপশন নবায়ন করুন এবং সেবা বিচ্ছিন্ন এড়ান।

ধন্যবাদ,
AI Chat Application টিম
    `,
  });
}
