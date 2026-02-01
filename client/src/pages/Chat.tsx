import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Chat() {
  const [, params] = useRoute("/chat/:id");
  const conversationId = params?.id ? parseInt(params.id) : null;
  const { user } = useAuth();

  const [messages, setMessages] = useState<
    Array<{ id?: number; role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: messagesList, isLoading: messagesLoading } =
    trpc.chat.getMessages.useQuery(
      { conversationId: conversationId || 0 },
      { enabled: !!conversationId }
    );

  // Mutations
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const deleteConversationMutation =
    trpc.chat.deleteConversation.useMutation();

  // Load messages when conversation changes
  useEffect(() => {
    if (messagesList) {
      setMessages(messagesList);
    }
  }, [messagesList]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    // Optimistic update
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.assistantMessage },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic update on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationId) return;

    try {
      await deleteConversationMutation.mutateAsync({ conversationId });
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-slate-800">চ্যাট</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">কথোপকথন শুরু করুন</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-6">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="আপনার বার্তা লিখুন..."
            disabled={isLoading}
            className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>কথোপকথন মুছে ফেলুন?</AlertDialogTitle>
          <AlertDialogDescription>
            এই কথোপকথনটি চিরতরে মুছে ফেলা হবে এবং পুনরুদ্ধার করা যাবে না।
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
