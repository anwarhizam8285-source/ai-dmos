import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const COUNTRIES = [
  { value: "MY", label: "Malaysia" },
  { value: "SG", label: "Singapore" },
  { value: "ID", label: "Indonesia" },
  { value: "TH", label: "Thailand" },
];

const TARGET_ACTIONS = [
  { value: "CONVERSIONS", label: "Conversions" },
  { value: "LEADS", label: "Leads" },
  { value: "TRAFFIC", label: "Traffic" },
  { value: "AWARENESS", label: "Awareness" },
];

const initialFormData = {
  campaignName: "",
  budget: { amount: 1000, type: "DAILY" },
  audience: { country: "MY", ageMin: 25, ageMax: 45, interests: [] },
  placement: { facebook: true, instagram: true, audience_network: false, messenger: false },
  productInfo: { name: "", description: "", landingPageUrl: "", targetAction: "CONVERSIONS" },
};

export default function CampaignForm({ onGenerated }) {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [formData, setFormData] = useState(initialFormData);
  const [interestsText, setInterestsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerateCampaign(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const campaignInput = {
      ...formData,
      audience: {
        ...formData.audience,
        interests: interestsText
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      },
    };

    try {
      const res = await axios.post(
        "/api/v1/agents/meta-ads/generate-campaign",
        { companyId, campaignInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onGenerated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate campaign");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleGenerateCampaign} className="content-form">
      <div className="form-group">
        <label>Campaign Name</label>
        <input
          type="text"
          value={formData.campaignName}
          onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
          placeholder="e.g., Q4 Product Launch"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Budget (RM)</label>
          <input
            type="number"
            value={formData.budget.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                budget: { ...formData.budget, amount: parseFloat(e.target.value) || 0 },
              })
            }
            min="100"
            max="1000000"
            required
          />
        </div>
        <div className="form-group">
          <label>Budget Type</label>
          <select
            value={formData.budget.type}
            onChange={(e) =>
              setFormData({ ...formData, budget: { ...formData.budget, type: e.target.value } })
            }
          >
            <option value="DAILY">Daily</option>
            <option value="LIFETIME">Lifetime</option>
          </select>
        </div>
        <div className="form-group">
          <label>Country</label>
          <select
            value={formData.audience.country}
            onChange={(e) =>
              setFormData({ ...formData, audience: { ...formData.audience, country: e.target.value } })
            }
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Age Range</label>
          <div className="age-range">
            <input
              type="number"
              value={formData.audience.ageMin}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  audience: { ...formData.audience, ageMin: parseInt(e.target.value, 10) || 13 },
                })
              }
              min="13"
              max="65"
            />
            <span>to</span>
            <input
              type="number"
              value={formData.audience.ageMax}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  audience: { ...formData.audience, ageMax: parseInt(e.target.value, 10) || 65 },
                })
              }
              min="13"
              max="65"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Target Action</label>
          <select
            value={formData.productInfo.targetAction}
            onChange={(e) =>
              setFormData({
                ...formData,
                productInfo: { ...formData.productInfo, targetAction: e.target.value },
              })
            }
          >
            {TARGET_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Interests (comma separated)</label>
        <textarea
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          placeholder="e.g., technology, business, entrepreneurship"
          rows="2"
          required
        />
      </div>

      <div className="form-group">
        <label>Placements</label>
        <div className="checkboxes">
          {["facebook", "instagram", "audience_network", "messenger"].map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={formData.placement[key]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placement: { ...formData.placement, [key]: e.target.checked },
                  })
                }
              />
              {key.replace("_", " ")}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Product Name</label>
        <input
          type="text"
          value={formData.productInfo.name}
          onChange={(e) =>
            setFormData({ ...formData, productInfo: { ...formData.productInfo, name: e.target.value } })
          }
          placeholder="e.g., New SaaS Tool"
          required
        />
      </div>

      <div className="form-group">
        <label>Product Description</label>
        <textarea
          value={formData.productInfo.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              productInfo: { ...formData.productInfo, description: e.target.value },
            })
          }
          placeholder="Describe your product... (min 20 characters)"
          rows="3"
          required
        />
      </div>

      <div className="form-group">
        <label>Landing Page URL</label>
        <input
          type="url"
          value={formData.productInfo.landingPageUrl}
          onChange={(e) =>
            setFormData({
              ...formData,
              productInfo: { ...formData.productInfo, landingPageUrl: e.target.value },
            })
          }
          placeholder="https://product.com"
          required
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Generating..." : "Generate Campaign"}
      </button>
    </form>
  );
}
