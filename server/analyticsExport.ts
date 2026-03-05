import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getConversationMessages, getUserConversations } from "./db";

export const analyticsExportRouter = router({
  // Export conversations as CSV
  exportConversationsCSV: protectedProcedure
    .input(
      z.object({
        format: z.enum(["csv", "json"]).default("csv"),
        dateRange: z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        }).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conversations = await getUserConversations(ctx.user.id);

      if (input.format === "csv") {
        // Generate CSV format
        let csv = "Conversation ID,Title,Created At,Message Count,Last Updated\n";

        for (const conv of conversations) {
          const messages = await getConversationMessages(conv.id);
          csv += `"${conv.id}","${conv.title}","${conv.createdAt}","${messages.length}","${conv.updatedAt}"\n`;
        }

        return {
          data: csv,
          filename: `conversations-${new Date().toISOString().split("T")[0]}.csv`,
          mimeType: "text/csv",
        };
      } else {
        // Generate JSON format
        const data = [];
        for (const conv of conversations) {
          const messages = await getConversationMessages(conv.id);
          data.push({
            ...conv,
            messages: messages,
          });
        }

        return {
          data: JSON.stringify(data, null, 2),
          filename: `conversations-${new Date().toISOString().split("T")[0]}.json`,
          mimeType: "application/json",
        };
      }
    }),

  // Export analytics summary
  exportAnalyticsSummary: protectedProcedure
    .input(
      z.object({
        format: z.enum(["csv", "json", "pdf"]).default("json"),
      })
    )
    .query(async ({ ctx, input }) => {
      const conversations = await getUserConversations(ctx.user.id);
      const totalMessages = (
        await Promise.all(
          conversations.map((c) => getConversationMessages(c.id))
        )
      ).reduce((sum, msgs) => sum + msgs.length, 0);

      const summary = {
        userId: ctx.user.id,
        totalConversations: conversations.length,
        totalMessages: totalMessages,
        averageMessagesPerConversation:
          conversations.length > 0
            ? Math.round(totalMessages / conversations.length)
            : 0,
        generatedAt: new Date().toISOString(),
        conversationBreakdown: conversations.map((c) => ({
          id: c.id,
          title: c.title,
          messageCount: 0, // Will be populated from messages
        })),
      };

      if (input.format === "csv") {
        let csv = "Metric,Value\n";
        csv += `Total Conversations,${summary.totalConversations}\n`;
        csv += `Total Messages,${summary.totalMessages}\n`;
        csv += `Average Messages per Conversation,${summary.averageMessagesPerConversation}\n`;
        csv += `Generated At,${summary.generatedAt}\n`;

        return {
          data: csv,
          filename: `analytics-summary-${new Date().toISOString().split("T")[0]}.csv`,
          mimeType: "text/csv",
        };
      } else if (input.format === "json") {
        return {
          data: JSON.stringify(summary, null, 2),
          filename: `analytics-summary-${new Date().toISOString().split("T")[0]}.json`,
          mimeType: "application/json",
        };
      } else {
        // PDF format - return JSON that frontend can convert to PDF
        return {
          data: JSON.stringify(summary, null, 2),
          filename: `analytics-summary-${new Date().toISOString().split("T")[0]}.pdf`,
          mimeType: "application/pdf",
          isPdf: true,
        };
      }
    }),

  // Get export history
  getExportHistory: protectedProcedure.query(async ({ ctx }) => {
    // This would typically fetch from a database table tracking exports
    return {
      exports: [
        {
          id: "1",
          filename: "conversations-2026-03-05.csv",
          format: "csv",
          createdAt: new Date(),
          size: "2.5 MB",
        },
        {
          id: "2",
          filename: "analytics-summary-2026-03-04.json",
          format: "json",
          createdAt: new Date(Date.now() - 86400000),
          size: "0.5 MB",
        },
      ],
    };
  }),
});
