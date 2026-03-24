/**
 * One-time setup script: creates the Edison Dental 27 company and agent team
 * in a running Paperclip instance. Safe to run multiple times (idempotent).
 *
 * Usage: cd packages/db && DATABASE_URL=... npx tsx scripts/setup-dental.ts
 */

import { createDb } from "../src/client.js";
import { companies, agents, goals, principalPermissionGrants } from "../src/schema/index.js";
import { eq } from "drizzle-orm";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const db = createDb(url);

// --- Company -----------------------------------------------------------

const existing = await db
  .select()
  .from(companies)
  .where(eq(companies.name, "Edison Dental 27"));

let companyId: string;

if (existing.length > 0) {
  companyId = existing[0]!.id;
  console.log(`Edison Dental 27 company already exists (${companyId}), skipping creation`);
} else {
  const [dental] = await db
    .insert(companies)
    .values({
      name: "Edison Dental 27",
      description:
        "Dental practice in Edison, NJ — agent team managing SEO, GEO/AIGEO, content, appointments, and patient reviews for edisondental27.com",
      status: "active",
      issuePrefix: "EDT",
      budgetMonthlyCents: 50_00,
    })
    .returning();
  companyId = dental!.id;
  console.log(`Created Edison Dental 27 company (${companyId})`);
}

// --- Agents -----------------------------------------------------------

const existingAgents = await db
  .select()
  .from(agents)
  .where(eq(agents.companyId, companyId));

const agentByName = (name: string) =>
  existingAgents.find((a) => a.name === name);

// Practice Director (CEO)

let directorId: string;

if (agentByName("Practice Director")) {
  directorId = agentByName("Practice Director")!.id;
  console.log("Practice Director already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "Practice Director",
      role: "ceo",
      title: "Practice Director",
      icon: "briefcase",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/dental-agency/agent-instructions/practice-director.md",
        heartbeat: { enabled: true, intervalSec: 604800, wakeOnDemand: false },
      },
      budgetMonthlyCents: 10_00,
    })
    .returning();
  directorId = agent!.id;
  console.log(`Created Practice Director (${directorId})`);
}

// SEO Manager

let seoManagerId: string;

if (agentByName("SEO Manager")) {
  seoManagerId = agentByName("SEO Manager")!.id;
  console.log("SEO Manager already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "SEO Manager",
      role: "researcher",
      title: "SEO Manager",
      icon: "search",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/dental-agency/agent-instructions/seo-manager.md",
        heartbeat: { enabled: true, intervalSec: 604800 },
      },
      reportsTo: directorId,
      budgetMonthlyCents: 10_00,
      metadata: {
        targetKeywords: [
          "dentist Edison NJ",
          "family dentist Edison NJ",
          "emergency dentist Edison NJ",
          "dentist near me Edison",
          "teeth cleaning Edison NJ",
          "teeth whitening Edison NJ",
          "dental implants Edison NJ",
          "cosmetic dentist Edison NJ",
        ],
        websiteUrl: "https://www.edisondental27.com",
      },
    })
    .returning();
  seoManagerId = agent!.id;
  console.log(`Created SEO Manager (${seoManagerId})`);
}

// GEO / AIGEO Optimizer

let geoOptimizerId: string;

if (agentByName("GEO / AIGEO Optimizer")) {
  geoOptimizerId = agentByName("GEO / AIGEO Optimizer")!.id;
  console.log("GEO / AIGEO Optimizer already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "GEO / AIGEO Optimizer",
      role: "researcher",
      title: "GEO & AI Search Visibility Specialist",
      icon: "globe",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/dental-agency/agent-instructions/geo-optimizer.md",
        heartbeat: { enabled: true, intervalSec: 1209600 },
      },
      reportsTo: directorId,
      budgetMonthlyCents: 10_00,
      metadata: {
        platforms: ["google_ai_overviews", "chatgpt", "perplexity", "gemini", "bing_copilot"],
        auditQueries: [
          "best dentist in Edison NJ",
          "family dentist Edison New Jersey",
          "emergency dentist near Edison NJ",
        ],
        websiteUrl: "https://www.edisondental27.com",
      },
    })
    .returning();
  geoOptimizerId = agent!.id;
  console.log(`Created GEO / AIGEO Optimizer (${geoOptimizerId})`);
}

// Content Manager

if (agentByName("Content Manager")) {
  console.log("Content Manager already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "Content Manager",
      role: "general",
      title: "Content Manager",
      icon: "pen",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/dental-agency/agent-instructions/content-manager.md",
        heartbeat: { enabled: false, wakeOnDemand: true },
      },
      reportsTo: directorId,
      budgetMonthlyCents: 8_00,
    })
    .returning();
  console.log(`Created Content Manager (${agent!.id})`);
}

// Appointment Coordinator

if (agentByName("Appointment Coordinator")) {
  console.log("Appointment Coordinator already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "Appointment Coordinator",
      role: "general",
      title: "Appointment Coordinator",
      icon: "calendar",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/dental-agency/agent-instructions/appointment-coordinator.md",
        heartbeat: { enabled: true, intervalSec: 86400 },
      },
      reportsTo: directorId,
      budgetMonthlyCents: 5_00,
    })
    .returning();
  console.log(`Created Appointment Coordinator (${agent!.id})`);
}

// Review Manager

if (agentByName("Review Manager")) {
  console.log("Review Manager already exists, skipping creation");
} else {
  const [agent] = await db
    .insert(agents)
    .values({
      companyId,
      name: "Review Manager",
      role: "general",
      title: "Review Manager",
      icon: "star",
      status: "idle",
      adapterType: "claude_local",
      adapterConfig: {},
      runtimeConfig: {
        systemInstructionsPath:
          "packages/dental-agency/agent-instructions/review-manager.md",
        heartbeat: { enabled: true, intervalSec: 604800 },
      },
      reportsTo: directorId,
      budgetMonthlyCents: 5_00,
      metadata: {
        reviewPlatforms: ["google", "yelp", "healthgrades", "zocdoc"],
        alertThreshold: 4.0,
        websiteUrl: "https://www.edisondental27.com",
      },
    })
    .returning();
  console.log(`Created Review Manager (${agent!.id})`);
}

// --- Wire reportsTo for any pre-existing agents ----------------------------

const pipelineAgentNames = [
  "SEO Manager",
  "GEO / AIGEO Optimizer",
  "Content Manager",
  "Appointment Coordinator",
  "Review Manager",
];

const refreshedAgents = await db
  .select()
  .from(agents)
  .where(eq(agents.companyId, companyId));

for (const agentName of pipelineAgentNames) {
  const a = refreshedAgents.find((x) => x.name === agentName);
  if (a && a.reportsTo !== directorId) {
    await db
      .update(agents)
      .set({ reportsTo: directorId })
      .where(eq(agents.id, a.id));
    console.log(`Updated ${agentName} reportsTo → ${directorId}`);
  }
}

// --- Permission grants ---------------------------------------------------

await db
  .insert(principalPermissionGrants)
  .values([
    { companyId, principalType: "agent", principalId: directorId, permissionKey: "tasks:assign" },
    { companyId, principalType: "agent", principalId: seoManagerId, permissionKey: "tasks:assign" },
    { companyId, principalType: "agent", principalId: geoOptimizerId, permissionKey: "tasks:assign" },
  ])
  .onConflictDoNothing();

console.log("Permission grants set");

// --- Company goal --------------------------------------------------------

const existingGoals = await db
  .select()
  .from(goals)
  .where(eq(goals.companyId, companyId));

if (existingGoals.length > 0) {
  console.log("Goal already exists, skipping creation");
} else {
  await db.insert(goals).values({
    companyId,
    title: "Build dominant local digital presence",
    description:
      "Establish Edison Dental 27 as the top-ranked and most AI-visible dental practice in Edison, NJ. " +
      "Targets: rank in top 3 on Google for 'dentist Edison NJ', AIGEO score 70+ across all AI platforms, " +
      "Google rating 4.5+ stars with 50+ reviews.",
    level: "company",
    status: "active",
    ownerAgentId: directorId,
  });
  console.log("Created company goal");
}

console.log(`\nEdison Dental 27 setup complete (companyId: ${companyId})`);
process.exit(0);
