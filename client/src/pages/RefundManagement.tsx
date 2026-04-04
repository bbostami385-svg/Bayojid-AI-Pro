import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Check, X, Search, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface Refund {
  id: number;
  transactionId: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: Date;
  processedAt?: Date;
  notes?: string;
}

export function RefundManagement() {
  const [refunds, setRefunds] = useState<Refund[]>([
    {
      id: 1,
      transactionId: "TXN-001",
      userId: 1,
      userName: "Ahmed Khan",
      userEmail: "ahmed@example.com",
      amount: 299.00,
      currency: "usd",
      reason: "Product not as described",
      status: "pending",
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      transactionId: "TXN-002",
      userId: 2,
      userName: "Fatima Ahmed",
      userEmail: "fatima@example.com",
      amount: 599.00,
      currency: "usd",
      reason: "Subscription cancellation",
      status: "approved",
      requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { toast } = useToast();

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || refund.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApproveRefund = async (refund: Refund) => {
    try {
      setProcessingId(refund.id);
      // TODO: Call API to approve refund
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRefunds(
        refunds.map((r) =>
          r.id === refund.id
            ? {
                ...r,
                status: "approved" as const,
                processedAt: new Date(),
              }
            : r
        )
      );

      toast({
        title: "Refund Approved",
        description: `Refund of $${refund.amount.toFixed(2)} has been approved`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve refund",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRefund = async (refund: Refund) => {
    try {
      setProcessingId(refund.id);
      // TODO: Call API to reject refund
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRefunds(
        refunds.map((r) =>
          r.id === refund.id
            ? {
                ...r,
                status: "rejected" as const,
                processedAt: new Date(),
              }
            : r
        )
      );

      toast({
        title: "Refund Rejected",
        description: `Refund request has been rejected`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject refund",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✓";
      case "completed":
        return "✓✓";
      case "rejected":
        return "✕";
      default:
        return "•";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refund Management</h1>
        <p className="text-gray-600">Review and process refund requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold">{refunds.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {refunds.filter((r) => r.status === "pending").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-blue-600">
                {refunds.filter((r) => r.status === "approved").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold">
                ${refunds.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by transaction ID, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Refunds List */}
      <div className="space-y-4">
        {filteredRefunds.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No refund requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRefunds.map((refund) => (
            <Card key={refund.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getStatusIcon(refund.status)}</span>
                      <div>
                        <p className="font-semibold">{refund.userName}</p>
                        <p className="text-sm text-gray-600">{refund.userEmail}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-600">Transaction ID</p>
                        <p className="font-mono font-semibold">{refund.transactionId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-semibold">
                          ${refund.amount.toFixed(2)} {refund.currency.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reason</p>
                        <p className="font-semibold">{refund.reason}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Requested</p>
                        <p className="font-semibold">
                          {refund.requestedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(refund.status)}>
                    {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                  </Badge>
                </div>

                {refund.status === "pending" && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      onClick={() => handleApproveRefund(refund)}
                      disabled={processingId === refund.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processingId === refund.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRejectRefund(refund)}
                      disabled={processingId === refund.id}
                      variant="outline"
                      className="flex-1"
                    >
                      {processingId === refund.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Refund Processing</p>
              <p className="mt-1">
                Approved refunds will be processed within 3-5 business days. Customers will receive an email confirmation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
