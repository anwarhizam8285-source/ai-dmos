import express from "express";
import { v4 as uuidv4 } from "uuid";
import { FieldValue } from "firebase-admin/firestore";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
  logUsage,
  listPerformanceHistory,
  createRecommendation,
  getRecommendation,
  listRecommendations,
  updateRecommendation,
} from "../utils/firebaseUtils.js";
import { validateCampaignInput } from "../validation/campaignValidation.js";
import { ValidationError } from "../validation/validationErrors.js";
import { generateCampaign } from "../services/campaignGeneratorService.js";
import { calculateTokenCost } from "../services/anthropicService.js";
import { getDecryptedAccessToken, getConnectionStatus } from "../services/metaAuthService.js";
import { MetaApiClient } from "../services/metaAdsApiClient.js";
import { launchCampaignOnMeta } from "../services/metaCampaignLaunchService.js";
import { generateOptimizationRecommendations } from "../services/optimizationEngineService.js";
import { applyRecommendation, undoRecommendation } from "../services/recommendationService.js";

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

// POST /api/v1/agents/meta-ads/generate-campaign
// Validates form input, asks Claude for a full campaign structure (ad copy x3,
// audience recommendations, budget allocation, projected metrics), and saves
// the result as a DRAFT. Nothing is sent to Meta at this step.
router.post("/generate-campaign", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignInput } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: "Missing required field: companyId" });
    }

    validateCampaignInput(campaignInput);

    const { data: generated, usage } = await generateCampaign(campaignInput);

    const today = new Date().toISOString().split("T")[0];
    const costData = await calculateTokenCost(usage.inputTokens, usage.outputTokens);
    await logUsage(companyId, today, {
      tokensUsed: usage.inputTokens + usage.outputTokens,
      cost: parseFloat(costData.costRM),
      requestsCount: 1,
      apiCallsCount: 1,
    });

    const campaignId = `campaign-${uuidv4().slice(0, 8)}`;

    await createCampaign(companyId, campaignId, {
      userId: req.user.uid,
      name: generated.campaignName || campaignInput.campaignName,
      objective: generated.objective || campaignInput.productInfo.targetAction,
      status: "DRAFT",
      budget: { amount: campaignInput.budget.amount, type: campaignInput.budget.type || "DAILY", currency: "RM" },
      audience: {
        country: campaignInput.audience.country || "MY",
        ageMin: campaignInput.audience.ageMin,
        ageMax: campaignInput.audience.ageMax,
        interests: campaignInput.audience.interests,
        customAudienceId: campaignInput.audience.customAudienceId || null,
      },
      placements: campaignInput.placement,
      productInfo: campaignInput.productInfo,
      creative: null,
      aiGeneration: { generatedAt: new Date(), ...generated },
      approved: null,
      metaCampaignId: null,
      metaAdSetId: null,
      metaAdId: null,
      metaAdAccountId: null,
      lastPerformanceUpdate: null,
      createdBy: "claude-ai",
      optimization: { lastOptimizationDate: null, optimizationsApplied: 0, estimatedROAS: 0 },
    });

    res.status(201).json({
      success: true,
      campaignId,
      generatedCampaign: generated,
      usage,
      cost: costData,
      message: "Campaign generated successfully. Please review and approve.",
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message, errors: error.errors });
    }
    console.error("Meta generate-campaign error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/agents/meta-ads/approve-campaign
// Pushes an approved DRAFT to the real Meta Marketing API as a real (but
// PAUSED) Campaign + AdSet, then marks the Firestore record ACTIVE.
router.post("/approve-campaign", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignId, selections, creative, pageId } = req.body;
    if (!companyId || !campaignId || !selections?.copyVariation) {
      return res.status(400).json({
        error: "Missing required fields: companyId, campaignId, selections.copyVariation",
      });
    }

    const campaign = await getCampaign(companyId, campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    if (campaign.status !== "DRAFT") {
      return res.status(409).json({ error: `Campaign is already ${campaign.status}, not DRAFT` });
    }

    const selectedCopy = (campaign.aiGeneration?.adCopyVariations || []).find(
      (c) => c.id === selections.copyVariation
    );
    if (!selectedCopy) {
      return res.status(400).json({ error: `Unknown copy variation: ${selections.copyVariation}` });
    }

    const metaStatus = await getConnectionStatus(companyId);
    if (!metaStatus.connected) {
      return res.status(409).json({ error: "Connect a Meta Ads account before launching a campaign" });
    }

    const accessToken = await getDecryptedAccessToken(companyId);
    const client = new MetaApiClient(accessToken, metaStatus.metaAdAccountId);

    const finalCreative = { ...selectedCopy, imageUrl: creative?.imageUrl || null, videoUrl: creative?.videoUrl || null };

    const launchResult = await launchCampaignOnMeta({
      client,
      campaign,
      creative: finalCreative,
      pageId: pageId || null,
    });

    await updateCampaign(companyId, campaignId, {
      status: "ACTIVE",
      creative: finalCreative,
      approved: {
        selectedCopyVariation: selections.copyVariation,
        selectedAudience: selections.audience || "baseAudience",
        approvedAt: new Date(),
      },
      metaCampaignId: launchResult.metaCampaignId,
      metaAdSetId: launchResult.metaAdSetId,
      metaAdId: launchResult.metaAdId,
      metaAdAccountId: metaStatus.metaAdAccountId,
    });

    res.json({
      success: true,
      campaignId,
      metaCampaignId: launchResult.metaCampaignId,
      metaAdSetId: launchResult.metaAdSetId,
      metaAdId: launchResult.metaAdId,
      adCreated: launchResult.adCreated,
      message: launchResult.adCreated
        ? "Campaign, ad set, and ad created on Meta (PAUSED). Activate it from Meta Ads Manager when ready."
        : "Campaign and ad set created on Meta (PAUSED). No Facebook Page ID was supplied, so no Ad was created - add one from Meta Ads Manager, or pass pageId next time.",
    });
  } catch (error) {
    console.error("Meta approve-campaign error:", error);
    res.status(error.status || 500).json({ error: error.message });
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

// GET /api/v1/agents/meta-ads/performance?companyId=...&campaignId=...&dateRange=30d
// Real daily_performance history, written by the nightly monitoring cron
// (performanceMonitoringService.js) or a manual /optimize call's prerequisite data.
router.get("/performance", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignId, dateRange = "30d" } = req.query;
    if (!companyId || !campaignId) {
      return res.status(400).json({ error: "Missing required query params: companyId, campaignId" });
    }

    const days = parseInt(dateRange, 10) || 30;
    const daily = await listPerformanceHistory(companyId, campaignId, days);

    const totals = daily.reduce(
      (acc, d) => ({
        spend: acc.spend + (d.spend || 0),
        impressions: acc.impressions + (d.impressions || 0),
        clicks: acc.clicks + (d.clicks || 0),
        results: acc.results + (d.results || 0),
      }),
      { spend: 0, impressions: 0, clicks: 0, results: 0 }
    );

    const summary = {
      ...totals,
      ctr: totals.impressions > 0 ? Number(((totals.clicks / totals.impressions) * 100).toFixed(2)) : 0,
      cpc: totals.clicks > 0 ? Number((totals.spend / totals.clicks).toFixed(2)) : 0,
      roas: daily.length
        ? Number((daily.reduce((sum, d) => sum + (d.roas || 0), 0) / daily.length).toFixed(2))
        : 0,
    };

    res.json({ success: true, campaignId, summary, daily });
  } catch (error) {
    console.error("Meta performance error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/agents/meta-ads/optimize
// Claude analyzes stored daily_performance history and generates 1-5 saved,
// PENDING recommendations. Requires the campaign to have been launched on
// Meta (metaCampaignId set) and at least one day of monitored performance.
router.post("/optimize", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignId } = req.body;
    if (!companyId || !campaignId) {
      return res.status(400).json({ error: "Missing required fields: companyId, campaignId" });
    }

    const campaign = await getCampaign(companyId, campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    if (!campaign.metaCampaignId) {
      return res.status(409).json({ error: "Campaign has not been launched on Meta yet" });
    }

    const performanceHistory = await listPerformanceHistory(companyId, campaignId, 30);
    if (performanceHistory.length === 0) {
      return res.status(409).json({
        error: "No performance data yet - wait for at least one day of monitoring before optimizing",
      });
    }

    const { data: recommendations, avgMetrics, trends, usage } = await generateOptimizationRecommendations(
      campaign,
      performanceHistory
    );

    const today = new Date().toISOString().split("T")[0];
    const costData = await calculateTokenCost(usage.inputTokens, usage.outputTokens);
    await logUsage(companyId, today, {
      tokensUsed: usage.inputTokens + usage.outputTokens,
      cost: parseFloat(costData.costRM),
      requestsCount: 1,
      apiCallsCount: 1,
    });

    const now = new Date();
    const saved = [];
    for (const rec of recommendations) {
      const recommendationId = `rec-${uuidv4().slice(0, 8)}`;
      const doc = {
        type: rec.type,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        action: { ...rec.action, previousValue: null },
        expectedImpact: rec.expectedImpact,
        status: "PENDING",
        appliedAt: null,
        appliedBy: null,
        undoneAt: null,
        generatedBy: "claude-ai",
        generatedAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        logs: [{ action: "GENERATED", timestamp: now, details: { source: "claude-ai" } }],
      };
      await createRecommendation(companyId, campaignId, recommendationId, doc);
      saved.push({ recommendationId, ...doc });
    }

    res.json({
      success: true,
      campaignId,
      avgMetrics,
      trends,
      recommendations: saved,
      usage,
      cost: costData,
      message: `Generated ${saved.length} optimization recommendation(s)`,
    });
  } catch (error) {
    console.error("Meta optimize error:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// GET /api/v1/agents/meta-ads/recommendations?companyId=...&campaignId=...&status=PENDING
router.get("/recommendations", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignId, status } = req.query;
    if (!companyId || !campaignId) {
      return res.status(400).json({ error: "Missing required query params: companyId, campaignId" });
    }

    const recommendations = await listRecommendations(companyId, campaignId, status ? { status } : {});
    res.json({ success: true, campaignId, recommendations, count: recommendations.length });
  } catch (error) {
    console.error("Meta recommendations list error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/agents/meta-ads/apply-recommendation
// Applies one PENDING recommendation to the real campaign/ad set on Meta.
router.post("/apply-recommendation", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignId, recommendationId } = req.body;
    if (!companyId || !campaignId || !recommendationId) {
      return res.status(400).json({
        error: "Missing required fields: companyId, campaignId, recommendationId",
      });
    }

    const campaign = await getCampaign(companyId, campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const recommendation = await getRecommendation(companyId, campaignId, recommendationId);
    if (!recommendation) {
      return res.status(404).json({ error: "Recommendation not found" });
    }
    if (recommendation.status !== "PENDING") {
      return res.status(409).json({ error: `Recommendation is already ${recommendation.status}` });
    }

    const metaStatus = await getConnectionStatus(companyId);
    if (!metaStatus.connected) {
      return res.status(409).json({ error: "Connect a Meta Ads account before applying recommendations" });
    }

    const accessToken = await getDecryptedAccessToken(companyId);
    const client = new MetaApiClient(accessToken, metaStatus.metaAdAccountId);

    const result = await applyRecommendation({ client, campaign, recommendation });

    const now = new Date();
    await updateRecommendation(companyId, campaignId, recommendationId, {
      status: "APPLIED",
      appliedAt: now,
      appliedBy: req.user.uid,
      "action.previousValue": result.previousValue ?? null,
      logs: FieldValue.arrayUnion({ action: "APPLIED", timestamp: now, details: result }),
    });

    res.json({ success: true, campaignId, recommendationId, message: "Recommendation applied on Meta", result });
  } catch (error) {
    console.error("Meta apply-recommendation error:", error);
    res.status(error.status || 400).json({ error: error.message });
  }
});

// POST /api/v1/agents/meta-ads/reject-recommendation
router.post("/reject-recommendation", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignId, recommendationId, reason } = req.body;
    if (!companyId || !campaignId || !recommendationId) {
      return res.status(400).json({
        error: "Missing required fields: companyId, campaignId, recommendationId",
      });
    }

    const recommendation = await getRecommendation(companyId, campaignId, recommendationId);
    if (!recommendation) {
      return res.status(404).json({ error: "Recommendation not found" });
    }
    if (recommendation.status !== "PENDING") {
      return res.status(409).json({ error: `Recommendation is already ${recommendation.status}` });
    }

    const now = new Date();
    await updateRecommendation(companyId, campaignId, recommendationId, {
      status: "REJECTED",
      logs: FieldValue.arrayUnion({ action: "REJECTED", timestamp: now, details: { reason: reason || null } }),
    });

    res.json({ success: true, campaignId, recommendationId, message: "Recommendation rejected" });
  } catch (error) {
    console.error("Meta reject-recommendation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/agents/meta-ads/undo-recommendation
// Reverses an APPLIED recommendation within its 24-hour undo window.
router.post("/undo-recommendation", verifyToken, async (req, res) => {
  try {
    const { companyId, campaignId, recommendationId } = req.body;
    if (!companyId || !campaignId || !recommendationId) {
      return res.status(400).json({
        error: "Missing required fields: companyId, campaignId, recommendationId",
      });
    }

    const campaign = await getCampaign(companyId, campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const recommendation = await getRecommendation(companyId, campaignId, recommendationId);
    if (!recommendation) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    const metaStatus = await getConnectionStatus(companyId);
    if (!metaStatus.connected) {
      return res.status(409).json({ error: "Connect a Meta Ads account before undoing a change" });
    }
    const accessToken = await getDecryptedAccessToken(companyId);
    const client = new MetaApiClient(accessToken, metaStatus.metaAdAccountId);

    await undoRecommendation({ client, campaign, recommendation });

    const now = new Date();
    await updateRecommendation(companyId, campaignId, recommendationId, {
      status: "UNDONE",
      undoneAt: now,
      logs: FieldValue.arrayUnion({ action: "UNDONE", timestamp: now }),
    });

    res.json({ success: true, campaignId, recommendationId, message: "Change undone on Meta" });
  } catch (error) {
    console.error("Meta undo-recommendation error:", error);
    res.status(error.status || 400).json({ error: error.message });
  }
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
