import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

/**
 * OAuth Router - Handles Google and GitHub OAuth authentication
 */
export const oauthRouter = router({
  /**
   * Google OAuth callback
   */
  googleCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Exchange code for Google access token
        // TODO: Get user info from Google
        // For now, simulate successful authentication

        const googleUserInfo = {
          id: `google_${Math.random().toString(36).substr(2, 9)}`,
          email: "user@gmail.com",
          name: "Google User",
          picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
        };

        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Check if user exists
        let user = await db
          .select()
          .from(users)
          .where(eq(users.email, googleUserInfo.email))
          .limit(1);

        // Create user if doesn't exist
        if (!user || user.length === 0) {
          const openId = `google_${googleUserInfo.id}`;
          await db.insert(users).values({
            openId,
            name: googleUserInfo.name,
            email: googleUserInfo.email,
            loginMethod: "google",
            role: "user",
          });

          user = await db
            .select()
            .from(users)
            .where(eq(users.email, googleUserInfo.email))
            .limit(1);
        }

        if (!user || user.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User creation failed",
          });
        }

        const foundUser = user[0];

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, foundUser.openId, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return {
          success: true,
          user: {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google authentication failed",
        });
      }
    }),

  /**
   * GitHub OAuth callback
   */
  githubCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Exchange code for GitHub access token
        // TODO: Get user info from GitHub
        // For now, simulate successful authentication

        const githubUserInfo = {
          id: `github_${Math.random().toString(36).substr(2, 9)}`,
          email: "user@github.com",
          name: "GitHub User",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=github",
        };

        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Check if user exists
        let user = await db
          .select()
          .from(users)
          .where(eq(users.email, githubUserInfo.email))
          .limit(1);

        // Create user if doesn't exist
        if (!user || user.length === 0) {
          const openId = `github_${githubUserInfo.id}`;
          await db.insert(users).values({
            openId,
            name: githubUserInfo.name,
            email: githubUserInfo.email,
            loginMethod: "github",
            role: "user",
          });

          user = await db
            .select()
            .from(users)
            .where(eq(users.email, githubUserInfo.email))
            .limit(1);
        }

        if (!user || user.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User creation failed",
          });
        }

        const foundUser = user[0];

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, foundUser.openId, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return {
          success: true,
          user: {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "GitHub authentication failed",
        });
      }
    }),

  /**
   * Get OAuth URLs
   */
  getOAuthUrls: publicProcedure.query(() => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
    const githubClientId = process.env.GITHUB_CLIENT_ID || "";
    const redirectUri = process.env.OAUTH_REDIRECT_URI || "http://localhost:3000/oauth/callback";

    return {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`,
      github: `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=user:email`,
    };
  }),

  /**
   * Link OAuth account to existing user
   */
  linkOAuthAccount: publicProcedure
    .input(
      z.object({
        provider: z.enum(["google", "github"]),
        code: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement account linking logic
        return {
          success: true,
          message: "OAuth account linked successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Account linking failed",
        });
      }
    }),

  /**
   * Disconnect OAuth account
   */
  disconnectOAuthAccount: publicProcedure
    .input(z.object({ provider: z.enum(["google", "github"]) }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement account disconnection logic
        return {
          success: true,
          message: "OAuth account disconnected successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Account disconnection failed",
        });
      }
    }),
});

export type OAuthRouter = typeof oauthRouter;
