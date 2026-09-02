// Firestore collection schema definitions
export const FIRESTORE_SCHEMA = {
  // Users collection
  users: {
    collection: "users",
    doc: "{uid}",
    fields: {
      uid: "string (primary key)",
      email: "string (unique)",
      displayName: "string",
      photoUrl: "string | null",
      role: "enum: admin|user",
      tenantId: "string (foreign key to companies)",
      createdAt: "timestamp",
      updatedAt: "timestamp",
      isActive: "boolean",
    },
    indexes: ["email", "tenantId", "createdAt"],
  },

  // Companies collection (Tenants)
  companies: {
    collection: "companies",
    doc: "{companyId}",
    fields: {
      companyId: "string (primary key)",
      name: "string",
      email: "string",
      logo: "string (storage URL)",
      website: "string | null",
      description: "string | null",
      industry: "string",
      country: "string (Malaysia)",
      state: "string",
      employees: "number",
      plan: "enum: free|starter|pro|enterprise",
      status: "enum: active|inactive|suspended",
      apiKey: "string (hashed)",
      maxUsers: "number",
      maxAgents: "number",
      createdBy: "string (uid, foreign key)",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
    indexes: ["email", "plan", "status", "createdAt"],
  },

  // Knowledge base
  knowledge: {
    collection: "companies/{companyId}/knowledge",
    doc: "{documentId}",
    fields: {
      documentId: "string (primary key)",
      companyId: "string (parent)",
      title: "string",
      content: "string (markdown)",
      category: "enum: brand|products|faq|marketing|cta|other",
      tags: "array<string>",
      version: "number",
      createdBy: "string (uid)",
      createdAt: "timestamp",
      updatedAt: "timestamp",
      isPublished: "boolean",
    },
    indexes: ["companyId", "category", "isPublished", "createdAt"],
  },

  // AI Agents
  agents: {
    collection: "companies/{companyId}/agents",
    doc: "{agentId}",
    fields: {
      agentId: "string (primary key)",
      companyId: "string (parent)",
      name: "string",
      type: "enum: ceo|knowledge|content|marketing|planner|analytics|trend|comment|messenger|automation|image",
      status: "enum: active|inactive|beta",
      config: "object (agent-specific config)",
      templates: "array<string> (template IDs)",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
    indexes: ["companyId", "type", "status"],
  },

  // Generated content
  content: {
    collection: "companies/{companyId}/content",
    doc: "{contentId}",
    fields: {
      contentId: "string (primary key)",
      companyId: "string (parent)",
      type: "enum: caption|carousel|blog|story|email|sms",
      platform: "enum: instagram|tiktok|facebook|twitter|linkedin|email",
      title: "string",
      body: "string (markdown)",
      variants: "array<object> (alternative versions)",
      metadata: "object (images, videos, links)",
      status: "enum: draft|approved|scheduled|published|archived",
      knowledgeUsed: "array<string> (document IDs)",
      agentUsed: "string (agent ID)",
      performanceMetrics: "object (likes, shares, clicks, etc)",
      createdBy: "string (uid)",
      createdAt: "timestamp",
      publishedAt: "timestamp | null",
      scheduledAt: "timestamp | null",
    },
    indexes: ["companyId", "type", "platform", "status", "createdAt"],
  },

  // Templates
  templates: {
    collection: "companies/{companyId}/templates",
    doc: "{templateId}",
    fields: {
      templateId: "string (primary key)",
      companyId: "string (parent)",
      name: "string",
      category: "enum: caption|carousel|blog|story|email|sms",
      platform: "enum: instagram|tiktok|facebook|twitter|linkedin|email",
      structure: "object (prompt structure for Claude)",
      variables: "array<string> (dynamic variables like {{productName}})",
      createdBy: "string (uid)",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
    indexes: ["companyId", "category", "platform"],
  },

  // Usage tracking
  usage: {
    collection: "companies/{companyId}/usage",
    doc: "{YYYY-MM-DD}",
    fields: {
      date: "string (YYYY-MM-DD, primary key)",
      companyId: "string (parent)",
      tokensUsed: "number",
      cost: "number (in RM)",
      requestsCount: "number",
      contentGenerated: "number",
      apiCallsCount: "number",
      createdAt: "timestamp",
    },
    indexes: ["companyId", "date"],
  },

  // Meta Ads OAuth tokens (Sprint 2)
  metaTokens: {
    collection: "companies/{companyId}/meta_tokens",
    doc: "token_metadata",
    fields: {
      metaToken: {
        accessToken: "string (encrypted)",
        refreshToken: "string (encrypted) | null",
        expiresAt: "timestamp",
        scopes: "array<string>",
        metaUserId: "string",
        metaAdAccountId: "string | null",
        isValid: "boolean",
        lastRefreshed: "timestamp",
        lastUsed: "timestamp | null",
      },
    },
    indexes: [],
  },

  // Meta Ads campaigns (Sprint 2 skeleton, populated from Sprint 3)
  campaigns: {
    collection: "companies/{companyId}/campaigns",
    doc: "{campaignId}",
    fields: {
      campaignId: "string (primary key)",
      companyId: "string (parent)",
      userId: "string",
      name: "string",
      objective: "string",
      status: "string",
      startDate: "timestamp | null",
      endDate: "timestamp | null",
      budget: "object ({ amount, type, currency })",
      audience: "object ({ country, ageMin, ageMax, interests, lookalikeBased, excludedAudiences })",
      creative: "object ({ primaryText, headline, description, imageUrl, videoUrl })",
      placements: "object ({ facebook, instagram, audience_network, messenger })",
      metaCampaignId: "string | null",
      metaAdAccountId: "string | null",
      lastPerformanceUpdate: "timestamp | null",
      createdBy: "enum: claude-ai|user",
      optimization: "object ({ lastOptimizationDate, optimizationsApplied, estimatedROAS })",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
    indexes: ["companyId", "status", "createdAt"],
  },

  // Daily performance snapshots per campaign
  dailyPerformance: {
    collection: "campaigns/{campaignId}/daily_performance",
    doc: "{date}",
    fields: {
      date: "string (YYYY-MM-DD, primary key)",
      spend: "number",
      impressions: "number",
      clicks: "number",
      ctr: "number",
      cpc: "number",
      results: "number",
      costPerResult: "number",
      frequency: "number",
      reach: "number",
      conversionValue: "number",
      roas: "number",
      qualityScore: "number",
      vs_yesterday: "object ({ spend_change, ctr_change, cpc_change, roas_change })",
    },
    indexes: ["date"],
  },

  // AI-generated optimization recommendations per campaign
  recommendations: {
    collection: "campaigns/{campaignId}/recommendations",
    doc: "{recommendationId}",
    fields: {
      recommendationId: "string (primary key)",
      title: "string",
      description: "string",
      type: "enum: BUDGET_INCREASE|PAUSE_ADSET|CREATIVE_REFRESH",
      expectedImpact: "object ({ ctrChange, roasChange, confidenceLevel })",
      action: "object ({ targetAdSet, currentBudget, suggestedBudget, change, changePercent })",
      status: "enum: PENDING|APPLIED|REJECTED|EXPIRED",
      appliedAt: "timestamp | null",
      appliedBy: "string | null",
      generatedBy: "string (claude-ai)",
      generatedAt: "timestamp",
      expiresAt: "timestamp",
      logs: "array<object>",
    },
    indexes: ["status", "generatedAt"],
  },
};

export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  COMPANIES: "companies",
  KNOWLEDGE: (companyId) => `companies/${companyId}/knowledge`,
  AGENTS: (companyId) => `companies/${companyId}/agents`,
  CONTENT: (companyId) => `companies/${companyId}/content`,
  TEMPLATES: (companyId) => `companies/${companyId}/templates`,
  USAGE: (companyId) => `companies/${companyId}/usage`,
  META_TOKENS: (companyId) => `companies/${companyId}/meta_tokens`,
  CAMPAIGNS: (companyId) => `companies/${companyId}/campaigns`,
  DAILY_PERFORMANCE: (companyId, campaignId) =>
    `companies/${companyId}/campaigns/${campaignId}/daily_performance`,
  RECOMMENDATIONS: (companyId, campaignId) =>
    `companies/${companyId}/campaigns/${campaignId}/recommendations`,
};
