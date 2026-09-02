import {
  computeCampaignTotals,
  rollUpTotals,
  buildDailySeries,
  topPerformers,
  bottomPerformers,
  planInfo,
} from "../src/utils/analyticsMath.js";

function campaign(overrides = {}) {
  return { campaignId: "c1", name: "Test Campaign", status: "ACTIVE", ...overrides };
}

describe("computeCampaignTotals", () => {
  test("sums a history and derives ratios", () => {
    const history = [
      { date: "2026-08-01", spend: 100, results: 5, impressions: 10000, clicks: 200, conversionValue: 300 },
      { date: "2026-08-02", spend: 120, results: 6, impressions: 11000, clicks: 220, conversionValue: 360 },
    ];
    const totals = computeCampaignTotals(campaign(), history);
    expect(totals.spend).toBe(220);
    expect(totals.results).toBe(11);
    expect(totals.impressions).toBe(21000);
    expect(totals.clicks).toBe(420);
    expect(totals.conversionValue).toBe(660);
    expect(totals.ctr).toBeCloseTo(2, 1);
    expect(totals.cpc).toBeCloseTo(0.52, 1);
    expect(totals.costPerResult).toBeCloseTo(20, 1);
    expect(totals.roas).toBe(3);
    expect(totals.hasPerformanceData).toBe(true);
  });

  test("guards an empty history instead of NaN, and flags no data", () => {
    const totals = computeCampaignTotals(campaign(), []);
    expect(totals.spend).toBe(0);
    expect(totals.ctr).toBe(0);
    expect(totals.cpc).toBe(0);
    expect(totals.roas).toBe(0);
    expect(totals.hasPerformanceData).toBe(false);
  });
});

describe("rollUpTotals", () => {
  test("averageRoas is spend-weighted, not a naive average of each campaign's ROAS", () => {
    // Campaign A: tiny spend, huge ROAS. Campaign B: huge spend, modest ROAS.
    // A naive average((10+2)/2) = 6x would wildly overstate account performance.
    const a = computeCampaignTotals(campaign({ campaignId: "a" }), [
      { date: "d", spend: 1, results: 1, impressions: 100, clicks: 10, conversionValue: 10 },
    ]);
    const b = computeCampaignTotals(campaign({ campaignId: "b" }), [
      { date: "d", spend: 10000, results: 500, impressions: 1000000, clicks: 20000, conversionValue: 20000 },
    ]);
    const totals = rollUpTotals([a, b]);
    // (10 + 20000) / (1 + 10000) ≈ 2.0
    expect(totals.averageRoas).toBeCloseTo(2.0, 1);
    expect(totals.spend).toBe(10001);
    expect(totals.conversionValue).toBe(20010);
  });

  test("guards zero spend across all campaigns", () => {
    const totals = rollUpTotals([computeCampaignTotals(campaign(), [])]);
    expect(totals.averageRoas).toBe(0);
    expect(totals.averageCpc).toBe(0);
  });
});

describe("buildDailySeries", () => {
  test("merges multiple campaigns' histories by date", () => {
    const historyA = [{ date: "2026-08-01", spend: 100, results: 5, impressions: 10000, clicks: 200, conversionValue: 200 }];
    const historyB = [{ date: "2026-08-01", spend: 50, results: 2, impressions: 5000, clicks: 100, conversionValue: 100 }];
    const series = buildDailySeries([historyA, historyB]);
    expect(series).toHaveLength(1);
    expect(series[0].date).toBe("2026-08-01");
    expect(series[0].spend).toBe(150);
    expect(series[0].results).toBe(7);
    expect(series[0].roas).toBe(2); // 300/150
  });

  test("returns dates sorted ascending", () => {
    const historyA = [
      { date: "2026-08-03", spend: 10, results: 1, impressions: 100, clicks: 5, conversionValue: 10 },
      { date: "2026-08-01", spend: 10, results: 1, impressions: 100, clicks: 5, conversionValue: 10 },
    ];
    const series = buildDailySeries([historyA]);
    expect(series.map((d) => d.date)).toEqual(["2026-08-01", "2026-08-03"]);
  });

  test("returns an empty array for no campaigns/history", () => {
    expect(buildDailySeries([])).toEqual([]);
    expect(buildDailySeries([[]])).toEqual([]);
  });
});

describe("topPerformers / bottomPerformers", () => {
  const withData = (id, roas) =>
    computeCampaignTotals(campaign({ campaignId: id }), [
      { date: "d", spend: 100, results: 5, impressions: 1000, clicks: 50, conversionValue: 100 * roas },
    ]);
  const withoutData = computeCampaignTotals(campaign({ campaignId: "draft" }), []);

  test("excludes campaigns with no performance data", () => {
    const list = [withData("a", 3), withoutData];
    expect(topPerformers(list)).toHaveLength(1);
    expect(bottomPerformers(list)).toHaveLength(1);
  });

  test("sorts top by ROAS descending and bottom ascending, capped at n", () => {
    const list = [withData("a", 1), withData("b", 5), withData("c", 3)];
    expect(topPerformers(list, 2).map((c) => c.campaignId)).toEqual(["b", "c"]);
    expect(bottomPerformers(list, 2).map((c) => c.campaignId)).toEqual(["a", "c"]);
  });
});

describe("planInfo", () => {
  test("returns the matching tier", () => {
    expect(planInfo("professional")).toEqual({ plan: "professional", label: "Professional", priceRM: 599 });
  });

  test("is case-insensitive", () => {
    expect(planInfo("ENTERPRISE").priceRM).toBe(999);
  });

  test("defaults to starter for an unknown/missing plan", () => {
    expect(planInfo(undefined).plan).toBe("starter");
    expect(planInfo("made-up-tier").plan).toBe("starter");
  });
});
