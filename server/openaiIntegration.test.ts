import { describe, it, expect, beforeAll } from 'vitest';
import { ChatGPTIntegration } from './aiModelIntegration';

describe('OpenAI API Integration', () => {
  let chatgpt: ChatGPTIntegration;
  const apiKey = process.env.OPENAI_API_KEY;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    chatgpt = new ChatGPTIntegration(apiKey);
  });

  it('should validate OpenAI API key by making a test request', async () => {
    const messages = [
      { role: 'system' as const, content: 'আপনি একজন সহায়ক। সংক্ষিপ্ত উত্তর দিন।' },
      { role: 'user' as const, content: 'হ্যালো' }
    ];

    const response = await chatgpt.chat(messages, {
      maxTokens: 100,
      temperature: 0.5
    });

    // API কল সফল হলে কন্টেন্ট থাকবে
    expect(response.model).toBe('chatgpt');
    
    if (response.error) {
      console.error('API Error:', response.error);
      throw new Error(`OpenAI API validation failed: ${response.error}`);
    }

    expect(response.content).toBeTruthy();
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.tokens).toBeGreaterThan(0);
    expect(response.responseTime).toBeGreaterThan(0);

    console.log('✅ OpenAI API কী সফলভাবে যাচাই করা হয়েছে');
    console.log(`Response: ${response.content.substring(0, 100)}...`);
    console.log(`Tokens used: ${response.tokens}`);
    console.log(`Response time: ${response.responseTime}ms`);
  }, { timeout: 30000 });

  it('should handle invalid API key gracefully', async () => {
    const invalidChatgpt = new ChatGPTIntegration('sk-invalid-key-12345');
    
    const messages = [
      { role: 'user' as const, content: 'Test' }
    ];

    const response = await invalidChatgpt.chat(messages);

    expect(response.error).toBeTruthy();
    expect(response.content).toBe('');
    console.log('✅ অবৈধ API কী সঠিকভাবে পরিচালনা করা হয়েছে');
  }, { timeout: 10000 });
});
