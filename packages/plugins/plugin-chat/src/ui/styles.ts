import type { CSSProperties } from "react";

export const styles = {
  // ---------------------------------------------------------------------------
  // Page layout
  // ---------------------------------------------------------------------------

  pageLayout: {
    display: "flex",
    height: "calc(100vh - 120px)",
    minHeight: 500,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    color: "#e1e1e1",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    overflow: "hidden",
  } satisfies CSSProperties,

  agentListPanel: {
    width: 220,
    borderRight: "1px solid #2a2a4a",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  } satisfies CSSProperties,

  agentListHeader: {
    padding: "12px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "#9a9abf",
    borderBottom: "1px solid #2a2a4a",
  } satisfies CSSProperties,

  agentListItem: (active: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    border: "none",
    borderLeft: active ? "3px solid #3a3aff" : "3px solid transparent",
    background: active ? "#22223a" : "transparent",
    color: active ? "#e1e1e1" : "#9a9abf",
    cursor: "pointer",
    fontSize: 13,
    textAlign: "left",
    width: "100%",
  }),

  agentItemName: {
    fontWeight: 500,
  } satisfies CSSProperties,

  agentItemRole: {
    fontSize: 11,
    opacity: 0.6,
    textTransform: "capitalize",
  } satisfies CSSProperties,

  chatPanelWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  } satisfies CSSProperties,

  // ---------------------------------------------------------------------------
  // Chat panel (reused from original)
  // ---------------------------------------------------------------------------

  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    color: "#e1e1e1",
    backgroundColor: "#1a1a2e",
  } satisfies CSSProperties,

  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #2a2a4a",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#9a9abf",
  } satisfies CSSProperties,

  agentName: {
    fontWeight: 600,
    color: "#c4c4e0",
  } satisfies CSSProperties,

  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  } satisfies CSSProperties,

  bubbleRow: (isUser: boolean): CSSProperties => ({
    display: "flex",
    justifyContent: isUser ? "flex-end" : "flex-start",
  }),

  bubble: (isUser: boolean): CSSProperties => ({
    padding: "10px 16px",
    borderRadius: 12,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    backgroundColor: isUser ? "#3a3aff" : "#2a2a4a",
    color: isUser ? "#fff" : "#e1e1e1",
    borderBottomRightRadius: isUser ? 4 : 12,
    borderBottomLeftRadius: isUser ? 12 : 4,
  }),

  bubbleLabel: {
    fontSize: 11,
    color: "#7a7a9f",
    marginBottom: 2,
  } satisfies CSSProperties,

  timestamp: {
    fontSize: 10,
    color: "#6a6a8f",
    marginTop: 2,
  } satisfies CSSProperties,

  composerForm: {
    display: "flex",
    padding: "12px 16px",
    borderTop: "1px solid #2a2a4a",
    gap: 8,
  } satisfies CSSProperties,

  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #3a3a5a",
    backgroundColor: "#12122a",
    color: "#e1e1e1",
    fontSize: 14,
    outline: "none",
  } satisfies CSSProperties,

  sendButton: (disabled: boolean): CSSProperties => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    backgroundColor: disabled ? "#2a2a4a" : "#3a3aff",
    color: disabled ? "#6a6a8f" : "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
  }),

  emptyState: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "#6a6a8f",
    fontSize: 14,
  } satisfies CSSProperties,

  errorText: {
    color: "#ff6b6b",
    padding: "8px 16px",
    fontSize: 13,
  } satisfies CSSProperties,

  code: {
    fontFamily: "'Fira Code', 'Consolas', monospace",
    backgroundColor: "#12122a",
    padding: "1px 4px",
    borderRadius: 3,
    fontSize: 13,
  } satisfies CSSProperties,

  codeBlock: {
    fontFamily: "'Fira Code', 'Consolas', monospace",
    backgroundColor: "#12122a",
    padding: "8px 12px",
    borderRadius: 6,
    fontSize: 13,
    overflowX: "auto",
    display: "block",
    whiteSpace: "pre",
    margin: "4px 0",
  } satisfies CSSProperties,
} as const;
