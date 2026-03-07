import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2, Mic, MicOff, Download, Bell, Upload } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRealtimeCollaboration } from "@/hooks/useRealtimeCollaboration";
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
  const searchParams = new URLSearchParams(window.location.search);
  const personalityParam = searchParams.get("personality") || "friendly";

  useState(() => {
    setPersonality(personalityParam);
  });

  const [messages, setMessages] = useState<
    Array<{ id?: number; role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [personality, setPersonality] = useState("friendly");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // WebSocket collaboration
  const { activeUsers, isConnected } = useRealtimeCollaboration({
    conversationId: conversationId?.toString() || "",
    userId: user?.id || 0,
    userName: user?.name || "Anonymous",
  });

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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          setInput(data.text || "");
        } catch (error) {
          console.error("Transcription failed:", error);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    setIsLoading(true);
    try {
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

      // নোটিফিকেশন দেখান
      toast.success("নতুন উত্তর পেয়েছেন / New response received", {
        icon: <Bell className="w-4 h-4" />,
      });

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">চ্যাট</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-slate-500">AI ব্যক্তিত্ব: {personality === "friendly" ? "বন্ধুত্বপূর্ণ" : personality === "professional" ? "পেশাদার" : personality === "teacher" ? "শিক্ষক" : "সৃজনশীল"}</p>
            {isConnected && activeUsers.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-600">{activeUsers.length} সহযোগী</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportAsText}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-8">
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
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className="group">
                  <div
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
                  <div className={`flex gap-1 mt-2 ${msg.role === "user" ? "justify-end" : "justify-start"} opacity-0 group-hover:opacity-100 transition-opacity px-4`}>
                    <button onClick={() => toast.success("👍 রিঅ্যাকশন যোগ করা হয়েছে")} className="text-lg hover:scale-125 transition-transform">👍</button>
                    <button onClick={() => toast.success("❤️ রিঅ্যাকশন যোগ করা হয়েছে")} className="text-lg hover:scale-125 transition-transform">❤️</button>
                    <button onClick={() => toast.success("😂 রিঅ্যাকশন যোগ করা হয়েছে")} className="text-lg hover:scale-125 transition-transform">😂</button>
                    <button onClick={() => toast.success("😮 রিঅ্যাকশন যোগ করা হয়েছে")} className="text-lg hover:scale-125 transition-transform">😮</button>
                    <button onClick={() => toast.success("🔖 বুকমার্ক করা হয়েছে")} className="text-lg hover:scale-125 transition-transform">🔖</button>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-800 border border-slate-200 rounded-lg rounded-bl-none shadow-sm px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white shadow-lg px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="বার্তা লিখুন... / Type a message..."
            disabled={isLoading}
            className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            type="button"
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.onchange = () => {
                if (fileInput.files?.[0]) {
                  toast.success('File: ' + fileInput.files[0].name + ' ready to share');
                }
              };
              fileInput.click();
            }}
            variant="outline"
            size="icon"
            className="text-slate-600"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            onClick={
              isRecording ? handleStopRecording : handleStartRecording
            }
            variant="outline"
            size="icon"
            className={
              isRecording
                ? "bg-red-50 text-red-600 border-red-300"
                : "text-slate-600"
            }
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
          <AlertDialogTitle>কথোপকথন মুছুন?</AlertDialogTitle>
          <AlertDialogDescription>
            এই কথোপকথনটি চিরতরে মুছে ফেলা হবে এবং পুনরুদ্ধার করা যাবে না।
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
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
