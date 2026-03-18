import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";
import {
  EXPORT_NAMES,
  PAGE_ROUTE,
  PLUGIN_ID,
  PLUGIN_VERSION,
  SLOT_IDS,
  TOOL_NAMES,
} from "./constants.js";

const manifest: PaperclipPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "CRM",
  description:
    "CRM plugin for tracking inbound companies, people, and outreach status with agent assignment.",
  author: "Paperclip",
  categories: ["ui"],
  capabilities: [
    "companies.read",
    "agents.read",
    "activity.log.write",
    "events.subscribe",
    "plugin.state.read",
    "plugin.state.write",
    "agent.tools.register",
    "ui.sidebar.register",
    "ui.page.register",
    "ui.dashboardWidget.register",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  tools: [
    {
      name: TOOL_NAMES.search,
      displayName: "CRM Search",
      description:
        "Search CRM companies and people by name, status, or tags.",
      parametersSchema: {
        type: "object",
        properties: {
          entityType: {
            type: "string",
            enum: ["crm-company", "crm-person"],
            description: "Type of CRM entity to search",
          },
          query: {
            type: "string",
            description: "Search text to match against name/title",
          },
          status: {
            type: "string",
            description: "Filter by status value",
          },
        },
      },
    },
    {
      name: TOOL_NAMES.updateStatus,
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
    {
      name: TOOL_NAMES.logActivity,
      displayName: "CRM Log Activity",
      description: "Log an outreach activity against a CRM record.",
      parametersSchema: {
        type: "object",
        properties: {
          relatedEntityId: { type: "string" },
          relatedEntityType: {
            type: "string",
            enum: ["crm-company", "crm-person"],
          },
          activityType: {
            type: "string",
            enum: ["email_sent", "call", "meeting", "note", "status_change"],
          },
          description: { type: "string" },
        },
        required: ["relatedEntityId", "relatedEntityType", "activityType", "description"],
      },
    },
    {
      name: TOOL_NAMES.getSummary,
      displayName: "CRM Pipeline Summary",
      description: "Get aggregate pipeline stats for CRM companies and people.",
      parametersSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
  ui: {
    slots: [
      {
        type: "page",
        id: SLOT_IDS.page,
        displayName: "CRM",
        exportName: EXPORT_NAMES.page,
        routePath: PAGE_ROUTE,
      },
      {
        type: "page",
        id: SLOT_IDS.companiesPage,
        displayName: "CRM Companies",
        exportName: EXPORT_NAMES.companiesPage,
        routePath: "crm/companies",
      },
      {
        type: "page",
        id: SLOT_IDS.peoplePage,
        displayName: "CRM People",
        exportName: EXPORT_NAMES.peoplePage,
        routePath: "crm/people",
      },
      {
        type: "dashboardWidget",
        id: SLOT_IDS.dashboardWidget,
        displayName: "CRM Pipeline",
        exportName: EXPORT_NAMES.dashboardWidget,
      },
      {
        type: "sidebar",
        id: SLOT_IDS.sidebar,
        displayName: "CRM",
        exportName: EXPORT_NAMES.sidebar,
      },
    ],
  },
};

export default manifest;
