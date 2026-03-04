import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, userProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  getUserProfile,
  createOrUpdateUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "./db";

describe("User Profile Functions", () => {
  let testUserId: number;
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Create a test user
    const result = await db.insert(users).values({
      openId: `test-profile-${Date.now()}`,
      name: "Test User",
      email: "test@example.com",
      loginMethod: "oauth",
      role: "user",
    });

    testUserId = (result as any).insertId;
  });

  afterAll(async () => {
    if (db && testUserId) {
      // Clean up: delete profile and user
      await db.delete(userProfiles).where(eq(userProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should create a user profile", async () => {
    const profileData = {
      avatar: "data:image/png;base64,test",
      bio: "Test bio",
      status: "Active",
    };

    await createOrUpdateUserProfile(testUserId, profileData);

    const profile = await getUserProfile(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.bio).toBe("Test bio");
    expect(profile?.status).toBe("Active");
    expect(profile?.userId).toBe(testUserId);
  });

  it("should retrieve a user profile", async () => {
    const profile = await getUserProfile(testUserId);

    expect(profile).toBeDefined();
    expect(profile?.userId).toBe(testUserId);
    expect(profile?.bio).toBe("Test bio");
  });

  it("should update a user profile", async () => {
    await updateUserProfile(testUserId, {
      bio: "Updated bio",
      status: "Busy",
    });

    const profile = await getUserProfile(testUserId);
    expect(profile?.bio).toBe("Updated bio");
    expect(profile?.status).toBe("Busy");
  });

  it("should delete a user profile", async () => {
    if (!db) return;
    
    await deleteUserProfile(testUserId);

    const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, testUserId)).limit(1);
    expect(result.length).toBe(0);
  });
});
