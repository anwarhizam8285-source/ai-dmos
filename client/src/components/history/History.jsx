import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./History.css";

function formatDate(ts) {
  if (!ts) return "";
  if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleDateString();
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
  const d = new Date(ts);
  return isNaN(d) ? "" : d.toLocaleDateString();
}

export default function History() {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { companyId };
        if (typeFilter) params.type = typeFilter;
        if (platformFilter) params.platform = platformFilter;

        const res = await axios.get("/api/v1/content", {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(res.data.content || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    if (companyId && token) fetchContent();
  }, [companyId, token, typeFilter, platformFilter]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (favoritesOnly && !item.metadata?.favorite) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return item.title?.toLowerCase().includes(q) || item.body?.toLowerCase().includes(q);
    });
  }, [items, search, favoritesOnly]);

  const toggleFavorite = async (item) => {
    const updatedMetadata = { ...item.metadata, favorite: !item.metadata?.favorite };
    try {
      await axios.put(
        `/api/v1/content/${item.contentId}`,
        { companyId, metadata: updatedMetadata },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) =>
        prev.map((i) => (i.contentId === item.contentId ? { ...i, metadata: updatedMetadata } : i))
      );
    } catch {
      setError("Failed to update favorite");
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm("Delete this content permanently?")) return;
    try {
      await axios.delete(`/api/v1/content/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { companyId },
      });
      setItems((prev) => prev.filter((i) => i.contentId !== contentId));
    } catch {
      setError("Failed to delete content");
    }
  };

  const handleExport = (item) => {
    const blob = new Blob([item.body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title || item.contentId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="history-container">
      <div className="history-card">
        <h2>📚 Content History</h2>
        <p className="subtitle">Search, filter, and manage your generated content</p>

        <div className="history-filters">
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="caption">Caption</option>
            <option value="carousel">Carousel</option>
            <option value="blog">Blog</option>
            <option value="email">Email</option>
            <option value="story">Story</option>
          </select>
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="">All platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
            <option value="email">Email</option>
          </select>
          <label className="favorites-toggle">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            ⭐ Favorites only
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p className="empty-state">Loading history...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">No content found. Generate some with the Content Agent!</p>
        ) : (
          <div className="history-grid">
            {filtered.map((item) => (
              <div key={item.contentId} className="history-item">
                <div className="history-item-header">
                  <span className="type-badge">{item.type}</span>
                  <span className="platform-badge">{item.platform}</span>
                  <button
                    className={`favorite-btn ${item.metadata?.favorite ? "active" : ""}`}
                    onClick={() => toggleFavorite(item)}
                    title="Toggle favorite"
                  >
                    {item.metadata?.favorite ? "⭐" : "☆"}
                  </button>
                </div>
                <h3>{item.title}</h3>
                <p className="history-body">{item.body?.slice(0, 150)}...</p>
                <div className="history-meta">
                  <span>{formatDate(item.createdAt)}</span>
                  {item.metadata?.quality && <span>Quality: {item.metadata.quality.score}/100</span>}
                </div>
                <div className="history-actions">
                  <button className="btn-secondary" onClick={() => handleExport(item)}>
                    Export
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(item.contentId)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
