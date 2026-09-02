import { centsFromRM } from "../utils/currency.js";

const UNDO_WINDOW_MS = 24 * 60 * 60 * 1000;

function requireAdSet(recommendation, campaign) {
  const adSetId = recommendation.action?.targetAdSet || campaign.metaAdSetId;
  if (!adSetId) {
    throw new Error("No Meta ad set is associated with this campaign");
  }
  return adSetId;
}

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate(); // Firestore Timestamp
  return new Date(value);
}

// Applies one PENDING recommendation to the real Meta campaign/ad set.
// `client` is a MetaApiClient instance (or a test double with the same
// method shape) - passed in rather than constructed here so this stays
// testable without live Meta credentials. Returns whatever should be merged
// into the recommendation's `action.previousValue` for a later undo.
export async function applyRecommendation({ client, campaign, recommendation }) {
  switch (recommendation.type) {
    case "BUDGET_INCREASE":
    case "BUDGET_DECREASE": {
      const previousValue = campaign.budget.amount;
      const cents = centsFromRM(recommendation.action.suggestedValue);
      const isDaily = (campaign.budget.type || "DAILY") === "DAILY";
      await client.updateCampaign(
        campaign.metaCampaignId,
        isDaily ? { daily_budget: cents } : { lifetime_budget: cents }
      );
      return { previousValue, metaCampaignId: campaign.metaCampaignId };
    }

    case "PAUSE_ADSET": {
      const adSetId = requireAdSet(recommendation, campaign);
      await client.updateAdSet(adSetId, { status: "PAUSED" });
      return { previousValue: "ACTIVE", adSetId };
    }

    case "EXPAND_AUDIENCE": {
      const adSetId = requireAdSet(recommendation, campaign);
      const current = await client.getAdSet(adSetId, "targeting");
      const targeting = current.targeting || {};
      const previousValue = { age_min: targeting.age_min, age_max: targeting.age_max };
      const expanded = {
        ...targeting,
        age_min: Math.max(13, (targeting.age_min || 18) - 5),
        age_max: Math.min(65, (targeting.age_max || 65) + 5),
      };
      await client.updateAdSet(adSetId, { targeting: expanded });
      return { previousValue, adSetId, expanded: { age_min: expanded.age_min, age_max: expanded.age_max } };
    }

    case "CHANGE_BIDDING": {
      const adSetId = requireAdSet(recommendation, campaign);
      const current = await client.getAdSet(adSetId, "bid_strategy");
      const previousValue = current.bid_strategy || null;
      await client.updateAdSet(adSetId, { bid_strategy: recommendation.action.suggestedValue });
      return { previousValue, adSetId };
    }

    case "REFRESH_CREATIVE":
      throw new Error(
        "REFRESH_CREATIVE can't be auto-applied - it requires new creative assets. Update the ad creative manually, then reject this recommendation."
      );

    default:
      throw new Error(`Unknown recommendation type: ${recommendation.type}`);
  }
}

// Reverses an APPLIED recommendation using the previousValue captured at
// apply time. Only allowed within a 24-hour window, matching the "undo
// recent changes" success criterion.
export async function undoRecommendation({ client, campaign, recommendation }) {
  if (recommendation.status !== "APPLIED") {
    throw new Error(`Only an APPLIED recommendation can be undone (this one is ${recommendation.status})`);
  }

  const appliedAt = toDate(recommendation.appliedAt);
  if (!appliedAt || Date.now() - appliedAt.getTime() > UNDO_WINDOW_MS) {
    throw new Error("The 24-hour undo window for this recommendation has expired");
  }

  const previousValue = recommendation.action?.previousValue;
  if (previousValue === undefined || previousValue === null) {
    throw new Error("No previous value was recorded for this recommendation - cannot undo");
  }

  switch (recommendation.type) {
    case "BUDGET_INCREASE":
    case "BUDGET_DECREASE": {
      const cents = centsFromRM(previousValue);
      const isDaily = (campaign.budget.type || "DAILY") === "DAILY";
      await client.updateCampaign(
        campaign.metaCampaignId,
        isDaily ? { daily_budget: cents } : { lifetime_budget: cents }
      );
      return;
    }

    case "PAUSE_ADSET": {
      const adSetId = requireAdSet(recommendation, campaign);
      await client.updateAdSet(adSetId, { status: previousValue });
      return;
    }

    case "EXPAND_AUDIENCE": {
      const adSetId = requireAdSet(recommendation, campaign);
      const current = await client.getAdSet(adSetId, "targeting");
      const targeting = { ...(current.targeting || {}), ...previousValue };
      await client.updateAdSet(adSetId, { targeting });
      return;
    }

    case "CHANGE_BIDDING": {
      const adSetId = requireAdSet(recommendation, campaign);
      await client.updateAdSet(adSetId, { bid_strategy: previousValue });
      return;
    }

    default:
      throw new Error(`Cannot undo recommendation type: ${recommendation.type}`);
  }
}

export default { applyRecommendation, undoRecommendation };
