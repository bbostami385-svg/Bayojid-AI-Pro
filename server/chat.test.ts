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

  it("updates conversation title", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({
      title: "পুরানো নাম",
    });

    const conversationId = (result as any)[0]?.id || 1;

    const updateResult = await caller.chat.updateTitle({
      conversationId,
      title: "নতুন নাম",
    });

    expect(updateResult).toBeDefined();
  });

  it("deletes a conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({
      title: "ডিলিট টেস্ট",
    });

    const conversationId = (result as any)[0]?.id || 1;

    const deleteResult = await caller.chat.deleteConversation({
      conversationId,
    });

    expect(deleteResult).toBeDefined();
  });

  it("searches conversations by title", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.chat.createConversation({
      title: "পাইথন প্রোগ্রামিং",
    });

    await caller.chat.createConversation({
      title: "জাভাস্ক্রিপ্ট টিউটোরিয়াল",
    });

    const searchResult = await caller.chat.searchConversations({
      query: "প্রোগ্রামিং",
    });

    expect(Array.isArray(searchResult)).toBe(true);
  });

  it("generates title from first message", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({
      title: "শিরোনাম জেনারেশন",
    });

    const conversationId = (result as any)[0]?.id || 1;

    const titleResult = await caller.chat.generateTitle({
      conversationId,
    });

    expect(titleResult).toBeDefined();
  });

  it("supports multilingual input - Bengali", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({
      title: "বহুভাষিক পরীক্ষা",
    });

    const conversationId = (result as any)[0]?.id || 1;

    const bengaliResult = await caller.chat.sendMessage({
      conversationId,
      message: "আমাকে হ্যালো বলুন",
    });

    expect(bengaliResult.userMessage).toBe("আমাকে হ্যালো বলুন");
    expect(bengaliResult.assistantMessage).toBeDefined();
    expect(typeof bengaliResult.assistantMessage).toBe("string");
  });

  it("supports multilingual input - English", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({
      title: "English Test",
    });

    const conversationId = (result as any)[0]?.id || 1;

    const englishResult = await caller.chat.sendMessage({
      conversationId,
      message: "Hello, how are you?",
    });

    expect(englishResult.userMessage).toBe("Hello, how are you?");
    expect(englishResult.assistantMessage).toBeDefined();
    expect(typeof englishResult.assistantMessage).toBe("string");
  });
});
