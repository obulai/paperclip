import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  useHostContext,
  usePluginAction,
  usePluginData,
  usePluginToast,
  type PluginPageProps,
  type PluginSidebarProps,
  type PluginWidgetProps,
} from "@paperclipai/plugin-sdk/ui";
import {
  COMPANY_STATUSES,
  COMPANY_SIZES,
  LEAD_SOURCES,
  OUTREACH_CHANNELS,
  PERSON_STATUSES,
  ENTITY_TYPES,
  type CompanyStatus,
  type PersonStatus,
} from "../constants.js";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

type EntityRecord = {
  id: string;
  entityType: string;
  title: string | null;
  status: string | null;
  scopeKind: string;
  scopeId: string | null;
  externalId: string | null;
  data: Record<string, unknown> | null;
};

type AgentRecord = {
  id: string;
  name: string;
  status: string;
};

type DashboardStatsData = {
  companies: { total: number; byStatus: Record<string, number> };
  people: { total: number; byStatus: Record<string, number> };
};

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

const buttonStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid var(--border)",
  borderRadius: "999px",
  background: "transparent",
  color: "inherit",
  padding: "6px 12px",
  fontSize: "12px",
  cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "var(--foreground)",
  color: "var(--background)",
  borderColor: "var(--foreground)",
};

const dangerButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "color-mix(in srgb, #ef4444 18%, transparent)",
  borderColor: "color-mix(in srgb, #ef4444 60%, var(--border))",
  color: "#fca5a5",
};

const inputStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "6px 10px",
  fontSize: "13px",
  background: "transparent",
  color: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  width: "auto",
  minWidth: "120px",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid var(--border)",
  fontWeight: 600,
  fontSize: "12px",
  opacity: 0.7,
};

const tdStyle: CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
};

const rowHoverStyle: CSSProperties = { cursor: "pointer" };

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  marginBottom: "12px",
};

const filterBarStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "8px",
  marginBottom: "12px",
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle: CSSProperties = {
  background: "var(--background, #1a1a2e)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "20px",
  width: "480px",
  maxWidth: "90vw",
  maxHeight: "80vh",
  overflow: "auto",
};

const formFieldStyle: CSSProperties = {
  display: "grid",
  gap: "4px",
  marginBottom: "10px",
};

const labelStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  opacity: 0.7,
};

// ---------------------------------------------------------------------------
// StatusBadge — colored badge component (Denchclaw EnumBadge pattern)
// ---------------------------------------------------------------------------

function StatusBadge({ status, statusMap }: {
  status: string;
  statusMap: Record<string, { label: string; color: string }>;
}) {
  const entry = statusMap[status];
  const color = entry?.color ?? "#94a3b8";
  const label = entry?.label ?? status;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 500,
        background: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Modal wrapper
// ---------------------------------------------------------------------------

function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...headerStyle, marginBottom: "16px" }}>
          <strong style={{ fontSize: "15px" }}>{title}</strong>
          <button style={buttonStyle} onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailPanel — view/edit a company or person
// ---------------------------------------------------------------------------

function DetailPanel({ entity, entityType, onClose, onSave, onDelete, agents }: {
  entity: EntityRecord;
  entityType: "company" | "person";
  onClose: () => void;
  onSave: (params: Record<string, unknown>) => Promise<void>;
  onDelete: (entityId: string) => Promise<void>;
  agents: AgentRecord[];
}) {
  const data = (entity.data ?? {}) as Record<string, unknown>;
  const [status, setStatus] = useState(entity.status ?? "");
  const [title, setTitle] = useState(entity.title ?? "");
  const [saving, setSaving] = useState(false);
  const [assignedAgentId, setAssignedAgentId] = useState((data.assignedAgentId as string) ?? "");

  const statusMap = entityType === "company" ? COMPANY_STATUSES : PERSON_STATUSES;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ entityId: entity.id, title, status, assignedAgentId: assignedAgentId || null });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={`Edit ${entityType === "company" ? "Company" : "Person"}`} onClose={onClose}>
      <div style={layoutStack}>
        <div style={formFieldStyle}>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div style={formFieldStyle}>
          <label style={labelStyle}>Status</label>
          <select style={selectStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(statusMap).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div style={formFieldStyle}>
          <label style={labelStyle}>Assigned Agent</label>
          <select style={selectStyle} value={assignedAgentId} onChange={(e) => setAssignedAgentId(e.target.value)}>
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Show read-only data fields */}
        {entityType === "company" && (
          <>
            <div style={formFieldStyle}>
              <label style={labelStyle}>Domain</label>
              <div style={{ fontSize: "13px" }}>{(data.domain as string) || "—"}</div>
            </div>
            <div style={formFieldStyle}>
              <label style={labelStyle}>Contact</label>
              <div style={{ fontSize: "13px" }}>
                {(data.contactName as string) || "—"}{" "}
                {(data.contactEmail as string) ? `<${data.contactEmail}>` : ""}
              </div>
            </div>
            <div style={formFieldStyle}>
              <label style={labelStyle}>Source</label>
              <div style={{ fontSize: "13px" }}>
                {LEAD_SOURCES[(data.source as string) as keyof typeof LEAD_SOURCES] ?? (data.source as string) ?? "—"}
              </div>
            </div>
            <div style={formFieldStyle}>
              <label style={labelStyle}>Size</label>
              <div style={{ fontSize: "13px" }}>
                {COMPANY_SIZES[(data.size as string) as keyof typeof COMPANY_SIZES] ?? (data.size as string) ?? "—"}
              </div>
            </div>
          </>
        )}
        {entityType === "person" && (
          <>
            <div style={formFieldStyle}>
              <label style={labelStyle}>Email</label>
              <div style={{ fontSize: "13px" }}>{(data.email as string) || "—"}</div>
            </div>
            <div style={formFieldStyle}>
              <label style={labelStyle}>Role</label>
              <div style={{ fontSize: "13px" }}>{(data.role as string) || "—"}</div>
            </div>
            <div style={formFieldStyle}>
              <label style={labelStyle}>Company</label>
              <div style={{ fontSize: "13px" }}>{(data.linkedCompanyName as string) || "—"}</div>
            </div>
          </>
        )}

        {typeof data.notes === "string" && data.notes.length > 0 && (
          <div style={formFieldStyle}>
            <label style={labelStyle}>Notes</label>
            <div style={{ fontSize: "13px", whiteSpace: "pre-wrap" }}>{data.notes}</div>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button style={primaryButtonStyle} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            style={dangerButtonStyle}
            onClick={async () => {
              await onDelete(entity.id);
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// CreateCompanyForm
// ---------------------------------------------------------------------------

function CreateCompanyForm({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (params: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [source, setSource] = useState("inbound");
  const [size, setSize] = useState("");
  const [industry, setIndustry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), domain, contactName, contactEmail, source, size, industry });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title="New Company" onClose={onClose}>
      <form onSubmit={handleSubmit} style={layoutStack}>
        <div style={formFieldStyle}>
          <label style={labelStyle}>Company Name *</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div style={formFieldStyle}>
          <label style={labelStyle}>Domain</label>
          <input style={inputStyle} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Contact Name</label>
            <input style={inputStyle} value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Contact Email</label>
            <input style={inputStyle} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Source</label>
            <select style={selectStyle} value={source} onChange={(e) => setSource(e.target.value)}>
              {Object.entries(LEAD_SOURCES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Size</label>
            <select style={selectStyle} value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">—</option>
              {Object.entries(COMPANY_SIZES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Industry</label>
            <input style={inputStyle} value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
        </div>
        <button type="submit" style={primaryButtonStyle} disabled={submitting || !title.trim()}>
          {submitting ? "Creating..." : "Create Company"}
        </button>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// CreatePersonForm
// ---------------------------------------------------------------------------

function CreatePersonForm({ onClose, onSubmit, companies }: {
  onClose: () => void;
  onSubmit: (params: Record<string, unknown>) => Promise<void>;
  companies: EntityRecord[];
}) {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [linkedCompanyId, setLinkedCompanyId] = useState("");
  const [source, setSource] = useState("inbound");
  const [submitting, setSubmitting] = useState(false);

  const linkedCompany = companies.find((c) => c.id === linkedCompanyId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        email,
        phone,
        role,
        linkedCompanyId: linkedCompanyId || null,
        linkedCompanyName: linkedCompany?.title ?? null,
        source,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title="New Person" onClose={onClose}>
      <form onSubmit={handleSubmit} style={layoutStack}>
        <div style={formFieldStyle}>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Role / Job Title</label>
            <input style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle}>Source</label>
            <select style={selectStyle} value={source} onChange={(e) => setSource(e.target.value)}>
              {Object.entries(LEAD_SOURCES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={formFieldStyle}>
          <label style={labelStyle}>Linked Company</label>
          <select style={selectStyle} value={linkedCompanyId} onChange={(e) => setLinkedCompanyId(e.target.value)}>
            <option value="">None</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={primaryButtonStyle} disabled={submitting || !title.trim()}>
          {submitting ? "Creating..." : "Create Person"}
        </button>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// CompaniesPage
// ---------------------------------------------------------------------------

function CompaniesPageInner({ companyId }: { companyId: string | null }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityRecord | null>(null);

  const toast = usePluginToast();
  const createCompany = usePluginAction("create-company");
  const updateCompany = usePluginAction("update-company");
  const deleteCompany = usePluginAction("delete-company");

  const { data: companies, loading, refresh } = usePluginData<EntityRecord[]>("companies-list", {
    scopeId: companyId,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    search: search || undefined,
    limit: 200,
  });

  const { data: agents } = usePluginData<AgentRecord[]>("agent-profiles", {
    companyId,
  });

  return (
    <div style={layoutStack}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: "16px" }}>Companies</h2>
        <button style={primaryButtonStyle} onClick={() => setShowCreate(true)}>
          + New Company
        </button>
      </div>

      <div style={filterBarStyle}>
        <input
          style={{ ...inputStyle, width: "200px" }}
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(COMPANY_STATUSES).map(([k, { label }]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <select style={selectStyle} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="">All Sources</option>
          {Object.entries(LEAD_SOURCES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button style={buttonStyle} onClick={refresh}>Refresh</button>
      </div>

      {loading && <div style={{ opacity: 0.6, fontSize: "13px" }}>Loading...</div>}

      {!loading && companies && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Channel</th>
              <th style={thStyle}>Last Contacted</th>
              <th style={thStyle}>Agent</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 && (
              <tr>
                <td style={{ ...tdStyle, opacity: 0.5 }} colSpan={7}>
                  No companies yet. Click "+ New Company" to get started.
                </td>
              </tr>
            )}
            {companies.map((entity) => {
              const data = (entity.data ?? {}) as Record<string, unknown>;
              const agent = (agents ?? []).find((a) => a.id === data.assignedAgentId);
              return (
                <tr key={entity.id} style={rowHoverStyle} onClick={() => setSelectedEntity(entity)}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{entity.title}</td>
                  <td style={tdStyle}>
                    <StatusBadge status={entity.status ?? "new"} statusMap={COMPANY_STATUSES} />
                  </td>
                  <td style={tdStyle}>
                    {LEAD_SOURCES[(data.source as string) as keyof typeof LEAD_SOURCES] ?? "—"}
                  </td>
                  <td style={tdStyle}>
                    {(data.contactName as string) || "—"}
                    {data.contactEmail ? ` <${data.contactEmail}>` : ""}
                  </td>
                  <td style={tdStyle}>
                    {OUTREACH_CHANNELS[(data.outreachChannel as string) as keyof typeof OUTREACH_CHANNELS] ?? "—"}
                  </td>
                  <td style={tdStyle}>
                    {data.lastContactedAt ? new Date(data.lastContactedAt as string).toLocaleDateString() : "—"}
                  </td>
                  <td style={tdStyle}>{agent?.name ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showCreate && (
        <CreateCompanyForm
          onClose={() => setShowCreate(false)}
          onSubmit={async (params) => {
            await createCompany({ ...params, scopeId: companyId });
            toast({ title: "Company created", tone: "success" });
            refresh();
          }}
        />
      )}

      {selectedEntity && (
        <DetailPanel
          entity={selectedEntity}
          entityType="company"
          agents={agents ?? []}
          onClose={() => setSelectedEntity(null)}
          onSave={async (params) => {
            await updateCompany(params);
            toast({ title: "Company updated", tone: "success" });
            setSelectedEntity(null);
            refresh();
          }}
          onDelete={async (entityId) => {
            await deleteCompany({ entityId });
            toast({ title: "Company deleted", tone: "success" });
            refresh();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PeoplePage
// ---------------------------------------------------------------------------

function PeoplePageInner({ companyId }: { companyId: string | null }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityRecord | null>(null);

  const toast = usePluginToast();
  const createPerson = usePluginAction("create-person");
  const updatePerson = usePluginAction("update-person");
  const deletePerson = usePluginAction("delete-person");

  const { data: people, loading, refresh } = usePluginData<EntityRecord[]>("people-list", {
    scopeId: companyId,
    status: statusFilter || undefined,
    search: search || undefined,
    limit: 200,
  });

  const { data: companies } = usePluginData<EntityRecord[]>("companies-list", {
    scopeId: companyId,
    limit: 200,
  });

  const { data: agents } = usePluginData<AgentRecord[]>("agent-profiles", {
    companyId,
  });

  return (
    <div style={layoutStack}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: "16px" }}>People</h2>
        <button style={primaryButtonStyle} onClick={() => setShowCreate(true)}>
          + New Person
        </button>
      </div>

      <div style={filterBarStyle}>
        <input
          style={{ ...inputStyle, width: "200px" }}
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(PERSON_STATUSES).map(([k, { label }]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <button style={buttonStyle} onClick={refresh}>Refresh</button>
      </div>

      {loading && <div style={{ opacity: 0.6, fontSize: "13px" }}>Loading...</div>}

      {!loading && people && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Channel</th>
              <th style={thStyle}>Follow-ups</th>
              <th style={thStyle}>Agent</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 && (
              <tr>
                <td style={{ ...tdStyle, opacity: 0.5 }} colSpan={8}>
                  No people yet. Click "+ New Person" to get started.
                </td>
              </tr>
            )}
            {people.map((entity) => {
              const data = (entity.data ?? {}) as Record<string, unknown>;
              const agent = (agents ?? []).find((a) => a.id === data.assignedAgentId);
              return (
                <tr key={entity.id} style={rowHoverStyle} onClick={() => setSelectedEntity(entity)}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{entity.title}</td>
                  <td style={tdStyle}>{(data.email as string) || "—"}</td>
                  <td style={tdStyle}>
                    <StatusBadge status={entity.status ?? "not_contacted"} statusMap={PERSON_STATUSES} />
                  </td>
                  <td style={tdStyle}>{(data.role as string) || "—"}</td>
                  <td style={tdStyle}>{(data.linkedCompanyName as string) || "—"}</td>
                  <td style={tdStyle}>
                    {OUTREACH_CHANNELS[(data.outreachChannel as string) as keyof typeof OUTREACH_CHANNELS] ?? "—"}
                  </td>
                  <td style={tdStyle}>{(data.followUpCount as number) ?? 0}</td>
                  <td style={tdStyle}>{agent?.name ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showCreate && (
        <CreatePersonForm
          onClose={() => setShowCreate(false)}
          companies={companies ?? []}
          onSubmit={async (params) => {
            await createPerson({ ...params, scopeId: companyId });
            toast({ title: "Person created", tone: "success" });
            refresh();
          }}
        />
      )}

      {selectedEntity && (
        <DetailPanel
          entity={selectedEntity}
          entityType="person"
          agents={agents ?? []}
          onClose={() => setSelectedEntity(null)}
          onSave={async (params) => {
            await updatePerson(params);
            toast({ title: "Person updated", tone: "success" });
            setSelectedEntity(null);
            refresh();
          }}
          onDelete={async (entityId) => {
            await deletePerson({ entityId });
            toast({ title: "Person deleted", tone: "success" });
            refresh();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CRM Main Page — tab navigation between Companies and People
// ---------------------------------------------------------------------------

export function CRMPage({ context }: PluginPageProps) {
  const [activeTab, setActiveTab] = useState<"companies" | "people">("companies");

  const tabStyle = (active: boolean): CSSProperties => ({
    ...buttonStyle,
    background: active ? "var(--foreground)" : "transparent",
    color: active ? "var(--background)" : "inherit",
    borderColor: active ? "var(--foreground)" : "var(--border)",
    fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ ...layoutStack, padding: "16px" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
        <button style={tabStyle(activeTab === "companies")} onClick={() => setActiveTab("companies")}>
          Companies
        </button>
        <button style={tabStyle(activeTab === "people")} onClick={() => setActiveTab("people")}>
          People
        </button>
      </div>
      {activeTab === "companies" ? (
        <CompaniesPageInner companyId={context.companyId} />
      ) : (
        <PeoplePageInner companyId={context.companyId} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Standalone Companies and People pages (for direct routes)
// ---------------------------------------------------------------------------

export function CompaniesPage({ context }: PluginPageProps) {
  return (
    <div style={{ padding: "16px" }}>
      <CompaniesPageInner companyId={context.companyId} />
    </div>
  );
}

export function PeoplePage({ context }: PluginPageProps) {
  return (
    <div style={{ padding: "16px" }}>
      <PeoplePageInner companyId={context.companyId} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardWidget — pipeline funnel stats
// ---------------------------------------------------------------------------

export function DashboardWidget({ context }: PluginWidgetProps) {
  const { data, loading } = usePluginData<DashboardStatsData>("dashboard-stats", {
    companyId: context.companyId,
  });

  if (loading || !data) {
    return (
      <div style={cardStyle}>
        <strong style={{ fontSize: "13px" }}>CRM Pipeline</strong>
        <div style={{ opacity: 0.5, fontSize: "12px", marginTop: "6px" }}>Loading...</div>
      </div>
    );
  }

  const funnelStages: { key: CompanyStatus; label: string; color: string }[] = [
    { key: "new", ...COMPANY_STATUSES.new },
    { key: "contacted", ...COMPANY_STATUSES.contacted },
    { key: "qualified", ...COMPANY_STATUSES.qualified },
    { key: "converted", ...COMPANY_STATUSES.converted },
  ];

  return (
    <div style={cardStyle}>
      <strong style={{ fontSize: "13px" }}>CRM Pipeline</strong>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "10px" }}>
        {funnelStages.map(({ key, label, color }) => (
          <div key={key} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color }}>{data.companies.byStatus[key] ?? 0}</div>
            <div style={{ fontSize: "11px", opacity: 0.6 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "12px", opacity: 0.7 }}>
        <span>{data.companies.total} companies</span>
        <span>{data.people.total} people</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CRM Sidebar Nav — navigation links with entity counts
// ---------------------------------------------------------------------------

export function CRMSidebarNav({ context }: PluginSidebarProps) {
  const { data } = usePluginData<DashboardStatsData>("dashboard-stats", {
    companyId: context.companyId,
  });

  const prefix = context.companyPrefix ? `/${context.companyPrefix}` : "";

  const linkStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "inherit",
    textDecoration: "none",
    cursor: "pointer",
  };

  const countBadgeStyle: CSSProperties = {
    fontSize: "11px",
    opacity: 0.5,
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <div style={{ display: "grid", gap: "2px" }}>
      <a href={`${prefix}/plugins/paperclip-crm/crm`} style={linkStyle}>
        <span>CRM</span>
      </a>
      <a href={`${prefix}/plugins/paperclip-crm/crm/companies`} style={{ ...linkStyle, paddingLeft: "20px" }}>
        <span>Companies</span>
        {data && <span style={countBadgeStyle}>{data.companies.total}</span>}
      </a>
      <a href={`${prefix}/plugins/paperclip-crm/crm/people`} style={{ ...linkStyle, paddingLeft: "20px" }}>
        <span>People</span>
        {data && <span style={countBadgeStyle}>{data.people.total}</span>}
      </a>
    </div>
  );
}
