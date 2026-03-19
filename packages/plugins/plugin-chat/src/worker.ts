import { spawn, type ChildProcess } from "node:child_process";
import {
  definePlugin,
  runWorker,
  type PaperclipPlugin,
  type PluginContext,
} from "@paperclipai/plugin-sdk";
import type { Agent } from "@paperclipai/shared/types/agent";
import type { Company } from "@paperclipai/shared/types/company";
import type { Goal } from "@paperclipai/shared/types/goal";
import type { Issue } from "@paperclipai/shared/types/issue";
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  authorName?: string;
}

const MAX_HISTORY = 100;
const HISTORY_IN_PROMPT = 30;

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

function buildSystemPrompt(
  agent: Agent,
  company: Company,
  agents: Agent[],
  issues: Issue[],
  goals: Goal[],
  history: ChatMessage[],
): string {
  const lines: string[] = [];

  // Identity
  const titleOrRole = agent.title ?? agent.role;
  lines.push(`You are ${agent.name}, ${titleOrRole} at ${company.name}.`);
  if (company.description) {
    lines.push(company.description);
  }
  lines.push("");

  // Capabilities / persona
  if (agent.capabilities) {
    lines.push(agent.capabilities);
    lines.push("");
  }

  // Reporting chain
  const reportsToAgent = agent.reportsTo
    ? agents.find((a) => a.id === agent.reportsTo)
    : null;
  lines.push(
    `You report to: ${reportsToAgent ? reportsToAgent.name : "the board"}`,
  );
  lines.push("");

  // Team roster
  if (agents.length > 0) {
    lines.push("## Your Team");
    for (const a of agents) {
      const title = a.title ?? a.role;
      const caps = a.capabilities
        ? ` — ${a.capabilities.slice(0, 80)}`
        : "";
      lines.push(`- ${a.name} — ${title} (${a.status})${caps}`);
    }
    lines.push("");
  }

  // Goals
  if (goals.length > 0) {
    lines.push("## Company Goals");
    for (const g of goals) {
      const owner = g.ownerAgentId
        ? agents.find((a) => a.id === g.ownerAgentId)?.name ?? "unknown"
        : "unassigned";
      const desc = g.description ? ` — ${g.description.slice(0, 100)}` : "";
      lines.push(`- [${g.status}] ${g.title}${desc} (owned by ${owner})`);
    }
    lines.push("");
  }

  // Recent issues
  if (issues.length > 0) {
    lines.push("## Current Work (Recent Issues)");
    for (const i of issues) {
      const assignee = i.assigneeAgentId
        ? agents.find((a) => a.id === i.assigneeAgentId)?.name ?? "unknown"
        : "unassigned";
      const desc = i.description
        ? `\n  Description: ${i.description.slice(0, 150)}...`
        : "";
      lines.push(
        `- [${i.identifier ?? i.id.slice(0, 8)}] ${i.title} (${i.status}, assigned to ${assignee}, priority: ${i.priority})${desc}`,
      );
    }
    lines.push("");
  }

  // Conversation history
  const recentHistory = history.slice(-HISTORY_IN_PROMPT);
  if (recentHistory.length > 0) {
    lines.push("## Conversation History");
    for (const msg of recentHistory) {
      const label = msg.role === "user" ? "User" : "Assistant";
      lines.push(`${label}: ${msg.content}`);
    }
    lines.push("");
  }

  // Instructions
  lines.push("## Instructions");
  lines.push(
    "Respond conversationally as this agent. Be helpful, concise, and stay in character.",
  );
  lines.push(
    "Use the context above (team, goals, current work) to inform your responses.",
  );
  lines.push("Do not mention that you are an AI or a language model.");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Claude CLI spawner
// ---------------------------------------------------------------------------

interface SpawnCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}

function spawnClaudeChat(
  systemPrompt: string,
  userMessage: string,
  callbacks: SpawnCallbacks,
): ChildProcess {
  const args = [
    "-p",
    userMessage,
    "--system-prompt",
    systemPrompt,
    "--output-format",
    "stream-json",
    "--verbose",
    "--include-partial-messages",
    "--model",
    "sonnet",
    "--tools",
    "",
    "--disable-slash-commands",
    "--no-session-persistence",
    "--permission-mode",
    "bypassPermissions",
  ];

  // Ensure claude is findable — add common install locations to PATH
  const extraPaths = [
    `${process.env.HOME}/.local/bin`,
    "/usr/local/bin",
    `${process.env.HOME}/.nvm/versions/node/current/bin`,
  ].join(":");
  const env = {
    ...process.env,
    PATH: `${extraPaths}:${process.env.PATH ?? ""}`,
  };

  const child = spawn("claude", args, {
    stdio: ["ignore", "pipe", "pipe"],
    env,
  });

  let lastEmittedText = "";
  let buffer = "";

  child.stdout!.on("data", (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    // Keep the last partial line in the buffer
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        continue;
      }

      if (parsed.type === "assistant") {
        const msg = parsed.message as
          | { content?: Array<{ type: string; text?: string }> }
          | undefined;
        if (msg?.content) {
          for (const block of msg.content) {
            if (block.type === "text" && block.text) {
              // Only emit the delta (new text since last emit)
              if (block.text.length > lastEmittedText.length) {
                const delta = block.text.slice(lastEmittedText.length);
                lastEmittedText = block.text;
                callbacks.onChunk(delta);
              }
            }
          }
        }
      } else if (parsed.type === "result") {
        if (parsed.subtype === "error") {
          const errMsg =
            (parsed as Record<string, unknown>).error_message ??
            "Claude process error";
          callbacks.onError(String(errMsg));
        } else {
          // For "success" or any other result subtype, check if there's
          // remaining text in the result itself
          const result = parsed.result as string | undefined;
          if (result && result.length > lastEmittedText.length) {
            const delta = result.slice(lastEmittedText.length);
            lastEmittedText = result;
            callbacks.onChunk(delta);
          }
          callbacks.onDone();
        }
      }
      // Ignore "system", "rate_limit_event", thinking blocks
    }
  });

  child.stderr!.on("data", (data: Buffer) => {
    // stderr is informational, don't treat as error unless process exits badly
    void data;
  });

  child.on("error", (err) => {
    callbacks.onError(`Failed to spawn claude: ${err.message}`);
  });

  child.on("close", (code) => {
    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim());
        if (parsed.type === "result" && parsed.subtype !== "error") {
          const result = parsed.result as string | undefined;
          if (result && result.length > lastEmittedText.length) {
            const delta = result.slice(lastEmittedText.length);
            callbacks.onChunk(delta);
          }
          callbacks.onDone();
          return;
        }
      } catch {
        // Not valid JSON, ignore
      }
    }
    if (code !== 0 && code !== null) {
      callbacks.onError(`claude process exited with code ${code}`);
    }
  });

  return child;
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

const plugin: PaperclipPlugin = definePlugin({
  async setup(ctx: PluginContext) {
    // Track active child processes for cleanup
    const activeProcesses = new Map<string, ChildProcess>();

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

      // Append user message to state
      let history =
        ((await ctx.state.get(histKey)) as ChatMessage[] | null) ?? [];
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      history.push(userMsg);

      // Cap history at MAX_HISTORY
      if (history.length > MAX_HISTORY) {
        history = history.slice(-MAX_HISTORY);
      }
      await ctx.state.set(histKey, history);

      // Gather context in parallel
      const [agent, agents, company, issues, goals] = await Promise.all([
        ctx.agents.get(agentId, companyId),
        ctx.agents.list({ companyId }),
        ctx.companies.get(companyId),
        ctx.issues.list({ companyId, limit: 20 }),
        ctx.goals.list({ companyId }),
      ]);

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }
      if (!company) {
        throw new Error(`Company ${companyId} not found`);
      }

      // Build system prompt with all context
      const systemPrompt = buildSystemPrompt(
        agent,
        company,
        agents,
        issues,
        goals,
        history,
      );

      // Open stream for this agent
      const channel = streamChannel(agentId);
      ctx.streams.open(channel, companyId);

      // Kill any existing process for this agent
      const existing = activeProcesses.get(agentId);
      if (existing) {
        existing.kill("SIGTERM");
        activeProcesses.delete(agentId);
      }

      // Spawn claude CLI
      let assistantText = "";

      const child = spawnClaudeChat(systemPrompt, message, {
        onChunk: (text) => {
          assistantText += text;
          ctx.streams.emit(channel, {
            eventType: "chunk",
            stream: null,
            message: text,
            payload: null,
          });
        },
        onDone: () => {
          activeProcesses.delete(agentId);
          const persist = async () => {
            try {
              if (assistantText) {
                const current =
                  ((await ctx.state.get(histKey)) as ChatMessage[] | null) ??
                  [];
                current.push({
                  id: `asst-${Date.now()}`,
                  role: "assistant",
                  content: assistantText,
                  timestamp: new Date().toISOString(),
                  authorName: agent.name,
                });
                // Cap history
                const capped =
                  current.length > MAX_HISTORY
                    ? current.slice(-MAX_HISTORY)
                    : current;
                await ctx.state.set(histKey, capped);
              }
            } catch (e) {
              ctx.logger.error("Failed to persist assistant message", {
                error: e,
              });
            }
          };
          void persist();
          ctx.streams.emit(channel, {
            eventType: "done",
            stream: null,
            message: null,
            payload: null,
          });
          ctx.streams.close(channel);
        },
        onError: (err) => {
          activeProcesses.delete(agentId);
          ctx.logger.error("Claude chat error", { error: err });
          ctx.streams.emit(channel, {
            eventType: "error",
            stream: null,
            message: err,
            payload: null,
          });
          ctx.streams.close(channel);
        },
      });

      activeProcesses.set(agentId, child);

      return { channel };
    });
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
