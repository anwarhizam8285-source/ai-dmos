import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function CampaignPreview({
  campaignId,
  generatedCampaign,
  metaConnected,
  onApproved,
  onEdit,
}) {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [selectedCopy, setSelectedCopy] = useState(
    generatedCampaign.adCopyVariations[0]?.id || "copy_1"
  );
  const [selectedAudience, setSelectedAudience] = useState("baseAudience");
  const [creative, setCreative] = useState({ imageUrl: null, videoUrl: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleApproveCampaign() {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        "/api/v1/agents/meta-ads/approve-campaign",
        {
          companyId,
          campaignId,
          selections: { copyVariation: selectedCopy, audience: selectedAudience },
          creative,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onApproved(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to launch campaign on Meta");
    } finally {
      setLoading(false);
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCreative({ ...creative, imageUrl: event.target.result });
    reader.readAsDataURL(file);
  }

  const audienceEntries = Object.entries(generatedCampaign.audienceRecommendations || {});
  const metrics = generatedCampaign.expectedMetrics || {};

  return (
    <div className="campaign-preview">
      <h3>Campaign Preview</h3>

      <div className="preview-section">
        <h4>Overview</h4>
        <p>
          <strong>Name:</strong> {generatedCampaign.campaignName}
        </p>
        <p>
          <strong>Objective:</strong> {generatedCampaign.objective}
        </p>
        <p>
          <strong>Budget:</strong> RM{generatedCampaign.budgetAllocation?.total}
        </p>
      </div>

      <div className="preview-section">
        <h4>Select Ad Copy</h4>
        <div className="copy-variations">
          {generatedCampaign.adCopyVariations.map((copy) => (
            <div
              key={copy.id}
              className={`copy-card ${selectedCopy === copy.id ? "selected" : ""}`}
              onClick={() => setSelectedCopy(copy.id)}
            >
              <p className="primary-text">{copy.primaryText}</p>
              <p className="headline">{copy.headline}</p>
              <p className="description">{copy.description}</p>
              <span className="cta-pill">{copy.cta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="preview-section">
        <h4>Select Audience</h4>
        {audienceEntries.map(([key, audience]) => (
          <label key={key} className="audience-option">
            <input
              type="radio"
              name="audience"
              value={key}
              checked={selectedAudience === key}
              onChange={() => setSelectedAudience(key)}
            />
            <span>{audience.description || key}</span>
            {audience.estimatedReach && (
              <span className="reach">Reach: {audience.estimatedReach.toLocaleString()}</span>
            )}
          </label>
        ))}
      </div>

      <div className="preview-section">
        <h4>Upload Creative (optional)</h4>
        <div className="upload-area">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {creative.imageUrl && <img src={creative.imageUrl} alt="Creative preview" />}
        </div>
      </div>

      <div className="preview-section">
        <h4>Expected Metrics</h4>
        <div className="metrics">
          <div className="metric">
            <span>Reach</span>
            <strong>{(metrics.reach || 0).toLocaleString()}</strong>
          </div>
          <div className="metric">
            <span>Impressions</span>
            <strong>{(metrics.impressions || 0).toLocaleString()}</strong>
          </div>
          <div className="metric">
            <span>Est. Results</span>
            <strong>{metrics.estimatedResults || 0}</strong>
          </div>
          <div className="metric">
            <span>Est. ROAS</span>
            <strong>{metrics.estimatedROAS || 0}x</strong>
          </div>
        </div>
      </div>

      {generatedCampaign.recommendations?.length > 0 && (
        <div className="preview-section">
          <h4>Recommendations</h4>
          <ul className="quality-feedback">
            {generatedCampaign.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {!metaConnected && (
        <div className="banner banner-error">
          Connect your Meta Ads account above before launching this campaign.
        </div>
      )}
      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <button className="btn-secondary" onClick={onEdit} disabled={loading}>
          Edit
        </button>
        <button
          className="btn-primary"
          onClick={handleApproveCampaign}
          disabled={loading || !metaConnected}
        >
          {loading ? "Launching..." : "Launch Campaign"}
        </button>
      </div>
    </div>
  );
}
