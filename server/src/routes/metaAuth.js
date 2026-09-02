import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  generateAuthUrl,
  consumeState,
  completeConnection,
  getConnectionStatus,
  disconnect,
} from "../services/metaAuthService.js";

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "";

// GET /api/v1/agents/meta-ads/auth-url
router.get("/auth-url", verifyToken, (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: "Missing required query param: companyId" });
    }

    if (!process.env.FACEBOOK_APP_ID) {
      return res.status(503).json({
        error: "Meta integration is not configured (FACEBOOK_APP_ID missing)",
      });
    }

    const { authUrl, state } = generateAuthUrl({ uid: req.user.uid, companyId });
    res.json({ success: true, authUrl, state });
  } catch (error) {
    console.error("Meta auth-url error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/agents/meta-ads/callback
router.get("/callback", async (req, res) => {
  const { code, state, error: oauthError } = req.query;
  const redirectBase = FRONTEND_URL || "";

  if (oauthError) {
    return res.redirect(`${redirectBase}/dashboard?meta_error=${encodeURIComponent(oauthError)}`);
  }

  if (!code || !state) {
    return res.redirect(`${redirectBase}/dashboard?meta_error=missing_code_or_state`);
  }

  const stateEntry = consumeState(state);
  if (!stateEntry) {
    return res.redirect(`${redirectBase}/dashboard?meta_error=invalid_or_expired_state`);
  }

  try {
    await completeConnection({ code, companyId: stateEntry.companyId });
    return res.redirect(`${redirectBase}/dashboard?meta_connected=true`);
  } catch (error) {
    console.error("Meta OAuth callback error:", error);
    return res.redirect(`${redirectBase}/dashboard?meta_error=${encodeURIComponent(error.message)}`);
  }
});

// GET /api/v1/agents/meta-ads/status
router.get("/status", verifyToken, async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: "Missing required query param: companyId" });
    }

    const status = await getConnectionStatus(companyId);
    res.json({ success: true, ...status });
  } catch (error) {
    console.error("Meta status error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/agents/meta-ads/disconnect
router.post("/disconnect", verifyToken, async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: "Missing required field: companyId" });
    }

    await disconnect(companyId);
    res.json({ success: true, message: "Meta account disconnected" });
  } catch (error) {
    console.error("Meta disconnect error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
