# SPRINT 1 CHECKLIST

**Duration:** 2 weeks (20 July - 2 August 2026)  
**Goal:** MVP 1 complete & deployed to production  
**Definition of Success:** One SME can generate quality content in < 2 minutes, end-to-end  

---

## SPRINT 1 OVERVIEW

**What we're building:**
```
MVP 1 = Login + Company Profile + AI Content Generation

User Flow:
1. SME goes to app.aidmos.my
2. Registers/logs in
3. Sets up company profile (1st time)
4. Generates content (caption, CTA, hashtags)
5. Saves to history
6. Exports to Markdown
```

**Success Metric:**
- Average time from login to content generation: **< 2 minutes**
- Content quality rated 8/10 by KIRA Senang team
- Zero data loss
- No critical bugs during Dogfooding

---

## 6 FEATURES (SPRINT 1)

Each feature must have: **Code + Docs + Tests**

---

## ✓ FEATURE 1: LOGIN / REGISTER

### 1A. Frontend (React)

**Components to build:**

```
client/src/pages/
├── LoginPage.jsx
│   ├── Email input
│   ├── Password input
│   ├── "Daftar" link
│   ├── "Lupa password?" link
│   └── Login button
│
├── RegisterPage.jsx
│   ├── Email input
│   ├── Password input
│   ├── Confirm password input
│   ├── Agree terms checkbox
│   └── Register button
│
└── PrivateRoute.jsx
    └── Protects routes (redirect to login if no auth)

client/src/services/
└── authService.js
    ├── login(email, password)
    ├── register(email, password)
    ├── logout()
    └── getCurrentUser()

client/src/stores/
└── authStore.js (Zustand)
    ├── user (null or user object)
    ├── loading
    ├── error
    ├── login()
    ├── register()
    └── logout()
```

**Acceptance Criteria:**

```
[ ] User can register with email + password
    - Email validation (must be valid)
    - Password minimum 8 characters
    - Password confirmation match
    - Success → redirect to dashboard

[ ] User can login with email + password
    - Firebase Auth validates credentials
    - Invalid email/password → show error
    - Valid → JWT token stored
    - Redirect to dashboard

[ ] Sessions persist
    - Browser refresh → still logged in
    - Tabs sync auth state
    - Logout → clear all sessions

[ ] Error handling
    - Email already exists → show error
    - Weak password → show requirements
    - Network error → show retry option
    - User-friendly messages in Bahasa Melayu
```

**Tests:**

```javascript
// client/src/services/__tests__/authService.test.js
describe('authService', () => {
  it('should login with valid credentials', async () => {});
  it('should reject invalid password', async () => {});
  it('should register new user', async () => {});
  it('should handle network errors', async () => {});
});

// client/src/pages/__tests__/LoginPage.test.jsx
describe('LoginPage', () => {
  it('should render login form', () => {});
  it('should call login on submit', () => {});
  it('should show error on failed login', () => {});
  it('should redirect to dashboard on success', () => {});
});
```

### 1B. Backend (Express)

**Routes to build:**

```
server/src/routes/auth.js

POST /api/v1/auth/register
  Request: { email, password }
  Response: { uid, email, token }
  Error: 400 (email exists), 400 (weak password)

POST /api/v1/auth/login
  Request: { email, password }
  Response: { uid, email, token, expiresAt }
  Error: 401 (invalid credentials)

POST /api/v1/auth/logout
  Request: { token }
  Response: { success: true }
  Error: None

GET /api/v1/auth/me
  Request: Authorization header (Bearer token)
  Response: { uid, email, createdAt }
  Error: 401 (no token), 401 (invalid token)

POST /api/v1/auth/refresh-token
  Request: { refreshToken }
  Response: { token, refreshToken }
  Error: 401 (invalid refresh token)
```

**Services to build:**

```javascript
// server/src/services/firebaseService.js
class FirebaseService {
  async registerUser(email, password) {}
  async loginUser(email, password) {}
  async verifyToken(token) {}
  async refreshToken(refreshToken) {}
  async deleteUser(uid) {}
}

// server/src/middlewares/auth.js (AuthGuard)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  verify(token, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

**Tests:**

```javascript
// server/src/routes/__tests__/auth.test.js
describe('Auth Routes', () => {
  it('POST /register should create user', async () => {});
  it('POST /register should reject duplicate email', async () => {});
  it('POST /login should return token', async () => {});
  it('POST /login should reject invalid password', async () => {});
  it('GET /me should return user with valid token', async () => {});
  it('GET /me should reject invalid token', async () => {});
});
```

### 1C. Documentation

```
docs/FEATURES/FEATURE-01-AUTH.md

## Login / Register

### User Flows
1. Register flow (email → password → dashboard)
2. Login flow (credentials → dashboard)
3. Logout flow (clear session)

### API Reference
[Document all endpoints]

### Error Codes
- AUTH_EMAIL_EXISTS
- AUTH_INVALID_PASSWORD
- AUTH_INVALID_CREDENTIALS
- AUTH_TOKEN_EXPIRED
```

**Checklist for Feature 1:**

```
[ ] Frontend
    [ ] LoginPage component built
    [ ] RegisterPage component built
    [ ] PrivateRoute guard implemented
    [ ] authStore (Zustand) created
    [ ] Error handling for all cases
    [ ] Bahasa Melayu error messages
    [ ] Tests pass (> 80% coverage)

[ ] Backend
    [ ] POST /register endpoint works
    [ ] POST /login endpoint works
    [ ] GET /me endpoint works
    [ ] POST /logout endpoint works
    [ ] Authentication middleware tested
    [ ] Error handling for all cases
    [ ] Tests pass (> 80% coverage)

[ ] Documentation
    [ ] API endpoints documented
    [ ] Error codes listed
    [ ] User flows explained
    [ ] Troubleshooting guide added

[ ] Security
    [ ] Passwords hashed
    [ ] No credentials in logs
    [ ] CORS configured
    [ ] Rate limiting on auth endpoints

[ ] Deployment
    [ ] Works locally
    [ ] Works on Cloud Run staging
    [ ] Works on Cloud Run production
    [ ] Database migration tested (if any)
```

---

## ✓ FEATURE 2: COMPANY PROFILE

### 2A. Frontend

**Components:**

```
client/src/pages/
├── CompanyProfilePage.jsx
│   ├── Form inputs:
│   │   ├── Company name
│   │   ├── Website
│   │   ├── Logo upload
│   │   ├── Colors (primary, secondary)
│   │   ├── Industry dropdown
│   │   ├── Business type
│   │   ├── Business size
│   │   ├── Contact email
│   │   ├── Phone
│   │   ├── Address
│   │   └── Brand voice textarea
│   │
│   └── Buttons:
│       ├── Save profile
│       ├── Cancel
│       └── Upload logo

client/src/services/
└── companyService.js
    ├── createProfile(data)
    ├── updateProfile(data)
    ├── getProfile()
    └── uploadLogo(file)

client/src/stores/
└── companyStore.js (Zustand)
    ├── profile (company data)
    ├── loading
    ├── error
    └── actions: create, update, fetch
```

**Acceptance Criteria:**

```
[ ] First-time user sees company setup form
    - Pre-filled: nothing
    - Form takes < 2 minutes to complete

[ ] User can save company profile
    - All fields validated
    - Logo uploaded to Firebase Storage
    - Data saved to Firestore
    - Success message shown

[ ] User can edit company profile
    - Load existing data
    - Update fields
    - Save changes

[ ] Logo handling
    - Accept JPG, PNG (max 2MB)
    - Auto-resize to 200x200px
    - Show preview before upload
    - Error if file too large

[ ] Data persistence
    - Reload page → profile still there
    - Logout/login → profile still there
    - Share with other features (Knowledge Agent uses this)
```

**Tests:**

```javascript
describe('CompanyProfile', () => {
  it('should load company profile form', () => {});
  it('should save company profile', async () => {});
  it('should validate required fields', () => {});
  it('should upload logo', async () => {});
  it('should show error for file too large', () => {});
  it('should persist profile data', async () => {});
});
```

### 2B. Backend

**Routes:**

```
POST /api/v1/company/profile
  Request: { name, website, industry, brandVoice, ... }
  Response: { id, ...profile }
  
GET /api/v1/company/profile
  Request: Authorization header
  Response: { id, ...profile }

PUT /api/v1/company/profile
  Request: { id, ...updates }
  Response: { id, ...updated profile }

POST /api/v1/company/logo
  Request: multipart/form-data (file)
  Response: { logoUrl, storageRef }
```

**Services:**

```javascript
class CompanyService {
  async createProfile(tenantId, data) {}
  async getProfile(tenantId) {}
  async updateProfile(tenantId, data) {}
  async uploadLogo(tenantId, file) {}
}
```

**Tests:**

```javascript
describe('Company Routes', () => {
  it('POST /profile should save company data', async () => {});
  it('GET /profile should return company data', async () => {});
  it('PUT /profile should update company data', async () => {});
  it('POST /logo should upload and store logo', async () => {});
});
```

### 2C. Documentation

```
docs/FEATURES/FEATURE-02-COMPANY.md

## Company Profile

### Data Model
[Firestore schema]

### API Reference
[Endpoint documentation]

### Logo Upload
- Supported formats: JPG, PNG
- Max size: 2MB
- Storage: Firebase Storage
```

**Checklist for Feature 2:**

```
[ ] Frontend
    [ ] Form renders correctly
    [ ] All fields editable
    [ ] Logo upload works
    [ ] Validation shows errors
    [ ] Data persists
    [ ] Tests pass

[ ] Backend
    [ ] POST /profile works
    [ ] GET /profile works
    [ ] PUT /profile works
    [ ] Logo upload to Storage works
    [ ] Firestore saves company/{id}
    [ ] Tests pass

[ ] Storage
    [ ] Logo stored in Firebase Storage
    [ ] Signed URL generated
    [ ] Public visibility correct
    [ ] Cleanup on delete (future)

[ ] Documentation
    [ ] Fields documented
    [ ] API reference complete
    [ ] Error codes listed
```

---

## ✓ FEATURE 3: DASHBOARD

### 3A. Frontend

**Components:**

```
client/src/pages/
└── DashboardPage.jsx
    ├── Header
    │   ├── Welcome message ("Selamat datang, [name]")
    │   ├── Company name
    │   └── Logout button
    │
    ├── Quick Stats
    │   ├── Content generated today: [count]
    │   ├── Tokens used today: [count]
    │   ├── Cost today: RM [amount]
    │   └── Last update: [time]
    │
    ├── Quick Actions
    │   ├── "Generate Content" button → Agent page
    │   ├── "View History" button → History page
    │   ├── "Edit Profile" button → Company page
    │   └── "Usage Report" button → Usage page
    │
    └── Recent Activity
        ├── Last 5 content items
        ├── Each shows: title, type, generated date
        └── Click to view/edit
```

**Acceptance Criteria:**

```
[ ] Dashboard loads instantly (< 2s)
    - Uses cached company profile
    - Uses cached usage stats

[ ] Welcome message personalized
    - Shows company name from profile

[ ] Quick stats accurate
    - Content count from today (from usage_logs)
    - Tokens from today
    - Cost calculated correctly

[ ] Quick action buttons work
    - All buttons link to correct pages
    - No 404 errors

[ ] Recent activity loaded
    - Shows latest content first
    - Max 5 items displayed
    - Click to view details
```

**Tests:**

```javascript
describe('DashboardPage', () => {
  it('should render dashboard with user info', () => {});
  it('should load quick stats', async () => {});
  it('should show recent activity', async () => {});
  it('should calculate daily cost', () => {});
});
```

### 3B. Backend (Minimal)

**Routes:**

```
GET /api/v1/dashboard/stats
  Request: Authorization header
  Response: {
    contentGeneratedToday: 5,
    tokensUsedToday: 12400,
    costToday: 0.062,
    lastUpdate: "2026-07-20T14:30:00Z"
  }

GET /api/v1/dashboard/recent-activity
  Request: Authorization header, limit=5
  Response: [
    { id, title, type, createdAt },
    ...
  ]
```

**Checklist for Feature 3:**

```
[ ] Frontend
    [ ] Dashboard layout built
    [ ] Stats display correctly
    [ ] Action buttons work
    [ ] Recent activity loads
    [ ] Tests pass

[ ] Backend
    [ ] /stats endpoint returns correct data
    [ ] /recent-activity returns sorted data
    [ ] Tests pass

[ ] Documentation
    [ ] Dashboard features explained
    [ ] Stats calculation documented
```

---

## ✓ FEATURE 4: KNOWLEDGE LOADER

### 4A. Frontend (Admin only)

**Components:**

```
client/src/pages/admin/
└── KnowledgeLoaderPage.jsx
    ├── Upload Markdown files
    │   ├── File input (accept .md)
    │   ├── Category selector (company, marketing, malaysia)
    │   ├── Description textarea
    │   └── Upload button
    │
    └── Knowledge Base View
        ├── List all loaded files
        ├── Each shows: filename, category, size, uploaded date
        ├── Delete button (remove file)
        └── Edit button (replace file)
```

**Acceptance Criteria:**

```
[ ] Admin can upload Markdown files
    - Max file size: 100KB
    - Only .md files accepted
    - File stored in Firebase Storage
    - Path: /knowledge/{category}/{filename}

[ ] Knowledge loaded into memory
    - On app startup, load all /knowledge files
    - Cache in agentStore (Zustand)
    - Available to all agents

[ ] Knowledge search (future)
    - For now, just cache everything
    - No search needed yet

[ ] Error handling
    - File too large → show error
    - Invalid format → show error
    - Upload failure → retry option
```

**Tests:**

```javascript
describe('KnowledgeLoader', () => {
  it('should upload Markdown file', async () => {});
  it('should reject non-Markdown files', () => {});
  it('should reject files > 100KB', () => {});
  it('should cache knowledge on app load', async () => {});
});
```

### 4B. Backend

**Routes:**

```
POST /api/v1/knowledge/upload
  Request: multipart/form-data (file, category)
  Response: { path, size, uploadedAt }

GET /api/v1/knowledge/all
  Request: Authorization header
  Response: [
    { id, path, category, content, size },
    ...
  ]

DELETE /api/v1/knowledge/{id}
  Request: Authorization header
  Response: { success: true }
```

**Services:**

```javascript
class KnowledgeService {
  async uploadFile(tenantId, file, category) {}
  async getAll(tenantId) {}
  async deleteFile(tenantId, id) {}
  async loadIntoMemory(tenantId) {}
}
```

### 4C. Initial Knowledge Files

**Create these 6 files in `/knowledge`:**

```
knowledge/
├── company/
│   ├── brand.md (Kira Senang branding info)
│   ├── products.md (KIRA Senang products)
│   └── faq.md (Common Q&A)
├── marketing/
│   ├── copywriting.md (Writing principles)
│   └── cta.md (CTA examples)
└── malaysia/
    ├── holidays.md (Ramadan, CNY, Merdeka, etc)
    └── sme.md (SME context in Malaysia)
```

**Checklist for Feature 4:**

```
[ ] Frontend
    [ ] Upload form works
    [ ] File validation client-side
    [ ] Loading animation shown
    [ ] Success message appears
    [ ] Knowledge list displays
    [ ] Tests pass

[ ] Backend
    [ ] File upload endpoint works
    [ ] Files stored in Firebase Storage
    [ ] Metadata saved to Firestore
    [ ] GET /all returns all files
    [ ] Tests pass

[ ] Initial Data
    [ ] 6 knowledge files created
    [ ] Files in correct categories
    [ ] Content is useful for agents
    [ ] No proprietary data

[ ] Documentation
    [ ] Knowledge file format explained
    [ ] Upload process documented
    [ ] Initial files listed
```

---

## ✓ FEATURE 5: CEO AGENT

### 5A. Backend

**Routes:**

```
POST /api/v1/agents/ceo/process
  Request: {
    input: "User's request in Malay",
    tenantId: "TENANT_0001"
  }
  Response: {
    success: true,
    status: "completed",
    agentsToCall: ["knowledge", "content"],
    analysis: "...",
    nextSteps: "...",
    executionTime: 0.5
  }
```

**Services:**

```javascript
class CEOAgent {
  async processTask(input, context) {
    // 1. Analyze user input
    const analysis = await this.analyzeInput(input);
    
    // 2. Decide which agents to call
    const agentsToCall = this.decideAgents(analysis);
    
    // 3. Log decision
    await this.logDecision(input, agentsToCall);
    
    // 4. Return plan
    return {
      analysis,
      agentsToCall,
      nextStep: "Execute agents"
    };
  }
  
  analyzeInput(input) {
    // Use Claude to understand the request
  }
  
  decideAgents(analysis) {
    // For MVP 1, always call: Knowledge → Content
    return ["knowledge", "content"];
  }
}
```

**Prompt:**

```
prompts/ceo-agent.md

name: ceo-agent
version: 1.0.0
model: claude-sonnet-4.6
temperature: 0.7
max_tokens: 1000

system_instruction:
Kamu adalah CEO Agent untuk platform AI marketing KIRA Senang.
Tugasmu adalah memahami request pengguna dan merancang strategi.

Untuk MVP 1, selalu lakukan:
1. Analisis input pengguna
2. Panggil Knowledge Agent untuk konteks
3. Panggil Content Agent untuk output
4. Gabungkan hasil
5. Kembalikan ke pengguna
```

**Tests:**

```javascript
describe('CEOAgent', () => {
  it('should analyze user input', async () => {});
  it('should decide to call Content + Knowledge agents', async () => {});
  it('should log task execution', async () => {});
});
```

### 5B. Frontend

**Integration:**

```
client/src/services/agentService.js

async function processCEOTask(input) {
  const response = await api.post('/agents/ceo/process', {
    input,
    tenantId: currentTenant.id
  });
  
  return response;
}
```

**Checklist for Feature 5:**

```
[ ] Backend
    [ ] CEOAgent class implemented
    [ ] analyzeInput() works
    [ ] decideAgents() returns correct agents
    [ ] POST /agents/ceo/process works
    [ ] Calls Claude API
    [ ] Logs execution
    [ ] Tests pass

[ ] Prompt
    [ ] ceo-agent.md created
    [ ] Versioning metadata added
    [ ] Clear instructions for MVP 1
    [ ] Tested with real input

[ ] Documentation
    [ ] Agent flow explained
    [ ] Prompt documented
    [ ] Error handling listed

[ ] Integration
    [ ] Frontend can call CEO Agent
    [ ] Response parsed correctly
    [ ] Error handling works
```

---

## ✓ FEATURE 6: CONTENT AGENT

### 6A. Backend

**Routes:**

```
POST /api/v1/agents/content/caption
  Request: {
    brief: "Promo POS untuk Ramadan",
    platform: "facebook",
    tenantId: "TENANT_0001"
  }
  Response: {
    success: true,
    data: {
      caption: "🌙 Sambut Ramadan...",
      cta: "WhatsApp kami",
      hashtags: ["#KiraSenang", "#BisnisRamadan"],
      reasoning: "Focused on urgency...",
      variants: [
        { type: "short", text: "..." },
        { type: "long", text: "..." }
      ]
    },
    meta: {
      tokensUsed: 1200,
      cost: 0.006,
      duration: 8.2
    }
  }
```

**Services:**

```javascript
class ContentAgent {
  async generateCaption(input, context) {
    // 1. Load template
    const template = this.loadTemplate('caption/promotion.md');
    
    // 2. Get knowledge context
    const knowledge = await context.knowledgeAgent.query(input.brief);
    
    // 3. Render template with variables
    const prompt = template.render({
      company: knowledge.company,
      tone: knowledge.tone,
      audience: context.tenant.targetAudience,
      campaign: input.brief
    });
    
    // 4. Call Claude
    const response = await aiProvider.generateText(prompt);
    
    // 5. Parse and format output
    const { caption, cta, hashtags } = this.parseResponse(response.text);
    
    // 6. Generate variants
    const variants = await this.generateVariants(caption);
    
    // 7. Log usage
    await this.logUsage(response.inputTokens, response.outputTokens);
    
    return { caption, cta, hashtags, variants, ...response };
  }
  
  loadTemplate(path) {}
  parseResponse(text) {}
  generateVariants(caption) {}
  logUsage(inputTokens, outputTokens) {}
}
```

**Templates:**

```
templates/caption/promotion.md

Kamu adalah expert copywriter untuk {{company}}.
Tulis caption promosi untuk Facebook.

Konteks:
- Tone: {{tone}}
- Audience: {{audience}}
- Campaign: {{campaign}}
- Platform: Facebook (max 2200 characters)

Output format:
Caption:
[Your caption here]

CTA:
[Best CTA for this audience]

Hashtags:
#hashtag1 #hashtag2 #hashtag3 [5-10 total]

Reasoning:
[Why this approach works]
```

**Prompt:**

```
prompts/content-agent.md

name: content-agent
version: 1.0.0
model: claude-sonnet-4.6
temperature: 0.8
max_tokens: 2000

modules:
- caption
- cta
- hashtag

system_instruction:
Kamu adalah Content Agent untuk platform marketing Malaysia.
Tugasmu adalah menghasilkan konten marketing berkualiti tinggi...
```

**Tests:**

```javascript
describe('ContentAgent', () => {
  it('should generate caption from brief', async () => {});
  it('should include CTA in output', async () => {});
  it('should generate relevant hashtags', async () => {});
  it('should respect character limits per platform', () => {});
  it('should use knowledge context', async () => {});
  it('should log token usage', async () => {});
});
```

### 6B. Frontend

**Components:**

```
client/src/pages/
└── AgentPage.jsx
    ├── Input section
    │   ├── Brief textarea ("Describe your content")
    │   ├── Platform selector (facebook only for MVP 1)
    │   └── Generate button
    │
    ├── Loading state
    │   └── Spinner + "Generating content..."
    │
    └── Output section
        ├── Caption (editable textarea)
        ├── CTA (dropdown selector)
        ├── Hashtags (editable list)
        ├── Action buttons:
        │   ├── Copy to clipboard
        │   ├── Save to history
        │   ├── Regenerate
        │   └── Export to Markdown
        └── Variants (tabs for short/long/etc)
```

**Services:**

```javascript
client/src/services/contentService.js

async function generateCaption(brief, platform) {
  const response = await api.post('/agents/content/caption', {
    brief,
    platform,
    tenantId: currentTenant.id
  });
  return response.data;
}
```

**Checklist for Feature 6:**

```
[ ] Backend
    [ ] ContentAgent class implemented
    [ ] generateCaption() works
    [ ] Template rendering works
    [ ] Claude API integration works
    [ ] Token counting works
    [ ] Cost calculation works
    [ ] Logging works
    [ ] Tests pass (> 80%)

[ ] Templates
    [ ] caption/promotion.md created
    [ ] caption/tips.md created
    [ ] caption/announcement.md created
    [ ] Variables clear
    [ ] Output format documented

[ ] Prompts
    [ ] content-agent.md created
    [ ] Versioning metadata added
    [ ] Tested with real briefs
    [ ] Bilingual instructions (EN + BM)

[ ] Frontend
    [ ] AgentPage renders
    [ ] Input form works
    [ ] Loading state shows
    [ ] Output displays
    [ ] Copy button works
    [ ] Save button works
    [ ] Export button works
    [ ] Tests pass

[ ] Integration
    [ ] CEO Agent → Content Agent flow works
    [ ] Knowledge context injected
    [ ] Usage logged
    [ ] Error handling works

[ ] Documentation
    [ ] Agent capabilities explained
    [ ] Templates documented
    [ ] API reference complete
    [ ] Example outputs shown
```

---

## ✓ FEATURE 7: HISTORY & STORAGE

### 7A. Frontend

**Components:**

```
client/src/pages/
└── HistoryPage.jsx
    ├── Filter options
    │   ├── Date range
    │   └── Content type
    │
    └── History table
        ├── Columns: Date | Brief | Type | Status | Actions
        ├── Each row clickable
        ├── Click → View full content
        ├── Actions:
        │   ├── View
        │   ├── Edit
        │   ├── Delete
        │   └── Export
        └── Pagination (20 per page)
```

### 7B. Backend

**Routes:**

```
GET /api/v1/content
  Request: Authorization, limit=20, offset=0
  Response: [
    { id, brief, type, caption, createdAt, status },
    ...
  ], total: 42

GET /api/v1/content/{id}
  Request: Authorization
  Response: { id, ...full content }

DELETE /api/v1/content/{id}
  Request: Authorization
  Response: { success: true }

POST /api/v1/content/{id}/export
  Request: Authorization, format=markdown
  Response: Markdown file download
```

**Firestore:**

```
tenants/{tenantId}/workspaces/{workspaceId}/content/{contentId}
├── brief: "Promo POS Ramadan"
├── caption: "🌙 Sambut Ramadan..."
├── cta: "WhatsApp kami"
├── hashtags: ["#KiraSenang", ...]
├── type: "caption"
├── platform: "facebook"
├── createdAt: Timestamp
├── createdBy: uid
└── status: "draft" or "published"
```

### 7C. Export Functionality

**Markdown export format:**

```markdown
# Promo POS Ramadan

**Brief:** Promo POS untuk Ramadan

**Platform:** Facebook

**Generated:** 2026-07-20 14:30:00

## Caption

🌙 Sambut Ramadan bersama KIRA Senang!
...

## CTA

WhatsApp kami

## Hashtags

#KiraSenang #BisnisRamadan #POSMalaysia

## Stats

- Tokens used: 1200
- Generated in: 8.2s
- Cost: RM 0.006
```

**Checklist for Feature 7:**

```
[ ] Frontend
    [ ] History page loads
    [ ] List displays all content
    [ ] Filtering works
    [ ] Pagination works
    [ ] Click to view details
    [ ] Edit/delete buttons work
    [ ] Export button works
    [ ] Tests pass

[ ] Backend
    [ ] GET /content returns list
    [ ] GET /content/{id} returns details
    [ ] DELETE /content/{id} removes item
    [ ] POST /content/{id}/export generates file
    [ ] Firestore queries use indexes
    [ ] Tests pass

[ ] Storage
    [ ] Content saved on generation
    [ ] Content retrieved on load
    [ ] No data loss
    [ ] Proper timestamps

[ ] Export
    [ ] Markdown format correct
    [ ] All fields included
    [ ] File downloads
    [ ] Filename includes date

[ ] Documentation
    [ ] History feature explained
    [ ] Export format documented
    [ ] API reference complete
```

---

## ✓ FEATURE 8: USAGE STATS

### 8A. Frontend

**Components:**

```
client/src/pages/
└── UsagePage.jsx
    ├── Today's stats
    │   ├── Content generated: 5
    │   ├── Tokens used: 12,400
    │   ├── Cost: RM 0.062
    │   └── Agents used: CEO, Knowledge, Content
    │
    ├── Weekly chart
    │   └── Bar chart (daily spend trend)
    │
    └── Monthly summary
        ├── Total tokens
        ├── Total cost
        ├── Days used
        └── Avg cost per content
```

### 8B. Backend

**Routes:**

```
GET /api/v1/usage/today
  Response: {
    contentGenerated: 5,
    tokensUsed: 12400,
    cost: 0.062,
    breakdown: { ceoAgent, contentAgent, knowledgeAgent }
  }

GET /api/v1/usage/weekly
  Response: [
    { date: "2026-07-14", tokens: 5000, cost: 0.025 },
    ...
  ]

GET /api/v1/usage/monthly
  Response: {
    month: "2026-07",
    totalTokens: 245000,
    totalCost: 1.225,
    daysUsed: 15,
    avgPerDay: 0.082
  }
```

**Checklist for Feature 8:**

```
[ ] Frontend
    [ ] Usage page loads
    [ ] Today's stats display
    [ ] Weekly chart renders
    [ ] Monthly summary shows
    [ ] Tests pass

[ ] Backend
    [ ] /usage/today returns correct data
    [ ] /usage/weekly returns trends
    [ ] /usage/monthly returns summary
    [ ] Usage calculated from agent_logs
    [ ] Tests pass

[ ] Storage
    [ ] usage_logs collection populated
    [ ] Data accurate
    [ ] No calculation errors

[ ] Documentation
    [ ] Usage metrics explained
    [ ] Cost calculation documented
    [ ] API reference complete
```

---

## FINAL SPRINT 1 CHECKLIST

**All 6 features must pass this checklist to be "done":**

### Code

```
✅ Feature 1: Login/Register
   [ ] Frontend tests pass (> 80% coverage)
   [ ] Backend tests pass (> 80% coverage)
   [ ] No console errors
   [ ] No security issues

✅ Feature 2: Company Profile
   [ ] Frontend tests pass
   [ ] Backend tests pass
   [ ] Logo upload works
   [ ] Data persists

✅ Feature 3: Dashboard
   [ ] Loads in < 2 seconds
   [ ] Stats accurate
   [ ] Action buttons work

✅ Feature 4: Knowledge Loader
   [ ] Markdown files load
   [ ] Cache works
   [ ] Agents can access

✅ Feature 5: CEO Agent
   [ ] Understands input
   [ ] Routes to Content + Knowledge
   [ ] Logs execution

✅ Feature 6: Content Agent
   [ ] Generates captions
   [ ] Uses templates
   [ ] Uses knowledge
   [ ] Logs usage

✅ Feature 7: History
   [ ] Content saves
   [ ] Content retrieves
   [ ] Export works
   [ ] No data loss

✅ Feature 8: Usage
   [ ] Stats tracked
   [ ] Cost calculated
   [ ] Displayed correctly
```

### Documentation

```
✅ Each feature has documentation:
   [ ] Feature overview
   [ ] API endpoints (if backend)
   [ ] Data model (if storage)
   [ ] Error codes
   [ ] Example usage
```

### Tests

```
✅ Each feature has tests:
   [ ] Unit tests (services, utils)
   [ ] Integration tests (routes, flows)
   [ ] E2E tests (user flows)
   [ ] Coverage > 80%
```

### Production Readiness

```
✅ Code quality:
   [ ] ESLint passes
   [ ] No console.log() in prod code
   [ ] No hardcoded secrets
   [ ] Error handling complete

✅ Security:
   [ ] CORS configured
   [ ] Rate limiting applied
   [ ] Input validation working
   [ ] No data leaks in logs

✅ Performance:
   [ ] Login < 2s
   [ ] Generate < 10s
   [ ] Dashboard < 2s
   [ ] No N+1 queries

✅ Deployment:
   [ ] Works locally
   [ ] Works on Cloud Run staging
   [ ] Works on Cloud Run production
   [ ] CI/CD passes
   [ ] Health check OK
```

---

## DEFINITION OF DONE (MVP 1)

**MVP 1 is complete when:**

1. ✅ All 6 features coded + tested + documented
2. ✅ Deployed to production (Cloud Run)
3. ✅ KIRA Senang team can use it without tech help
4. ✅ Can generate content in < 2 minutes
5. ✅ Zero data loss
6. ✅ Zero critical bugs in first 24 hours

---

## WHAT HAPPENS AFTER SPRINT 1

**Week 2 (Dogfooding):**
- KIRA Senang team uses platform for all marketing
- Collect bugs, UX issues, prompt issues
- Track actual performance, cost, usage

**Week 3 (Review):**
- Analyze dogfooding data
- Identify what to fix vs what to defer
- Plan Sprint 2 based on real usage (not assumptions)

---

**Sprint 1 Duration:** 14 days (20 July - 2 August 2026)  
**Success Metric:** MVP 1 deployment + Dogfooding ready  
**Next Milestone:** Dogfooding validation (1-2 weeks)

**GO BUILD! 🚀**
