import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, User, Sparkles, Settings } from "lucide-react";
import { Streamdown } from "streamdown";
import ModelSwitcherConnected from "./ModelSwitcherConnected";
import { cn } from "@/lib/utils";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  model?: string; // Track which model generated this message
};

export type AIChatBoxWithModelSwitchProps = {
  messages: Message[];
  onSendMessage: (content: string, modelId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  height?: string | number;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
  defaultModel?: string;
};

export default function AIChatBoxWithModelSwitch({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Ask me anything...",
  className,
  height = 600,
  emptyStateMessage = "Start a conversation with your AI assistant",
  suggestedPrompts = [],
  defaultModel = "gemini-flash",
}: AIChatBoxWithModelSwitchProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [showModelSettings, setShowModelSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    onSendMessage(input, selectedModel);
    setInput("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onSendMessage(prompt, selectedModel);
  };

  return (
    <Card className={cn("bg-slate-800 border-purple-500/20 flex flex-col", className)}>
      {/* Header with Model Selector */}
      <CardHeader className="pb-3 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Chat Assistant
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowModelSettings(!showModelSettings)}
            className="text-purple-300 hover:text-purple-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Model Switcher */}
        {showModelSettings && (
          <div className="mt-3 pt-3 border-t border-purple-500/20">
            <ModelSwitcherConnected
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              action="chat"
            />
          </div>
        )}

        {/* Current Model Display */}
        {!showModelSettings && (
          <div className="text-xs text-purple-300 mt-2">
            Using: <span className="font-semibold text-purple-200">{selectedModel}</span>
          </div>
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4" style={{ height: typeof height === "number" ? `${height - 200}px` : height }}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Sparkles className="w-12 h-12 text-purple-400/50 mb-3" />
                <p className="text-purple-300 mb-6">{emptyStateMessage}</p>

                {suggestedPrompts.length > 0 && (
                  <div className="w-full space-y-2">
                    <p className="text-xs text-purple-400 mb-3">Suggested prompts:</p>
                    {suggestedPrompts.map((prompt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="w-full text-left border-purple-500/30 text-purple-300 hover:bg-purple-600/20 justify-start"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role !== "user" && (
                      <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-purple-300" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        msg.role === "user"
                          ? "bg-blue-600/30 text-blue-100 border border-blue-500/30"
                          : "bg-slate-700/50 text-purple-100 border border-purple-500/20"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.model && (
                        <p className="text-xs text-purple-300 mt-1 opacity-70">via {msg.model}</p>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-300" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />
                    </div>
                    <div className="bg-slate-700/50 text-purple-100 px-4 py-2 rounded-lg border border-purple-500/20">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <div className="border-t border-purple-500/20 p-4 space-y-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            className="min-h-12 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-purple-500/20"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        <div className="text-xs text-purple-300 flex items-center justify-between">
          <span>Current Model: {selectedModel}</span>
          <span className="text-purple-400">Shift+Enter for new line</span>
        </div>
      </div>
    </Card>
  );
}
