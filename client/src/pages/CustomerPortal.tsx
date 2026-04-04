import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Download,
  Settings,
  LogOut,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SubscriptionInfo {
  planName: string;
  status: "active" | "cancelled" | "paused";
  renewalDate: Date;
  amount: number;
  currency: string;
  billingInterval: "monthly" | "yearly";
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: Date;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  downloadUrl: string;
}

export function CustomerPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "subscription" | "payments" | "invoices">(
    "overview"
  );
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Mock data - replace with real API calls
  const subscription: SubscriptionInfo = {
    planName: "Pro Plan",
    status: "active",
    renewalDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    amount: 29.99,
    currency: "usd",
    billingInterval: "monthly",
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
    },
  ];

  const invoices: Invoice[] = [
    {
      id: "1",
      number: "INV-2026-001",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      amount: 29.99,
      currency: "usd",
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "2",
      number: "INV-2026-002",
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      amount: 29.99,
      currency: "usd",
      status: "paid",
      downloadUrl: "#",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "overdue":
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Customer Portal</h1>
          <p className="text-gray-600">Manage your subscription and billing</p>
        </div>
        <Button variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-gray-700">Your subscription is active and in good standing.</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {["overview", "subscription", "payments", "invoices"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold">{subscription.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Renewal Date</span>
                <span className="font-semibold">
                  {subscription.renewalDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold">
                  ${subscription.amount.toFixed(2)}/{subscription.billingInterval}
                </span>
              </div>
              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  Change Plan
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span>Update Payment Method</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-green-600" />
                  <span>Download Recent Invoices</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span>Notification Preferences</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Manage your subscription plan and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Your subscription renews on {subscription.renewalDate.toLocaleDateString()}. You
                can upgrade, downgrade, or cancel anytime.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Basic", "Pro", "Premium"].map((plan) => (
                    <div
                      key={plan}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <h4 className="font-semibold mb-2">{plan}</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {plan === "Basic"
                          ? "$9.99/month"
                          : plan === "Pro"
                            ? "$29.99/month"
                            : "$99.99/month"}
                      </p>
                      <Button
                        variant={plan === "Pro" ? "default" : "outline"}
                        className="w-full"
                      >
                        {plan === "Pro" ? "Current Plan" : "Switch"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">
                        {method.brand} ending in {method.last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault && (
                      <Badge className="bg-green-100 text-green-800">Default</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full" variant="outline">
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Download and view your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{invoice.number}</p>
                      <p className="text-sm text-gray-600">{invoice.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                      </p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
