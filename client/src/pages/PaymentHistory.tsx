import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Download,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Payment History Dashboard
 * Displays user's payment transactions and invoices
 */
export default function PaymentHistory() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock payment data - in production, this would come from tRPC
  const mockPayments = [
    {
      id: 1,
      transactionId: "TXN-2026-001",
      amount: "299.00",
      currency: "BDT",
      status: "VALID",
      plan: "pro",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      cardBrand: "VISA",
      cardNumber: "4111",
      invoiceUrl: "#",
    },
    {
      id: 2,
      transactionId: "TXN-2026-002",
      amount: "599.00",
      currency: "BDT",
      status: "VALID",
      plan: "premium",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      cardBrand: "MASTERCARD",
      cardNumber: "5555",
      invoiceUrl: "#",
    },
    {
      id: 3,
      transactionId: "TXN-2026-003",
      amount: "299.00",
      currency: "BDT",
      status: "FAILED",
      plan: "pro",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      cardBrand: "VISA",
      cardNumber: "4111",
      invoiceUrl: "#",
    },
    {
      id: 4,
      transactionId: "TXN-2026-004",
      amount: "599.00",
      currency: "BDT",
      status: "VALID",
      plan: "premium",
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      cardBrand: "AMEX",
      cardNumber: "3782",
      invoiceUrl: "#",
    },
  ];

  useEffect(() => {
    // Simulate loading payments
    setIsLoading(true);
    setTimeout(() => {
      setPayments(mockPayments);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter and search payments
  useEffect(() => {
    let filtered = payments;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.plan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [payments, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDownloadInvoice = (payment: any) => {
    try {
      const invoiceHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>ইনভয়েস - ${payment.transactionId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #4CAF50; margin: 0; }
    .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .detail-box { background: #f5f5f5; padding: 15px; border-radius: 4px; }
    .detail-label { font-weight: bold; color: #666; font-size: 12px; }
    .detail-value { color: #333; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #4CAF50; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #eee; }
    .total-row { font-weight: bold; background: #f5f5f5; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ইনভয়েস</h1>
      <p>Invoice #${payment.transactionId}</p>
    </div>

    <div class="invoice-details">
      <div class="detail-box">
        <div class="detail-label">ইনভয়েস নম্বর</div>
        <div class="detail-value">${payment.transactionId}</div>
        <div class="detail-label" style="margin-top: 15px;">তারিখ</div>
        <div class="detail-value">${new Date(payment.date).toLocaleDateString("bn-BD")}</div>
      </div>
      <div class="detail-box">
        <div class="detail-label">পেমেন্ট স্ট্যাটাস</div>
        <div class="detail-value" style="color: ${payment.status === "VALID" ? "#4CAF50" : "#f44336"};">
          ${payment.status === "VALID" ? "✓ সফল" : "✗ ব্যর্থ"}
        </div>
        <div class="detail-label" style="margin-top: 15px;">পরিকল্পনা</div>
        <div class="detail-value">${payment.plan.toUpperCase()}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>বিবরণ</th>
          <th style="text-align: right;">পরিমাণ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${payment.plan.toUpperCase()} সাবস্ক্রিপশন (১ মাস)</td>
          <td style="text-align: right;">${payment.amount} ${payment.currency}</td>
        </tr>
        <tr class="total-row">
          <td>মোট</td>
          <td style="text-align: right;">${payment.amount} ${payment.currency}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>এই ইনভয়েসটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</p>
      <p>© 2026 AI Chat Application. সমস্ত অধিকার সংরক্ষিত।</p>
    </div>
  </div>
</body>
</html>
      `;

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/html;charset=utf-8," + encodeURIComponent(invoiceHTML)
      );
      element.setAttribute("download", `invoice-${payment.transactionId}.html`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("ইনভয়েস ডাউনলোড হয়েছে");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("ইনভয়েস ডাউনলোড করতে ব্যর্থ");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "VALID") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          সফল
        </Badge>
      );
    } else if (status === "FAILED") {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          ব্যর্থ
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          অপেক্ষমাণ
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              পেমেন্ট ইতিহাস
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              আপনার সমস্ত লেনদেন এবং ইনভয়েস দেখুন
            </p>
          </div>
          <Link href="/payment">
            <Button className="bg-blue-600 hover:bg-blue-700">
              নতুন পেমেন্ট করুন
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    মোট লেনদেন
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {payments.length}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    সফল পেমেন্ট
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {payments.filter((p) => p.status === "VALID").length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ব্যর্থ পেমেন্ট
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {payments.filter((p) => p.status === "FAILED").length}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="লেনদেন ID বা প্ল্যান খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="স্ট্যাটাস ফিল্টার করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব</SelectItem>
                  <SelectItem value="VALID">সফল</SelectItem>
                  <SelectItem value="FAILED">ব্যর্থ</SelectItem>
                  <SelectItem value="PENDING">অপেক্ষমাণ</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                আরও ফিল্টার
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>লেনদেন</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : paginatedPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        লেনদেন ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        পরিকল্পনা
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        পরিমাণ
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        তারিখ
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        স্ট্যাটাস
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        অ্যাকশন
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-mono text-sm">
                          {payment.transactionId}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white">
                          <Badge variant="outline">
                            {payment.plan.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">
                          {payment.amount} {payment.currency}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {new Date(payment.date).toLocaleDateString("bn-BD")}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadInvoice(payment)}
                              title="ইনভয়েস ডাউনলোড করুন"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="বিবরণ দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">
                  কোনো লেনদেন পাওয়া যায়নি
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  পৃষ্ঠা {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
