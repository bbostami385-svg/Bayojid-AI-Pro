/**
 * মাল্টি-AI মডেল ইন্টিগ্রেশন সিস্টেম
 * ChatGPT, Gemini, Claude, Perplexity, Grok সাপোর্ট
 */

export type AIModel = 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | 'grok';

export interface AIModelConfig {
  model: AIModel;
  apiKey: string;
  apiUrl: string;
  enabled: boolean;
  maxTokens: number;
  temperature: number;
}

export interface AIResponse {
  model: AIModel;
  content: string;
  tokens: number;
  responseTime: number;
  error?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * ChatGPT ইন্টিগ্রেশন
 */
export class ChatGPTIntegration {
  private apiKey: string;
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: AIMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`ChatGPT API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        model: 'chatgpt',
        content: data.choices[0].message.content,
        tokens: data.usage.total_tokens,
        responseTime
      };
    } catch (error) {
      return {
        model: 'chatgpt',
        content: '',
        tokens: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Google Gemini ইন্টিগ্রেশন
 */
export class GeminiIntegration {
  private apiKey: string;
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: AIMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            maxOutputTokens: options?.maxTokens || 2048,
            temperature: options?.temperature || 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        model: 'gemini',
        content: data.candidates[0].content.parts[0].text,
        tokens: 0, // Gemini doesn't return token count in this format
        responseTime
      };
    } catch (error) {
      return {
        model: 'gemini',
        content: '',
        tokens: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Anthropic Claude ইন্টিগ্রেশন
 */
export class ClaudeIntegration {
  private apiKey: string;
  private apiUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: AIMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7,
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        model: 'claude',
        content: data.content[0].text,
        tokens: data.usage.output_tokens,
        responseTime
      };
    } catch (error) {
      return {
        model: 'claude',
        content: '',
        tokens: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Perplexity ইন্টিগ্রেশন
 */
export class PerplexityIntegration {
  private apiKey: string;
  private apiUrl: string = 'https://api.perplexity.ai/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: AIMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'pplx-7b-online',
          messages,
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        model: 'perplexity',
        content: data.choices[0].message.content,
        tokens: data.usage.total_tokens,
        responseTime
      };
    } catch (error) {
      return {
        model: 'perplexity',
        content: '',
        tokens: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Grok (xAI) ইন্টিগ্রেশন
 */
export class GrokIntegration {
  private apiKey: string;
  private apiUrl: string = 'https://api.x.ai/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: AIMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages,
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        model: 'grok',
        content: data.choices[0].message.content,
        tokens: data.usage.total_tokens,
        responseTime
      };
    } catch (error) {
      return {
        model: 'grok',
        content: '',
        tokens: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * AI মডেল ম্যানেজার - সব মডেল পরিচালনা করুন
 */
export class AIModelManager {
  private models: Map<AIModel, any> = new Map();
  private activeModel: AIModel = 'chatgpt';

  constructor(configs: Partial<Record<AIModel, string>>) {
    // ChatGPT
    if (configs.chatgpt) {
      this.models.set('chatgpt', new ChatGPTIntegration(configs.chatgpt));
    }

    // Gemini
    if (configs.gemini) {
      this.models.set('gemini', new GeminiIntegration(configs.gemini));
    }

    // Claude
    if (configs.claude) {
      this.models.set('claude', new ClaudeIntegration(configs.claude));
    }

    // Perplexity
    if (configs.perplexity) {
      this.models.set('perplexity', new PerplexityIntegration(configs.perplexity));
    }

    // Grok
    if (configs.grok) {
      this.models.set('grok', new GrokIntegration(configs.grok));
    }

    // সক্রিয় মডেল নির্ধারণ করুন
    if (this.models.size > 0) {
      const firstModel = this.models.keys().next().value;
      if (firstModel) {
        this.activeModel = firstModel;
      }
    }
  }

  /**
   * সক্রিয় মডেল সেট করুন
   */
  setActiveModel(model: AIModel): boolean {
    if (this.models.has(model)) {
      this.activeModel = model;
      return true;
    }
    return false;
  }

  /**
   * সক্রিয় মডেল পান
   */
  getActiveModel(): AIModel {
    return this.activeModel;
  }

  /**
   * উপলব্ধ মডেল পান
   */
  getAvailableModels(): AIModel[] {
    return Array.from(this.models.keys());
  }

  /**
   * চ্যাট করুন সক্রিয় মডেল দিয়ে
   */
  async chat(messages: AIMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<AIResponse> {
    const model = this.models.get(this.activeModel);
    if (!model) {
      return {
        model: this.activeModel,
        content: '',
        tokens: 0,
        responseTime: 0,
        error: `মডেল ${this.activeModel} কনফিগার করা নেই`
      };
    }

    return model.chat(messages, options);
  }

  /**
   * একাধিক মডেল থেকে প্রতিক্রিয়া পান (তুলনা)
   */
  async chatMultiple(messages: AIMessage[], models?: AIModel[], options?: { maxTokens?: number; temperature?: number }): Promise<AIResponse[]> {
    const modelsToUse = models || this.getAvailableModels();
    const responses: AIResponse[] = [];

    for (const model of modelsToUse) {
      const modelInstance = this.models.get(model);
      if (modelInstance) {
        const response = await modelInstance.chat(messages, options);
        responses.push(response);
      }
    }

    return responses;
  }
}

/**
 * AI মডেল পারফরম্যান্স ট্র্যাকার
 */
export class AIModelPerformanceTracker {
  private stats: Map<AIModel, { totalRequests: number; totalTokens: number; totalTime: number; errors: number }> = new Map();

  /**
   * প্রতিক্রিয়া ট্র্যাক করুন
   */
  trackResponse(response: AIResponse): void {
    if (!this.stats.has(response.model)) {
      this.stats.set(response.model, { totalRequests: 0, totalTokens: 0, totalTime: 0, errors: 0 });
    }

    const stat = this.stats.get(response.model)!;
    stat.totalRequests++;
    stat.totalTokens += response.tokens;
    stat.totalTime += response.responseTime;
    if (response.error) {
      stat.errors++;
    }
  }

  /**
   * মডেলের পরিসংখ্যান পান
   */
  getStats(model: AIModel) {
    const stat = this.stats.get(model);
    if (!stat) return null;

    return {
      model,
      totalRequests: stat.totalRequests,
      averageTokens: stat.totalTokens / stat.totalRequests,
      averageResponseTime: stat.totalTime / stat.totalRequests,
      errorRate: (stat.errors / stat.totalRequests) * 100
    };
  }

  /**
   * সব মডেলের পরিসংখ্যান পান
   */
  getAllStats() {
    const allStats = [];
    for (const model of Array.from(this.stats.keys())) {
      const stat = this.getStats(model);
      if (stat) allStats.push(stat);
    }
    return allStats;
  }

  /**
   * সেরা পারফরমিং মডেল পান
   */
  getBestPerformingModel(): AIModel | null {
    let bestModel: AIModel | null = null;
    let bestScore = Infinity;

    for (const model of Array.from(this.stats.keys())) {
      const stat = this.getStats(model);
      if (stat) {
        const score = stat.averageResponseTime + (stat.errorRate * 100);
        if (score < bestScore) {
          bestScore = score;
          bestModel = model;
        }
      }
    }

    return bestModel;
  }
}
