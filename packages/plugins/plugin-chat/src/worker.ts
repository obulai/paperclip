import {
  definePlugin,
  runWorker,
  type PaperclipPlugin,
  type PluginContext,
} from "@paperclipai/plugin-sdk";
import { ACTION_KEYS, DATA_KEYS, STREAM_CHANNELS } from "./constants.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireString(params: Record<string, unknown>, key: string): string {
  const v = params[key];
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`${key} is required`);
  }
  return v;
}

function streamChannel(agentId: string) {
  return `${STREAM_CHANNELS.chatPrefix}${agentId}`;
}

function historyStateKey(agentId: string) {
  return {
    scopeKind: "company" as const,
    stateKey: `history:${agentId}`,
  };
}

function sessionStateKey(agentId: string) {
  return {
    scopeKind: "company" as const,
    stateKey: `session:${agentId}`,
  };
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  authorName?: string;
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

const plugin: PaperclipPlugin = definePlugin({
  async setup(ctx: PluginContext) {
    // -----------------------------------------------------------------------
    // Data: list-agents
    // -----------------------------------------------------------------------
    ctx.data.register(DATA_KEYS.listAgents, async (params) => {
      const companyId = requireString(params, "companyId");
      const agents = await ctx.agents.list({ companyId });
      const mapped = agents.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.role,
        icon: a.icon ?? null,
        status: a.status,
      }));
      // Sort CEO first
      mapped.sort((a, b) => {
        if (a.role === "ceo" && b.role !== "ceo") return -1;
        if (a.role !== "ceo" && b.role === "ceo") return 1;
        return a.name.localeCompare(b.name);
      });
      return mapped;
    });

    // -----------------------------------------------------------------------
    // Data: chat-history
    // -----------------------------------------------------------------------
    ctx.data.register(DATA_KEYS.chatHistory, async (params) => {
      const companyId = requireString(params, "companyId");
      const agentId = requireString(params, "agentId");
      const key = { ...historyStateKey(agentId), scopeId: companyId };
      const history = (await ctx.state.get(key)) as ChatMessage[] | null;
      return history ?? [];
    });

    // -----------------------------------------------------------------------
    // Action: chat-send
    // -----------------------------------------------------------------------
    ctx.actions.register(ACTION_KEYS.chatSend, async (params) => {
      const companyId = requireString(params, "companyId");
      const agentId = requireString(params, "agentId");
      const message = requireString(params, "message");

      const histKey = { ...historyStateKey(agentId), scopeId: companyId };
      const sessKey = { ...sessionStateKey(agentId), scopeId: companyId };

      // Append user message to state
      const history = ((await ctx.state.get(histKey)) as ChatMessage[] | null) ?? [];
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      history.push(userMsg);
      await ctx.state.set(histKey, history);

      // Look up or create session
      let sessionId = (await ctx.state.get(sessKey)) as string | null;

      if (!sessionId) {
        const session = await ctx.agents.sessions.create(agentId, companyId, {
          reason: "Chat plugin conversation",
        });
        sessionId = session.sessionId;
        await ctx.state.set(sessKey, sessionId);
      }

      // Open stream for this agent
      const channel = streamChannel(agentId);
      ctx.streams.open(channel, companyId);

      // Send message and stream response
      let assistantText = "";

      await ctx.agents.sessions.sendMessage(sessionId, companyId, {
        prompt: message,
        reason: "Chat plugin message",
        onEvent: (event) => {
          ctx.streams.emit(channel, {
            eventType: event.eventType,
            stream: event.stream,
            message: event.message,
            payload: event.payload,
          });

          if (event.eventType === "chunk" && event.message) {
            assistantText += event.message;
          }

          if (event.eventType === "done" || event.eventType === "error") {
            // Persist assistant message to state history
            const persist = async () => {
              try {
                if (assistantText) {
                  const current = ((await ctx.state.get(histKey)) as ChatMessage[] | null) ?? [];
                  current.push({
                    id: `asst-${Date.now()}`,
                    role: "assistant",
                    content: assistantText,
                    timestamp: new Date().toISOString(),
                    authorName: agentId,
                  });
                  await ctx.state.set(histKey, current);
                }
              } catch (e) {
                ctx.logger.error("Failed to persist assistant message", { error: e });
              }
            };
            void persist();
            ctx.streams.close(channel);
          }
        },
      });

      return { channel, sessionId };
    });
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
