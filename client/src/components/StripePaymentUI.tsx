import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentUIProps {
  title?: string;
  description?: string;
  showProducts?: boolean;
}

export function StripePaymentUI({ 
  title = "Upgrade Your Plan", 
  description = "Choose a plan that works for you",
  showProducts = true 
}: StripePaymentUIProps) {
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const productsQuery = trpc.stripe.getProducts.useQuery();
  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation();
  const createSubscriptionMutation = trpc.stripe.createSubscriptionCheckout.useMutation();

  const handleCheckout = async (priceId: string, isSubscription: boolean = false) => {
    try {
      setIsLoading(true);
      const successUrl = `${window.location.origin}/payment-success`;
      const cancelUrl = `${window.location.origin}/payment-cancelled`;

      if (isSubscription) {
        const result = await createSubscriptionMutation.mutateAsync({
          priceId,
          successUrl,
          cancelUrl,
        });

        if (result.url) {
          window.open(result.url, "_blank");
          toast({
            title: "Redirecting to Stripe",
            description: "Opening checkout in a new tab...",
          });
        }
      } else {
        const result = await createCheckoutMutation.mutateAsync({
          priceId,
          successUrl,
          cancelUrl,
          quantity: 1,
        });

        if (result.url) {
          window.open(result.url, "_blank");
          toast({
            title: "Redirecting to Stripe",
            description: "Opening checkout in a new tab...",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!showProducts) {
    return null;
  }

  if (productsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (productsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load products. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { products = [], prices = [] } = productsQuery.data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const productPrices = prices.filter(
            (p) => p.stripeProductId === product.stripeProductId
          );

          return (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                {product.description && (
                  <CardDescription>{product.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {productPrices.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {productPrices.map((price) => (
                        <div
                          key={price.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedPriceId(price.stripePriceId)}
                        >
                          <div className="flex-1">
                            <p className="font-semibold">
                              ${price.amount.toFixed(2)} {price.currency.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {price.billingCycle}
                            </p>
                          </div>
                          {selectedPriceId === price.stripePriceId && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() =>
                        selectedPriceId &&
                        handleCheckout(selectedPriceId, product.type === "subscription")
                      }
                      disabled={!selectedPriceId || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Checkout"
                      )}
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">No prices available</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
