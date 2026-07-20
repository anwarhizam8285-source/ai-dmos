# 13 — ENGINEERING STANDARDS

**Version:** 1.0  
**Last Updated:** 15 July 2026  
**Audience:** All contributors  

---

## 1. NAMING CONVENTIONS

### 1.1 Files & Folders

**Backend (Node.js):**
```
✅ GOOD                      ❌ BAD
─────────────────────────────────────
agents/
  ├── content-agent.js       content_agent.js (snake_case)
  ├── content-agent-test.js  ContentAgent.test.js (PascalCase)
  └── index.js

services/
  ├── ai-provider-factory.js AIProviderFactory.js
  ├── firestore-service.js   firestoreService.js (camelCase)
  └── index.js

middlewares/
  ├── auth-guard.js          AuthGuard.js
  ├── rate-limiter.js        rateLimiter.js
  └── index.js

routes/
  ├── agents.js              agent.js (singular)
  ├── auth.js
  └── index.js

models/
  ├── user-model.js          UserModel.js
  ├── tenant-model.js
  └── index.js
```

**Frontend (React):**
```
✅ GOOD                            ❌ BAD
─────────────────────────────────────────────
components/
  ├── Dashboard/
  │   ├── Dashboard.jsx           dashboard.jsx (lowercase)
  │   ├── Dashboard.module.css    dashboard.css (no scope)
  │   └── Dashboard.test.jsx      Dashboard.spec.js (.spec)
  ├── AIChat/
  │   ├── AIChat.jsx
  │   ├── ChatMessage.jsx
  │   └── ChatInput.jsx
  └── index.js

hooks/
  ├── useAgent.js                 UseAgent.js (PascalCase)
  ├── useTenant.js
  └── index.js

pages/
  ├── AgentPage/                  agent/ (lowercase)
  ├── DashboardPage/
  └── index.js

stores/
  ├── agentStore.js              AgentStore.js (PascalCase)
  ├── tenantStore.js
  └── index.js

utils/
  ├── format-tokens.js           formatTokens.js (camelCase in files)
  ├── parse-response.js
  └── index.js
```

### 1.2 Variables & Constants

```javascript
// ✅ GOOD

// Constants (SCREAMING_SNAKE_CASE)
const MAX_AGENT_CALLS_PER_MINUTE = 100;
const FIRESTORE_COLLECTION_TENANTS = 'tenants';
const ANTHROPIC_MODEL_DEFAULT = 'claude-sonnet-4.6';

// Variables (camelCase)
let currentAgentStatus = 'idle';
const tenantData = await fetchTenant(tenantId);
const isAgentEnabled = registry.isEnabled('content-agent');

// React State (camelCase)
const [loading, setLoading] = useState(false);
const [agentResponse, setAgentResponse] = useState('');

// Event Handlers (camelHandlerName)
const handleGenerateCaption = () => {};
const onAgentComplete = () => {};
const onErrorOccur = () => {};

// Boolean variables (is/has prefix)
const isAuthenticated = !!user;
const hasFeature = tenant.features.contentGeneration;
const shouldRetry = errorCount < MAX_RETRIES;

// ❌ BAD

const maxAgentCallsPerMinute = 100;        // Should be SCREAMING
let currentagentStatus = 'idle';           // camelCase
const UserData = await fetchTenant();      // PascalCase for variables
const handle_generate = () => {};          // snake_case for functions
```

### 1.3 API Endpoints

```javascript
// ✅ GOOD

// v1 API routes (kebab-case)
POST   /api/v1/agents/ceo/process
POST   /api/v1/agents/content/caption
GET    /api/v1/company/profile
POST   /api/v1/company/profile
GET    /api/v1/agents/registry
GET    /api/v1/ai-usage/today
POST   /api/v1/auth/register
POST   /api/v1/auth/login

// Resource naming (singular or plural, consistent)
GET    /api/v1/tenants/{tenantId}/knowledge-base   (plural for collection)
GET    /api/v1/content/{contentId}                  (singular for resource)

// Actions (use verbs for non-CRUD)
POST   /api/v1/agents/ceo/process                   (action: process)
POST   /api/v1/content/{id}/publish                 (action: publish)
POST   /api/v1/content/{id}/schedule                (action: schedule)

// ❌ BAD

/api/generateCaption                      (no version)
/api/v1/agent                             (ambiguous)
/api/v1/ProcessAgent                      (PascalCase)
/api/v1/generate_caption                  (snake_case)
```

### 1.4 Database Collections & Fields

```javascript
// ✅ GOOD

// Collections (snake_case, plural for collections)
tenants/
  workspaces/
    brands/
      social_accounts/
    knowledge_base/
    published_posts/
    agent_logs/
    usage_logs/

// Document fields (camelCase)
{
  tenantId: "TENANT_0001",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isEnabled: true,
  totalTokens: 12400,
  estimatedCost: 0.045,
  agentName: "content-agent"
}

// Arrays (plural)
tags: ["ramadan", "promo", "pos"],
agentNames: ["ceo", "content", "knowledge"]

// Boolean fields (is/has prefix)
{
  isActive: true,
  hasFeature: false,
  isVerified: true,
  canPublish: true,
  shouldRetry: false
}

// ❌ BAD

TenantS/              (capital letter)
{ CreatedAt }         (PascalCase)
{ created_at }        (snake_case in Firestore)
{ active: true }      (no is/has prefix)
{ tags: ["x"] }       (singular for array)
```

### 1.5 Classes & Interfaces

```typescript
// ✅ GOOD (PascalCase)

class AIProviderFactory {}
class AnthropicProvider extends BaseAIProvider {}
class FirestoreService {}
class TemplateEngine {}

interface Agent {
  name: string;
  enabled: boolean;
  model: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type AIProvider = 'anthropic' | 'openai' | 'google';

// ❌ BAD

class aiProviderFactory {}      (camelCase)
class Firestore_Service {}      (snake_case)
interface agent {}              (lowercase)
type ai_provider {}             (snake_case)
```

---

## 2. GIT CONVENTIONS

### 2.1 Branch Naming

```bash
# Feature branch
feature/auth-setup
feature/content-agent-implementation
feature/firestore-schema

# Bugfix branch
bugfix/rate-limiter-error
bugfix/template-engine-rendering

# Hotfix branch (production only)
hotfix/critical-api-error

# Release branch
release/v1.0.0

# ❌ BAD
feature/auth                    (too vague)
fix/bug                         (vague)
dev/something                   (not standard)
user/name-feature               (personal)
```

### 2.2 Commit Messages (Conventional Commits)

```bash
# ✅ Format
<type>(<scope>): <subject>

<body>

<footer>

# Examples

# Feature
git commit -m "feat(content-agent): add caption generation module"

# Bugfix
git commit -m "fix(rate-limiter): correct token counting logic"

# Documentation
git commit -m "docs(firestore-schema): update collection hierarchy"

# Refactor
git commit -m "refactor(ai-provider): extract common logic to base class"

# Test
git commit -m "test(template-engine): add placeholder extraction tests"

# Performance
git commit -m "perf(firestore): add composite index for usage queries"

# Chore
git commit -m "chore(dependencies): update Claude SDK to 1.2.0"

# ❌ BAD
"added feature"
"WIP: something"
"TODO: fix later"
"asdf"
"fixed"
```

### 2.3 Commit Message Structure

```
feat(content-agent): implement caption generation for Facebook posts

- Add template engine for variable substitution
- Integrate with knowledge base for context injection
- Support 5 caption variants for A/B testing
- Add hashtag generation from knowledge base

Closes #123
BREAKING CHANGE: none
```

### 2.4 Branch Rules

```
Main Branch Protection:
├─ Require pull request reviews (minimum 1 reviewer)
├─ Require status checks (CI/CD must pass)
├─ Require branches to be up to date before merge
├─ Automatically delete head branches on merge
├─ Require code review from CODEOWNERS

Develop Branch:
├─ Same as main
├─ Always deployable to staging

Feature Branches:
├─ Create from develop
├─ PR to develop when ready
├─ Delete after merge
```

---

## 3. CODE REVIEW CHECKLIST

```markdown
## Code Review Template

### Functionality
- [ ] Code works as intended
- [ ] No regressions in existing features
- [ ] Error handling is appropriate
- [ ] Edge cases are covered

### Code Quality
- [ ] Follows naming conventions (see Section 1)
- [ ] No unnecessary complexity
- [ ] Proper use of abstractions
- [ ] DRY principle (Don't Repeat Yourself)
- [ ] Constants vs magic numbers

### Testing
- [ ] Unit tests written for new code
- [ ] Tests cover happy path + edge cases
- [ ] Tests pass locally
- [ ] Coverage > 80% for new modules

### Performance
- [ ] No N+1 queries
- [ ] Firestore queries use indexes
- [ ] AI API calls are batched where possible
- [ ] Response time acceptable (< 5s for most endpoints)

### Security
- [ ] No hardcoded secrets
- [ ] Input validation & sanitization
- [ ] Authorization checks present
- [ ] No data leaks in logs
- [ ] Rate limiting applied

### Documentation
- [ ] Comments on complex logic
- [ ] README updated if needed
- [ ] Changelog entry added
- [ ] API docs updated

### DevOps
- [ ] CI/CD passes (linting, tests, builds)
- [ ] No console.log() left in production code
- [ ] Error tracking (Sentry) enabled
- [ ] Monitoring metrics in place

### Commit Quality
- [ ] Commit messages follow conventional commits
- [ ] Commits are logical and reviewable
- [ ] No merge commits in feature branches
```

---

## 4. TESTING STANDARDS

### 4.1 Unit Tests (Jest)

```javascript
// ✅ GOOD

describe('ContentAgent', () => {
  let contentAgent;
  let mockKnowledgeAgent;
  let mockAIProvider;

  beforeEach(() => {
    mockKnowledgeAgent = { query: jest.fn() };
    mockAIProvider = { generateText: jest.fn() };
    contentAgent = new ContentAgent(mockKnowledgeAgent, mockAIProvider);
  });

  describe('generateCaption', () => {
    it('should generate caption with valid input', async () => {
      // Arrange
      const input = { type: 'promotion', platform: 'facebook' };
      mockKnowledgeAgent.query.mockResolvedValue({ company: 'KIRA Senang' });
      mockAIProvider.generateText.mockResolvedValue({ text: 'Caption here' });

      // Act
      const result = await contentAgent.generateCaption(input);

      // Assert
      expect(result.caption).toBe('Caption here');
      expect(mockKnowledgeAgent.query).toHaveBeenCalled();
    });

    it('should throw error if input type is invalid', async () => {
      // Arrange
      const input = { type: 'invalid', platform: 'facebook' };

      // Act & Assert
      await expect(contentAgent.generateCaption(input)).rejects.toThrow(
        'Invalid caption type'
      );
    });

    it('should use template engine for variable substitution', async () => {
      // Arrange
      const input = { type: 'promotion', platform: 'facebook' };

      // Act
      await contentAgent.generateCaption(input);

      // Assert
      expect(mockAIProvider.generateText).toHaveBeenCalledWith(
        expect.stringContaining('{{company}}'),
        expect.any(String)
      );
    });
  });
});

// ❌ BAD
it('works', () => {
  const result = doSomething();
  expect(result).toBeDefined();  // Too vague
});
```

### 4.2 Integration Tests

```javascript
// Test interaction between multiple services

describe('AgentOrchestration', () => {
  let ceoAgent;
  let contentAgent;
  let knowledgeAgent;
  let firestore;

  beforeAll(async () => {
    // Setup real Firestore emulator
    firestore = await getFirestoreEmulator();
  });

  it('should orchestrate CEO → Knowledge → Content agents', async () => {
    // Arrange
    const userInput = 'Generate caption untuk promo POS Ramadan';
    const tenantId = 'test-tenant-123';

    // Act
    const result = await ceoAgent.processTask({
      input: userInput,
      tenantId
    });

    // Assert
    expect(result.status).toBe('SUCCESS');
    expect(result.data.caption).toBeDefined();
    expect(result.data.tokens).toBeGreaterThan(0);
  });
});
```

### 4.3 E2E Tests (Cypress/Playwright)

```javascript
// Test full user workflows

describe('Content Generation Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.login('test@kirasenang.com', 'password123');
  });

  it('should generate and save caption', () => {
    cy.visit('/agent/content');
    
    // Input
    cy.get('textarea[name="brief"]').type('Promo POS Ramadan');
    cy.get('select[name="platform"]').select('facebook');
    cy.get('button:contains("Generate")').click();

    // Wait for API response
    cy.intercept('POST', '/api/v1/agents/content/caption').as('generateCaption');
    cy.wait('@generateCaption');

    // Assert
    cy.get('[data-testid="caption-output"]').should('contain', 'Ramadan');
    cy.get('button:contains("Save to History")').click();

    // Verify saved
    cy.visit('/history');
    cy.get('table tbody tr').first().should('contain', 'Promo POS');
  });
});
```

### 4.4 Test Coverage

```bash
# Minimum coverage requirements

├─ Statements: 80%
├─ Branches: 75%
├─ Functions: 80%
└─ Lines: 80%

# Run coverage
npm test -- --coverage

# Coverage report
coverage/
├── lcov.info
└── index.html (open in browser)
```

---

## 5. ERROR HANDLING STANDARDS

### 5.1 Backend Error Responses

```javascript
// ✅ GOOD

// Consistent error format
{
  "success": false,
  "error": {
    "code": "CLAUDE_API_TIMEOUT",
    "message": "AI response took too long",
    "statusCode": 504,
    "requestId": "req_abc123",
    "timestamp": "2026-07-15T10:30:00Z",
    "details": {
      "retryAfter": 5,
      "suggestion": "Silakan cuba lagi dalam beberapa saat"
    }
  }
}

// Error codes (standardized)
INVALID_INPUT_ERROR           (400)
AUTHENTICATION_FAILED         (401)
AUTHORIZATION_DENIED          (403)
RESOURCE_NOT_FOUND           (404)
RATE_LIMIT_EXCEEDED          (429)
CLAUDE_API_TIMEOUT           (504)
FIRESTORE_ERROR              (500)
UNKNOWN_ERROR                (500)

// ❌ BAD
{ error: "Something went wrong" }           // Too vague
{ message: "Error" }                         // No status code
```

### 5.2 Error Handling in Agents

```javascript
// ✅ GOOD

async function generateCaption(input, context) {
  try {
    // Validate input
    const validated = validateInput(input);
    
    // Call AI
    const response = await aiProvider.generateText(prompt);
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    // Log with context
    logger.error('ContentAgent.generateCaption failed', {
      error: error.message,
      stack: error.stack,
      input: { ...input, brief: '[REDACTED]' },  // Redact sensitive
      timestamp: new Date()
    });
    
    // Return structured error
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: error.message,
          statusCode: 400
        }
      };
    }
    
    // Retry for transient errors
    if (isTransientError(error)) {
      return await retry(generateCaption, input, context, 3);
    }
    
    // Generic error
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to generate caption',
        statusCode: 500
      }
    };
  }
}
```

---

## 6. LOGGING STANDARDS

### 6.1 Logging Levels (Winston)

```javascript
// ✅ GOOD

logger.error('Critical error', { error, context });      // Application error
logger.warn('Deprecation warning', { oldAPI, newAPI });  // Warning
logger.info('User logged in', { userId, timestamp });    // Info
logger.debug('Agent processing', { input, output });     // Debug (dev only)

// ❌ BAD
console.log('something');        // Use logger, not console
logger.info('Error: ' + error);  // Wrong level, concatenation
logger.error('Debug: ' + obj);   // Wrong level
```

### 6.2 Log Format

```javascript
// Winston configuration
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-dmos' },
  transports: [
    new winston.transports.Console({
      format: winston.format.colorize()
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Example output
{
  "timestamp": "2026-07-15 10:30:00",
  "level": "info",
  "message": "Content generated successfully",
  "service": "ai-dmos",
  "agentName": "content-agent",
  "tenantId": "TENANT_0001",
  "tokensUsed": 1200,
  "duration": 8.5,
  "cost": 0.0045
}
```

---

## 7. PERFORMANCE BUDGET

### 7.1 API Response Times

```
API Endpoints (95th percentile):
├─ Authentication: < 200ms
├─ Dashboard load: < 500ms
├─ Agent text generation: < 10s
├─ Analytics query: < 2s
├─ Content retrieval: < 500ms

Frontend (Lighthouse):
├─ Performance: > 80
├─ Accessibility: > 90
├─ Best Practices: > 90
├─ SEO: > 90

Database (Firestore):
├─ Read latency: < 50ms
├─ Write latency: < 100ms
├─ Query latency: < 500ms (with indexes)

AI API:
├─ Claude Sonnet response: < 10s
├─ Token usage: < 5000 tokens per call (default)
```

### 7.2 Bundle Size

```
Frontend:
├─ Main bundle: < 150KB (gzipped)
├─ Vendor bundle: < 100KB (gzipped)
├─ Total: < 250KB (gzipped)

Backend:
├─ Deployment size: < 200MB
├─ Startup time: < 5 seconds
```

---

## 8. SECURITY STANDARDS

### 8.1 Secrets Management

```javascript
// ✅ GOOD

// Never commit secrets
// Use Cloud Secret Manager (production)
// Use .env.local (development, gitignored)

// Access secrets safely
const apiKey = process.env.ANTHROPIC_API_KEY;
const dbUrl = await secretManager.getSecret('firestore-url');

// ❌ BAD
const API_KEY = 'sk-...' in code
'password': 'secret123' in config file
commit .env file
```

### 8.2 Input Validation

```javascript
// ✅ GOOD

const schema = z.object({
  tenantId: z.string().uuid(),
  input: z.string().min(1).max(5000),
  agentName: z.enum(['ceo', 'content', 'knowledge']),
  options: z.object({
    temperature: z.number().min(0).max(1),
    maxTokens: z.number().min(100).max(4000)
  }).optional()
});

const validated = schema.parse(request.body);
```

---

## 9. DOCUMENTATION STANDARDS

### 9.1 Code Comments

```javascript
// ✅ GOOD — Comment WHY, not WHAT

// We use exponential backoff to avoid overwhelming the Claude API
// during periods of high load. Start with 1s and double each retry.
async function retryWithBackoff(fn, maxRetries = 3) {
  // Implementation
}

// ❌ BAD — Comments that repeat the code

// Loop through items
for (const item of items) {
  // Increment count
  count++;
}
```

### 9.2 README Format

```markdown
# AI-DMOS

One-line description.

## Quick Start

```bash
npm install
npm run dev
```

## Architecture

[Link to docs/02-SYSTEM-ARCHITECTURE.md]

## Contributing

See CONTRIBUTING.md and ENGINEERING-STANDARDS.md

## License

MIT
```

---

## 10. DEPLOYMENT STANDARDS

### 10.1 Environment Variables

```bash
# .env.local (development, .gitignored)
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
FIRESTORE_PROJECT_ID=aidmos-production
FIREBASE_DATABASE_URL=https://...
NODE_ENV=development

# Cloud Run secrets (production, via Secret Manager)
# Never commit to repo
```

### 10.2 Deployment Checklist

```
Pre-deployment:
- [ ] All tests pass (npm test)
- [ ] Linting passes (npm run lint)
- [ ] Build succeeds (npm run build)
- [ ] No console.log() in production code
- [ ] Error handling in place
- [ ] Monitoring/alerts configured
- [ ] Documentation updated

Deployment:
- [ ] Run migrations (if any)
- [ ] Deploy to staging first
- [ ] Smoke tests pass
- [ ] Monitor error rate (< 0.1%)
- [ ] Rollback plan ready

Post-deployment:
- [ ] Monitor error logs (24 hours)
- [ ] Check performance metrics
- [ ] Verify feature flags
- [ ] Communicate status to team
```

---

## 11. CHANGELOG STANDARDS

```markdown
# CHANGELOG

All notable changes documented here.

## [Unreleased]

### Added
- New template engine system for caption generation
- Model abstraction layer for provider switching

### Changed
- Improved error handling in agents

### Fixed
- Rate limiter token counting bug

## [1.0.0] - 2026-07-15

### Added
- Initial release
- CEO Agent orchestration
- Content Agent implementation
- Knowledge Agent with Markdown loader
```

---

## 12. VERSIONING

Semantic Versioning (MAJOR.MINOR.PATCH):

```
1.0.0 = Initial release
1.1.0 = Minor feature (backward compatible)
1.0.1 = Bugfix (backward compatible)
2.0.0 = Breaking change
```

---

**Document Version:** 1.0  
**Last Updated:** 15 July 2026  
**Maintained By:** AI-DMOS Engineering Team  

**Next:** Apply these standards to all code commits starting Sprint 0.
