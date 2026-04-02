import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIModels, AIMessage } from '@/hooks/useAIModels';
import { Loader2, Send, Copy, RefreshCw } from 'lucide-react';

/**
 * AI চ্যাট ইন্টারফেস - মডেল সুইচিং সহ
 */

interface Message extends AIMessage {
  id: string;
  timestamp: number;
  modelUsed?: string;
  tokens?: number;
  responseTime?: number;
}

export function AIChatInterface() {
  const {
    selectedModel,
    isLoading,
    error,
    availableModels,
    chat,
    switchModel,
    performanceStats,
    bestModel
  } = useAIModels();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [compareModels, setCompareModels] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // স্বয়ংক্রিয় স্ক্রল
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /**
   * বার্তা পাঠান
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // ব্যবহারকারী বার্তা যোগ করুন
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // AI প্রতিক্রিয়া পান
    const conversationMessages: AIMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    conversationMessages.push({ role: 'user', content: input });

    if (showComparison && compareModels.length > 0) {
      // একাধিক মডেল থেকে প্রতিক্রিয়া পান
      const responses = await chat(conversationMessages, undefined, {
        maxTokens: 1024,
        temperature: 0.7
      });

      if (responses) {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: responses.content,
          timestamp: Date.now(),
          modelUsed: responses.modelName,
          tokens: responses.tokens,
          responseTime: responses.responseTime
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } else {
      // একটি মডেল থেকে প্রতিক্রিয়া পান
      const response = await chat(conversationMessages);

      if (response) {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
          modelUsed: response.modelName,
          tokens: response.tokens,
          responseTime: response.responseTime
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    }
  };

  /**
   * বার্তা কপি করুন
   */
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  /**
   * চ্যাট পরিষ্কার করুন
   */
  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* হেডার */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-200">AI চ্যাট</CardTitle>
            <div className="flex items-center gap-2">
              {bestModel && (
                <Badge className="bg-green-600 text-white text-xs">
                  সেরা: {bestModel.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* মডেল সিলেক্টর */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* মডেল নির্বাচন */}
            <div>
              <label className="text-sm text-slate-300 block mb-2">AI মডেল নির্বাচন করুন</label>
              <Select value={selectedModel} onValueChange={(value) => switchModel(value as any)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                  <SelectValue placeholder="মডেল নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-slate-200">
                      {model.icon} {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* তুলনা মোড */}
            <div className="flex items-end">
              <Button
                variant={showComparison ? 'default' : 'outline'}
                onClick={() => setShowComparison(!showComparison)}
                className="w-full"
              >
                {showComparison ? '✓ তুলনা মোড' : 'তুলনা মোড'}
              </Button>
            </div>
          </div>

          {/* ত্রুটি বার্তা */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded p-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* চ্যাট এরিয়া */}
      <Card className="bg-slate-800 border-slate-700 flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <p className="text-lg mb-2">কোনো বার্তা নেই</p>
                    <p className="text-sm">শুরু করতে নীচে একটি বার্তা টাইপ করুন</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>{msg.modelUsed}</span>
                          <div className="flex gap-2">
                            <span>{msg.tokens} টোকেন</span>
                            <span>{msg.responseTime}ms</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {msg.role === 'assistant' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMessage(msg.content)}
                        className="ml-2 h-auto p-1 text-slate-400 hover:text-slate-200"
                      >
                        <Copy size={14} />
                      </Button>
                    )}
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ইনপুট এরিয়া */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="আপনার বার্তা টাইপ করুন..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="bg-slate-700 border-slate-600 text-slate-200"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>

          {/* অ্যাকশন বাটন */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="flex-1"
            >
              <RefreshCw size={14} className="mr-1" />
              চ্যাট পরিষ্কার করুন
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* পারফরম্যান্স স্ট্যাটিস্টিক্স */}
      {performanceStats.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-200">মডেল পারফরম্যান্স</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
              {performanceStats.map((stat) => (
                <div key={stat.model} className="bg-slate-700/50 p-2 rounded">
                  <p className="font-semibold text-slate-200">{stat.modelName}</p>
                  <p className="text-slate-400">সময়: {stat.averageResponseTime}ms</p>
                  <p className="text-slate-400">ত্রুটি: {stat.errorRate}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AIChatInterface;
