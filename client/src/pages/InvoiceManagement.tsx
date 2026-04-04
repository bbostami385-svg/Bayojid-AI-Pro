import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Mail,
  Eye,
  Search,
  Filter,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: number;
  invoiceNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issuedDate: Date;
  dueDate: Date;
  paidDate?: Date;
  description: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      invoiceNumber: "INV-2026-001",
      userId: 1,
      userName: "Ahmed Khan",
      userEmail: "ahmed@example.com",
      amount: 299.00,
      currency: "usd",
      status: "paid",
      issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      paidDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      description: "Pro Plan Subscription",
      items: [
        {
          description: "Pro Plan - Monthly",
          quantity: 1,
          unitPrice: 299.00,
          total: 299.00,
        },
      ],
    },
    {
      id: 2,
      invoiceNumber: "INV-2026-002",
      userId: 2,
      userName: "Fatima Ahmed",
      userEmail: "fatima@example.com",
      amount: 599.00,
      currency: "usd",
      status: "sent",
      issuedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      description: "Premium Plan Subscription",
      items: [
        {
          description: "Premium Plan - Monthly",
          quantity: 1,
          unitPrice: 599.00,
          total: 599.00,
        },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    const now = Date.now();
    let matchesDate = true;
    if (dateRange === "7d") {
      matchesDate =
        invoice.issuedDate.getTime() > now - 7 * 24 * 60 * 60 * 1000;
    } else if (dateRange === "30d") {
      matchesDate =
        invoice.issuedDate.getTime() > now - 30 * 24 * 60 * 60 * 1000;
    } else if (dateRange === "90d") {
      matchesDate =
        invoice.issuedDate.getTime() > now - 90 * 24 * 60 * 60 * 1000;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast({
      title: "Downloading Invoice",
      description: `Invoice ${invoice.invoiceNumber} is being downloaded...`,
    });
    // TODO: Implement PDF download
  };

  const handleResendInvoice = (invoice: Invoice) => {
    toast({
      title: "Invoice Resent",
      description: `Invoice ${invoice.invoiceNumber} has been sent to ${invoice.userEmail}`,
    });
    // TODO: Implement email resend
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === invoice.id
          ? {
              ...inv,
              status: "paid" as const,
              paidDate: new Date(),
            }
          : inv
      )
    );
    toast({
      title: "Invoice Updated",
      description: `Invoice ${invoice.invoiceNumber} marked as paid`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalByStatus = (status: string) => {
    return invoices
      .filter((inv) => inv.status === status)
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoice Management</h1>
        <p className="text-gray-600">View, download, and manage all invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${getTotalByStatus("paid").toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${getTotalByStatus("sent").toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                ${getTotalByStatus("overdue").toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search invoice number, name, or email..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No invoices found</p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-semibold">{invoice.userName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-semibold">
                          ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Issued</p>
                        <p className="font-semibold">
                          {invoice.issuedDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Due</p>
                        <p className="font-semibold">
                          {invoice.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowPreview(true);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => handleDownloadInvoice(invoice)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleResendInvoice(invoice)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend
                  </Button>
                  {invoice.status !== "paid" && (
                    <Button
                      onClick={() => handleMarkAsPaid(invoice)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
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
              <p className="font-semibold">Invoice Management</p>
              <p className="mt-1">
                Download invoices as PDF, resend to customers, and track payment status. All invoices are automatically generated and stored.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
