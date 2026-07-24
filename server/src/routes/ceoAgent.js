import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { orchestrate } from "../services/ceoAgentService.js";
import { calculateTokenCost } from "../services/anthropicService.js";
import { listKnowledge, getCompany, logUsage } from "../utils/firebaseUtils.js";

const router = express.Router();

// POST /api/v1/agents/ceo/ask
router.post("/ask", verifyToken, async (req, res) => {
  try {
    const { companyId, message } = req.body;

    if (!companyId || !message) {
      return res.status(400).json({
        error: "Missing required fields: companyId, message",
      });
    }

    const [company, knowledgeDocs] = await Promise.all([
      getCompany(companyId),
      listKnowledge(companyId),
    ]);

    const knowledgeContext = knowledgeDocs
      .slice(0, 5)
      .map((doc) => `${doc.title}: ${doc.content.slice(0, 300)}`)
      .join("\n\n");

    const result = await orchestrate(message, {
      knowledge: knowledgeContext,
      companyName: company?.name,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Agent failed to respond" });
    }

    if (result.usage) {
      const today = new Date().toISOString().split("T")[0];
      const costData = await calculateTokenCost(
        result.usage.inputTokens,
        result.usage.outputTokens
      );

      await logUsage(companyId, today, {
        tokensUsed: result.usage.inputTokens + result.usage.outputTokens,
        cost: parseFloat(costData.costRM),
        requestsCount: 1,
        contentGenerated: result.agent === "content-agent" ? 1 : 0,
        apiCallsCount: 1,
      });
    }

    res.json({
      success: true,
      agent: result.agent,
      intent: result.intent,
      content: result.content,
      usage: result.usage,
    });
  } catch (error) {
    console.error("CEO agent route error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
