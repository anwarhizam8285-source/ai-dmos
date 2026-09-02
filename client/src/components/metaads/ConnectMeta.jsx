import { useEffect, useState } from "react";
import { useMetaAuth } from "../../hooks/useMetaAuth";
import "./MetaAds.css";

function useCallbackBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const readCallbackBanner = () => {
      const params = new URLSearchParams(window.location.search);
      const connected = params.get("meta_connected");
      const metaError = params.get("meta_error");

      if (connected) {
        setBanner({ type: "success", text: "Meta account connected successfully!" });
      } else if (metaError) {
        setBanner({ type: "error", text: `Meta connection failed: ${metaError}` });
      }

      if (connected || metaError) {
        params.delete("meta_connected");
        params.delete("meta_error");
        const newSearch = params.toString();
        const newUrl =
          window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
        window.history.replaceState({}, "", newUrl);
      }
    };
    readCallbackBanner();
  }, []);

  return banner;
}

export default function ConnectMeta() {
  const {
    connected,
    status,
    loading,
    connecting,
    error,
    connectMeta,
    disconnectMeta,
    refreshStatus,
  } = useMetaAuth();
  const banner = useCallbackBanner();

  useEffect(() => {
    if (banner?.type === "success") {
      refreshStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner]);

  if (loading) {
    return (
      <div className="meta-ads-container">
        <div className="meta-ads-card">
          <div className="spinner" />
          Loading Meta connection...
        </div>
      </div>
    );
  }

  return (
    <div className="meta-ads-container">
      <div className="meta-ads-card">
        <h2>📣 Meta Ads Agent</h2>
        <p className="subtitle">Connect your Meta Ads account to let AI-DMOS manage campaigns</p>

        {banner && <div className={`banner banner-${banner.type}`}>{banner.text}</div>}
        {error && <div className="error-message">{error}</div>}

        {connected ? (
          <div className="meta-status connected">
            <div className="status-row">
              <span className="status-dot" />
              <span className="status-text">Meta Account Connected</span>
            </div>
            <div className="meta-details">
              {status?.metaAdAccountId && (
                <div className="detail-row">
                  <span className="label">Ad Account:</span>
                  <span className="value">{status.metaAdAccountId}</span>
                </div>
              )}
              {status?.scopes && (
                <div className="detail-row">
                  <span className="label">Scopes:</span>
                  <span className="value">{status.scopes.join(", ")}</span>
                </div>
              )}
            </div>
            <button className="btn-secondary" onClick={disconnectMeta} disabled={connecting}>
              {connecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        ) : (
          <div className="meta-status disconnected">
            <button className="btn-primary" onClick={connectMeta} disabled={connecting}>
              {connecting ? "Redirecting to Meta..." : "Connect Meta Account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
