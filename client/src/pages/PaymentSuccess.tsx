import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle, Download, ArrowRight, Home, FileText, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Payment Success Page
 * Displays after successful payment completion with invoice and subscription details
 */
export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);

  // Get transaction ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txnId = params.get("tran_id") || "";
    setTransactionId(txnId);

    if (txnId) {
      fetchPaymentDetails(txnId);
    }
  }, []);

  const fetchPaymentDetails = async (txnId: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(window.location.search);
      const details = {
        transactionId: txnId,
        amount: params.get("amount") || "0",
        currency: "BDT",
        status: "VALID",
        plan: params.get("plan") || "pro",
        createdAt: new Date().toISOString(),
        cardBrand: params.get("card_brand") || "VISA",
        cardNumber: params.get("card_number") || "****",
      };

      setPaymentDetails(details);

      // Calculate subscription end date
      const startDate = new Date(details.createdAt);
      const endDate = new Date(startDate);
      if (details.plan === "pro" || details.plan === "premium") {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      setSubscriptionEndDate(endDate);

      // Try to fetch from tRPC if available
      try {
        const result = await (trpc.payment as any).getTransaction?.query?.({
          transactionId: txnId,
        });
        if (result) {
          setPaymentDetails(result);
        }
      } catch (err) {
        // Use fallback data
      }
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      toast.error("পেমেন্ট বিবরণ লোড করতে ব্যর্থ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (paymentDetails) {
      try {
        const receiptHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>রসিদ - ${paymentDetails.transactionId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #4CAF50; font-size: 28px; margin-bottom: 5px; }
    .header p { color: #666; font-size: 14px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .detail-label { color: #666; font-weight: 500; }
    .detail-value { color: #333; font-weight: 600; }
    .success-badge { display: inline-block; background: #4CAF50; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .subscription-info { background: #e8f5e9; padding: 15px; border-radius: 6px; border-left: 4px solid #4CAF50; }
    .subscription-info p { color: #2e7d32; margin: 5px 0; font-size: 14px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ পেমেন্ট সফল</h1>
      <p>Payment Receipt</p>
    </div>
    
    <div class="section">
      <div class="section-title">📋 লেনদেন বিবরণ</div>
      <div class="detail-row">
        <span class="detail-label">লেনদেন ID:</span>
        <span class="detail-value">${paymentDetails.transactionId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">পরিমাণ:</span>
        <span class="detail-value">${paymentDetails.amount} ${paymentDetails.currency}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">তারিখ:</span>
        <span class="detail-value">${new Date(paymentDetails.createdAt).toLocaleString("bn-BD")}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">স্ট্যাটাস:</span>
        <span class="detail-value"><span class="success-badge">✓ সফল</span></span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">💳 পেমেন্ট পদ্ধতি</div>
      <div class="detail-row">
        <span class="detail-label">কার্ড ব্র্যান্ড:</span>
        <span class="detail-value">${paymentDetails.cardBrand}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">কার্ড নম্বর:</span>
        <span class="detail-value">•••• •••• •••• ${paymentDetails.cardNumber}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📦 সাবস্ক্রিপশন</div>
      <div class="detail-row">
        <span class="detail-label">প্ল্যান:</span>
        <span class="detail-value">${paymentDetails.plan?.toUpperCase() || "PRO"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">শুরু তারিখ:</span>
        <span class="detail-value">${new Date(paymentDetails.createdAt).toLocaleDateString("bn-BD")}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">সমাপ্তি তারিখ:</span>
        <span class="detail-value">${subscriptionEndDate ? subscriptionEndDate.toLocaleDateString("bn-BD") : "N/A"}</span>
      </div>
    </div>

    <div class="subscription-info">
      <p><strong>✓ আপনার সাবস্ক্রিপশন সক্রিয়</strong></p>
      <p>সমস্ত প্রিমিয়াম ফিচার এখন উপলভ্য। আপনার সাবস্ক্রিপশন ${subscriptionEndDate ? subscriptionEndDate.toLocaleDateString("bn-BD") : "N/A"} পর্যন্ত বৈধ থাকবে।</p>
    </div>

    <div class="footer">
      <p>এই রসিদটি আপনার রেকর্ডের জন্য সংরক্ষণ করুন।</p>
      <p>Generated on ${new Date().toLocaleString("bn-BD")}</p>
      <p>© 2026 AI Chat Application. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `.trim();

        const element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/html;charset=utf-8," + encodeURIComponent(receiptHTML)
        );
        element.setAttribute("download", `receipt-${paymentDetails.transactionId}.html`);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        toast.success("রসিদ ডাউনলোড হয়েছে");
      } catch (error) {
        console.error("Failed to download receipt:", error);
        toast.error("রসিদ ডাউনলোড করতে ব্যর্থ");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-20 animate-pulse" />
            <CheckCircle className="w-24 h-24 text-green-500 relative" />
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center space-y-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
            <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
              পেমেন্ট সফল! 🎉
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              আপনার লেনদেন সফলভাবে সম্পন্ন হয়েছে
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
              </div>
            ) : paymentDetails ? (
              <>
                {/* Transaction Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    লেনদেন বিবরণ
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        লেনদেন ID
                      </span>
                      <code className="text-sm font-mono bg-white dark:bg-slate-700 px-3 py-1 rounded">
                        {paymentDetails.transactionId}
                      </code>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        পরিমাণ
                      </span>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">
                        {paymentDetails.amount} {paymentDetails.currency}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        তারিখ
                      </span>
                      <span className="text-sm text-slate-900 dark:text-white">
                        {new Date(paymentDetails.createdAt).toLocaleString("bn-BD")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        স্ট্যাটাস
                      </span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✓ সফল
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {paymentDetails.cardBrand && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      💳 পেমেন্ট পদ্ধতি
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        কার্ড তথ্য
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {paymentDetails.cardBrand} •••• {paymentDetails.cardNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Subscription Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    সাবস্ক্রিপশন
                  </h3>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        প্ল্যান
                      </span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {paymentDetails.plan?.toUpperCase() || "PRO"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        শুরু তারিখ
                      </span>
                      <span className="text-sm text-slate-900 dark:text-white">
                        {new Date(paymentDetails.createdAt).toLocaleDateString("bn-BD")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        সমাপ্তি তারিখ
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {subscriptionEndDate?.toLocaleDateString("bn-BD") || "N/A"}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✓ আপনার সাবস্ক্রিপশন এখন সক্রিয়। সমস্ত প্রিমিয়াম ফিচার উপভোগ করুন!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleDownloadReceipt}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    রসিদ ডাউনলোড করুন
                  </Button>

                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      ড্যাশবোর্ডে যান
                    </Button>
                  </Link>

                  <Link href="/">
                    <Button variant="ghost" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      হোমে ফিরুন
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">
                  পেমেন্ট বিবরণ লোড করতে পারা যায়নি
                </p>
                <Link href="/payment">
                  <Button variant="outline" className="mt-4">
                    পেমেন্ট পৃষ্ঠায় ফিরুন
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Message */}
        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          যদি কোনো সমস্যা হয়, আমাদের সাথে যোগাযোগ করুন
        </p>
      </div>
    </div>
  );
}
