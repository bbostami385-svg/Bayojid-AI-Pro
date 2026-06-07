import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Users, Zap, BarChart3, Filter } from "lucide-react";

interface PolicyViolation {
  userId: string;
  userName: string;
  modelUsed: string;
  violationType: "gpt5_overuse" | "safe_zone_exceeded" | "daily_limit_exceeded";
  violationCount: number;
  lastViolation: Date;
  severity: "low" | "medium" | "high" | "critical";
  action: "warning" | "restricted" | "suspended";
}

interface ModelUsagePattern {
  modelId: string;
  modelName: string;
  totalRequests: number;
  averageCostPerRequest: number;
  totalCostThisMonth: number;
  usagePercentage: number;
  trend: "up" | "down" | "stable";
}

export function AdminPolicyDashboard() {
  const [violations, setViolations] = useState<PolicyViolation[]>([
    {
      userId: "user_123",
      userName: "John Doe",
      modelUsed: "GPT-5",
      violationType: "gpt5_overuse",
      violationCount: 3,
      lastViolation: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: "high",
      action: "warning",
    },
    {
      userId: "user_456",
      userName: "Jane Smith",
      modelUsed: "Claude Mythos",
      violationType: "safe_zone_exceeded",
      violationCount: 1,
      lastViolation: new Date(Date.now() - 5 * 60 * 60 * 1000),
      severity: "medium",
      action: "warning",
    },
  ]);

  const [modelPatterns, setModelPatterns] = useState<ModelUsagePattern[]>([
    {
      modelId: "gpt5",
      modelName: "GPT-5",
      totalRequests: 1250,
      averageCostPerRequest: 50,
      totalCostThisMonth: 62500,
      usagePercentage: 35,
      trend: "up",
    },
    {
      modelId: "claude",
      modelName: "Claude Mythos",
      totalRequests: 980,
      averageCostPerRequest: 40,
      totalCostThisMonth: 39200,
      usagePercentage: 28,
      trend: "stable",
    },
    {
      modelId: "gemini",
      modelName: "Gemini Flash",
      totalRequests: 2100,
      averageCostPerRequest: 15,
      totalCostThisMonth: 31500,
      usagePercentage: 60,
      trend: "down",
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<"all" | "gpt5" | "safe_zone" | "daily">("all");

  const filteredViolations = violations.filter((v) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "gpt5") return v.violationType === "gpt5_overuse";
    if (selectedFilter === "safe_zone") return v.violationType === "safe_zone_exceeded";
    if (selectedFilter === "daily") return v.violationType === "daily_limit_exceeded";
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "📈";
    if (trend === "down") return "📉";
    return "➡️";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-8 h-8" />
          Policy Monitoring Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor fair usage policy violations and model usage patterns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Violations</p>
              <p className="text-2xl font-bold">{violations.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
              <p className="text-2xl font-bold">
                {violations.filter((v) => v.severity === "critical").length}
              </p>
            </div>
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Affected Users</p>
              <p className="text-2xl font-bold">
                {new Set(violations.map((v) => v.userId)).size}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Models Monitored</p>
              <p className="text-2xl font-bold">{modelPatterns.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Violations Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Policy Violations
          </h2>
          <div className="flex gap-2">
            {["all", "gpt5", "safe_zone", "daily"].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter as any)}
              >
                {filter === "all" && "All"}
                {filter === "gpt5" && "GPT-5 Overuse"}
                {filter === "safe_zone" && "Safe Zone"}
                {filter === "daily" && "Daily Limit"}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredViolations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No violations found</p>
          ) : (
            filteredViolations.map((violation) => (
              <div
                key={`${violation.userId}-${violation.lastViolation.getTime()}`}
                className="border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{violation.userName}</span>
                      <Badge variant="outline" className="text-xs">
                        {violation.userId}
                      </Badge>
                      <Badge className={`text-xs ${getSeverityColor(violation.severity)}`}>
                        {violation.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Model: <span className="font-medium">{violation.modelUsed}</span>
                      {" • "}
                      Violation Type:{" "}
                      <span className="font-medium">
                        {violation.violationType === "gpt5_overuse" && "GPT-5 Overuse"}
                        {violation.violationType === "safe_zone_exceeded" && "Safe Zone Exceeded"}
                        {violation.violationType === "daily_limit_exceeded" && "Daily Limit Exceeded"}
                      </span>
                      {" • "}
                      Count: <span className="font-medium">{violation.violationCount}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last violation: {violation.lastViolation.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {violation.action === "warning" && "⚠️ Warning"}
                      {violation.action === "restricted" && "🚫 Restricted"}
                      {violation.action === "suspended" && "⛔ Suspended"}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Model Usage Patterns */}
      <Card className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          Model Usage Patterns
        </h2>

        <div className="space-y-4">
          {modelPatterns.map((pattern) => (
            <div key={pattern.modelId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{pattern.modelName}</span>
                  <span className="text-2xl">{getTrendIcon(pattern.trend)}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${pattern.totalCostThisMonth.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Requests: {pattern.totalRequests.toLocaleString()}</span>
                  <span className="text-muted-foreground">
                    Avg: ${pattern.averageCostPerRequest}/request
                  </span>
                </div>

                {/* Usage Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                    style={{ width: `${Math.min(pattern.usagePercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pattern.usagePercentage}% of monthly allocation</span>
                  <span>{100 - pattern.usagePercentage}% remaining</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fair Usage Policy Summary */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-3">Fair Usage Policy Summary</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">GPT-5 Restriction:</span> Max 20-30% usage per tier with 2x cost multiplier
          </p>
          <p>
            <span className="font-medium">Safe Zone:</span> Free: 2K/month, Pro: 20K/month, Premium: 40K-70K/month
          </p>
          <p>
            <span className="font-medium">Daily Limits:</span> Free: 100, Pro: 1000, Premium: 5000 credits
          </p>
          <p>
            <span className="font-medium">Enforcement:</span> Warnings at 80%, Restrictions at 100%, Suspension at 120%
          </p>
        </div>
      </Card>
    </div>
  );
}

export default AdminPolicyDashboard;
