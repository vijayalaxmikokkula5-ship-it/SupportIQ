
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

type Ticket = {
  id: number | string;
  name?: string;
  email?: string;
  issue?: string;
  category?: string;
  intent?: string;
  priority?: string;
  sentiment?: string;
  confidence?: number;
  recommended_action?: string;
  created_at?: string;
};

type Section =
  | "Overview"
  | "Tickets"
  | "Analytics"
  | "AI Insights"
  | "Settings"
  | "Help Center";

const API_URL = "http://127.0.0.1:8000/tickets";

const menuItems: { name: Section; icon: string }[] = [
  { name: "Overview", icon: "⌂" },
  { name: "Tickets", icon: "▣" },
  { name: "Analytics", icon: "◔" },
  { name: "AI Insights", icon: "✦" },
  { name: "Settings", icon: "⚙" },
  { name: "Help Center", icon: "?" },
];

const getConfidence = (value?: number) => {
  const n = Number(value ?? 0);
  return Math.max(0, Math.min(100, Math.round(n <= 1 ? n * 100 : n)));
};

const getInitials = (name?: string) =>
  (name || "AI")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (date?: string) => {
  if (!date) return "Recently";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeSection, setActiveSection] = useState<Section>("Overview");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("Support Agent");
  const [notifications, setNotifications] = useState(true);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data: unknown = await response.json();
      const list = Array.isArray(data)
        ? data
        : (data as { tickets?: unknown })?.tickets;

      setTickets(Array.isArray(list) ? (list as Ticket[]) : []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load tickets. Check that your backend is running at http://127.0.0.1:8000."
      );
    } finally {
      setLoading(false);
    }
  }, []);
  // PASTE THE deleteTicket FUNCTION HERE
  const deleteTicket = useCallback(async (ticketId: number | string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(String(ticketId))}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      setSelectedTicket((current) =>
        current && String(current.id) === String(ticketId)
          ? null
          : current
      );

      await loadTickets();
      window.alert("Ticket deleted successfully.");
    } catch (err) {
      console.error(err);
      window.alert(
        "Could not delete the ticket. Check that the backend DELETE endpoint exists."
      );
    }
  }, [loadTickets]);

  // Keep your existing useEffect below
  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const total = tickets.length;
  const high = tickets.filter(
    (t) => t.priority?.toLowerCase() === "high"
  ).length;
  const medium = tickets.filter(
    (t) => t.priority?.toLowerCase() === "medium"
  ).length;
  const low = tickets.filter(
    (t) => t.priority?.toLowerCase() === "low"
  ).length;
  const negative = tickets.filter(
    (t) => t.sentiment?.toLowerCase() === "negative"
  ).length;

  const averageConfidence = total
    ? Math.round(
        tickets.reduce((sum, t) => sum + getConfidence(t.confidence), 0) /
          total
      )
    : 0;

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};

    tickets.forEach((ticket) => {
      const category = ticket.category || "Other";
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase();

    return tickets.filter((ticket) => {
      const searchable = [
        ticket.name,
        ticket.email,
        ticket.issue,
        ticket.category,
        ticket.intent,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchable.includes(query);
      const matchesPriority =
        priorityFilter === "All" ||
        ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesPriority;
    });
  }, [tickets, search, priorityFilter]);

  const renderStats = () => (
    <div className="creative-kpis">
      {[
        ["▣", "TOTAL TICKETS", total, "purple"],
        ["!", "HIGH PRIORITY", high, "orange"],
        ["◉", "AI CONFIDENCE", `${averageConfidence}%`, "blue"],
        ["♡", "NEGATIVE SENTIMENT", negative, "pink"],
      ].map(([icon, label, value, color]) => (
        <div className="creative-kpi" key={String(label)}>
          <div className={`creative-kpi-icon ${color}`}>{icon}</div>
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>Based on current ticket data</small>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTicketTable = (items: Ticket[]) => (
    <div className="ticket-table-wrap">
      {loading && <p className="no-data">Loading tickets...</p>}

      {!loading && items.length === 0 && (
        <p className="no-data">No tickets found.</p>
      )}

      {items.length > 0 && (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Issue</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Sentiment</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <div className="ticket-customer">
                    <span className="ticket-avatar">
                      {getInitials(ticket.name)}
                    </span>
                    <div>
                      <strong>{ticket.name || "Unknown customer"}</strong>
                      <small>{ticket.email || "No email"}</small>
                    </div>
                  </div>
                </td>
                <td className="ticket-issue">
                  {ticket.issue || "No description"}
                </td>
                <td>{ticket.category || "Unclassified"}</td>
                <td>
                  <span
                    className={`priority-badge priority-${(
                      ticket.priority || "low"
                    ).toLowerCase()}`}
                  >
                    {ticket.priority || "Low"}
                  </span>
                </td>
                <td>{ticket.sentiment || "Neutral"}</td>
                <td>{formatDate(ticket.created_at)}</td>
               <td>
  <div className="ticket-actions">
    <button
      type="button"
      className="table-action"
      onClick={() => setSelectedTicket(ticket)}
    >
      View ↗
    </button>

    <button
      type="button"
      className="delete-action"
      onClick={() => void deleteTicket(ticket.id)}
    >
      Delete
    </button>
  </div>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
  const renderSidebar = () => (
    <aside className="creative-sidebar">
      <div className="brand-area">
        <div className="brand-mark">
          <span>AI</span>
        </div>
        <div>
          <strong>AISupportIQ</strong>
          <small>SUPPORT INTELLIGENCE</small>
        </div>
      </div>

      <div className="sidebar-section-title">WORKSPACE</div>

      <nav className="creative-nav">
        {menuItems.map((item, index) => (
          <button
            type="button"
            key={item.name}
            className={`creative-nav-item ${
              activeSection === item.name ? "active" : ""
            }`}
            onClick={() => setActiveSection(item.name)}
          >
            <span>{item.icon}</span>
            <label>{item.name}</label>
            {index === 1 && total > 0 && <b>{total}</b>}
          </button>
        ))}
      </nav>

      <div className="sidebar-ai-card">
        <div className="sidebar-ai-glow">✦</div>
        <span>AI ENGINE</span>
        <strong>Intelligence Online</strong>
        <p>Analyze customer support tickets with AI-powered insights.</p>
        <div className="ai-online-line">
          <i /> System status
        </div>
      </div>

      <div className="sidebar-profile">
        <div className="profile-avatar">AI</div>
        <div>
          <strong>{displayName}</strong>
          <span>Administrator</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveSection("Settings")}
          aria-label="Open settings"
        >
          ⋮
        </button>
      </div>
    </aside>
  );

  const renderTopbar = () => (
    <div className="creative-topbar">
      <div className="breadcrumb">
        Dashboard <span>/</span> <strong>{activeSection}</strong>
      </div>

      <div className="topbar-right">
        <div className="global-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            aria-label="Search tickets"
          />
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={() => setNotifications((value) => !value)}
          title="Toggle notifications"
        >
          {notifications ? "♢" : "♧"}
        </button>
        <div className="top-avatar">AI</div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <>
      <div className="creative-hero">
        <div>
          <span className="hero-mini-label">AI SUPPORT INTELLIGENCE</span>
          <h1>
            Support <span>Command Center</span>
          </h1>
          <p>
            Monitor customer issues, priorities, sentiment and AI analysis in
            one workspace.
          </p>
        </div>
        <button
          type="button"
          className="hero-refresh"
          onClick={() => void loadTickets()}
        >
          ↻ Refresh Data
        </button>
      </div>

      {error && <p className="no-data">{error}</p>}

      {renderStats()}

      <div className="creative-analytics">
        <div className="creative-panel confidence-panel">
          <div className="creative-panel-heading">
            <div>
              <span>AI PERFORMANCE</span>
              <h2>Model Confidence</h2>
            </div>
            <span className="live-pill">● LIVE</span>
          </div>

          <div className="confidence-content">
            <div
              className="confidence-ring"
              style={{
                background: `conic-gradient(#8060e8 ${averageConfidence * 3.6}deg, #eeeef5 0deg)`,
              }}
            >
              <div className="confidence-inner">
                <strong>{averageConfidence}%</strong>
                <span>confidence</span>
              </div>
            </div>

            <div className="confidence-info">
              <div className="confidence-status">
                <i /> AI ticket analysis
              </div>
              <p>
                Average confidence across the tickets currently returned by
                your backend.
              </p>
              <div className="confidence-mini">
                <div>
                  <strong>{total}</strong>
                  <span>Tickets</span>
                </div>
                <div>
                  <strong>{categories.length}</strong>
                  <span>Categories</span>
                </div>
                <div>
                  <strong>{high}</strong>
                  <span>High priority</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="creative-panel priority-panel">
          <div className="creative-panel-heading">
            <div>
              <span>QUEUE MONITOR</span>
              <h2>Priority Distribution</h2>
            </div>
          </div>

          {[
            { label: "High", count: high, cls: "high" },
            { label: "Medium", count: medium, cls: "medium" },
            { label: "Low", count: low, cls: "low" },
          ].map((item) => (
            <div className="priority-row" key={item.label}>
              <div className="priority-row-label">
                <span className={`priority-dot ${item.cls}`} />
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </div>
              <div className="priority-line">
                <div
                  className={item.cls}
                  style={{
                    width: `${total ? (item.count / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="creative-panel category-panel">
        <div className="creative-panel-heading">
          <div>
            <span>ISSUE BREAKDOWN</span>
            <h2>Ticket Categories</h2>
          </div>
          <button
            type="button"
            className="ticket-counter"
            onClick={() => setActiveSection("Analytics")}
          >
            View analytics →
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="no-data">Category data will appear here.</p>
        ) : (
          <div className="creative-category-list">
            {categories.slice(0, 6).map(([category, count]) => (
              <div className="creative-category" key={category}>
                <div className="category-main">
                  <div>
                    <strong>{category}</strong>
                    <span>
                      {total ? Math.round((count / total) * 100) : 0}% of tickets
                    </span>
                  </div>
                  <b>{count}</b>
                </div>
                <div className="category-line">
                  <div
                    style={{
                      width: `${total ? (count / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="creative-panel tickets-section">
        <div className="creative-panel-heading">
          <div>
            <span>RECENT ACTIVITY</span>
            <h2>Recent Tickets</h2>
          </div>
          <button
            type="button"
            className="ticket-counter"
            onClick={() => setActiveSection("Tickets")}
          >
            View all →
          </button>
        </div>
        {renderTicketTable(tickets.slice(0, 5))}
      </div>
    </>
  );

  const renderTickets = () => (
    <>
      <div className="creative-hero">
        <div>
          <span className="hero-mini-label">SUPPORT OPERATIONS</span>
          <h1>
            Ticket <span>Intelligence</span>
          </h1>
          <p>Search and review your customer support requests.</p>
        </div>
        <button
          type="button"
          className="hero-refresh"
          onClick={() => void loadTickets()}
        >
          ↻ Refresh
        </button>
      </div>

      {error && <p className="no-data">{error}</p>}

      <div className="creative-panel tickets-section">
        <div className="creative-panel-heading">
          <div>
            <span>SUPPORT REQUESTS</span>
            <h2>Ticket Management</h2>
            <p>{filteredTickets.length} matching tickets</p>
          </div>
        </div>

        <div className="ticket-controls">
          <div className="ticket-search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer or issue..."
              aria-label="Search tickets"
            />
          </div>

          <div className="ticket-filter-buttons">
            {["All", "High", "Medium", "Low"].map((priority) => (
              <button
                type="button"
                key={priority}
                className={
                  priorityFilter === priority ? "ticket-filter-selected" : ""
                }
                onClick={() => setPriorityFilter(priority)}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {renderTicketTable(filteredTickets)}
      </div>
    </>
  );

  const renderAnalytics = () => (
    <>
      <div className="creative-hero">
        <div>
          <span className="hero-mini-label">PERFORMANCE ANALYTICS</span>
          <h1>
            Support <span>Analytics</span>
          </h1>
          <p>Review ticket volume, priority and category distribution.</p>
        </div>
        <button
          type="button"
          className="hero-refresh"
          onClick={() => void loadTickets()}
        >
          ↻ Refresh
        </button>
      </div>

      {renderStats()}

      <div className="creative-panel category-panel">
        <div className="creative-panel-heading">
          <div>
            <span>BREAKDOWN</span>
            <h2>Categories</h2>
          </div>
        </div>
        {categories.length === 0 ? (
          <p className="no-data">No analytics data available yet.</p>
        ) : (
          <div className="creative-category-list">
            {categories.map(([category, count]) => (
              <div className="creative-category" key={category}>
                <div className="category-main">
                  <div>
                    <strong>{category}</strong>
                    <span>
                      {total ? Math.round((count / total) * 100) : 0}% of tickets
                    </span>
                  </div>
                  <b>{count}</b>
                </div>
                <div className="category-line">
                  <div
                    style={{
                      width: `${total ? (count / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderAIInsights = () => (
    <>
      <div className="creative-hero">
        <div>
          <span className="hero-mini-label">ARTIFICIAL INTELLIGENCE</span>
          <h1>
            AI <span>Insights</span>
          </h1>
          <p>Actionable signals from current support ticket data.</p>
        </div>
        <button
          type="button"
          className="hero-refresh"
          onClick={() => void loadTickets()}
        >
          ↻ Refresh
        </button>
      </div>

      {renderStats()}

      <div className="creative-panel insights-panel">
        <div className="creative-panel-heading">
          <div>
            <span>AI RECOMMENDATIONS</span>
            <h2>Suggested Actions</h2>
          </div>
          <div className="ai-sparkle">✦</div>
        </div>

        {[
          {
            icon: "⚡",
            title: "High-priority queue",
            text: high
              ? `Review ${high} high-priority ticket${high === 1 ? "" : "s"} first.`
              : "No high-priority tickets are currently flagged.",
          },
          {
            icon: "♡",
            title: "Customer sentiment",
            text: negative
              ? `Follow up on ${negative} negative-sentiment ticket${negative === 1 ? "" : "s"}.`
              : "No negative-sentiment tickets are currently flagged.",
          },
          {
            icon: "✦",
            title: "Model confidence",
            text: `Average AI confidence is ${averageConfidence}%. Verify important predictions before taking action.`,
          },
        ].map((item) => (
          <div className="insight-highlight" key={item.title}>
            <div className="insight-icon">{item.icon}</div>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <div className="creative-hero">
        <div>
          <span className="hero-mini-label">WORKSPACE PREFERENCES</span>
          <h1>
            Account <span>Settings</span>
          </h1>
          <p>Personalize your workspace.</p>
        </div>
      </div>

      <div className="creative-panel settings-panel">
        <div className="creative-panel-heading">
          <div>
            <span>PROFILE</span>
            <h2>Agent Preferences</h2>
          </div>
        </div>

        <label className="settings-field">
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
          />
        </label>

        <div className="settings-toggle-row">
          <div>
            <strong>Notifications</strong>
            <p>Toggle the notification indicator.</p>
          </div>
          <button
            type="button"
            className="ticket-counter"
            onClick={() => setNotifications((value) => !value)}
          >
            {notifications ? "Enabled ✓" : "Disabled"}
          </button>
        </div>
      </div>
    </>
  );

  const renderHelp = () => (
    <>
      <div className="creative-hero">
        <div>
          <span className="hero-mini-label">SUPPORT &amp; GUIDANCE</span>
          <h1>
            Help <span>Center</span>
          </h1>
          <p>Quick guidance for using AISupportIQ.</p>
        </div>
      </div>

      <div className="creative-panel help-panel">
        <div className="creative-panel-heading">
          <div>
            <span>GET STARTED</span>
            <h2>How to Use the Dashboard</h2>
          </div>
        </div>

        {[
          ["1", "Overview", "Review ticket volume, categories and priorities."],
          ["2", "Tickets", "Search, filter and open individual tickets."],
          ["3", "Analytics", "Understand trends in your available ticket data."],
          ["4", "AI Insights", "Review AI-generated signals and suggested actions."],
        ].map(([number, title, text]) => (
          <div className="insight-highlight" key={title}>
            <div className="insight-icon">{number}</div>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderTicketModal = () => {
    if (!selectedTicket) return null;

    return (
      <div
        className="ticket-modal-backdrop"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setSelectedTicket(null);
        }}
      >
        <div
          className="ticket-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-modal-title"
        >
          <div className="ticket-modal-header">
            <div>
              <span className="hero-mini-label">TICKET DETAILS</span>
              <h2 id="ticket-modal-title">
                {selectedTicket.name || "Customer ticket"}
              </h2>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => setSelectedTicket(null)}
              aria-label="Close details"
            >
              ✕
            </button>
          </div>

          <p className="ticket-modal-email">
            {selectedTicket.email || "No email provided"}
          </p>

          <div className="ticket-modal-issue">
            <span>ISSUE DESCRIPTION</span>
            <p>{selectedTicket.issue || "No description provided."}</p>
          </div>

          <div className="modal-analysis-grid">
            <div>
              <span>CATEGORY</span>
              <strong>{selectedTicket.category || "Unclassified"}</strong>
            </div>
            <div>
              <span>INTENT</span>
              <strong>{selectedTicket.intent || "Not detected"}</strong>
            </div>
            <div>
              <span>PRIORITY</span>
              <strong>{selectedTicket.priority || "Low"}</strong>
            </div>
            <div>
              <span>SENTIMENT</span>
              <strong>{selectedTicket.sentiment || "Neutral"}</strong>
            </div>
          </div>

          <div className="modal-ai-action">
            <span>✦ AI RECOMMENDED ACTION</span>
            <p>
              {selectedTicket.recommended_action ||
                "Review the ticket and provide an appropriate response."}
            </p>
          </div>

          <div className="modal-confidence">
            <span>AI confidence</span>
            <strong>{getConfidence(selectedTicket.confidence)}%</strong>
          </div>

          <div className="modal-created">
            Created: {formatDate(selectedTicket.created_at)}
          </div>

          <button
            type="button"
            className="hero-refresh"
            onClick={() => setSelectedTicket(null)}
          >
            Close details
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Tickets":
        return renderTickets();
      case "Analytics":
        return renderAnalytics();
      case "AI Insights":
        return renderAIInsights();
      case "Settings":
        return renderSettings();
      case "Help Center":
        return renderHelp();
      case "Overview":
      default:
        return renderOverview();
    }
  };

  return (
    <div className="creative-dashboard">
      {renderSidebar()}
      <main className="creative-main">
        {renderTopbar()}
        {renderContent()}
      </main>
      {renderTicketModal()}
    </div>
  );
}

export default Dashboard;