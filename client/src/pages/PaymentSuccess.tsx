import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle, Download, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

/**
 * Payment Success Page
 * Displays after successful payment completion
 */
export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get transaction ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txnId = params.get("tran_id") || "";
    setTransactionId(txnId);

    if (txnId) {
      // Fetch payment details
      fetchPaymentDetails(txnId);
    }
  }, []);

  const fetchPaymentDetails = async (txnId: string) => {
    try {
      setIsLoading(true);
      // Call tRPC to get payment details
      // Fallback: set basic details from URL params
      const params = new URLSearchParams(window.location.search);
      setPaymentDetails({
        transactionId: txnId,
        amount: params.get("amount") || "0",
        currency: "BDT",
        status: "VALID",
        plan: params.get("plan") || "pro",
        createdAt: new Date().toISOString(),
        cardBrand: params.get("card_brand") || "VISA",
        cardNumber: params.get("card_number") || "****",
      });
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (paymentDetails) {
      // Generate and download receipt
      const receiptContent = `
Payment Receipt
===============
Transaction ID: ${paymentDetails.transactionId}
Amount: ${paymentDetails.amount} ${paymentDetails.currency}
Status: ${paymentDetails.status}
Date: ${new Date(paymentDetails.createdAt).toLocaleString("bn-BD")}
Plan: ${paymentDetails.plan}
      `.trim();

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent)
      );
      element.setAttribute("download", `receipt-${paymentDetails.transactionId}.txt`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-20 animate-pulse" />
            <CheckCircle className="w-24 h-24 text-green-500 relative" />
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              পেমেন্ট সফল! 🎉
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              আপনার লেনদেন সফলভাবে সম্পন্ন হয়েছে
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
              </div>
            ) : paymentDetails ? (
              <>
                {/* Transaction Details */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      লেনদেন ID
                    </span>
                    <code className="text-sm font-mono bg-white dark:bg-slate-700 px-2 py-1 rounded">
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
                      পরিকল্পনা
                    </span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {paymentDetails.plan}
                    </Badge>
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

                {/* Payment Method */}
                {paymentDetails.cardBrand && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      পেমেন্ট পদ্ধতি
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {paymentDetails.cardBrand} •••• {paymentDetails.cardNumber}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
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

            {/* Info Message */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ আপনার সাবস্ক্রিপশন এখন সক্রিয়। সমস্ত প্রিমিয়াম ফিচার উপভোগ করুন!
              </p>
            </div>
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
