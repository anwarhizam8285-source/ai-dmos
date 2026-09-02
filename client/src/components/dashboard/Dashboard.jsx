import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import KnowledgeLoader from "../knowledge/KnowledgeLoader";
import CeoAgent from "../ceoagent/CeoAgent";
import ContentAgent from "../contentagent/ContentAgent";
import History from "../history/History";
import Analytics from "../analytics/Analytics";
import "./Dashboard.css";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "knowledge", label: "Knowledge" },
  { key: "ceo", label: "CEO Agent" },
  { key: "content", label: "Content Agent" },
  { key: "history", label: "History" },
  { key: "analytics", label: "Analytics" },
];

export default function Dashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    tokensUsed: 0,
    costToday: 0,
    postsGenerated: 0,
    apiCallsCount: 0,
  });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const companyRes = await axios.get(
          `/api/v1/company/${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCompany(companyRes.data.company);

        try {
          const analyticsRes = await axios.get(
            "/api/v1/analytics/summary",
            {
              params: { companyId, days: 30 },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const { daily, totals } = analyticsRes.data;
          const today = daily[daily.length - 1] || { tokensUsed: 0, cost: 0 };
          const last7 = daily.slice(-7);
          const apiCallsThisWeek = last7.reduce((sum, d) => sum + (d.apiCallsCount || 0), 0);

          setStats({
            tokensUsed: today.tokensUsed,
            costToday: today.cost,
            postsGenerated: totals.contentGenerated,
            apiCallsCount: apiCallsThisWeek,
          });
        } catch {
          // Analytics not available yet - keep default zeroed stats
        }

        try {
          const contentRes = await axios.get("/api/v1/content", {
            params: { companyId },
            headers: { Authorization: `Bearer ${token}` },
          });
          setRecentContent((contentRes.data.content || []).slice(0, 3));
        } catch {
          setRecentContent([]);
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load dashboard");
        setLoading(false);
      }
    };

    if (companyId && token) {
      fetchDashboardData();
    }
  }, [companyId, token]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p className="welcome-text">Welcome back to AI-DMOS</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">Settings</button>
          <button
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("companyId");
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="dashboard-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      {activeTab === "overview" && (
        <main className="dashboard-main">
          {error && <div className="error-message">{error}</div>}

          {/* Company Info Card */}
          {company && (
            <div className="company-card">
              <h2>Company Profile</h2>
              <div className="company-info">
                <div className="info-row">
                  <span className="label">Company:</span>
                  <span className="value">{company.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{company.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Industry:</span>
                  <span className="value">{company.industry}</span>
                </div>
                <div className="info-row">
                  <span className="label">Location:</span>
                  <span className="value">{company.state}</span>
                </div>
                <div className="info-row">
                  <span className="label">Employees:</span>
                  <span className="value">{company.employees}</span>
                </div>
                <div className="info-row">
                  <span className="label">Plan:</span>
                  <span className="value badge">{company.plan}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Tokens Used Today</h3>
                <p className="stat-value">{stats.tokensUsed.toLocaleString()}</p>
                <span className="stat-label">API tokens</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Cost Today</h3>
                <p className="stat-value">RM {stats.costToday.toFixed(2)}</p>
                <span className="stat-label">Malaysian Ringgit</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Posts Generated</h3>
                <p className="stat-value">{stats.postsGenerated}</p>
                <span className="stat-label">Last 30 days</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <h3>API Calls</h3>
                <p className="stat-value">{stats.apiCallsCount}</p>
                <span className="stat-label">This week</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-card" onClick={() => setActiveTab("content")}>
                <span className="action-icon">✍️</span>
                <span className="action-label">Generate Content</span>
              </button>
              <button className="action-card" onClick={() => setActiveTab("ceo")}>
                <span className="action-icon">👔</span>
                <span className="action-label">Ask CEO Agent</span>
              </button>
              <button className="action-card" onClick={() => setActiveTab("knowledge")}>
                <span className="action-icon">📚</span>
                <span className="action-label">Manage Knowledge</span>
              </button>
              <button className="action-card" onClick={() => setActiveTab("history")}>
                <span className="action-icon">🕘</span>
                <span className="action-label">View History</span>
              </button>
              <button className="action-card" onClick={() => setActiveTab("analytics")}>
                <span className="action-icon">📈</span>
                <span className="action-label">View Analytics</span>
              </button>
              <button className="action-card">
                <span className="action-icon">⚙️</span>
                <span className="action-label">Settings</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentContent.length > 0 ? (
                recentContent.map((item) => (
                  <div className="activity-item" key={item.contentId}>
                    <span className="activity-icon">📝</span>
                    <div className="activity-content">
                      <p>
                        Generated {item.type} for {item.platform}: {item.title}
                      </p>
                      <span className="activity-time">
                        {item.status === "draft" ? "Draft" : item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-item">
                  <span className="activity-icon">👤</span>
                  <div className="activity-content">
                    <p>Account created</p>
                    <span className="activity-time">Today</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {activeTab === "knowledge" && <KnowledgeLoader />}
      {activeTab === "ceo" && <CeoAgent />}
      {activeTab === "content" && <ContentAgent />}
      {activeTab === "history" && <History />}
      {activeTab === "analytics" && <Analytics />}
    </div>
  );
}
