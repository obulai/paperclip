import { useEffect, useRef, type CSSProperties } from "react";
import { useChat } from "./useChat.js";
import { MessageBubble } from "./MessageBubble.js";
import { ChatComposer } from "./ChatComposer.js";
import { styles } from "./styles.js";

function TypingIndicator() {
  const dotStyle: CSSProperties = {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    backgroundColor: "#7a7a9f",
    animation: "typing-pulse 1.4s infinite ease-in-out",
  };

  return (
    <div style={styles.bubbleRow(false)}>
      <div style={{ maxWidth: "75%" }}>
        <div style={styles.bubbleLabel}>Agent</div>
        <div style={{ ...styles.bubble(false), display: "flex", gap: 5, alignItems: "center", padding: "14px 18px" }}>
          <style>{`
            @keyframes typing-pulse {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1); }
            }
          `}</style>
          <span style={{ ...dotStyle, animationDelay: "0s" }} />
          <span style={{ ...dotStyle, animationDelay: "0.2s" }} />
          <span style={{ ...dotStyle, animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}

interface ChatPanelProps {
  agentId: string;
  agentName: string;
  companyId: string;
}

export function ChatPanel({ agentId, agentName, companyId }: ChatPanelProps) {
  const {
    messages,
    historyLoading,
    streamingText,
    isStreaming,
    sendMessage,
    error,
  } = useChat(agentId, companyId);

  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or streaming text
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, streamingText]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>Error: {String(error)}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.agentName}>{agentName}</span>
      </div>

      <div ref={listRef} style={styles.messageList}>
        {historyLoading && messages.length === 0 && (
          <div style={styles.emptyState}>Loading messages...</div>
        )}

        {!historyLoading && messages.length === 0 && !streamingText && (
          <div style={styles.emptyState}>No messages yet. Start the conversation!</div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isStreaming && !streamingText && <TypingIndicator />}

        {streamingText && (
          <MessageBubble
            msg={{
              id: "__streaming__",
              role: "assistant",
              content: streamingText,
            }}
          />
        )}
      </div>

      <ChatComposer onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
