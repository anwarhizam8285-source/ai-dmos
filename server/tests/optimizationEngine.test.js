import {
  averageMetrics,
  calculateTrends,
  validateRecommendations,
} from "../src/services/optimizationEngineService.js";

function validRecommendation(overrides = {}) {
  return {
    type: "BUDGET_INCREASE",
    title: "Increase budget on the top performer",
    description: "ROAS has been climbing for 3 days straight.",
    priority: 4,
    action: {
      targetAdSet: "120001",
      currentValue: 100,
      suggestedValue: 130,
      changePercent: 30,
      rationale: "ROAS trend is positive and CPC is falling.",
    },
    expectedImpact: { metric: "ROAS", change: "+10%", confidence: "MEDIUM" },
    ...overrides,
  };
}

describe("averageMetrics", () => {
  test("returns null for an empty history", () => {
    expect(averageMetrics([])).toBeNull();
    expect(averageMetrics(undefined)).toBeNull();
  });

  test("averages spend/impressions/clicks/results/roas and derives ctr/cpc/costPerResult", () => {
    const history = [
      { spend: 100, impressions: 10000, clicks: 200, results: 10, roas: 3 },
      { spend: 120, impressions: 11000, clicks: 220, results: 12, roas: 3.5 },
    ];
    const avg = averageMetrics(history);
    expect(avg.spend).toBe(110);
    expect(avg.impressions).toBe(10500);
    expect(avg.clicks).toBe(210);
    expect(avg.results).toBe(11);
    expect(avg.roas).toBe(3.25);
    expect(avg.ctr).toBeCloseTo(2, 1); // 420/21000*100
    expect(avg.cpc).toBeCloseTo(0.52, 1); // 220/420
  });

  test("guards a zero-impression/zero-click day instead of NaN", () => {
    const avg = averageMetrics([{ spend: 0, impressions: 0, clicks: 0, results: 0, roas: 0 }]);
    expect(avg.ctr).toBe(0);
    expect(avg.cpc).toBe(0);
    expect(avg.costPerResult).toBe(0);
  });
});

describe("calculateTrends", () => {
  test("returns zeroed trends with fewer than 2 days", () => {
    expect(calculateTrends([])).toEqual({ ctr: 0, cpc: 0, roas: 0 });
    expect(calculateTrends([{ ctr: 2, cpc: 0.5, roas: 3 }])).toEqual({ ctr: 0, cpc: 0, roas: 0 });
  });

  test("computes percent change between the first and last day (oldest-first history)", () => {
    const history = [
      { ctr: 2, cpc: 0.5, roas: 3 },
      { ctr: 2.2, cpc: 0.6, roas: 2.8 },
      { ctr: 2.5, cpc: 0.4, roas: 3.6 },
    ];
    const trends = calculateTrends(history);
    expect(trends.ctr).toBe(25); // (2.5-2)/2*100
    expect(trends.cpc).toBe(-20); // (0.4-0.5)/0.5*100
    expect(trends.roas).toBe(20); // (3.6-3)/3*100
  });
});

describe("validateRecommendations", () => {
  test("accepts a well-formed recommendation array", () => {
    expect(validateRecommendations([validRecommendation()])).toBe(true);
  });

  test("rejects a non-array payload", () => {
    expect(() => validateRecommendations({})).toThrow(/must be an array/);
  });

  test("rejects an empty array", () => {
    expect(() => validateRecommendations([])).toThrow(/at least 1 recommendation/);
  });

  test("rejects an unknown type", () => {
    expect(() => validateRecommendations([validRecommendation({ type: "DELETE_EVERYTHING" })])).toThrow(
      /Invalid or unknown recommendation type/
    );
  });

  test("rejects a recommendation missing title/description/action", () => {
    const rec = validRecommendation();
    delete rec.description;
    expect(() => validateRecommendations([rec])).toThrow(/missing title, description, or action/);
  });

  test("rejects a priority outside 1-5", () => {
    expect(() => validateRecommendations([validRecommendation({ priority: 9 })])).toThrow(
      /priority between 1 and 5/
    );
  });

  test("rejects a missing expectedImpact", () => {
    const rec = validRecommendation();
    delete rec.expectedImpact;
    expect(() => validateRecommendations([rec])).toThrow(/missing expectedImpact/);
  });
});
