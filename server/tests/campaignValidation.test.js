import { validateCampaignInput } from "../src/validation/campaignValidation.js";
import { ValidationError } from "../src/validation/validationErrors.js";

function validInput(overrides = {}) {
  return {
    campaignName: "Q4 Product Launch",
    budget: { amount: 5000, type: "DAILY" },
    audience: {
      country: "MY",
      ageMin: 25,
      ageMax: 45,
      interests: ["technology", "business"],
    },
    placement: { facebook: true, instagram: true, audience_network: false, messenger: false },
    productInfo: {
      name: "New SaaS Tool",
      description: "Cloud-based project management for teams and freelancers alike",
      landingPageUrl: "https://product.com/launch",
      targetAction: "CONVERSIONS",
    },
    ...overrides,
  };
}

describe("validateCampaignInput", () => {
  test("accepts valid input", () => {
    expect(validateCampaignInput(validInput())).toBe(true);
  });

  test("rejects a missing campaignInput", () => {
    expect(() => validateCampaignInput(undefined)).toThrow(ValidationError);
  });

  test("rejects a campaign name under 3 characters", () => {
    expect(() => validateCampaignInput(validInput({ campaignName: "Q4" }))).toThrow(
      /Campaign name/
    );
  });

  test("rejects budget below RM100", () => {
    const input = validInput();
    input.budget.amount = 50;
    expect(() => validateCampaignInput(input)).toThrow(/Budget must be between/);
  });

  test("rejects budget above RM1,000,000", () => {
    const input = validInput();
    input.budget.amount = 2000000;
    expect(() => validateCampaignInput(input)).toThrow(/Budget must be between/);
  });

  test("rejects ageMin greater than ageMax", () => {
    const input = validInput();
    input.audience.ageMin = 50;
    input.audience.ageMax = 30;
    expect(() => validateCampaignInput(input)).toThrow(/ageMin cannot be greater/);
  });

  test("rejects an empty interests list", () => {
    const input = validInput();
    input.audience.interests = [];
    expect(() => validateCampaignInput(input)).toThrow(/interest is required/);
  });

  test("rejects when no placement is selected", () => {
    const input = validInput();
    input.placement = { facebook: false, instagram: false, audience_network: false, messenger: false };
    expect(() => validateCampaignInput(input)).toThrow(/At least one placement/);
  });

  test("rejects an invalid landing page URL", () => {
    const input = validInput();
    input.productInfo.landingPageUrl = "not-a-url";
    expect(() => validateCampaignInput(input)).toThrow(/landing page URL/);
  });

  test("rejects a product description under 20 characters", () => {
    const input = validInput();
    input.productInfo.description = "Too short";
    expect(() => validateCampaignInput(input)).toThrow(/description is required/);
  });

  test("rejects an unsupported audience country", () => {
    const input = validInput();
    input.audience.country = "US";
    expect(() => validateCampaignInput(input)).toThrow(/country must be one of/);
  });

  test("collects multiple errors at once", () => {
    const input = validInput({ campaignName: "Q4" });
    input.budget.amount = 10;
    try {
      validateCampaignInput(input);
      throw new Error("expected validateCampaignInput to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.errors.length).toBeGreaterThanOrEqual(2);
    }
  });
});
