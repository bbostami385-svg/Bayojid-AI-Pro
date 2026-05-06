/**
 * User Segmentation Service
 * Creates and manages user cohorts based on engagement, behavior, and demographics
 */

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentationCriteria;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentationCriteria {
  engagementLevel?: 'high' | 'medium' | 'low';
  engagementScore?: { min: number; max: number };
  subscriptionTier?: ('free' | 'pro' | 'premium')[];
  lastActiveWithin?: number; // days
  totalSessions?: { min: number; max: number };
  location?: string[];
  joinedAfter?: Date;
  joinedBefore?: Date;
  customAttributes?: Record<string, any>;
}

export class UserSegmentationService {
  private segments: Map<string, UserSegment> = new Map();
  private userSegmentMap: Map<number, string[]> = new Map(); // userId -> segmentIds

  constructor() {
    this.initializeDefaultSegments();
  }

  private initializeDefaultSegments() {
    // High Engagement Users
    this.createSegment({
      id: 'high_engagement',
      name: 'High Engagement Users',
      description: 'Users with engagement score > 70%',
      criteria: {
        engagementScore: { min: 70, max: 100 },
      },
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // At-Risk Users (Churn)
    this.createSegment({
      id: 'at_risk',
      name: 'At-Risk Users',
      description: 'Users with low engagement or inactive for 7+ days',
      criteria: {
        engagementScore: { min: 0, max: 30 },
        lastActiveWithin: 7,
      },
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Premium Subscribers
    this.createSegment({
      id: 'premium_users',
      name: 'Premium Subscribers',
      description: 'Users with premium subscription',
      criteria: {
        subscriptionTier: ['premium'],
      },
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // New Users (Last 30 days)
    this.createSegment({
      id: 'new_users',
      name: 'New Users',
      description: 'Users who joined in the last 30 days',
      criteria: {
        joinedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Power Users
    this.createSegment({
      id: 'power_users',
      name: 'Power Users',
      description: 'Users with 100+ sessions and high engagement',
      criteria: {
        totalSessions: { min: 100, max: Infinity },
        engagementScore: { min: 60, max: 100 },
      },
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Free Tier Users
    this.createSegment({
      id: 'free_tier',
      name: 'Free Tier Users',
      description: 'Users on free subscription',
      criteria: {
        subscriptionTier: ['free'],
      },
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public createSegment(segment: UserSegment): UserSegment {
    this.segments.set(segment.id, segment);
    return segment;
  }

  public getSegment(segmentId: string): UserSegment | undefined {
    return this.segments.get(segmentId);
  }

  public getAllSegments(): UserSegment[] {
    return Array.from(this.segments.values());
  }

  public updateSegment(segmentId: string, updates: Partial<UserSegment>): UserSegment | undefined {
    const segment = this.segments.get(segmentId);
    if (segment) {
      const updated = { ...segment, ...updates, updatedAt: new Date() };
      this.segments.set(segmentId, updated);
      return updated;
    }
    return undefined;
  }

  public deleteSegment(segmentId: string): boolean {
    return this.segments.delete(segmentId);
  }

  public assignUserToSegment(userId: number, segmentId: string): boolean {
    if (!this.segments.has(segmentId)) {
      return false;
    }

    const userSegments = this.userSegmentMap.get(userId) || [];
    if (!userSegments.includes(segmentId)) {
      userSegments.push(segmentId);
      this.userSegmentMap.set(userId, userSegments);

      // Update segment user count
      const segment = this.segments.get(segmentId);
      if (segment) {
        segment.userCount += 1;
      }
    }

    return true;
  }

  public removeUserFromSegment(userId: number, segmentId: string): boolean {
    const userSegments = this.userSegmentMap.get(userId);
    if (userSegments) {
      const index = userSegments.indexOf(segmentId);
      if (index > -1) {
        userSegments.splice(index, 1);

        // Update segment user count
        const segment = this.segments.get(segmentId);
        if (segment && segment.userCount > 0) {
          segment.userCount -= 1;
        }

        return true;
      }
    }
    return false;
  }

  public getUserSegments(userId: number): UserSegment[] {
    const segmentIds = this.userSegmentMap.get(userId) || [];
    return segmentIds
      .map((id) => this.segments.get(id))
      .filter((segment): segment is UserSegment => segment !== undefined);
  }

  public getSegmentUsers(segmentId: string): number[] {
    const users: number[] = [];
    this.userSegmentMap.forEach((segmentIds, userId) => {
      if (segmentIds.includes(segmentId)) {
        users.push(userId);
      }
    });
    return users;
  }

  public evaluateUserForSegments(userId: number, userData: any): string[] {
    const assignedSegments: string[] = [];

    this.segments.forEach((segment, segmentId) => {
      if (this.matchesCriteria(userData, segment.criteria)) {
        this.assignUserToSegment(userId, segmentId);
        assignedSegments.push(segmentId);
      }
    });

    return assignedSegments;
  }

  private matchesCriteria(userData: any, criteria: SegmentationCriteria): boolean {
    // Check engagement score
    if (criteria.engagementScore) {
      const score = userData.engagementScore || 0;
      if (score < criteria.engagementScore.min || score > criteria.engagementScore.max) {
        return false;
      }
    }

    // Check subscription tier
    if (criteria.subscriptionTier) {
      if (!criteria.subscriptionTier.includes(userData.subscriptionTier)) {
        return false;
      }
    }

    // Check last active
    if (criteria.lastActiveWithin) {
      const lastActive = userData.lastActiveAt ? new Date(userData.lastActiveAt) : new Date(0);
      const threshold = new Date(Date.now() - criteria.lastActiveWithin * 24 * 60 * 60 * 1000);
      if (lastActive < threshold) {
        return false;
      }
    }

    // Check total sessions
    if (criteria.totalSessions) {
      const sessions = userData.totalSessions || 0;
      if (sessions < criteria.totalSessions.min || sessions > criteria.totalSessions.max) {
        return false;
      }
    }

    // Check location
    if (criteria.location && userData.location) {
      if (!criteria.location.includes(userData.location)) {
        return false;
      }
    }

    // Check join date
    if (criteria.joinedAfter) {
      const joinedAt = userData.createdAt ? new Date(userData.createdAt) : new Date(0);
      if (joinedAt < criteria.joinedAfter) {
        return false;
      }
    }

    if (criteria.joinedBefore) {
      const joinedAt = userData.createdAt ? new Date(userData.createdAt) : new Date();
      if (joinedAt > criteria.joinedBefore) {
        return false;
      }
    }

    // Check custom attributes
    if (criteria.customAttributes) {
      for (const [key, value] of Object.entries(criteria.customAttributes)) {
        if (userData[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  public getSegmentStats(segmentId: string): Record<string, any> {
    const segment = this.segments.get(segmentId);
    if (!segment) {
      return {};
    }

    const users = this.getSegmentUsers(segmentId);
    const avgEngagement = users.length > 0 ? 75 : 0; // Placeholder
    const churnRate = users.length > 0 ? 5 : 0; // Placeholder

    return {
      segmentId,
      segmentName: segment.name,
      totalUsers: users.length,
      avgEngagement,
      churnRate,
      createdAt: segment.createdAt,
      lastUpdated: segment.updatedAt,
    };
  }

  public bulkAssignUsers(userIds: number[], segmentId: string): number {
    let count = 0;
    userIds.forEach((userId) => {
      if (this.assignUserToSegment(userId, segmentId)) {
        count++;
      }
    });
    return count;
  }

  public createCustomSegment(
    name: string,
    description: string,
    criteria: SegmentationCriteria
  ): UserSegment {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const segment: UserSegment = {
      id,
      name,
      description,
      criteria,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.createSegment(segment);
  }

  public getSegmentComparison(segmentIds: string[]): Record<string, any> {
    const comparison: Record<string, any> = {};

    segmentIds.forEach((segmentId) => {
      const stats = this.getSegmentStats(segmentId);
      comparison[segmentId] = stats;
    });

    return comparison;
  }
}

export const userSegmentationService = new UserSegmentationService();
