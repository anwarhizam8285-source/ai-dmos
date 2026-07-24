import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getUsageStats } from "../utils/firebaseUtils.js";

const router = express.Router();

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const fmt = (d) => d.toISOString().split("T")[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

// GET /api/v1/analytics/usage - raw daily usage records for a date range
router.get("/usage", verifyToken, async (req, res) => {
  try {
    const { companyId, days = 30 } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const { startDate, endDate } = getDateRange(parseInt(days));
    const usage = await getUsageStats(companyId, startDate, endDate);

    res.json({ success: true, startDate, endDate, usage });
  } catch (error) {
    console.error("Analytics usage error:", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/v1/analytics/summary - aggregated totals + zero-filled daily breakdown
router.get("/summary", verifyToken, async (req, res) => {
  try {
    const { companyId, days = 30 } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const { startDate, endDate } = getDateRange(parseInt(days));
    const usage = await getUsageStats(companyId, startDate, endDate);

    const totals = usage.reduce(
      (acc, day) => ({
        tokensUsed: acc.tokensUsed + (day.tokensUsed || 0),
        cost: acc.cost + (day.cost || 0),
        requestsCount: acc.requestsCount + (day.requestsCount || 0),
        contentGenerated: acc.contentGenerated + (day.contentGenerated || 0),
        apiCallsCount: acc.apiCallsCount + (day.apiCallsCount || 0),
      }),
      { tokensUsed: 0, cost: 0, requestsCount: 0, contentGenerated: 0, apiCallsCount: 0 }
    );

    const dailyMap = new Map(usage.map((d) => [d.date, d]));
    const daily = [];
    const cursor = new Date(startDate);
    const end = new Date(endDate);
    while (cursor <= end) {
      const dateStr = cursor.toISOString().split("T")[0];
      const day = dailyMap.get(dateStr);
      daily.push({
        date: dateStr,
        tokensUsed: day?.tokensUsed || 0,
        cost: day?.cost || 0,
        contentGenerated: day?.contentGenerated || 0,
        apiCallsCount: day?.apiCallsCount || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    res.json({ success: true, startDate, endDate, totals, daily });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
