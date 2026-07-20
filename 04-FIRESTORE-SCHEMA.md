# 04 — FIRESTORE SCHEMA & SECURITY

**Version:** 1.0  
**Last Updated:** 15 July 2026  
**Database:** Firebase Firestore (asia-southeast1)  

---

## 1. COLLECTION HIERARCHY

```
FIRESTORE ROOT
│
├── tenants/                                  [Multi-tenant root]
│   └── {tenantId}/                          [e.g., TENANT_0001 = KIRA Senang]
│       ├── company/                         [Single doc: metadata]
│       ├── workspaces/                      [Sub-collection]
│       │   └── {workspaceId}/              [Sub-tenant organization]
│       │       ├── brands/                  [Sub-collection]
│       │       │   └── {brandId}/          [Brand entity]
│       │       │       ├── guidelines/      [Brand standards]
│       │       │       └── social_accounts/ [Connected accounts]
│       │       │           └── {accountId}/ [FB page, IG, TikTok, etc]
│       │       ├── knowledge_base/          [RAG source]
│       │       ├── content/                 [All content drafts/published]
│       │       ├── published_posts/         [Published records only]
│       │       ├── scheduled_posts/         [Queue for auto-publish]
│       │       ├── analytics/               [Insights & metrics]
│       │       ├── campaigns/               [Campaign management]
│       │       ├── agent_logs/              [AI agent execution logs]
│       │       ├── usage_logs/              [Token & cost tracking]
│       │       ├── media_library/           [Images, videos storage]
│       │       └── settings/                [Workspace preferences]
│       │
│       └── audit_logs/                      [Tenant-level audit trail]
│
├── users/                                   [Global user collection]
│   └── {uid}/                              [Firebase UID]
│       ├── profile/                        [User metadata]
│       ├── preferences/                    [UI settings, theme, etc]
│       ├── tenants/                        [Array: which tenants user belongs to]
│       └── roles/                          [Role mappings per tenant]
│
├── subscriptions/                           [Billing data]
│   └── {subscriptionId}/
│       ├── tenantId
│       ├── plan
│       ├── status
│       ├── billingCycle
│       └── paymentMethod
│
├── billing_events/                          [Transaction log]
│   └── {eventId}/
│       ├── tenantId
│       ├── type (api_call, storage, etc)
│       ├── amount
│       └── timestamp
│
└── global_settings/                         [Platform configuration]
    ├── rate_limits
    ├── feature_flags
    └── maintenance_mode

```

---

## 2. DETAILED COLLECTION SCHEMAS

### 2.1 `/tenants/{tenantId}/company`

Single document containing company metadata.

```javascript
{
  // Identifiers
  id: "TENANT_0001",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Company Info
  name: "KIRA Senang Sdn Bhd",
  website: "https://kirasenang.com.my",
  logoUrl: "gs://aidmos-production.appspot.com/logos/kira-senang.png",
  logoStorageRef: "tenants/TENANT_0001/company/logo",
  
  // Contact
  email: "admin@kirasenang.com.my",
  phone: "+6012-3456789",
  address: "Penang, Malaysia",
  
  // Branding
  colorPrimary: "#0D2137",           // Navy
  colorSecondary: "#1A9E8F",         // Teal
  colorAccent: "#FFFFFF",
  
  // Business Classification
  industry: "Cloud Accounting SaaS",
  businessType: "B2B SaaS",
  businessSize: "20-50 employees",
  registrationNumber: "123456789012",
  registrationType: "Sdn Bhd",
  
  // Configuration
  timezone: "Asia/Kuala_Lumpur",
  language: ["ms", "en"],
  currency: "MYR",
  
  // Subscription Info (reference to subscriptions collection)
  currentSubscription: "SUB_0001",
  plan: "STARTER",              // FREE, STARTER, PRO, ENTERPRISE
  status: "ACTIVE",             // ACTIVE, TRIAL, SUSPENDED, CANCELLED
  trialEndsAt: Timestamp (null if paid),
  renewalDate: Timestamp,
  
  // Feature Flags (tenant-level)
  features: {
    contentGeneration: true,
    scheduling: true,
    analytics: true,
    metaAPI: true,
    imageGeneration: false,
    automation: true,
    multiLanguage: true,
    customBranding: true,
    teamCollaboration: true
  },
  
  // API Usage (current month)
  currentMonth: "2026-07",
  apiCallsUsedThisMonth: 4250,
  tokensUsedThisMonth: 245000,
  estimatedCostThisMonth: 12.50,  // USD
  
  // Contact & Support
  supportEmail: "support@kirasenang.com.my",
  billingEmail: "billing@kirasenang.com.my",
  primaryAdmin: "uid_user_1234",
  
  // Preferences
  settings: {
    allowAIDataUsage: true,         // For model improvement
    autoPublishApproved: true,
    notificationsEnabled: true,
    notificationEmail: "marketing@kirasenang.com.my",
    defaultLocale: "ms-MY",
    reportFormat: "PDF"
  }
}
```

**Firestore Rules:**
```
match /tenants/{tenantId}/company {
  allow read: if request.auth.uid in resource.data.adminUIDs;
  allow write: if request.auth.uid in resource.data.adminUIDs &&
               request.resource.data.diff(resource.data).affectedKeys()
               .hasOnly(['updatedAt', 'colorPrimary', 'colorSecondary', 
                         'logoUrl', 'address', 'email']);
}
```

---

### 2.2 `/tenants/{tenantId}/workspaces/{workspaceId}/brands/{brandId}`

Brand entity with tone, voice, and guidelines.

```javascript
{
  // Identifiers
  id: "BRAND_001",
  tenantId: "TENANT_0001",
  workspaceId: "WORKSPACE_001",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "uid_user_1234",
  
  // Brand Basics
  name: "KIRA Senang",
  description: "Cloud Accounting System untuk UKM Malaysia",
  tagline: "Accounting Made Simple",
  
  // Brand Voice & Tone
  voiceAndTone: {
    personality: ["Professional", "Friendly", "Trustworthy", "Local-focused"],
    communicationStyle: "Direct, Clear, Helpful",
    tone: ["Professional", "Approachable", "Knowledgeable"],
    doNots: [
      "Avoid formal jargon that confuses SME owners",
      "Never use Indonesian slang",
      "Don't use corporate buzzwords",
      "Avoid overly promotional tone"
    ],
    doSs: [
      "Use Bahasa Melayu Malaysia naturally",
      "Include local context and examples",
      "Be helpful and solution-focused",
      "Show understanding of SME challenges"
    ],
    examples: [
      {
        good: "Simpan waktu dengan automasi billing kami",
        bad: "Tingkatkan efisiensi dengan solusi OBE kami"
      },
      {
        good: "WhatsApp kami untuk konsultasi gratis",
        bad: "Hubungi sales kami untuk enterprise solution"
      }
    ]
  },
  
  // Brand Guidelines
  guidelines: {
    websiteURL: "https://kirasenang.com.my",
    socialMediaHandles: {
      facebook: "kirasenang",
      instagram: "@kirasenang",
      tiktok: "@kirasenang",
      linkedin: "company/kira-senang"
    },
    keyMessages: [
      "Accounting made simple for Malaysian SMEs",
      "Automate billing, invoicing, and expense tracking",
      "Built for Malaysia, by Malaysians",
      "Trusted by 1000+ businesses"
    ],
    targetAudience: "SME owners, Finance managers, Accountants in Malaysia",
    competitors: ["Xero", "QuickBooks", "Accounting software"],
    uniqueSellingPoints: [
      "Local support in BM",
      "Malaysian tax compliance",
      "Affordable pricing",
      "No setup cost"
    ],
    productHighlights: [
      "Double-entry accounting",
      "Automated bank reconciliation",
      "AI-powered expense categorization",
      "SST/GST compliance",
      "Multi-currency support"
    ]
  },
  
  // SOP (Standard Operating Procedures)
  sop: {
    contentApprovalProcess: "Editor → Manager → Publish",
    contentCalendarReviewPeriod: "Weekly",
    responseTurnaroundTime: "4 hours for comments",
    escalationProcess: "Comment → Email → WhatsApp",
    refundPolicy: "30-day money back",
    gdprComplianceLevel: "High",
    dataRetentionDays: 365
  },
  
  // Hashtag Library
  hashtagLibrary: {
    branded: ["#KiraSenang", "#AkauntanCerdasBM", "#BisnisSimple"],
    industry: ["#UKMMalaysia", "#AkauntanDigital", "#BisnisOnline"],
    seasonal: {
      "2026-01": ["#NegaraYear", "#BisnisBaruTahun"],
      "2026-03": ["#BisnisWoman", "#DayaTrabuhak"],
      "2026-06": ["#AmalTahunBaik"]
    },
    campaign: ["#TransformasiDigital", "#UKMPowerPlus"]
  },
  
  // Visual Assets
  visualAssets: {
    colorPalette: {
      primary: "#0D2137",
      secondary: "#1A9E8F",
      accent: "#FFA500",
      background: "#F5F5F5",
      text: "#333333"
    },
    typography: {
      headline: "Poppins Bold",
      body: "Inter Regular",
      caption: "Inter 12px"
    },
    logoURLs: {
      full: "gs://logo-full.png",
      icon: "gs://logo-icon.png",
      whiteBg: "gs://logo-white-bg.png"
    },
    templateFolderRef: "brands/BRAND_001/templates/",
    stockPhotosPreferred: ["unsplash:business", "pexels:startup"]
  },
  
  // FAQ & Responses
  commonQuestions: [
    {
      question: "Berapa kos untuk mulakan?",
      answer: "Mulai dari RM99/bulan. Tiada bayaran setup.",
      category: "Pricing"
    },
    {
      question: "Ada trial gratis?",
      answer: "Ya, 14 hari percuma tanpa kad kredit.",
      category: "Trial"
    }
  ],
  
  // CTA Library
  defaultCTA: {
    primary: "WhatsApp Kami",
    primaryAction: "https://wa.me/60175864815",
    secondary: "Daftar Percuma",
    secondaryAction: "https://sistem.kirasenang.com.my/register",
    tertiary: "Baca Selanjutnya",
    tertiaryAction: "https://kirasenang.com.my/blog"
  },
  
  // Team Members
  teamMembers: [
    {
      uid: "uid_user_1234",
      role: "Brand Manager",
      email: "nurul@kirasenang.com.my"
    },
    {
      uid: "uid_user_5678",
      role: "Content Editor",
      email: "marketing@kirasenang.com.my"
    }
  ],
  
  status: "ACTIVE"
}
```

**Firestore Rules:**
```
match /tenants/{tenantId}/workspaces/{workspaceId}/brands/{brandId} {
  allow read: if resource.data.tenantId == tenantId &&
               userHasAccessToTenant(tenantId);
  allow write: if resource.data.tenantId == tenantId &&
               userHasRole(tenantId, 'brand_manager');
  // Prevent editing of certain fields
  allow update: if !request.resource.data.diff(resource.data)
                  .affectedKeys()
                  .hasAny(['tenantId', 'createdAt', 'createdBy']);
}
```

---

### 2.3 `/tenants/{tenantId}/workspaces/{workspaceId}/brands/{brandId}/social_accounts/{accountId}`

Connected social media account.

```javascript
{
  // Identifiers
  id: "FB_PAGE_001",
  platform: "facebook",        // facebook, instagram, tiktok, linkedin, youtube
  createdAt: Timestamp,
  updatedAt: Timestamp,
  connectedBy: "uid_user_1234",
  
  // Platform-specific IDs
  platformPageId: "123456789",
  platformUsername: "kirasenang",
  displayName: "KIRA Senang",
  profilePictureUrl: "https://...",
  
  // Access Tokens (encrypted in Firestore)
  accessToken: "[ENCRYPTED_TOKEN]",
  refreshToken: "[ENCRYPTED_TOKEN]",
  tokenExpiresAt: Timestamp,
  scopes: ["pages_read_engagement", "pages_manage_posts", "pages_read_user_conversations"],
  
  // Account Status
  status: "ACTIVE",             // ACTIVE, DISCONNECTED, EXPIRED, REVOKED
  isVerified: true,
  verificationDate: Timestamp,
  
  // Metrics (cached from API)
  metrics: {
    followers: 5420,
    engagement_rate: 2.34,
    avg_post_reach: 320,
    lastSyncedAt: Timestamp,
    syncStatus: "SUCCESS"       // SUCCESS, PENDING, FAILED
  },
  
  // Posting Rules
  postingRules: {
    autoApproveBeforePost: false,
    requireHumanReview: true,
    maxPostsPerDay: 10,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    allowedPostTypes: ["caption", "carousel", "image", "video"],
    bannedWords: ["scam", "haram", "ban"]
  },
  
  // Response Template
  autoReplySettings: {
    enabled: true,
    template: "Terima kasih atas pertanyaan! Kami akan balas dalam 4 jam.",
    delayMinutes: 5
  },
  
  // Insights Settings
  insightsTracking: {
    trackReach: true,
    trackEngagement: true,
    trackFollowers: true,
    trackConversions: false,
    customMetrics: ["post_type", "posting_time", "caption_length"]
  },
  
  // Last Published Post
  lastPublishedPost: {
    postId: "content_12345",
    publishedAt: Timestamp,
    reach: 450,
    engagement: 23
  }
}
```

**Firestore Rules:**
```
match /tenants/{tenantId}/workspaces/{workspaceId}/brands/{brandId}/social_accounts/{accountId} {
  allow read: if userHasAccessToTenant(tenantId);
  allow write: if userHasRole(tenantId, 'social_media_manager') &&
               // Can only update non-critical fields
               !request.resource.data.diff(resource.data)
                 .affectedKeys()
                 .hasAny(['accessToken', 'refreshToken', 'platformPageId', 'id']);
}
```

---

### 2.4 `/tenants/{tenantId}/workspaces/{workspaceId}/knowledge_base/{docId}`

RAG source documents.

```javascript
{
  // Identifiers
  id: "KB_KIRA_PRODUCT_001",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "uid_admin",
  
  // Metadata
  title: "KIRA Senang Product Overview",
  category: "product",          // product, brand, marketing, culture, compliance, sop
  subcategory: "features",
  tags: ["POS", "Invoicing", "Expense", "Feature", "Benefit"],
  
  // Content
  content: """
  KIRA Senang adalah platform akaun awan untuk UKM Malaysia yang menyediakan:
  
  1. Sistem POS
  - Retail Point of Sale untuk kedai runcit
  - Integrasi dengan printer thermal
  - Inventory management
  - Loyalty program
  
  2. Invoicing & Billing
  - Jenis-jenis invois (standard, proforma, credit note)
  - SST/GST automatic calculation
  - Recurring invoices
  - Payment reminders
  
  3. Expense Tracking
  - Bank reconciliation automation
  - Receipt scanning dengan AI
  - Expense categorization
  - Mileage tracking
  
  4. Reporting
  - Profit & Loss statement
  - Balance Sheet
  - Cash flow statement
  - Custom reports
  
  Pricing:
  - FREE: Basic features
  - STARTER: RM99/month
  - PRO: RM199/month
  - ENTERPRISE: Custom pricing
  """,
  
  // Visibility
  visibility: "public",         // public, team, private
  shareWith: ["WORKSPACE_001"],
  
  // Versioning
  version: 3,
  versionHistory: [
    {
      version: 1,
      editedBy: "uid_admin",
      editedAt: Timestamp,
      changes: "Initial document"
    },
    {
      version: 2,
      editedBy: "uid_user_1234",
      editedAt: Timestamp,
      changes: "Updated pricing"
    }
  ],
  
  // RAG Metadata
  vectorEmbedding: "[VECTOR_ARRAY]",  // For future migration to Vector DB
  embeddingModel: "text-embedding-3-small",
  embeddingUpdatedAt: Timestamp,
  
  // AI Processing
  aiSummary: "KIRA Senang adalah SaaS akaun awan all-in-one untuk UKM...",
  keyPhrases: ["POS system", "Invoicing", "SST compliance", "RM99/month"],
  
  status: "PUBLISHED"           // DRAFT, PUBLISHED, ARCHIVED
}
```

**Firestore Rules:**
```
match /tenants/{tenantId}/workspaces/{workspaceId}/knowledge_base/{docId} {
  allow read: if (resource.data.visibility == 'public' || 
                  userHasAccessToTenant(tenantId)) &&
              resource.data.status != 'DRAFT';
  allow write: if userHasRole(tenantId, 'content_manager');
}
```

---

### 2.5 `/tenants/{tenantId}/workspaces/{workspaceId}/content/{contentId}`

Content drafts and published pieces.

```javascript
{
  // Identifiers
  id: "content_20260715_001",
  tenantId: "TENANT_0001",
  workspaceId: "WORKSPACE_001",
  brandId: "BRAND_001",
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  publishedAt: Timestamp (null if draft),
  scheduledAt: Timestamp (null if not scheduled),
  
  // Ownership & Workflow
  createdBy: "uid_user_1234",
  lastEditedBy: "uid_user_1234",
  approvedBy: "uid_user_5678" (null if not approved),
  approvalDate: Timestamp (null if not approved),
  
  // Content Metadata
  title: "Promo POS Spesial Bulan Ramadan",
  contentType: "caption",       // caption, carousel, blog, reel, thread, email, proposal
  platform: "facebook",         // facebook, instagram, tiktok, linkedin, youtube, email
  
  // Content Body
  caption: """
  🌙 Sambut Ramadan bersama KIRA Senang!
  
  Sistem POS kami kini lebih cepat dan pintar:
  ✓ Transaksi lebih pantas
  ✓ Laporan instan
  ✓ Inventory auto-update
  
  Dapatkan DISKAUN 30% untuk 3 bulan pertama!
  
  Promo hanya untuk 100 pendaftar pertama! ⏰
  
  WhatsApp kami sekarang: 
  https://wa.me/60175864815
  
  #KiraSenang #BisnisRamadan #POSMalaysia
  """,
  
  // Structured Data
  cta: {
    primary: "WhatsApp Kami",
    primaryURL: "https://wa.me/60175864815",
    secondary: "Daftar Percuma",
    secondaryURL: "https://sistem.kirasenang.com.my/register"
  },
  
  hashtags: [
    "#KiraSenang",
    "#BisnisRamadan",
    "#POSMalaysia",
    "#UKMMalaysia",
    "#TransformasiDigital"
  ],
  
  // Media Attachments
  mediaAttachments: [
    {
      type: "image",
      url: "gs://aidmos-production.appspot.com/media/promo-pos-ramadan.jpg",
      storageRef: "tenants/TENANT_0001/media/promo-pos-ramadan.jpg",
      altText: "KIRA Senang POS Ramadan Promo",
      dimensions: { width: 1200, height: 630 }
    }
  ],
  
  // AI Generation Metadata
  generatedBy: "content-agent",
  aiModel: "claude-sonnet-4.6",
  generationPrompt: "Generate caption untuk promo POS...",
  tokensUsed: 450,
  generationTime: 8.5,          // seconds
  
  // Version History
  editHistory: [
    {
      version: 1,
      editedAt: Timestamp,
      editedBy: "content-agent",
      action: "Generated by AI"
    },
    {
      version: 2,
      editedAt: Timestamp,
      editedBy: "uid_user_1234",
      action: "Human edit: Added emoji"
    }
  ],
  
  // Status & Workflow
  status: "APPROVED",           // DRAFT, UNDER_REVIEW, APPROVED, SCHEDULED, PUBLISHED, ARCHIVED
  reviewNotes: "Good caption, adds urgency. Approved for posting.",
  
  // Scheduling
  schedule: {
    scheduledAt: Timestamp,
    platforms: ["facebook", "instagram"],
    autoPost: true,
    retryOnFailure: true
  },
  
  // Performance (if published)
  performance: {
    reach: 2450,
    impressions: 3100,
    engagement: 87,
    likes: 45,
    comments: 12,
    shares: 5,
    clicks: 23,
    engagementRate: 2.8
  },
  
  // Tags & Organization
  tags: ["ramadan", "promo", "pos", "seasonal"],
  campaign: "RAMADAN_2026",
  priority: "high"
}
```

**Firestore Rules:**
```
match /tenants/{tenantId}/workspaces/{workspaceId}/content/{contentId} {
  allow read: if (resource.data.tenantId == tenantId &&
                  (resource.data.status != 'DRAFT' || resource.data.createdBy == request.auth.uid));
  allow create: if resource.data.tenantId == tenantId &&
                  userHasRole(tenantId, 'content_creator');
  allow update: if resource.data.tenantId == tenantId &&
                  (resource.data.createdBy == request.auth.uid || 
                   userHasRole(tenantId, 'content_manager'));
  allow delete: if resource.data.tenantId == tenantId &&
                  userHasRole(tenantId, 'admin');
}
```

---

### 2.6 `/tenants/{tenantId}/workspaces/{workspaceId}/agent_logs/{logId}`

Execution logs for debugging and audit.

```javascript
{
  // Identifiers
  id: "log_20260715_1234",
  tenantId: "TENANT_0001",
  workspaceId: "WORKSPACE_001",
  timestamp: Timestamp,
  
  // Agent Info
  agentName: "content-agent",
  agentModule: "caption",
  agentVersion: "1.0.0",
  
  // Request
  input: {
    type: "caption",
    brief: "Promo POS Ramadan",
    platform: "facebook",
    brandContext: "BRAND_001"
  },
  
  // Process
  processedBy: "uid_user_1234",
  requestId: "req_abc123xyz",
  
  // Execution
  status: "SUCCESS",            // SUCCESS, PARTIAL, FAILED, TIMEOUT
  duration: 8.5,                // seconds
  
  // API Calls
  apiCalls: [
    {
      service: "knowledge-agent",
      endpoint: "queryRAG",
      duration: 1.2,
      inputTokens: 150,
      outputTokens: 200,
      success: true
    },
    {
      service: "anthropic",
      endpoint: "messages.create",
      model: "claude-sonnet-4.6",
      duration: 7.1,
      inputTokens: 1200,
      outputTokens: 450,
      success: true,
      cost: 0.0045
    }
  ],
  
  // Output
  output: {
    caption: "🌙 Sambut Ramadan...",
    cta: "WhatsApp Kami",
    hashtags: ["#KiraSenang", "#BisnisRamadan"],
    reasoning: "Focused on urgency and local context"
  },
  
  // Error Handling (if failed)
  error: null,
  errorMessage: null,
  errorStackTrace: null,
  
  // Cost Tracking
  totalTokensUsed: 1650,
  estimatedCost: 0.0048,        // USD
  
  // Metadata
  userAgent: "Mozilla/5.0...",
  ipAddress: "[MASKED_FOR_PRIVACY]",
  environment: "production"
}
```

**Firestore Rules:**
```
match /tenants/{tenantId}/workspaces/{workspaceId}/agent_logs/{logId} {
  allow read: if userHasRole(tenantId, 'admin') || 
              userHasRole(tenantId, 'analytics_viewer');
  allow write: if request.auth.token.firebase.sign_in_provider == 'custom';
  allow delete: if false;  // Immutable for audit
}
```

---

### 2.7 `/tenants/{tenantId}/workspaces/{workspaceId}/usage_logs/{logId}`

Token and cost tracking for billing.

```javascript
{
  // Identifiers
  id: "usage_20260715",
  tenantId: "TENANT_0001",
  date: "2026-07-15",
  month: "2026-07",
  
  // Daily Summary
  apiCalls: 127,
  successfulCalls: 125,
  failedCalls: 2,
  
  // Tokens
  totalInputTokens: 45200,
  totalOutputTokens: 18900,
  totalTokens: 64100,
  
  // Cost Breakdown
  anthropicTokensCost: 0.32,
  openaiTokensCost: 0.00,
  openaiImagesCost: 0.00,
  storageCost: 0.05,
  totalCost: 0.37,
  
  // Usage by Agent
  agentUsage: {
    "content-agent": {
      calls: 45,
      tokens: 28000,
      cost: 0.14
    },
    "marketing-agent": {
      calls: 23,
      tokens: 18500,
      cost: 0.09
    },
    "analytics-agent": {
      calls: 12,
      tokens: 8200,
      cost: 0.04
    },
    "comment-agent": {
      calls: 47,
      tokens: 9400,
      cost: 0.10
    }
  },
  
  // Usage by Platform
  platformUsage: {
    "facebook": 52,
    "instagram": 38,
    "tiktok": 23,
    "linkedin": 14
  },
  
  // Peak Usage Time
  peakHour: "18:00",
  peakHourCalls: 18,
  
  // Performance Metrics
  avgResponseTime: 6.2,         // seconds
  maxResponseTime: 42.1,
  minResponseTime: 1.3,
  p95ResponseTime: 15.2,
  
  // Status
  billingPeriodEnds: Timestamp  // For monthly reconciliation
}
```

---

## 3. SECURITY RULES (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function userHasRole(tenantId, role) {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
               .data.roles[tenantId] in [role, 'admin'];
    }
    
    function userHasAccessToTenant(tenantId) {
      return request.auth != null && 
             request.auth.uid in get(/databases/$(database)/documents/tenants/$(tenantId)/company/meta)
               .data.teamMemberUIDs;
    }
    
    function isAdmin(tenantId) {
      return userHasRole(tenantId, 'admin');
    }
    
    // TENANT ISOLATION
    match /tenants/{tenantId} {
      // Company metadata
      match /company {
        allow read: if userHasAccessToTenant(tenantId);
        allow write: if isAdmin(tenantId) &&
                     request.resource.data.diff(resource.data)
                       .affectedKeys()
                       .hasOnly(['updatedAt', 'colorPrimary', 'colorSecondary', 
                                'logoUrl', 'address', 'email', 'settings']);
      }
      
      // Workspaces
      match /workspaces/{workspaceId} {
        // Brands
        match /brands/{brandId} {
          allow read: if userHasAccessToTenant(tenantId);
          allow write: if userHasRole(tenantId, 'brand_manager');
          
          // Social Accounts
          match /social_accounts/{accountId} {
            allow read: if userHasAccessToTenant(tenantId);
            allow write: if userHasRole(tenantId, 'social_media_manager') &&
                         !request.resource.data.diff(resource.data)
                           .affectedKeys()
                           .hasAny(['accessToken', 'refreshToken', 'platformPageId']);
          }
        }
        
        // Knowledge Base
        match /knowledge_base/{docId} {
          allow read: if (resource.data.visibility == 'public' ||
                          userHasAccessToTenant(tenantId));
          allow write: if userHasRole(tenantId, 'content_manager');
        }
        
        // Content
        match /content/{contentId} {
          allow read: if (resource.data.status != 'DRAFT' ||
                          resource.data.createdBy == request.auth.uid ||
                          userHasRole(tenantId, 'content_manager'));
          allow create: if userHasRole(tenantId, 'content_creator');
          allow update: if (resource.data.createdBy == request.auth.uid ||
                            userHasRole(tenantId, 'content_manager'));
          allow delete: if isAdmin(tenantId);
        }
        
        // Published Posts
        match /published_posts/{postId} {
          allow read: if userHasAccessToTenant(tenantId);
          allow create: if userHasRole(tenantId, 'automation_engine');
          allow update: if userHasRole(tenantId, 'automation_engine');
          allow delete: if false;  // Immutable for audit
        }
        
        // Agent Logs
        match /agent_logs/{logId} {
          allow read: if userHasRole(tenantId, 'admin') ||
                       userHasRole(tenantId, 'analytics_viewer');
          allow write: if false;  // Immutable, written by backend
          allow delete: if false;  // Immutable for audit
        }
        
        // Usage Logs
        match /usage_logs/{logId} {
          allow read: if userHasRole(tenantId, 'admin') ||
                       userHasRole(tenantId, 'billing_viewer');
          allow write: if false;  // Immutable, written by backend
          allow delete: if false;  // Immutable for audit
        }
      }
      
      // Tenant Audit Logs
      match /audit_logs/{logId} {
        allow read: if isAdmin(tenantId);
        allow write: if false;  // Immutable, written by backend
        allow delete: if false;
      }
    }
    
    // USERS
    match /users/{uid} {
      allow read: if request.auth.uid == uid || 
                  isAdmin(uid);  // Only can read own profile
      allow write: if request.auth.uid == uid &&
                   request.resource.data.diff(resource.data)
                     .affectedKeys()
                     .hasOnly(['preferences', 'updatedAt', 'notifications']);
    }
    
    // SUBSCRIPTIONS
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null &&
                  request.auth.uid == resource.data.adminUID;
      allow write: if false;  // Handled by Stripe webhooks
    }
    
    // BILLING EVENTS
    match /billing_events/{eventId} {
      allow read: if request.auth != null &&
                  resource.data.tenantId in get(/databases/$(database)/documents/users/$(request.auth.uid))
                    .data.tenants;
      allow write: if false;  // Handled by backend service
    }
    
    // GLOBAL SETTINGS
    match /global_settings/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;  // Admin-only via backend
    }
  }
}
```

---

## 4. FIRESTORE INDEXES

**Automatic Indexes (created by Firebase):**

```
Collection: /tenants/{tenantId}/workspaces/{workspaceId}/content
Fields:
  - status (Ascending)
  - createdAt (Descending)
Query: Find all DRAFT posts, newest first

Collection: /tenants/{tenantId}/workspaces/{workspaceId}/published_posts
Fields:
  - platform (Ascending)
  - publishedAt (Descending)
Query: Find posts by platform, newest first

Collection: /tenants/{tenantId}/workspaces/{workspaceId}/agent_logs
Fields:
  - agentName (Ascending)
  - timestamp (Descending)
Query: Find logs by agent type and time

Collection: /tenants/{tenantId}/workspaces/{workspaceId}/usage_logs
Fields:
  - month (Descending)
  - totalCost (Descending)
Query: Find monthly usage for billing
```

**Manual Composite Indexes (enable in Firebase Console):**

```
Collection: /tenants/{tenantId}/workspaces/{workspaceId}/content
Fields: status (Asc), createdBy (Asc), createdAt (Desc)
Query: Find drafts created by specific user, newest first

Collection: /tenants/{tenantId}/workspaces/{workspaceId}/agent_logs
Fields: agentName (Asc), status (Asc), timestamp (Desc)
Query: Find failed logs for specific agent
```

---

## 5. DATA ENCRYPTION

**Encrypted Fields (in Firestore):**

```
/tenants/{tenantId}/workspaces/{workspaceId}/brands/{brandId}/social_accounts/{accountId}
├─ accessToken [ENCRYPTED with Google KMS]
├─ refreshToken [ENCRYPTED with Google KMS]
└─ scope [ENCRYPTED with Google KMS]

/users/{uid}
├─ personalEmail [ENCRYPTED]
└─ phoneNumber [ENCRYPTED]
```

**Encryption Method:**

```javascript
// Backend encryption (Node.js)
const crypto = require('crypto');
const googleKms = require('@google-cloud/kms');

async function encryptAccessToken(token, tenantId) {
  const client = new googleKms.KeyManagementServiceClient();
  const projectId = 'aidmos-production';
  const locationId = 'asia-southeast1';
  const keyRingId = 'aidmos-keys';
  const cryptoKeyId = 'social-tokens';
  
  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );
  
  const plaintext = Buffer.from(token);
  const [encryptResponse] = await client.encrypt({name, plaintext});
  
  return encryptResponse.ciphertext.toString('base64');
}
```

---

## 6. BACKUP & RECOVERY

```
Daily Automatic Backups:
├─ Firestore automatic backup (Google-managed, 7 days retention)
├─ Cloud Storage backup (daily export at 2am MYT)
├─ Versioning enabled for critical collections
└─ Recovery RTO: < 1 hour

Manual Backups (Before major changes):
├─ Export collection to Cloud Storage
├─ Version number stored in metadata
└─ Retention: 30 days

Disaster Recovery:
├─ RPO (Recovery Point Objective): 1 day
├─ RTO (Recovery Time Objective): 4 hours
├─ Tested quarterly via disaster recovery drills
└─ Runbook: /docs/DISASTER-RECOVERY.md
```

---

**Document Version:** 1.0  
**Last Updated:** 15 July 2026  
**Maintained By:** AI-DMOS Database Team  

Next: See 05-API-SPECIFICATION.md, 06-AI-AGENTS.md
