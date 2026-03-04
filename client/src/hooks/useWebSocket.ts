import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebSocketOptions {
  conversationId?: number;
  userId?: number;
  userName?: string;
  onMessage?: (data: any) => void;
  onTyping?: (data: any) => void;
  onStopTyping?: (data: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected");

      // Join conversation if provided
      if (options.conversationId && options.userId && options.userName) {
        socket.emit("join_conversation", {
          conversationId: options.conversationId,
          userId: options.userId,
          userName: options.userName,
        });
      }
    });

    // Listen for messages
    socket.on("message_received", (data) => {
      options.onMessage?.(data);
    });

    // Listen for typing indicators
    socket.on("typing_indicator", (data) => {
      options.onTyping?.(data);
    });

    socket.on("stop_typing", (data) => {
      options.onStopTyping?.(data);
    });

    // Listen for user events
    socket.on("user_joined", (data) => {
      options.onUserJoined?.(data);
    });

    socket.on("user_left", (data) => {
      options.onUserLeft?.(data);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [options.conversationId, options.userId]);

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!socketRef.current || !options.conversationId || !options.userId) return;

    socketRef.current.emit("user_typing", {
      conversationId: options.conversationId,
      userId: options.userId,
      userName: options.userName,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {
        conversationId: options.conversationId,
        userId: options.userId,
      });
    }, 3000);
  }, [options.conversationId, options.userId, options.userName]);

  // Send new message
  const sendMessage = useCallback(
    (message: any) => {
      if (!socketRef.current || !options.conversationId) return;

      socketRef.current.emit("new_message", {
        conversationId: options.conversationId,
        message,
      });
    },
    [options.conversationId]
  );

  // Update conversation
  const updateConversation = useCallback(
    (title?: string) => {
      if (!socketRef.current || !options.conversationId) return;

      socketRef.current.emit("conversation_updated", {
        conversationId: options.conversationId,
        title,
      });
    },
    [options.conversationId]
  );

  // Leave conversation
  const leaveConversation = useCallback(() => {
    if (!socketRef.current || !options.conversationId || !options.userId) return;

    socketRef.current.emit("leave_conversation", {
      conversationId: options.conversationId,
      userId: options.userId,
    });
  }, [options.conversationId, options.userId]);

  return {
    socket: socketRef.current,
    sendTyping,
    sendMessage,
    updateConversation,
    leaveConversation,
  };
}
