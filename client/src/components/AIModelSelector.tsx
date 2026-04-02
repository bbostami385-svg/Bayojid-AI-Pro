import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

/**
 * AI মডেল সেলেক্টর - একাধিক AI মডেল থেকে বেছে নিন
 */

export type AIModel = 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | 'grok';

interface AIModelInfo {
  id: AIModel;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: 'available' | 'unavailable' | 'loading';
  responseTime?: number;
  accuracy?: number;
}

interface AIModelSelectorProps {
  onModelSelect?: (model: AIModel) => void;
  currentModel?: AIModel;
  showComparison?: boolean;
}

const MODEL_INFO: Record<AIModel, AIModelInfo> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI এর শক্তিশালী ভাষা মডেল',
    icon: '🤖',
    color: 'from-green-500 to-green-600',
    status: 'available',
    responseTime: 1200,
    accuracy: 92
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google এর উন্নত মাল্টিমোডাল মডেল',
    icon: '✨',
    color: 'from-blue-500 to-blue-600',
    status: 'available',
    responseTime: 1000,
    accuracy: 94
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic এর নিরাপদ এবং নির্ভরযোগ্য মডেল',
    icon: '🧠',
    color: 'from-purple-500 to-purple-600',
    status: 'available',
    responseTime: 1500,
    accuracy: 95
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'রিয়েল-টাইম ওয়েব সার্চ সহ AI',
    icon: '🔍',
    color: 'from-orange-500 to-orange-600',
    status: 'available',
    responseTime: 2000,
    accuracy: 90
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    description: 'xAI এর বুদ্ধিমান এবং মজাদার মডেল',
    icon: '⚡',
    color: 'from-yellow-500 to-yellow-600',
    status: 'available',
    responseTime: 1100,
    accuracy: 91
  }
};

export function AIModelSelector({
  onModelSelect,
  currentModel = 'chatgpt',
  showComparison = false
}: AIModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel>(currentModel);
  const [compareModels, setCompareModels] = useState<AIModel[]>([]);

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
    onModelSelect?.(model);
  };

  const toggleComparison = (model: AIModel) => {
    setCompareModels(prev =>
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  return (
    <div className="space-y-6">
      {/* মডেল সেলেক্টর ড্রপডাউন */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">AI মডেল নির্বাচন করুন</CardTitle>
          <CardDescription className="text-slate-400">আপনার পছন্দের AI মডেল বেছে নিন</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedModel} onValueChange={(value) => handleModelSelect(value as AIModel)}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-200">
              <SelectValue placeholder="মডেল নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {Object.entries(MODEL_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key} className="text-slate-200">
                  <div className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* বর্তমান মডেল তথ্য */}
      <Card className={`bg-gradient-to-br ${MODEL_INFO[selectedModel].color} border-0`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{MODEL_INFO[selectedModel].icon}</span>
              <div>
                <CardTitle className="text-white">{MODEL_INFO[selectedModel].name}</CardTitle>
                <CardDescription className="text-white/80">{MODEL_INFO[selectedModel].description}</CardDescription>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">সক্রিয়</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-80">গড় প্রতিক্রিয়া সময়</p>
              <p className="text-2xl font-bold">{MODEL_INFO[selectedModel].responseTime}ms</p>
            </div>
            <div>
              <p className="text-sm opacity-80">নির্ভুলতা</p>
              <p className="text-2xl font-bold">{MODEL_INFO[selectedModel].accuracy}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* সব মডেল গ্রিড */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">উপলব্ধ মডেলসমূহ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(MODEL_INFO).map(([key, info]) => (
            <Card
              key={key}
              className={`bg-slate-800 border-slate-700 cursor-pointer transition-all ${
                selectedModel === key ? 'ring-2 ring-blue-500 border-blue-500' : ''
              } hover:border-slate-600`}
              onClick={() => handleModelSelect(key as AIModel)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{info.icon}</span>
                    <div>
                      <CardTitle className="text-sm text-slate-200">{info.name}</CardTitle>
                    </div>
                  </div>
                  {selectedModel === key && (
                    <Badge className="bg-blue-500 text-white">নির্বাচিত</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-400">{info.description}</p>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>সময়: {info.responseTime}ms</span>
                  <span>নির্ভুলতা: {info.accuracy}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* মডেল তুলনা */}
      {showComparison && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">মডেল তুলনা</CardTitle>
            <CardDescription className="text-slate-400">একাধিক মডেল থেকে প্রতিক্রিয়া পান</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(MODEL_INFO).map(([key, info]) => (
                <Button
                  key={key}
                  variant={compareModels.includes(key as AIModel) ? 'default' : 'outline'}
                  onClick={() => toggleComparison(key as AIModel)}
                  className="text-sm"
                >
                  {info.icon} {info.name}
                </Button>
              ))}
            </div>

            {compareModels.length > 0 && (
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-300 mb-2">
                  তুলনা করা হবে: {compareModels.map(m => MODEL_INFO[m].name).join(', ')}
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  তুলনা শুরু করুন
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* মডেল বৈশিষ্ট্য তুলনা টেবিল */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">মডেল বৈশিষ্ট্য তুলনা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4">মডেল</th>
                  <th className="text-left py-3 px-4">প্রদানকারী</th>
                  <th className="text-left py-3 px-4">সময়</th>
                  <th className="text-left py-3 px-4">নির্ভুলতা</th>
                  <th className="text-left py-3 px-4">বিশেষত্ব</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(MODEL_INFO).map(([key, info]) => (
                  <tr key={key} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span>{info.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      {key === 'chatgpt' && 'OpenAI'}
                      {key === 'gemini' && 'Google'}
                      {key === 'claude' && 'Anthropic'}
                      {key === 'perplexity' && 'Perplexity'}
                      {key === 'grok' && 'xAI'}
                    </td>
                    <td className="py-3 px-4">{info.responseTime}ms</td>
                    <td className="py-3 px-4">{info.accuracy}%</td>
                    <td className="py-3 px-4 text-xs">
                      {key === 'perplexity' && 'ওয়েব সার্চ'}
                      {key === 'claude' && 'নিরাপত্তা'}
                      {key === 'gemini' && 'মাল্টিমোডাল'}
                      {key === 'grok' && 'সৃজনশীল'}
                      {key === 'chatgpt' && 'সর্বজনীন'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIModelSelector;
