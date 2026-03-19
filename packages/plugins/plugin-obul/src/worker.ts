import { randomUUID } from "node:crypto";
import {
  definePlugin,
  runWorker,
  type PaperclipPlugin,
  type PluginContext,
  type PluginHealthDiagnostics,
  type ToolResult,
} from "@paperclipai/plugin-sdk";
import {
  ENTITY_TYPES,
  PLUGIN_ID,
  TOOL_NAMES,
} from "./constants.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function optionalString(params: Record<string, unknown>, key: string): string | undefined {
  const value = params[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

// ---------------------------------------------------------------------------
// Data handlers
// ---------------------------------------------------------------------------

async function registerDataHandlers(ctx: PluginContext): Promise<void> {
  // Key status — probe Obul proxy healthz
  ctx.data.register("obul-key-status", async (_params) => {
    const apiKey = process.env.OBUL_API_KEY;
    if (!apiKey) {
      return { configured: false, reachable: false, message: "OBUL_API_KEY not set in environment" };
    }

    try {
      const res = await fetch("https://proxy.obul.ai/healthz", {
        headers: { "x-obul-api-key": apiKey },
        signal: AbortSignal.timeout(5000),
      });
      return {
        configured: true,
        reachable: res.ok,
        statusCode: res.status,
        message: res.ok ? "Connected" : `Proxy returned ${res.status}`,
      };
    } catch (err) {
      return {
        configured: true,
        reachable: false,
        message: err instanceof Error ? err.message : "Connection failed",
      };
    }
  });

  // Cost summary — aggregate obul-cost entities
  ctx.data.register("obul-cost-summary", async (_params) => {
    const events = await ctx.entities.list({
      entityType: ENTITY_TYPES.costEvent,
      limit: 500,
      offset: 0,
    });

    let totalCents = 0;
    const byService: Record<string, { costCents: number; requestCount: number }> = {};
    const byAgent: Record<string, { costCents: number; requestCount: number }> = {};

    for (const e of events) {
      const data = e.data as Record<string, unknown>;
      const cost = typeof data.costCents === "number" ? data.costCents : 0;
      const count = typeof data.requestCount === "number" ? data.requestCount : 1;
      const service = typeof data.service === "string" ? data.service : "unknown";
      const agentName = typeof data.agentName === "string" ? data.agentName : "unknown";

      totalCents += cost;

      if (!byService[service]) byService[service] = { costCents: 0, requestCount: 0 };
      byService[service].costCents += cost;
      byService[service].requestCount += count;

      if (!byAgent[agentName]) byAgent[agentName] = { costCents: 0, requestCount: 0 };
      byAgent[agentName].costCents += cost;
      byAgent[agentName].requestCount += count;
    }

    return { totalCents, byService, byAgent, eventCount: events.length };
  });
}

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function registerToolHandlers(ctx: PluginContext): Promise<void> {
  ctx.tools.register(
    TOOL_NAMES.logCost,
    {
      displayName: "Obul Log Cost",
      description: "Record an Obul API call cost.",
      parametersSchema: {
        type: "object",
        properties: {
          service: { type: "string" },
          operation: { type: "string" },
          costCents: { type: "number" },
          requestCount: { type: "number" },
        },
        required: ["service", "operation", "costCents"],
      },
    },
    async (params, runCtx): Promise<ToolResult> => {
      const payload = params as {
        service: string;
        operation: string;
        costCents: number;
        requestCount?: number;
      };

      const requestCount = payload.requestCount ?? 1;

      // Store as a plugin entity so it can be queried/aggregated
      await ctx.entities.upsert({
        entityType: ENTITY_TYPES.costEvent,
        scopeKind: "company",
        scopeId: runCtx.companyId,
        externalId: randomUUID(),
        title: `${payload.service}/${payload.operation}`,
        status: "logged",
        data: {
          service: payload.service,
          operation: payload.operation,
          costCents: payload.costCents,
          requestCount,
          agentId: runCtx.agentId,
          agentName: null, // resolved on read if needed
          companyId: runCtx.companyId,
          loggedAt: new Date().toISOString(),
        },
      });

      // Also write to activity log for auditability
      await ctx.activity.log({
        companyId: runCtx.companyId,
        message: `Obul API: ${payload.service}/${payload.operation} — $${(payload.costCents / 100).toFixed(3)} (${requestCount} req)`,
        metadata: {
          plugin: PLUGIN_ID,
          service: payload.service,
          operation: payload.operation,
          costCents: payload.costCents,
          requestCount,
        },
      });

      return {
        content: `Logged $${(payload.costCents / 100).toFixed(3)} for ${payload.service}/${payload.operation}.`,
        data: { service: payload.service, operation: payload.operation, costCents: payload.costCents },
      };
    },
  );
}

// ---------------------------------------------------------------------------
// Plugin definition
// ---------------------------------------------------------------------------

const plugin: PaperclipPlugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("Obul plugin starting");
    await registerDataHandlers(ctx);
    await registerToolHandlers(ctx);
  },

  async onHealth(): Promise<PluginHealthDiagnostics> {
    const hasKey = !!process.env.OBUL_API_KEY;
    return {
      status: hasKey ? "ok" : "degraded",
      message: hasKey ? "Obul plugin healthy" : "OBUL_API_KEY not configured",
    };
  },

  async onShutdown() {
    // No cleanup needed
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
