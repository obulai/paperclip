import { type CSSProperties } from "react";
import {
  usePluginData,
  type PluginPageProps,
  type PluginSidebarProps,
} from "@paperclipai/plugin-sdk/ui";
import { OBUL_SERVICES, MONTHLY_BUDGET_ESTIMATES } from "../constants.js";

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const layoutStack: CSSProperties = { display: "grid", gap: "12px" };

const cardStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "14px",
  background: "var(--card, transparent)",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "12px",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "1px solid var(--border)",
  opacity: 0.6,
  fontWeight: 500,
};

const tdStyle: CSSProperties = {
  padding: "6px 8px",
  borderBottom: "1px solid var(--border, #e5e7eb)",
  verticalAlign: "top",
};

const badgeStyle = (color: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "2px 8px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 600,
  background: color + "22",
  color,
  border: `1px solid ${color}44`,
});

const monoStyle: CSSProperties = {
  fontFamily: "monospace",
  fontSize: "11px",
  background: "var(--muted, #f3f4f6)",
  padding: "1px 4px",
  borderRadius: "3px",
};

// ---------------------------------------------------------------------------
// Key Status Badge
// ---------------------------------------------------------------------------

type KeyStatus = {
  configured: boolean;
  reachable: boolean;
  message: string;
  statusCode?: number;
};

function KeyStatusBadge() {
  const { data, loading } = usePluginData<KeyStatus>("obul-key-status", {});

  if (loading) {
    return <span style={badgeStyle("#94a3b8")}>⏳ Checking…</span>;
  }

  if (!data) {
    return <span style={badgeStyle("#ef4444")}>✗ Unknown</span>;
  }

  if (!data.configured) {
    return <span style={badgeStyle("#ef4444")}>✗ No API key</span>;
  }

  if (data.reachable) {
    return <span style={badgeStyle("#22c55e")}>✓ Connected</span>;
  }

  return <span style={badgeStyle("#f59e0b")}>⚠ Unreachable</span>;
}

// ---------------------------------------------------------------------------
// Cost Summary
// ---------------------------------------------------------------------------

type CostSummary = {
  totalCents: number;
  byService: Record<string, { costCents: number; requestCount: number }>;
  byAgent: Record<string, { costCents: number; requestCount: number }>;
  eventCount: number;
};

function CostBreakdown() {
  const { data, loading } = usePluginData<CostSummary>("obul-cost-summary", {});

  if (loading) {
    return <div style={{ opacity: 0.5, fontSize: "12px" }}>Loading cost data…</div>;
  }

  if (!data || data.eventCount === 0) {
    return (
      <div style={{ opacity: 0.5, fontSize: "12px" }}>
        No Obul API costs recorded yet. Costs appear here after agents call{" "}
        <code style={monoStyle}>obul-log-cost</code>.
      </div>
    );
  }

  const agentEntries = Object.entries(data.byAgent).sort((a, b) => b[1].costCents - a[1].costCents);
  const serviceEntries = Object.entries(data.byService).sort((a, b) => b[1].costCents - a[1].costCents);

  return (
    <div style={layoutStack}>
      <div style={{ fontSize: "13px", fontWeight: 600 }}>
        Total Obul API spend:{" "}
        <span style={{ color: "#f59e0b" }}>${(data.totalCents / 100).toFixed(2)}</span>
        <span style={{ opacity: 0.5, fontSize: "11px", marginLeft: "6px" }}>
          ({data.eventCount} calls)
        </span>
      </div>

      {agentEntries.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", opacity: 0.6, marginBottom: "6px", fontWeight: 500 }}>BY AGENT</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Agent</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Cost</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Requests</th>
              </tr>
            </thead>
            <tbody>
              {agentEntries.map(([agent, stats]) => (
                <tr key={agent}>
                  <td style={tdStyle}>{agent}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>${(stats.costCents / 100).toFixed(3)}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{stats.requestCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {serviceEntries.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", opacity: 0.6, marginBottom: "6px", fontWeight: 500 }}>BY SERVICE</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Service</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Cost</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Requests</th>
              </tr>
            </thead>
            <tbody>
              {serviceEntries.map(([service, stats]) => (
                <tr key={service}>
                  <td style={tdStyle}><code style={monoStyle}>{service}</code></td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>${(stats.costCents / 100).toFixed(3)}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{stats.requestCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Service Catalog
// ---------------------------------------------------------------------------

function ServiceCatalog() {
  const agentNames = ["lead-sourcing", "enrichment", "outreach"];

  return (
    <div style={layoutStack}>
      {agentNames.map((agentName) => {
        const services = OBUL_SERVICES.filter((s) => s.agents.includes(agentName));
        if (services.length === 0) return null;
        const label = agentName.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <div key={agentName}>
            <div style={{ fontSize: "11px", opacity: 0.6, marginBottom: "6px", fontWeight: 500 }}>
              {label.toUpperCase()} AGENT
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Obul Skill</th>
                  <th style={thStyle}>Operation</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{s.service}</td>
                    <td style={tdStyle}><code style={monoStyle}>{s.skill}</code></td>
                    <td style={tdStyle}>{s.description}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {s.costCents === 0 ? (
                        <span style={{ opacity: 0.5 }}>free</span>
                      ) : (
                        `$${(s.costCents / 100).toFixed(3)}`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monthly Budget Estimates
// ---------------------------------------------------------------------------

function BudgetEstimates() {
  const agents = Object.entries(MONTHLY_BUDGET_ESTIMATES);
  const totalLlm = agents.reduce((sum, [, v]) => sum + v.llmCents, 0);
  const totalObul = agents.reduce((sum, [, v]) => sum + v.obulCents, 0);

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Agent</th>
          <th style={{ ...thStyle, textAlign: "right" }}>LLM/mo</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Obul API/mo</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Total/mo</th>
        </tr>
      </thead>
      <tbody>
        {agents.map(([name, v]) => (
          <tr key={name}>
            <td style={tdStyle}>{name}</td>
            <td style={{ ...tdStyle, textAlign: "right" }}>${(v.llmCents / 100).toFixed(0)}</td>
            <td style={{ ...tdStyle, textAlign: "right", color: v.obulCents > 0 ? "#f59e0b" : undefined }}>
              ${(v.obulCents / 100).toFixed(0)}
            </td>
            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
              ${((v.llmCents + v.obulCents) / 100).toFixed(0)}
            </td>
          </tr>
        ))}
        <tr style={{ borderTop: "2px solid var(--border)" }}>
          <td style={{ ...tdStyle, fontWeight: 600 }}>Total</td>
          <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>${(totalLlm / 100).toFixed(0)}</td>
          <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, color: "#f59e0b" }}>${(totalObul / 100).toFixed(0)}</td>
          <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>${((totalLlm + totalObul) / 100).toFixed(0)}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function ObulPage(_props: PluginPageProps) {
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", ...layoutStack }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Obul</h1>
        <KeyStatusBadge />
      </div>
      <p style={{ margin: 0, opacity: 0.6, fontSize: "13px" }}>
        Obul proxy skill catalog and API cost tracking for Paperclip agents.
      </p>

      {/* Cost Breakdown */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600 }}>API Cost Tracking</h2>
        <CostBreakdown />
      </div>

      {/* Monthly Budget */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600 }}>
          Monthly Budget Estimates
        </h2>
        <p style={{ margin: "0 0 10px", fontSize: "12px", opacity: 0.6 }}>
          Estimated monthly costs assuming ~22 runs/month per agent. Total well within $100/month Obul budget.
        </p>
        <BudgetEstimates />
      </div>

      {/* Service Catalog */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600 }}>Service Catalog</h2>
        <p style={{ margin: "0 0 10px", fontSize: "12px", opacity: 0.6 }}>
          All services proxied via <code style={monoStyle}>https://proxy.obul.ai/proxy/https/&#123;upstream&#125;</code>{" "}
          with <code style={monoStyle}>x-obul-api-key</code> header.
        </p>
        <ServiceCatalog />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar nav
// ---------------------------------------------------------------------------

export function ObulSidebarNav(_props: PluginSidebarProps) {
  return (
    <div style={{ padding: "8px 12px", fontSize: "12px", opacity: 0.8 }}>
      Obul
    </div>
  );
}
