/**
 * Real-time Collaboration Service
 * Enables multiple users to collaborate on conversations in real-time
 */

import { EventEmitter } from 'events';

export interface CollaborationSession {
  id: string;
  conversationId: string;
  participants: CollaborationParticipant[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CollaborationParticipant {
  userId: number;
  userName: string;
  userEmail: string;
  joinedAt: Date;
  lastActivity: Date;
  cursorPosition?: { line: number; column: number };
  isTyping: boolean;
  color: string;
}

export interface CollaborationEvent {
  type: 'message' | 'typing' | 'cursor' | 'join' | 'leave' | 'edit' | 'delete';
  userId: number;
  conversationId: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface SharedMessage {
  id: string;
  conversationId: string;
  userId: number;
  userName: string;
  content: string;
  editedBy?: number;
  editedAt?: Date;
  reactions: Map<string, number[]>; // emoji -> [userIds]
  mentions: number[]; // mentioned user IDs
  createdAt: Date;
  updatedAt: Date;
}

const sessions: Map<string, CollaborationSession> = new Map();
const sharedMessages: Map<string, SharedMessage> = new Map();
const eventEmitter = new EventEmitter();

/**
 * Create collaboration session
 */
export function createCollaborationSession(
  conversationId: string,
  initiatorId: number,
  initiatorName: string,
  initiatorEmail: string
): CollaborationSession {
  const sessionId = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const session: CollaborationSession = {
    id: sessionId,
    conversationId,
    participants: [
      {
        userId: initiatorId,
        userName: initiatorName,
        userEmail: initiatorEmail,
        joinedAt: new Date(),
        lastActivity: new Date(),
        isTyping: false,
        color: generateUserColor(initiatorId),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };

  sessions.set(sessionId, session);
  return session;
}

/**
 * Join collaboration session
 */
export function joinCollaborationSession(
  sessionId: string,
  userId: number,
  userName: string,
  userEmail: string
): CollaborationSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  const existingParticipant = session.participants.find((p) => p.userId === userId);
  if (!existingParticipant) {
    session.participants.push({
      userId,
      userName,
      userEmail,
      joinedAt: new Date(),
      lastActivity: new Date(),
      isTyping: false,
      color: generateUserColor(userId),
    });

    emitCollaborationEvent({
      type: 'join',
      userId,
      conversationId: session.conversationId,
      sessionId,
      timestamp: new Date(),
      data: { userName, userEmail },
    });
  }

  session.updatedAt = new Date();
  return session;
}

/**
 * Leave collaboration session
 */
export function leaveCollaborationSession(
  sessionId: string,
  userId: number
): CollaborationSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  session.participants = session.participants.filter((p) => p.userId !== userId);

  emitCollaborationEvent({
    type: 'leave',
    userId,
    conversationId: session.conversationId,
    sessionId,
    timestamp: new Date(),
    data: {},
  });

  // Close session if no participants
  if (session.participants.length === 0) {
    session.isActive = false;
  }

  session.updatedAt = new Date();
  return session;
}

/**
 * Get collaboration session
 */
export function getCollaborationSession(sessionId: string): CollaborationSession | undefined {
  return sessions.get(sessionId);
}

/**
 * Get session by conversation ID
 */
export function getSessionByConversationId(conversationId: string): CollaborationSession | undefined {
  for (const [_, session] of sessions) {
    if (session.conversationId === conversationId && session.isActive) {
      return session;
    }
  }
  return undefined;
}

/**
 * Update typing status
 */
export function updateTypingStatus(
  sessionId: string,
  userId: number,
  isTyping: boolean
): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  const participant = session.participants.find((p) => p.userId === userId);
  if (participant) {
    participant.isTyping = isTyping;
    participant.lastActivity = new Date();

    emitCollaborationEvent({
      type: 'typing',
      userId,
      conversationId: session.conversationId,
      sessionId,
      timestamp: new Date(),
      data: { isTyping },
    });
  }
}

/**
 * Update cursor position
 */
export function updateCursorPosition(
  sessionId: string,
  userId: number,
  line: number,
  column: number
): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  const participant = session.participants.find((p) => p.userId === userId);
  if (participant) {
    participant.cursorPosition = { line, column };
    participant.lastActivity = new Date();

    emitCollaborationEvent({
      type: 'cursor',
      userId,
      conversationId: session.conversationId,
      sessionId,
      timestamp: new Date(),
      data: { line, column },
    });
  }
}

/**
 * Add shared message
 */
export function addSharedMessage(
  conversationId: string,
  userId: number,
  userName: string,
  content: string,
  mentions: number[] = []
): SharedMessage {
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const message: SharedMessage = {
    id: messageId,
    conversationId,
    userId,
    userName,
    content,
    reactions: new Map(),
    mentions,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  sharedMessages.set(messageId, message);

  emitCollaborationEvent({
    type: 'message',
    userId,
    conversationId,
    sessionId: `conv-${conversationId}`,
    timestamp: new Date(),
    data: { messageId, content, mentions },
  });

  return message;
}

/**
 * Edit shared message
 */
export function editSharedMessage(
  messageId: string,
  userId: number,
  newContent: string
): SharedMessage | undefined {
  const message = sharedMessages.get(messageId);
  if (!message) return undefined;

  message.content = newContent;
  message.editedBy = userId;
  message.editedAt = new Date();
  message.updatedAt = new Date();

  emitCollaborationEvent({
    type: 'edit',
    userId,
    conversationId: message.conversationId,
    sessionId: `msg-${messageId}`,
    timestamp: new Date(),
    data: { messageId, newContent },
  });

  return message;
}

/**
 * Delete shared message
 */
export function deleteSharedMessage(messageId: string, userId: number): boolean {
  const message = sharedMessages.get(messageId);
  if (!message) return false;

  emitCollaborationEvent({
    type: 'delete',
    userId,
    conversationId: message.conversationId,
    sessionId: `msg-${messageId}`,
    timestamp: new Date(),
    data: { messageId },
  });

  sharedMessages.delete(messageId);
  return true;
}

/**
 * Add reaction to message
 */
export function addReactionToMessage(
  messageId: string,
  userId: number,
  emoji: string
): SharedMessage | undefined {
  const message = sharedMessages.get(messageId);
  if (!message) return undefined;

  if (!message.reactions.has(emoji)) {
    message.reactions.set(emoji, []);
  }

  const userIds = message.reactions.get(emoji)!;
  if (!userIds.includes(userId)) {
    userIds.push(userId);
  }

  message.updatedAt = new Date();
  return message;
}

/**
 * Remove reaction from message
 */
export function removeReactionFromMessage(
  messageId: string,
  userId: number,
  emoji: string
): SharedMessage | undefined {
  const message = sharedMessages.get(messageId);
  if (!message) return undefined;

  const userIds = message.reactions.get(emoji);
  if (userIds) {
    const index = userIds.indexOf(userId);
    if (index > -1) {
      userIds.splice(index, 1);
    }

    if (userIds.length === 0) {
      message.reactions.delete(emoji);
    }
  }

  message.updatedAt = new Date();
  return message;
}

/**
 * Get shared message
 */
export function getSharedMessage(messageId: string): SharedMessage | undefined {
  return sharedMessages.get(messageId);
}

/**
 * Get conversation messages
 */
export function getConversationMessages(conversationId: string): SharedMessage[] {
  const messages: SharedMessage[] = [];
  for (const [_, message] of sharedMessages) {
    if (message.conversationId === conversationId) {
      messages.push(message);
    }
  }
  return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/**
 * Emit collaboration event
 */
export function emitCollaborationEvent(event: CollaborationEvent): void {
  eventEmitter.emit(`collab:${event.conversationId}`, event);
}

/**
 * Subscribe to collaboration events
 */
export function subscribeToCollaborationEvents(
  conversationId: string,
  callback: (event: CollaborationEvent) => void
): void {
  eventEmitter.on(`collab:${conversationId}`, callback);
}

/**
 * Unsubscribe from collaboration events
 */
export function unsubscribeFromCollaborationEvents(
  conversationId: string,
  callback: (event: CollaborationEvent) => void
): void {
  eventEmitter.off(`collab:${conversationId}`, callback);
}

/**
 * Generate user color for UI
 */
function generateUserColor(userId: number): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];
  return colors[userId % colors.length];
}

/**
 * Get active sessions count
 */
export function getActiveSessionsCount(): number {
  let count = 0;
  for (const [_, session] of sessions) {
    if (session.isActive) count++;
  }
  return count;
}

/**
 * Get collaboration statistics
 */
export function getCollaborationStats() {
  return {
    activeSessions: getActiveSessionsCount(),
    totalSessions: sessions.size,
    totalMessages: sharedMessages.size,
    sessions: Array.from(sessions.values()).map((s) => ({
      id: s.id,
      conversationId: s.conversationId,
      participantCount: s.participants.length,
      isActive: s.isActive,
      createdAt: s.createdAt,
    })),
  };
}

/**
 * Cleanup inactive sessions
 */
export function cleanupInactiveSessions(maxInactiveMinutes: number = 60): number {
  const cutoffTime = Date.now() - maxInactiveMinutes * 60 * 1000;
  let cleaned = 0;

  const sessionsToDelete: string[] = [];
  for (const [sessionId, session] of sessions) {
    if (!session.isActive && session.updatedAt.getTime() < cutoffTime) {
      sessionsToDelete.push(sessionId);
      cleaned++;
    }
  }

  sessionsToDelete.forEach((id) => sessions.delete(id));
  console.log(`[Collaboration] Cleaned up ${cleaned} inactive sessions`);

  return cleaned;
}
