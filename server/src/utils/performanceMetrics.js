// Pure metric math for daily campaign performance - deliberately has zero
// dependency on firebase-admin/Meta so it (and its tests) never pull in the
// firebase-admin/auth -> jwks-rsa -> jose chain, which breaks under Jest's
// --experimental-vm-modules ESM mode ("Must use import to load ES Module").

// Derives the metrics this codebase stores from Meta's raw insights payload
// (MetaApiClient.getCampaignPerformance's return shape). Guards every
// division so a zero-impression/zero-click/zero-spend day never produces
// Infinity/NaN in Firestore.
export function computePerformanceMetrics(raw) {
  const spend = Number(raw.spend || 0);
  const impressions = Number(raw.impressions || 0);
  const clicks = Number(raw.clicks || 0);
  const results = Number(raw.results || 0);
  const reach = Number(raw.reach || 0);
  const frequency = Number(raw.frequency || 0);
  const conversionValue = Number(raw.conversionValue || 0);

  return {
    spend,
    impressions,
    clicks,
    ctr: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
    cpc: clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0,
    results,
    costPerResult: results > 0 ? Number((spend / results).toFixed(2)) : 0,
    frequency,
    reach,
    conversionValue,
    roas: spend > 0 ? Number((conversionValue / spend).toFixed(2)) : 0,
    // Meta's campaign-level insights fields we request don't include a
    // quality score - reserved in the schema, left unpopulated rather than
    // faked with a constant.
    qualityScore: null,
  };
}

function percentChange(curr, prev) {
  if (!prev) return null;
  return Number((((curr - prev) / prev) * 100).toFixed(2));
}

export function computeTrend(today, yesterday) {
  if (!yesterday) {
    return { spend_change: null, ctr_change: null, cpc_change: null, roas_change: null };
  }
  return {
    spend_change: percentChange(today.spend, yesterday.spend),
    ctr_change: percentChange(today.ctr, yesterday.ctr),
    cpc_change: percentChange(today.cpc, yesterday.cpc),
    roas_change: percentChange(today.roas, yesterday.roas),
  };
}

export function previousDateString(dateString) {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split("T")[0];
}

export default { computePerformanceMetrics, computeTrend, previousDateString };
