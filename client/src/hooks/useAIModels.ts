import { trpc } from '@/lib/trpc';
import { useCallback, useState } from 'react';

/**
 * AI মডেল চ্যাট হুক - tRPC সাথে ইন্টিগ্রেশন
 */

export type AIModel = 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | 'grok';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  model: AIModel;
  modelName: string;
  content: string;
  tokens: number;
  responseTime: number;
  error?: string;
}

export function useAIModels() {
  const [selectedModel, setSelectedModel] = useState<AIModel>('chatgpt');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // উপলব্ধ মডেল পান
  const { data: availableModels } = trpc.aiModels.getAvailableModels.useQuery();

  // সক্রিয় মডেল পান
  const { data: activeModel } = trpc.aiModels.getActiveModel.useQuery();

  // সক্রিয় মডেল সেট করুন
  const setActiveModelMutation = trpc.aiModels.setActiveModel.useMutation({
    onSuccess: (data) => {
      setSelectedModel(data.activeModel);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  // চ্যাট করুন
  const chatMutation = trpc.aiModels.chat.useMutation({
    onSuccess: () => {
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  // মডেল তুলনা করুন
  const compareModelsMutation = trpc.aiModels.compareModels.useMutation({
    onSuccess: () => {
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  // পারফরম্যান্স স্ট্যাটিস্টিক্স পান
  const { data: performanceStats } = trpc.aiModels.getPerformanceStats.useQuery();

  // সেরা পারফরমিং মডেল পান
  const { data: bestModel } = trpc.aiModels.getBestPerformingModel.useQuery();

  // সব মডেল কনফিগারেশন পান
  const { data: allConfigs } = trpc.aiModels.getAllModelConfigs.useQuery();

  /**
   * AI মডেল দিয়ে চ্যাট করুন
   */
  const chat = useCallback(
    async (
      messages: AIMessage[],
      model?: AIModel,
      options?: { maxTokens?: number; temperature?: number }
    ): Promise<AIResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await chatMutation.mutateAsync({
          messages,
          model: model || selectedModel,
          maxTokens: options?.maxTokens,
          temperature: options?.temperature
        });

        return response as AIResponse;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'অজানা ত্রুটি';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedModel, chatMutation]
  );

  /**
   * একাধিক মডেল থেকে প্রতিক্রিয়া পান
   */
  const compareModels = useCallback(
    async (
      messages: AIMessage[],
      models?: AIModel[],
      options?: { maxTokens?: number; temperature?: number }
    ): Promise<AIResponse[] | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const responses = await compareModelsMutation.mutateAsync({
          messages,
          models,
          maxTokens: options?.maxTokens,
          temperature: options?.temperature
        });

        return responses as AIResponse[];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'অজানা ত্রুটি';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [compareModelsMutation]
  );

  /**
   * সক্রিয় মডেল পরিবর্তন করুন
   */
  const switchModel = useCallback(
    async (model: AIModel) => {
      try {
        setError(null);
        await setActiveModelMutation.mutateAsync({ model });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'অজানা ত্রুটি';
        setError(errorMessage);
      }
    },
    [setActiveModelMutation]
  );

  return {
    // অবস্থা
    selectedModel,
    isLoading,
    error,

    // ডেটা
    availableModels: availableModels || [],
    activeModel,
    performanceStats: performanceStats || [],
    bestModel,
    allConfigs: allConfigs || [],

    // ফাংশন
    chat,
    compareModels,
    switchModel,
    setSelectedModel
  };
}

/**
 * সিম্পল চ্যাট হুক - শুধুমাত্র বর্তমান মডেল দিয়ে চ্যাট করুন
 */
export function useAIChatSimple(model: AIModel = 'chatgpt') {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatMutation = trpc.aiModels.chat.useMutation({
    onSuccess: () => setError(null),
    onError: (err) => setError(err.message)
  });

  const chat = useCallback(
    async (messages: AIMessage[]): Promise<AIResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await chatMutation.mutateAsync({
          messages,
          model
        });

        return response as AIResponse;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'অজানা ত্রুটি';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [model, chatMutation]
  );

  return {
    chat,
    isLoading,
    error
  };
}
