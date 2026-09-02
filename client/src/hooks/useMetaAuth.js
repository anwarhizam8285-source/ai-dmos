import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export function useMetaAuth() {
  const { token } = useAuth();
  const companyId = localStorage.getItem("companyId");

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  async function refreshStatus() {
    if (!companyId || !token) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/agents/meta-ads/status", {
        ...authHeaders,
        params: { companyId },
      });
      setStatus(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load Meta connection status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchInitialStatus = () => refreshStatus();
    fetchInitialStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, token]);

  const connectMeta = async () => {
    if (!companyId) {
      setError("No company selected");
      return;
    }
    setConnecting(true);
    setError("");
    try {
      const res = await axios.get("/api/v1/agents/meta-ads/auth-url", {
        ...authHeaders,
        params: { companyId },
      });
      window.location.href = res.data.authUrl;
    } catch (err) {
      setError(err.response?.data?.error || "Could not start Meta connection");
      setConnecting(false);
    }
  };

  const disconnectMeta = async () => {
    setConnecting(true);
    setError("");
    try {
      await axios.post("/api/v1/agents/meta-ads/disconnect", { companyId }, authHeaders);
      await refreshStatus();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to disconnect Meta account");
    } finally {
      setConnecting(false);
    }
  };

  return {
    connected: !!status?.connected,
    status,
    loading,
    connecting,
    error,
    connectMeta,
    disconnectMeta,
    refreshStatus,
  };
}

export default useMetaAuth;
