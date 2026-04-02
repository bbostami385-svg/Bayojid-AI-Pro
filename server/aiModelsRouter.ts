import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  AIModelManager,
  AIModelPerformanceTracker,
  AIMessage,
  AIModel,
} from "./aiModelIntegration";
import { BestModelSelector } from "./bestModelSelector";

/**
 * AI মডেল রুটার - tRPC ইন্টিগ্রেশন
 * ChatGPT, Gemini, Claude, Perplexity, Grok সাপোর্ট
 */

// গ্লোবাল AI মডেল ম্যানেজার এবং পারফরম্যান্স ট্র্যাকার
let aiModelManager: AIModelManager | null = null;
const performanceTracker = new AIModelPerformanceTracker();
let bestModelSelector: BestModelSelector | null = null;

/**
 * AI মডেল ম্যানেজার ইনিশিয়ালাইজ করুন
 */
function initializeAIModelManager() {
  if (!aiModelManager) {
    const configs: Partial<Record<AIModel, string>> = {};

    // পরিবেশ ভেরিয়েবল থেকে API কী পান
    if (process.env.OPENAI_API_KEY) {
      configs.chatgpt = process.env.OPENAI_API_KEY;
    }
    if (process.env.GOOGLE_GEMINI_API_KEY) {
      configs.gemini = process.env.GOOGLE_GEMINI_API_KEY;
    }
    if (process.env.CLAUDE_API_KEY) {
      configs.claude = process.env.CLAUDE_API_KEY;
    }
    if (process.env.PERPLEXITY_API_KEY) {
      configs.perplexity = process.env.PERPLEXITY_API_KEY;
    }
    if (process.env.GROK_API_KEY) {
      configs.grok = process.env.GROK_API_KEY;
    }

    aiModelManager = new AIModelManager(configs);
  }

  return aiModelManager;
}

export const aiModelsRouter = router({
  /**
   * উপলব্ধ AI মডেল পান
   */
  getAvailableModels: publicProcedure.query(() => {
    const manager = initializeAIModelManager();
    const models = manager.getAvailableModels();

    return models.map(model => ({
      id: model,
      name: getModelName(model),
      description: getModelDescription(model),
      icon: getModelIcon(model),
      configured: true
    }));
  }),

  /**
   * সক্রিয় AI মডেল পান
   */
  getActiveModel: publicProcedure.query(() => {
    const manager = initializeAIModelManager();
    const activeModel = manager.getActiveModel();

    return {
      id: activeModel,
      name: getModelName(activeModel),
      description: getModelDescription(activeModel),
      icon: getModelIcon(activeModel)
    };
  }),

  /**
   * সক্রিয় AI মডেল সেট করুন
   */
  setActiveModel: protectedProcedure
    .input(z.object({ model: z.enum(['chatgpt', 'gemini', 'claude', 'perplexity', 'grok']) }))
    .mutation(({ input }) => {
      const manager = initializeAIModelManager();
      const success = manager.setActiveModel(input.model);

      if (!success) {
        throw new Error(`মডেল ${input.model} কনফিগার করা নেই`);
      }

      return {
        success: true,
        activeModel: input.model,
        message: `${getModelName(input.model)} সক্রিয় করা হয়েছে`
      };
    }),

  /**
   * AI মডেল দিয়ে চ্যাট করুন
   */
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string()
          })
        ),
        model: z.enum(['chatgpt', 'gemini', 'claude', 'perplexity', 'grok']).optional(),
        maxTokens: z.number().optional(),
        temperature: z.number().optional()
      })
    )
    .mutation(async ({ input }) => {
      const manager = initializeAIModelManager();

      // যদি নির্দিষ্ট মডেল দেওয়া হয়, সেটি সেট করুন
      if (input.model) {
        manager.setActiveModel(input.model);
      }

      const response = await manager.chat(
        input.messages as AIMessage[],
        {
          maxTokens: input.maxTokens,
          temperature: input.temperature
        }
      );

      // পারফরম্যান্স ট্র্যাক করুন
      performanceTracker.trackResponse(response);

      if (response.error) {
        throw new Error(`${getModelName(response.model)} API ত্রুটি: ${response.error}`);
      }

      return {
        model: response.model,
        content: response.content,
        tokens: response.tokens,
        responseTime: response.responseTime
      };
    }),

  /**
   * একাধিক মডেল থেকে প্রতিক্রিয়া পান (তুলনা)
   */
  compareModels: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string()
          })
        ),
        models: z.array(z.enum(['chatgpt', 'gemini', 'claude', 'perplexity', 'grok'])).optional(),
        maxTokens: z.number().optional(),
        temperature: z.number().optional()
      })
    )
    .mutation(async ({ input }) => {
      const manager = initializeAIModelManager();

      const responses = await manager.chatMultiple(
        input.messages as AIMessage[],
        input.models as AIModel[] | undefined,
        {
          maxTokens: input.maxTokens,
          temperature: input.temperature
        }
      );

      // সব প্রতিক্রিয়া ট্র্যাক করুন
      responses.forEach(response => performanceTracker.trackResponse(response));

      return responses.map(response => ({
        model: response.model,
        modelName: getModelName(response.model),
        content: response.content,
        tokens: response.tokens,
        responseTime: response.responseTime,
        error: response.error
      }));
    }),

  /**
   * মডেল পারফরম্যান্স পরিসংখ্যান পান
   */
  getPerformanceStats: protectedProcedure.query(() => {
    const stats = performanceTracker.getAllStats();

    return stats.map(stat => ({
      model: stat.model,
      modelName: getModelName(stat.model),
      totalRequests: stat.totalRequests,
      averageTokens: Math.round(stat.averageTokens),
      averageResponseTime: Math.round(stat.averageResponseTime),
      errorRate: Math.round(stat.errorRate * 100) / 100
    }));
  }),

  /**
   * সেরা পারফরমিং মডেল পান
   */
  getBestPerformingModel: publicProcedure.query(() => {
    const bestModel = performanceTracker.getBestPerformingModel();

    if (!bestModel) {
      return null;
    }

    return {
      id: bestModel,
      name: getModelName(bestModel),
      description: getModelDescription(bestModel),
      icon: getModelIcon(bestModel)
    };
  }),

  /**
   * মডেল কনফিগারেশন পান
   */
  getModelConfig: protectedProcedure
    .input(z.object({ model: z.enum(['chatgpt', 'gemini', 'claude', 'perplexity', 'grok']) }))
    .query(({ input }) => {
      const manager = initializeAIModelManager();
      const models = manager.getAvailableModels();
      const isConfigured = models.includes(input.model);

      return {
        model: input.model,
        name: getModelName(input.model),
        configured: isConfigured,
        status: isConfigured ? 'ready' : 'not-configured'
      };
    }),

  /**
   * সব মডেল কনফিগারেশন পান
   */
  getAllModelConfigs: publicProcedure.query(() => {
    const manager = initializeAIModelManager();
    const models = manager.getAvailableModels();

    const allModels: AIModel[] = ['chatgpt', 'gemini', 'claude', 'perplexity', 'grok'];

    return allModels.map(model => ({
      model,
      name: getModelName(model),
      description: getModelDescription(model),
      icon: getModelIcon(model),
      configured: models.includes(model),
      status: models.includes(model) ? 'ready' : 'not-configured'
    }));
  }),

  /**
   * স্বয়ংক্রিয়ভাবে সেরা মডেল নির্বাচন করুন
   */
  selectBestModelAuto: publicProcedure
    .input(
      z.object({
        prioritizeSpeed: z.boolean().optional(),
        prioritizeAccuracy: z.boolean().optional(),
        maxErrorRate: z.number().optional(),
        maxResponseTime: z.number().optional()
      })
    )
    .query(({ input }) => {
      if (!bestModelSelector) {
        bestModelSelector = new BestModelSelector(performanceTracker);
      }

      const result = bestModelSelector.selectBestModel({
        prioritizeSpeed: input.prioritizeSpeed,
        prioritizeAccuracy: input.prioritizeAccuracy,
        maxErrorRate: input.maxErrorRate,
        maxResponseTime: input.maxResponseTime
      });

      if (!result) {
        return { model: 'chatgpt', reason: 'ডিফল্ট মডেল' };
      }

      return result;
    }),

  /**
   * মডেল র‍্যাঙ্কিং পান
   */
  getModelRanking: publicProcedure.query(() => {
    if (!bestModelSelector) {
      bestModelSelector = new BestModelSelector(performanceTracker);
    }

    return bestModelSelector.getRanking();
  }),

  /**
   * পারফরম্যান্স রিপোর্ট পান
   */
  getPerformanceReport: publicProcedure.query(() => {
    if (!bestModelSelector) {
      bestModelSelector = new BestModelSelector(performanceTracker);
    }

    return bestModelSelector.generateReport();
  }),

  /**
   * দ্রুততম মডেল পান
   */
  getFastestModel: publicProcedure.query(() => {
    if (!bestModelSelector) {
      bestModelSelector = new BestModelSelector(performanceTracker);
    }

    return bestModelSelector.getFastestModel();
  }),

  /**
   * সবচেয়ে নির্ভরযোগ্য মডেল পান
   */
  getMostReliableModel: publicProcedure.query(() => {
    if (!bestModelSelector) {
      bestModelSelector = new BestModelSelector(performanceTracker);
    }

    return bestModelSelector.getMostReliableModel();
  })
});

/**
 * সহায়ক ফাংশন - মডেলের নাম পান
 */
function getModelName(model: AIModel): string {
  const names: Record<AIModel, string> = {
    chatgpt: 'ChatGPT',
    gemini: 'Google Gemini',
    claude: 'Claude',
    perplexity: 'Perplexity',
    grok: 'Grok'
  };
  return names[model];
}

/**
 * সহায়ক ফাংশন - মডেলের বর্ণনা পান
 */
function getModelDescription(model: AIModel): string {
  const descriptions: Record<AIModel, string> = {
    chatgpt: 'OpenAI এর শক্তিশালী ভাষা মডেল',
    gemini: 'Google এর উন্নত মাল্টিমোডাল মডেল',
    claude: 'Anthropic এর নিরাপদ এবং নির্ভরযোগ্য মডেল',
    perplexity: 'রিয়েল-টাইম ওয়েব সার্চ সহ AI',
    grok: 'xAI এর বুদ্ধিমান এবং মজাদার মডেল'
  };
  return descriptions[model];
}

/**
 * সহায়ক ফাংশন - মডেলের আইকন পান
 */
function getModelIcon(model: AIModel): string {
  const icons: Record<AIModel, string> = {
    chatgpt: '🤖',
    gemini: '✨',
    claude: '🧠',
    perplexity: '🔍',
    grok: '⚡'
  };
  return icons[model];
}
