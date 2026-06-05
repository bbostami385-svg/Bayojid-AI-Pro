import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Zap, Image } from "lucide-react";

interface QuotaData {
  tier: "free" | "starter" | "premium" | "enterprise";
  videoMinutesLimit: number;
  imageGenerationsLimit: number;
  videoMinutesUsed: number;
  imageGenerationsUsed: number;
  resetDate: string;
  videoUsagePercent: number;
  imageUsagePercent: number;
  upgradeRecommendation: string | null;
}

export default function UsageQuotasPage() {
  const { user } = useAuth();
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user quota data
    const fetchQuota = async () => {
      try {
        // This would be replaced with actual tRPC call
        const mockData: QuotaData = {
          tier: "free",
          videoMinutesLimit: 10,
          imageGenerationsLimit: 5,
          videoMinutesUsed: 3,
          imageGenerationsUsed: 2,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString(),
          videoUsagePercent: 30,
          imageUsagePercent: 40,
          upgradeRecommendation: null,
        };
        setQuota(mockData);
      } catch (error) {
        console.error("Failed to fetch quota:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuota();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-purple-300">Loading quota information...</div>;
  }

  if (!quota) {
    return <div className="text-center py-8 text-red-300">Failed to load quota data</div>;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-green-600/20 text-green-300 border-green-500/30";
      case "starter":
        return "bg-blue-600/20 text-blue-300 border-blue-500/30";
      case "premium":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-500/30";
      case "enterprise":
        return "bg-purple-600/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-slate-600/20 text-slate-300 border-slate-500/30";
    }
  };

  const getProgressBarColor = (percent: number) => {
    if (percent < 50) return "from-green-500 to-green-600";
    if (percent < 80) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Usage Quotas</h1>
          <p className="text-purple-300">Monitor your monthly usage and upgrade when needed</p>
        </div>

        {/* Current Tier */}
        <Card className="bg-slate-800 border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Current Plan</CardTitle>
                <CardDescription className="text-purple-300">Your subscription tier and limits</CardDescription>
              </div>
              <Badge className={getTierColor(quota.tier)}>
                {quota.tier.charAt(0).toUpperCase() + quota.tier.slice(1)} Tier
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-xs text-purple-300 mb-1">Video Minutes</p>
                <p className="text-2xl font-bold text-white">
                  {quota.videoMinutesLimit === Infinity ? "∞" : quota.videoMinutesLimit}
                </p>
                <p className="text-xs text-purple-400 mt-1">per month</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-xs text-purple-300 mb-1">Image Generations</p>
                <p className="text-2xl font-bold text-white">
                  {quota.imageGenerationsLimit === Infinity ? "∞" : quota.imageGenerationsLimit}
                </p>
                <p className="text-xs text-purple-400 mt-1">per month</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-xs text-purple-300 mb-1">Reset Date</p>
                <p className="text-lg font-bold text-white">{quota.resetDate}</p>
                <p className="text-xs text-purple-400 mt-1">next reset</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-xs text-purple-300 mb-1">Status</p>
                <p className="text-lg font-bold text-green-300">Active</p>
                <p className="text-xs text-purple-400 mt-1">subscription</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Usage */}
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <CardTitle className="text-white">Video Editing</CardTitle>
              </div>
              <CardDescription className="text-purple-300">Monthly video editing minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-purple-300">Usage</span>
                  <span className="text-sm font-semibold text-white">
                    {quota.videoMinutesUsed} / {quota.videoMinutesLimit === Infinity ? "∞" : quota.videoMinutesLimit} min
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${getProgressBarColor(quota.videoUsagePercent)}`}
                    style={{ width: `${Math.min(quota.videoUsagePercent, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-purple-300 mt-2">{quota.videoUsagePercent.toFixed(1)}% used</p>
              </div>

              {quota.videoUsagePercent > 80 && (
                <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200">You're using 80%+ of your monthly quota</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Usage */}
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Image Generation</CardTitle>
              </div>
              <CardDescription className="text-purple-300">Monthly image generations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-purple-300">Usage</span>
                  <span className="text-sm font-semibold text-white">
                    {quota.imageGenerationsUsed} / {quota.imageGenerationsLimit === Infinity ? "∞" : quota.imageGenerationsLimit}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${getProgressBarColor(quota.imageUsagePercent)}`}
                    style={{ width: `${Math.min(quota.imageUsagePercent, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-purple-300 mt-2">{quota.imageUsagePercent.toFixed(1)}% used</p>
              </div>

              {quota.imageUsagePercent > 80 && (
                <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200">You're using 80%+ of your monthly quota</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Recommendation */}
        {quota.upgradeRecommendation && (
          <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <CardTitle className="text-yellow-300">Upgrade Recommended</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-yellow-200">{quota.upgradeRecommendation}</p>
              <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                View Premium Plans
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tier Comparison */}
        <Card className="bg-slate-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Tier Comparison</CardTitle>
            <CardDescription className="text-purple-300">Compare features across all subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-2 px-2 text-purple-300">Feature</th>
                    <th className="text-center py-2 px-2 text-green-300">Free</th>
                    <th className="text-center py-2 px-2 text-blue-300">Starter</th>
                    <th className="text-center py-2 px-2 text-yellow-300">Premium</th>
                    <th className="text-center py-2 px-2 text-purple-300">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-2 px-2 text-purple-300">Video Minutes</td>
                    <td className="text-center py-2 px-2 text-white">10/mo</td>
                    <td className="text-center py-2 px-2 text-white">60/mo</td>
                    <td className="text-center py-2 px-2 text-white">500/mo</td>
                    <td className="text-center py-2 px-2 text-white">Unlimited</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-2 px-2 text-purple-300">Image Generations</td>
                    <td className="text-center py-2 px-2 text-white">5/mo</td>
                    <td className="text-center py-2 px-2 text-white">50/mo</td>
                    <td className="text-center py-2 px-2 text-white">500/mo</td>
                    <td className="text-center py-2 px-2 text-white">Unlimited</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-2 px-2 text-purple-300">AI Models</td>
                    <td className="text-center py-2 px-2 text-white">4</td>
                    <td className="text-center py-2 px-2 text-white">7</td>
                    <td className="text-center py-2 px-2 text-white">10</td>
                    <td className="text-center py-2 px-2 text-white">All</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-purple-300">Priority Support</td>
                    <td className="text-center py-2 px-2">❌</td>
                    <td className="text-center py-2 px-2">❌</td>
                    <td className="text-center py-2 px-2">✅</td>
                    <td className="text-center py-2 px-2">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Button */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-600/10">
            View Billing History
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Upgrade Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
