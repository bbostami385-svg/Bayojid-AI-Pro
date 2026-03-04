import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";


let io: SocketIOServer | null = null;

interface TypingUser {
  userId: number;
  userName: string;
  conversationId: number;
}

const typingUsers = new Map<string, TypingUser>();

export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "*" : "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join conversation room
    socket.on("join_conversation", (data: { conversationId: number; userId: number; userName: string }) => {
      const roomName = `conversation_${data.conversationId}`;
      socket.join(roomName);
      console.log(`User ${data.userId} joined conversation ${data.conversationId}`);

      // Notify others that user joined
      socket.to(roomName).emit("user_joined", {
        userId: data.userId,
        userName: data.userName,
        timestamp: new Date(),
      });
    });

    // Handle typing indicator
    socket.on("user_typing", (data: { conversationId: number; userId: number; userName: string }) => {
      const roomName = `conversation_${data.conversationId}`;
      const typingKey = `${data.conversationId}_${data.userId}`;

      typingUsers.set(typingKey, {
        userId: data.userId,
        userName: data.userName,
        conversationId: data.conversationId,
      });

      socket.to(roomName).emit("typing_indicator", {
        userId: data.userId,
        userName: data.userName,
      });

      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        typingUsers.delete(typingKey);
        socket.to(roomName).emit("stop_typing", { userId: data.userId });
      }, 3000);
    });

    // Handle new message broadcast
    socket.on("new_message", (data: { conversationId: number; message: any }) => {
      const roomName = `conversation_${data.conversationId}`;
      io?.to(roomName).emit("message_received", {
        message: data.message,
        timestamp: new Date(),
      });
    });

    // Handle conversation update
    socket.on("conversation_updated", (data: { conversationId: number; title?: string }) => {
      const roomName = `conversation_${data.conversationId}`;
      io?.to(roomName).emit("conversation_changed", {
        conversationId: data.conversationId,
        title: data.title,
        timestamp: new Date(),
      });
    });

    // Leave conversation
    socket.on("leave_conversation", (data: { conversationId: number; userId: number }) => {
      const roomName = `conversation_${data.conversationId}`;
      socket.leave(roomName);
      console.log(`User ${data.userId} left conversation ${data.conversationId}`);

      socket.to(roomName).emit("user_left", {
        userId: data.userId,
        timestamp: new Date(),
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      // Clean up typing indicators
      typingUsers.forEach((value, key) => {
        if (value.userId === parseInt(socket.id)) {
          typingUsers.delete(key);
        }
      });
    });
  });

  return io;
}

export function getWebSocket(): SocketIOServer | null {
  return io;
}

export function broadcastToConversation(conversationId: number, event: string, data: any) {
  const roomName = `conversation_${conversationId}`;
  io?.to(roomName).emit(event, data);
}
