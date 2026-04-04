import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Home } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { toast } from 'sonner';

/**
 * শেয়ার করা চ্যাট পৃষ্ঠা
 * `/shared/:id` রুটে দেখা যায়
 */

interface SharedMessage {
  id?: number;
  role: string;
  content: string;
  modelUsed?: string;
  timestamp?: number;
}

interface SharedConversation {
  id: number;
  title: string;
  model?: string;
  createdAt: string;
  messages: SharedMessage[];
}

export default function SharedChat() {
  const [, params] = useRoute('/shared/:id');
  const shareId = params?.id;

  const [conversation, setConversation] = useState<SharedConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // শেয়ার করা চ্যাট লোড করুন
  useEffect(() => {
    if (!shareId) {
      setError('শেয়ার আইডি পাওয়া যায়নি');
      setIsLoading(false);
      return;
    }

    const loadSharedChat = async () => {
      try {
        setIsLoading(true);
        // এখানে API কল করবেন
        // const response = await fetch(`/api/shared/${shareId}`);
        // const data = await response.json();
        
        // ডেমো ডেটা
        const demoData: SharedConversation = {
          id: parseInt(shareId),
          title: 'শেয়ার করা কথোপকথন',
          model: 'ChatGPT',
          createdAt: new Date().toLocaleString('bn-BD'),
          messages: [
            {
              id: 1,
              role: 'user',
              content: 'আপনি কে?',
              timestamp: Date.now() - 10000
            },
            {
              id: 2,
              role: 'assistant',
              content: 'আমি একটি AI সহায়ক। আমি আপনাকে বিভিন্ন প্রশ্নের উত্তর দিতে এবং কাজ করতে সাহায্য করতে পারি।',
              modelUsed: 'ChatGPT',
              timestamp: Date.now() - 5000
            },
            {
              id: 3,
              role: 'user',
              content: 'আপনি কী করতে পারেন?',
              timestamp: Date.now()
            }
          ]
        };

        setConversation(demoData);
        setError(null);
      } catch (err) {
        setError('চ্যাট লোড করতে ব্যর্থ হয়েছে');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedChat();
  }, [shareId]);

  /**
   * বার্তা কপি করুন
   */
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('বার্তা কপি করা হয়েছে');
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * পূর্ণ চ্যাট কপি করুন
   */
  const copyFullChat = () => {
    if (!conversation) return;

    const fullText = conversation.messages
      .map(msg => `${msg.role === 'user' ? '👤' : '🤖'} ${msg.content}`)
      .join('\n\n');

    navigator.clipboard.writeText(fullText);
    toast.success('সম্পূর্ণ চ্যাট কপি করা হয়েছে');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">চ্যাট লোড করছি...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-4">
            <p className="text-red-400 font-semibold mb-2">❌ ত্রুটি</p>
            <p className="text-slate-300 text-sm">{error || 'চ্যাট পাওয়া যায়নি'}</p>
          </div>
          <Button
            onClick={() => (window.location.href = '/')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Home className="w-4 h-4 mr-2" />
            হোম এ ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* হেডার */}
      <div className="border-b border-slate-700 bg-slate-800 shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-white">{conversation.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              {conversation.model && (
                <Badge className="bg-blue-600 text-white text-xs">
                  {conversation.model}
                </Badge>
              )}
              <p className="text-xs text-slate-400">{conversation.createdAt}</p>
              <Badge variant="outline" className="text-xs text-slate-300">
                শেয়ার করা
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyFullChat}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              সব কপি করুন
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Home className="w-4 h-4" />
              হোম
            </Button>
          </div>
        </div>
      </div>

      {/* বার্তা এরিয়া */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {conversation.messages.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-slate-400">কোনো বার্তা নেই</p>
            </div>
          ) : (
            conversation.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-xs lg:max-w-md ${
                    msg.role === 'user'
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {msg.role === 'assistant' ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          <p className="text-slate-100">{msg.content}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMessage(msg.content)}
                        className={`flex-shrink-0 ${
                          msg.role === 'user'
                            ? 'text-blue-100 hover:text-blue-50'
                            : 'text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {msg.modelUsed && (
                      <p className="text-xs mt-2 opacity-70">
                        মডেল: {msg.modelUsed}
                      </p>
                    )}

                    {msg.timestamp && (
                      <p className="text-xs mt-1 opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString('bn-BD')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* ফুটার */}
      <div className="border-t border-slate-700 bg-slate-800 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              💡 এটি একটি শেয়ার করা কথোপকথন। আপনি এখানে নতুন বার্তা যোগ করতে পারবেন না।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
