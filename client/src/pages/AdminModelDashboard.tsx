import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Settings,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminModelDashboard() {
  const [copied, setCopied] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: modelsStatus, isLoading, refetch } = trpc.modelEnforcement.getAvailableModels.useQuery();
  const { data: upgradeOptions } = trpc.modelEnforcement.getUpgradeOptions.useQuery();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
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

  const freeModels = modelsStatus?.models.filter(
    (m) => ["gemini-flash", "deepseek", "qwen", "gpt-mini"].includes(m.id)
  ) || [];
  const premiumModels = modelsStatus?.models.filter(
    (m) => !["gemini-flash", "deepseek", "qwen", "gpt-mini"].includes(m.id)
  ) || [];

  const configuredCount = modelsStatus?.models.filter((m) => m.configured).length || 0;
  const totalCount = modelsStatus?.models.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Model Dashboard</h1>
          <p className="text-purple-300 mt-1">Manage and monitor all AI models</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-green-300">Configured Models</p>
              <p className="text-3xl font-bold text-green-200">
                {configuredCount}/{totalCount}
              </p>
              <p className="text-xs text-green-300/70">Ready to use</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-blue-300">Free Tier Models</p>
              <p className="text-3xl font-bold text-blue-200">{freeModels.length}</p>
              <p className="text-xs text-blue-300/70">Available for all users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-yellow-300">Premium Models</p>
              <p className="text-3xl font-bold text-yellow-200">{premiumModels.length}</p>
              <p className="text-xs text-yellow-300/70">Paid tier only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-700/50 border-purple-500/20">
          <TabsTrigger value="all">All Models ({totalCount})</TabsTrigger>
          <TabsTrigger value="free">Free Tier ({freeModels.length})</TabsTrigger>
          <TabsTrigger value="premium">Premium Tier ({premiumModels.length})</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {modelsStatus?.models.map((model) => (
              <Card key={model.id} className="bg-slate-800 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                        <Badge
                          className={model.configured ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"}
                        >
                          {model.configured ? "Configured" : "Not Configured"}
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-300 mb-3">{model.provider}</p>
                      <div className="flex gap-2 flex-wrap">
                        {model.capabilities.slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs border-purple-500/30">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-xs text-purple-300">Cost</p>
                        <p className="text-sm font-semibold text-white">${model.costPerMillion}/M</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-300">Max Tokens</p>
                        <p className="text-sm font-semibold text-white">{model.maxTokens.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="free" className="space-y-4">
          <Alert className="bg-green-600/20 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              These models are available to all users on the Free tier
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 gap-4">
            {freeModels.map((model) => (
              <Card key={model.id} className="bg-slate-800 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                      <p className="text-sm text-purple-300">{model.provider}</p>
                    </div>
                    <Badge className="bg-green-600/20 text-green-300">Free</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          <Alert className="bg-yellow-600/20 border-yellow-500/30">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              These models are only available to Premium tier users
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 gap-4">
            {premiumModels.map((model) => (
              <Card key={model.id} className="bg-slate-800 border-yellow-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                      <p className="text-sm text-purple-300">{model.provider}</p>
                    </div>
                    <Badge className="bg-yellow-600/20 text-yellow-300">Premium</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Alert className="bg-blue-600/20 border-blue-500/30">
            <Settings className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              Add API keys to environment variables to configure models
            </AlertDescription>
          </Alert>

          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Environment Variables</CardTitle>
              <CardDescription className="text-purple-300">Add these to your .env file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {modelsStatus?.models.map((model) => {
                const envKey = model.id.toUpperCase().replace(/-/g, "_") + "_API_KEY";
                return (
                  <div
                    key={model.id}
                    className="bg-slate-700/50 rounded p-3 flex items-center justify-between border border-purple-500/20"
                  >
                    <div>
                      <p className="text-sm font-mono text-purple-300">{envKey}</p>
                      <p className="text-xs text-purple-400">{model.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(envKey, model.id)}
                      className="text-purple-300 hover:text-purple-200"
                    >
                      {copied === model.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {upgradeOptions && (
        <Card className="bg-slate-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Tier Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-2 text-purple-300">Feature</th>
                    {Object.entries(upgradeOptions.tiers).map(([tier, config]: any) => (
                      <th key={tier} className="text-left py-2 text-purple-300">
                        {config.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-purple-500/20">
                    <td className="py-2 text-white">Price</td>
                    {Object.entries(upgradeOptions.tiers).map(([tier, config]: any) => (
                      <td key={tier} className="py-2 text-purple-300">
                        ${config.price}/month
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-purple-500/20">
                    <td className="py-2 text-white">Video Minutes</td>
                    {Object.entries(upgradeOptions.tiers).map(([tier, config]: any) => (
                      <td key={tier} className="py-2 text-purple-300">
                        {config.videoMinutes === Infinity ? "Unlimited" : config.videoMinutes}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-white">Image Generations</td>
                    {Object.entries(upgradeOptions.tiers).map(([tier, config]: any) => (
                      <td key={tier} className="py-2 text-purple-300">
                        {config.imageGenerations === Infinity ? "Unlimited" : config.imageGenerations}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
