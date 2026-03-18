import { useEffect, useRef } from "react";
import { useChat } from "./useChat.js";
import { MessageBubble } from "./MessageBubble.js";
import { ChatComposer } from "./ChatComposer.js";
import { styles } from "./styles.js";

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
