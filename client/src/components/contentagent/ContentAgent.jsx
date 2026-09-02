import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./ContentAgent.css";

const CONTENT_TYPES = [
  { value: "caption", label: "Social Caption" },
  { value: "carousel", label: "Carousel Slides" },
  { value: "blog", label: "Blog Intro" },
  { value: "email", label: "Email" },
  { value: "story", label: "Story Ideas" },
];

const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin", "twitter", "email"];
const TONES = ["professional", "casual", "playful", "urgent", "inspirational"];

export default function ContentAgent() {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [contentType, setContentType] = useState("caption");
  const [platform, setPlatform] = useState("instagram");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const res = await axios.get("/api/v1/knowledge", {
          params: { companyId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setKnowledgeDocs(res.data.documents || []);
      } catch {
        setKnowledgeDocs([]);
      }
    };
    if (companyId && token) fetchKnowledge();
  }, [companyId, token]);

  const knowledgeContext = knowledgeDocs.map((d) => `${d.title}: ${d.content}`).join("\n\n");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setError("");
    setResult(null);
    setSaved(false);
    setLoading(true);

    try {
      const res = await axios.post(
        "/api/v1/agents/content/generate",
        { companyId, knowledge: knowledgeContext, contentType, platform, topic, tone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setError("");

    try {
      await axios.post(
        "/api/v1/agents/content/save",
        {
          companyId,
          type: contentType,
          platform,
          title: topic,
          body: result.content,
          quality: result.quality,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
    } catch {
      setError("Failed to save content to history");
    } finally {
      setSaving(false);
    }
  };

  const qualityClass =
    result && (result.quality.score >= 80 ? "good" : result.quality.score >= 50 ? "ok" : "low");

  return (
    <div className="content-agent-container">
      <div className="content-agent-card">
        <h2>🎨 Content Agent</h2>
        <p className="subtitle">
          Generate on-brand content using {knowledgeDocs.length} knowledge document
          {knowledgeDocs.length !== 1 ? "s" : ""}
        </p>

        <form onSubmit={handleGenerate} className="content-form">
          <div className="form-row">
            <div className="form-group">
              <label>Content Type</label>
              <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Topic / Brief *</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Launch of our new summer collection"
              rows="3"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Generating..." : "Generate Content"}
          </button>
        </form>

        {result && (
          <div className="result-card">
            <div className="result-header">
              <h3>Generated Content</h3>
              <span className={`quality-badge quality-${qualityClass}`}>
                Quality: {result.quality.score}/100
              </span>
            </div>
            <p className="result-body">{result.content}</p>

            <ul className="quality-feedback">
              {result.quality.feedback.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            <div className="result-meta">
              <span>{result.usage.inputTokens + result.usage.outputTokens} tokens</span>
              <span>RM {result.cost.costRM}</span>
            </div>

            <button className="btn-secondary" onClick={handleSave} disabled={saving || saved}>
              {saved ? "✓ Saved to History" : saving ? "Saving..." : "Save to History"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
