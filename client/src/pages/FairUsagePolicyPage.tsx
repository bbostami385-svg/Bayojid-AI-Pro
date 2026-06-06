import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  Lock,
  Zap,
  TrendingUp,
  Shield,
  BookOpen,
  BarChart3,
} from "lucide-react";

export default function FairUsagePolicyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Fair Usage Policy</h1>
        <p className="text-purple-300 mt-1">
          Understand how credits work, model restrictions, and cost multipliers
        </p>
      </div>

      {/* Quick Overview */}
      <Alert className="bg-blue-600/20 border-blue-500/30">
        <Shield className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          Our Fair Usage Policy ensures all users get fair access to AI models while preventing abuse. Heavy users
          pay more to maintain service quality for everyone.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-700/50 border-purple-500/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="multipliers">Cost Multipliers</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Policy Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-slate-700/50 rounded p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Daily Credit Allocation</h4>
                  <p className="text-sm text-purple-300">
                    Each tier receives a daily credit allocation that resets at 12:00 AM UTC. Credits don't roll over
                    to the next day.
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Monthly Safe Zone</h4>
                  <p className="text-sm text-purple-300">
                    Premium tier users should maintain 40,000-70,000 credits per month. Usage outside this range may
                    indicate underutilization or overuse.
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Soft Limits</h4>
                  <p className="text-sm text-purple-300">
                    We use soft limits instead of hard blocks. At 90% usage, operations are restricted. At 80%, costs
                    increase to discourage further usage.
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Model Restrictions</h4>
                  <p className="text-sm text-purple-300">
                    Heavy models like GPT-5 are restricted based on tier. This ensures fair access and prevents
                    resource exhaustion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tier Benefits Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Tier */}
            <Card className="bg-slate-800 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Free Tier</CardTitle>
                <CardDescription className="text-green-300">$0/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded p-3">
                  <p className="text-xs text-purple-300 mb-1">Daily Credits</p>
                  <p className="text-lg font-bold text-white">100</p>
                  <p className="text-xs text-purple-400">2,000/month</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Available Models</h4>
                  <div className="space-y-1">
                    <Badge className="bg-green-600/20 text-green-300">Gemini Flash</Badge>
                    <Badge className="bg-green-600/20 text-green-300">DeepSeek</Badge>
                    <Badge className="bg-green-600/20 text-green-300">Qwen</Badge>
                    <Badge className="bg-green-600/20 text-green-300">GPT Mini</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Restrictions</h4>
                  <ul className="text-xs text-purple-300 space-y-1">
                    <li>❌ No GPT-5</li>
                    <li>❌ No Claude Mythos</li>
                    <li>❌ No Grok</li>
                    <li>❌ No Gemini 3</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="bg-slate-800 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white">Pro Tier</CardTitle>
                <CardDescription className="text-blue-300">$9.99/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded p-3">
                  <p className="text-xs text-purple-300 mb-1">Daily Credits</p>
                  <p className="text-lg font-bold text-white">1,000</p>
                  <p className="text-xs text-purple-400">20,000/month</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Available Models</h4>
                  <div className="space-y-1">
                    <Badge className="bg-blue-600/20 text-blue-300">All Free Models</Badge>
                    <Badge className="bg-blue-600/20 text-blue-300">Claude Mythos</Badge>
                    <Badge className="bg-blue-600/20 text-blue-300">Grok</Badge>
                    <Badge className="bg-blue-600/20 text-blue-300">Perplexity</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Restrictions</h4>
                  <ul className="text-xs text-purple-300 space-y-1">
                    <li>❌ No GPT-5</li>
                    <li>❌ No Gemini 3</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Premium Tier</CardTitle>
                <CardDescription className="text-purple-300">$29.99/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded p-3">
                  <p className="text-xs text-purple-300 mb-1">Daily Credits</p>
                  <p className="text-lg font-bold text-white">5,000</p>
                  <p className="text-xs text-purple-400">60,000/month (Safe: 40K-70K)</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Available Models</h4>
                  <div className="space-y-1">
                    <Badge className="bg-purple-600/20 text-purple-300">All Pro Models</Badge>
                    <Badge className="bg-purple-600/20 text-purple-300">Gemini 3</Badge>
                    <Badge className="bg-yellow-600/20 text-yellow-300">GPT-5 (25% max)</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Benefits</h4>
                  <ul className="text-xs text-purple-300 space-y-1">
                    <li>✅ GPT-5 limited to 25% usage</li>
                    <li>✅ Monthly safe zone tracking</li>
                    <li>✅ Cost multiplier at 80%+</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="bg-slate-800 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white">Enterprise Tier</CardTitle>
                <CardDescription className="text-yellow-300">$99.99/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded p-3">
                  <p className="text-xs text-purple-300 mb-1">Daily Credits</p>
                  <p className="text-lg font-bold text-white">50,000</p>
                  <p className="text-xs text-purple-400">Soft limit (contact support)</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Available Models</h4>
                  <div className="space-y-1">
                    <Badge className="bg-yellow-600/20 text-yellow-300">All Models</Badge>
                    <Badge className="bg-yellow-600/20 text-yellow-300">GPT-5 (30% max)</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Benefits</h4>
                  <ul className="text-xs text-purple-300 space-y-1">
                    <li>✅ GPT-5 up to 30% usage</li>
                    <li>✅ Soft limits (no hard blocks)</li>
                    <li>✅ Priority support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Restrictions Tab */}
        <TabsContent value="restrictions" className="space-y-4">
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                Model Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/50 rounded p-4">
                <h4 className="text-sm font-semibold text-white mb-3">GPT-5 Availability</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Free Tier</span>
                    <Badge className="bg-red-600/20 text-red-300">Not Available</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Pro Tier</span>
                    <Badge className="bg-red-600/20 text-red-300">Not Available</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Premium Tier</span>
                    <Badge className="bg-yellow-600/20 text-yellow-300">Max 25% usage</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Enterprise Tier</span>
                    <Badge className="bg-green-600/20 text-green-300">Max 30% usage</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Heavy Models (Free Tier)</h4>
                <p className="text-sm text-purple-300 mb-3">The following models are not available for free tier:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Badge className="bg-purple-600/20 text-purple-300">GPT-5</Badge>
                  <Badge className="bg-purple-600/20 text-purple-300">Claude Mythos</Badge>
                  <Badge className="bg-purple-600/20 text-purple-300">Grok</Badge>
                  <Badge className="bg-purple-600/20 text-purple-300">Gemini 3</Badge>
                </div>
              </div>

              <Alert className="bg-orange-600/20 border-orange-500/30">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <AlertDescription className="text-orange-300">
                  Attempting to use restricted models will result in an error and no credits will be deducted.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Multipliers Tab */}
        <TabsContent value="multipliers" className="space-y-4">
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Cost Multiplier System
              </CardTitle>
              <CardDescription className="text-purple-300">
                Costs increase as you approach your monthly limit to encourage fair usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-slate-700/50 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-white">0-80% Usage</span>
                    <Badge className="bg-green-600/20 text-green-300">1x Cost</Badge>
                  </div>
                  <p className="text-xs text-purple-300">Normal pricing applies</p>
                </div>

                <div className="bg-slate-700/50 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-white">80-85% Usage</span>
                    <Badge className="bg-yellow-600/20 text-yellow-300">1.2x Cost</Badge>
                  </div>
                  <p className="text-xs text-purple-300">20% increase - warning zone</p>
                </div>

                <div className="bg-slate-700/50 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-white">85-90% Usage</span>
                    <Badge className="bg-orange-600/20 text-orange-300">1.5x Cost</Badge>
                  </div>
                  <p className="text-xs text-purple-300">50% increase - critical zone</p>
                </div>

                <div className="bg-slate-700/50 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-white">90%+ Usage</span>
                    <Badge className="bg-red-600/20 text-red-300">2x Cost</Badge>
                  </div>
                  <p className="text-xs text-purple-300">100% increase - operations blocked at 90%</p>
                </div>
              </div>

              <Alert className="bg-blue-600/20 border-blue-500/30">
                <Zap className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Example: A 10-credit operation costs 12 credits at 80% usage (1.2x), 15 credits at 85% usage (1.5x),
                  and 20 credits at 90% usage (2x).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <div className="space-y-4">
            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">What happens when I reach 90% usage?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-300">
                  Operations are blocked to prevent exceeding your monthly limit. You can wait for next month or
                  upgrade to a higher tier.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Do unused credits roll over?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-300">
                  No, daily credits reset at 12:00 AM UTC. Monthly limits are calculated from your tier's allocation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Can I use GPT-5 on free tier?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-300">
                  No, GPT-5 is restricted to Premium (25% max) and Enterprise (30% max) tiers to ensure fair access.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Why do costs increase at 80%?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-300">
                  Cost multipliers encourage fair usage and help maintain service quality. This soft limit approach
                  gives you flexibility while discouraging abuse.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">What's the safe zone for Premium?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-300">
                  Premium tier should use 40,000-70,000 credits per month. Usage outside this range may indicate
                  underutilization or overuse.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Can I get more credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-300">
                  Yes, upgrade to a higher tier for more daily credits. Enterprise tier offers soft limits and priority
                  support.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
