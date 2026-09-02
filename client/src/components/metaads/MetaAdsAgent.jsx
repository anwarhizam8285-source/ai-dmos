import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useMetaAuth } from "../../hooks/useMetaAuth";
import ConnectMeta from "./ConnectMeta";
import CampaignForm from "./CampaignForm";
import CampaignPreview from "./CampaignPreview";
import "./MetaAds.css";

const STATUS_LABEL = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  draft: "Draft",
};

function CampaignsList({ campaigns, onCreateNew }) {
  return (
    <div className="meta-ads-card campaigns-list-card">
      <div className="campaigns-list-header">
        <h3>Your Campaigns</h3>
        <button className="btn-primary" onClick={onCreateNew}>
          + New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <p className="subtitle">No campaigns yet. Create your first AI-generated campaign.</p>
      ) : (
        <div className="campaigns-table">
          {campaigns.map((c) => (
            <div className="campaign-row" key={c.campaignId}>
              <div className="campaign-row-main">
                <span className="campaign-name">{c.name}</span>
                <span className={`status-badge status-${(c.status || "").toLowerCase()}`}>
                  {STATUS_LABEL[c.status] || c.status}
                </span>
              </div>
              <div className="campaign-row-meta">
                <span>RM{c.budget?.amount ?? "-"} {c.budget?.type?.toLowerCase()}</span>
                <span>{c.objective}</span>
                {c.metaCampaignId && <span>Meta ID: {c.metaCampaignId}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MetaAdsAgent() {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");
  const { connected, loading: connectionLoading } = useMetaAuth();

  const [view, setView] = useState("list"); // list | form | preview | success
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [generated, setGenerated] = useState(null); // { campaignId, generatedCampaign }
  const [launchResult, setLaunchResult] = useState(null);

  async function fetchCampaigns() {
    if (!companyId || !token) return;
    try {
      const res = await axios.get("/api/v1/agents/meta-ads/campaigns", {
        params: { companyId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(res.data.campaigns || []);
    } catch {
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  }

  useEffect(() => {
    const fetchInitialCampaigns = () => fetchCampaigns();
    fetchInitialCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, token]);

  if (connectionLoading) {
    return (
      <div className="meta-ads-container">
        <div className="meta-ads-card">
          <div className="spinner" />
          Loading Meta connection...
        </div>
      </div>
    );
  }

  // Drafting a campaign only needs Claude, not Meta - only launching a
  // campaign requires a connected ad account (enforced server-side too).
  return (
    <div className="meta-ads-container">
      <ConnectMeta />

      {view === "list" && (
        <>
          {campaignsLoading ? (
            <div className="meta-ads-card">
              <div className="spinner" /> Loading campaigns...
            </div>
          ) : (
            <CampaignsList campaigns={campaigns} onCreateNew={() => setView("form")} />
          )}
        </>
      )}

      {view === "form" && (
        <div className="meta-ads-card">
          <h2>🎯 Generate Campaign</h2>
          <p className="subtitle">Claude will draft ad copy, audience targeting, and a budget plan.</p>
          <CampaignForm
            onGenerated={(data) => {
              setGenerated(data);
              setView("preview");
            }}
          />
          <button className="btn-secondary back-link" onClick={() => setView("list")}>
            ← Back to campaigns
          </button>
        </div>
      )}

      {view === "preview" && generated && (
        <div className="meta-ads-card">
          <CampaignPreview
            campaignId={generated.campaignId}
            generatedCampaign={generated.generatedCampaign}
            metaConnected={connected}
            onEdit={() => setView("form")}
            onApproved={(result) => {
              setLaunchResult(result);
              setView("success");
              fetchCampaigns();
            }}
          />
        </div>
      )}

      {view === "success" && launchResult && (
        <div className="meta-ads-card">
          <h2>🎉 Campaign Launched</h2>
          <p className="subtitle">{launchResult.message}</p>
          <div className="meta-details">
            <div className="detail-row">
              <span className="label">Meta Campaign ID:</span>
              <span className="value">{launchResult.metaCampaignId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Meta Ad Set ID:</span>
              <span className="value">{launchResult.metaAdSetId}</span>
            </div>
            {launchResult.metaAdId && (
              <div className="detail-row">
                <span className="label">Meta Ad ID:</span>
                <span className="value">{launchResult.metaAdId}</span>
              </div>
            )}
          </div>
          <p className="note">
            Created PAUSED on Meta for safety. Activate it from Meta Ads Manager when you're ready to spend.
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              setGenerated(null);
              setLaunchResult(null);
              setView("list");
            }}
          >
            Back to Campaigns
          </button>
        </div>
      )}
    </div>
  );
}
