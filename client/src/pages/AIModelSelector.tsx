import { useState } from "react";
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
  accuracy: number;
  costPerRequest: number;
  isAvailable: boolean;
  isPremium: boolean;
  isFree: boolean;
  tier: "free" | "starter" | "premium" | "enterprise";
  latency: number;
  successRate: number;
  features: string[];
  useCase?: string;
}

const AI_MODELS: AIModel[] = [
  // FREE TIER MODELS
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    provider: "Google",
    logo: "🎨",
    emoji: "🎨",
    description: "Fast and efficient AI for everyday tasks",
    useCase: "Default AI",
    capabilities: ["Text Generation", "Quick Responses", "General Tasks"],
    speed: "fast",
    accuracy: 88,
    costPerRequest: 0,
    isAvailable: true,
    isPremium: false,
    isFree: true,
    tier: "free",
    latency: 800,
    successRate: 92,
    features: ["Fast Response", "Reliable", "Always Available"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    provider: "DeepSeek",
    logo: "🔍",
    emoji: "🔍",
    description: "Smart conversational AI for natural discussions",
    useCase: "Smart Chat",
    capabilities: ["Conversation", "Context Understanding", "Natural Language"],
    speed: "fast",
    accuracy: 89,
    costPerRequest: 0,
    isAvailable: true,
    isPremium: false,
    isFree: true,
    tier: "free",
    latency: 900,
    successRate: 91,
    features: ["Natural Chat", "Context Aware", "Conversational"],
  },
  {
    id: "qwen",
    name: "Qwen",
    provider: "Alibaba",
    logo: "💻",
    emoji: "💻",
    description: "Specialized in coding and long-form answers",
    useCase: "Coding + Long Answers",
    capabilities: ["Code Generation", "Long Responses", "Technical Analysis"],
    speed: "medium",
    accuracy: 91,
    costPerRequest: 0,
    isAvailable: true,
    isPremium: false,
    isFree: true,
    tier: "free",
    latency: 1200,
    successRate: 93,
    features: ["Code Expert", "Detailed Answers", "Technical Support"],
  },
  {
    id: "gpt-mini",
    name: "GPT Mini",
    provider: "OpenAI",
    logo: "⚡",
    emoji: "⚡",
    description: "Limited preview of premium GPT capabilities",
    useCase: "Limited Premium Preview",
    capabilities: ["Text Generation", "Analysis", "Problem Solving"],
    speed: "fast",
    accuracy: 90,
    costPerRequest: 0,
    isAvailable: true,
    isPremium: false,
    isFree: true,
    tier: "free",
    latency: 1000,
    successRate: 94,
    features: ["Premium Features", "Preview Access", "Limited Usage"],
  },

  // PREMIUM TIER MODELS
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    logo: "🤖",
    emoji: "🤖",
    description: "Latest GPT model with advanced reasoning",
    capabilities: ["Advanced Reasoning", "Code Analysis", "Problem Solving", "Creative Writing"],
    speed: "medium",
    accuracy: 97,
    costPerRequest: 0.05,
    isAvailable: true,
    isPremium: true,
    isFree: false,
    tier: "premium",
    latency: 2500,
    successRate: 99,
    features: ["Vision Support", "Function Calling", "JSON Mode"],
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
    costPerRequest: 0.04,
    isAvailable: true,
    isPremium: true,
    isFree: false,
    tier: "premium",
    latency: 2200,
    successRate: 98,
    features: ["Constitutional AI", "Extended Context", "Detailed Reasoning"],
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
    accuracy: 93,
    costPerRequest: 0.03,
    isAvailable: true,
    isPremium: true,
    isFree: false,
    tier: "premium",
    latency: 1800,
    successRate: 96,
    features: ["Real-time Web Access", "Sarcasm Support", "Fast Responses"],
  },
  {
    id: "gemini-3",
    name: "Gemini 3",
    provider: "Google",
    logo: "🎨",
    emoji: "🎨",
    description: "Multimodal AI with image and text understanding",
    capabilities: ["Image Analysis", "Text Generation", "Multimodal", "Code"],
    speed: "fast",
    accuracy: 94,
    costPerRequest: 0.035,
    isAvailable: true,
    isPremium: true,
    isFree: false,
    tier: "premium",
    latency: 1600,
    successRate: 95,
    features: ["Image Understanding", "Video Analysis", "Multimodal"],
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
    accuracy: 95,
    costPerRequest: 0.025,
    isAvailable: true,
    isPremium: true,
    isFree: false,
    tier: "premium",
    latency: 1500,
    successRate: 96,
    features: ["Web Search", "Source Citations", "Real-time Data"],
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
    accuracy: 92,
    costPerRequest: 0.02,
    isAvailable: true,
    isPremium: true,
    isFree: false,
    tier: "premium",
    latency: 800,
    successRate: 94,
    features: ["Custom Models", "Integrated", "Fast Response"],
  },
];

export default function AIModelSelector() {
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState("gemini-flash");
  const [filterSpeed, setFilterSpeed] = useState("all");
  const [sortBy, setSortBy] = useState("accuracy");
  const [showComparison, setShowComparison] = useState(false);

  const selectedModelData = AI_MODELS.find((m) => m.id === selectedModel);

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case "fast":
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case "medium":
        return <Eye className="w-4 h-4 text-blue-400" />;
      case "slow":
        return <Brain className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const filteredModels = AI_MODELS.filter((model) => {
    if (filterSpeed === "all") return true;
    return model.speed === filterSpeed;
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">AI Model Selector</h1>
          <p className="text-purple-300 text-lg">Choose your preferred AI model for different tasks</p>
        </div>

        {/* Selected Model Details */}
        {selectedModelData && (
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-purple-500/30 shadow-lg shadow-purple-500/10">
            <CardHeader>
              <div className="flex items-start justify-between">
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
              className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/10"
            >
              {showComparison ? "Hide Comparison" : "Compare Models"}
            </Button>
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedModels.map((model) => (
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
                {model.useCase && (
                  <p className="text-xs text-blue-300 mt-1 font-semibold">{model.useCase}</p>
                )}
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
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        model.tier === "free"
                          ? "bg-green-600/20 text-green-300"
                          : model.tier === "starter"
                            ? "bg-blue-600/20 text-blue-300"
                            : model.tier === "premium"
                              ? "bg-yellow-600/20 text-yellow-300"
                              : "bg-purple-600/20 text-purple-300"
                      }`}
                    >
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        {showComparison && (
          <Card className="bg-slate-800 border-purple-500/20">
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
                      <th className="text-center py-2 px-2 text-purple-300">Speed</th>
                      <th className="text-center py-2 px-2 text-purple-300">Success Rate</th>
                      <th className="text-center py-2 px-2 text-purple-300">Cost</th>
                      <th className="text-center py-2 px-2 text-purple-300">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedModels.map((model) => (
                      <tr key={model.id} className="border-b border-purple-500/10">
                        <td className="py-2 px-2 text-white font-semibold">{model.name}</td>
                        <td className="text-center py-2 px-2 text-white">{model.accuracy}%</td>
                        <td className="text-center py-2 px-2 text-white">{model.latency}ms</td>
                        <td className="text-center py-2 px-2 text-white">{model.successRate}%</td>
                        <td className="text-center py-2 px-2 text-white">${model.costPerRequest}</td>
                        <td className="text-center py-2 px-2">
                          <Badge
                            className={
                              model.tier === "free"
                                ? "bg-green-600/20 text-green-300"
                                : "bg-yellow-600/20 text-yellow-300"
                            }
                          >
                            {model.tier}
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
