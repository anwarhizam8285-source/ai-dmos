import { validateGeneratedCampaign } from "../src/services/campaignGeneratorService.js";

function validGeneratedCampaign(overrides = {}) {
  return {
    campaignName: "Q4 Product Launch",
    objective: "CONVERSIONS",
    adCopyVariations: [
      { id: "copy_1", primaryText: "Try it today", headline: "New Tool", description: "Fast setup", cta: "Learn More" },
      { id: "copy_2", primaryText: "Boost your team", headline: "Get Started", description: "Free trial", cta: "Sign Up" },
      { id: "copy_3", primaryText: "Join thousands", headline: "See Why", description: "Loved by teams", cta: "Get Started" },
    ],
    audienceRecommendations: {
      baseAudience: { interests: ["technology"], behaviors: [], estimatedReach: 50000 },
      lookalike: { description: "1% lookalike", targetingType: "lookalike", estimatedReach: 20000 },
    },
    budgetAllocation: { facebook: 3000, instagram: 2000, audience_network: 0, total: 5000 },
    expectedMetrics: {
      reach: 40000,
      impressions: 120000,
      estimatedClicks: 1200,
      estimatedResults: 60,
      estimatedCPC: 1.2,
      estimatedCostPerResult: 25,
      estimatedROAS: 3.5,
    },
    campaignStructure: {
      duration: "14 days",
      bestTimeToRun: "evenings",
      bidStrategy: "Lowest cost",
      conversionEvent: "Purchase",
    },
    recommendations: ["Test video creative next", "Narrow age range after week 1"],
    ...overrides,
  };
}

describe("validateGeneratedCampaign", () => {
  test("accepts a well-formed generated campaign", () => {
    expect(validateGeneratedCampaign(validGeneratedCampaign())).toBe(true);
  });

  test("rejects fewer than 3 ad copy variations", () => {
    const data = validGeneratedCampaign({
      adCopyVariations: validGeneratedCampaign().adCopyVariations.slice(0, 2),
    });
    expect(() => validateGeneratedCampaign(data)).toThrow(/at least 3 ad copy variations/);
  });

  test("rejects an ad copy variation missing required fields", () => {
    const data = validGeneratedCampaign();
    delete data.adCopyVariations[0].headline;
    expect(() => validateGeneratedCampaign(data)).toThrow(/primaryText, headline, and cta/);
  });

  test("rejects a zero or missing budget total", () => {
    const data = validGeneratedCampaign({ budgetAllocation: { total: 0 } });
    expect(() => validateGeneratedCampaign(data)).toThrow(/budget allocation/);
  });

  test("rejects missing expected metrics", () => {
    const data = validGeneratedCampaign({ expectedMetrics: null });
    expect(() => validateGeneratedCampaign(data)).toThrow(/metrics projection/);
  });

  test("rejects missing audience recommendations", () => {
    const data = validGeneratedCampaign({ audienceRecommendations: null });
    expect(() => validateGeneratedCampaign(data)).toThrow(/audience recommendations/);
  });

  test("rejects a non-object payload", () => {
    expect(() => validateGeneratedCampaign(null)).toThrow(/not an object/);
  });
});
