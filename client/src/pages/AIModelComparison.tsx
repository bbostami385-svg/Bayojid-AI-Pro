/**
 * AI Model Comparison Dashboard
 * Compare performance and features of different AI models
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

type AIModel = 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | 'grok';

interface ModelComparison {
  model: AIModel;
  name: string;
  icon: string;
  responseTime: number;
  accuracy: number;
  cost: number;
  features: string[];
}

export function AIModelComparison() {
  const [selectedModels, setSelectedModels] = useState<AIModel[]>(['chatgpt', 'gemini', 'claude']);
  const [prompt, setPrompt] = useState('');
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});

  const availableModels = trpc.aiModels.getAvailableModels.useQuery();
  const compareModels = trpc.aiModels.compareModels.useMutation();

  const models: Record<AIModel, ModelComparison> = {
    chatgpt: {
      model: 'chatgpt',
      name: 'ChatGPT (GPT-4)',
      icon: '🤖',
      responseTime: 1200,
      accuracy: 92,
      cost: 0.03,
      features: ['Code Generation', 'Reasoning', 'Long Context', 'Function Calling'],
    },
    gemini: {
      model: 'gemini',
      name: 'Google Gemini',
      icon: '✨',
      responseTime: 1000,
      accuracy: 94,
      cost: 0.005,
      features: ['Multimodal', 'Vision', 'Long Context', 'Real-time'],
    },
    claude: {
      model: 'claude',
      name: 'Claude 3 Opus',
      icon: '🧠',
      responseTime: 1500,
      accuracy: 95,
      cost: 0.015,
      features: ['Constitutional AI', 'Long Context', 'Reasoning', 'Safety'],
    },
    perplexity: {
      model: 'perplexity',
      name: 'Perplexity',
      icon: '🔍',
      responseTime: 2000,
      accuracy: 88,
      cost: 0.002,
      features: ['Web Search', 'Real-time', 'Citations', 'Research'],
    },
    grok: {
      model: 'grok',
      name: 'Grok (xAI)',
      icon: '⚡',
      responseTime: 1100,
      accuracy: 90,
      cost: 0.01,
      features: ['Real-time', 'Humor', 'Knowledge', 'Speed'],
    },
  };

  const handleCompare = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;

    setComparing(true);
    try {
      const response = await compareModels.mutateAsync({
        models: selectedModels,
        prompt,
      });
      setResults(response);
    } finally {
      setComparing(false);
    }
  };

  const toggleModel = (model: AIModel) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Model Comparison</h1>
        <p className="text-gray-600">Compare responses from multiple AI models</p>
      </div>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Models</CardTitle>
          <CardDescription>Choose which models to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(models).map(([key, model]) => (
              <button
                key={key}
                onClick={() => toggleModel(key as AIModel)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedModels.includes(key as AIModel)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{model.icon}</div>
                <div className="font-semibold text-sm">{model.name}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle>Test Prompt</CardTitle>
          <CardDescription>Enter a prompt to compare model responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleCompare}
            disabled={comparing || !prompt.trim() || selectedModels.length === 0}
            className="w-full"
          >
            {comparing ? 'Comparing...' : 'Compare Models'}
          </Button>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedModels.map((modelKey) => {
              const model = models[modelKey];
              const result = results[modelKey];

              return (
                <Card key={modelKey}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{model.icon}</span>
                          {model.name}
                        </CardTitle>
                      </div>
                      <Badge variant="outline">
                        {result?.responseTime || model.responseTime}ms
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result?.error ? (
                      <div className="text-red-500 text-sm">Error: {result.error}</div>
                    ) : (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                          <p className="text-sm text-gray-700">{result?.content}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Tokens:</span>
                            <p className="font-semibold">{result?.tokens || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Accuracy:</span>
                            <p className="font-semibold">{model.accuracy}%</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Model Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>Key features of each model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Model</th>
                  <th className="text-center py-2 px-4">Response Time</th>
                  <th className="text-center py-2 px-4">Accuracy</th>
                  <th className="text-center py-2 px-4">Cost/1K Tokens</th>
                  <th className="text-left py-2 px-4">Features</th>
                </tr>
              </thead>
              <tbody>
                {selectedModels.map((modelKey) => {
                  const model = models[modelKey];
                  return (
                    <tr key={modelKey} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">
                        <span className="mr-2">{model.icon}</span>
                        {model.name}
                      </td>
                      <td className="text-center py-3 px-4">{model.responseTime}ms</td>
                      <td className="text-center py-3 px-4">{model.accuracy}%</td>
                      <td className="text-center py-3 px-4">${model.cost}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {model.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Detailed performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedModels.map((modelKey) => {
              const model = models[modelKey];
              return (
                <div key={modelKey} className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="text-xl">{model.icon}</span>
                    {model.name}
                  </h4>

                  {/* Response Time Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Response Time</span>
                      <span>{model.responseTime}ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((model.responseTime / 2000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accuracy</span>
                      <span>{model.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${model.accuracy}%` }}
                      />
                    </div>
                  </div>

                  {/* Cost Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cost Efficiency</span>
                      <span>${model.cost}/1K</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min((model.cost / 0.03) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
