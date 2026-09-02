import {
  isEmailConfigured,
  renderWelcomeEmail,
  renderDailyRecommendationEmail,
  renderWeeklyReportEmail,
} from "../src/services/emailService.js";

describe("isEmailConfigured", () => {
  const originalUser = process.env.GMAIL_USER;
  const originalPass = process.env.GMAIL_APP_PASSWORD;

  afterEach(() => {
    process.env.GMAIL_USER = originalUser;
    process.env.GMAIL_APP_PASSWORD = originalPass;
  });

  test("is false when either credential is missing", () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    expect(isEmailConfigured()).toBe(false);

    process.env.GMAIL_USER = "test@example.com";
    delete process.env.GMAIL_APP_PASSWORD;
    expect(isEmailConfigured()).toBe(false);
  });

  test("is true when both credentials are set", () => {
    process.env.GMAIL_USER = "test@example.com";
    process.env.GMAIL_APP_PASSWORD = "app-password";
    expect(isEmailConfigured()).toBe(true);
  });
});

describe("renderWelcomeEmail", () => {
  test("includes the company name and a working subject", () => {
    const { subject, html } = renderWelcomeEmail({ companyName: "Kira Senang" });
    expect(subject).toMatch(/Welcome/);
    expect(html).toContain("Kira Senang");
  });

  test("escapes HTML in the company name", () => {
    const { html } = renderWelcomeEmail({ companyName: "<script>alert(1)</script>" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("renderDailyRecommendationEmail", () => {
  const recommendations = [
    {
      title: "Increase budget",
      description: "ROAS is trending up",
      expectedImpact: { metric: "ROAS", change: "+10%" },
    },
    {
      title: "Pause underperforming ad set",
      description: "CPC has doubled",
      expectedImpact: { metric: "CPC", change: "-15%" },
    },
  ];

  test("includes the recommendation count in the subject", () => {
    const { subject } = renderDailyRecommendationEmail({
      companyName: "Kira Senang",
      campaignName: "Launch Campaign",
      recommendations,
    });
    expect(subject).toContain("2");
  });

  test("uses singular wording for exactly one recommendation", () => {
    const { subject } = renderDailyRecommendationEmail({
      companyName: "Kira Senang",
      campaignName: "Launch Campaign",
      recommendations: [recommendations[0]],
    });
    expect(subject).toContain("1 new optimization recommendation");
  });

  test("renders every recommendation's title and description", () => {
    const { html } = renderDailyRecommendationEmail({
      companyName: "Kira Senang",
      campaignName: "Launch Campaign",
      recommendations,
    });
    expect(html).toContain("Increase budget");
    expect(html).toContain("Pause underperforming ad set");
    expect(html).toContain("ROAS is trending up");
  });

  test("escapes HTML in recommendation titles (Claude-generated content)", () => {
    const { html } = renderDailyRecommendationEmail({
      companyName: "Kira Senang",
      campaignName: "Launch Campaign",
      recommendations: [{ title: "<img src=x onerror=alert(1)>", description: "d", expectedImpact: {} }],
    });
    expect(html).not.toContain("<img src=x");
  });
});

describe("renderWeeklyReportEmail", () => {
  test("includes key metrics", () => {
    const { html } = renderWeeklyReportEmail({
      companyName: "Kira Senang",
      metrics: { spend: 500, results: 42, averageRoas: 3.1 },
    });
    expect(html).toContain("500");
    expect(html).toContain("42");
    expect(html).toContain("3.1");
  });
});
