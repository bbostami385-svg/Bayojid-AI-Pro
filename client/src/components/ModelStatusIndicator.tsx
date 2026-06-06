import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";

interface ModelStatus {
  modelId: string;
  name: string;
  provider: string;
  status: "ready" | "not_configured" | "loading" | "error";
  configured: boolean;
  capabilities: string[];
  costPerMillion: number;
  maxTokens: number;
  uptime?: number; // percentage
  responseTime?: number; // ms
}

interface ModelStatusIndicatorProps {
  model: ModelStatus;
  showDetails?: boolean;
  compact?: boolean;
}

export default function ModelStatusIndicator({
  model,
  showDetails = true,
  compact = false,
}: ModelStatusIndicatorProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "loading":
        return <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
      case "error":
      case "not_configured":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-600/20 border-green-500/30 text-green-300";
      case "loading":
        return "bg-blue-600/20 border-blue-500/30 text-blue-300";
      case "error":
      case "not_configured":
        return "bg-red-600/20 border-red-500/30 text-red-300";
      default:
        return "bg-yellow-600/20 border-yellow-500/30 text-yellow-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "Ready";
      case "loading":
        return "Loading...";
      case "not_configured":
        return "Not Configured";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(model.status)}
        <span className="text-sm font-medium text-white">{model.name}</span>
        <Badge className={`text-xs ${getStatusColor(model.status)}`}>{getStatusText(model.status)}</Badge>
      </div>
    );
  }

  return (
    <Card className={`bg-slate-800 border ${getStatusColor(model.status)}`}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getStatusIcon(model.status)}
              <div>
                <p className="text-sm font-semibold text-white">{model.name}</p>
                <p className="text-xs text-purple-300">{model.provider}</p>
              </div>
            </div>
            <Badge className={`text-xs ${getStatusColor(model.status)}`}>{getStatusText(model.status)}</Badge>
          </div>

          {showDetails && (
            <>
              {/* Capabilities */}
              <div>
                <p className="text-xs text-purple-300 mb-1">Capabilities</p>
                <div className="flex gap-1 flex-wrap">
                  {model.capabilities.slice(0, 3).map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                      {cap}
                    </Badge>
                  ))}
                  {model.capabilities.length > 3 && (
                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                      +{model.capabilities.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-700/50 rounded p-2">
                  <p className="text-xs text-purple-300">Cost</p>
                  <p className="text-sm font-semibold text-white">${model.costPerMillion}/M</p>
                </div>
                <div className="bg-slate-700/50 rounded p-2">
                  <p className="text-xs text-purple-300">Max Tokens</p>
                  <p className="text-sm font-semibold text-white">{model.maxTokens.toLocaleString()}</p>
                </div>
              </div>

              {/* Uptime & Response Time */}
              {(model.uptime !== undefined || model.responseTime !== undefined) && (
                <div className="grid grid-cols-2 gap-2">
                  {model.uptime !== undefined && (
                    <div className="bg-slate-700/50 rounded p-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <p className="text-xs text-purple-300">Uptime</p>
                      </div>
                      <p className="text-sm font-semibold text-white">{model.uptime}%</p>
                    </div>
                  )}
                  {model.responseTime !== undefined && (
                    <div className="bg-slate-700/50 rounded p-2">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <p className="text-xs text-purple-300">Response</p>
                      </div>
                      <p className="text-sm font-semibold text-white">{model.responseTime}ms</p>
                    </div>
                  )}
                </div>
              )}

              {/* Configuration Status */}
              {!model.configured && (
                <div className="bg-red-600/20 border border-red-500/30 rounded p-2">
                  <p className="text-xs text-red-300">
                    ⚠️ API key not configured. Add {model.modelId.toUpperCase()}_API_KEY to environment variables.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Model Status Grid Component - Display multiple models
 */
interface ModelStatusGridProps {
  models: ModelStatus[];
  columns?: 1 | 2 | 3;
}

export function ModelStatusGrid({ models, columns = 2 }: ModelStatusGridProps) {
  return (
    <div className={`grid gap-3 grid-cols-${columns}`}>
      {models.map((model) => (
        <ModelStatusIndicator key={model.modelId} model={model} showDetails={false} compact={false} />
      ))}
    </div>
  );
}
