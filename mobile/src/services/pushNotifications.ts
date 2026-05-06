/**
 * Push Notifications Service for React Native
 * Handles Firebase Cloud Messaging and local notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

export class PushNotificationService {
  private notificationHandlers: Array<(notification: PushNotification) => void> = [];
  private expoPushToken: string | null = null;
  private notifications: Map<string, PushNotification> = new Map();

  constructor() {
    this.setupNotificationHandlers();
  }

  /**
   * Initialize push notifications
   */
  public async initialize(): Promise<string | null> {
    try {
      // Check if device is physical device
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Push notification permission denied');
        return null;
      }

      // Get Expo push token
      const token = await Notifications.getExpoPushTokenAsync();
      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return null;
    }
  }

  /**
   * Setup notification handlers
   */
  private setupNotificationHandlers(): void {
    // Handle notification received while app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        console.log('Notification received:', notification);
        this.handlePushNotification(notification);
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      },
    });

    // Handle notification response (when user taps notification)
    this.notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      const notification = response.notification;
      this.handleNotificationResponse(notification);
    });

    // Handle notification received in background
    this.notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in background:', notification);
      this.handlePushNotification(notification);
    });
  }

  /**
   * Handle push notification
   */
  private handlePushNotification(notification: Notifications.Notification): void {
    const pushNotification: PushNotification = {
      id: notification.request.identifier,
      title: notification.request.content.title || 'Notification',
      body: notification.request.content.body || '',
      data: notification.request.content.data,
      timestamp: new Date(),
      read: false,
    };

    this.notifications.set(pushNotification.id, pushNotification);
    this.notifyHandlers(pushNotification);
  }

  /**
   * Handle notification response (tap)
   */
  private handleNotificationResponse(notification: Notifications.Notification): void {
    const data = notification.request.content.data;
    console.log('User tapped notification with data:', data);

    // Handle different notification types
    if (data?.type === 'conversation') {
      // Navigate to conversation
      console.log('Opening conversation:', data.conversationId);
    } else if (data?.type === 'admin_alert') {
      // Show admin alert
      console.log('Showing admin alert:', data.message);
    }
  }

  /**
   * Send local notification
   */
  public async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    delay: number = 0
  ): Promise<string> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          badge: 1,
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });

      const notification: PushNotification = {
        id,
        title,
        body,
        data,
        timestamp: new Date(),
        read: false,
      };

      this.notifications.set(id, notification);
      this.notifyHandlers(notification);

      return id;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      throw error;
    }
  }

  /**
   * Cancel notification
   */
  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      this.notifications.delete(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notifications.clear();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Get all notifications
   */
  public getAllNotifications(): PushNotification[] {
    return Array.from(this.notifications.values());
  }

  /**
   * Get unread notifications
   */
  public getUnreadNotifications(): PushNotification[] {
    return Array.from(this.notifications.values()).filter((n) => !n.read);
  }

  /**
   * Clear all notifications
   */
  public clearAllNotifications(): void {
    this.notifications.clear();
  }

  /**
   * Register notification handler
   */
  public onNotification(handler: (notification: PushNotification) => void): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Notify all handlers
   */
  private notifyHandlers(notification: PushNotification): void {
    this.notificationHandlers.forEach((handler) => handler(notification));
  }

  /**
   * Get Expo push token
   */
  public getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
    }
  }

  private notificationSubscription: Notifications.Subscription | null = null;
  private notificationResponseSubscription: Notifications.Subscription | null = null;
}

// Export singleton instance
let pushNotificationService: PushNotificationService | null = null;

export function initializePushNotifications(): PushNotificationService {
  if (!pushNotificationService) {
    pushNotificationService = new PushNotificationService();
  }
  return pushNotificationService;
}

export function getPushNotificationService(): PushNotificationService | null {
  return pushNotificationService;
}
