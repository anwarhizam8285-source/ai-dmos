import Anthropic from "@anthropic-ai/sdk";
import { generateContent } from "./anthropicService.js";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-6";
const MAX_TOKENS = 1024;

const CONTENT_KEYWORDS = [
  "caption",
  "post",
  "content",
  "write",
  "draft",
  "copy",
  "carousel",
  "blog",
  "story",
];
const ANALYTICS_KEYWORDS = [
  "usage",
  "cost",
  "stats",
  "analytics",
  "token",
  "spend",
  "budget",
  "billing",
];

// Routes a message to the specialist agent best suited to handle it
export function classifyIntent(message) {
  const lower = message.toLowerCase();
  if (CONTENT_KEYWORDS.some((k) => lower.includes(k))) return "content";
  if (ANALYTICS_KEYWORDS.some((k) => lower.includes(k))) return "analytics";
  return "general";
}

export async function orchestrate(message, context = {}) {
  const { knowledge = "", companyName = "your company" } = context;
  const intent = classifyIntent(message);

  if (intent === "content") {
    const result = await generateContent(knowledge, "caption", { topic: message });
    return {
      agent: "content-agent",
      intent,
      success: result.success,
      content: result.content,
      usage: result.usage,
      error: result.error,
    };
  }

  const systemPrompt = `You are the CEO Agent, the AI orchestrator for ${companyName}'s marketing operations.
You oversee specialist agents (Content Agent for copywriting, Analytics for usage/cost questions) and answer
strategic questions directly using the company's knowledge base when relevant.
Knowledge base context:
${knowledge || "No knowledge documents uploaded yet."}
Respond concisely (under 150 words) and helpfully, like a sharp marketing strategist.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: message }],
      system: systemPrompt,
    });

    return {
      agent: "ceo-agent",
      intent,
      success: true,
      content: response.content[0].type === "text" ? response.content[0].text : "",
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error("CEO Agent error:", error);
    return { agent: "ceo-agent", intent, success: false, error: error.message };
  }
}

export default { classifyIntent, orchestrate };
