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
    const { name, objective, status = "PAUSED" } = campaignData;

    const result = await this.request("post", `/act_${this.adAccountId}/campaigns`, {
      params: { name, objective, status },
    });

    return { campaignId: result.id, status };
  }

  async updateCampaign(campaignId, updates) {
    return this.request("post", `/${campaignId}`, { params: updates });
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
