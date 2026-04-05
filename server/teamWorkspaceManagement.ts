/**
 * Team Workspace Management Service
 * Manages teams, workspaces, roles, and permissions
 */

export type UserRole = 'owner' | 'admin' | 'member' | 'guest';
export type Permission = 
  | 'create_conversation'
  | 'edit_conversation'
  | 'delete_conversation'
  | 'share_conversation'
  | 'manage_team'
  | 'manage_members'
  | 'manage_permissions'
  | 'view_analytics'
  | 'manage_billing';

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: number;
  members: TeamMember[];
  workspaces: Workspace[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface TeamMember {
  userId: number;
  userName: string;
  userEmail: string;
  role: UserRole;
  permissions: Permission[];
  joinedAt: Date;
  lastActive: Date;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Workspace {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  createdBy: number;
  members: number[];
  conversations: string[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowInvites: boolean;
  defaultRole: UserRole;
  maxMembers?: number;
  features: {
    collaboration: boolean;
    analytics: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: UserRole;
  invitedBy: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface RolePermissionMap {
  owner: Permission[];
  admin: Permission[];
  member: Permission[];
  guest: Permission[];
}

const teams: Map<string, Team> = new Map();
const workspaces: Map<string, Workspace> = new Map();
const invitations: Map<string, TeamInvitation> = new Map();

// Default role permissions
const defaultRolePermissions: RolePermissionMap = {
  owner: [
    'create_conversation',
    'edit_conversation',
    'delete_conversation',
    'share_conversation',
    'manage_team',
    'manage_members',
    'manage_permissions',
    'view_analytics',
    'manage_billing',
  ],
  admin: [
    'create_conversation',
    'edit_conversation',
    'delete_conversation',
    'share_conversation',
    'manage_team',
    'manage_members',
    'view_analytics',
  ],
  member: [
    'create_conversation',
    'edit_conversation',
    'share_conversation',
    'view_analytics',
  ],
  guest: [
    'create_conversation',
    'share_conversation',
  ],
};

/**
 * Create team
 */
export function createTeam(
  ownerId: number,
  ownerName: string,
  ownerEmail: string,
  name: string,
  description?: string
): Team {
  const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const team: Team = {
    id: teamId,
    name,
    description,
    ownerId,
    members: [
      {
        userId: ownerId,
        userName: ownerName,
        userEmail: ownerEmail,
        role: 'owner',
        permissions: defaultRolePermissions.owner,
        joinedAt: new Date(),
        lastActive: new Date(),
        status: 'active',
      },
    ],
    workspaces: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };

  teams.set(teamId, team);
  return team;
}

/**
 * Get team
 */
export function getTeam(teamId: string): Team | undefined {
  return teams.get(teamId);
}

/**
 * Get user teams
 */
export function getUserTeams(userId: number): Team[] {
  const userTeams: Team[] = [];

  for (const team of teams.values()) {
    if (team.members.some((m) => m.userId === userId)) {
      userTeams.push(team);
    }
  }

  return userTeams;
}

/**
 * Invite member to team
 */
export function inviteMemberToTeam(
  teamId: string,
  email: string,
  role: UserRole,
  invitedBy: number
): TeamInvitation {
  const team = teams.get(teamId);
  if (!team) throw new Error('Team not found');

  const invitationId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const invitation: TeamInvitation = {
    id: invitationId,
    teamId,
    email,
    role,
    invitedBy,
    status: 'pending',
    expiresAt,
    createdAt: new Date(),
  };

  invitations.set(invitationId, invitation);
  return invitation;
}

/**
 * Accept team invitation
 */
export function acceptTeamInvitation(
  invitationId: string,
  userId: number,
  userName: string,
  userEmail: string
): Team | undefined {
  const invitation = invitations.get(invitationId);
  if (!invitation) return undefined;

  if (invitation.status !== 'pending') return undefined;
  if (new Date() > invitation.expiresAt) {
    invitation.status = 'expired';
    return undefined;
  }

  const team = teams.get(invitation.teamId);
  if (!team) return undefined;

  // Add member to team
  team.members.push({
    userId,
    userName,
    userEmail,
    role: invitation.role,
    permissions: defaultRolePermissions[invitation.role],
    joinedAt: new Date(),
    lastActive: new Date(),
    status: 'active',
  });

  invitation.status = 'accepted';
  team.updatedAt = new Date();

  return team;
}

/**
 * Remove member from team
 */
export function removeMemberFromTeam(teamId: string, userId: number): Team | undefined {
  const team = teams.get(teamId);
  if (!team) return undefined;

  team.members = team.members.filter((m) => m.userId !== userId);
  team.updatedAt = new Date();

  return team;
}

/**
 * Update member role
 */
export function updateMemberRole(
  teamId: string,
  userId: number,
  newRole: UserRole
): TeamMember | undefined {
  const team = teams.get(teamId);
  if (!team) return undefined;

  const member = team.members.find((m) => m.userId === userId);
  if (!member) return undefined;

  member.role = newRole;
  member.permissions = defaultRolePermissions[newRole];
  team.updatedAt = new Date();

  return member;
}

/**
 * Create workspace
 */
export function createWorkspace(
  teamId: string,
  name: string,
  createdBy: number,
  description?: string
): Workspace {
  const team = teams.get(teamId);
  if (!team) throw new Error('Team not found');

  const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const workspace: Workspace = {
    id: workspaceId,
    teamId,
    name,
    description,
    createdBy,
    members: [createdBy],
    conversations: [],
    settings: {
      isPublic: false,
      allowInvites: true,
      defaultRole: 'member',
      features: {
        collaboration: true,
        analytics: true,
        customBranding: false,
        apiAccess: false,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  workspaces.set(workspaceId, workspace);
  team.workspaces.push(workspace);
  team.updatedAt = new Date();

  return workspace;
}

/**
 * Get workspace
 */
export function getWorkspace(workspaceId: string): Workspace | undefined {
  return workspaces.get(workspaceId);
}

/**
 * Get team workspaces
 */
export function getTeamWorkspaces(teamId: string): Workspace[] {
  return Array.from(workspaces.values()).filter((w) => w.teamId === teamId);
}

/**
 * Add member to workspace
 */
export function addMemberToWorkspace(workspaceId: string, userId: number): Workspace | undefined {
  const workspace = workspaces.get(workspaceId);
  if (!workspace) return undefined;

  if (!workspace.members.includes(userId)) {
    workspace.members.push(userId);
    workspace.updatedAt = new Date();
  }

  return workspace;
}

/**
 * Remove member from workspace
 */
export function removeMemberFromWorkspace(
  workspaceId: string,
  userId: number
): Workspace | undefined {
  const workspace = workspaces.get(workspaceId);
  if (!workspace) return undefined;

  workspace.members = workspace.members.filter((m) => m !== userId);
  workspace.updatedAt = new Date();

  return workspace;
}

/**
 * Add conversation to workspace
 */
export function addConversationToWorkspace(
  workspaceId: string,
  conversationId: string
): Workspace | undefined {
  const workspace = workspaces.get(workspaceId);
  if (!workspace) return undefined;

  if (!workspace.conversations.includes(conversationId)) {
    workspace.conversations.push(conversationId);
    workspace.updatedAt = new Date();
  }

  return workspace;
}

/**
 * Check permission
 */
export function hasPermission(
  teamId: string,
  userId: number,
  permission: Permission
): boolean {
  const team = teams.get(teamId);
  if (!team) return false;

  const member = team.members.find((m) => m.userId === userId);
  if (!member) return false;

  return member.permissions.includes(permission);
}

/**
 * Get team statistics
 */
export function getTeamStats(teamId: string) {
  const team = teams.get(teamId);
  if (!team) return null;

  const teamWorkspaces = getTeamWorkspaces(teamId);

  return {
    teamId,
    teamName: team.name,
    memberCount: team.members.length,
    workspaceCount: teamWorkspaces.length,
    totalConversations: teamWorkspaces.reduce((sum, ws) => sum + ws.conversations.length, 0),
    activeMembers: team.members.filter((m) => m.status === 'active').length,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

/**
 * Get team members
 */
export function getTeamMembers(teamId: string): TeamMember[] {
  const team = teams.get(teamId);
  return team ? team.members : [];
}

/**
 * Update team
 */
export function updateTeam(
  teamId: string,
  updates: Partial<Team>
): Team | undefined {
  const team = teams.get(teamId);
  if (!team) return undefined;

  Object.assign(team, updates, { updatedAt: new Date() });
  return team;
}

/**
 * Delete team
 */
export function deleteTeam(teamId: string): boolean {
  const team = teams.get(teamId);
  if (!team) return false;

  // Delete all workspaces
  for (const workspace of team.workspaces) {
    workspaces.delete(workspace.id);
  }

  // Delete all invitations
  const invitationsToDelete: string[] = [];
  for (const [invId, inv] of invitations) {
    if (inv.teamId === teamId) {
      invitationsToDelete.push(invId);
    }
  }
  invitationsToDelete.forEach((id) => invitations.delete(id));

  teams.delete(teamId);
  return true;
}

/**
 * Get pending invitations for team
 */
export function getPendingInvitations(teamId: string): TeamInvitation[] {
  return Array.from(invitations.values()).filter(
    (inv) => inv.teamId === teamId && inv.status === 'pending'
  );
}

/**
 * Cleanup expired invitations
 */
export function cleanupExpiredInvitations(): number {
  let cleaned = 0;
  const now = new Date();

  const toDelete: string[] = [];
  for (const [invId, inv] of invitations) {
    if (inv.status === 'pending' && now > inv.expiresAt) {
      inv.status = 'expired';
      toDelete.push(invId);
      cleaned++;
    }
  }

  toDelete.forEach((id) => invitations.delete(id));
  console.log(`[Team] Cleaned up ${cleaned} expired invitations`);

  return cleaned;
}
