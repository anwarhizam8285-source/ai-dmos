import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Analytics.css";

const RANGE_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

export default function Analytics() {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [days, setDays] = useState(7);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/v1/analytics/summary", {
          params: { companyId, days },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (companyId && token) fetchSummary();
  }, [companyId, token, days]);

  const maxTokens = summary ? Math.max(1, ...summary.daily.map((d) => d.tokensUsed)) : 1;

  return (
    <div className="analytics-container">
      <div className="analytics-card">
        <div className="analytics-header">
          <div>
            <h2>📈 Usage Analytics</h2>
            <p className="subtitle">Track your AI usage and costs over time</p>
          </div>
          <div className="range-selector">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`range-btn ${days === opt.value ? "active" : ""}`}
                onClick={() => setDays(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p className="empty-state">Loading analytics...</p>
        ) : summary ? (
          <>
            <div className="analytics-stats">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Tokens</h3>
                  <p className="stat-value">{summary.totals.tokensUsed.toLocaleString()}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Total Cost</h3>
                  <p className="stat-value">RM {summary.totals.cost.toFixed(2)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>Content Generated</h3>
                  <p className="stat-value">{summary.totals.contentGenerated}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <h3>API Calls</h3>
                  <p className="stat-value">{summary.totals.apiCallsCount}</p>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3>Daily Token Usage</h3>
              {summary.totals.tokensUsed === 0 ? (
                <p className="empty-state">No usage recorded in this period yet</p>
              ) : (
                <div className="bar-chart">
                  {summary.daily.map((d) => (
                    <div key={d.date} className="bar-column">
                      <div
                        className="bar"
                        style={{ height: `${Math.max(4, (d.tokensUsed / maxTokens) * 100)}%` }}
                        title={`${d.date}: ${d.tokensUsed} tokens`}
                      />
                      <span className="bar-label">{d.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="empty-state">No usage data yet</p>
        )}
      </div>
    </div>
  );
}
