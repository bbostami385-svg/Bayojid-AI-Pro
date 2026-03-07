import React, { useState, useCallback, useEffect } from "react";
import { useRealtimeCollaboration, CollaborativeUser } from "@/hooks/useRealtimeCollaboration";
import { useTouchInteractions } from "@/hooks/useTouchInteractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Send, Loader } from "lucide-react";

interface CollaborativeChatProps {
  conversationId: string;
  userId: number;
  userName: string;
  messages: any[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

/**
 * Collaborative Chat Component
 * Displays active users, their cursors, and enables real-time collaboration
 */
export function CollaborativeChat({
  conversationId,
  userId,
  userName,
  messages,
  onSendMessage,
  isLoading = false,
}: CollaborativeChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [cursorPositions, setCursorPositions] = useState<Map<number, { x: number; y: number }>>(
    new Map()
  );

  const {
    isConnected,
    activeUsers,
    sendCursorPosition,
    sendContentChange,
    disconnect,
  } = useRealtimeCollaboration({
    conversationId,
    userId,
    userName,
    onUserJoined: (user) => {
      console.log(`User joined: ${user.name}`);
    },
    onUserLeft: (userId) => {
      setCursorPositions((prev) => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
    },
    onCursorMove: (userId, position) => {
      setCursorPositions((prev) => {
        const updated = new Map(prev);
        updated.set(userId, position);
        return updated;
      });
    },
    onContentChange: (data) => {
      console.log("Content changed:", data);
    },
  });

  // Handle mouse move for cursor tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isConnected) {
        sendCursorPosition({
          x: e.clientX,
          y: e.clientY,
        });
      }
    },
    [isConnected, sendCursorPosition]
  );

  // Handle message input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setMessageInput(value);
      if (isConnected) {
        sendContentChange({
          type: "typing",
          content: value,
        });
      }
    },
    [isConnected, sendContentChange]
  );

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
      if (isConnected) {
        sendContentChange({
          type: "message_sent",
          content: messageInput,
        });
      }
    }
  }, [messageInput, onSendMessage, isConnected, sendContentChange]);

  // Touch interactions
  const touchHandlers = useTouchInteractions({
    onSwipeUp: () => {
      console.log("Swiped up - scroll up");
    },
    onSwipeDown: () => {
      console.log("Swiped down - scroll down");
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <div
      className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg"
      onMouseMove={handleMouseMove}
      {...touchHandlers}
    >
      {/* Header with active users */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {activeUsers.length + 1} {activeUsers.length === 0 ? "ব্যবহারকারী" : "ব্যবহারকারীরা"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`${
              isConnected
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {isConnected ? "সংযুক্ত" : "বিচ্ছিন্ন"}
          </Badge>
        </div>
      </div>

      {/* Active users list */}
      {activeUsers.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {user.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <p>কোনো বার্তা নেই। কথোপকথন শুরু করুন!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className="flex gap-3 animate-in fade-in slide-in-from-bottom-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor:
                    activeUsers.find((u) => u.id === message.userId)?.color || "#999",
                }}
              >
                {message.userName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {message.userName}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(message.timestamp).toLocaleTimeString("bn-BD")}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Collaborative cursors visualization */}
      {cursorPositions.size > 0 && (
        <div className="relative h-1 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          {Array.from(cursorPositions.entries()).map(([userId, position]) => {
            const user = activeUsers.find((u) => u.id === userId);
            return (
              <div
                key={userId}
                className="absolute w-1 h-4 pointer-events-none"
                style={{
                  left: `${(position.x / window.innerWidth) * 100}%`,
                  backgroundColor: user?.color || "#999",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex gap-2">
          <textarea
            value={messageInput}
            onChange={handleInputChange}
            placeholder="আপনার বার্তা লিখুন..."
            className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Ctrl+Enter দিয়ে পাঠান
        </p>
      </div>
    </div>
  );
}

export default CollaborativeChat;
