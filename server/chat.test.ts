import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("chat router", () => {
  it("creates a new conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({
      title: "টেস্ট কথোপকথন",
    });

    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
  });

  it("lists user conversations", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.listConversations();

    expect(Array.isArray(result)).toBe(true);
  });

  it("handles message sending", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation first
    const convResult = await caller.chat.createConversation({
      title: "মেসেজ টেস্ট",
    });

    const conversationId = (convResult as any)[0]?.id || 1;

    // Send a message
    const messageResult = await caller.chat.sendMessage({
      conversationId,
      message: "হ্যালো, এটি একটি টেস্ট মেসেজ",
    });

    expect(messageResult).toBeDefined();
    expect(messageResult.userMessage).toBe("হ্যালো, এটি একটি টেস্ট মেসেজ");
    expect(messageResult.assistantMessage).toBeDefined();
    expect(typeof messageResult.assistantMessage).toBe("string");
  });

  it("retrieves conversation messages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation
    const convResult = await caller.chat.createConversation({
      title: "রিট্রিভ টেস্ট",
    });

    const conversationId = (convResult as any)[0]?.id || 1;

    // Send a message
    await caller.chat.sendMessage({
      conversationId,
      message: "প্রথম মেসেজ",
    });

    // Get messages
    const messages = await caller.chat.getMessages({
      conversationId,
    });

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
  });

  it("updates conversation title", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation
    const convResult = await caller.chat.createConversation({
      title: "পুরানো নাম",
    });

    const conversationId = (convResult as any)[0]?.id || 1;

    // Update title
    const updateResult = await caller.chat.updateTitle({
      conversationId,
      title: "নতুন নাম",
    });

    expect(updateResult).toBeDefined();
  });

  it("deletes a conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation
    const convResult = await caller.chat.createConversation({
      title: "ডিলিট টেস্ট",
    });

    const conversationId = (convResult as any)[0]?.id || 1;

    // Delete conversation
    const deleteResult = await caller.chat.deleteConversation({
      conversationId,
    });

    expect(deleteResult).toBeDefined();
  });
});
