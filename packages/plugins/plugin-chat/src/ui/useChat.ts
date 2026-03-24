import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  usePluginAction,
  usePluginData,
  usePluginStream,
} from "@paperclipai/plugin-sdk/ui";
import { ACTION_KEYS, DATA_KEYS, STREAM_CHANNELS } from "../constants.js";
import type { ChatMessage } from "./MessageBubble.js";

interface StreamEvent {
  eventType: "chunk" | "status" | "done" | "error";
  stream: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
}

export function useChat(agentId: string, companyId: string) {
  const historyResult = usePluginData<ChatMessage[]>(DATA_KEYS.chatHistory, { agentId, companyId });
  const chatSend = usePluginAction(ACTION_KEYS.chatSend);

  const channel = `${STREAM_CHANNELS.chatPrefix}${agentId}`;
  const streamResult = usePluginStream<StreamEvent>(channel);

  const [streamingText, setStreamingText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] = useState<ChatMessage | null>(null);
  // Holds the completed assistant response until the history refresh lands
  const [completedMessage, setCompletedMessage] = useState<ChatMessage | null>(null);
  const streamingTextRef = useRef("");

  // Accumulate streaming chunks
  useEffect(() => {
    if (!streamResult.lastEvent) return;
    const event = streamResult.lastEvent;

    if (event.eventType === "chunk" && event.message) {
      streamingTextRef.current += event.message;
      setStreamingText(streamingTextRef.current);
    }

    if (event.eventType === "done" || event.eventType === "error") {
      // Preserve the final text as a completed message so it stays visible
      // until the history refresh brings back the persisted version
      if (streamingTextRef.current) {
        setCompletedMessage({
          id: "__completed__",
          role: "assistant",
          content: streamingTextRef.current,
        });
      }
      streamingTextRef.current = "";
      setStreamingText("");
      setIsSending(false);
      setPendingUserMessage(null);
      // Refresh history to pick up persisted state
      historyResult.refresh();
    }
  }, [streamResult.lastEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear completedMessage once the refreshed history contains it
  useEffect(() => {
    if (completedMessage && historyResult.data?.some(
      (m) => m.role === "assistant" && m.content === completedMessage.content,
    )) {
      setCompletedMessage(null);
    }
  }, [historyResult.data, completedMessage]);

  const sendMessage = useCallback(
    async (message: string) => {
      // Optimistically show the user's message immediately
      setPendingUserMessage({
        id: `pending-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });
      setIsSending(true);
      streamingTextRef.current = "";
      setStreamingText("");

      try {
        await chatSend({ companyId, agentId, message });
      } catch (err) {
        setIsSending(false);
        setPendingUserMessage(null);
        throw err;
      }
    },
    [chatSend, companyId, agentId],
  );

  const messages = useMemo(() => {
    const history = historyResult.data ?? [];
    const result = [...history];
    // Append the pending user message if it's not yet in history
    if (pendingUserMessage && !history.some((m) => m.content === pendingUserMessage.content && m.role === "user" && m.id.startsWith("user-"))) {
      result.push(pendingUserMessage);
    }
    // Append completed assistant message if history hasn't caught up yet
    if (completedMessage && !history.some((m) => m.role === "assistant" && m.content === completedMessage.content)) {
      result.push(completedMessage);
    }
    return result;
  }, [historyResult.data, pendingUserMessage, completedMessage]);

  return {
    messages,
    historyLoading: historyResult.loading,
    streamingText,
    isStreaming: isSending,
    sendMessage,
    refresh: historyResult.refresh,
    error: historyResult.error ?? null,
  };
}
