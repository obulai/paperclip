export const PLUGIN_ID = "paperclip-obul";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "obul";

// ---------------------------------------------------------------------------
// Entity types
// ---------------------------------------------------------------------------

export const ENTITY_TYPES = {
  costEvent: "obul-cost",
} as const;

// ---------------------------------------------------------------------------
// Tool names
// ---------------------------------------------------------------------------

export const TOOL_NAMES = {
  logCost: "obul-log-cost",
} as const;

// ---------------------------------------------------------------------------
// UI Slot IDs and export names
// ---------------------------------------------------------------------------

export const SLOT_IDS = {
  page: "obul-page",
  sidebar: "obul-sidebar-nav",
} as const;

export const EXPORT_NAMES = {
  page: "ObulPage",
  sidebar: "ObulSidebarNav",
} as const;

// ---------------------------------------------------------------------------
// Service catalog — static reference data
// ---------------------------------------------------------------------------

export interface ObulService {
  skill: string;
  service: string;
  operation: string;
  costCents: number;
  agents: string[];
  description: string;
}

export const OBUL_SERVICES: ObulService[] = [
  // Lead Sourcing
  { skill: "obul-ortho-apollo", service: "Apollo", operation: "people-search", costCents: 1, agents: ["lead-sourcing"], description: "People search (ICP targeting)" },
  { skill: "obul-twit", service: "Twitter/X", operation: "tweet-search", costCents: 1, agents: ["lead-sourcing"], description: "Tweet search (full archive)" },
  { skill: "obul-twit", service: "Twitter/X", operation: "user-profile", costCents: 1, agents: ["lead-sourcing", "enrichment"], description: "User profile by handle" },
  { skill: "obul-stableenrich-reddit", service: "Reddit", operation: "post-search", costCents: 2, agents: ["lead-sourcing"], description: "Post search" },
  { skill: "obul-scrape-creators", service: "Social (22+ platforms)", operation: "profile-scrape", costCents: 2, agents: ["lead-sourcing", "enrichment", "outreach"], description: "Profile scrape (LinkedIn, Threads, Bluesky, etc.)" },
  { skill: "obul-x402endpoints-firecrawl", service: "Firecrawl", operation: "search", costCents: 1, agents: ["lead-sourcing"], description: "Web search → markdown" },
  // Enrichment
  { skill: "obul-ortho-apollo", service: "Apollo", operation: "person-match", costCents: 1, agents: ["enrichment"], description: "Person match (email/LinkedIn)" },
  { skill: "obul-ortho-apollo", service: "Apollo", operation: "org-enrich", costCents: 1, agents: ["enrichment"], description: "Org enrich by domain" },
  { skill: "obul-ortho-hunter", service: "Hunter", operation: "email-finder", costCents: 1, agents: ["enrichment"], description: "Email finder (name + company)" },
  { skill: "obul-ortho-hunter", service: "Hunter", operation: "email-verifier", costCents: 1, agents: ["enrichment"], description: "Email verifier" },
  { skill: "obul-ortho-hunter", service: "Hunter", operation: "domain-search", costCents: 1, agents: ["enrichment"], description: "Domain search" },
  { skill: "obul-x402endpoints-firecrawl", service: "Firecrawl", operation: "scrape", costCents: 1, agents: ["enrichment"], description: "Contact page scrape" },
];

// ---------------------------------------------------------------------------
// Monthly budget estimates (cents)
// ---------------------------------------------------------------------------

export const MONTHLY_BUDGET_ESTIMATES = {
  "lead-sourcing": { llmCents: 500, obulCents: 400 },
  "enrichment": { llmCents: 300, obulCents: 1400 },
  "outreach": { llmCents: 200, obulCents: 200 },
  "response-tracker": { llmCents: 200, obulCents: 0 },
  "ceo": { llmCents: 300, obulCents: 0 },
} as const;
