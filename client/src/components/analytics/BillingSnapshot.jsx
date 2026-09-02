import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function BillingSnapshot() {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBilling = async () => {
      if (!companyId || !token) return;
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/v1/analytics/billing", {
          params: { companyId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setBilling(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load billing info");
      } finally {
        setLoading(false);
      }
    };
    loadBilling();
  }, [companyId, token]);

  return (
    <div className="analytics-card">
      <div className="analytics-header">
        <div>
          <h2>💳 Plan &amp; Usage</h2>
          <p className="subtitle">Your current plan and this month's activity</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="empty-state">Loading billing info...</p>
      ) : billing ? (
        <>
          <div className="billing-plan-row">
            <div>
              <span className="billing-plan-label">{billing.label} Plan</span>
              <span className="billing-plan-price">RM{billing.priceRM}/month</span>
            </div>
            <span className="billing-note">
              No payment processor connected - this is your plan's list price, not an invoice.
            </span>
          </div>

          <div className="analytics-stats">
            <div className="stat-card">
              <div className="stat-icon">🚀</div>
              <div className="stat-content">
                <h3>Campaigns This Month</h3>
                <p className="stat-value">{billing.usage.campaignsCreatedThisMonth}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Total Campaigns</h3>
                <p className="stat-value">{billing.usage.totalCampaigns}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Tokens This Month</h3>
                <p className="stat-value">{billing.usage.tokensUsedThisMonth.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>API Cost This Month</h3>
                <p className="stat-value">RM{billing.usage.apiCostThisMonthRM.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <button className="btn-primary" disabled title="Payment integration coming soon">
            Upgrade Plan (coming soon)
          </button>
        </>
      ) : (
        <p className="empty-state">No billing info available</p>
      )}
    </div>
  );
}
