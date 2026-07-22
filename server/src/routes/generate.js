import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { generateContent, calculateTokenCost } from "../services/anthropicService.js";
import { logUsage } from "../utils/firebaseUtils.js";

const router = express.Router();

// POST /api/v1/generate/caption
router.post("/caption", verifyToken, async (req, res) => {
  try {
    const { companyId, knowledge, topic, tone = "professional" } = req.body;

    if (!companyId || !knowledge || !topic) {
      return res.status(400).json({
        error: "Missing required fields: companyId, knowledge, topic",
      });
    }

    const result = await generateContent(knowledge, "caption", {
      topic,
      tone,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Log usage
    const today = new Date().toISOString().split("T")[0];
    const costData = calculateTokenCost(
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
      content: result.content,
      usage: result.usage,
      cost: costData,
    });
  } catch (error) {
    console.error("Generate caption error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/generate/content
router.post("/content", verifyToken, async (req, res) => {
  try {
    const { companyId, knowledge, contentType, topic, tone = "professional" } =
      req.body;

    if (!companyId || !knowledge || !contentType || !topic) {
      return res.status(400).json({
        error: "Missing required fields: companyId, knowledge, contentType, topic",
      });
    }

    const result = await generateContent(knowledge, contentType, { topic, tone });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Log usage
    const today = new Date().toISOString().split("T")[0];
    const costData = calculateTokenCost(
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
      contentType: result.contentType,
      content: result.content,
      usage: result.usage,
      cost: costData,
    });
  } catch (error) {
    console.error("Generate content error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
