import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getUsageStats, getCompany } from "../utils/firebaseUtils.js";
import { calculateBusinessMetrics, calculateBillingSnapshot } from "../services/analyticsAggregationService.js";
import { toCSV } from "../utils/csv.js";

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

// GET /api/v1/analytics/overview - account-wide campaign ROI (Sprint 5)
// Aggregates every campaign's daily_performance for the selected range.
router.get("/overview", verifyToken, async (req, res) => {
  try {
    const { companyId, dateRange = "30days" } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const metrics = await calculateBusinessMetrics(companyId, dateRange);
    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error("Analytics overview error:", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/v1/analytics/billing - plan + this-month usage (Sprint 5)
// Display-only: no payment processor is integrated, so this is informational
// account status, not a real invoice. See server/docs/BILLING.md.
router.get("/billing", verifyToken, async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const company = await getCompany(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const billing = await calculateBillingSnapshot(companyId, company);
    res.json({ success: true, data: billing });
  } catch (error) {
    console.error("Analytics billing error:", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/v1/analytics/export?companyId=...&dateRange=30days&format=csv|json (Sprint 5)
// PDF export is not implemented - it would need a rendering dependency
// (pdfkit/puppeteer) not currently in this codebase; deferred.
router.get("/export", verifyToken, async (req, res) => {
  try {
    const { companyId, dateRange = "30days", format = "json" } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const metrics = await calculateBusinessMetrics(companyId, dateRange);

    if (format === "csv") {
      const columns = [
        { key: "name", label: "Campaign" },
        { key: "status", label: "Status" },
        { key: "spend", label: "Spend (RM)" },
        { key: "results", label: "Results" },
        { key: "impressions", label: "Impressions" },
        { key: "clicks", label: "Clicks" },
        { key: "ctr", label: "CTR (%)" },
        { key: "cpc", label: "CPC (RM)" },
        { key: "costPerResult", label: "Cost per Result (RM)" },
        { key: "roas", label: "ROAS" },
      ];
      const csv = toCSV(metrics.campaigns, columns);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="ai-dmos-report-${dateRange}.csv"`);
      return res.send(csv);
    }

    if (format !== "json") {
      return res.status(400).json({ error: `Unsupported format: ${format}. Use csv or json.` });
    }

    res.json({ success: true, format: "json", data: metrics });
  } catch (error) {
    console.error("Analytics export error:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
