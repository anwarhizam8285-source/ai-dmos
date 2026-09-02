import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const RANGE_OPTIONS = [
  { label: "7 days", value: "7days" },
  { label: "30 days", value: "30days" },
  { label: "90 days", value: "90days" },
  { label: "All time", value: "all" },
];

function MiniLineChart({ data, dataKey, color = "#667eea", height = 140 }) {
  if (!data || data.length === 0) return null;
  const width = 600;
  const values = data.map((d) => d[dataKey]);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data
    .map((d, i) => {
      const x = i * stepX;
      const y = height - ((d[dataKey] - min) / range) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mini-line-chart"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${dataKey} trend`}
    >
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function CampaignRow({ campaign, tone }) {
  return (
    <div className={`perf-campaign-row ${tone}`}>
      <span className="perf-campaign-name">{campaign.name}</span>
      <span className="perf-campaign-metrics">
        <span>ROAS: <strong>{campaign.roas}x</strong></span>
        <span>Spend: <strong>RM{campaign.spend}</strong></span>
        <span>Results: <strong>{campaign.results}</strong></span>
      </span>
    </div>
  );
}

export default function CampaignPerformance() {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [dateRange, setDateRange] = useState("30days");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      if (!companyId || !token) return;
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/v1/analytics/overview", {
          params: { companyId, dateRange },
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load campaign performance");
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, [companyId, token, dateRange]);

  function handleExport(format) {
    const params = new URLSearchParams({ companyId, dateRange, format });
    window.open(`/api/v1/analytics/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="analytics-card">
      <div className="analytics-header">
        <div>
          <h2>🎯 Campaign Performance</h2>
          <p className="subtitle">Return on ad spend across every Meta Ads campaign</p>
        </div>
        <div className="header-actions">
          <div className="range-selector">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`range-btn ${dateRange === opt.value ? "active" : ""}`}
                onClick={() => setDateRange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button className="btn-secondary" onClick={() => handleExport("csv")} disabled={!metrics}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="empty-state">Loading campaign performance...</p>
      ) : !metrics || metrics.campaigns.length === 0 ? (
        <p className="empty-state">No campaigns yet. Create one from the Meta Ads tab.</p>
      ) : (
        <>
          <div className="analytics-stats">
            <div className="stat-card">
              <div className="stat-icon">💸</div>
              <div className="stat-content">
                <h3>Total Spend</h3>
                <p className="stat-value">RM{metrics.totals.spend.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>Total Results</h3>
                <p className="stat-value">{metrics.totals.results.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>Average ROAS</h3>
                <p className="stat-value">{metrics.totals.averageRoas}x</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🖱️</div>
              <div className="stat-content">
                <h3>Average CPC</h3>
                <p className="stat-value">RM{metrics.totals.averageCpc}</p>
              </div>
            </div>
          </div>

          {metrics.daily.length > 0 ? (
            <>
              <div className="chart-section">
                <h3>Daily Spend</h3>
                <div className="bar-chart">
                  {metrics.daily.map((d) => {
                    const maxSpend = Math.max(1, ...metrics.daily.map((x) => x.spend));
                    return (
                      <div key={d.date} className="bar-column">
                        <div
                          className="bar"
                          style={{ height: `${Math.max(4, (d.spend / maxSpend) * 100)}%` }}
                          title={`${d.date}: RM${d.spend}`}
                        />
                        <span className="bar-label">{d.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="chart-section">
                <h3>ROAS Trend</h3>
                <div className="line-chart-wrap">
                  <MiniLineChart data={metrics.daily} dataKey="roas" color="#48bb78" />
                </div>
              </div>
            </>
          ) : (
            <p className="empty-state">
              No performance data yet - launch a campaign and wait for the nightly monitoring job.
            </p>
          )}

          <div className="performer-grid">
            <div className="section">
              <h3>🏆 Top Performers</h3>
              {metrics.topPerformers.length === 0 ? (
                <p className="empty-state">No campaigns with performance data yet.</p>
              ) : (
                metrics.topPerformers.map((c) => <CampaignRow key={c.campaignId} campaign={c} tone="good" />)
              )}
            </div>
            <div className="section">
              <h3>⚠️ Needs Attention</h3>
              {metrics.bottomPerformers.length === 0 ? (
                <p className="empty-state">No campaigns with performance data yet.</p>
              ) : (
                metrics.bottomPerformers.map((c) => <CampaignRow key={c.campaignId} campaign={c} tone="attention" />)
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
