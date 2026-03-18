import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";
import { EXPORT_NAMES, PAGE_ROUTE, PLUGIN_ID, PLUGIN_VERSION, SLOT_IDS } from "./constants.js";

const manifest: PaperclipPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Chat",
  description:
    "Standalone chat page with an agent picker. Converse with any agent in real time, with the CEO pre-selected.",
  author: "Paperclip",
  categories: ["ui"],
  capabilities: [
    "agents.read",
    "agent.sessions.create",
    "agent.sessions.send",
    "agent.sessions.close",
    "plugin.state.read",
    "plugin.state.write",
    "ui.sidebar.register",
    "ui.page.register",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  ui: {
    slots: [
      {
        type: "sidebar",
        id: SLOT_IDS.sidebar,
        displayName: "Chat",
        exportName: EXPORT_NAMES.sidebar,
      },
      {
        type: "page",
        id: SLOT_IDS.page,
        displayName: "Chat",
        exportName: EXPORT_NAMES.page,
        routePath: PAGE_ROUTE,
      },
    ],
  },
};

export default manifest;
