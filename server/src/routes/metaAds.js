import express from "express";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createCampaign, listCampaigns } from "../utils/firebaseUtils.js";

const router = express.Router();

// POST /api/v1/agents/meta-ads/create-campaign
// Skeleton: persists a draft campaign record. Real Meta API campaign
// creation (budget, audience, creative push) lands in Sprint 3.
router.post("/create-campaign", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignName, objective = "CONVERSIONS", budget, audience, creative } =
      req.body;

    if (!companyId || !campaignName) {
      return res.status(400).json({
        error: "Missing required fields: companyId, campaignName",
      });
    }

    const campaignId = `campaign-${uuidv4().slice(0, 8)}`;

    await createCampaign(companyId, campaignId, {
      userId: req.user.uid,
      name: campaignName,
      objective,
      status: "draft",
      budget: budget || null,
      audience: audience || null,
      creative: creative || null,
      placements: { facebook: true, instagram: true, audience_network: false, messenger: false },
      metaCampaignId: null,
      metaAdAccountId: null,
      lastPerformanceUpdate: null,
      createdBy: "user",
      optimization: { lastOptimizationDate: null, optimizationsApplied: 0, estimatedROAS: 0 },
    });

    res.status(201).json({
      success: true,
      campaignId,
      message: "Campaign draft created. Meta API push lands in Sprint 3.",
    });
  } catch (error) {
    console.error("Meta create-campaign error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/agents/meta-ads/campaigns
router.get("/campaigns", verifyToken, async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: "Missing required query param: companyId" });
    }

    const campaigns = await listCampaigns(companyId);
    res.json({ success: true, campaigns });
  } catch (error) {
    console.error("Meta campaigns list error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/agents/meta-ads/performance
// Placeholder - real Meta Insights aggregation lands in Sprint 4.
router.get("/performance", verifyToken, async (req, res) => {
  const { campaignId, dateRange = "30d" } = req.query;
  if (!campaignId) {
    return res.status(400).json({ error: "Missing required query param: campaignId" });
  }

  res.json({
    success: true,
    campaign: { campaignId, status: "draft" },
    summary: { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, roas: 0 },
    daily: [],
    note: `Placeholder response for dateRange=${dateRange}. Real data lands in Sprint 4.`,
  });
});

// POST /api/v1/agents/meta-ads/optimize
// Placeholder - real Claude-driven recommendations land in Sprint 4.
router.post("/optimize", verifyToken, async (req, res) => {
  const { campaignId, analysisDepth = "STANDARD" } = req.body;
  if (!campaignId) {
    return res.status(400).json({ error: "Missing required field: campaignId" });
  }

  res.json({
    success: true,
    recommendations: [],
    note: `Placeholder response for analysisDepth=${analysisDepth}. Real recommendations land in Sprint 4.`,
  });
});

// GET /api/v1/agents/meta-ads/analytics
// Placeholder - real cross-campaign analytics land in Sprint 5.
router.get("/analytics", verifyToken, async (req, res) => {
  const { companyId, dateRange = "30d" } = req.query;
  if (!companyId) {
    return res.status(400).json({ error: "Missing required query param: companyId" });
  }

  res.json({
    success: true,
    summary: { totalSpend: 0, totalCampaigns: 0, avgRoas: 0 },
    campaigns: [],
    insights: [],
    note: `Placeholder response for dateRange=${dateRange}. Real analytics land in Sprint 5.`,
  });
});

export default router;
