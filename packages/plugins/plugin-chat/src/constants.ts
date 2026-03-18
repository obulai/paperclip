export const PLUGIN_ID = "paperclip-chat";
export const PLUGIN_VERSION = "0.1.0";

export const SLOT_IDS = {
  sidebar: "chat-sidebar",
  page: "chat-page",
} as const;

export const EXPORT_NAMES = {
  sidebar: "ChatSidebarNav",
  page: "ChatPage",
} as const;

export const PAGE_ROUTE = "chat";

export const STREAM_CHANNELS = {
  /** Per-agent chat stream, formatted as `chat:{agentId}` */
  chatPrefix: "chat:",
} as const;

export const DATA_KEYS = {
  listAgents: "list-agents",
  chatHistory: "chat-history",
} as const;

export const ACTION_KEYS = {
  chatSend: "chat-send",
} as const;
