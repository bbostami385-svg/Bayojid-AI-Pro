import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Globe, Zap } from "lucide-react";

interface PaymentMethodSelectorProps {
  onSelect: (method: "stripe" | "sslcommerz") => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({ onSelect, isLoading = false }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "sslcommerz" | null>(null);

  const handleSelect = (method: "stripe" | "sslcommerz") => {
    setSelectedMethod(method);
    onSelect(method);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Choose Payment Method</h2>
        <p className="text-gray-600">Select your preferred payment option</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stripe Card */}
        <Card 
          className={`cursor-pointer transition-all ${
            selectedMethod === "stripe" 
              ? "ring-2 ring-blue-500 border-blue-500" 
              : "hover:border-gray-400"
          }`}
          onClick={() => handleSelect("stripe")}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Stripe</CardTitle>
                  <CardDescription>International Payment</CardDescription>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Global</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Accepted Payment Methods:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Visa & Mastercard
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  American Express
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Discover & Diners
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Digital Wallets
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <h4 className="font-semibold text-sm">Features:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  Instant Processing
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  150+ Countries
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Secure & PCI Compliant
                </li>
              </ul>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
              onClick={() => handleSelect("stripe")}
            >
              {selectedMethod === "stripe" ? "Selected ✓" : "Select Stripe"}
            </Button>
          </CardContent>
        </Card>

        {/* SSLCommerz Card */}
        <Card 
          className={`cursor-pointer transition-all ${
            selectedMethod === "sslcommerz" 
              ? "ring-2 ring-green-500 border-green-500" 
              : "hover:border-gray-400"
          }`}
          onClick={() => handleSelect("sslcommerz")}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">SSLCommerz</CardTitle>
                  <CardDescription>Bangladesh Payment</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Local</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Accepted Payment Methods:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  bKash
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  Nagad
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  Rocket
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  Bank Transfer & Cards
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <h4 className="font-semibold text-sm">Features:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  Mobile Money Support
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  Bangladesh Optimized
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  Local Payment Gateway
                </li>
              </ul>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
              onClick={() => handleSelect("sslcommerz")}
            >
              {selectedMethod === "sslcommerz" ? "Selected ✓" : "Select SSLCommerz"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Choose Stripe for international payments with credit/debit cards, or SSLCommerz for local Bangladesh mobile money (bKash, Nagad) and bank transfers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
