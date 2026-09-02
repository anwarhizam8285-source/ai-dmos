import express from "express";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createCampaign, getCampaign, listCampaigns, updateCampaign, logUsage } from "../utils/firebaseUtils.js";
import { validateCampaignInput } from "../validation/campaignValidation.js";
import { ValidationError } from "../validation/validationErrors.js";
import { generateCampaign } from "../services/campaignGeneratorService.js";
import { calculateTokenCost } from "../services/anthropicService.js";
import { getDecryptedAccessToken, getConnectionStatus } from "../services/metaAuthService.js";
import { MetaApiClient } from "../services/metaAdsApiClient.js";
import { launchCampaignOnMeta } from "../services/metaCampaignLaunchService.js";

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
