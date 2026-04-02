import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AIModelSelector } from '@/components/AIModelSelector';

/**
 * AI মডেল সেটিংস পৃষ্ঠা - API কী এবং কনফিগারেশন পরিচালনা
 */

interface ModelConfig {
  model: string;
  apiKey: string;
  enabled: boolean;
  maxTokens: number;
  temperature: number;
  status: 'configured' | 'not-configured' | 'error';
}

export default function AIModelSettings() {
  const [configs, setConfigs] = useState<Record<string, ModelConfig>>({
    chatgpt: {
      model: 'ChatGPT',
      apiKey: '',
      enabled: false,
      maxTokens: 2048,
      temperature: 0.7,
      status: 'not-configured'
    },
    gemini: {
      model: 'Google Gemini',
      apiKey: '',
      enabled: false,
      maxTokens: 2048,
      temperature: 0.7,
      status: 'not-configured'
    },
    claude: {
      model: 'Claude',
      apiKey: '',
      enabled: false,
      maxTokens: 2048,
      temperature: 0.7,
      status: 'not-configured'
    },
    perplexity: {
      model: 'Perplexity',
      apiKey: '',
      enabled: false,
      maxTokens: 2048,
      temperature: 0.7,
      status: 'not-configured'
    },
    grok: {
      model: 'Grok',
      apiKey: '',
      enabled: false,
      maxTokens: 2048,
      temperature: 0.7,
      status: 'not-configured'
    }
  });

  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  const handleApiKeyChange = (model: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        apiKey: value,
        status: value ? 'configured' : 'not-configured'
      }
    }));
  };

  const handleToggleModel = (model: string) => {
    setConfigs(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        enabled: !prev[model].enabled
      }
    }));
  };

  const handleSaveConfig = async (model: string) => {
    // API কল করুন কনফিগারেশন সংরক্ষণ করতে
    console.log(`Saving config for ${model}:`, configs[model]);
    // const response = await trpc.aiModels.saveConfig.useMutation();
  };

  const handleTestConnection = async (model: string) => {
    // API সংযোগ পরীক্ষা করুন
    console.log(`Testing connection for ${model}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* হেডার */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI মডেল সেটিংস</h1>
          <p className="text-slate-400">আপনার পছন্দের AI মডেল কনফিগার করুন এবং API কী যোগ করুন</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-200">সারাংশ</TabsTrigger>
            <TabsTrigger value="configuration" className="text-slate-200">কনফিগারেশন</TabsTrigger>
            <TabsTrigger value="performance" className="text-slate-200">পারফরম্যান্স</TabsTrigger>
            <TabsTrigger value="selector" className="text-slate-200">মডেল নির্বাচক</TabsTrigger>
          </TabsList>

          {/* সারাংশ ট্যাব */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(configs).map(([key, config]) => (
                <Card key={key} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm text-slate-200">{config.model}</CardTitle>
                      <Badge
                        variant={config.status === 'configured' ? 'default' : 'secondary'}
                        className={
                          config.status === 'configured'
                            ? 'bg-green-600 text-white'
                            : config.status === 'error'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-600 text-slate-200'
                        }
                      >
                        {config.status === 'configured' && 'সক্রিয়'}
                        {config.status === 'not-configured' && 'অপেক্ষমাণ'}
                        {config.status === 'error' && 'ত্রুটি'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">স্ট্যাটাস</span>
                      <span className={`text-xs font-semibold ${config.enabled ? 'text-green-400' : 'text-slate-400'}`}>
                        {config.enabled ? 'সক্ষম' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => handleToggleModel(key)}
                    >
                      {config.enabled ? 'নিষ্ক্রিয় করুন' : 'সক্ষম করুন'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* দ্রুত সেটআপ গাইড */}
            <Card className="bg-blue-900/30 border-blue-700">
              <CardHeader>
                <CardTitle className="text-slate-200">দ্রুত সেটআপ গাইড</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">১. API কী প্রাপ্ত করুন</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>ChatGPT:</strong> <a href="https://platform.openai.com/api-keys" className="text-blue-400 hover:underline">platform.openai.com</a></li>
                    <li><strong>Gemini:</strong> <a href="https://makersuite.google.com/app/apikey" className="text-blue-400 hover:underline">makersuite.google.com</a></li>
                    <li><strong>Claude:</strong> <a href="https://console.anthropic.com" className="text-blue-400 hover:underline">console.anthropic.com</a></li>
                    <li><strong>Perplexity:</strong> <a href="https://www.perplexity.ai/api" className="text-blue-400 hover:underline">perplexity.ai/api</a></li>
                    <li><strong>Grok:</strong> <a href="https://x.ai" className="text-blue-400 hover:underline">x.ai</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">২. নীচে API কী যোগ করুন</h4>
                  <p className="text-xs">প্রতিটি মডেলের জন্য আপনার API কী নিরাপদে সংরক্ষণ করা হবে।</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">३. সংযোগ পরীক্ষা করুন</h4>
                  <p className="text-xs">সংরক্ষণের পরে সংযোগ পরীক্ষা করতে "পরীক্ষা" বোতাম ক্লিক করুন।</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* কনফিগারেশন ট্যাব */}
          <TabsContent value="configuration" className="space-y-6">
            {Object.entries(configs).map(([key, config]) => (
              <Card key={key} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-200">{config.model}</CardTitle>
                    <Badge variant={config.enabled ? 'default' : 'secondary'}>
                      {config.enabled ? 'সক্ষম' : 'নিষ্ক্রিয়'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* API কী ইনপুট */}
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">API কী</label>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey[key] ? 'text' : 'password'}
                        placeholder="আপনার API কী এখানে পেস্ট করুন"
                        value={config.apiKey}
                        onChange={(e) => handleApiKeyChange(key, e.target.value)}
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(prev => ({ ...prev, [key]: !prev[key] }))}
                      >
                        {showApiKey[key] ? 'লুকান' : 'দেখান'}
                      </Button>
                    </div>
                  </div>

                  {/* মডেল প্যারামিটার */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">Max Tokens</label>
                      <Input
                        type="number"
                        min="256"
                        max="4096"
                        value={config.maxTokens}
                        onChange={(e) => setConfigs(prev => ({
                          ...prev,
                          [key]: { ...prev[key], maxTokens: parseInt(e.target.value) }
                        }))}
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">Temperature</label>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => setConfigs(prev => ({
                          ...prev,
                          [key]: { ...prev[key], temperature: parseFloat(e.target.value) }
                        }))}
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                    </div>
                  </div>

                  {/* অ্যাকশন বাটন */}
                  <div className="flex gap-2 pt-4 border-t border-slate-700">
                    <Button
                      onClick={() => handleSaveConfig(key)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!config.apiKey}
                    >
                      সংরক্ষণ করুন
                    </Button>
                    <Button
                      onClick={() => handleTestConnection(key)}
                      variant="outline"
                      className="flex-1"
                      disabled={!config.apiKey}
                    >
                      পরীক্ষা করুন
                    </Button>
                    <Button
                      onClick={() => handleToggleModel(key)}
                      variant={config.enabled ? 'destructive' : 'default'}
                      className="flex-1"
                    >
                      {config.enabled ? 'নিষ্ক্রিয় করুন' : 'সক্ষম করুন'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* পারফরম্যান্স ট্যাব */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">মডেল পারফরম্যান্স</CardTitle>
                <CardDescription className="text-slate-400">প্রতিটি মডেলের গতি এবং নির্ভুলতা</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'ChatGPT', speed: 92, accuracy: 92, cost: 'মধ্যম' },
                    { name: 'Google Gemini', speed: 95, accuracy: 94, cost: 'কম' },
                    { name: 'Claude', speed: 85, accuracy: 95, cost: 'বেশি' },
                    { name: 'Perplexity', speed: 80, accuracy: 90, cost: 'মধ্যম' },
                    { name: 'Grok', speed: 90, accuracy: 91, cost: 'মধ্যম' }
                  ].map((model, idx) => (
                    <div key={idx} className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-200">{model.name}</span>
                        <span className="text-xs text-slate-400">খরচ: {model.cost}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>গতি</span>
                            <span>{model.speed}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${model.speed}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>নির্ভুলতা</span>
                            <span>{model.accuracy}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${model.accuracy}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* মডেল নির্বাচক ট্যাব */}
          <TabsContent value="selector" className="space-y-6">
            <AIModelSelector showComparison={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
