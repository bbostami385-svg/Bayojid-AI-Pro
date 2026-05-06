/**
 * WebSocket Client for React Native Mobile App
 * Handles real-time notifications and user activity sync
 */

import { io, Socket } from 'socket.io-client';

export interface MobileNotification {
  type: 'user_activity' | 'admin_alert' | 'system_event' | 'analytics_update';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastHeartbeat: Date;
  reconnectAttempts: number;
  userId?: number;
}

export class MobileWebSocketClient {
  private socket: Socket | null = null;
  private baseUrl: string;
  private userId: number | null = null;
  private role: 'admin' | 'user' = 'user';
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastHeartbeat: new Date(),
    reconnectAttempts: 0,
  };
  private notificationHandlers: Array<(notification: MobileNotification) => void> = [];
  private connectionHandlers: Array<(status: ConnectionStatus) => void> = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Connect to WebSocket server
   */
  public connect(userId: number, role: 'admin' | 'user' = 'user', token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        this.role = role;

        this.socket = io(this.baseUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          auth: {
            token,
            userId,
            role,
          },
        });

        this.setupEventHandlers();
        this.startHeartbeat();

        this.socket.on('connected', () => {
          this.connectionStatus.isConnected = true;
          this.connectionStatus.reconnectAttempts = 0;
          this.notifyConnectionStatus();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.connectionStatus.reconnectAttempts++;
          this.notifyConnectionStatus();
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.connectionStatus.isConnected = false;
    this.notifyConnectionStatus();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Handle incoming notifications
    this.socket.on('user_activity', (data: MobileNotification) => {
      this.handleNotification(data);
    });

    this.socket.on('admin_alert', (data: MobileNotification) => {
      this.handleNotification(data);
    });

    this.socket.on('system_event', (data: MobileNotification) => {
      this.handleNotification(data);
    });

    this.socket.on('analytics_update', (data: MobileNotification) => {
      this.handleNotification(data);
    });

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectionStatus.isConnected = true;
      this.notifyConnectionStatus();
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connectionStatus.isConnected = false;
      this.notifyConnectionStatus();
    });

    this.socket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
      this.connectionStatus.reconnectAttempts++;
      this.notifyConnectionStatus();
    });

    // Handle heartbeat
    this.socket.on('heartbeat_ack', () => {
      this.connectionStatus.lastHeartbeat = new Date();
    });
  }

  /**
   * Send user action to server
   */
  public sendUserAction(action: string, data?: Record<string, any>): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit('action', {
      type: 'action',
      action,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Send message to server
   */
  public sendMessage(conversationId: number, message: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit('new_message', {
      conversationId,
      message: {
        content: message,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Join conversation room
   */
  public joinConversation(conversationId: number): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit('join_conversation', {
      conversationId,
      userId: this.userId,
      userName: `User ${this.userId}`,
    });
  }

  /**
   * Leave conversation room
   */
  public leaveConversation(conversationId: number): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit('leave_conversation', {
      conversationId,
      userId: this.userId,
    });
  }

  /**
   * Send typing indicator
   */
  public sendTypingIndicator(conversationId: number): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('user_typing', {
      conversationId,
      userId: this.userId,
      userName: `User ${this.userId}`,
    });
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: MobileNotification): void {
    console.log('Notification received:', notification);
    this.notificationHandlers.forEach((handler) => handler(notification));
  }

  /**
   * Notify connection status change
   */
  private notifyConnectionStatus(): void {
    this.connectionHandlers.forEach((handler) => handler(this.connectionStatus));
  }

  /**
   * Register notification handler
   */
  public onNotification(handler: (notification: MobileNotification) => void): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Register connection status handler
   */
  public onConnectionStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connectionStatus.isConnected && this.socket?.connected === true;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
let mobileWebSocketClient: MobileWebSocketClient | null = null;

export function initializeMobileWebSocketClient(baseUrl: string): MobileWebSocketClient {
  if (!mobileWebSocketClient) {
    mobileWebSocketClient = new MobileWebSocketClient(baseUrl);
  }
  return mobileWebSocketClient;
}

export function getMobileWebSocketClient(): MobileWebSocketClient | null {
  return mobileWebSocketClient;
}
