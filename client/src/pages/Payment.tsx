import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Download, CreditCard, History, Settings } from "lucide-react";

export function Payment() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const { data: plans } = trpc.payment.getPricingPlans.useQuery();
  const { data: subscription } = trpc.payment.getSubscription.useQuery();
  const { data: paymentHistory } = trpc.payment.getPaymentHistory.useQuery();
  const checkoutMutation = trpc.payment.createCheckoutSession.useMutation();

  const handleUpgrade = (planId: string) => {
    if (planId === "free") return;
    checkoutMutation.mutate({
      planId: planId as "pro" | "premium",
      billingCycle,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">প্ল্যান / Plans</TabsTrigger>
          <TabsTrigger value="history">ইতিহাস / History</TabsTrigger>
          <TabsTrigger value="settings">সেটিংস / Settings</TabsTrigger>
        </TabsList>

        {/* Pricing Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Current Subscription */}
          {subscription && subscription.status === "active" && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">বর্তমান সাবস্ক্রিপশন / Current Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">প্ল্যান / Plan</p>
                    <p className="font-bold text-lg capitalize">{subscription.planId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">মূল্য / Price</p>
                    <p className="font-bold text-lg">${subscription.amount}/মাস</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">স্থিতি / Status</p>
                    <Badge className="bg-green-600">সক্রিয়</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">নবায়ন / Renewal</p>
                    <p className="font-bold">{new Date(subscription.renewalDate).toLocaleDateString("bn-BD")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              onClick={() => setBillingCycle("monthly")}
            >
              মাসিক / Monthly
            </Button>
            <Button
              variant={billingCycle === "annual" ? "default" : "outline"}
              onClick={() => setBillingCycle("annual")}
            >
              বার্ষিক / Annual
              <Badge className="ml-2 bg-red-500">সাশ্রয় করুন</Badge>
            </Button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans?.plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  plan.popular ? "border-2 border-purple-500 shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600">জনপ্রিয়</Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-2">/{plan.billingCycle}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        ভিডিও: {plan.features.videoGenerationDuration}s {plan.features.videoQuality}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.features.imageGenerationUnlimited ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm">সীমাহীন ছবি তৈরি</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-red-600" />
                          <span className="text-sm">
                            {plan.features.imageGenerationMonthly || 0} ছবি/মাস
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.features.prioritySupport ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm">অগ্রাধিকার সহায়তা</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-red-600" />
                          <span className="text-sm">সাধারণ সহায়তা</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        কাস্টম মডেল: {plan.features.customAIModels}
                      </span>
                    </div>
                    {plan.features.apiAccess && (
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm">API অ্যাক্সেস</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {plan.id === "free" ? (
                    <Button variant="outline" disabled className="w-full">
                      বর্তমান প্ল্যান
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={checkoutMutation.isPending}
                      className="w-full"
                    >
                      {checkoutMutation.isPending ? "প্রক্রিয়াকরণ..." : "আপগ্রেড করুন"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {checkoutMutation.data && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <p className="text-green-900 mb-4">
                  ✓ চেকআউট সেশন তৈরি করা হয়েছে
                </p>
                <Button
                  onClick={() => window.open(checkoutMutation.data!.checkoutUrl, "_blank")}
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Stripe চেকআউটে যান
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                পেমেন্ট ইতিহাস / Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory?.payments && paymentHistory.payments.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold capitalize">{payment.planId} প্ল্যান</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${payment.amount}</p>
                        <Badge
                          variant={payment.status === "succeeded" ? "default" : "secondary"}
                        >
                          {payment.status === "succeeded" ? "সফল" : "অপেক্ষমাণ"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(payment.invoiceUrl, "_blank")}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">কোনো পেমেন্ট ইতিহাস নেই</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                পেমেন্ট সেটিংস / Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">পেমেন্ট পদ্ধতি / Payment Method</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Visa •••• 4242</p>
                  <p className="text-xs text-muted-foreground mt-1">মেয়াদ শেষ: 12/25</p>
                </div>
                <Button variant="outline" className="mt-3 w-full">
                  পেমেন্ট পদ্ধতি আপডেট করুন
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">বিল ঠিকানা / Billing Address</h3>
                <Button variant="outline" className="w-full">
                  ঠিকানা আপডেট করুন
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">সাবস্ক্রিপশন / Subscription</h3>
                <Button variant="destructive" className="w-full">
                  সাবস্ক্রিপশন বাতিল করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
