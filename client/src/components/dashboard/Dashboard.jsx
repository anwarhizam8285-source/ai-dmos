import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { token } = useAuth();
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    tokensUsed: 0,
    costToday: 0,
    postsGenerated: 0,
    apiCallsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch company data
        const companyRes = await axios.get(
          `http://localhost:3000/api/v1/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCompany(companyRes.data.company);

        // Set initial stats (in real app, fetch from backend)
        setStats({
          tokensUsed: 1250,
          costToday: 0.05,
          postsGenerated: 3,
          apiCallsCount: 5,
        });

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
    return <div className="loading">Loading dashboard...</div>;
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

      {/* Main Content */}
      <main className="dashboard-main">
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
              <span className="stat-label">This month</span>
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
            <button className="action-card">
              <span className="action-icon">✍️</span>
              <span className="action-label">Generate Caption</span>
            </button>
            <button className="action-card">
              <span className="action-icon">🎨</span>
              <span className="action-label">Create Post</span>
            </button>
            <button className="action-card">
              <span className="action-icon">📚</span>
              <span className="action-label">Manage Knowledge</span>
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
            <div className="activity-item">
              <span className="activity-icon">📝</span>
              <div className="activity-content">
                <p>Generated Instagram caption for product launch</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">⚙️</span>
              <div className="activity-content">
                <p>Updated company profile information</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">👤</span>
              <div className="activity-content">
                <p>Account created</p>
                <span className="activity-time">Today</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
