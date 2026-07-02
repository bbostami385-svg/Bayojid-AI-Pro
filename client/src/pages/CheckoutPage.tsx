import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<"stripe" | "sslcommerz" | "bkash" | "nagad" | "rocket">("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plansQuery = trpc.payment.getPlans.useQuery();
  const initiatePaymentMutation = trpc.payment.initiatePayment.useMutation();

  const handlePayment = async () => {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await initiatePaymentMutation.mutateAsync({
        planId: selectedPlan,
        gateway: selectedGateway,
      });

      if (result.success) {
        if (selectedGateway === "stripe" && result.clientSecret) {
          // Redirect to Stripe checkout
          window.location.href = `/payment/stripe?clientSecret=${result.clientSecret}`;
        } else if (result.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = result.paymentUrl;
        }
      } else {
        setError(result.message || "Failed to initiate payment");
      }
    } catch (err) {
      setError("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const plans = plansQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your Plan</h1>
          <p className="text-slate-400">Upgrade to unlock premium features</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-slate-800 border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-purple-500 ring-2 ring-purple-500/50"
                  : "border-slate-700 hover:border-purple-500/50"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription className="text-slate-400">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-white">
                    ৳{plan.price}
                  </div>
                  <p className="text-sm text-slate-400">per {plan.billingCycle}</p>
                </div>

                <div className="space-y-2">
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-slate-300 text-sm">
                      <Check className="h-4 w-4 mr-2 text-green-400" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-center">
                    <RadioGroupItem
                      value={plan.id.toString()}
                      id={`plan-${plan.id}`}
                      checked={selectedPlan === plan.id}
                      className="text-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Gateway Selection */}
        <Card className="bg-slate-800 border-purple-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Select Payment Method</CardTitle>
            <CardDescription className="text-slate-400">
              Choose your preferred payment gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedGateway} onValueChange={(value: any) => setSelectedGateway(value)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 border border-slate-700 rounded-lg hover:border-purple-500 cursor-pointer">
                  <RadioGroupItem value="stripe" id="stripe" className="text-purple-500" />
                  <Label htmlFor="stripe" className="flex-1 cursor-pointer text-white">
                    <div className="font-semibold">Stripe</div>
                    <div className="text-sm text-slate-400">Credit/Debit Card</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border border-slate-700 rounded-lg hover:border-purple-500 cursor-pointer">
                  <RadioGroupItem value="sslcommerz" id="sslcommerz" className="text-purple-500" />
                  <Label htmlFor="sslcommerz" className="flex-1 cursor-pointer text-white">
                    <div className="font-semibold">SSLCommerz</div>
                    <div className="text-sm text-slate-400">All Payment Methods</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border border-slate-700 rounded-lg hover:border-purple-500 cursor-pointer">
                  <RadioGroupItem value="bkash" id="bkash" className="text-purple-500" />
                  <Label htmlFor="bkash" className="flex-1 cursor-pointer text-white">
                    <div className="font-semibold">bKash</div>
                    <div className="text-sm text-slate-400">Mobile Banking</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border border-slate-700 rounded-lg hover:border-purple-500 cursor-pointer">
                  <RadioGroupItem value="nagad" id="nagad" className="text-purple-500" />
                  <Label htmlFor="nagad" className="flex-1 cursor-pointer text-white">
                    <div className="font-semibold">Nagad</div>
                    <div className="text-sm text-slate-400">Mobile Banking</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border border-slate-700 rounded-lg hover:border-purple-500 cursor-pointer">
                  <RadioGroupItem value="rocket" id="rocket" className="text-purple-500" />
                  <Label htmlFor="rocket" className="flex-1 cursor-pointer text-white">
                    <div className="font-semibold">Rocket</div>
                    <div className="text-sm text-slate-400">Mobile Banking</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/30 mb-6">
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={!selectedPlan || loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </div>
    </div>
  );
}
