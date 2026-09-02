import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const UNDO_WINDOW_MS = 24 * 60 * 60 * 1000;

function isWithinUndoWindow(appliedAt) {
  if (!appliedAt) return false;
  const appliedTime = new Date(appliedAt).getTime();
  return Date.now() - appliedTime <= UNDO_WINDOW_MS;
}

function RecommendationCard({ rec, onApply, onReject, onUndo, busy, metaConnected }) {
  const { action, expectedImpact } = rec;
  const canApply = rec.status === "PENDING" && rec.type !== "REFRESH_CREATIVE";
  const canUndo = rec.status === "APPLIED" && isWithinUndoWindow(rec.appliedAt);

  return (
    <div className="recommendation-card">
      <div className={`priority-badge priority-${rec.priority}`}>Priority {rec.priority}</div>

      <h4>{rec.title}</h4>
      <p className="description">{rec.description}</p>

      <div className="action-details">
        <div className="detail">
          <span className="label">Current</span>
          <strong>{String(action.currentValue)}</strong>
        </div>
        <div className="detail">
          <span className="label">Suggested</span>
          <strong>{String(action.suggestedValue)}</strong>
        </div>
        <div className="detail">
          <span className="label">Change</span>
          <strong className={action.changePercent > 0 ? "positive" : action.changePercent < 0 ? "negative" : ""}>
            {action.changePercent != null ? `${action.changePercent > 0 ? "+" : ""}${action.changePercent}%` : "-"}
          </strong>
        </div>
      </div>

      {expectedImpact && (
        <div className="impact">
          <span className="label">Expected Impact</span>
          <div className={`impact-badge ${(expectedImpact.confidence || "").toLowerCase()}`}>
            {expectedImpact.metric}: {expectedImpact.change}
            <span className="confidence"> ({expectedImpact.confidence})</span>
          </div>
        </div>
      )}

      {action.rationale && (
        <div className="rationale">
          <p>{action.rationale}</p>
        </div>
      )}

      <div className="rec-status-row">
        <span className={`status-badge status-${rec.status.toLowerCase()}`}>{rec.status}</span>
        {rec.type === "REFRESH_CREATIVE" && rec.status === "PENDING" && (
          <span className="note">Requires a manual creative update - can't be one-click applied.</span>
        )}
      </div>

      {rec.status === "PENDING" && (
        <div className="actions">
          <button className="btn-secondary" onClick={() => onReject(rec.recommendationId)} disabled={busy}>
            ✕ Reject
          </button>
          {canApply && (
            <button
              className="btn-primary"
              onClick={() => onApply(rec.recommendationId)}
              disabled={busy || !metaConnected}
            >
              {busy ? "Applying..." : "✓ Apply Now"}
            </button>
          )}
        </div>
      )}

      {canUndo && (
        <div className="actions">
          <button
            className="btn-secondary"
            onClick={() => onUndo(rec.recommendationId)}
            disabled={busy || !metaConnected}
          >
            {busy ? "Undoing..." : "↺ Undo"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function OptimizationDashboard({ companyId, campaignId, campaignName, metaConnected, onBack }) {
  const { token } = useAuth();
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [performance, setPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [perfRes, recRes] = await Promise.all([
        axios.get("/api/v1/agents/meta-ads/performance", {
          params: { companyId, campaignId, dateRange: "30" },
          ...authHeaders,
        }),
        axios.get("/api/v1/agents/meta-ads/recommendations", {
          params: { companyId, campaignId },
          ...authHeaders,
        }),
      ]);
      setPerformance(perfRes.data.summary);
      setRecommendations(recRes.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load optimization data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadInitialData = () => loadData();
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, campaignId]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      await axios.post(
        "/api/v1/agents/meta-ads/optimize",
        { companyId, campaignId },
        authHeaders
      );
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate recommendations");
    } finally {
      setGenerating(false);
    }
  }

  async function handleApply(recommendationId) {
    setBusyId(recommendationId);
    setError(null);
    try {
      await axios.post(
        "/api/v1/agents/meta-ads/apply-recommendation",
        { companyId, campaignId, recommendationId },
        authHeaders
      );
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to apply recommendation");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(recommendationId) {
    setBusyId(recommendationId);
    setError(null);
    try {
      await axios.post(
        "/api/v1/agents/meta-ads/reject-recommendation",
        { companyId, campaignId, recommendationId },
        authHeaders
      );
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject recommendation");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUndo(recommendationId) {
    setBusyId(recommendationId);
    setError(null);
    try {
      await axios.post(
        "/api/v1/agents/meta-ads/undo-recommendation",
        { companyId, campaignId, recommendationId },
        authHeaders
      );
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to undo recommendation");
    } finally {
      setBusyId(null);
    }
  }

  const pending = recommendations.filter((r) => r.status === "PENDING");
  const history = recommendations.filter((r) => r.status !== "PENDING");

  return (
    <div className="optimization-dashboard">
      <div className="opt-header">
        <div>
          <h2>📊 AI Optimization</h2>
          <p className="subtitle">{campaignName}</p>
        </div>
        <button className="btn-secondary" onClick={onBack}>
          ← Back to campaigns
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {!metaConnected && (
        <div className="banner banner-error">Connect your Meta Ads account to apply or undo changes.</div>
      )}

      {loading ? (
        <div className="meta-ads-card">
          <div className="spinner" /> Loading performance data...
        </div>
      ) : (
        <>
          <div className="metrics opt-metrics">
            <div className="metric">
              <span>Spend (30d)</span>
              <strong>RM{(performance?.spend ?? 0).toFixed(2)}</strong>
            </div>
            <div className="metric">
              <span>CTR</span>
              <strong>{performance?.ctr ?? 0}%</strong>
            </div>
            <div className="metric">
              <span>CPC</span>
              <strong>RM{performance?.cpc ?? 0}</strong>
            </div>
            <div className="metric">
              <span>ROAS</span>
              <strong>{performance?.roas ?? 0}x</strong>
            </div>
          </div>

          <div className="opt-stats">
            <div className="stat">
              <span className="label">Pending Recommendations</span>
              <strong>{pending.length}</strong>
            </div>
            <div className="stat">
              <span className="label">Applied</span>
              <strong>{recommendations.filter((r) => r.status === "APPLIED").length}</strong>
            </div>
            <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
              {generating ? "Analyzing..." : "🔍 Analyze & Generate Recommendations"}
            </button>
          </div>

          {pending.length === 0 && (
            <div className="empty-state">
              <p>✓ No pending recommendations. Click "Analyze" to have Claude review recent performance.</p>
            </div>
          )}

          <div className="recommendations-list">
            {pending.map((rec) => (
              <RecommendationCard
                key={rec.recommendationId}
                rec={rec}
                onApply={handleApply}
                onReject={handleReject}
                onUndo={handleUndo}
                busy={busyId === rec.recommendationId}
                metaConnected={metaConnected}
              />
            ))}
          </div>

          {history.length > 0 && (
            <div className="opt-history">
              <h3>History</h3>
              <div className="recommendations-list">
                {history.map((rec) => (
                  <RecommendationCard
                    key={rec.recommendationId}
                    rec={rec}
                    onApply={handleApply}
                    onReject={handleReject}
                    onUndo={handleUndo}
                    busy={busyId === rec.recommendationId}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
