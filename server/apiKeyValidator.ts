/**
 * API Key Validation Service
 * Verify and validate all configured AI API keys
 */

export interface APIKeyStatus {
  provider: string;
  configured: boolean;
  valid: boolean;
  lastChecked: Date;
  error?: string;
}

export class APIKeyValidator {
  /**
   * Validate all configured API keys
   */
  static async validateAllKeys(): Promise<APIKeyStatus[]> {
    const statuses: APIKeyStatus[] = [];

    // Check OpenAI
    statuses.push(await this.validateOpenAI());

    // Check Gemini
    statuses.push(await this.validateGemini());

    // Check Claude
    statuses.push(await this.validateClaude());

    // Check Perplexity
    statuses.push(await this.validatePerplexity());

    // Check Grok
    statuses.push(await this.validateGrok());

    return statuses;
  }

  /**
   * Validate OpenAI API key
   */
  private static async validateOpenAI(): Promise<APIKeyStatus> {
    const apiKey = process.env.OPENAI_API_KEY;
    const status: APIKeyStatus = {
      provider: 'OpenAI',
      configured: !!apiKey,
      valid: false,
      lastChecked: new Date(),
    };

    if (!apiKey) {
      status.error = 'API key not configured';
      return status;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      status.valid = response.ok;
      if (!response.ok) {
        status.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      status.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return status;
  }

  /**
   * Validate Gemini API key
   */
  private static async validateGemini(): Promise<APIKeyStatus> {
    const apiKey = process.env.GEMINI_API_KEY;
    const status: APIKeyStatus = {
      provider: 'Gemini',
      configured: !!apiKey,
      valid: false,
      lastChecked: new Date(),
    };

    if (!apiKey) {
      status.error = 'API key not configured';
      return status;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );

      status.valid = response.ok;
      if (!response.ok) {
        status.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      status.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return status;
  }

  /**
   * Validate Claude API key
   */
  private static async validateClaude(): Promise<APIKeyStatus> {
    const apiKey = process.env.CLAUDE_API_KEY;
    const status: APIKeyStatus = {
      provider: 'Claude',
      configured: !!apiKey,
      valid: false,
      lastChecked: new Date(),
    };

    if (!apiKey) {
      status.error = 'API key not configured';
      return status;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      // Claude returns 400 for invalid requests but 401 for invalid API key
      status.valid = response.status !== 401;
      if (response.status === 401) {
        status.error = 'Invalid API key';
      }
    } catch (error) {
      status.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return status;
  }

  /**
   * Validate Perplexity API key
   */
  private static async validatePerplexity(): Promise<APIKeyStatus> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    const status: APIKeyStatus = {
      provider: 'Perplexity',
      configured: !!apiKey,
      valid: false,
      lastChecked: new Date(),
    };

    if (!apiKey) {
      status.error = 'API key not configured';
      return status;
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'pplx-7b-online',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });

      status.valid = response.ok;
      if (!response.ok) {
        status.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      status.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return status;
  }

  /**
   * Validate Grok API key
   */
  private static async validateGrok(): Promise<APIKeyStatus> {
    const apiKey = process.env.GROK_API_KEY;
    const status: APIKeyStatus = {
      provider: 'Grok',
      configured: !!apiKey,
      valid: false,
      lastChecked: new Date(),
    };

    if (!apiKey) {
      status.error = 'API key not configured';
      return status;
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });

      status.valid = response.ok;
      if (!response.ok) {
        status.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      status.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return status;
  }

  /**
   * Get configured providers
   */
  static getConfiguredProviders(): string[] {
    const providers: string[] = [];

    if (process.env.OPENAI_API_KEY) providers.push('openai');
    if (process.env.GEMINI_API_KEY) providers.push('gemini');
    if (process.env.CLAUDE_API_KEY) providers.push('claude');
    if (process.env.PERPLEXITY_API_KEY) providers.push('perplexity');
    if (process.env.GROK_API_KEY) providers.push('grok');

    return providers;
  }
}
