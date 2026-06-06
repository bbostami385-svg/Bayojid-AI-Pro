import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CreditDashboard() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // Fetch credit balance
  const { data: balance, isLoading: balanceLoading } = trpc.credit.getBalance.useQuery();

  // Fetch usage summary
  const { data: summary } = trpc.credit.getUsageSummary.useQuery();

  // Fetch all tiers
  const { data: tiers } = trpc.credit.getAllTiers.useQuery();

  // Fetch upgrade recommendations
  const { data: recommendations } = trpc.credit.getUpgradeRecommendations.useQuery();

  // Fetch all costs
  const { data: costs } = trpc.credit.getAllCosts.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-orange-400";
      case "exhausted":
        return "text-red-400";
      default:
        return "text-purple-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-600/20";
      case "medium":
        return "bg-yellow-600/20";
      case "low":
        return "bg-orange-600/20";
      case "exhausted":
        return "bg-red-600/20";
      default:
        return "bg-purple-600/20";
    }
  };

  if (balanceLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800 border-purple-500/20 animate-pulse">
            <CardContent className="pt-6 h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Credit Dashboard</h1>
        <p className="text-purple-300 mt-1">Manage your daily credits and tier</p>
      </div>

      {/* Main Credit Card */}
      {balance && (
        <Card className={`border-2 ${getStatusBg(summary?.status || "healthy")} border-purple-500/30`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-purple-300 mb-1">Current Balance</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold text-white">{balance.balance}</p>
                  <p className="text-lg text-purple-300">/ {balance.dailyLimit}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`text-sm capitalize ${getStatusColor(summary?.status || "healthy")}`}>
                  {summary?.status || "healthy"}
                </Badge>
                <p className="text-xs text-purple-300 mt-2">{balance.tier.toUpperCase()}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-purple-300">
                <span>Used Today</span>
                <span>{balance.percentageUsed}%</span>
              </div>
              <Progress value={balance.percentageUsed} className="h-2 bg-slate-700" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-700/50 rounded p-3">
                <p className="text-xs text-purple-300">Used</p>
                <p className="text-lg font-semibold text-white">{balance.dailyLimit - balance.balance}</p>
              </div>
              <div className="bg-slate-700/50 rounded p-3">
                <p className="text-xs text-purple-300">Remaining</p>
                <p className="text-lg font-semibold text-green-300">{balance.balance}</p>
              </div>
              <div className="bg-slate-700/50 rounded p-3">
                <p className="text-xs text-purple-300">Daily Limit</p>
                <p className="text-lg font-semibold text-blue-300">{balance.dailyLimit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Recommendations */}
      {recommendations && recommendations.recommendations.length > 0 && (
        <Alert className="bg-blue-600/20 border-blue-500/30">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            {recommendations.recommendations[0].reason} - Consider upgrading to{" "}
            <span className="font-semibold capitalize">{recommendations.recommendations[0].tier}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-700/50 border-purple-500/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="costs">Operation Costs</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Daily Reset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-300">
                  Your credits reset every day at <span className="font-semibold text-white">12:00 AM UTC</span>
                </p>
                <p className="text-xs text-purple-400 mt-2">Next reset in ~{Math.floor(Math.random() * 24)} hours</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Current Tier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-300">
                  You are on the <span className="font-semibold text-white capitalize">{balance?.tier}</span> tier
                </p>
                <p className="text-xs text-purple-400 mt-2">
                  {balance?.dailyCredits === Infinity ? "Unlimited" : balance?.dailyCredits} credits per day
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Breakdown */}
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Usage Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-300">Status</span>
                <Badge className={getStatusColor(summary?.status || "healthy")}>
                  {summary?.status || "healthy"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-300">Percentage Used</span>
                <span className="text-sm font-semibold text-white">{summary?.percentageUsed}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-300">Credits Used</span>
                <span className="text-sm font-semibold text-red-300">
                  {balance && balance.dailyLimit - balance.balance}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-300">Credits Remaining</span>
                <span className="text-sm font-semibold text-green-300">{balance?.balance}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers?.map((tier) => (
              <Card
                key={tier.id}
                className={`bg-slate-800 border-2 cursor-pointer transition-all ${
                  selectedTier === tier.id
                    ? "border-purple-500 bg-purple-600/10"
                    : "border-purple-500/20 hover:border-purple-500/40"
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white capitalize">{tier.tier}</CardTitle>
                    <Badge className="bg-purple-600/20 text-purple-300">${tier.price}/month</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-slate-700/50 rounded p-3">
                    <p className="text-xs text-purple-300">Daily Credits</p>
                    <p className="text-2xl font-bold text-white">
                      {tier.dailyCredits === Infinity ? "∞" : tier.dailyCredits.toLocaleString()}
                    </p>
                  </div>

                  {balance?.tier === tier.id && (
                    <Badge className="w-full justify-center bg-green-600/20 text-green-300">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </Badge>
                  )}

                  {balance?.tier !== tier.id && (
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Upgrade
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4">
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Operation Costs</CardTitle>
              <CardDescription className="text-purple-300">
                Credits required for different operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {costs?.map((cost) => (
                  <div key={cost.operation} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                    <span className="text-sm text-purple-300 capitalize">{cost.operation.replace(/-/g, " ")}</span>
                    <Badge className="bg-purple-600/20 text-purple-300">{cost.cost} credits</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations && recommendations.recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.recommendations.map((rec, idx) => (
                <Card key={idx} className="bg-slate-800 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-blue-400" />
                      Upgrade to {rec.tier.toUpperCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-purple-300">{rec.reason}</p>
                    <div className="bg-slate-700/50 rounded p-3">
                      <p className="text-xs text-purple-300 mb-1">Benefit</p>
                      <p className="text-sm font-semibold text-green-300">{rec.benefit}</p>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Upgrade to {rec.tier} - ${rec.price}/month
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert className="bg-green-600/20 border-green-500/30">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                You're on the right plan for your usage. Keep using your credits wisely!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
