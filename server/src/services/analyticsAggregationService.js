import { listCampaigns, listPerformanceHistory, getUsageStats } from "../utils/firebaseUtils.js";
import {
  computeCampaignTotals,
  rollUpTotals,
  buildDailySeries,
  topPerformers,
  bottomPerformers,
  planInfo,
} from "../utils/analyticsMath.js";

const RANGE_DAYS = { "7days": 7, "30days": 30, "90days": 90, all: 365 };

// Account-wide campaign performance: per-campaign totals, rolled-up totals,
// a merged daily time series (for a single chart), and top/bottom performers
// by ROAS. Only campaigns that reached Meta (metaCampaignId set) have any
// performance history to aggregate - drafts and never-launched campaigns
// still appear in `campaigns` with zeroed metrics and hasPerformanceData: false.
export async function calculateBusinessMetrics(companyId, dateRange = "30days") {
  const days = RANGE_DAYS[dateRange] ?? RANGE_DAYS["30days"];
  const campaigns = await listCampaigns(companyId);

  const histories = await Promise.all(
    campaigns.map((c) => (c.metaCampaignId ? listPerformanceHistory(companyId, c.campaignId, days) : []))
  );

  const campaignTotals = campaigns.map((campaign, i) => computeCampaignTotals(campaign, histories[i]));

  return {
    period: dateRange,
    totals: rollUpTotals(campaignTotals),
    campaigns: campaignTotals,
    daily: buildDailySeries(histories),
    topPerformers: topPerformers(campaignTotals),
    bottomPerformers: bottomPerformers(campaignTotals),
  };
}

// Plan + this-month usage, presented as informational account status - NOT
// a real invoice. No payment processor is integrated in this codebase (see
// server/docs/BILLING.md), so there is no real "amount charged" to report.
export async function calculateBillingSnapshot(companyId, company) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];

  const usage = await getUsageStats(companyId, monthStart, today);
  const monthUsage = usage.reduce(
    (acc, day) => ({
      tokensUsed: acc.tokensUsed + (day.tokensUsed || 0),
      cost: acc.cost + (day.cost || 0),
      apiCallsCount: acc.apiCallsCount + (day.apiCallsCount || 0),
      contentGenerated: acc.contentGenerated + (day.contentGenerated || 0),
    }),
    { tokensUsed: 0, cost: 0, apiCallsCount: 0, contentGenerated: 0 }
  );

  const campaigns = await listCampaigns(companyId);
  const campaignsThisMonth = campaigns.filter((c) => {
    const createdAt = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return createdAt >= new Date(monthStart);
  }).length;

  return {
    ...planInfo(company.plan),
    usage: {
      campaignsCreatedThisMonth: campaignsThisMonth,
      totalCampaigns: campaigns.length,
      tokensUsedThisMonth: monthUsage.tokensUsed,
      apiCostThisMonthRM: Number(monthUsage.cost.toFixed(4)),
      contentGeneratedThisMonth: monthUsage.contentGenerated,
    },
    // No Stripe/2Checkout/etc. is wired up - this dashboard is display-only.
    paymentIntegration: "not_configured",
  };
}

export default { calculateBusinessMetrics, calculateBillingSnapshot };
