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
  displayName: "Obul",
  description: "Obul skill catalog, API key status, and agent API cost tracking.",
  author: "Paperclip",
  categories: ["ui"],
  capabilities: [
    "companies.read",
    "agents.read",
    "activity.log.write",
    "plugin.state.read",
    "plugin.state.write",
    "agent.tools.register",
    "ui.sidebar.register",
    "ui.page.register",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  tools: [
    {
      name: TOOL_NAMES.logCost,
      displayName: "Obul Log Cost",
      description:
        "Record an Obul API call cost. Call this after every Obul proxy request so spend is tracked in the Obul dashboard.",
      parametersSchema: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description: "Obul skill name (e.g. 'obul-twit', 'obul-ortho-apollo')",
          },
          operation: {
            type: "string",
            description: "Operation performed (e.g. 'tweet-search', 'person-match')",
          },
          costCents: {
            type: "number",
            description: "Cost in US cents (e.g. 1 for $0.01)",
          },
          requestCount: {
            type: "number",
            description: "Number of API requests made (default: 1)",
          },
        },
        required: ["service", "operation", "costCents"],
      },
    },
  ],
  ui: {
    slots: [
      {
        type: "page",
        id: SLOT_IDS.page,
        displayName: "Obul",
        exportName: EXPORT_NAMES.page,
        routePath: PAGE_ROUTE,
      },
      {
        type: "sidebar",
        id: SLOT_IDS.sidebar,
        displayName: "Obul",
        exportName: EXPORT_NAMES.sidebar,
      },
    ],
  },
};

export default manifest;
