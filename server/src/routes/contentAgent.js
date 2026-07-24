import express from "express";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { generateContent, calculateTokenCost } from "../services/anthropicService.js";
import { CONTENT_TEMPLATES, scoreContent } from "../services/contentAgentService.js";
import { createContent, logUsage } from "../utils/firebaseUtils.js";

const router = express.Router();

// GET /api/v1/agents/content/templates
router.get("/templates", verifyToken, (req, res) => {
  res.json({ success: true, templates: CONTENT_TEMPLATES });
});

// POST /api/v1/agents/content/generate
router.post("/generate", verifyToken, async (req, res) => {
  try {
    const {
      companyId,
      knowledge = "",
      contentType = "caption",
      platform = "instagram",
      topic,
      tone = "professional",
    } = req.body;

    if (!companyId || !topic) {
      return res.status(400).json({
        error: "Missing required fields: companyId, topic",
      });
    }

    const result = await generateContent(knowledge, contentType, { topic, tone });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const quality = scoreContent(result.content, contentType);

    const today = new Date().toISOString().split("T")[0];
    const costData = await calculateTokenCost(
      result.usage.inputTokens,
      result.usage.outputTokens
    );

    await logUsage(companyId, today, {
      tokensUsed: result.usage.inputTokens + result.usage.outputTokens,
      cost: parseFloat(costData.costRM),
      requestsCount: 1,
      contentGenerated: 1,
      apiCallsCount: 1,
    });

    res.json({
      success: true,
      contentType,
      platform,
      content: result.content,
      quality,
      usage: result.usage,
      cost: costData,
    });
  } catch (error) {
    console.error("Content agent generate error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/agents/content/save - persist a generated draft to history
router.post("/save", verifyToken, async (req, res) => {
  try {
    const { companyId, type, platform, title, body, quality } = req.body;

    if (!companyId || !type || !body) {
      return res.status(400).json({
        error: "Missing required fields: companyId, type, body",
      });
    }

    const contentId = `content-${uuidv4().slice(0, 8)}`;

    const contentData = {
      type,
      platform: platform || "instagram",
      title: title || body.slice(0, 60),
      body,
      variants: [],
      metadata: { quality: quality || null, favorite: false },
      status: "draft",
      knowledgeUsed: [],
      agentUsed: "content-agent",
      performanceMetrics: {},
      createdBy: req.user.uid,
    };

    await createContent(companyId, contentId, contentData);

    res.status(201).json({
      success: true,
      contentId,
      content: { contentId, companyId, ...contentData },
    });
  } catch (error) {
    console.error("Content agent save error:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
