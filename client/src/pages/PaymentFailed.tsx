import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { XCircle, AlertCircle, ArrowLeft, Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Payment Failed Page
 * Displays after failed payment attempt
 */
export default function PaymentFailed() {
  const [, navigate] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txnId = params.get("tran_id") || "";
    const error = params.get("error") || "অজানা ত্রুটি";
    const status = params.get("status") || "FAILED";

    setTransactionId(txnId);
    
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      "FAILED": "পেমেন্ট প্রক্রিয়াকরণ ব্যর্থ হয়েছে",
      "CANCELLED": "আপনি পেমেন্ট বাতিল করেছেন",
      "INVALID_CARD": "কার্ড তথ্য অবৈধ",
      "INSUFFICIENT_BALANCE": "অপর্যাপ্ত ব্যালেন্স",
      "CARD_EXPIRED": "কার্ডের মেয়াদ শেষ",
      "TRANSACTION_TIMEOUT": "লেনদেনের সময় শেষ",
      "NETWORK_ERROR": "নেটওয়ার্ক সংযোগ ত্রুটি",
    };

    setErrorMessage(errorMessages[status] || errorMessages["FAILED"]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-20 animate-pulse" />
            <XCircle className="w-24 h-24 text-red-500 relative" />
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              পেমেন্ট ব্যর্থ 😞
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              আপনার লেনদেন সম্পন্ন হতে পারেনি
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Details */}
            <div className="space-y-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-200">
                    {errorMessage}
                  </p>
                  {transactionId && (
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      লেনদেন ID: {transactionId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Troubleshooting Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
                    সমস্যা সমাধানের পরামর্শ:
                  </p>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• কার্ড তথ্য সঠিক কিনা পরীক্ষা করুন</li>
                    <li>• আপনার ব্যাংক অ্যাকাউন্টে যথেষ্ট ব্যালেন্স আছে কিনা নিশ্চিত করুন</li>
                    <li>• ইন্টারনেট সংযোগ পরীক্ষা করুন</li>
                    <li>• পরে আবার চেষ্টা করুন</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Transaction Status */}
            {transactionId && (
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  লেনদেন ID
                </p>
                <code className="text-sm font-mono bg-white dark:bg-slate-700 px-2 py-1 rounded block break-all">
                  {transactionId}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/payment">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  পেমেন্ট পুনরায় চেষ্টা করুন
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  ড্যাশবোর্ডে ফিরুন
                </Button>
              </Link>

              <Link href="/">
                <Button variant="ghost" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  হোমে ফিরুন
                </Button>
              </Link>
            </div>

            {/* Support Message */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ যদি সমস্যা অব্যাহত থাকে, আমাদের সাথে যোগাযোগ করুন।
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          আপনার কার্ড থেকে কোনো অর্থ কাটা হয়নি
        </p>
      </div>
    </div>
  );
}
