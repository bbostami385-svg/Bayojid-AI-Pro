/**
 * Phase 159-160: Payment Upgrade Page
 * Displays pricing tiers and allows users to upgrade their subscription
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  description: string;
  features: {
    name: string;
    included: boolean;
  }[];
  cta: string;
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'monthly',
    description: 'Perfect for getting started',
    features: [
      { name: '10 min/month video editing', included: true },
      { name: '5 images/month generation', included: true },
      { name: 'Basic website builder', included: true },
      { name: '1 automation workflow', included: true },
      { name: 'Community support', included: true },
      { name: 'Advanced AI agents', included: false },
      { name: 'Marketplace access', included: false },
      { name: 'Team collaboration', included: false },
    ],
    cta: 'Current Plan',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    billingPeriod: 'monthly',
    description: 'For growing creators',
    features: [
      { name: '60 min/month video editing', included: true },
      { name: '50 images/month generation', included: true },
      { name: 'Advanced website builder', included: true },
      { name: '10 automation workflows', included: true },
      { name: 'Priority support', included: true },
      { name: 'Basic AI agents', included: true },
      { name: 'Marketplace access', included: true },
      { name: 'Up to 3 team members', included: false },
    ],
    cta: 'Upgrade to Starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    billingPeriod: 'monthly',
    description: 'For professionals',
    features: [
      { name: '500 min/month video editing', included: true },
      { name: '500 images/month generation', included: true },
      { name: 'Unlimited website builder', included: true },
      { name: 'Unlimited automation workflows', included: true },
      { name: '24/7 priority support', included: true },
      { name: 'Advanced AI agents', included: true },
      { name: 'Marketplace access', included: true },
      { name: 'Up to 10 team members', included: true },
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    billingPeriod: 'monthly',
    description: 'For large organizations',
    features: [
      { name: 'Unlimited video editing', included: true },
      { name: 'Unlimited image generation', included: true },
      { name: 'Unlimited everything', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: '24/7 phone support', included: true },
      { name: 'Custom AI agents', included: true },
      { name: 'Private marketplace', included: true },
      { name: 'Unlimited team members', included: true },
    ],
    cta: 'Contact Sales',
  },
];

export default function UpgradePage() {
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleUpgrade = (tierId: string) => {
    // TODO: Redirect to payment processing
    console.log(`Upgrading to ${tierId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan for your needs
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={selectedBillingPeriod === 'monthly' ? 'default' : 'outline'}
              onClick={() => setSelectedBillingPeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={selectedBillingPeriod === 'yearly' ? 'default' : 'outline'}
              onClick={() => setSelectedBillingPeriod('yearly')}
            >
              Yearly (Save 20%)
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative flex flex-col p-6 transition-all ${
                tier.highlighted
                  ? 'ring-2 ring-primary scale-105 shadow-lg'
                  : 'hover:shadow-lg'
              }`}
            >
              {tier.highlighted && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

                {tier.price > 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/{tier.billingPeriod}</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold">Custom</div>
                )}
              </div>

              {/* Features List */}
              <div className="flex-1 mb-6 space-y-3">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleUpgrade(tier.id)}
                variant={tier.highlighted ? 'default' : 'outline'}
                className="w-full"
              >
                {tier.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-card rounded-lg p-8 border">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes, all paid plans come with a 14-day free trial. No credit card required.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
