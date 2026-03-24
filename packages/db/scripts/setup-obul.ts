/**
 * One-time setup script: creates the Obul company and Lead Sourcing Agent
 * in a running Paperclip instance. Safe to run multiple times (idempotent).
 *
 * Usage: cd packages/db && npx tsx scripts/setup-obul.ts
 */

import { createDb } from "../src/client.js";
import { companies, agents, plugins, pluginCompanySettings } from "../src/schema/index.js";
import { eq, ne } from "drizzle-orm";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const db = createDb(url);

// --- Company -----------------------------------------------------------

const existing = await db
  .select()
  .from(companies)
  .where(eq(companies.name, "Obul"));

let companyId: string;

if (existing.length > 0) {
  companyId = existing[0]!.id;
  console.log(`Obul company already exists (${companyId}), skipping creation`);
} else {
  const [obul] = await db
    .insert(companies)
    .values({
      name: "Obul",
      description:
        "AI API proxy — unified access to LLMs, search, scraping, enrichment, and social APIs with x402 micropayments",
      status: "active",
      issuePrefix: "OBL",
      budgetMonthlyCents: 100_00,
    })
    .returning();
  companyId = obul!.id;
  console.log(`Created Obul company (${companyId})`);
}

// --- Lead Sourcing Agent -----------------------------------------------

const existingAgents = await db
  .select()
  .from(agents)
  .where(eq(agents.companyId, companyId));

const agentByName = (name: string) =>
  existingAgents.find((a) => a.name === name);

// --- CEO Agent ------------------------------------------------------------

let ceoId: string;

if (agentByName("CEO")) {
  ceoId = agentByName("CEO")!.id;
  console.log("CEO already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "CEO",
      role: "ceo",
      title: "Chief Executive Officer",
      icon: "briefcase",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/plugins/plugin-crm/agent-instructions/ceo.md",
      },
      budgetMonthlyCents: 5_00,
    })
    .returning();
  ceoId = agent!.id;
  console.log(`Created CEO (${ceoId})`);
}

// --- Wire reportsTo for any pre-existing pipeline agents ------------------

const pipelineAgentNames = [
  "Lead Sourcing Agent",
  "Enrichment Agent",
  "Outreach Agent",
  "Response Tracker",
];
for (const agentName of pipelineAgentNames) {
  const existing = agentByName(agentName);
  if (existing && existing.reportsTo !== ceoId) {
    await db
      .update(agents)
      .set({ reportsTo: ceoId })
      .where(eq(agents.id, existing.id));
    console.log(`Updated ${agentName} reportsTo → ${ceoId}`);
  }
}

// --- Lead Sourcing Agent --------------------------------------------------

if (agentByName("Lead Sourcing Agent")) {
  console.log("Lead Sourcing Agent already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "Lead Sourcing Agent",
      role: "researcher",
      title: "Lead Sourcing Specialist",
      icon: "search",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/plugins/plugin-crm/agent-instructions/lead-sourcing.md",
        heartbeat: { enabled: true, intervalSec: 86400 },
      },
      reportsTo: ceoId,
      budgetMonthlyCents: 20_00,
      metadata: {
        icp: "solopreneurs and small AI companies (<10 employees) using paid APIs",
        scoringThresholds: { person: 30, company: 35 },
        budgetPerRunCents: 50,
        sources: [
          "github",
          "hn",
          "apollo",
          "twitter",
          "reddit",
          "farcaster",
          "firecrawl",
        ],
      },
    })
    .returning();
  console.log(`Created Lead Sourcing Agent (${agent!.id})`);
}

// --- Enrichment Agent -----------------------------------------------------

if (agentByName("Enrichment Agent")) {
  console.log("Enrichment Agent already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "Enrichment Agent",
      role: "researcher",
      title: "Contact Enrichment Specialist",
      icon: "eye",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/plugins/plugin-crm/agent-instructions/enrichment.md",
        heartbeat: { enabled: true, intervalSec: 86400 },
      },
      reportsTo: ceoId,
      budgetMonthlyCents: 15_00,
      metadata: {
        enrichmentTiers: [
          "git_commit",
          "twitter_lookup",
          "hunter_email",
          "apollo_match",
          "firecrawl_scrape",
        ],
        budgetPerRunCents: 70,
        maxLeadsPerRun: 25,
        readyThreshold: "has_email_or_dm_handle",
      },
    })
    .returning();
  console.log(`Created Enrichment Agent (${agent!.id})`);
}

// --- Outreach Agent -------------------------------------------------------

if (agentByName("Outreach Agent")) {
  console.log("Outreach Agent already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "Outreach Agent",
      role: "cmo",
      title: "Outreach Specialist",
      icon: "mail",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/plugins/plugin-crm/agent-instructions/outreach.md",
        heartbeat: { enabled: true, intervalSec: 172800 },
      },
      reportsTo: ceoId,
      budgetMonthlyCents: 10_00,
      metadata: {
        channelPriority: [
          "email",
          "twitter_dm",
          "reddit_dm",
          "farcaster_dc",
          "github",
        ],
        maxDmsPerPlatformPerSession: 10,
        maxEmailsPerSession: 30,
        budgetPerRunCents: 50,
        requireApprovalForDMs: true,
      },
    })
    .returning();
  console.log(`Created Outreach Agent (${agent!.id})`);
}

// --- Response Tracker -----------------------------------------------------

if (agentByName("Response Tracker")) {
  console.log("Response Tracker already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "Response Tracker",
      role: "general",
      title: "Response & Follow-up Specialist",
      icon: "radar",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/plugins/plugin-crm/agent-instructions/response-tracker.md",
        heartbeat: { enabled: true, intervalSec: 86400 },
      },
      reportsTo: ceoId,
      budgetMonthlyCents: 8_00,
      metadata: {
        followUpWaitDays: 3,
        maxFollowUps: 3,
        channelEscalation: {
          email: "twitter_dm",
          twitter_dm: "reddit_dm",
        },
        budgetPerRunCents: 30,
      },
    })
    .returning();
  console.log(`Created Response Tracker (${agent!.id})`);
}

// --- CRM Plugin Scoping: disable for all non-Obul companies ------------------

const crmPlugin = await db
  .select({ id: plugins.id })
  .from(plugins)
  .where(eq(plugins.pluginKey, "paperclip-crm"))
  .limit(1);

if (crmPlugin.length === 0) {
  console.log("CRM plugin not installed yet, skipping company scoping");
} else {
  const crmPluginId = crmPlugin[0]!.id;
  const otherCompanies = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(ne(companies.id, companyId));

  for (const company of otherCompanies) {
    await db
      .insert(pluginCompanySettings)
      .values({ companyId: company.id, pluginId: crmPluginId, enabled: false })
      .onConflictDoNothing();
    console.log(`Disabled CRM plugin for company: ${company.name}`);
  }
}

console.log("Done");
process.exit(0);
