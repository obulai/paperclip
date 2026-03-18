import { randomUUID } from "node:crypto";
import {
  definePlugin,
  runWorker,
  type PaperclipPlugin,
  type PluginContext,
  type PluginEntityQuery,
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

function requireString(params: Record<string, unknown>, key: string): string {
  const value = params[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function optionalString(params: Record<string, unknown>, key: string): string | undefined {
  const value = params[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getLimit(params: Record<string, unknown>, fallback = 50): number {
  const value = typeof params.limit === "number" ? params.limit : Number(params.limit ?? fallback);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(200, Math.floor(value)));
}

function getOffset(params: Record<string, unknown>): number {
  const value = typeof params.offset === "number" ? params.offset : Number(params.offset ?? 0);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

// ---------------------------------------------------------------------------
// Data handlers
// ---------------------------------------------------------------------------

async function registerDataHandlers(ctx: PluginContext): Promise<void> {
  // List CRM companies with optional filtering
  ctx.data.register("companies-list", async (params) => {
    const query: PluginEntityQuery = {
      entityType: ENTITY_TYPES.company,
      scopeKind: optionalString(params, "scopeKind") as PluginEntityQuery["scopeKind"],
      scopeId: optionalString(params, "scopeId"),
      limit: getLimit(params),
      offset: getOffset(params),
    };
    const entities = await ctx.entities.list(query);

    // Client-side filtering for status, source, and search text
    const statusFilter = optionalString(params, "status");
    const sourceFilter = optionalString(params, "source");
    const search = optionalString(params, "search")?.toLowerCase();

    // Exclude soft-deleted entities
    let filtered = entities.filter((e) => e.status !== "deleted");
    if (statusFilter) {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }
    if (sourceFilter) {
      filtered = filtered.filter((e) => {
        const data = e.data as Record<string, unknown> | null;
        return data?.source === sourceFilter;
      });
    }
    if (search) {
      filtered = filtered.filter((e) => {
        const title = (e.title ?? "").toLowerCase();
        const data = e.data as Record<string, unknown> | null;
        const domain = ((data?.domain as string) ?? "").toLowerCase();
        const contactName = ((data?.contactName as string) ?? "").toLowerCase();
        return title.includes(search) || domain.includes(search) || contactName.includes(search);
      });
    }
    return filtered;
  });

  // List CRM people with optional filtering
  ctx.data.register("people-list", async (params) => {
    const query: PluginEntityQuery = {
      entityType: ENTITY_TYPES.person,
      scopeKind: optionalString(params, "scopeKind") as PluginEntityQuery["scopeKind"],
      scopeId: optionalString(params, "scopeId"),
      limit: getLimit(params),
      offset: getOffset(params),
    };
    const entities = await ctx.entities.list(query);

    const statusFilter = optionalString(params, "status");
    const search = optionalString(params, "search")?.toLowerCase();

    // Exclude soft-deleted entities
    let filtered = entities.filter((e) => e.status !== "deleted");
    if (statusFilter) {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }
    if (search) {
      filtered = filtered.filter((e) => {
        const title = (e.title ?? "").toLowerCase();
        const data = e.data as Record<string, unknown> | null;
        const email = ((data?.email as string) ?? "").toLowerCase();
        const role = ((data?.role as string) ?? "").toLowerCase();
        return title.includes(search) || email.includes(search) || role.includes(search);
      });
    }
    return filtered;
  });

  // Single entity detail by ID
  ctx.data.register("entity-detail", async (params) => {
    const entityType = optionalString(params, "entityType");
    const entities = await ctx.entities.list({
      entityType,
      limit: 200,
      offset: 0,
    });
    const entityId = requireString(params, "entityId");
    return entities.find((e) => e.id === entityId) ?? null;
  });

  // Dashboard stats — aggregate counts by status
  ctx.data.register("dashboard-stats", async (params) => {
    const companies = await ctx.entities.list({
      entityType: ENTITY_TYPES.company,
      limit: 200,
      offset: 0,
    });
    const people = await ctx.entities.list({
      entityType: ENTITY_TYPES.person,
      limit: 200,
      offset: 0,
    });

    const companyByStatus: Record<string, number> = {};
    for (const c of companies) {
      const s = c.status ?? "unknown";
      companyByStatus[s] = (companyByStatus[s] ?? 0) + 1;
    }

    const peopleByStatus: Record<string, number> = {};
    for (const p of people) {
      const s = p.status ?? "unknown";
      peopleByStatus[s] = (peopleByStatus[s] ?? 0) + 1;
    }

    return {
      companies: { total: companies.length, byStatus: companyByStatus },
      people: { total: people.length, byStatus: peopleByStatus },
    };
  });

  // List Paperclip agents for assignment
  ctx.data.register("agent-profiles", async (params) => {
    const companyId = optionalString(params, "companyId");
    if (!companyId) return [];
    return await ctx.agents.list({ companyId, limit: 200, offset: 0 });
  });
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

async function registerActionHandlers(ctx: PluginContext): Promise<void> {
  // Create a CRM company
  ctx.actions.register("create-company", async (params) => {
    const title = requireString(params, "title");
    const scopeId = optionalString(params, "scopeId");
    const data: Record<string, unknown> = {
      domain: optionalString(params, "domain") ?? "",
      industry: optionalString(params, "industry") ?? "",
      size: optionalString(params, "size") ?? "",
      source: optionalString(params, "source") ?? "inbound",
      contactEmail: optionalString(params, "contactEmail") ?? "",
      contactName: optionalString(params, "contactName") ?? "",
      phone: optionalString(params, "phone") ?? "",
      notes: optionalString(params, "notes") ?? "",
      lastContactedAt: null,
      nextFollowUpAt: null,
      outreachChannel: optionalString(params, "outreachChannel") ?? null,
      tags: Array.isArray(params.tags) ? params.tags : [],
      assignedAgentId: optionalString(params, "assignedAgentId") ?? null,
    };

    const record = await ctx.entities.upsert({
      entityType: ENTITY_TYPES.company,
      scopeKind: "company",
      scopeId,
      externalId: randomUUID(),
      title,
      status: "new",
      data,
    });

    if (scopeId) {
      await ctx.activity.log({
        companyId: scopeId,
        message: `CRM: Created company "${title}"`,
        metadata: { plugin: PLUGIN_ID, entityId: record.id },
      });
    }

    return record;
  });

  // Update a CRM company
  ctx.actions.register("update-company", async (params) => {
    const entityId = requireString(params, "entityId");
    const entities = await ctx.entities.list({
      entityType: ENTITY_TYPES.company,
      limit: 200,
      offset: 0,
    });
    const existing = entities.find((e) => e.id === entityId);
    if (!existing) throw new Error("Company not found");

    const existingData = (existing.data ?? {}) as Record<string, unknown>;
    const updatedData: Record<string, unknown> = { ...existingData };

    // Merge only provided fields
    for (const key of [
      "domain", "industry", "size", "source", "contactEmail", "contactName",
      "phone", "notes", "outreachChannel", "assignedAgentId",
    ]) {
      if (params[key] !== undefined) {
        updatedData[key] = params[key];
      }
    }
    if (params.tags !== undefined) {
      updatedData.tags = Array.isArray(params.tags) ? params.tags : [];
    }
    if (params.lastContactedAt !== undefined) updatedData.lastContactedAt = params.lastContactedAt;
    if (params.nextFollowUpAt !== undefined) updatedData.nextFollowUpAt = params.nextFollowUpAt;

    const record = await ctx.entities.upsert({
      entityType: ENTITY_TYPES.company,
      scopeKind: existing.scopeKind,
      scopeId: existing.scopeId ?? undefined,
      externalId: existing.externalId ?? entityId,
      title: typeof params.title === "string" ? params.title : existing.title ?? "",
      status: typeof params.status === "string" ? params.status : existing.status ?? "new",
      data: updatedData,
    });

    return record;
  });

  // Delete a CRM company (soft-delete by setting status to "deleted")
  ctx.actions.register("delete-company", async (params) => {
    const entityId = requireString(params, "entityId");
    const entities = await ctx.entities.list({
      entityType: ENTITY_TYPES.company,
      limit: 200,
      offset: 0,
    });
    const existing = entities.find((e) => e.id === entityId);
    if (!existing) throw new Error("Company not found");

    await ctx.entities.upsert({
      entityType: ENTITY_TYPES.company,
      scopeKind: existing.scopeKind,
      scopeId: existing.scopeId ?? undefined,
      externalId: existing.externalId ?? entityId,
      title: existing.title ?? "",
      status: "deleted",
      data: existing.data as Record<string, unknown>,
    });
    return { ok: true, entityId };
  });

  // Create a CRM person
  ctx.actions.register("create-person", async (params) => {
    const title = requireString(params, "title");
    const scopeId = optionalString(params, "scopeId");
    const data: Record<string, unknown> = {
      email: optionalString(params, "email") ?? "",
      emailVerified: optionalString(params, "emailVerified") ?? "unknown",
      phone: optionalString(params, "phone") ?? "",
      role: optionalString(params, "role") ?? "",
      linkedCompanyId: optionalString(params, "linkedCompanyId") ?? null,
      linkedCompanyName: optionalString(params, "linkedCompanyName") ?? null,
      source: optionalString(params, "source") ?? "inbound",
      outreachChannel: optionalString(params, "outreachChannel") ?? null,
      lastContactedAt: null,
      messageSent: null,
      responseText: null,
      responseDate: null,
      followUpCount: 0,
      followUpDate: null,
      conversionNotes: "",
      tags: Array.isArray(params.tags) ? params.tags : [],
      assignedAgentId: optionalString(params, "assignedAgentId") ?? null,
    };

    const record = await ctx.entities.upsert({
      entityType: ENTITY_TYPES.person,
      scopeKind: "company",
      scopeId,
      externalId: randomUUID(),
      title,
      status: "not_contacted",
      data,
    });

    if (scopeId) {
      await ctx.activity.log({
        companyId: scopeId,
        message: `CRM: Created person "${title}"`,
        metadata: { plugin: PLUGIN_ID, entityId: record.id },
      });
    }

    return record;
  });

  // Update a CRM person
  ctx.actions.register("update-person", async (params) => {
    const entityId = requireString(params, "entityId");
    const entities = await ctx.entities.list({
      entityType: ENTITY_TYPES.person,
      limit: 200,
      offset: 0,
    });
    const existing = entities.find((e) => e.id === entityId);
    if (!existing) throw new Error("Person not found");

    const existingData = (existing.data ?? {}) as Record<string, unknown>;
    const updatedData: Record<string, unknown> = { ...existingData };

    for (const key of [
      "email", "emailVerified", "phone", "role", "linkedCompanyId",
      "linkedCompanyName", "source", "outreachChannel", "messageSent",
      "responseText", "responseDate", "conversionNotes", "assignedAgentId",
    ]) {
      if (params[key] !== undefined) {
        updatedData[key] = params[key];
      }
    }
    if (params.tags !== undefined) {
      updatedData.tags = Array.isArray(params.tags) ? params.tags : [];
    }
    if (params.lastContactedAt !== undefined) updatedData.lastContactedAt = params.lastContactedAt;
    if (params.followUpCount !== undefined) updatedData.followUpCount = params.followUpCount;
    if (params.followUpDate !== undefined) updatedData.followUpDate = params.followUpDate;

    const record = await ctx.entities.upsert({
      entityType: ENTITY_TYPES.person,
      scopeKind: existing.scopeKind,
      scopeId: existing.scopeId ?? undefined,
      externalId: existing.externalId ?? entityId,
      title: typeof params.title === "string" ? params.title : existing.title ?? "",
      status: typeof params.status === "string" ? params.status : existing.status ?? "not_contacted",
      data: updatedData,
    });

    return record;
  });

  // Delete a CRM person (soft-delete by setting status to "deleted")
  ctx.actions.register("delete-person", async (params) => {
    const entityId = requireString(params, "entityId");
    const entities = await ctx.entities.list({
      entityType: ENTITY_TYPES.person,
      limit: 200,
      offset: 0,
    });
    const existing = entities.find((e) => e.id === entityId);
    if (!existing) throw new Error("Person not found");

    await ctx.entities.upsert({
      entityType: ENTITY_TYPES.person,
      scopeKind: existing.scopeKind,
      scopeId: existing.scopeId ?? undefined,
      externalId: existing.externalId ?? entityId,
      title: existing.title ?? "",
      status: "deleted",
      data: existing.data as Record<string, unknown>,
    });
    return { ok: true, entityId };
  });

  // Log an outreach activity
  ctx.actions.register("log-activity", async (params) => {
    const relatedEntityId = requireString(params, "relatedEntityId");
    const relatedEntityType = requireString(params, "relatedEntityType");
    const activityType = requireString(params, "activityType");
    const description = requireString(params, "description");
    const scopeId = optionalString(params, "scopeId");

    const record = await ctx.entities.upsert({
      entityType: ENTITY_TYPES.activity,
      scopeKind: "company",
      scopeId,
      externalId: randomUUID(),
      title: description.slice(0, 100),
      status: "logged",
      data: {
        relatedEntityType,
        relatedEntityId,
        activityType,
        description,
        performedBy: optionalString(params, "performedBy") ?? null,
        performedAt: new Date().toISOString(),
      },
    });

    if (scopeId) {
      await ctx.activity.log({
        companyId: scopeId,
        message: `CRM: ${description}`,
        metadata: { plugin: PLUGIN_ID, activityId: record.id },
      });
    }

    return record;
  });

  // Update status and auto-log activity
  ctx.actions.register("update-status", async (params) => {
    const entityId = requireString(params, "entityId");
    const newStatus = requireString(params, "status");
    const entityType = optionalString(params, "entityType") ?? ENTITY_TYPES.company;
    const scopeId = optionalString(params, "scopeId");

    // Find and update the entity
    const entities = await ctx.entities.list({
      entityType,
      limit: 200,
      offset: 0,
    });
    const existing = entities.find((e) => e.id === entityId);
    if (!existing) throw new Error("Entity not found");

    const oldStatus = existing.status ?? "unknown";
    const record = await ctx.entities.upsert({
      entityType,
      scopeKind: existing.scopeKind,
      scopeId: existing.scopeId ?? undefined,
      externalId: existing.externalId ?? entityId,
      title: existing.title ?? "",
      status: newStatus,
      data: existing.data as Record<string, unknown>,
    });

    // Auto-log the status change activity
    await ctx.entities.upsert({
      entityType: ENTITY_TYPES.activity,
      scopeKind: "company",
      scopeId: existing.scopeId ?? undefined,
      externalId: randomUUID(),
      title: `Status changed: ${oldStatus} → ${newStatus}`,
      status: "logged",
      data: {
        relatedEntityType: entityType,
        relatedEntityId: entityId,
        activityType: "status_change",
        description: `Status changed from "${oldStatus}" to "${newStatus}" on "${existing.title}"`,
        performedBy: null,
        performedAt: new Date().toISOString(),
      },
    });

    if (scopeId || existing.scopeId) {
      await ctx.activity.log({
        companyId: (scopeId ?? existing.scopeId)!,
        message: `CRM: ${existing.title} status changed: ${oldStatus} → ${newStatus}`,
        metadata: { plugin: PLUGIN_ID, entityId },
      });
    }

    return record;
  });

  // Assign agent to a CRM entity
  ctx.actions.register("assign-agent", async (params) => {
    const entityId = requireString(params, "entityId");
    const agentId = requireString(params, "agentId");
    const entityType = optionalString(params, "entityType") ?? ENTITY_TYPES.company;

    const entities = await ctx.entities.list({
      entityType,
      limit: 200,
      offset: 0,
    });
    const existing = entities.find((e) => e.id === entityId);
    if (!existing) throw new Error("Entity not found");

    const data = { ...(existing.data as Record<string, unknown>), assignedAgentId: agentId };

    const record = await ctx.entities.upsert({
      entityType,
      scopeKind: existing.scopeKind,
      scopeId: existing.scopeId ?? undefined,
      externalId: existing.externalId ?? entityId,
      title: existing.title ?? "",
      status: existing.status ?? "",
      data,
    });

    return record;
  });
}

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function registerToolHandlers(ctx: PluginContext): Promise<void> {
  ctx.tools.register(
    TOOL_NAMES.search,
    {
      displayName: "CRM Search",
      description: "Search CRM companies and people by name, status, or tags.",
      parametersSchema: {
        type: "object",
        properties: {
          entityType: { type: "string", enum: ["crm-company", "crm-person"] },
          query: { type: "string" },
          status: { type: "string" },
        },
      },
    },
    async (params, runCtx): Promise<ToolResult> => {
      const payload = params as { entityType?: string; query?: string; status?: string };
      const entityType = payload.entityType ?? ENTITY_TYPES.company;
      const entities = await ctx.entities.list({
        entityType,
        limit: 50,
        offset: 0,
      });

      let results = entities;
      if (payload.status) {
        results = results.filter((e) => e.status === payload.status);
      }
      if (payload.query) {
        const q = payload.query.toLowerCase();
        results = results.filter((e) => (e.title ?? "").toLowerCase().includes(q));
      }

      return {
        content: `Found ${results.length} ${entityType} records.`,
        data: results.map((e) => ({
          id: e.id,
          title: e.title,
          status: e.status,
          data: e.data,
        })),
      };
    },
  );

  ctx.tools.register(
    TOOL_NAMES.updateStatus,
    {
      displayName: "CRM Update Status",
      description: "Update the outreach status on a CRM company or person.",
      parametersSchema: {
        type: "object",
        properties: {
          entityId: { type: "string" },
          status: { type: "string" },
        },
        required: ["entityId", "status"],
      },
    },
    async (params, _runCtx): Promise<ToolResult> => {
      const payload = params as { entityId: string; status: string };

      // Try company first, then person
      for (const entityType of [ENTITY_TYPES.company, ENTITY_TYPES.person]) {
        const entities = await ctx.entities.list({ entityType, limit: 200, offset: 0 });
        const existing = entities.find((e) => e.id === payload.entityId);
        if (existing) {
          await ctx.entities.upsert({
            entityType,
            scopeKind: existing.scopeKind,
            scopeId: existing.scopeId ?? undefined,
            externalId: existing.externalId ?? payload.entityId,
            title: existing.title ?? "",
            status: payload.status,
            data: existing.data as Record<string, unknown>,
          });
          return {
            content: `Updated ${existing.title} status to "${payload.status}".`,
            data: { entityId: payload.entityId, newStatus: payload.status },
          };
        }
      }

      return { error: `Entity ${payload.entityId} not found.` };
    },
  );

  ctx.tools.register(
    TOOL_NAMES.logActivity,
    {
      displayName: "CRM Log Activity",
      description: "Log an outreach activity against a CRM record.",
      parametersSchema: {
        type: "object",
        properties: {
          relatedEntityId: { type: "string" },
          relatedEntityType: { type: "string", enum: ["crm-company", "crm-person"] },
          activityType: { type: "string", enum: ["email_sent", "call", "meeting", "note", "status_change"] },
          description: { type: "string" },
        },
        required: ["relatedEntityId", "relatedEntityType", "activityType", "description"],
      },
    },
    async (params, _runCtx): Promise<ToolResult> => {
      const payload = params as {
        relatedEntityId: string;
        relatedEntityType: string;
        activityType: string;
        description: string;
      };

      const record = await ctx.entities.upsert({
        entityType: ENTITY_TYPES.activity,
        scopeKind: "company",
        externalId: randomUUID(),
        title: payload.description.slice(0, 100),
        status: "logged",
        data: {
          ...payload,
          performedBy: null,
          performedAt: new Date().toISOString(),
        },
      });

      return {
        content: `Logged activity: ${payload.description}`,
        data: record,
      };
    },
  );

  ctx.tools.register(
    TOOL_NAMES.getSummary,
    {
      displayName: "CRM Pipeline Summary",
      description: "Get aggregate pipeline stats for CRM companies and people.",
      parametersSchema: { type: "object", properties: {} },
    },
    async (_params, _runCtx): Promise<ToolResult> => {
      const companies = await ctx.entities.list({
        entityType: ENTITY_TYPES.company,
        limit: 200,
        offset: 0,
      });
      const people = await ctx.entities.list({
        entityType: ENTITY_TYPES.person,
        limit: 200,
        offset: 0,
      });

      const companyByStatus: Record<string, number> = {};
      for (const c of companies) {
        const s = c.status ?? "unknown";
        companyByStatus[s] = (companyByStatus[s] ?? 0) + 1;
      }

      const peopleByStatus: Record<string, number> = {};
      for (const p of people) {
        const s = p.status ?? "unknown";
        peopleByStatus[s] = (peopleByStatus[s] ?? 0) + 1;
      }

      return {
        content: `CRM has ${companies.length} companies and ${people.length} people.`,
        data: {
          companies: { total: companies.length, byStatus: companyByStatus },
          people: { total: people.length, byStatus: peopleByStatus },
        },
      };
    },
  );
}

// ---------------------------------------------------------------------------
// Plugin definition
// ---------------------------------------------------------------------------

const plugin: PaperclipPlugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("CRM plugin starting");
    await registerDataHandlers(ctx);
    await registerActionHandlers(ctx);
    await registerToolHandlers(ctx);
  },

  async onHealth(): Promise<PluginHealthDiagnostics> {
    return {
      status: "ok",
      message: "CRM plugin healthy",
    };
  },

  async onShutdown() {
    // No cleanup needed
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
