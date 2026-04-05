/**
 * tRPC Router for Dashboard Widgets
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";

interface Widget {
  id: string;
  type: "metric" | "chart" | "table" | "list";
  title: string;
  size: "small" | "medium" | "large";
  config: Record<string, unknown>;
  isVisible: boolean;
}

interface DashboardLayout {
  id: string;
  userId: number;
  name: string;
  widgets: Widget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (should be replaced with database)
const userDashboards: Map<number, DashboardLayout[]> = new Map();

export const dashboardWidgetsRouter = router({
  // Get user's dashboard layouts
  getDashboards: protectedProcedure.query(async ({ ctx }) => {
    const dashboards = userDashboards.get(ctx.user.id) || [];
    return dashboards;
  }),

  // Get specific dashboard
  getDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const dashboards = userDashboards.get(ctx.user.id) || [];
      return dashboards.find((d) => d.id === input.dashboardId);
    }),

  // Create new dashboard
  createDashboard: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        widgets: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["metric", "chart", "table", "list"]),
            title: z.string(),
            size: z.enum(["small", "medium", "large"]),
            config: z.record(z.unknown()),
            isVisible: z.boolean(),
          })
        ),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dashboard: DashboardLayout = {
        id: `dashboard-${Date.now()}`,
        userId: ctx.user.id,
        name: input.name,
        widgets: input.widgets,
        isDefault: input.isDefault || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!userDashboards.has(ctx.user.id)) {
        userDashboards.set(ctx.user.id, []);
      }

      userDashboards.get(ctx.user.id)!.push(dashboard);
      return dashboard;
    }),

  // Update dashboard
  updateDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        name: z.string().optional(),
        widgets: z
          .array(
            z.object({
              id: z.string(),
              type: z.enum(["metric", "chart", "table", "list"]),
              title: z.string(),
              size: z.enum(["small", "medium", "large"]),
              config: z.record(z.unknown()),
              isVisible: z.boolean(),
            })
          )
          .optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dashboards = userDashboards.get(ctx.user.id) || [];
      const dashboard = dashboards.find((d) => d.id === input.dashboardId);

      if (!dashboard) {
        throw new Error("Dashboard not found");
      }

      if (input.name) dashboard.name = input.name;
      if (input.widgets) dashboard.widgets = input.widgets;
      if (input.isDefault !== undefined) dashboard.isDefault = input.isDefault;
      dashboard.updatedAt = new Date();

      return dashboard;
    }),

  // Delete dashboard
  deleteDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dashboards = userDashboards.get(ctx.user.id) || [];
      const filtered = dashboards.filter((d) => d.id !== input.dashboardId);
      userDashboards.set(ctx.user.id, filtered);
      return { success: true };
    }),

  // Add widget to dashboard
  addWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widget: z.object({
          id: z.string(),
          type: z.enum(["metric", "chart", "table", "list"]),
          title: z.string(),
          size: z.enum(["small", "medium", "large"]),
          config: z.record(z.unknown()),
          isVisible: z.boolean(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dashboards = userDashboards.get(ctx.user.id) || [];
      const dashboard = dashboards.find((d) => d.id === input.dashboardId);

      if (!dashboard) {
        throw new Error("Dashboard not found");
      }

      dashboard.widgets.push(input.widget);
      dashboard.updatedAt = new Date();

      return dashboard;
    }),

  // Remove widget from dashboard
  removeWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dashboards = userDashboards.get(ctx.user.id) || [];
      const dashboard = dashboards.find((d) => d.id === input.dashboardId);

      if (!dashboard) {
        throw new Error("Dashboard not found");
      }

      dashboard.widgets = dashboard.widgets.filter((w) => w.id !== input.widgetId);
      dashboard.updatedAt = new Date();

      return dashboard;
    }),

  // Update widget
  updateWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetId: z.string(),
        title: z.string().optional(),
        size: z.enum(["small", "medium", "large"]).optional(),
        config: z.record(z.unknown()).optional(),
        isVisible: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dashboards = userDashboards.get(ctx.user.id) || [];
      const dashboard = dashboards.find((d) => d.id === input.dashboardId);

      if (!dashboard) {
        throw new Error("Dashboard not found");
      }

      const widget = dashboard.widgets.find((w) => w.id === input.widgetId);
      if (!widget) {
        throw new Error("Widget not found");
      }

      if (input.title) widget.title = input.title;
      if (input.size) widget.size = input.size;
      if (input.config) widget.config = input.config;
      if (input.isVisible !== undefined) widget.isVisible = input.isVisible;

      dashboard.updatedAt = new Date();

      return dashboard;
    }),

  // Get default dashboard
  getDefaultDashboard: protectedProcedure.query(async ({ ctx }) => {
    const dashboards = userDashboards.get(ctx.user.id) || [];
    return dashboards.find((d) => d.isDefault);
  }),

  // Set default dashboard
  setDefaultDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dashboards = userDashboards.get(ctx.user.id) || [];

      // Unset all defaults
      dashboards.forEach((d) => (d.isDefault = false));

      // Set new default
      const dashboard = dashboards.find((d) => d.id === input.dashboardId);
      if (dashboard) {
        dashboard.isDefault = true;
      }

      return dashboard;
    }),

  // Clone dashboard
  cloneDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        newName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dashboards = userDashboards.get(ctx.user.id) || [];
      const original = dashboards.find((d) => d.id === input.dashboardId);

      if (!original) {
        throw new Error("Dashboard not found");
      }

      const cloned: DashboardLayout = {
        id: `dashboard-${Date.now()}`,
        userId: ctx.user.id,
        name: input.newName,
        widgets: JSON.parse(JSON.stringify(original.widgets)),
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dashboards.push(cloned);
      return cloned;
    }),
});
