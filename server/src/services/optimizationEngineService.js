import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-6";
const MAX_TOKENS = 2500;

export const RECOMMENDATION_TYPES = [
  "BUDGET_INCREASE",
  "BUDGET_DECREASE",
  "PAUSE_ADSET",
  "EXPAND_AUDIENCE",
  "REFRESH_CREATIVE",
  "CHANGE_BIDDING",
];

// Averages the stored daily_performance docs. Every division is guarded so a
// history with a zero-impression or zero-click day never produces NaN.
export function averageMetrics(history) {
  if (!history || history.length === 0) return null;

  const sum = history.reduce(
    (acc, day) => ({
      spend: acc.spend + (day.spend || 0),
      impressions: acc.impressions + (day.impressions || 0),
      clicks: acc.clicks + (day.clicks || 0),
      results: acc.results + (day.results || 0),
      roas: acc.roas + (day.roas || 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, results: 0, roas: 0 }
  );
  const n = history.length;

  return {
    spend: Number((sum.spend / n).toFixed(2)),
    impressions: Math.round(sum.impressions / n),
    clicks: Math.round(sum.clicks / n),
    ctr: sum.impressions > 0 ? Number(((sum.clicks / sum.impressions) * 100).toFixed(2)) : 0,
    cpc: sum.clicks > 0 ? Number((sum.spend / sum.clicks).toFixed(2)) : 0,
    results: Math.round(sum.results / n),
    costPerResult: sum.results > 0 ? Number((sum.spend / sum.results).toFixed(2)) : 0,
    roas: Number((sum.roas / n).toFixed(2)),
  };
}

// history is expected oldest-first (see firebaseUtils.listPerformanceHistory).
export function calculateTrends(history) {
  if (!history || history.length < 2) return { ctr: 0, cpc: 0, roas: 0 };
  const first = history[0];
  const last = history[history.length - 1];
  const pct = (curr, prev) => (prev ? Number((((curr - prev) / prev) * 100).toFixed(2)) : 0);
  return {
    ctr: pct(last.ctr, first.ctr),
    cpc: pct(last.cpc, first.cpc),
    roas: pct(last.roas, first.roas),
  };
}

export function validateRecommendations(recommendations) {
  if (!Array.isArray(recommendations)) {
    throw new Error("Recommendations must be an array");
  }
  if (recommendations.length === 0) {
    throw new Error("Must generate at least 1 recommendation");
  }
  const validTypes = new Set(RECOMMENDATION_TYPES);

  recommendations.forEach((rec, index) => {
    if (!rec.type || !validTypes.has(rec.type)) {
      throw new Error(`Invalid or unknown recommendation type at index ${index}: ${rec.type}`);
    }
    if (!rec.title || !rec.description || !rec.action) {
      throw new Error(`Recommendation at index ${index} is missing title, description, or action`);
    }
    if (typeof rec.priority !== "number" || rec.priority < 1 || rec.priority > 5) {
      throw new Error(`Recommendation at index ${index} needs a priority between 1 and 5`);
    }
    if (!rec.expectedImpact || !rec.expectedImpact.metric) {
      throw new Error(`Recommendation at index ${index} is missing expectedImpact`);
    }
  });

  return true;
}

function buildSystemPrompt() {
  return `You are an expert Meta Ads optimization strategist. Analyze campaign
performance and generate specific, actionable recommendations to improve ROAS
and efficiency. Your response MUST be a JSON array and nothing else - no
markdown fences, no commentary before or after the array.

Focus on:
- Budget allocation optimization
- Audience targeting refinement
- Creative fatigue detection
- Cost efficiency improvements
- Conversion rate optimization

Only recommend an action that's actually applicable given the campaign's
real structure (it has exactly one ad set, referenced by its Meta ad set ID
below) - don't invent ad sets or creatives that don't exist.`;
}

function buildUserPrompt(campaign, avgMetrics, trends) {
  return `Analyze this Meta Ads campaign and provide optimization recommendations:

Campaign: ${campaign.name}
Objective: ${campaign.objective}
Current budget: RM${campaign.budget.amount}/${(campaign.budget.type || "DAILY").toLowerCase()}
Meta Ad Set ID: ${campaign.metaAdSetId || "unknown"}

Performance (history average):
- Spend: RM${avgMetrics.spend}
- Impressions: ${avgMetrics.impressions}
- Clicks: ${avgMetrics.clicks}
- CTR: ${avgMetrics.ctr}%
- CPC: RM${avgMetrics.cpc}
- Results: ${avgMetrics.results}
- Cost per result: RM${avgMetrics.costPerResult}
- ROAS: ${avgMetrics.roas}x

Trends (first vs. most recent day in the window):
- CTR: ${trends.ctr > 0 ? "+" : ""}${trends.ctr}%
- CPC: ${trends.cpc > 0 ? "+" : ""}${trends.cpc}%
- ROAS: ${trends.roas > 0 ? "+" : ""}${trends.roas}%

Generate up to 5 recommendations, ranked by priority (5 = most impactful).
Return ONLY a JSON array where each element has this exact shape:
{
  "type": "BUDGET_INCREASE|BUDGET_DECREASE|PAUSE_ADSET|EXPAND_AUDIENCE|REFRESH_CREATIVE|CHANGE_BIDDING",
  "title": "string",
  "description": "string (why this matters, in plain language)",
  "priority": 1-5,
  "action": {
    "targetAdSet": "${campaign.metaAdSetId || "null"}",
    "currentValue": number or string,
    "suggestedValue": number or string,
    "changePercent": number or null,
    "rationale": "string"
  },
  "expectedImpact": {
    "metric": "CTR|CPC|ROAS|COST_PER_RESULT",
    "change": "+15%|+25%|-10%",
    "confidence": "HIGH|MEDIUM|LOW"
  }
}

For BUDGET_INCREASE/BUDGET_DECREASE, currentValue/suggestedValue are the
campaign's daily/lifetime budget in RM (whole ringgit, matching "Current
budget" above) - this campaign uses Campaign Budget Optimization, so the
budget is set on the Campaign, not the ad set. For CHANGE_BIDDING,
suggestedValue is a Meta bid_strategy string (e.g. "LOWEST_COST_WITHOUT_CAP",
"COST_CAP"). For PAUSE_ADSET, suggestedValue can just be "PAUSED". For
EXPAND_AUDIENCE, describe the widening in the rationale (age range and/or
lookalike) - currentValue/suggestedValue can be the age range width. Do not
recommend REFRESH_CREATIVE as something that gets auto-applied - it always
requires a human to supply new creative, say so in the rationale.`;
}

function extractJsonArray(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    throw new Error("Claude response does not contain a JSON array");
  }
  return JSON.parse(match[0]);
}

// performanceHistory must be oldest-first (see firebaseUtils.listPerformanceHistory).
export async function generateOptimizationRecommendations(campaign, performanceHistory) {
  const avgMetrics = averageMetrics(performanceHistory);
  if (!avgMetrics) {
    throw new Error("No performance history available yet");
  }
  const trends = calculateTrends(performanceHistory);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(campaign, avgMetrics, trends) }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("Claude response contained no text content");
  }

  const recommendations = extractJsonArray(textBlock.text);
  validateRecommendations(recommendations);

  return {
    data: recommendations,
    avgMetrics,
    trends,
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
  };
}

export default { generateOptimizationRecommendations, averageMetrics, calculateTrends, validateRecommendations };
