import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-6";
const MAX_TOKENS = 3000;

function buildSystemPrompt() {
  return `You are an expert Meta Ads campaign strategist. Generate a comprehensive
Meta Ads campaign based on user input. Your response MUST be valid JSON and
nothing else - no markdown fences, no commentary before or after the JSON.

Consider:
- Target audience psychology
- Product positioning
- Ad copy best practices (Meta character limits)
- Budget optimization across the selected placements
- Conversion optimization for the requested target action
- Malaysian market context when the audience country is MY (Bahasa/English mix,
  local payment/shopping behaviors) - otherwise adapt tone to the target country

Generate compelling, action-oriented ad copy. Vary tone and approach across the
3 variations (e.g. benefit-led, urgency-led, social-proof-led).`;
}

function buildUserPrompt(campaignInput) {
  const { campaignName, budget, audience, productInfo } = campaignInput;

  return `Generate a Meta Ads campaign for:

Campaign Name: ${campaignName}
Product: ${productInfo.name}
Description: ${productInfo.description}
Landing Page: ${productInfo.landingPageUrl}
Budget: RM${budget.amount} (${budget.type || "DAILY"})
Target Audience: Age ${audience.ageMin ?? 18}-${audience.ageMax ?? 65}, Interests: ${(
    audience.interests || []
  ).join(", ")}
Country: ${audience.country || "MY"}
Target Action: ${productInfo.targetAction || "CONVERSIONS"}

Return ONLY a JSON object with this exact shape:
{
  "campaignName": "string",
  "objective": "CONVERSIONS|LEADS|TRAFFIC|AWARENESS",
  "adCopyVariations": [
    { "id": "copy_1", "primaryText": "string (max 125 chars)", "headline": "string (max 30 chars)", "description": "string (max 30 chars)", "cta": "Learn More|Sign Up|Get Started|Buy Now|Shop Now|Contact Us" },
    { "id": "copy_2", "primaryText": "string", "headline": "string", "description": "string", "cta": "string" },
    { "id": "copy_3", "primaryText": "string", "headline": "string", "description": "string", "cta": "string" }
  ],
  "audienceRecommendations": {
    "baseAudience": { "interests": ["string"], "behaviors": ["string"], "description": "string", "estimatedReach": number },
    "lookalike": { "description": "string", "targetingType": "lookalike", "estimatedReach": number }
  },
  "budgetAllocation": { "facebook": number, "instagram": number, "audience_network": number, "total": number },
  "expectedMetrics": {
    "reach": number, "impressions": number, "estimatedClicks": number, "estimatedResults": number,
    "estimatedCPC": number, "estimatedCostPerResult": number, "estimatedROAS": number
  },
  "campaignStructure": { "duration": "7 days|14 days|30 days", "bestTimeToRun": "string", "bidStrategy": "Lowest cost|Target cost|Highest volume", "conversionEvent": "Purchase|Lead|ViewContent" },
  "recommendations": ["string", "string"]
}

The "total" in budgetAllocation must equal ${budget.amount}. Only include
placement keys for placements that make sense given the budget size.`;
}

function extractJson(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude response does not contain a JSON object");
  }
  return JSON.parse(jsonMatch[0]);
}

// Throws on structural problems so callers never persist/return a broken campaign.
export function validateGeneratedCampaign(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Generated campaign is not an object");
  }
  if (!Array.isArray(data.adCopyVariations) || data.adCopyVariations.length < 3) {
    throw new Error("Generated campaign must include at least 3 ad copy variations");
  }
  for (const copy of data.adCopyVariations) {
    if (!copy.primaryText || !copy.headline || !copy.cta) {
      throw new Error("Each ad copy variation needs primaryText, headline, and cta");
    }
  }
  if (!data.budgetAllocation || !(data.budgetAllocation.total > 0)) {
    throw new Error("Generated campaign has an invalid budget allocation");
  }
  if (!data.expectedMetrics || !(data.expectedMetrics.estimatedResults >= 0)) {
    throw new Error("Generated campaign has an invalid metrics projection");
  }
  if (!data.audienceRecommendations || !data.audienceRecommendations.baseAudience) {
    throw new Error("Generated campaign is missing audience recommendations");
  }
  return true;
}

export async function generateCampaign(campaignInput) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(campaignInput) }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("Claude response contained no text content");
  }

  const campaignData = extractJson(textBlock.text);
  validateGeneratedCampaign(campaignData);

  return {
    data: campaignData,
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
  };
}

export default { generateCampaign, validateGeneratedCampaign };
