// Pure aggregation math for the business analytics dashboard - dependency-free
// (same reasoning as performanceMetrics.js: keeps it importable in tests
// without pulling in the firebase-admin/auth -> jwks-rsa -> jose chain that
// breaks under Jest's --experimental-vm-modules ESM mode).

function safeDiv(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : 0;
}

function round2(n) {
  return Number(n.toFixed(2));
}

// Sums one campaign's daily_performance history into a single-campaign
// summary. `history` may be empty (campaign never launched, or no
// monitoring data yet) - every ratio is guarded.
export function computeCampaignTotals(campaign, history = []) {
  const raw = history.reduce(
    (acc, day) => ({
      spend: acc.spend + (day.spend || 0),
      results: acc.results + (day.results || 0),
      impressions: acc.impressions + (day.impressions || 0),
      clicks: acc.clicks + (day.clicks || 0),
      conversionValue: acc.conversionValue + (day.conversionValue || 0),
    }),
    { spend: 0, results: 0, impressions: 0, clicks: 0, conversionValue: 0 }
  );

  return {
    campaignId: campaign.campaignId,
    name: campaign.name,
    status: campaign.status,
    spend: round2(raw.spend),
    results: raw.results,
    impressions: raw.impressions,
    clicks: raw.clicks,
    conversionValue: round2(raw.conversionValue),
    ctr: round2(safeDiv(raw.clicks, raw.impressions) * 100),
    cpc: round2(safeDiv(raw.spend, raw.clicks)),
    costPerResult: round2(safeDiv(raw.spend, raw.results)),
    roas: round2(safeDiv(raw.conversionValue, raw.spend)),
    hasPerformanceData: history.length > 0,
  };
}

// Rolls up per-campaign totals into account-wide totals. averageRoas is
// spend-weighted (total conversion value / total spend across every
// campaign), not a naive average of each campaign's own ROAS - a naive
// average would let a RM10/day campaign's lucky 10x ROAS day outweigh a
// RM10,000/day campaign's steady 2x just because they're both "one campaign".
export function rollUpTotals(campaignTotalsList) {
  const grand = campaignTotalsList.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      results: acc.results + c.results,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversionValue: acc.conversionValue + c.conversionValue,
    }),
    { spend: 0, results: 0, impressions: 0, clicks: 0, conversionValue: 0 }
  );

  return {
    spend: round2(grand.spend),
    results: grand.results,
    impressions: grand.impressions,
    clicks: grand.clicks,
    conversionValue: round2(grand.conversionValue),
    ctr: round2(safeDiv(grand.clicks, grand.impressions) * 100),
    averageCpc: round2(safeDiv(grand.spend, grand.clicks)),
    averageCostPerResult: round2(safeDiv(grand.spend, grand.results)),
    averageRoas: round2(safeDiv(grand.conversionValue, grand.spend)),
  };
}

// Merges every campaign's daily_performance history into one date-keyed
// account-wide time series, for a single chart. `histories` is an array of
// per-campaign history arrays (each oldest-first, per
// firebaseUtils.listPerformanceHistory).
export function buildDailySeries(histories) {
  const byDate = new Map();

  for (const history of histories) {
    for (const day of history) {
      const bucket = byDate.get(day.date) || {
        date: day.date,
        spend: 0,
        results: 0,
        impressions: 0,
        clicks: 0,
        conversionValue: 0,
      };
      bucket.spend += day.spend || 0;
      bucket.results += day.results || 0;
      bucket.impressions += day.impressions || 0;
      bucket.clicks += day.clicks || 0;
      bucket.conversionValue += day.conversionValue || 0;
      byDate.set(day.date, bucket);
    }
  }

  return [...byDate.values()]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((d) => ({
      date: d.date,
      spend: round2(d.spend),
      results: d.results,
      ctr: round2(safeDiv(d.clicks, d.impressions) * 100),
      roas: round2(safeDiv(d.conversionValue, d.spend)),
    }));
}

export function topPerformers(campaignTotalsList, n = 3) {
  return [...campaignTotalsList]
    .filter((c) => c.hasPerformanceData)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, n);
}

export function bottomPerformers(campaignTotalsList, n = 3) {
  return [...campaignTotalsList]
    .filter((c) => c.hasPerformanceData)
    .sort((a, b) => a.roas - b.roas)
    .slice(0, n);
}

// Informational list prices only - no payment processor is integrated (see
// server/docs/BILLING.md). Never presented as an actual invoice/charge.
export const PRICING_TIERS = {
  starter: { label: "Starter", priceRM: 299 },
  professional: { label: "Professional", priceRM: 599 },
  enterprise: { label: "Enterprise", priceRM: 999 },
};

export function planInfo(plan) {
  const key = (plan || "").toLowerCase();
  const resolvedKey = PRICING_TIERS[key] ? key : "starter";
  return { plan: resolvedKey, ...PRICING_TIERS[resolvedKey] };
}

export default {
  computeCampaignTotals,
  rollUpTotals,
  buildDailySeries,
  topPerformers,
  bottomPerformers,
  planInfo,
  PRICING_TIERS,
};
