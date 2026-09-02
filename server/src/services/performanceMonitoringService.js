import { MetaApiClient } from "./metaAdsApiClient.js";
import { getDecryptedAccessToken } from "./metaAuthService.js";
import {
  getMetaToken,
  saveDailyPerformance,
  getDailyPerformance,
  listCompanies,
  listActiveCampaignsWithMeta,
} from "../utils/firebaseUtils.js";
import { computePerformanceMetrics, computeTrend, previousDateString } from "../utils/performanceMetrics.js";

export { computePerformanceMetrics, computeTrend };

// Pulls one day of Meta Insights for a single campaign and stores the
// derived metrics + trend-vs-yesterday in Firestore.
export async function monitorCampaignPerformance({ client, companyId, campaignId, metaCampaignId, date }) {
  const targetDate = date || new Date().toISOString().split("T")[0];

  const raw = await client.getCampaignPerformance(metaCampaignId, {
    since: targetDate,
    until: targetDate,
  });
  const metrics = computePerformanceMetrics(raw);

  const yesterday = await getDailyPerformance(companyId, campaignId, previousDateString(targetDate));
  const vs_yesterday = computeTrend(metrics, yesterday);

  const record = { date: targetDate, ...metrics, vs_yesterday };
  await saveDailyPerformance(companyId, campaignId, targetDate, record);
  return record;
}

// Loops every company with a valid Meta connection and every ACTIVE campaign
// that's actually been launched on Meta. One campaign failing (rate limit,
// revoked token, deleted campaign) never stops the rest - failures are
// collected and returned, not thrown.
export async function runDailyPerformanceMonitoring(date) {
  const summary = { monitored: 0, skippedCompanies: 0, failed: 0, errors: [] };

  const companies = await listCompanies();

  for (const company of companies) {
    const companyId = company.companyId;

    let accessToken;
    try {
      accessToken = await getDecryptedAccessToken(companyId);
    } catch {
      accessToken = null;
    }
    if (!accessToken) {
      summary.skippedCompanies++;
      continue;
    }

    const metaToken = await getMetaToken(companyId);
    const client = new MetaApiClient(accessToken, metaToken?.metaAdAccountId);

    const campaigns = await listActiveCampaignsWithMeta(companyId);
    for (const campaign of campaigns) {
      try {
        await monitorCampaignPerformance({
          client,
          companyId,
          campaignId: campaign.campaignId,
          metaCampaignId: campaign.metaCampaignId,
          date,
        });
        summary.monitored++;
      } catch (error) {
        summary.failed++;
        summary.errors.push({ companyId, campaignId: campaign.campaignId, message: error.message });
        console.error(`Performance monitoring failed for ${companyId}/${campaign.campaignId}:`, error.message);
      }
    }
  }

  return summary;
}

export default { monitorCampaignPerformance, runDailyPerformanceMonitoring };
