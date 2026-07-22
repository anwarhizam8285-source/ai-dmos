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
};

export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  COMPANIES: "companies",
  KNOWLEDGE: (companyId) => `companies/${companyId}/knowledge`,
  AGENTS: (companyId) => `companies/${companyId}/agents`,
  CONTENT: (companyId) => `companies/${companyId}/content`,
  TEMPLATES: (companyId) => `companies/${companyId}/templates`,
  USAGE: (companyId) => `companies/${companyId}/usage`,
};
