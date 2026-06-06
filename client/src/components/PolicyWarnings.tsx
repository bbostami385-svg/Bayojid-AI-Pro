import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Info, TrendingUp, Lock, Zap } from "lucide-react";

interface PolicyWarning {
  type: "restriction" | "warning" | "info" | "critical";
  title: string;
  message: string;
  recommendation?: string;
  icon?: React.ReactNode;
}

interface PolicyWarningsProps {
  userTier: string;
  monthlyUsagePercentage: number;
  gpt5UsagePercentage: number;
  modelSelected?: string;
  costMultiplier?: number;
}

export function PolicyWarnings({
  userTier,
  monthlyUsagePercentage,
  gpt5UsagePercentage,
  modelSelected,
  costMultiplier = 1,
}: PolicyWarningsProps) {
  const [warnings, setWarnings] = useState<PolicyWarning[]>([]);

  useEffect(() => {
    const newWarnings: PolicyWarning[] = [];

    // Check monthly usage
    if (monthlyUsagePercentage > 90) {
      newWarnings.push({
        type: "critical",
        title: "Monthly Limit Exceeded",
        message: `You've reached 90%+ of your monthly limit (${monthlyUsagePercentage.toFixed(1)}%)`,
        recommendation: "Upgrade to a higher tier or wait for next month",
        icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      });
    } else if (monthlyUsagePercentage > 80) {
      newWarnings.push({
        type: "warning",
        title: "Approaching Monthly Limit",
        message: `You're at ${monthlyUsagePercentage.toFixed(1)}% of your monthly limit`,
        recommendation: "Consider upgrading to maintain uninterrupted access",
        icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
      });
    }

    // Check GPT-5 usage
    if (modelSelected?.toLowerCase().includes("gpt5")) {
      if (userTier === "free" || userTier === "pro") {
        newWarnings.push({
          type: "restriction",
          title: "GPT-5 Not Available",
          message: `GPT-5 is not available for ${userTier} tier`,
          recommendation: "Upgrade to Premium (25% usage) or Enterprise (30% usage)",
          icon: <Lock className="w-5 h-5 text-purple-400" />,
        });
      } else if (userTier === "premium") {
        if (gpt5UsagePercentage > 25) {
          newWarnings.push({
            type: "warning",
            title: "GPT-5 Usage Limit Exceeded",
            message: `GPT-5 usage at ${gpt5UsagePercentage.toFixed(1)}% (limit: 25%)`,
            recommendation: "Switch to alternative models or upgrade to Enterprise",
            icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          });
        } else if (gpt5UsagePercentage > 20) {
          newWarnings.push({
            type: "info",
            title: "GPT-5 Usage Approaching Limit",
            message: `GPT-5 usage at ${gpt5UsagePercentage.toFixed(1)}% (limit: 25%)`,
            recommendation: "Consider using alternative models",
            icon: <Info className="w-5 h-5 text-blue-400" />,
          });
        }
      } else if (userTier === "enterprise") {
        if (gpt5UsagePercentage > 30) {
          newWarnings.push({
            type: "warning",
            title: "GPT-5 Usage Limit Exceeded",
            message: `GPT-5 usage at ${gpt5UsagePercentage.toFixed(1)}% (limit: 30%)`,
            recommendation: "Contact support for enterprise overages",
            icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          });
        }
      }
    }

    // Check cost multiplier
    if (costMultiplier > 1) {
      newWarnings.push({
        type: "info",
        title: "Cost Multiplier Applied",
        message: `Operations cost ${(costMultiplier * 100).toFixed(0)}% more due to high usage`,
        recommendation: `Each operation costs ${costMultiplier}x normal rate`,
        icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      });
    }

    // Model restrictions for free tier
    if (userTier === "free" && modelSelected) {
      const restrictedModels = ["gpt5", "claude-mythos", "grok", "gemini3"];
      if (restrictedModels.some((m) => modelSelected.toLowerCase().includes(m))) {
        newWarnings.push({
          type: "restriction",
          title: "Premium Model Not Available",
          message: `${modelSelected} is not available for free tier`,
          recommendation: "Upgrade to Pro tier to access premium models",
          icon: <Lock className="w-5 h-5 text-purple-400" />,
        });
      }
    }

    setWarnings(newWarnings);
  }, [userTier, monthlyUsagePercentage, gpt5UsagePercentage, modelSelected, costMultiplier]);

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {warnings.map((warning, idx) => {
        const bgColor = {
          restriction: "bg-purple-600/20 border-purple-500/30",
          warning: "bg-yellow-600/20 border-yellow-500/30",
          info: "bg-blue-600/20 border-blue-500/30",
          critical: "bg-red-600/20 border-red-500/30",
        }[warning.type];

        const textColor = {
          restriction: "text-purple-300",
          warning: "text-yellow-300",
          info: "text-blue-300",
          critical: "text-red-300",
        }[warning.type];

        return (
          <Alert key={idx} className={`${bgColor} border-2`}>
            <div className="flex gap-3">
              {warning.icon}
              <div className="flex-1">
                <AlertTitle className={`${textColor} font-semibold`}>{warning.title}</AlertTitle>
                <AlertDescription className={`${textColor} text-sm mt-1`}>{warning.message}</AlertDescription>
                {warning.recommendation && (
                  <AlertDescription className={`${textColor} text-xs mt-2 italic`}>
                    💡 {warning.recommendation}
                  </AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}

/**
 * Fair Usage Policy Card Component
 */
export function FairUsagePolicyCard() {
  return (
    <Card className="bg-slate-800 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Fair Usage Policy
        </CardTitle>
        <CardDescription className="text-purple-300">
          Understand how credits work and model restrictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GPT-5 Restrictions */}
        <div className="bg-slate-700/50 rounded p-3 space-y-2">
          <h4 className="text-sm font-semibold text-white">GPT-5 Usage Limits</h4>
          <div className="space-y-1 text-xs text-purple-300">
            <div className="flex justify-between">
              <span>Free Tier:</span>
              <Badge className="bg-red-600/20 text-red-300">Not Available</Badge>
            </div>
            <div className="flex justify-between">
              <span>Pro Tier:</span>
              <Badge className="bg-red-600/20 text-red-300">Not Available</Badge>
            </div>
            <div className="flex justify-between">
              <span>Premium Tier:</span>
              <Badge className="bg-yellow-600/20 text-yellow-300">Max 25%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Enterprise Tier:</span>
              <Badge className="bg-green-600/20 text-green-300">Max 30%</Badge>
            </div>
          </div>
        </div>

        {/* Monthly Safe Zone */}
        <div className="bg-slate-700/50 rounded p-3 space-y-2">
          <h4 className="text-sm font-semibold text-white">Monthly Safe Zone</h4>
          <div className="space-y-1 text-xs text-purple-300">
            <p>Premium tier: 40,000 - 70,000 credits/month</p>
            <p className="text-purple-400">
              ⚠️ Usage below/above safe zone may indicate underutilization or overuse
            </p>
          </div>
        </div>

        {/* Cost Multiplier */}
        <div className="bg-slate-700/50 rounded p-3 space-y-2">
          <h4 className="text-sm font-semibold text-white">Cost Multiplier</h4>
          <div className="space-y-1 text-xs text-purple-300">
            <div className="flex justify-between">
              <span>0-80% usage:</span>
              <Badge className="bg-green-600/20 text-green-300">1x cost</Badge>
            </div>
            <div className="flex justify-between">
              <span>80-85% usage:</span>
              <Badge className="bg-yellow-600/20 text-yellow-300">1.2x cost</Badge>
            </div>
            <div className="flex justify-between">
              <span>85-90% usage:</span>
              <Badge className="bg-orange-600/20 text-orange-300">1.5x cost</Badge>
            </div>
            <div className="flex justify-between">
              <span>90%+ usage:</span>
              <Badge className="bg-red-600/20 text-red-300">2x cost</Badge>
            </div>
          </div>
        </div>

        {/* Heavy Model Restrictions */}
        <div className="bg-slate-700/50 rounded p-3 space-y-2">
          <h4 className="text-sm font-semibold text-white">Heavy Model Restrictions</h4>
          <div className="space-y-1 text-xs text-purple-300">
            <p>Free tier cannot access:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>GPT-5</li>
              <li>Claude Mythos</li>
              <li>Grok</li>
              <li>Gemini 3</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
