export const PLUGIN_ID = "paperclip-crm";
export const PLUGIN_VERSION = "0.1.0";

// ---------------------------------------------------------------------------
// Entity types
// ---------------------------------------------------------------------------

export const ENTITY_TYPES = {
  company: "crm-company",
  person: "crm-person",
  activity: "crm-activity",
} as const;

// ---------------------------------------------------------------------------
// Status enums with display labels and colors (Denchclaw-inspired palette)
// ---------------------------------------------------------------------------

export type CompanyStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export const COMPANY_STATUSES: Record<CompanyStatus, { label: string; color: string }> = {
  new: { label: "New", color: "#94a3b8" },
  contacted: { label: "Contacted", color: "#3b82f6" },
  qualified: { label: "Qualified", color: "#f59e0b" },
  converted: { label: "Converted", color: "#22c55e" },
  lost: { label: "Lost", color: "#ef4444" },
};

export type PersonStatus = "not_contacted" | "ready" | "contacted" | "replied" | "converted" | "unresponsive";

export const PERSON_STATUSES: Record<PersonStatus, { label: string; color: string }> = {
  not_contacted: { label: "Not Contacted", color: "#94a3b8" },
  ready: { label: "Ready", color: "#8b5cf6" },
  contacted: { label: "Contacted", color: "#3b82f6" },
  replied: { label: "Replied", color: "#f59e0b" },
  converted: { label: "Converted", color: "#22c55e" },
  unresponsive: { label: "Unresponsive", color: "#ef4444" },
};

export type CompanySize = "startup" | "smb" | "mid-market" | "enterprise";

export const COMPANY_SIZES: Record<CompanySize, string> = {
  startup: "Startup",
  smb: "SMB",
  "mid-market": "Mid-Market",
  enterprise: "Enterprise",
};

export type LeadSource = "inbound" | "referral" | "outbound" | "event";

export const LEAD_SOURCES: Record<LeadSource, string> = {
  inbound: "Inbound",
  referral: "Referral",
  outbound: "Outbound",
  event: "Event",
};

export type OutreachChannel = "email" | "linkedin" | "twitter" | "phone" | "other";

export const OUTREACH_CHANNELS: Record<OutreachChannel, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  phone: "Phone",
  other: "Other",
};

export type ActivityType = "email_sent" | "call" | "meeting" | "note" | "status_change";

export const ACTIVITY_TYPES: Record<ActivityType, string> = {
  email_sent: "Email Sent",
  call: "Call",
  meeting: "Meeting",
  note: "Note",
  status_change: "Status Change",
};

// ---------------------------------------------------------------------------
// UI Slot IDs and export names
// ---------------------------------------------------------------------------

export const PAGE_ROUTE = "crm";

export const SLOT_IDS = {
  page: "crm-page",
  companiesPage: "crm-companies-page",
  peoplePage: "crm-people-page",
  dashboardWidget: "crm-dashboard-widget",
  sidebar: "crm-sidebar-nav",
} as const;

export const EXPORT_NAMES = {
  page: "CRMPage",
  companiesPage: "CompaniesPage",
  peoplePage: "PeoplePage",
  dashboardWidget: "DashboardWidget",
  sidebar: "CRMSidebarNav",
} as const;

// ---------------------------------------------------------------------------
// Tool names
// ---------------------------------------------------------------------------

export const TOOL_NAMES = {
  search: "crm-search",
  updateStatus: "crm-update-status",
  logActivity: "crm-log-activity",
  getSummary: "crm-get-summary",
} as const;
