// Content type definitions used for validation and quality scoring
export const CONTENT_TEMPLATES = {
  caption: {
    label: "Social Caption",
    platforms: ["instagram", "facebook", "tiktok", "linkedin", "twitter"],
    minWords: 15,
    maxWords: 100,
  },
  carousel: {
    label: "Carousel Slides",
    platforms: ["instagram", "linkedin"],
    minWords: 40,
    maxWords: 200,
  },
  blog: {
    label: "Blog Intro",
    platforms: ["email", "linkedin"],
    minWords: 100,
    maxWords: 300,
  },
  email: {
    label: "Email Subject & Preview",
    platforms: ["email"],
    minWords: 10,
    maxWords: 60,
  },
  story: {
    label: "Story Ideas",
    platforms: ["instagram", "tiktok"],
    minWords: 20,
    maxWords: 100,
  },
};

// Heuristic quality score (0-100) - avoids a second paid API call per generation
export function scoreContent(content, contentType) {
  const template = CONTENT_TEMPLATES[contentType] || CONTENT_TEMPLATES.caption;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const feedback = [];
  let score = 100;

  if (wordCount < template.minWords) {
    score -= 20;
    feedback.push(`Content is shorter than the recommended ${template.minWords} words`);
  }
  if (wordCount > template.maxWords) {
    score -= 10;
    feedback.push(`Content exceeds the recommended ${template.maxWords} words`);
  }

  const hasCTA = /(click|shop|visit|order|book|dm|contact|learn more|sign up|call now)/i.test(
    content
  );
  if (!hasCTA) {
    score -= 15;
    feedback.push("No clear call-to-action detected");
  }

  const hasHashtag = /#\w+/.test(content);
  if (["caption", "story"].includes(contentType) && !hasHashtag) {
    score -= 10;
    feedback.push("Consider adding relevant hashtags");
  }

  score = Math.max(0, Math.min(100, score));
  if (feedback.length === 0) feedback.push("Looks great! Ready to publish.");

  return { score, wordCount, feedback };
}

export default { CONTENT_TEMPLATES, scoreContent };
