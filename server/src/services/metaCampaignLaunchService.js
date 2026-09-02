import { centsFromRM } from "../utils/currency.js";

const CTA_MAP = {
  "Learn More": "LEARN_MORE",
  "Sign Up": "SIGN_UP",
  "Get Started": "GET_STARTED",
  "Buy Now": "SHOP_NOW",
  "Shop Now": "SHOP_NOW",
  "Contact Us": "CONTACT_US",
};

const OBJECTIVE_TO_OPTIMIZATION_GOAL = {
  CONVERSIONS: "OFFSITE_CONVERSIONS",
  LEADS: "LEAD_GENERATION",
  TRAFFIC: "LINK_CLICKS",
  AWARENESS: "REACH",
};

export function buildTargeting(audience, resolvedInterests = []) {
  const targeting = {
    age_min: audience.ageMin || 18,
    age_max: audience.ageMax || 65,
    geo_locations: { countries: [audience.country || "MY"] },
  };
  if (resolvedInterests.length > 0) {
    targeting.flexible_spec = [
      { interests: resolvedInterests.map(({ id, name }) => ({ id, name })) },
    ];
  }
  return targeting;
}

// Creates the real Campaign + AdSet (+ Ad, only if a Facebook Page ID is
// supplied) on Meta's Marketing API. Everything is created PAUSED - Meta ad
// creation is billed the moment a campaign goes ACTIVE, so we never
// auto-activate; the user flips it on from Meta Ads Manager.
//
// A creative Ad requires object_story_spec.page_id, which this codebase does
// not yet collect anywhere (no Facebook Page connection flow exists). When
// pageId is omitted, Campaign + AdSet are still created for real - only the
// Ad/creative step is skipped, and the caller is told via adCreated: false.
export async function launchCampaignOnMeta({ client, campaign, creative, pageId }) {
  const budgetCents = centsFromRM(campaign.budget.amount);
  const isDaily = (campaign.budget.type || "DAILY") === "DAILY";

  const { campaignId: metaCampaignId } = await client.createCampaign({
    name: campaign.name,
    objective: campaign.objective,
    status: "PAUSED",
    dailyBudgetCents: isDaily ? budgetCents : undefined,
    lifetimeBudgetCents: !isDaily ? budgetCents : undefined,
  });

  const resolvedInterests = await client.resolveInterests(campaign.audience.interests || []);
  const targeting = buildTargeting(campaign.audience, resolvedInterests);

  const { adSetId: metaAdSetId } = await client.createAdSet({
    name: `${campaign.name} - Ad Set 1`,
    campaignId: metaCampaignId,
    status: "PAUSED",
    optimizationGoal: OBJECTIVE_TO_OPTIMIZATION_GOAL[campaign.objective] || "LINK_CLICKS",
    targeting,
  });

  let metaAdId = null;
  if (pageId && creative) {
    const { creativeId } = await client.createAdCreative({
      name: `${campaign.name} - Creative 1`,
      pageId,
      message: creative.primaryText,
      headline: creative.headline,
      description: creative.description,
      link: campaign.productInfo?.landingPageUrl,
      callToAction: CTA_MAP[creative.cta] || "LEARN_MORE",
    });

    const ad = await client.createAd({
      name: `${campaign.name} - Ad 1`,
      adSetId: metaAdSetId,
      creativeId,
      status: "PAUSED",
    });
    metaAdId = ad.adId;
  }

  return {
    metaCampaignId,
    metaAdSetId,
    metaAdId,
    resolvedInterests: resolvedInterests.map((i) => i.name),
    adCreated: Boolean(metaAdId),
  };
}

export default { launchCampaignOnMeta, buildTargeting };
