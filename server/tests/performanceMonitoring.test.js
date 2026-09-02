import { computePerformanceMetrics, computeTrend } from "../src/utils/performanceMetrics.js";

describe("computePerformanceMetrics", () => {
  test("derives ctr/cpc/costPerResult/roas from raw Meta insights", () => {
    const metrics = computePerformanceMetrics({
      spend: 100,
      impressions: 10000,
      clicks: 200,
      results: 10,
      reach: 8000,
      frequency: 1.25,
      conversionValue: 350,
    });

    expect(metrics.spend).toBe(100);
    expect(metrics.ctr).toBe(2); // 200/10000 * 100
    expect(metrics.cpc).toBe(0.5); // 100/200
    expect(metrics.costPerResult).toBe(10); // 100/10
    expect(metrics.roas).toBe(3.5); // 350/100
    expect(metrics.reach).toBe(8000);
    expect(metrics.frequency).toBe(1.25);
  });

  test("guards zero impressions/clicks/spend/results instead of producing NaN/Infinity", () => {
    const metrics = computePerformanceMetrics({
      spend: 0,
      impressions: 0,
      clicks: 0,
      results: 0,
    });

    expect(metrics.ctr).toBe(0);
    expect(metrics.cpc).toBe(0);
    expect(metrics.costPerResult).toBe(0);
    expect(metrics.roas).toBe(0);
    expect(Number.isFinite(metrics.ctr)).toBe(true);
    expect(Number.isFinite(metrics.cpc)).toBe(true);
  });

  test("does not fabricate a qualityScore", () => {
    const metrics = computePerformanceMetrics({ spend: 50, impressions: 1000, clicks: 10 });
    expect(metrics.qualityScore).toBeNull();
  });

  test("defaults missing fields to zero", () => {
    const metrics = computePerformanceMetrics({});
    expect(metrics.spend).toBe(0);
    expect(metrics.impressions).toBe(0);
    expect(metrics.results).toBe(0);
  });
});

describe("computeTrend", () => {
  test("returns nulls when there is no prior day", () => {
    const trend = computeTrend({ spend: 100, ctr: 2, cpc: 0.5, roas: 3 }, null);
    expect(trend).toEqual({
      spend_change: null,
      ctr_change: null,
      cpc_change: null,
      roas_change: null,
    });
  });

  test("computes percent change vs. yesterday", () => {
    const trend = computeTrend(
      { spend: 120, ctr: 2.5, cpc: 0.4, roas: 4 },
      { spend: 100, ctr: 2, cpc: 0.5, roas: 3.5 }
    );
    expect(trend.spend_change).toBe(20);
    expect(trend.ctr_change).toBe(25);
    expect(trend.cpc_change).toBe(-20);
    expect(trend.roas_change).toBeCloseTo(14.29, 1);
  });

  test("guards a zero previous value instead of dividing by zero", () => {
    const trend = computeTrend({ spend: 50, ctr: 1, cpc: 1, roas: 1 }, { spend: 0, ctr: 0, cpc: 0, roas: 0 });
    expect(trend.spend_change).toBeNull();
    expect(trend.ctr_change).toBeNull();
  });
});
