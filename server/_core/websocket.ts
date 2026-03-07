import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import type { Request } from "express";

interface CollaborativeUser {
  id: number;
  name: string;
  email: string;
  color: string;
  isActive: boolean;
}

interface CollaborationMessage {
  type: "cursor" | "edit" | "selection" | "presence" | "message";
  userId: number;
  userName: string;
  timestamp: number;
  data: any;
}

// Store active connections per conversation
const conversationConnections = new Map<string, Set<WebSocket>>();
const userPresence = new Map<string, Map<number, CollaborativeUser>>();

/**
 * Initialize WebSocket server for real-time collaboration
 */
export function initializeWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: "/api/collaboration",
    perMessageDeflate: false,
  });

  wss.on("connection", (ws: WebSocket, req: Request) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const conversationId = url.pathname.split("/").pop();

    if (!conversationId) {
      ws.close(1008, "Invalid conversation ID");
      return;
    }

    console.log(`[WebSocket] User connected to conversation: ${conversationId}`);

    // Initialize conversation if not exists
    if (!conversationConnections.has(conversationId)) {
      conversationConnections.set(conversationId, new Set());
      userPresence.set(conversationId, new Map());
    }

    const connections = conversationConnections.get(conversationId)!;
    const presence = userPresence.get(conversationId)!;
    connections.add(ws);

    // Handle incoming messages
    ws.on("message", (data: Buffer) => {
      try {
        const message: CollaborationMessage = JSON.parse(data.toString());
        handleCollaborationMessage(message, conversationId, ws, connections, presence);
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    });

    // Handle client disconnect
    ws.on("close", () => {
      console.log(`[WebSocket] User disconnected from conversation: ${conversationId}`);
      connections.delete(ws);

      // Remove user from presence
      let disconnectedUserId: number | null = null;
      const keysToDelete: number[] = [];
      presence.forEach((user, userId) => {
        if (user.id === disconnectedUserId) {
          keysToDelete.push(userId);
        }
      });
      keysToDelete.forEach(key => presence.delete(key));

      // Notify other users
      if (disconnectedUserId) {
        broadcastMessage(
          {
            type: "presence",
            userId: disconnectedUserId,
            userName: "",
            timestamp: Date.now(),
            data: { status: "offline" },
          },
          conversationId,
          connections,
          ws
        );
      }

      // Clean up empty conversations
      if (connections.size === 0) {
        conversationConnections.delete(conversationId);
        userPresence.delete(conversationId);
      }
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
    });
  });

  return wss;
}

/**
 * Handle incoming collaboration messages
 */
function handleCollaborationMessage(
  message: CollaborationMessage,
  conversationId: string,
  sender: WebSocket,
  connections: Set<WebSocket>,
  presence: Map<number, CollaborativeUser>
) {
  switch (message.type) {
    case "presence":
      presence.set(message.userId, {
        id: message.userId,
        name: message.userName,
        email: message.data.email || "",
        color: message.data.color || "#000000",
        isActive: message.data.status === "online",
      });
      broadcastMessage(message, conversationId, connections, sender);
      break;

    case "cursor":
      broadcastMessage(message, conversationId, connections, sender);
      break;

    case "edit":
      broadcastMessage(message, conversationId, connections, sender);
      break;

    case "selection":
      broadcastMessage(message, conversationId, connections, sender);
      break;

    case "message":
      broadcastMessage(message, conversationId, connections, sender);
      break;

    default:
      console.warn("[WebSocket] Unknown message type");
  }
}

/**
 * Broadcast message to all users in a conversation except sender
 */
function broadcastMessage(
  message: CollaborationMessage,
  conversationId: string,
  connections: Set<WebSocket>,
  sender: WebSocket
) {
  const payload = JSON.stringify(message);

  connections.forEach((ws) => {
    if (ws !== sender && ws.readyState === WebSocket.OPEN) {
      ws.send(payload, (error) => {
        if (error) {
          console.error("[WebSocket] Failed to send message:", error);
        }
      });
    }
  });
}

/**
 * Get active users in a conversation
 */
export function getActiveUsers(conversationId: string): CollaborativeUser[] {
  const presence = userPresence.get(conversationId);
  if (!presence) return [];

  const users: CollaborativeUser[] = [];
  presence.forEach((user) => {
    if (user.isActive) {
      users.push(user);
    }
  });
  return users;
}

/**
 * Get connection count for a conversation
 */
export function getConnectionCount(conversationId: string): number {
  const connections = conversationConnections.get(conversationId);
  return connections ? connections.size : 0;
}

/**
 * Close all connections for a conversation
 */
export function closeConversationConnections(conversationId: string) {
  const connections = conversationConnections.get(conversationId);
  if (connections) {
    connections.forEach((ws) => {
      ws.close(1000, "Conversation ended");
    });
    conversationConnections.delete(conversationId);
    userPresence.delete(conversationId);
  }
}
