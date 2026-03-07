import { useCallback, useEffect, useRef, useState } from "react";

export interface CollaborativeUser {
  id: number;
  name: string;
  email: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  isActive: boolean;
}

export interface CollaborationMessage {
  type: "cursor" | "edit" | "selection" | "presence" | "message";
  userId: number;
  userName: string;
  timestamp: number;
  data: any;
}

interface UseRealtimeCollaborationOptions {
  conversationId: string;
  userId: number;
  userName: string;
  onUserJoined?: (user: CollaborativeUser) => void;
  onUserLeft?: (userId: number) => void;
  onCursorMove?: (userId: number, position: { x: number; y: number }) => void;
  onContentChange?: (data: any) => void;
  onMessage?: (message: CollaborationMessage) => void;
}

/**
 * Hook for managing real-time collaboration between multiple users
 * Supports cursor tracking, presence awareness, and content synchronization
 */
export function useRealtimeCollaboration(options: UseRealtimeCollaborationOptions) {
  const [activeUsers, setActiveUsers] = useState<Map<number, CollaborativeUser>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Generate a random color for the user
  const generateUserColor = useCallback(() => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/collaboration/${options.conversationId}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[Collaboration] Connected to real-time server");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send presence message
        sendMessage({
          type: "presence",
          userId: options.userId,
          userName: options.userName,
          timestamp: Date.now(),
          data: {
            status: "online",
            color: generateUserColor(),
          },
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);
          handleCollaborationMessage(message);
        } catch (error) {
          console.error("[Collaboration] Failed to parse message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("[Collaboration] WebSocket error:", error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("[Collaboration] Disconnected from real-time server");
        setIsConnected(false);
        attemptReconnect();
      };
    } catch (error) {
      console.error("[Collaboration] Failed to connect:", error);
      attemptReconnect();
    }
  }, [options.conversationId, options.userId, options.userName, generateUserColor]);

  // Attempt to reconnect with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      console.log(`[Collaboration] Attempting to reconnect in ${delay}ms...`);
      setTimeout(connect, delay);
    }
  }, [connect]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: CollaborationMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Handle incoming collaboration messages
  const handleCollaborationMessage = useCallback(
    (message: CollaborationMessage) => {
      switch (message.type) {
        case "presence":
          // User joined or updated presence
          setActiveUsers((prev) => {
            const updated = new Map(prev);
            updated.set(message.userId, {
              id: message.userId,
              name: message.userName,
              email: message.data.email || "",
              color: message.data.color || "#000000",
              isActive: message.data.status === "online",
            });
            return updated;
          });

          if (options.onUserJoined && message.data.status === "online") {
            options.onUserJoined({
              id: message.userId,
              name: message.userName,
              email: message.data.email || "",
              color: message.data.color || "#000000",
              isActive: true,
            });
          }
          break;

        case "cursor":
          // User moved cursor
          if (options.onCursorMove) {
            options.onCursorMove(message.userId, message.data.position);
          }
          break;

        case "edit":
          // Content was edited
          if (options.onContentChange) {
            options.onContentChange(message.data);
          }
          break;

        case "selection":
          // User selected text
          setActiveUsers((prev) => {
            const updated = new Map(prev);
            const user = updated.get(message.userId);
            if (user) {
              user.cursorPosition = message.data.position;
              updated.set(message.userId, user);
            }
            return updated;
          });
          break;

        default:
          if (options.onMessage) {
            options.onMessage(message);
          }
      }
    },
    [options]
  );

  // Send cursor position
  const sendCursorPosition = useCallback((position: { x: number; y: number }) => {
    sendMessage({
      type: "cursor",
      userId: options.userId,
      userName: options.userName,
      timestamp: Date.now(),
      data: { position },
    });
  }, [options.userId, options.userName, sendMessage]);

  // Send content change
  const sendContentChange = useCallback((data: any) => {
    sendMessage({
      type: "edit",
      userId: options.userId,
      userName: options.userName,
      timestamp: Date.now(),
      data,
    });
  }, [options.userId, options.userName, sendMessage]);

  // Send selection
  const sendSelection = useCallback((position: { x: number; y: number }) => {
    sendMessage({
      type: "selection",
      userId: options.userId,
      userName: options.userName,
      timestamp: Date.now(),
      data: { position },
    });
  }, [options.userId, options.userName, sendMessage]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setActiveUsers(new Map());
  }, []);

  // Initialize connection
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    activeUsers: Array.from(activeUsers.values()),
    sendCursorPosition,
    sendContentChange,
    sendSelection,
    disconnect,
  };
}

/**
 * Hook for managing collaborative presence awareness
 */
export function useCollaborativePresence(conversationId: string, userId: number) {
  const [presenceData, setPresenceData] = useState<Map<number, any>>(new Map());

  useEffect(() => {
    // This would be implemented with the collaboration server
    // For now, it's a placeholder for presence tracking
    console.log(`[Presence] Tracking presence for conversation ${conversationId}`);

    return () => {
      console.log(`[Presence] Stopped tracking presence`);
    };
  }, [conversationId, userId]);

  return presenceData;
}

/**
 * Hook for managing collaborative cursor positions
 */
export function useCollaborativeCursors() {
  const [cursors, setCursors] = useState<Map<number, { x: number; y: number }>>(new Map());

  const updateCursor = useCallback((userId: number, position: { x: number; y: number }) => {
    setCursors((prev) => {
      const updated = new Map(prev);
      updated.set(userId, position);
      return updated;
    });
  }, []);

  const removeCursor = useCallback((userId: number) => {
    setCursors((prev) => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });
  }, []);

  return {
    cursors: Array.from(cursors.entries()),
    updateCursor,
    removeCursor,
  };
}
