import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Knowledge.css";

export default function KnowledgeLoader() {
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  const companyId = localStorage.getItem("companyId");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (files.length === 0) {
      setError("Please select at least one file");
      setLoading(false);
      return;
    }

    try {
      for (const file of files) {
        // Read file content
        const content = await file.text();

        // Send to backend
        const response = await axios.post(
          `/api/v1/knowledge`,
          {
            companyId,
            title: file.name.replace(".md", ""),
            content,
            category: "general",
            tags: [],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setKnowledge((prev) => [...prev, response.data.document]);
        }
      }

      setFiles([]);
      alert("Files uploaded successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload files");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(
        `/api/v1/knowledge/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { companyId },
        }
      );

      setKnowledge((prev) => prev.filter((k) => k.documentId !== documentId));
      alert("Deleted successfully!");
    } catch (err) {
      setError("Failed to delete knowledge");
    }
  };

  return (
    <div className="knowledge-container">
      <div className="knowledge-card">
        <h2>Knowledge Base</h2>
        <p className="subtitle">Upload markdown files to power your AI agents</p>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            📤 Upload
          </button>
          <button
            className={`tab ${activeTab === "view" ? "active" : ""}`}
            onClick={() => setActiveTab("view")}
          >
            📚 Knowledge ({knowledge.length})
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                accept=".md,.txt,.markdown"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="upload-placeholder">
                <p>📄 Drag & drop markdown files here</p>
                <p className="small">or click to select</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="selected-files">
                <h3>Selected Files ({files.length}):</h3>
                <ul>
                  {files.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Uploading..." : "Upload Files"}
            </button>
          </form>
        )}

        {/* View Tab */}
        {activeTab === "view" && (
          <div className="knowledge-list">
            {knowledge.length === 0 ? (
              <p className="empty-state">No knowledge uploaded yet</p>
            ) : (
              <div className="docs-grid">
                {knowledge.map((doc) => (
                  <div key={doc.documentId} className="doc-card">
                    <h3>📄 {doc.title}</h3>
                    <p className="category">{doc.category}</p>
                    <p className="preview">
                      {doc.content.substring(0, 100)}...
                    </p>
                    <div className="doc-actions">
                      <button className="btn-view">View</button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(doc.documentId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
