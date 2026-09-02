import { jest } from "@jest/globals";
import { applyRecommendation, undoRecommendation } from "../src/services/recommendationService.js";

function fakeClient(overrides = {}) {
  return {
    updateCampaign: jest.fn(async () => ({})),
    updateAdSet: jest.fn(async () => ({})),
    getAdSet: jest.fn(async () => ({ bid_strategy: "LOWEST_COST_WITHOUT_CAP", targeting: { age_min: 25, age_max: 45 } })),
    ...overrides,
  };
}

function baseCampaign(overrides = {}) {
  return {
    metaCampaignId: "camp_123",
    metaAdSetId: "adset_456",
    budget: { amount: 100, type: "DAILY" },
    ...overrides,
  };
}

function baseRecommendation(overrides = {}) {
  return {
    type: "BUDGET_INCREASE",
    status: "PENDING",
    action: { targetAdSet: null, currentValue: 100, suggestedValue: 130 },
    ...overrides,
  };
}

describe("applyRecommendation", () => {
  test("BUDGET_INCREASE calls updateCampaign with the suggested value in cents and returns the old RM amount", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = baseRecommendation({ type: "BUDGET_INCREASE" });

    const result = await applyRecommendation({ client, campaign, recommendation });

    expect(client.updateCampaign).toHaveBeenCalledWith("camp_123", { daily_budget: 13000 });
    expect(result.previousValue).toBe(100);
  });

  test("BUDGET_DECREASE on a LIFETIME budget updates lifetime_budget instead of daily_budget", async () => {
    const client = fakeClient();
    const campaign = baseCampaign({ budget: { amount: 200, type: "LIFETIME" } });
    const recommendation = baseRecommendation({ type: "BUDGET_DECREASE", action: { suggestedValue: 150 } });

    await applyRecommendation({ client, campaign, recommendation });

    expect(client.updateCampaign).toHaveBeenCalledWith("camp_123", { lifetime_budget: 15000 });
  });

  test("PAUSE_ADSET falls back to campaign.metaAdSetId when action.targetAdSet is null", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = baseRecommendation({ type: "PAUSE_ADSET", action: {} });

    const result = await applyRecommendation({ client, campaign, recommendation });

    expect(client.updateAdSet).toHaveBeenCalledWith("adset_456", { status: "PAUSED" });
    expect(result.previousValue).toBe("ACTIVE");
  });

  test("PAUSE_ADSET throws when neither the recommendation nor the campaign has an ad set", async () => {
    const client = fakeClient();
    const campaign = baseCampaign({ metaAdSetId: null });
    const recommendation = baseRecommendation({ type: "PAUSE_ADSET", action: {} });

    await expect(applyRecommendation({ client, campaign, recommendation })).rejects.toThrow(
      /No Meta ad set/
    );
  });

  test("EXPAND_AUDIENCE widens age range by 5 years each side, clamped to 13-65, and records the old range", async () => {
    const client = fakeClient({
      getAdSet: jest.fn(async () => ({ targeting: { age_min: 15, age_max: 62 } })),
    });
    const campaign = baseCampaign();
    const recommendation = baseRecommendation({ type: "EXPAND_AUDIENCE", action: {} });

    const result = await applyRecommendation({ client, campaign, recommendation });

    expect(client.updateAdSet).toHaveBeenCalledWith(
      "adset_456",
      expect.objectContaining({ targeting: expect.objectContaining({ age_min: 13, age_max: 65 }) })
    );
    expect(result.previousValue).toEqual({ age_min: 15, age_max: 62 });
  });

  test("CHANGE_BIDDING reads the current bid_strategy before overwriting it", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = baseRecommendation({
      type: "CHANGE_BIDDING",
      action: { suggestedValue: "COST_CAP" },
    });

    const result = await applyRecommendation({ client, campaign, recommendation });

    expect(client.updateAdSet).toHaveBeenCalledWith("adset_456", { bid_strategy: "COST_CAP" });
    expect(result.previousValue).toBe("LOWEST_COST_WITHOUT_CAP");
  });

  test("REFRESH_CREATIVE always throws - it can't be auto-applied", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = baseRecommendation({ type: "REFRESH_CREATIVE" });

    await expect(applyRecommendation({ client, campaign, recommendation })).rejects.toThrow(
      /can't be auto-applied/
    );
    expect(client.updateAdSet).not.toHaveBeenCalled();
    expect(client.updateCampaign).not.toHaveBeenCalled();
  });

  test("an unknown type throws", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = baseRecommendation({ type: "NOT_A_REAL_TYPE" });

    await expect(applyRecommendation({ client, campaign, recommendation })).rejects.toThrow(
      /Unknown recommendation type/
    );
  });
});

describe("undoRecommendation", () => {
  function appliedRecommendation(overrides = {}) {
    return baseRecommendation({
      status: "APPLIED",
      appliedAt: new Date(),
      action: { targetAdSet: null, previousValue: 100 },
      ...overrides,
    });
  }

  test("rejects a recommendation that isn't APPLIED", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = baseRecommendation({ status: "PENDING" });

    await expect(undoRecommendation({ client, campaign, recommendation })).rejects.toThrow(
      /Only an APPLIED recommendation/
    );
  });

  test("rejects once the 24-hour undo window has passed", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const recommendation = appliedRecommendation({ appliedAt: twentyFiveHoursAgo });

    await expect(undoRecommendation({ client, campaign, recommendation })).rejects.toThrow(
      /undo window/
    );
  });

  test("rejects when no previousValue was recorded", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = appliedRecommendation({ action: { targetAdSet: null, previousValue: null } });

    await expect(undoRecommendation({ client, campaign, recommendation })).rejects.toThrow(
      /No previous value/
    );
  });

  test("BUDGET_INCREASE undo restores the previous RM amount in cents", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = appliedRecommendation({ type: "BUDGET_INCREASE" });

    await undoRecommendation({ client, campaign, recommendation });

    expect(client.updateCampaign).toHaveBeenCalledWith("camp_123", { daily_budget: 10000 });
  });

  test("PAUSE_ADSET undo restores the recorded previous status", async () => {
    const client = fakeClient();
    const campaign = baseCampaign();
    const recommendation = appliedRecommendation({
      type: "PAUSE_ADSET",
      action: { targetAdSet: null, previousValue: "ACTIVE" },
    });

    await undoRecommendation({ client, campaign, recommendation });

    expect(client.updateAdSet).toHaveBeenCalledWith("adset_456", { status: "ACTIVE" });
  });

  test("EXPAND_AUDIENCE undo merges the previous age range back into current targeting", async () => {
    const client = fakeClient({
      getAdSet: jest.fn(async () => ({ targeting: { age_min: 13, age_max: 65, geo_locations: { countries: ["MY"] } } })),
    });
    const campaign = baseCampaign();
    const recommendation = appliedRecommendation({
      type: "EXPAND_AUDIENCE",
      action: { targetAdSet: null, previousValue: { age_min: 18, age_max: 55 } },
    });

    await undoRecommendation({ client, campaign, recommendation });

    expect(client.updateAdSet).toHaveBeenCalledWith(
      "adset_456",
      expect.objectContaining({
        targeting: expect.objectContaining({ age_min: 18, age_max: 55, geo_locations: { countries: ["MY"] } }),
      })
    );
  });
});
