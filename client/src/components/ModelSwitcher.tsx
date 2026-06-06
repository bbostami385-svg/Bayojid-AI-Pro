import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Check, AlertCircle, Lock } from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  configured: boolean;
  costPerMillion?: number;
}

interface ModelSwitcherProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  availableModels: AIModel[];
  userTier: "free" | "starter" | "premium" | "enterprise";
  isLoading?: boolean;
}

export default function ModelSwitcher({
  selectedModel,
  onModelChange,
  availableModels,
  userTier,
  isLoading = false,
}: ModelSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredModels, setFilteredModels] = useState<AIModel[]>(availableModels);

  useEffect(() => {
    setFilteredModels(availableModels);
  }, [availableModels]);

  const currentModel = availableModels.find((m) => m.id === selectedModel);

  const getModelEmoji = (modelId: string): string => {
    const emojiMap: Record<string, string> = {
      "gemini-flash": "🎨",
      deepseek: "🔍",
      qwen: "💻",
      "gpt-mini": "⚡",
      "gpt-5": "🤖",
      "claude-mythos": "🧠",
      grok: "⚡",
      "gemini-3": "🎨",
      perplexity: "🔍",
      "manus-ai": "🌟",
    };
    return emojiMap[modelId] || "🤖";
  };

  const getModelTier = (modelId: string): "free" | "premium" => {
    const freeModels = ["gemini-flash", "deepseek", "qwen", "gpt-mini"];
    return freeModels.includes(modelId) ? "free" : "premium";
  };

  const handleModelSelect = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    if (model && model.configured) {
      onModelChange(modelId);
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full">
      {/* Model Switcher Button */}
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 justify-between"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{getModelEmoji(selectedModel)}</span>
            <div className="text-left">
              <p className="text-sm font-semibold">{currentModel?.name || "Select Model"}</p>
              <p className="text-xs opacity-80">{currentModel?.provider || "No model selected"}</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <Card className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-purple-500/30 z-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white">Select AI Model</CardTitle>
              <CardDescription className="text-xs text-purple-300">
                Choose from {availableModels.length} available models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {/* Free Tier Models */}
              {availableModels.some((m) => getModelTier(m.id) === "free") && (
                <div>
                  <p className="text-xs text-green-300 font-semibold mb-2">FREE TIER</p>
                  {availableModels
                    .filter((m) => getModelTier(m.id) === "free")
                    .map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all border mb-2 ${
                          selectedModel === model.id
                            ? "bg-purple-600/30 border-purple-500 shadow-lg shadow-purple-500/20"
                            : "bg-slate-700/50 border-purple-500/20 hover:bg-slate-700 hover:border-purple-500/40"
                        } ${!model.configured ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        disabled={!model.configured}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{getModelEmoji(model.id)}</span>
                            <div>
                              <p className="text-sm font-semibold text-white">{model.name}</p>
                              <p className="text-xs text-purple-300">{model.provider}</p>
                            </div>
                          </div>
                          {selectedModel === model.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : !model.configured ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          ) : null}
                        </div>
                        {model.capabilities && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {model.capabilities.slice(0, 2).map((cap) => (
                              <Badge key={cap} className="text-xs bg-green-600/20 text-green-300 border-green-500/30">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {!model.configured && (
                          <p className="text-xs text-red-300 mt-1">API key not configured</p>
                        )}
                      </button>
                    ))}
                </div>
              )}

              {/* Premium Tier Models */}
              {availableModels.some((m) => getModelTier(m.id) === "premium") && (
                <div>
                  <p className="text-xs text-yellow-300 font-semibold mb-2 mt-4">PREMIUM TIER</p>
                  {availableModels
                    .filter((m) => getModelTier(m.id) === "premium")
                    .map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all border mb-2 ${
                          selectedModel === model.id
                            ? "bg-purple-600/30 border-purple-500 shadow-lg shadow-purple-500/20"
                            : "bg-slate-700/50 border-purple-500/20 hover:bg-slate-700 hover:border-purple-500/40"
                        } ${!model.configured ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        disabled={!model.configured}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{getModelEmoji(model.id)}</span>
                            <div>
                              <p className="text-sm font-semibold text-white">{model.name}</p>
                              <p className="text-xs text-purple-300">{model.provider}</p>
                            </div>
                          </div>
                          {selectedModel === model.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : userTier === "free" ? (
                            <Lock className="w-4 h-4 text-yellow-400" />
                          ) : !model.configured ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          ) : null}
                        </div>
                        {model.capabilities && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {model.capabilities.slice(0, 2).map((cap) => (
                              <Badge key={cap} className="text-xs bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {userTier === "free" && (
                          <p className="text-xs text-yellow-300 mt-1">Premium only - Upgrade to use</p>
                        )}
                        {!model.configured && (
                          <p className="text-xs text-red-300 mt-1">API key not configured</p>
                        )}
                      </button>
                    ))}
                </div>
              )}

              {availableModels.length === 0 && (
                <p className="text-sm text-purple-300 text-center py-4">No models available</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Model Info Card */}
      {currentModel && (
        <Card className="mt-4 bg-slate-800 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-300">Provider</span>
                <span className="text-sm font-semibold text-white">{currentModel.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-300">Tier</span>
                <Badge
                  className={`text-xs ${
                    getModelTier(currentModel.id) === "free"
                      ? "bg-green-600/20 text-green-300"
                      : "bg-yellow-600/20 text-yellow-300"
                  }`}
                >
                  {getModelTier(currentModel.id).toUpperCase()}
                </Badge>
              </div>
              {currentModel.costPerMillion !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-300">Cost</span>
                  <span className="text-sm font-semibold text-white">${currentModel.costPerMillion}/M tokens</span>
                </div>
              )}
              {currentModel.capabilities && (
                <div>
                  <p className="text-xs text-purple-300 mb-1">Capabilities</p>
                  <div className="flex gap-1 flex-wrap">
                    {currentModel.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt for Free Users */}
      {userTier === "free" && availableModels.some((m) => getModelTier(m.id) === "premium") && (
        <Card className="mt-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-200 mb-3">
              Unlock access to 6 premium AI models by upgrading to Premium tier
            </p>
            <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-sm">
              View Premium Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
