import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Brain, Search, Eye, Sparkles } from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  logo: string;
  emoji: string;
  description: string;
  capabilities: string[];
  speed: "fast" | "medium" | "slow";
  accuracy: number; // 0-100
  costPerRequest: number;
  isAvailable: boolean;
  isPremium: boolean;
  latency: number; // ms
  successRate: number; // 0-100
  features: string[];
}

const AI_MODELS: AIModel[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    logo: "🤖",
    emoji: "🤖",
    description: "Advanced reasoning and language understanding",
    capabilities: ["Text Generation", "Code Analysis", "Problem Solving", "Creative Writing"],
    speed: "medium",
    accuracy: 95,
    costPerRequest: 0.03,
    isAvailable: true,
    isPremium: true,
    latency: 2500,
    successRate: 98,
    features: ["Vision Support", "Function Calling", "JSON Mode"],
  },
  {
    id: "grok",
    name: "Grok",
    provider: "xAI",
    logo: "⚡",
    emoji: "⚡",
    description: "Real-time information and witty responses",
    capabilities: ["Real-time Data", "Reasoning", "Humor", "Current Events"],
    speed: "fast",
    accuracy: 92,
    costPerRequest: 0.02,
    isAvailable: true,
    isPremium: true,
    latency: 1800,
    successRate: 96,
    features: ["Real-time Web Access", "Sarcasm Support", "Fast Responses"],
  },
  {
    id: "claude-mythos",
    name: "Claude Mythos",
    provider: "Anthropic",
    logo: "🧠",
    emoji: "🧠",
    description: "Constitutional AI with strong safety and reasoning",
    capabilities: ["Analysis", "Writing", "Research", "Safety-Focused"],
    speed: "medium",
    accuracy: 96,
    costPerRequest: 0.025,
    isAvailable: true,
    isPremium: true,
    latency: 2200,
    successRate: 97,
    features: ["Constitutional AI", "Extended Context", "Detailed Reasoning"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    provider: "Perplexity AI",
    logo: "🔍",
    emoji: "🔍",
    description: "Search-powered AI with verified sources",
    capabilities: ["Research", "Fact-Checking", "Source Citation", "Web Search"],
    speed: "fast",
    accuracy: 94,
    costPerRequest: 0.015,
    isAvailable: true,
    isPremium: false,
    latency: 1500,
    successRate: 95,
    features: ["Web Search", "Source Citations", "Real-time Data"],
  },
  {
    id: "gemini",
    name: "Gemini 3",
    provider: "Google",
    logo: "🎨",
    emoji: "🎨",
    description: "Multimodal AI with image and text understanding",
    capabilities: ["Image Analysis", "Text Generation", "Multimodal", "Code"],
    speed: "fast",
    accuracy: 93,
    costPerRequest: 0.02,
    isAvailable: true,
    isPremium: true,
    isFree: false,
    tier: "premium",
    latency: 1600,
    successRate: 94,
    features: ["Image Understanding", "Video Analysis", "Multimodal"],
  },
  {
    id: "manus-ai",
    name: "Manus AI",
    provider: "Manus",
    logo: "🌟",
    emoji: "🌟",
    description: "Optimized for your platform with custom capabilities",
    capabilities: ["Custom Training", "Fast Response", "Cost-Effective", "Integrated"],
    speed: "fast",
    accuracy: 91,
    costPerRequest: 0.01,
    isAvailable: true,
    isPremium: false,
    isFree: true,
    tier: "free",
    latency: 800,
    successRate: 93,
    features: ["Custom Models", "Always Free", "Fastest Response"],
  },
];

export default function AIModelSelector() {
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState<string>("manus-ai");
  const [models, setModels] = useState<AIModel[]>(AI_MODELS);
  const [filterSpeed, setFilterSpeed] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("accuracy");
  const [showComparison, setShowComparison] = useState(false);

  // Filter and sort models
  useEffect(() => {
    let filtered = [...AI_MODELS];

    if (filterSpeed !== "all") {
      filtered = filtered.filter((m) => m.speed === filterSpeed);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "accuracy":
          return b.accuracy - a.accuracy;
        case "speed":
          return a.latency - b.latency;
        case "cost":
          return a.costPerRequest - b.costPerRequest;
        case "successRate":
          return b.successRate - a.successRate;
        default:
          return 0;
      }
    });

    setModels(filtered);
  }, [filterSpeed, sortBy]);

  const selectedModelData = AI_MODELS.find((m) => m.id === selectedModel);
  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case "fast":
        return <Zap className="w-4 h-4 text-green-400" />;
      case "medium":
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case "slow":
        return <Zap className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Model Selector</h1>
          <p className="text-purple-200">Choose the perfect AI model for your needs</p>
        </div>

        {/* Currently Selected Model */}
        {selectedModelData && (
          <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedModelData.emoji}</div>
                  <div>
                    <CardTitle className="text-white text-2xl">{selectedModelData.name}</CardTitle>
                    <CardDescription className="text-purple-300">
                      {selectedModelData.provider} • {selectedModelData.description}
                    </CardDescription>
                  </div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Accuracy</p>
                  <p className="text-2xl font-bold text-white">{selectedModelData.accuracy}%</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Latency</p>
                  <p className="text-2xl font-bold text-white">{selectedModelData.latency}ms</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{selectedModelData.successRate}%</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Cost/Request</p>
                  <p className="text-2xl font-bold text-white">${selectedModelData.costPerRequest}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-purple-300 mb-2">Key Features:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedModelData.features.map((feature) => (
                    <Badge key={feature} className="bg-purple-600/30 text-purple-200 border-purple-500/30">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Use {selectedModelData.name} for Chat
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters and Sorting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm text-purple-300 mb-2">Filter by Speed</label>
            <select
              value={filterSpeed}
              onChange={(e) => setFilterSpeed(e.target.value)}
              className="w-full bg-slate-800 border border-purple-500/30 text-white rounded-lg p-2"
            >
              <option value="all">All Speeds</option>
              <option value="fast">Fast ⚡</option>
              <option value="medium">Medium 🔄</option>
              <option value="slow">Slow 🐢</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-purple-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-800 border border-purple-500/30 text-white rounded-lg p-2"
            >
              <option value="accuracy">Accuracy</option>
              <option value="speed">Speed (Latency)</option>
              <option value="cost">Cost</option>
              <option value="successRate">Success Rate</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setShowComparison(!showComparison)}
              variant="outline"
              className="w-full border-purple-500/30 text-purple-200"
            >
              {showComparison ? "Hide Comparison" : "Compare Models"}
            </Button>
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card
              key={model.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedModel === model.id
                  ? "bg-slate-800 border-purple-500 shadow-lg shadow-purple-500/20"
                  : "bg-slate-800 border-purple-500/20 hover:border-purple-500/40"
              }`}
              onClick={() => setSelectedModel(model.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-5xl">{model.emoji}</div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {model.isFree && (
                      <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                        <Zap className="w-3 h-3 mr-1" />
                        Free
                      </Badge>
                    )}
                    {model.isPremium && (
                      <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-white mt-2">{model.name}</CardTitle>
                <CardDescription className="text-purple-300">{model.provider}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-purple-200">{model.description}</p>

                {/* Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-300">Accuracy</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${model.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white font-semibold">{model.accuracy}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-300">Speed</span>
                    <div className="flex items-center gap-2">
                      {getSpeedIcon(model.speed)}
                      <span className="text-xs text-white capitalize">{model.speed}</span>
                      <span className="text-xs text-purple-300">({model.latency}ms)</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-300">Success Rate</span>
                    <span className="text-xs text-white font-semibold">{model.successRate}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-300">Cost</span>
                    <span className="text-xs text-white font-semibold">${model.costPerRequest}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-300">Tier</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      model.tier === 'free' ? 'bg-green-600/20 text-green-300' :
                      model.tier === 'starter' ? 'bg-blue-600/20 text-blue-300' :
                      model.tier === 'premium' ? 'bg-yellow-600/20 text-yellow-300' :
                      'bg-purple-600/20 text-purple-300'
                    }`}>
                      {model.tier.charAt(0).toUpperCase() + model.tier.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <p className="text-xs text-purple-300 mb-2">Capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.slice(0, 3).map((cap) => (
                      <Badge key={cap} variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {model.capabilities.length > 3 && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                        +{model.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="pt-2 border-t border-purple-500/20">
                  {model.isAvailable ? (
                    <Badge className="w-full justify-center bg-green-600/20 text-green-400 border-green-500/30">
                      ✓ Available
                    </Badge>
                  ) : (
                    <Badge className="w-full justify-center bg-red-600/20 text-red-400 border-red-500/30">
                      ✗ Unavailable
                    </Badge>
                  )}
                </div>

                {/* Select Button */}
                <Button
                  className={`w-full ${
                    selectedModel === model.id
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      : "border-purple-500/30 text-purple-200"
                  }`}
                  variant={selectedModel === model.id ? "default" : "outline"}
                >
                  {selectedModel === model.id ? "✓ Selected" : "Select"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        {showComparison && (
          <Card className="bg-slate-800 border-purple-500/20 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Model Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/20">
                      <th className="text-left py-2 px-2 text-purple-300">Model</th>
                      <th className="text-center py-2 px-2 text-purple-300">Accuracy</th>
                      <th className="text-center py-2 px-2 text-purple-300">Latency</th>
                      <th className="text-center py-2 px-2 text-purple-300">Success Rate</th>
                      <th className="text-center py-2 px-2 text-purple-300">Cost</th>
                      <th className="text-center py-2 px-2 text-purple-300">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr key={model.id} className="border-b border-purple-500/10 hover:bg-purple-500/10">
                        <td className="py-2 px-2 text-white font-semibold">{model.emoji} {model.name}</td>
                        <td className="text-center py-2 px-2 text-purple-200">{model.accuracy}%</td>
                        <td className="text-center py-2 px-2 text-purple-200">{model.latency}ms</td>
                        <td className="text-center py-2 px-2 text-purple-200">{model.successRate}%</td>
                        <td className="text-center py-2 px-2 text-purple-200">${model.costPerRequest}</td>
                        <td className="text-center py-2 px-2">
                          <Badge
                            variant="outline"
                            className={`border-purple-500/30 ${
                              model.isPremium ? "text-yellow-300" : "text-green-300"
                            }`}
                          >
                            {model.isPremium ? "Premium" : "Free"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
