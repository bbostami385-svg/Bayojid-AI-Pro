/**
 * AI Integration Framework
 * Handles API key management and routing for multiple AI models
 * API keys are injected via environment variables
 */

import { invokeLLM } from "./_core/llm";

// AI Model Configuration with environment variable placeholders
export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  envKey: string; // Environment variable name for API key
  apiEndpoint: string;
  isConfigured: boolean;
  capabilities: string[];
  maxTokens: number;
  costPerMillion: number;
}

// Supported AI Models Configuration
export const AI_MODELS_CONFIG: Record<string, AIModelConfig> = {
  "gpt-4": {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    envKey: "OPENAI_API_KEY",
    apiEndpoint: "https://api.openai.com/v1",
    isConfigured: !!process.env.OPENAI_API_KEY,
    capabilities: ["text", "vision", "code", "reasoning"],
    maxTokens: 8192,
    costPerMillion: 30,
  },
  "gpt-5": {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    envKey: "GPT5_API_KEY",
    apiEndpoint: "https://api.openai.com/v1",
    isConfigured: !!process.env.GPT5_API_KEY,
    capabilities: ["text", "vision", "code", "reasoning", "advanced_reasoning"],
    maxTokens: 16384,
    costPerMillion: 50,
  },
  "claude-mythos": {
    id: "claude-mythos",
    name: "Claude Mythos",
    provider: "Anthropic",
    envKey: "CLAUDE_MYTHOS_API_KEY",
    apiEndpoint: "https://api.anthropic.com/v1",
    isConfigured: !!process.env.CLAUDE_MYTHOS_API_KEY,
    capabilities: ["text", "analysis", "reasoning", "safety"],
    maxTokens: 100000,
    costPerMillion: 25,
  },
  "grok": {
    id: "grok",
    name: "Grok",
    provider: "xAI",
    envKey: "GROK_API_KEY",
    apiEndpoint: "https://api.x.ai/v1",
    isConfigured: !!process.env.GROK_API_KEY,
    capabilities: ["text", "reasoning", "real-time", "humor"],
    maxTokens: 8000,
    costPerMillion: 20,
  },
  "gemini-3": {
    id: "gemini-3",
    name: "Gemini 3",
    provider: "Google",
    envKey: "GEMINI_API_KEY",
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta",
    isConfigured: !!process.env.GEMINI_API_KEY,
    capabilities: ["text", "vision", "multimodal", "code"],
    maxTokens: 32000,
    costPerMillion: 15,
  },
  "perplexity": {
    id: "perplexity",
    name: "Perplexity",
    provider: "Perplexity AI",
    envKey: "PERPLEXITY_API_KEY",
    apiEndpoint: "https://api.perplexity.ai",
    isConfigured: !!process.env.PERPLEXITY_API_KEY,
    capabilities: ["text", "search", "research", "citations"],
    maxTokens: 4096,
    costPerMillion: 10,
  },
  "manus-ai": {
    id: "manus-ai",
    name: "Manus AI",
    provider: "Manus",
    envKey: "BUILT_IN_FORGE_API_KEY",
    apiEndpoint: process.env.BUILT_IN_FORGE_API_URL || "https://api.manus.im",
    isConfigured: !!process.env.BUILT_IN_FORGE_API_KEY,
    capabilities: ["text", "vision", "code", "custom"],
    maxTokens: 8000,
    costPerMillion: 5,
  },
  "gpt-5-mini": {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "OpenAI",
    envKey: "GPT5_MINI_API_KEY",
    apiEndpoint: "https://api.openai.com/v1",
    isConfigured: !!process.env.GPT5_MINI_API_KEY,
    capabilities: ["text", "code", "reasoning"],
    maxTokens: 4096,
    costPerMillion: 5,
  },
  "gemini-flash": {
    id: "gemini-flash",
    name: "Gemini Flash",
    provider: "Google",
    envKey: "GEMINI_FLASH_API_KEY",
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta",
    isConfigured: !!process.env.GEMINI_FLASH_API_KEY,
    capabilities: ["text", "vision", "fast"],
    maxTokens: 8000,
    costPerMillion: 3,
  },
  "deepseek": {
    id: "deepseek",
    name: "DeepSeek",
    provider: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    apiEndpoint: "https://api.deepseek.com/v1",
    isConfigured: !!process.env.DEEPSEEK_API_KEY,
    capabilities: ["text", "code", "reasoning", "math"],
    maxTokens: 4096,
    costPerMillion: 2,
  },
};

/**
 * Get configured AI models (only those with API keys)
 */
export function getConfiguredModels(): AIModelConfig[] {
  return Object.values(AI_MODELS_CONFIG).filter((model) => model.isConfigured);
}

/**
 * Get all available models (configured or not)
 */
export function getAllAvailableModels(): AIModelConfig[] {
  return Object.values(AI_MODELS_CONFIG);
}

/**
 * Check if a specific model is configured
 */
export function isModelConfigured(modelId: string): boolean {
  const model = AI_MODELS_CONFIG[modelId];
  return model ? model.isConfigured : false;
}

/**
 * Get API key for a model
 */
export function getModelApiKey(modelId: string): string | undefined {
  const model = AI_MODELS_CONFIG[modelId];
  if (!model) return undefined;
  return process.env[model.envKey];
}

/**
 * Call AI model with automatic fallback
 */
export async function callAIModel(
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  }
) {
  const model = AI_MODELS_CONFIG[modelId];

  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }

  if (!model.isConfigured) {
    throw new Error(`Model ${modelId} is not configured. Please add ${model.envKey} to environment variables.`);
  }

  try {
    // Use Manus built-in LLM helper for all models
    const response = await invokeLLM({
      messages: messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      })),
      // Model selection will be handled by the LLM service
    });

    return {
      success: true,
      modelId,
      modelName: model.name,
      response: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error(`Error calling model ${modelId}:`, error);
    throw error;
  }
}

/**
 * Get model recommendations based on use case
 */
export function getModelRecommendations(useCase: string): AIModelConfig[] {
  const recommendations: Record<string, string[]> = {
    writing: ["claude-mythos", "gpt-5", "gpt-5-mini"],
    coding: ["gpt-5", "gpt-5-mini", "deepseek"],
    analysis: ["gpt-5", "claude-mythos", "perplexity"],
    creative: ["gpt-4", "claude-mythos", "grok"],
    research: ["perplexity", "gpt-5", "claude-mythos"],
    realtime: ["gemini-flash", "grok", "perplexity"],
    multimodal: ["gemini-3", "gemini-flash", "gpt-4"],
    free: ["gemini-flash", "gpt-5-mini", "deepseek", "manus-ai"],
    default: ["manus-ai", "gpt-5-mini", "gemini-flash"],
  };

  const recommendedIds = recommendations[useCase] || recommendations.default;
  return recommendedIds
    .map((id) => AI_MODELS_CONFIG[id])
    .filter((model) => model !== undefined) as AIModelConfig[];
}

/**
 * Calculate cost for API call
 */
export function calculateCost(modelId: string, tokens: number): number {
  const model = AI_MODELS_CONFIG[modelId];
  if (!model) return 0;
  return (tokens / 1000000) * model.costPerMillion;
}

/**
 * Get model status and health
 */
export async function getModelStatus(modelId: string) {
  const model = AI_MODELS_CONFIG[modelId];

  if (!model) {
    return {
      modelId,
      status: "not_found",
      configured: false,
      message: "Model not found",
    };
  }

  return {
    modelId,
    name: model.name,
    provider: model.provider,
    status: model.isConfigured ? "ready" : "not_configured",
    configured: model.isConfigured,
    capabilities: model.capabilities,
    maxTokens: model.maxTokens,
    costPerMillion: model.costPerMillion,
    envKey: model.envKey,
    message: model.isConfigured ? "Ready to use" : `Missing API key: ${model.envKey}`,
  };
}

/**
 * Get all models status
 */
export async function getAllModelsStatus() {
  const models = Object.values(AI_MODELS_CONFIG);
  return Promise.all(models.map((model) => getModelStatus(model.id)));
}

/**
 * Format model info for display
 */
export function formatModelInfo(modelId: string): string {
  const model = AI_MODELS_CONFIG[modelId];
  if (!model) return "Unknown model";

  const status = model.isConfigured ? "✓ Ready" : "✗ Not configured";
  return `${model.name} (${model.provider}) - ${status}`;
}

export default {
  AI_MODELS_CONFIG,
  getConfiguredModels,
  getAllAvailableModels,
  isModelConfigured,
  getModelApiKey,
  callAIModel,
  getModelRecommendations,
  calculateCost,
  getModelStatus,
  getAllModelsStatus,
  formatModelInfo,
};
