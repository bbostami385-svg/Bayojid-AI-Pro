import React, { useState, useRef, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Trash2, Download, Bell, Copy, RefreshCw } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAIModels } from "@/hooks/useAIModels";
import { ExportButton } from "@/components/ExportButton";
import { VoiceButton } from "@/components/VoiceButton";
import { ShareModal } from "@/components/ShareModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id?: number;
  role: string;
  content: string;
  modelUsed?: string;
  tokens?: number;
  responseTime?: number;
  timestamp?: number;
}

export default function Chat() {
  const [, params] = useRoute("/chat/:id");
  const conversationId = params?.id ? parseInt(params.id) : null;
  const { user } = useAuth();

  // AI মডেল হুক
  const {
    selectedModel,
    isLoading: aiLoading,
    error: aiError,
    availableModels,
    chat: aiChat,
    switchModel,
    performanceStats,
    bestModel
  } = useAIModels();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [personality, setPersonality] = useState("friendly");
  const [useAIModel, setUseAIModel] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: messagesList, isLoading: messagesLoading } =
    trpc.chat.getMessages.useQuery(
      { conversationId: conversationId || 0 },
      { enabled: !!conversationId }
    );

  // Mutations
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation();
  const updateTitleMutation = trpc.chat.updateTitle.useMutation();

  useEffect(() => {
    if (messagesList) {
      setMessages(messagesList);
    }
  }, [messagesList]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /**
   * বার্তা পাঠান - AI মডেল বা ডিফল্ট
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    setIsLoading(true);
    try {
      if (useAIModel && availableModels.length > 0) {
        // AI মডেল দিয়ে চ্যাট করুন
        const conversationMessages = messages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content
        }));
        conversationMessages.push({ role: 'user', content: input });

        const response = await aiChat(conversationMessages);

        if (response) {
          const newMessages: Message[] = [
            { role: "user", content: input },
            {
              role: "assistant",
              content: response.content,
              modelUsed: response.modelName,
              tokens: response.tokens,
              responseTime: response.responseTime,
              timestamp: Date.now()
            }
          ];

          setMessages((prev) => [...prev, ...newMessages]);

          // ডাটাবেসে সংরক্ষণ করুন
          await sendMessageMutation.mutateAsync({
            conversationId,
            message: input,
            personality,
          });

          toast.success(`${response.modelName} থেকে উত্তর পেয়েছেন`, {
            icon: <Bell className="w-4 h-4" />,
          });
        }
      } else {
        // ডিফল্ট চ্যাট ব্যবহার করুন
        const result = await sendMessageMutation.mutateAsync({
          conversationId,
          message: input,
          personality,
        });

        setMessages((prev) => [
          ...prev,
          { role: "user", content: result.userMessage },
          { role: "assistant", content: result.assistantMessage },
        ]);

        toast.success("নতুন উত্তর পেয়েছেন", {
          icon: <Bell className="w-4 h-4" />,
        });
      }

      if (isFirstMessage) {
        await updateTitleMutation.mutateAsync({
          conversationId,
          title: input.substring(0, 50),
        });
        setIsFirstMessage(false);
      }

      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("বার্তা পাঠাতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * কথোপকথন মুছুন
   */
  const handleDeleteConversation = async () => {
    if (!conversationId) return;

    try {
      await deleteConversationMutation.mutateAsync({ conversationId });
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  /**
   * বার্তা কপি করুন
   */
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("কপি করা হয়েছে");
  };

  /**
   * টেক্সট হিসাবে এক্সপোর্ট করুন
   */
  const handleExportAsText = () => {
    const textContent = messages
      .map((msg) =>
        `${msg.role === "user" ? "আপনি" : "AI"}: ${msg.content}`
      )
      .join("\n\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(textContent)
    );
    element.setAttribute("download", "conversation.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">কোনো কথোপকথন নির্বাচিত নয়</p>
          <Button onClick={() => (window.location.href = "/")}>ফিরে যান</Button>
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
            <h1 className="text-xl font-semibold text-white">চ্যাট</h1>
            <div className="flex items-center gap-3 mt-1">
              {useAIModel && availableModels.length > 0 ? (
                <>
                  <Badge className="bg-blue-600 text-white text-xs">
                    {selectedModel.toUpperCase()}
                  </Badge>
                  {bestModel && (
                    <Badge className="bg-green-600 text-white text-xs">
                      সেরা: {bestModel.name}
                    </Badge>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400">AI ব্যক্তিত্ব: {personality === "friendly" ? "বন্ধুত্বপূর্ণ" : personality === "professional" ? "পেশাদার" : personality === "teacher" ? "শিক্ষক" : "সৃজনশীল"}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <ExportButton
              conversationId={conversationId}
              conversationTitle="চ্যাট"
              messages={messages}
              isLoading={isLoading || aiLoading}
            />
            <VoiceButton
              onVoiceMessage={(blob) => {
                toast.info("ভয়েস বার্তা প্রাপ্ত হয়েছে");
              }}
              disabled={isLoading || aiLoading}
            />
            <ShareModal
              conversationId={conversationId}
              conversationTitle="চ্যাট"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-400 hover:text-red-300 hover:bg-slate-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI মডেল সিলেক্টর */}
      {availableModels.length > 0 && (
        <Card className="m-4 bg-slate-800 border-slate-700">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useAIModel}
                onChange={(e) => setUseAIModel(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm text-slate-300">AI মডেল ব্যবহার করুন</label>
            </div>

            {useAIModel && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-300 block mb-2">মডেল নির্বাচন করুন</label>
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

                {performanceStats.length > 0 && (
                  <div className="bg-slate-700/50 p-3 rounded text-xs text-slate-300">
                    <p className="font-semibold mb-1">পারফরম্যান্স:</p>
                    <p>সময়: {performanceStats[0]?.averageResponseTime || 0}ms</p>
                  </div>
                )}
              </div>
            )}

            {aiError && (
              <div className="bg-red-900/30 border border-red-700 rounded p-2 text-sm text-red-200">
                {aiError}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* বার্তা এরিয়া */}
      <ScrollArea className="flex-1 px-6 py-8">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">কথোপকথন শুরু করুন</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    <Streamdown>{msg.content}</Streamdown>
                    {msg.role === "assistant" && msg.modelUsed && (
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>{msg.modelUsed}</span>
                        <div className="flex gap-2">
                          {msg.tokens && <span>{msg.tokens} টোকেন</span>}
                          {msg.responseTime && <span>{msg.responseTime}ms</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === "assistant" && (
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
              ))}
            </>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* ইনপুট এরিয়া */}
      <div className="border-t border-slate-700 bg-slate-800 px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="আপনার বার্তা টাইপ করুন..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || aiLoading}
              className="bg-slate-700 border-slate-600 text-slate-200"
            />
            <VoiceButton
              onVoiceMessage={(blob) => {
                toast.info("ভয়েস বার্তা প্রাপ্ত হয়েছে");
              }}
              disabled={isLoading || aiLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || aiLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading || aiLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>

          {!useAIModel && (
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-200">
                <SelectValue placeholder="ব্যক্তিত্ব নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="friendly" className="text-slate-200">বন্ধুত্বপূর্ণ</SelectItem>
                <SelectItem value="professional" className="text-slate-200">পেশাদার</SelectItem>
                <SelectItem value="teacher" className="text-slate-200">শিক্ষক</SelectItem>
                <SelectItem value="creative" className="text-slate-200">সৃজনশীল</SelectItem>
              </SelectContent>
            </Select>
          )}
        </form>
      </div>

      {/* ডিলিট ডায়ালগ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogTitle className="text-white">কথোপকথন মুছুন?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            এই কথোপকথনটি চিরতরে মুছে ফেলা হবে।
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel className="bg-slate-700 text-slate-200 border-slate-600">বাতিল করুন</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              মুছুন
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
