# 02 — SYSTEM ARCHITECTURE

**Version:** 1.0  
**Last Updated:** 15 July 2026  

---

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           END USER BROWSER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  React App (Vite)     React Router    Zustand Store    TanStack Query  │
│                                                                          │
│  Components:                                                             │
│  - Login/Register    - Dashboard      - Agent Interface                 │
│  - Company Profile   - Calendar       - History Panel                   │
│  - Chat Panel        - Analytics      - Settings                        │
│                                                                          │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         │ HTTPS (TLS 1.3)
                         │
        ┌────────────────┴────────────────┐
        │                                  │
┌───────▼──────────────────────────────────▼──────────┐
│         Firebase Hosting (asia-southeast1)          │
│  - Static assets delivery                            │
│  - CDN edge caching                                  │
│  - Custom domain: app.aidmos.my                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ API Calls to /api/v1/*
                 │
┌────────────────▼─────────────────────────────────────┐
│      Cloud Run (Node.js + Express)                   │
│      Region: asia-southeast1                         │
│      Auto-scaling: 0-100 instances                   │
│                                                      │
│  Middleware:                                         │
│  ├─ Authentication (Firebase JWT verify)            │
│  ├─ CORS (allowlist: app.aidmos.my)                 │
│  ├─ Rate Limiting (100 req/min per user)            │
│  ├─ Request Logging (Winston logger)                │
│  └─ Error Handling (Sentry)                         │
│                                                      │
│  Routes:                                             │
│  ├─ POST /api/v1/auth/*                             │
│  ├─ POST /api/v1/agents/ceo/process                 │
│  ├─ POST /api/v1/agents/knowledge/query             │
│  ├─ POST /api/v1/agents/content/*                   │
│  ├─ POST /api/v1/agents/marketing/*                 │
│  ├─ GET  /api/v1/analytics/*                        │
│  ├─ POST /api/v1/company/profile                    │
│  └─ POST /api/v1/media/upload                       │
│                                                      │
│  Services:                                           │
│  ├─ firebaseService (Auth, Firestore)               │
│  ├─ anthropicService (Claude API calls)             │
│  ├─ openaiService (DALL-E, GPT)                     │
│  ├─ metaGraphService (Facebook Graph API)           │
│  └─ storageService (Firebase Storage, signed URLs)  │
│                                                      │
└────────────────┬────────────────┬───────────────────┘
                 │                │
         ┌───────┴─────┬──────────┴──────────┬───────────┐
         │             │                     │           │
    ┌────▼────┐  ┌────▼────┐  ┌────────────▼──┐  ┌────▼────┐
    │ Firebase │  │ Claude  │  │  OpenAI API  │  │  Meta   │
    │ Auth &   │  │ Sonnet  │  │  (DALL-E)   │  │ Graph   │
    │ Firestore│  │ 4.6 API │  │              │  │  API    │
    │          │  │         │  │              │  │         │
    │Database: │  │Model:   │  │Model:        │  │Facebook │
    │- Users  │  │- Text   │  │- Image Gen  │  │- Posts  │
    │- Tenants│  │- Reason │  │- Edit       │  │- Insights│
    │- Content│  │- Plan   │  │- Resize     │  │- Auth   │
    └────┬────┘  └────┬────┘  └────┬────────┘  └────┬────┘
         │            │             │               │
         └─────────────┴─────────────┴───────────────┘
              External APIs (Secure)
```

---

## 2. AI AGENT ORCHESTRATION FLOW

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER INPUT                                    │
│   "Generate caption untuk promo POS KIRA Senang bulan Ramadan"   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ POST /api/v1/agents/ceo/process
                         │ { input, tenantId, brandId, context }
                         │
         ┌───────────────▼────────────────────┐
         │      CEO AGENT (Orchestrator)       │
         │  Claude Sonnet 4.6                  │
         │                                    │
         │  Task: Understand input              │
         │  Plan: Assign to appropriate agents │
         │  Decide: Which agents to call       │
         │                                    │
         │  Decision Tree:                    │
         │  ├─ Is it content request?        │
         │  │  ├─ → Call Content Agent       │
         │  │  ├─ + Call Trend Agent          │
         │  │  └─ + Call Marketing Agent      │
         │  ├─ Is it analytics request?       │
         │  │  └─ → Call Analytics Agent      │
         │  ├─ Is it scheduling?              │
         │  │  └─ → Call Planner Agent        │
         │  └─ Is it comment reply?           │
         │     └─ → Call Comment Agent        │
         │                                    │
         │  Output: Task plan                  │
         │  { agents_to_call, inputs }        │
         └────────┬──────────┬──────┬──────────┘
                  │          │      │
         ┌────────▼┐   ┌─────▼──┐  ┌─▼──────────┐
         │         │   │        │  │            │
    ┌────▼─────────▼───▼────────▼──▼────────┐
    │   KNOWLEDGE AGENT (RAG Hub)             │
    │   Claude Sonnet 4.6                    │
    │                                        │
    │   Purpose: Supply context               │
    │   Query: knowledge/ folder              │
    │   Inject: Malaysian context             │
    │                                        │
    │   Knowledge Fetched:                    │
    │   ├─ Ramadan context (culture)         │
    │   ├─ POS context (product)             │
    │   ├─ SME best practices                │
    │   ├─ Tone guidelines (brand voice)     │
    │   └─ Copywriting principles            │
    │                                        │
    │   Output: Enhanced context               │
    │   { knowledge_snippets, references }   │
    └────────┬──────────┬──────┬──────────────┘
             │          │      │
    ┌────────▼──┐  ┌────▼──┐  ┌──▼────────────┐
    │            │  │       │  │              │
┌───▼──────────────────────────────────────────────────────────────┐
│              PARALLEL EXECUTION (3 Agents)                       │
├───┬──────────────────────┬───────────────────┬─────────────────┤
│   │                      │                   │                 │
│ 1 │ CONTENT AGENT        │ 2 TREND AGENT    │ 3 MARKETING    │
│   │                      │                   │   AGENT        │
│   │ Input:               │ Input:            │ Input:          │
│   │ ├─ Type: Caption     │ ├─ Season:        │ ├─ Goal:        │
│   │ ├─ Context: POS      │ │  Ramadan        │ │ Promote POS   │
│   │ ├─ Brand: KIRA       │ ├─ Trend DB:      │ ├─ Funnel:      │
│   │ └─ Knowledge: RAG    │ │  Malaysian      │ │ Awareness→Trials
│   │                      │ └─ Output:        │ └─ Output:       │
│   │ Process:             │    Ideas, angles  │  Strategy       │
│   │ ├─ Analyze brief     │                  │  - Positioning  │
│   │ ├─ Draft caption     │                  │  - Messaging    │
│   │ ├─ Add CTA           │                  │  - Timeline     │
│   │ ├─ Add emoji         │                  │  - Channels     │
│   │ ├─ Optimize length   │                  │  - KPI          │
│   │ └─ Draft hashtags    │                  │                 │
│   │                      │                  │                 │
│   │ Output:              │                  │                 │
│   │ ├─ Caption variants  │                  │                 │
│   │ ├─ CTA options       │                  │                 │
│   │ ├─ Hashtags (5-10)   │                  │                 │
│   │ └─ Reasoning         │                  │                 │
│   │                      │                  │                 │
└───┴──────────┬───────────┴────────┬─────────┴─────────┬────────┘
               │                    │                   │
               │ Results collected  │                   │
               └────────────┬───────┴───────────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │   CEO AGENT (Review & Consolidate)  │
         │                                    │
         │  Task: Combine outputs              │
         │  Review: Consistency check          │
         │  Enhance: Connect ideas             │
         │  Format: Prepare final response     │
         │                                    │
         │  Checklist:                         │
         │  ✓ Caption menarik?                 │
         │  ✓ CTA clear?                       │
         │  ✓ Hashtag relevant?                │
         │  ✓ Tone consistent?                 │
         │  ✓ No Indonesian slang?             │
         │  ✓ Context accurate?                │
         │                                    │
         │  Output: Final response             │
         │  { caption, cta, hashtags, reason} │
         └────────┬─────────────────────────────┘
                  │
                  │ Save to Firestore
                  │ - content collection
                  │ - agent_logs collection
                  │
         ┌────────▼──────────────────┐
         │   RETURN TO USER           │
         │   Via response JSON        │
         │                            │
         │   Display in UI:           │
         │   ├─ Caption (editable)    │
         │   ├─ CTA (selectable)      │
         │   ├─ Hashtags              │
         │   ├─ Reasoning             │
         │   └─ Action buttons:       │
         │      ├─ Copy to Clipboard  │
         │      ├─ Save to History    │
         │      ├─ Edit & Regenerate  │
         │      └─ Share with Team    │
         └────────────────────────────┘
```

---

## 3. MULTI-TENANT DATA ISOLATION

```
┌────────────────────────────────────────────────────────────────────┐
│                    FIRESTORE COLLECTIONS                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  /tenants/TENANT_0001/  (KIRA Senang)                             │
│  ├─ /company/                                                     │
│  │  └─ { name, logo, colors, website }                           │
│  ├─ /workspaces/WORKSPACE_001/                                   │
│  │  ├─ /brands/BRAND_001/                                        │
│  │  │  ├─ { name, voice, guidelines }                           │
│  │  │  └─ /social_accounts/                                     │
│  │  │     ├─ FB_PAGE_001 { pageId, token, metrics }            │
│  │  │     ├─ IG_PROFILE_001 { username, token }                │
│  │  │     ├─ TIKTOK_001 { handle, token }                      │
│  │  │     └─ LINKEDIN_001 { pageId, token }                    │
│  │  │                                                            │
│  │  ├─ /knowledge_base/                                         │
│  │  │  ├─ KIRA_PRODUCT { product info, SOP, guidelines }       │
│  │  │  ├─ KIRA_TONE { brand voice, personality }               │
│  │  │  └─ KIRA_FAQS { common questions, answers }              │
│  │  │                                                            │
│  │  ├─ /content/                                               │
│  │  │  ├─ CONTENT_001 { title, caption, type, status }         │
│  │  │  ├─ CONTENT_002 { draft state }                          │
│  │  │  └─ CONTENT_003 { published state }                      │
│  │  │                                                            │
│  │  └─ /agent_logs/                                            │
│  │     ├─ LOG_001 { agent, input, output, tokens, timestamp }  │
│  │     └─ LOG_002 { error logs }                               │
│  │                                                              │
│  └─ /usage_logs/                                               │
│     ├─ USAGE_2026_07_15 { tokens used, cost, agents }         │
│     └─ USAGE_MONTHLY_SUMMARY { billing data }                 │
│                                                                │
│  /tenants/TENANT_0002/  (Future Customer #2)                  │
│  ├─ /company/                                                 │
│  └─ [Same structure as TENANT_0001]                           │
│                                                                │
│  /users/                                                       │
│  └─ UID_XXXX { email, name, role, tenants[] }                │
│                                                                │
│  /audit_logs/                                                 │
│  └─ AUDIT_001 { action, tenantId, userId, changes, timestamp }
│                                                                │
└────────────────────────────────────────────────────────────────────┘

SECURITY RULES (Firestore):
────────────────────────────

✓ Collection /tenants/{tenantId}/* 
  → Only users with role='admin' for that tenant

✓ Collection /users/{uid} 
  → User dapat read/write own document

✓ Collection /audit_logs 
  → Only service account (backend) dapat write

✓ Cross-tenant access 
  → BLOCKED (query filter by tenantId from JWT claims)

```

---

## 4. API COMMUNICATION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
│                                                                 │
│  Example: User klik "Generate Caption"                          │
│                                                                 │
│  dispatch(generateCaption({                                    │
│    input: "Promo POS bulan Ramadan",                           │
│    tenantId: "TENANT_0001",                                    │
│    brandId: "BRAND_001",                                       │
│    tone: "Professional, Friendly"                             │
│  }))                                                           │
│                                                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ TanStack Query mutation
             │ → POST /api/v1/agents/ceo/process
             │
             │ Headers:
             │ Authorization: Bearer {JWT_TOKEN}
             │ Content-Type: application/json
             │
    ┌────────▼─────────────────────────────┐
    │    CLOUD RUN (Node.js Backend)       │
    │                                      │
    │  1. Middleware Check                 │
    │     ├─ Verify JWT signature          │
    │     ├─ Extract tenantId from token   │
    │     ├─ Rate limit check              │
    │     └─ Log request                   │
    │                                      │
    │  2. Input Validation                 │
    │     ├─ Zod schema check              │
    │     ├─ Sanitize text inputs          │
    │     └─ Validate tenantId             │
    │                                      │
    │  3. Route Handler                    │
    │     POST /api/v1/agents/ceo/process  │
    │                                      │
    │     controller.processCEOTask({      │
    │       input,                         │
    │       tenantId,                      │
    │       userId (from JWT)              │
    │     })                               │
    │                                      │
    │  4. Service Layer                    │
    │     agentsService.executeCEOPlan({   │
    │       analyzedInput,                 │
    │       context: {                     │
    │         knowledge,                   │
    │         brand,                       │
    │         tone                         │
    │       }                              │
    │     })                               │
    │                                      │
    │  5. AI Call Layer                    │
    │     ├─ Call Knowledge Agent          │
    │     │  → fetchContext(tenantId)      │
    │     │  → queryRAG(input)             │
    │     ├─ Call CEO Agent                │
    │     │  → anthropic.messages.create({│
    │     │      model: "claude-sonnet",   │
    │     │      system: CEO_PROMPT,       │
    │     │      messages: [input]         │
    │     │    })                          │
    │     └─ Parse & Structure Response    │
    │                                      │
    │  6. Logging & Storage                │
    │     ├─ Save to agent_logs            │
    │     ├─ Save to usage_logs            │
    │     ├─ Track tokens used             │
    │     └─ Calculate cost                │
    │                                      │
    │  7. Response Format                  │
    │     {                                │
    │       success: true,                 │
    │       data: {                        │
    │         caption: "...",              │
    │         cta: "...",                  │
    │         hashtags: [...],             │
    │         reasoning: "...",            │
    │         timestamp,                   │
    │         agentLogs                    │
    │       },                             │
    │       meta: {                        │
    │         tokensUsed,                  │
    │         costUSD,                     │
    │         executionTime                │
    │       }                              │
    │     }                                │
    │                                      │
    └────────┬──────────────────────────────┘
             │
             │ Return via HTTP 200 (or 400/500)
             │ Stream progress via Server-Sent Events (future)
             │
    ┌────────▼──────────────────┐
    │   FRONTEND (React)        │
    │                          │
    │   TanStack Query onSuccess│
    │   │                       │
    │   ├─ Update UI state      │
    │   ├─ Show caption         │
    │   ├─ Display hashtags     │
    │   ├─ Play success sound   │
    │   └─ Enable edit buttons  │
    │                          │
    │   User dapat:             │
    │   ├─ Copy caption         │
    │   ├─ Edit & regenerate    │
    │   ├─ Save to history      │
    │   ├─ Export to Markdown   │
    │   └─ Schedule to publish  │
    │                          │
    └───────────────────────────┘
```

---

## 5. DATABASE QUERY OPTIMIZATION

```
FIRESTORE INDEXES (Automatically Created by Firebase):
─────────────────────────────────────────────────────

1. Composite Index: /tenants/{tenantId}/content
   Fields: status (Asc), createdAt (Desc)
   → Query all DRAFT posts, newest first

2. Composite Index: /tenants/{tenantId}/published_posts
   Fields: platform (Asc), publishedAt (Desc)
   → Query Facebook posts published this month

3. Composite Index: /tenants/{tenantId}/usage_logs
   Fields: createdAt (Desc)
   → Query daily/monthly usage

4. Composite Index: /tenants/{tenantId}/agent_logs
   Fields: agent (Asc), createdAt (Desc)
   → Track which agent was used and when

CACHING STRATEGY:
─────────────────

Level 1: Browser Cache (localStorage/IndexedDB)
├─ Brand info (15 min TTL)
├─ Knowledge base (30 min TTL)
└─ Hashtag templates (1 hour TTL)

Level 2: Cloud Run Memory (Node.js)
├─ Brand info (60 min TTL)
├─ Knowledge snippets (30 min TTL)
└─ Rate limiting tokens (per minute)

Level 3: Firestore (Persistent)
├─ Full collections
├─ Real-time sync via listeners
└─ Offline support (via mobile SDKs)

```

---

## 6. SECURITY LAYERS

```
┌──────────────────────────────────────────────────────────────────┐
│                   SECURITY ARCHITECTURE                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 1: Network Security                                      │
│  ├─ TLS 1.3 (Firebase Hosting → Cloud Run)                     │
│  ├─ CORS whitelist (only app.aidmos.my)                        │
│  ├─ HSTS headers (force HTTPS)                                 │
│  └─ CSP headers (block inline scripts)                         │
│                                                                  │
│  LAYER 2: Authentication                                        │
│  ├─ Firebase Auth (email/password, Google OAuth)               │
│  ├─ JWT token (RS256 signed by Firebase)                       │
│  ├─ Token expiry: 1 hour (access), 7 days (refresh)           │
│  └─ Secure cookie storage (HttpOnly)                           │
│                                                                  │
│  LAYER 3: Authorization                                         │
│  ├─ Role-Based Access Control (RBAC)                           │
│  │  ├─ admin (full access)                                     │
│  │  ├─ editor (can create/edit content)                       │
│  │  ├─ viewer (read-only)                                     │
│  │  └─ analyst (analytics only)                               │
│  ├─ Firestore Rules (row-level security)                       │
│  └─ API endpoint guards (@AuthGuard middleware)               │
│                                                                  │
│  LAYER 4: Data Validation                                       │
│  ├─ Zod schema validation (request body)                       │
│  ├─ Sanitize HTML/Script input (sanitize-html)               │
│  ├─ Rate limiting (100 req/min per user)                      │
│  └─ Input length limits (max 10KB)                            │
│                                                                  │
│  LAYER 5: API Key Management                                    │
│  ├─ Anthropic API key → Cloud Secret Manager                  │
│  ├─ OpenAI API key → Cloud Secret Manager                     │
│  ├─ Facebook Access Token → Firestore (encrypted)            │
│  ├─ Keys rotated every 90 days                                │
│  └─ Audit log every access                                    │
│                                                                  │
│  LAYER 6: Data Privacy                                          │
│  ├─ End-to-end encryption for sensitive fields                │
│  ├─ PII data masked in logs                                   │
│  ├─ Data retention policy (12 months)                         │
│  ├─ GDPR/PDPA compliance                                      │
│  └─ User data export on demand                                │
│                                                                  │
│  LAYER 7: Audit Logging                                         │
│  ├─ Every API call logged (timestamp, userId, action)         │
│  ├─ Agent outputs logged for compliance                        │
│  ├─ Failed login attempts tracked                             │
│  ├─ Suspicious activity alerts (>10 failed logins)            │
│  └─ Logs stored in /audit_logs (immutable)                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. SCALING STRATEGY

```
HORIZONTAL SCALING (Cloud Run):
───────────────────────────────

Current Config:
├─ Min instances: 0
├─ Max instances: 100
├─ CPU: 2 vCPU per instance
├─ Memory: 4GB per instance
├─ Concurrency: 100 requests per instance
└─ Timeout: 3600 seconds (1 hour for long-running tasks)

Auto-scaling Triggers:
├─ CPU > 70% → scale up
├─ Memory > 80% → scale up
├─ Requests queue > 1000 → scale up
└─ Requests < 100 → scale down (after 5 min idle)

Estimated Capacity:
├─ Current: 10,000 concurrent requests
├─ Cost estimate (if 100% utilized): ~$500/month compute
├─ At 30% utilization (realistic): ~$150/month compute
└─ Can handle 100K+ MAU without optimization

VERTICAL SCALING (Database):
────────────────────────────

Firestore:
├─ Phase 1 (MVP 1-2): Firestore native (no optimization needed)
├─ Phase 2 (1K+ users): Add caching layer (Redis)
├─ Phase 3 (10K+ users): Consider Firestore Data Connect
└─ Phase 4 (100K+ users): Migrate to PostgreSQL + Vector DB

Cost Escalation:
├─ 10 users: $5/month (Firestore)
├─ 100 users: $25/month (Firestore + caching)
├─ 1K users: $100/month (Firestore + Redis)
└─ 10K+ users: $500+/month (evaluate PostgreSQL)

```

---

## 8. ERROR HANDLING & RESILIENCE

```
ERROR FLOW:
───────────

User Request
    ↓
[Error occurs at any layer]
    ├─ Authentication fail? → HTTP 401
    ├─ Authorization fail? → HTTP 403
    ├─ Validation fail? → HTTP 400
    ├─ API rate limit? → HTTP 429 (retry-after header)
    ├─ Claude API timeout? → HTTP 504 (retry with exponential backoff)
    ├─ Database unavailable? → HTTP 503 (circuit breaker)
    └─ Unknown error? → HTTP 500 (log to Sentry)
    ↓
[Error Response Format]
{
  "success": false,
  "error": {
    "code": "CLAUDE_API_TIMEOUT",
    "message": "AI response took too long. Please retry.",
    "statusCode": 504,
    "requestId": "req_abc123",
    "timestamp": "2026-07-15T10:30:00Z"
  }
}
    ↓
[Frontend displays to user]
"Oops! AI sedang sibuk. Sila cuba lagi dalam 30 saat."

RETRY STRATEGY:
───────────────

├─ HTTP 429 (Rate Limited)
│  └─ Wait until Retry-After header, then retry
│
├─ HTTP 503/504 (Service Unavailable)
│  ├─ Retry with exponential backoff (1s, 2s, 4s, 8s)
│  ├─ Max 3 attempts
│  └─ Fall back to cached result if available
│
├─ Network timeout
│  ├─ Retry up to 2 times
│  └─ Notify user if persistent
│
└─ Claude API error
   ├─ Log full error to Sentry
   ├─ Show user-friendly message
   └─ Alert backend team

CIRCUIT BREAKER:
────────────────

If Claude API fails 5 times in 60 seconds:
├─ "Circuit" opens → block further calls for 30s
├─ Return cached result if available
├─ Queue request for later retry
└─ Alert ops team via Slack

```

---

## 9. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Branch Strategy:                                              │
│  ├─ main (production) → Deploy to Cloud Run prod               │
│  ├─ staging → Deploy to Cloud Run staging                      │
│  ├─ develop → Feature development                              │
│  └─ feature/* → Individual features                            │
│                                                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Push to main branch
                 │
         ┌───────▼──────────────┐
         │  GitHub Actions      │
         │  CI/CD Pipeline      │
         │                      │
         │  1. Trigger         │
         │     ├─ Run tests    │
         │     ├─ Lint code    │
         │     ├─ Build Docker │
         │     └─ Push to GCR  │
         │                      │
         │  2. Deploy           │
         │     └─ Deploy to     │
         │        Cloud Run     │
         │                      │
         │  3. Smoke Test       │
         │     ├─ Health check  │
         │     ├─ API test      │
         │     └─ notify slack  │
         │                      │
         └───────┬──────────────┘
                 │
         ┌───────▼──────────────────────┐
         │  Google Cloud Console        │
         │                             │
         │  Cloud Run Service          │
         │  ├─ Region: asia-southeast1 │
         │  ├─ Auto-scale: 0-100       │
         │  ├─ Traffic split: 100% new │
         │  └─ Health checks: active   │
         │                             │
         │  Firebase (same region)     │
         │  ├─ Hosting (frontend)      │
         │  ├─ Firestore (database)    │
         │  ├─ Storage (media)         │
         │  └─ Auth (user management)  │
         │                             │
         └──────────────────────────────┘
```

---

## 10. MONITORING & OBSERVABILITY

```
OBSERVABILITY STACK:
────────────────────

┌─ Logs
│  ├─ Winston (backend logging)
│  ├─ Firebase Console (frontend)
│  └─ Cloud Logging (aggregated)
│
├─ Metrics
│  ├─ Cloud Monitoring (CPU, memory, latency)
│  ├─ Custom metrics (API call count, tokens used)
│  └─ Dashboards (real-time ops view)
│
├─ Tracing
│  ├─ Cloud Trace (request paths)
│  ├─ Distributed tracing across services
│  └─ Identify bottlenecks
│
├─ Errors
│  ├─ Sentry (exception tracking)
│  ├─ Error rate alerts
│  └─ Stack traces with context
│
└─ User Activity
   ├─ PostHog or Mixpanel (product analytics)
   ├─ Track: feature adoption, user flows
   └─ Heatmaps & session recordings (Hotjar)

ALERTING:
─────────

├─ Slack notifications
│  ├─ High error rate (>5%)
│  ├─ API response time > 5s
│  ├─ Cloud Run CPU > 80%
│  └─ Daily usage summary
│
├─ Email alerts
│  ├─ Security incidents
│  ├─ Cost threshold breached
│  └─ Monthly billing report
│
└─ PagerDuty (on-call rotation)
   ├─ Critical incidents
   └─ Escalation policy

```

---

## 11. COMPLIANCE & GOVERNANCE

```
COMPLIANCE CHECKLIST:
─────────────────────

✓ Malaysia Data Protection Act 2010
  ├─ User consent for data collection
  ├─ Right to access, rectify, erase
  └─ Breach notification within 72 hours

✓ Accounting Standards (KIRA Senang use case)
  ├─ MYOB compliance (if applicable)
  ├─ SST compliance (if tax client)
  └─ Audit trail for all AI outputs

✓ Platform Compliance
  ├─ Facebook Platform Policy
  ├─ Meta Developer Terms
  └─ Transparent about AI-generated content

✓ Security Compliance
  ├─ Encryption in transit (TLS)
  ├─ Encryption at rest (Firestore)
  ├─ Annual security audit
  └─ OWASP Top 10 compliance

✓ AI Ethics
  ├─ No discriminatory outputs
  ├─ No misleading content generation
  ├─ Clear disclosure: "Generated by AI"
  └─ Human review for sensitive content

```

---

**Document Version:** 1.0  
**Last Updated:** 15 July 2026  
**Maintained By:** AI-DMOS Architecture Team  

Next: See 03-FOLDER-STRUCTURE.md, 04-FIRESTORE-SCHEMA.md
