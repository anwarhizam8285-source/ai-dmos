import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-6";
const MAX_TOKENS = 1024;

export async function generateCaption(knowledge, params = {}) {
  const { tone = "professional", language = "english", platform = "instagram" } = params;

  const systemPrompt = `You are a content creation expert for Malaysian SMEs.
Generate engaging, concise social media captions that drive engagement.
Knowledge base: ${knowledge}
Tone: ${tone}
Language: ${language}
Platform: ${platform}`;

  const userPrompt = params.topic || "Generate a compelling social media caption";

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    return {
      success: true,
      content: message.content[0].type === "text" ? message.content[0].text : "",
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error("Anthropic API error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function generateContent(knowledge, contentType, params = {}) {
  const { tone = "professional", language = "english" } = params;

  const prompts = {
    caption: "Generate a short social media caption (50-100 words)",
    carousel: "Generate 5 carousel slide captions for a series post",
    blog: "Generate a blog post introduction (200-300 words)",
    email: "Generate an engaging email subject and preview (100 words max)",
    story: "Generate Instagram story text ideas (3-5 variations, 20 words each)",
  };

  const systemPrompt = `You are a professional content creator specializing in Malaysian SME marketing.
Create engaging, authentic content that resonates with the target audience.
Knowledge base: ${knowledge}
Tone: ${tone}
Language: ${language}`;

  const userPrompt = params.topic
    ? `Topic: ${params.topic}\n${prompts[contentType] || prompts.caption}`
    : prompts[contentType] || prompts.caption;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    return {
      success: true,
      contentType,
      content: message.content[0].type === "text" ? message.content[0].text : "",
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error("Anthropic API error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function analyzeContent(content, params = {}) {
  const { criteriaType = "engagement" } = params;

  const systemPrompt = `You are an expert content analyst. 
Analyze the provided content based on the specified criteria.
Provide actionable feedback.`;

  const userPrompt = `Analyze this ${criteriaType} for: ${content}`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    return {
      success: true,
      analysis: message.content[0].type === "text" ? message.content[0].text : "",
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error("Anthropic API error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function calculateTokenCost(inputTokens, outputTokens) {
  // Anthropic pricing (as of 2024)
  const inputCostPer1M = 3; // $3 per 1M input tokens
  const outputCostPer1M = 15; // $15 per 1M output tokens

  const inputCost = (inputTokens / 1000000) * inputCostPer1M;
  const outputCost = (outputTokens / 1000000) * outputCostPer1M;
  const totalCost = inputCost + outputCost;

  // Convert to RM (1 USD = ~4.40 RM)
  const exchangeRate = 4.4;
  const costRM = totalCost * exchangeRate;

  return {
    inputTokens,
    outputTokens,
    costUSD: totalCost.toFixed(6),
    costRM: costRM.toFixed(6),
  };
}

export default {
  generateCaption,
  generateContent,
  analyzeContent,
  calculateTokenCost,
};
