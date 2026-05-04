/**
 * Conversation Sharing & Collaboration Service
 * Enables sharing conversations with others and collaborative features
 */

export type SharePermission = 'view' | 'comment' | 'edit' | 'admin';

export interface SharedConversation {
  id: string;
  conversationId: string;
  ownerId: number;
  sharedWith: Array<{
    userId: number;
    permission: SharePermission;
    sharedAt: Date;
  }>;
  shareLink?: {
    token: string;
    expiresAt?: Date;
    maxUses?: number;
    usedCount: number;
  };
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationSession {
  id: string;
  conversationId: string;
  participants: Array<{
    userId: number;
    joinedAt: Date;
    lastActiveAt: Date;
    cursorPosition?: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  endedAt?: Date;
}

export interface ShareNotification {
  id: string;
  recipientId: number;
  senderId: number;
  conversationId: string;
  permission: SharePermission;
  message?: string;
  isRead: boolean;
  createdAt: Date;
}

// In-memory storage
const sharedConversations = new Map<string, SharedConversation>();
const collaborationSessions = new Map<string, CollaborationSession>();
const shareNotifications = new Map<string, ShareNotification>();

/**
 * Share a conversation with a user
 */
export function shareConversation(conversationId: string, ownerId: number, userId: number, permission: SharePermission = 'view'): SharedConversation {
  const id = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let shared = sharedConversations.get(conversationId);

  if (!shared) {
    shared = {
      id,
      conversationId,
      ownerId,
      sharedWith: [],
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Check if already shared with this user
  const existingShare = shared.sharedWith.find((s) => s.userId === userId);
  if (!existingShare) {
    shared.sharedWith.push({
      userId,
      permission,
      sharedAt: new Date(),
    });
  } else {
    existingShare.permission = permission;
  }

  shared.updatedAt = new Date();
  sharedConversations.set(conversationId, shared);

  // Create notification
  createShareNotification(userId, ownerId, conversationId, permission);

  return shared;
}

/**
 * Create a public share link
 */
export function createPublicShareLink(conversationId: string, expiresIn?: number): SharedConversation {
  let shared = sharedConversations.get(conversationId);

  if (!shared) {
    shared = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      ownerId: 0,
      sharedWith: [],
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const token = generateShareToken();
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : undefined;

  shared.shareLink = {
    token,
    expiresAt,
    usedCount: 0,
  };

  shared.isPublic = true;
  shared.updatedAt = new Date();
  sharedConversations.set(conversationId, shared);

  return shared;
}

/**
 * Revoke sharing for a user
 */
export function revokeSharing(conversationId: string, userId: number): boolean {
  const shared = sharedConversations.get(conversationId);
  if (!shared) return false;

  const index = shared.sharedWith.findIndex((s) => s.userId === userId);
  if (index === -1) return false;

  shared.sharedWith.splice(index, 1);
  shared.updatedAt = new Date();

  if (shared.sharedWith.length === 0 && !shared.isPublic) {
    sharedConversations.delete(conversationId);
  }

  return true;
}

/**
 * Get sharing information for a conversation
 */
export function getSharingInfo(conversationId: string): SharedConversation | undefined {
  return sharedConversations.get(conversationId);
}

/**
 * Check if user has access to conversation
 */
export function hasAccess(conversationId: string, userId: number, ownerId: number): boolean {
  if (userId === ownerId) return true;

  const shared = sharedConversations.get(conversationId);
  if (!shared) return false;

  return shared.sharedWith.some((s) => s.userId === userId);
}

/**
 * Get user's permission level
 */
export function getUserPermission(conversationId: string, userId: number, ownerId: number): SharePermission | null {
  if (userId === ownerId) return 'admin';

  const shared = sharedConversations.get(conversationId);
  if (!shared) return null;

  const share = shared.sharedWith.find((s) => s.userId === userId);
  return share?.permission || null;
}

/**
 * Start collaboration session
 */
export function startCollaborationSession(conversationId: string, userId: number): CollaborationSession {
  const id = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let session = collaborationSessions.get(conversationId);

  if (!session) {
    session = {
      id,
      conversationId,
      participants: [],
      isActive: true,
      createdAt: new Date(),
    };
  }

  // Add or update participant
  const existingParticipant = session.participants.find((p) => p.userId === userId);
  if (existingParticipant) {
    existingParticipant.lastActiveAt = new Date();
  } else {
    session.participants.push({
      userId,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
    });
  }

  collaborationSessions.set(conversationId, session);
  return session;
}

/**
 * End collaboration session
 */
export function endCollaborationSession(conversationId: string, userId: number): boolean {
  const session = collaborationSessions.get(conversationId);
  if (!session) return false;

  const index = session.participants.findIndex((p) => p.userId === userId);
  if (index === -1) return false;

  session.participants.splice(index, 1);

  if (session.participants.length === 0) {
    session.isActive = false;
    session.endedAt = new Date();
  }

  return true;
}

/**
 * Get active collaboration session
 */
export function getCollaborationSession(conversationId: string): CollaborationSession | undefined {
  const session = collaborationSessions.get(conversationId);
  return session && session.isActive ? session : undefined;
}

/**
 * Update participant cursor position
 */
export function updateCursorPosition(conversationId: string, userId: number, position: number): boolean {
  const session = collaborationSessions.get(conversationId);
  if (!session) return false;

  const participant = session.participants.find((p) => p.userId === userId);
  if (!participant) return false;

  participant.cursorPosition = position;
  participant.lastActiveAt = new Date();

  return true;
}

/**
 * Create share notification
 */
function createShareNotification(recipientId: number, senderId: number, conversationId: string, permission: SharePermission): void {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const notification: ShareNotification = {
    id,
    recipientId,
    senderId,
    conversationId,
    permission,
    isRead: false,
    createdAt: new Date(),
  };

  shareNotifications.set(id, notification);
}

/**
 * Get share notifications for a user
 */
export function getShareNotifications(userId: number, unreadOnly: boolean = false): ShareNotification[] {
  return Array.from(shareNotifications.values())
    .filter((n) => n.recipientId === userId && (!unreadOnly || !n.isRead))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): boolean {
  const notification = shareNotifications.get(notificationId);
  if (!notification) return false;

  notification.isRead = true;
  return true;
}

/**
 * Get conversations shared with a user
 */
export function getSharedConversations(userId: number): SharedConversation[] {
  return Array.from(sharedConversations.values()).filter((s) => s.sharedWith.some((share) => share.userId === userId));
}

/**
 * Get conversations owned by a user
 */
export function getOwnedConversations(userId: number): SharedConversation[] {
  return Array.from(sharedConversations.values()).filter((s) => s.ownerId === userId);
}

/**
 * Generate unique share token
 */
function generateShareToken(): string {
  return `share_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
}

/**
 * Verify and use share token
 */
export function verifyShareToken(token: string): SharedConversation | null {
  for (const shared of sharedConversations.values()) {
    if (shared.shareLink?.token === token) {
      // Check if expired
      if (shared.shareLink.expiresAt && shared.shareLink.expiresAt < new Date()) {
        return null;
      }

      // Check if max uses exceeded
      if (shared.shareLink.maxUses && shared.shareLink.usedCount >= shared.shareLink.maxUses) {
        return null;
      }

      // Increment usage
      shared.shareLink.usedCount++;
      return shared;
    }
  }

  return null;
}

/**
 * Get collaboration statistics
 */
export function getCollaborationStats(conversationId: string) {
  const shared = sharedConversations.get(conversationId);
  const session = collaborationSessions.get(conversationId);

  return {
    isShared: !!shared,
    sharedWithCount: shared?.sharedWith.length || 0,
    isPublic: shared?.isPublic || false,
    hasPublicLink: !!shared?.shareLink,
    activeCollaborators: session?.participants.length || 0,
    isCollaborating: session?.isActive || false,
  };
}
