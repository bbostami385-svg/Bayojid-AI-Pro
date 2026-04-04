import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionManagement() {
  const subscriptionsQuery = trpc.stripe.getSubscriptions.useQuery();
  const cancelSubscriptionMutation = trpc.stripe.cancelSubscription.useMutation();
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setCancelingId(subscriptionId);
      await cancelSubscriptionMutation.mutateAsync({ subscriptionId });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the end of the billing period.",
      });
      subscriptionsQuery.refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (subscriptionsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (subscriptionsQuery.isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load subscriptions. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const subscriptions = subscriptionsQuery.data?.subscriptions || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-gray-600">Manage your active subscriptions</p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No active subscriptions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subscription #{subscription.stripeSubscriptionId.slice(-8)}</CardTitle>
                    <CardDescription>
                      Price ID: {subscription.stripePriceId}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {subscription.currentPeriodStart && (
                    <div>
                      <p className="text-sm text-gray-600">Current Period Start</p>
                      <p className="font-semibold">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {subscription.currentPeriodEnd && (
                    <div>
                      <p className="text-sm text-gray-600">Current Period End</p>
                      <p className="font-semibold">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {subscription.status === "active" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelSubscription(subscription.stripeSubscriptionId)}
                    disabled={cancelingId === subscription.stripeSubscriptionId}
                  >
                    {cancelingId === subscription.stripeSubscriptionId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
