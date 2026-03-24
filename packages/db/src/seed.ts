import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDb } from "./client.js";
import { companies, agents, goals, projects, issues, principalPermissionGrants } from "./schema/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const agentInstructions = (name: string) => path.join(repoRoot, "packages/plugins/plugin-crm/agent-instructions", name);

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const db = createDb(url);

console.log("Seeding database...");

const [company] = await db
  .insert(companies)
  .values({
    name: "Paperclip Demo Co",
    description: "A demo autonomous company",
    status: "active",
    budgetMonthlyCents: 50000,
  })
  .returning();

const [ceo] = await db
  .insert(agents)
  .values({
    companyId: company!.id,
    name: "CEO Agent",
    role: "ceo",
    title: "Chief Executive Officer",
    status: "idle",
    adapterType: "process",
    adapterConfig: { command: "echo", args: ["hello from ceo"] },
    budgetMonthlyCents: 15000,
  })
  .returning();

const [engineer] = await db
  .insert(agents)
  .values({
    companyId: company!.id,
    name: "Engineer Agent",
    role: "engineer",
    title: "Software Engineer",
    status: "idle",
    reportsTo: ceo!.id,
    adapterType: "process",
    adapterConfig: { command: "echo", args: ["hello from engineer"] },
    budgetMonthlyCents: 10000,
  })
  .returning();

const [goal] = await db
  .insert(goals)
  .values({
    companyId: company!.id,
    title: "Ship V1",
    description: "Deliver first control plane release",
    level: "company",
    status: "active",
    ownerAgentId: ceo!.id,
  })
  .returning();

const [project] = await db
  .insert(projects)
  .values({
    companyId: company!.id,
    goalId: goal!.id,
    name: "Control Plane MVP",
    description: "Implement core board + agent loop",
    status: "in_progress",
    leadAgentId: ceo!.id,
  })
  .returning();

await db.insert(issues).values([
  {
    companyId: company!.id,
    projectId: project!.id,
    goalId: goal!.id,
    title: "Implement atomic task checkout",
    description: "Ensure in_progress claiming is conflict-safe",
    status: "todo",
    priority: "high",
    assigneeAgentId: engineer!.id,
    createdByAgentId: ceo!.id,
  },
  {
    companyId: company!.id,
    projectId: project!.id,
    goalId: goal!.id,
    title: "Add budget auto-pause",
    description: "Pause agent at hard budget ceiling",
    status: "backlog",
    priority: "medium",
    createdByAgentId: ceo!.id,
  },
]);

// ---------------------------------------------------------------------------
// Obul — AI proxy company with Lead Sourcing Agent
// ---------------------------------------------------------------------------

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

const [obulCeo] = await db
  .insert(agents)
  .values({
    companyId: obul!.id,
    name: "CEO",
    role: "ceo",
    title: "Chief Executive Officer",
    icon: "briefcase",
    status: "idle",
    adapterType: "claude_local",
    adapterConfig: {
      instructionsFilePath: agentInstructions("ceo.md"),
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 86400, wakeOnDemand: true },
    },
    budgetMonthlyCents: 15_00,
  })
  .returning();

const [leadSourcer] = await db
  .insert(agents)
  .values({
    companyId: obul!.id,
    name: "Lead Sourcing Agent",
    role: "researcher",
    title: "Lead Sourcing Specialist",
    icon: "search",
    status: "idle",
    adapterType: "claude_local",
    adapterConfig: {
      instructionsFilePath: agentInstructions("lead-sourcing.md"),
    },
    runtimeConfig: {
      heartbeat: { enabled: true, wakeOnDemand: true },
    },
    reportsTo: obulCeo!.id,
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

const [enricher] = await db
  .insert(agents)
  .values({
    companyId: obul!.id,
    name: "Enrichment Agent",
    role: "researcher",
    title: "Contact Enrichment Specialist",
    icon: "eye",
    status: "idle",
    adapterType: "claude_local",
    adapterConfig: {
      instructionsFilePath: agentInstructions("enrichment.md"),
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 86400 },
    },
    reportsTo: obulCeo!.id,
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

const [outreacher] = await db
  .insert(agents)
  .values({
    companyId: obul!.id,
    name: "Outreach Agent",
    role: "cmo",
    title: "Outreach Specialist",
    icon: "mail",
    status: "idle",
    adapterType: "claude_local",
    adapterConfig: {
      instructionsFilePath: agentInstructions("outreach.md"),
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 172800 },
    },
    reportsTo: obulCeo!.id,
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

const [responseTracker] = await db
  .insert(agents)
  .values({
    companyId: obul!.id,
    name: "Response Tracker",
    role: "general",
    title: "Response & Follow-up Specialist",
    icon: "radar",
    status: "idle",
    adapterType: "claude_local",
    adapterConfig: {
      instructionsFilePath: agentInstructions("response-tracker.md"),
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 86400 },
    },
    reportsTo: obulCeo!.id,
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

// Grant tasks:assign permission to CEO and pipeline agents for defense-in-depth
await db.insert(principalPermissionGrants).values([
  { companyId: obul!.id, principalType: "agent", principalId: obulCeo!.id, permissionKey: "tasks:assign" },
  { companyId: obul!.id, principalType: "agent", principalId: leadSourcer!.id, permissionKey: "tasks:assign" },
  { companyId: obul!.id, principalType: "agent", principalId: enricher!.id, permissionKey: "tasks:assign" },
  { companyId: obul!.id, principalType: "agent", principalId: outreacher!.id, permissionKey: "tasks:assign" },
]);

// Company goal for the CEO to reference when delegating work
await db.insert(goals).values({
  companyId: obul!.id,
  title: "Grow qualified lead pipeline",
  description:
    "Continuously discover, enrich, and contact qualified leads matching the ICP. " +
    "Target: 50+ qualified leads per month reaching 'ready' status, 10%+ reply rate on outreach.",
  level: "company",
  status: "active",
  ownerAgentId: obulCeo!.id,
});

console.log(
  `Created Obul (${obul!.id}) with agents: Lead Sourcing (${leadSourcer!.id}), Enrichment (${enricher!.id}), Outreach (${outreacher!.id}), Response Tracker (${responseTracker!.id})`,
);

console.log("Seed complete");
process.exit(0);
