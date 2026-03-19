import { useMemo, type CSSProperties, type ReactNode } from "react";
import { styles } from "./styles.js";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  authorName?: string;
}

/** Lightweight markdown: **bold**, `code`, ```code blocks```, [links](url) */
function renderMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on code blocks first
  const codeBlockRegex = /```(?:\w*\n)?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...renderInline(text.slice(lastIndex, match.index), nodes.length));
    }
    nodes.push(
      <span key={`cb-${nodes.length}`} style={styles.codeBlock}>
        {match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(...renderInline(text.slice(lastIndex), nodes.length));
  }
  return nodes;
}

function renderInline(text: string, keyOffset: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Match **bold**, `code`, and [text](url)
  const inlineRegex = /(\*\*(.+?)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = keyOffset;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      nodes.push(<strong key={`b-${idx++}`}>{match[2]}</strong>);
    } else if (match[4]) {
      nodes.push(
        <code key={`c-${idx++}`} style={styles.code}>
          {match[4]}
        </code>,
      );
    } else if (match[6] && match[7]) {
      nodes.push(
        <a
          key={`a-${idx++}`}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#7a7aff" }}
        >
          {match[6]}
        </a>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function formatTime(ts: string | undefined): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const rendered = useMemo(() => renderMarkdown(msg.content), [msg.content]);
  const time = formatTime(msg.timestamp);

  return (
    <div style={styles.bubbleRow(isUser)}>
      <div style={{ maxWidth: "75%" }}>
        {!isUser && (
          <div style={styles.bubbleLabel}>Agent</div>
        )}
        <div style={styles.bubble(isUser)}>{rendered}</div>
        {time && <div style={{ ...styles.timestamp, textAlign: isUser ? "right" : "left" }}>{time}</div>}
      </div>
    </div>
  );
}
