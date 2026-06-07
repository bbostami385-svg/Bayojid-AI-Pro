import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, Send, User, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";
import ChatModelSwitcher, { ChatModel } from "./ChatModelSwitcher";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIChatBoxEnhancedProps = {
  messages: Message[];
  onSendMessage: (content: string, modelId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  height?: string | number;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
  
  // Model selection props
  availableModels?: ChatModel[];
  currentModel?: ChatModel;
  userCredits?: number;
  onModelChange?: (model: ChatModel) => void;
};

export function AIChatBoxEnhanced({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className,
  height = "600px",
  emptyStateMessage = "Start a conversation with AI",
  suggestedPrompts,
  availableModels = [],
  currentModel,
  userCredits = 0,
  onModelChange,
}: AIChatBoxEnhancedProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<ChatModel | undefined>(currentModel);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayMessages = messages.filter((msg) => msg.role !== "system");
  const [minHeightForLastMessage, setMinHeightForLastMessage] = useState(0);

  useEffect(() => {
    if (containerRef.current && inputAreaRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const inputHeight = inputAreaRef.current.offsetHeight;
      const scrollAreaHeight = containerHeight - inputHeight;
      const userMessageReservedHeight = 56;
      const calculatedHeight = scrollAreaHeight - 32 - userMessageReservedHeight;
      setMinHeightForLastMessage(Math.max(0, calculatedHeight));
    }
  }, []);

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement;

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !selectedModel) return;

    onSendMessage(trimmedInput, selectedModel.modelId);
    setInput("");
    scrollToBottom();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleModelChange = (model: ChatModel) => {
    setSelectedModel(model);
    onModelChange?.(model);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-card text-card-foreground rounded-lg border shadow-sm",
        className
      )}
      style={{ height }}
    >
      {/* Header with Model Selector */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Chat
          </h3>
          <div className="text-xs text-muted-foreground">
            Credits: {userCredits}
          </div>
        </div>
        
        {/* Model Switcher */}
        {selectedModel && availableModels.length > 0 && (
          <ChatModelSwitcher
            currentModel={selectedModel}
            availableModels={availableModels}
            userCredits={userCredits}
            onModelChange={handleModelChange}
            disabled={isLoading}
          />
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {displayMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">{emptyStateMessage}</p>
                {suggestedPrompts && suggestedPrompts.length > 0 && (
                  <div className="space-y-2 w-full">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      Try asking:
                    </p>
                    {suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(prompt);
                          textareaRef.current?.focus();
                        }}
                        className="block w-full text-left px-3 py-2 rounded border border-border hover:bg-accent transition-colors text-sm"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {displayMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-md lg:max-w-2xl",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <p className="text-muted-foreground text-sm">Thinking...</p>
                    </div>
                  </div>
                )}

                <div
                  style={{ minHeight: `${minHeightForLastMessage}px` }}
                  className="flex-shrink-0"
                />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <form
        ref={inputAreaRef}
        onSubmit={handleSubmit}
        className="border-t p-4 bg-card space-y-2"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || !selectedModel}
          className="resize-none"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedModel && (
              <>
                Model: <span className="font-medium">{selectedModel.name}</span>
                {" • "}
                Cost: <span className="font-medium">{selectedModel.costPerRequest}</span> credits
              </>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !selectedModel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AIChatBoxEnhanced;
