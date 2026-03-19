import { useState, type CSSProperties } from "react";
import {
  usePluginData,
  type PluginSidebarProps,
  type PluginPageProps,
} from "@paperclipai/plugin-sdk/ui";
import { ChatPanel } from "./ChatPanel.js";
import { DATA_KEYS, PAGE_ROUTE } from "../constants.js";
import { styles } from "./styles.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentListItem {
  id: string;
  name: string;
  role: string;
  icon: string | null;
  status: string;
}

// ---------------------------------------------------------------------------
// Sidebar nav — link to chat page
// ---------------------------------------------------------------------------

function ChatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export function ChatSidebarNav({ context }: PluginSidebarProps) {
  const prefix = context.companyPrefix ? `/${context.companyPrefix}` : "";

  const linkStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "inherit",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "grid", gap: "2px" }}>
      <a href={`${prefix}/${PAGE_ROUTE}`} style={linkStyle}>
        <ChatIcon size={16} />
        Chat
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full chat page with agent picker
// ---------------------------------------------------------------------------

export function ChatPage({ context }: PluginPageProps) {
  const companyId = context.companyId;

  if (!companyId) {
    return <div style={{ padding: 16, color: "#6a6a8f" }}>No company context available.</div>;
  }

  return <ChatPageInner companyId={companyId} />;
}

function ChatPageInner({ companyId }: { companyId: string }) {
  const { data: agents, loading } = usePluginData<AgentListItem[]>(DATA_KEYS.listAgents, {
    companyId,
  });

  // Pre-select CEO (first in the sorted list) once agents load
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const agentList = agents ?? [];
  const activeAgentId = selectedAgentId ?? agentList[0]?.id ?? null;

  const activeAgent = agentList.find((a) => a.id === activeAgentId);

  return (
    <div style={styles.pageLayout}>
      {/* Agent list */}
      <div style={styles.agentListPanel}>
        <div style={styles.agentListHeader}>Agents</div>
        {loading && <div style={styles.emptyState}>Loading agents...</div>}
        {!loading && agentList.length === 0 && (
          <div style={styles.emptyState}>No agents found.</div>
        )}
        {agentList.map((agent) => (
          <button
            key={agent.id}
            style={styles.agentListItem(agent.id === activeAgentId)}
            onClick={() => setSelectedAgentId(agent.id)}
          >
            <span style={styles.agentItemName}>{agent.name}</span>
            <span style={styles.agentItemRole}>{agent.role}</span>
          </button>
        ))}
      </div>

      {/* Chat panel */}
      <div style={styles.chatPanelWrapper}>
        {activeAgentId ? (
          <ChatPanel
            key={activeAgentId}
            agentId={activeAgentId}
            agentName={activeAgent?.name ?? "Agent"}
            companyId={companyId}
          />
        ) : (
          <div style={styles.emptyState}>Select an agent to start chatting.</div>
        )}
      </div>
    </div>
  );
}
