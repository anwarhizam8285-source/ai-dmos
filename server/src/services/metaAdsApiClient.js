import axios from "axios";
import { META_GRAPH_BASE_URL } from "../config/metaApiConfig.js";

const MAX_RETRIES = 3;
const RETRY_STATUS_CODES = new Set([429, 500, 502, 503]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toApiError(error) {
  const status = error.response?.status;
  const fbError = error.response?.data?.error;
  const message = fbError?.message || error.message || "Meta API request failed";

  const err = new Error(message);
  err.status = status || 500;
  err.code = fbError?.code;
  err.type = fbError?.type;
  return err;
}

export class MetaApiClient {
  constructor(accessToken, adAccountId) {
    if (!accessToken) {
      throw new Error("MetaApiClient requires an accessToken");
    }
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
  }

  async request(method, path, { params = {}, data = null } = {}, attempt = 1) {
    try {
      const response = await axios({
        method,
        url: `${META_GRAPH_BASE_URL}${path}`,
        params: { access_token: this.accessToken, ...params },
        data,
      });
      return response.data;
    } catch (error) {
      const status = error.response?.status;

      if (RETRY_STATUS_CODES.has(status) && attempt < MAX_RETRIES) {
        const backoffMs = 2 ** attempt * 500;
        await sleep(backoffMs);
        return this.request(method, path, { params, data }, attempt + 1);
      }

      throw toApiError(error);
    }
  }

  async getMe() {
    return this.request("get", "/me", { params: { fields: "id,name" } });
  }

  async getAdAccounts() {
    const result = await this.request("get", "/me/adaccounts", {
      params: { fields: "id,account_id,name,currency,account_status" },
    });
    return result.data || [];
  }

  async getCampaign(campaignId, fields = "id,name,objective,status,effective_status") {
    return this.request("get", `/${campaignId}`, { params: { fields } });
  }

  async createCampaign(campaignData) {
    if (!this.adAccountId) {
      throw new Error("MetaApiClient requires an adAccountId to create campaigns");
    }
    const {
      name,
      objective,
      status = "PAUSED",
      dailyBudgetCents,
      lifetimeBudgetCents,
      specialAdCategories = [],
    } = campaignData;

    const params = {
      name,
      objective,
      status,
      special_ad_categories: JSON.stringify(specialAdCategories),
    };
    // Campaign-level budget = Campaign Budget Optimization (CBO). Meta requires
    // exactly one of daily_budget / lifetime_budget, in the account currency's
    // smallest unit (cents for RM).
    if (dailyBudgetCents) params.daily_budget = dailyBudgetCents;
    else if (lifetimeBudgetCents) params.lifetime_budget = lifetimeBudgetCents;

    const result = await this.request("post", `/act_${this.adAccountId}/campaigns`, { params });

    return { campaignId: result.id, status };
  }

  async updateCampaign(campaignId, updates) {
    return this.request("post", `/${campaignId}`, { params: updates });
  }

  // Resolves free-text interest names to Meta targeting interest IDs. Meta's
  // ad set targeting API requires IDs, not names - unresolved names are dropped
  // rather than failing the whole campaign.
  async resolveInterests(names = []) {
    const results = await Promise.all(
      names.map(async (name) => {
        try {
          const result = await this.request("get", "/search", {
            params: { type: "adinterest", q: name, limit: 1 },
          });
          const match = result.data?.[0];
          return match ? { id: match.id, name: match.name } : null;
        } catch {
          return null;
        }
      })
    );
    return results.filter(Boolean);
  }

  async createAdSet(adSetData) {
    if (!this.adAccountId) {
      throw new Error("MetaApiClient requires an adAccountId to create ad sets");
    }
    const {
      name,
      campaignId,
      status = "PAUSED",
      billingEvent = "IMPRESSIONS",
      optimizationGoal = "OFFSITE_CONVERSIONS",
      bidStrategy = "LOWEST_COST_WITHOUT_CAP",
      targeting,
      dailyBudgetCents,
      lifetimeBudgetCents,
      promotedObject,
    } = adSetData;

    const params = {
      name,
      campaign_id: campaignId,
      status,
      billing_event: billingEvent,
      optimization_goal: optimizationGoal,
      bid_strategy: bidStrategy,
      targeting: JSON.stringify(targeting),
    };
    // Only set here if the campaign itself isn't using CBO.
    if (dailyBudgetCents) params.daily_budget = dailyBudgetCents;
    if (lifetimeBudgetCents) params.lifetime_budget = lifetimeBudgetCents;
    if (promotedObject) params.promoted_object = JSON.stringify(promotedObject);

    const result = await this.request("post", `/act_${this.adAccountId}/adsets`, { params });
    return { adSetId: result.id, status };
  }

  async createAdCreative({ name, pageId, message, headline, description, link, callToAction }) {
    if (!this.adAccountId) {
      throw new Error("MetaApiClient requires an adAccountId to create ad creatives");
    }
    const objectStorySpec = {
      page_id: pageId,
      link_data: {
        message,
        link,
        name: headline,
        description,
        call_to_action: { type: callToAction },
      },
    };

    const result = await this.request("post", `/act_${this.adAccountId}/adcreatives`, {
      params: { name, object_story_spec: JSON.stringify(objectStorySpec) },
    });
    return { creativeId: result.id };
  }

  async createAd({ name, adSetId, creativeId, status = "PAUSED" }) {
    if (!this.adAccountId) {
      throw new Error("MetaApiClient requires an adAccountId to create ads");
    }
    const result = await this.request("post", `/act_${this.adAccountId}/ads`, {
      params: {
        name,
        adset_id: adSetId,
        creative: JSON.stringify({ creative_id: creativeId }),
        status,
      },
    });
    return { adId: result.id, status };
  }

  async getCampaignPerformance(campaignId, dateRange = {}) {
    const { since, until } = dateRange;
    const params = {
      fields: "spend,impressions,clicks,ctr,cpc,frequency,reach,actions",
    };
    if (since && until) {
      params.time_range = JSON.stringify({ since, until });
    }

    const result = await this.request("get", `/${campaignId}/insights`, { params });
    const row = result.data?.[0] || {};

    return {
      spend: Number(row.spend || 0),
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
      ctr: Number(row.ctr || 0),
      cpc: Number(row.cpc || 0),
      reach: Number(row.reach || 0),
      frequency: Number(row.frequency || 0),
      results: (row.actions || []).reduce((sum, a) => sum + Number(a.value || 0), 0),
    };
  }
}

export default MetaApiClient;
