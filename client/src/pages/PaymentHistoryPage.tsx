import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PaymentHistoryPage() {
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);

  const historyQuery = trpc.payment.getPaymentHistory.useQuery();
  const requestRefundMutation = trpc.payment.requestRefund.useMutation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "cancelled":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getGatewayIcon = (gateway: string) => {
    const icons: Record<string, string> = {
      stripe: "💳",
      sslcommerz: "🏦",
      bkash: "📱",
      nagad: "📱",
      rocket: "🚀",
    };
    return icons[gateway] || "💰";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const payments = historyQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Payment History</h1>
          <p className="text-slate-400">View all your transactions and manage refunds</p>
        </div>

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => historyQuery.refetch()}
            disabled={historyQuery.isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {historyQuery.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Payments Table */}
        <Card className="bg-slate-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Transaction List</CardTitle>
            <CardDescription className="text-slate-400">
              {payments.length} transaction{payments.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No transactions yet</p>
                <Button
                  onClick={() => (window.location.href = "/checkout")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Make Your First Payment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Date</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Gateway</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Amount</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Status</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Transaction ID</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-slate-300">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          <span className="mr-2">{getGatewayIcon(payment.gateway)}</span>
                          {payment.gateway.charAt(0).toUpperCase() + payment.gateway.slice(1)}
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          ৳{Number(payment.amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusColor(payment.status)} border`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-slate-400 text-sm font-mono">
                          {payment.transactionId.substring(0, 20)}...
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {payment.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                onClick={() => setSelectedPayment(payment.id)}
                              >
                                Refund
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refund Dialog */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-slate-800 border-purple-500/20 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">Request Refund</CardTitle>
                <CardDescription className="text-slate-400">
                  Why do you want to request a refund?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  placeholder="Please provide a reason for your refund request..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  rows={4}
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setSelectedPayment(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={async () => {
                      const reason = (
                        document.querySelector("textarea") as HTMLTextAreaElement
                      )?.value;
                      if (reason) {
                        try {
                          await requestRefundMutation.mutateAsync({
                            paymentHistoryId: selectedPayment,
                            reason,
                          });
                          setSelectedPayment(null);
                          historyQuery.refetch();
                        } catch (error) {
                          console.error("Error requesting refund:", error);
                        }
                      }
                    }}
                  >
                    Request Refund
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
