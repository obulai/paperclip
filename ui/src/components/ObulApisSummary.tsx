import { useEffect, useState } from "react";
import {
  AGENT_NAME_TO_OBUL_SLUG,
  OBUL_SERVICES,
  MONTHLY_BUDGET_ESTIMATES,
} from "@paperclipai/plugin-obul/constants";
import { pluginsApi } from "../api/plugins";
import { formatCents } from "../lib/utils";

const OBUL_PLUGIN_KEY = "paperclip-obul";

type CostSummary = {
  totalCents: number;
  byService: Record<string, { costCents: number; requestCount: number }>;
  byAgent: Record<string, { costCents: number; requestCount: number }>;
  eventCount: number;
};

export function ObulApisSummary({
  agentName,
  companyId,
}: {
  agentName: string;
  companyId?: string | null;
}) {
  const slug = AGENT_NAME_TO_OBUL_SLUG[agentName];
  if (!slug) return null;

  const services = OBUL_SERVICES.filter((s) => s.agents.includes(slug));
  const budget = MONTHLY_BUDGET_ESTIMATES[slug as keyof typeof MONTHLY_BUDGET_ESTIMATES];

  if (services.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Obul API Usage</h4>

      <ObulActualCosts companyId={companyId} slug={slug} />

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-accent/20">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Service</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Operation</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Cost / call</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={`${s.skill}-${s.operation}`} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">{s.service}</td>
                <td className="px-3 py-2">{s.operation}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  ${(s.costCents / 100).toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {budget && (budget.obulCents > 0 || budget.llmCents > 0) && (
        <p className="text-xs text-muted-foreground">
          Est. monthly: ${(budget.obulCents / 100).toFixed(0)} Obul + $
          {(budget.llmCents / 100).toFixed(0)} LLM
        </p>
      )}
    </div>
  );
}

/** Fetches actual recorded Obul costs and displays them. */
function ObulActualCosts({
  companyId,
  slug,
}: {
  companyId?: string | null;
  slug: string;
}) {
  const [data, setData] = useState<CostSummary | null>(null);
  const [pluginMissing, setPluginMissing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    pluginsApi
      .bridgeGetData(OBUL_PLUGIN_KEY, "obul-cost-summary", {}, companyId)
      .then((res) => {
        if (!cancelled) setData(res.data as CostSummary);
      })
      .catch(() => {
        if (!cancelled) setPluginMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [companyId]);

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-4">
        <span className="text-xs text-muted-foreground">Loading Obul costs...</span>
      </div>
    );
  }

  if (pluginMissing) {
    return (
      <div className="border border-border rounded-lg p-4">
        <span className="text-xs text-muted-foreground">
          Obul plugin not installed — install it to track API costs.
        </span>
      </div>
    );
  }

  if (!data || data.eventCount === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <span className="text-xs text-muted-foreground">
          No Obul API costs recorded yet.
        </span>
      </div>
    );
  }

  // Filter by-service entries to only show services used by this agent slug
  const agentServices = new Set(
    OBUL_SERVICES.filter((s) => s.agents.includes(slug)).map((s) => s.skill),
  );

  const relevantServices = Object.entries(data.byService).filter(([key]) =>
    agentServices.has(key),
  );

  const agentCost = data.byAgent[slug];

  if (!agentCost && relevantServices.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <span className="text-xs text-muted-foreground">
          No Obul API costs recorded for this agent.
        </span>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Obul API spend</span>
        <span className="text-lg font-semibold tabular-nums">
          {formatCents(data.totalCents)}
        </span>
      </div>
      {relevantServices.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-accent/20">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Service</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Requests</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody>
              {relevantServices.map(([service, stats]) => (
                <tr key={service} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 font-mono">{service}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{stats.requestCount}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCents(stats.costCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
