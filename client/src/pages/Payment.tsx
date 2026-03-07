import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Download, CreditCard, History, Settings, AlertCircle, Loader } from "lucide-react";

export function Payment() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: plansData } = trpc.sslcommerzPayment.getPlans.useQuery();
  const { data: subscriptionData } = trpc.sslcommerzPayment.getSubscription.useQuery();
  const { data: historyData } = trpc.sslcommerzPayment.getTransactionHistory.useQuery();
  const createPaymentMutation = trpc.sslcommerzPayment.createPaymentRequest.useMutation();

  const handleUpgrade = (planId: number) => {
    setLoading(true);
    setError(null);
    createPaymentMutation.mutate(
      { planId },
      {
        onSuccess: (data) => {
          if (data.paymentData) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = data.paymentUrl;
            Object.entries(data.paymentData).forEach(([key, value]) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = String(value);
              form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
          }
        },
        onError: (err) => {
          setError(err.message || "পেমেন্ট অনুরোধ ব্যর্থ হয়েছে");
          setLoading(false);
        },
      }
    );
  };

  const plans = plansData?.plans || [];
  const subscription = subscriptionData?.subscription;
  const paymentHistory = historyData?.transactions || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">প্ল্যান</TabsTrigger>
          <TabsTrigger value="history">ইতিহাস</TabsTrigger>
          <TabsTrigger value="settings">সেটিংস</TabsTrigger>
        </TabsList>

        {/* Pricing Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Current Subscription */}
          {subscription && subscription.status === "active" && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">বর্তমান সাবস্ক্রিপশন</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">প্ল্যান</p>
                    <p className="font-bold text-lg capitalize">{(subscription as any).plan || subscription.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">স্থিতি</p>
                    <Badge className="bg-green-600">সক্রিয়</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">শেষ হওয়ার তারিখ</p>
                    <p className="font-bold">{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString("bn-BD") : "চিরস্থায়ী"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="pt-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-900">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan: any) => (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  plan.slug === "premium" ? "border-2 border-purple-500 shadow-lg" : ""
                }`}
              >
                {plan.slug === "premium" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600">জনপ্রিয়</Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="capitalize">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">৳{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/{plan.billingCycle === "monthly" ? "মাস" : "বছর"}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        ভিডিও: {plan.videoDuration}s {plan.videoQuality}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        {plan.videoLimit > 0 ? `${plan.videoLimit} ভিডিও/দিন` : "সীমাহীন ভিডিও"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        {plan.imageLimit > 0 ? `${plan.imageLimit} ছবি/দিন` : "সীমাহীন ছবি"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {(subscription as any)?.plan === plan.slug ? (
                    <Button variant="outline" disabled className="w-full">
                      বর্তমান প্ল্যান
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          প্রক্রিয়াকরণ...
                        </>
                      ) : (
                        "আপগ্রেড করুন"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                পেমেন্ট ইতিহাস
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory && paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((txn: any) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold capitalize">{txn.plan} প্ল্যান</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(txn.createdAt).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">৳{txn.amount}</p>
                        <Badge
                          variant={txn.status === "completed" ? "default" : "secondary"}
                        >
                          {txn.status === "completed" ? "সফল" : txn.status === "pending" ? "অপেক্ষমাণ" : "ব্যর্থ"}
                        </Badge>
                      </div>
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
                পেমেন্ট সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">সাবস্ক্রিপশন ম্যানেজমেন্ট</h3>
                <p className="text-sm text-muted-foreground mb-3">আপনার সাবস্ক্রিপশন যেকোনো সময় বাতিল করতে পারেন।</p>
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
