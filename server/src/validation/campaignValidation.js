import { ValidationError } from "./validationErrors.js";

export const SUPPORTED_COUNTRIES = ["MY", "SG", "ID", "TH"];
export const BUDGET_TYPES = ["DAILY", "LIFETIME"];
export const TARGET_ACTIONS = ["CONVERSIONS", "LEADS", "TRAFFIC", "AWARENESS"];

const MIN_BUDGET = 100;
const MAX_BUDGET = 1000000;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Validates campaign input from the campaign creation form. Throws
// ValidationError (all problems collected, not just the first) on failure.
export function validateCampaignInput(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    throw new ValidationError(["campaignInput is required"]);
  }

  if (!isNonEmptyString(input.campaignName) || input.campaignName.trim().length < 3) {
    errors.push("Campaign name is required (min 3 characters)");
  } else if (input.campaignName.length > 100) {
    errors.push("Campaign name must be 100 characters or fewer");
  }

  const budget = input.budget || {};
  if (typeof budget.amount !== "number" || Number.isNaN(budget.amount)) {
    errors.push("Budget amount is required");
  } else if (budget.amount < MIN_BUDGET || budget.amount > MAX_BUDGET) {
    errors.push(`Budget must be between RM${MIN_BUDGET} and RM${MAX_BUDGET}`);
  }
  if (budget.type && !BUDGET_TYPES.includes(budget.type)) {
    errors.push(`Budget type must be one of: ${BUDGET_TYPES.join(", ")}`);
  }

  const audience = input.audience || {};
  if (audience.country && !SUPPORTED_COUNTRIES.includes(audience.country)) {
    errors.push(`Audience country must be one of: ${SUPPORTED_COUNTRIES.join(", ")}`);
  }
  const ageMin = audience.ageMin;
  const ageMax = audience.ageMax;
  if (ageMin !== undefined && (ageMin < 13 || ageMin > 65)) {
    errors.push("Audience ageMin must be between 13 and 65");
  }
  if (ageMax !== undefined && (ageMax < 13 || ageMax > 65)) {
    errors.push("Audience ageMax must be between 13 and 65");
  }
  if (ageMin !== undefined && ageMax !== undefined && ageMin > ageMax) {
    errors.push("Audience ageMin cannot be greater than ageMax");
  }
  if (!Array.isArray(audience.interests) || audience.interests.length === 0) {
    errors.push("At least one audience interest is required");
  } else if (audience.interests.length > 10) {
    errors.push("At most 10 audience interests are allowed");
  }

  const placement = input.placement || {};
  const hasPlacement = ["facebook", "instagram", "audience_network", "messenger"].some(
    (key) => placement[key] === true
  );
  if (!hasPlacement) {
    errors.push("At least one placement (Facebook/Instagram) is required");
  }

  const productInfo = input.productInfo || {};
  if (!isNonEmptyString(productInfo.name)) {
    errors.push("Product name is required");
  } else if (productInfo.name.length > 200) {
    errors.push("Product name must be 200 characters or fewer");
  }
  if (!isNonEmptyString(productInfo.description) || productInfo.description.trim().length < 20) {
    errors.push("Product description is required (min 20 characters)");
  } else if (productInfo.description.length > 1000) {
    errors.push("Product description must be 1000 characters or fewer");
  }
  if (!isNonEmptyString(productInfo.landingPageUrl) || !isValidUrl(productInfo.landingPageUrl)) {
    errors.push("A valid landing page URL is required");
  }
  if (productInfo.targetAction && !TARGET_ACTIONS.includes(productInfo.targetAction)) {
    errors.push(`Target action must be one of: ${TARGET_ACTIONS.join(", ")}`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return true;
}

export default { validateCampaignInput, SUPPORTED_COUNTRIES, BUDGET_TYPES, TARGET_ACTIONS };
