# CLAUDE CODE PROMPTS - SPRINT 0 COMPLETE ROADMAP

**All 10 Checkpoints for Infrastructure Setup**

---

## HOW TO USE THESE PROMPTS

1. **Checkpoint #1 (GitHub):** Follow `CLAUDE-CODE-PROMPT-SPRINT0-CHECKPOINT1.md`
2. **Checkpoints #2-10:** Follow this file, one section at a time
3. **For each checkpoint:** Copy the section into Claude Code, follow instructions, commit when done

---

## ✅ CHECKPOINT #1: GITHUB MONOREPO SETUP

**Status:** Complete (refer to separate file)

Verify:
```bash
git log --oneline
# Should show: "chore: setup monorepo structure"

ls -la
# Should show all folders created
```

---

## ⏳ CHECKPOINT #2: REACT + VITE FRONTEND SETUP

**Duration:** 1-2 hours

### Task: Create React 19 + Vite app with Tailwind

**Instructions:**

```bash
# 1. Initialize Vite React project
cd client/
npm create vite@latest . -- --template react
npm install

# 2. Install dependencies
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom zustand axios
npm install -D @testing-library/react @testing-library/jest-dom vitest
npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks

# 3. Setup Tailwind
npx tailwindcss init -p

# 4. Configure Tailwind (tailwind.config.js)
# Update content paths:
# content: ["./index.html", "./src/**/*.{js,jsx}"]

# 5. Create folder structure
mkdir -p src/components src/pages src/hooks src/stores src/services src/utils src/styles

# 6. Create src/index.css with Tailwind directives
# @tailwind base;
# @tailwind components;
# @tailwind utilities;

# 7. Update vite.config.js
# Add proxy for /api routes to http://localhost:3000

# 8. Update package.json scripts
# "dev": "vite"
# "build": "vite build"
# "preview": "vite preview"
# "test": "vitest"
# "lint": "eslint src --ext jsx"
```

**Test:**
```bash
npm run dev
# Visit http://localhost:5173
# Should see Vite + React welcome page

npm run lint
# Should pass (or show fixable issues)
```

**Commit:**
```bash
cd ..
git add .
git commit -m "feat(client): setup React 19 + Vite + Tailwind"
git push origin main
```

**Success Criteria:**
- [ ] Vite dev server runs on port 5173
- [ ] React components render
- [ ] Tailwind CSS works (test with a colored div)
- [ ] npm run lint passes

---

## ⏳ CHECKPOINT #3: EXPRESS API SERVER SETUP

**Duration:** 1-2 hours

### Task: Create Express API with middleware

**Instructions:**

```bash
# 1. Initialize Express project
cd server/
npm init -y

# 2. Install dependencies
npm install express cors helmet dotenv winston zod
npm install -D nodemon jest supertest @types/jest

# 3. Create folder structure
mkdir -p src/routes src/middlewares src/services src/utils

# 4. Create src/server.js
# Basic Express app with:
# - helmet() for security
# - cors() for cross-origin
# - express.json() for parsing
# - Error handler middleware

# 5. Create src/app.js
# Export Express app (separate from server start)

# 6. Create .env.local
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# 7. Update package.json scripts
# "start": "node src/server.js"
# "dev": "nodemon src/server.js"
# "test": "jest"

# 8. Create src/routes/health.js
# GET /health endpoint returning:
# { status: "ok", timestamp, environment }

# 9. Create src/middlewares/logger.js
# Winston logger setup

# 10. Create src/middlewares/errorHandler.js
# Global error handling middleware
```

**Test:**
```bash
npm run dev
# Should log: "Server running on http://localhost:3000"

# In another terminal:
curl http://localhost:3000/health
# Should return: {"status":"ok",...}

npm test
# Should run without crashing
```

**Commit:**
```bash
cd ..
git add .
git commit -m "feat(server): setup Express API with middleware"
git push origin main
```

**Success Criteria:**
- [ ] Server starts on port 3000
- [ ] /health endpoint returns 200
- [ ] CORS enabled
- [ ] Helmet security headers applied
- [ ] Jest runs

---

## ⏳ CHECKPOINT #4: FIREBASE AUTHENTICATION SETUP

**Duration:** 1-2 hours

### Task: Configure Firebase Auth locally + emulator

**Instructions:**

```bash
# 1. Install Firebase Admin SDK
cd server/
npm install firebase-admin

# 2. Create src/services/firebaseService.js
# Export:
# - admin.auth()
# - admin.firestore()
# - admin.storage()

# 3. Setup Firebase emulator locally
npm install -D firebase-tools
firebase init emulators
# Select: Auth emulator (port 9099), Firestore (port 8080)

# 4. Create .env.local (if not exists)
FIREBASE_USE_EMULATOR=true
FIREBASE_EMULATOR_PORT=9099
FIRESTORE_EMULATOR_HOST=localhost:8080

# 5. Create test user in emulator
firebase emulators:start &
# Go to http://localhost:4000 (emulator UI)
# Create test user: test@kirasenang.com / password123

# 6. Create src/routes/auth.js with endpoints:
# POST /api/v1/auth/register
# POST /api/v1/auth/login
# GET /api/v1/auth/me
# POST /api/v1/auth/logout

# 7. Create src/middlewares/auth.js (AuthGuard)
# Verify JWT token from Authorization header

# 8. Create .gitignore additions
.firebase/
.firebaserc
emulator-data/
```

**Test:**
```bash
firebase emulators:start &
# Wait for "All emulators started"

npm run dev &

# Test register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kirasenang.com","password":"testpass123"}'

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kirasenang.com","password":"testpass123"}'
# Should return token
```

**Commit:**
```bash
cd ..
git add .
git commit -m "feat(server): setup Firebase Auth with emulator"
git push origin main
```

**Success Criteria:**
- [ ] Firebase emulator starts
- [ ] Register endpoint works
- [ ] Login endpoint returns JWT token
- [ ] AuthGuard middleware verifies token
- [ ] Test user created

---

## ⏳ CHECKPOINT #5: FIRESTORE SCHEMA & SECURITY RULES

**Duration:** 1-2 hours

### Task: Create Firestore collections + security rules

**Instructions:**

```bash
# 1. Start emulator (if not running)
firebase emulators:start

# 2. Create Firestore collections via CLI or UI
# http://localhost:4000 → Firestore tab
# Create collections (can be empty):
# - tenants/TENANT_0001/company
# - users
# - audit_logs

# 3. Create firestore.rules file
# Copy from 04-FIRESTORE-SCHEMA.md
# Multi-tenant rules with RBAC

# 4. Deploy rules to emulator
firebase emulators:start --import=./firestore-seed.json

# 5. Create src/services/firestore.js
# Export functions:
# - getCompanyProfile(tenantId)
# - saveCompanyProfile(tenantId, data)
# - createUser(uid, email)

# 6. Update src/app.js
# Add route: GET /api/v1/firestore/health
# Returns: { firestore: "connected" }

# 7. Create firestore.indexes.json
# Add composite indexes (none needed for MVP 1)

# 8. Test data insert
# Via emulator UI or code
```

**Test:**
```bash
# Check Firestore connection
curl http://localhost:3000/api/v1/firestore/health
# Should return: {"firestore":"connected"}

# Check emulator has collections
# http://localhost:4000 → Firestore → Collections
# Should see: tenants, users, audit_logs
```

**Commit:**
```bash
git add .
git commit -m "feat(firebase): setup Firestore schema and security rules"
git push origin main
```

**Success Criteria:**
- [ ] Firestore collections created
- [ ] Security rules deployed
- [ ] Firestore connectivity test passes
- [ ] Test data can be inserted/retrieved
- [ ] Rules prevent unauthorized access

---

## ⏳ CHECKPOINT #6: CLOUD RUN DEPLOYMENT SETUP

**Duration:** 1-2 hours

### Task: Create Docker config + Cloud Run service

**Instructions:**

```bash
# 1. Create server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ src/
EXPOSE 3000
CMD ["node", "src/server.js"]

# 2. Create server/.dockerignore
node_modules/
npm-debug.log
.env*
.firebase/

# 3. Test Docker build locally
cd server/
docker build -t ai-dmos-api .
docker run -p 3000:3000 ai-dmos-api
curl http://localhost:3000/health

# 4. Setup Google Cloud
gcloud init
gcloud auth login
gcloud config set project aidmos-production

# 5. Enable Cloud Run API
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 6. Create deployment/cloud-run-config.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ai-dmos-api
  namespace: default
spec:
  template:
    spec:
      containers:
      - image: ai-dmos-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: NODE_ENV
          value: production

# 7. Deploy to Cloud Run
gcloud run deploy ai-dmos-api \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1

# 8. Note the service URL
# https://ai-dmos-api-[hash].asia-southeast1.run.app
```

**Test:**
```bash
# Get Cloud Run URL
CLOUD_RUN_URL=$(gcloud run services describe ai-dmos-api \
  --region asia-southeast1 \
  --format='value(status.url)')

# Test /health endpoint
curl $CLOUD_RUN_URL/health
# Should return: {"status":"ok",...}
```

**Commit:**
```bash
git add .
git commit -m "feat(deployment): setup Docker and Cloud Run configuration"
git push origin main
```

**Success Criteria:**
- [ ] Docker image builds locally
- [ ] Cloud Run service deployed
- [ ] /health endpoint accessible on Cloud Run
- [ ] Service URL noted

---

## ⏳ CHECKPOINT #7: GITHUB ACTIONS CI/CD

**Duration:** 1 hour

### Task: Setup automated testing + deployment

**Instructions:**

```bash
# 1. Create .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci --workspace=client && npm ci --workspace=server
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloud Run
        run: |
          gcloud auth activate-service-account --key-file=${{ secrets.GCP_SA_KEY }}
          gcloud run deploy ai-dmos-api --region asia-southeast1 --source=server/

# 2. Setup GitHub Secrets
# Go to Settings → Secrets → New secret
# Add: GCP_SA_KEY (Cloud Run service account JSON)
# Add: GCP_PROJECT_ID (aidmos-production)

# 3. Test by pushing a commit
git add .
git commit -m "chore: setup GitHub Actions CI/CD"
git push origin main

# 4. Watch GitHub Actions tab
# Should see workflow running
```

**Test:**
```bash
# Go to GitHub → Actions tab
# Should see workflow with:
✅ test-and-deploy
  ✓ Setup Node
  ✓ Install dependencies
  ✓ Lint
  ✓ Test
  ✓ Build
  ✓ Deploy to Cloud Run
```

**Commit:**
```bash
git add .
git commit -m "ci: setup GitHub Actions workflow"
git push origin main
```

**Success Criteria:**
- [ ] Workflow file created (.github/workflows/ci-cd.yml)
- [ ] GitHub Secrets configured
- [ ] Workflow runs on push to main
- [ ] All jobs pass (lint, test, build, deploy)

---

## ⏳ CHECKPOINT #8: ANTHROPIC API INTEGRATION

**Duration:** 30 mins

### Task: Setup Claude API in backend

**Instructions:**

```bash
# 1. Install Anthropic SDK
cd server/
npm install @anthropic-ai/sdk

# 2. Create src/services/anthropicService.js
class AnthropicService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  async generateText(systemPrompt, userMessage, options = {}) {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4.6',
      max_tokens: options.maxTokens || 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });
    
    return {
      text: response.content[0].text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    };
  }
}

# 3. Add to .env.local
ANTHROPIC_API_KEY=sk-... (your actual key)

# 4. Create src/routes/test-anthropic.js
router.post('/test-anthropic', async (req, res) => {
  const service = new AnthropicService();
  const result = await service.generateText(
    'You are helpful assistant',
    'Hello, how are you?'
  );
  res.json(result);
});

# 5. Test endpoint
curl -X POST http://localhost:3000/api/v1/test-anthropic \
  -H "Content-Type: application/json"
# Should return: text, inputTokens, outputTokens
```

**Commit:**
```bash
git add .
git commit -m "feat(ai): integrate Anthropic Claude API"
git push origin main
```

**Success Criteria:**
- [ ] Anthropic SDK installed
- [ ] API key stored in .env.local
- [ ] Test endpoint returns Claude response
- [ ] Token counting works

---

## ⏳ CHECKPOINT #9: HEALTH CHECK API

**Duration:** 30 mins

### Task: Create comprehensive /health endpoint

**Instructions:**

```bash
# 1. Update src/routes/health.js
GET /health should return:
{
  "status": "ok" | "degraded" | "error",
  "timestamp": "2026-07-20T10:30:00Z",
  "version": "1.0.0-alpha",
  "environment": "production",
  "checks": {
    "database": "connected" | "disconnected",
    "auth": "ok" | "error",
    "anthropic_api": "configured" | "missing",
    "storage": "connected" | "disconnected"
  }
}

# 2. Perform actual checks:
# - Database: Try Firestore query
# - Auth: Check Firebase Auth initialized
# - Anthropic: Check API key exists
# - Storage: Check Firebase Storage accessible

# 3. Implement liveness probe (for Cloud Run)
# Cloud Run uses /health to determine if instance is alive

# 4. Test locally
npm run dev
curl http://localhost:3000/health

# 5. Test on Cloud Run
curl https://ai-dmos-api-[hash].asia-southeast1.run.app/health
```

**Commit:**
```bash
git add .
git commit -m "feat(health): implement comprehensive health check endpoint"
git push origin main
```

**Success Criteria:**
- [ ] /health returns 200 with all checks
- [ ] All checks return "ok" or "configured"
- [ ] Works locally and on Cloud Run

---

## ⏳ CHECKPOINT #10: README & DOCUMENTATION

**Duration:** 30 mins

### Task: Complete project documentation

**Instructions:**

```bash
# 1. Update root README.md with:
# - Quick start (clone, install, run)
# - Architecture overview
# - Tech stack
# - Project structure
# - Testing
# - Deployment

# 2. Create docs/SETUP.md with:
# - Firebase project setup
# - Cloud Run configuration
# - Local emulator setup
# - Environment variables
# - Troubleshooting

# 3. Create docs/API.md with:
# - All API endpoints
# - Request/response examples
# - Error codes
# - Authentication

# 4. Update CONTRIBUTING.md with:
# - Development workflow
# - Branch naming
# - Commit conventions
# - PR process

# 5. Test README completeness
# New developer should be able to:
# 1. Clone repo
# 2. Follow README
# 3. Run app locally
# 4. Run tests
# Within 15 minutes
```

**Commit:**
```bash
git add .
git commit -m "docs: complete Sprint 0 documentation"
git push origin main
```

**Success Criteria:**
- [ ] README is clear and complete
- [ ] Setup docs available
- [ ] API documentation complete
- [ ] Contributing guidelines updated

---

## SPRINT 0 FINAL VERIFICATION

**When all 10 checkpoints complete:**

```bash
# Run this checklist:

# 1. GitHub
git log --oneline | head -10      # Should show 10+ commits
ls -la                             # All folders present

# 2. Frontend
cd client && npm run build         # Should succeed
npm run lint                       # Should pass

# 3. Backend
cd ../server && npm run test       # Should succeed (even if 0 tests)
npm run lint                       # Should pass

# 4. Deployment
npm run dev &                      # Server starts
curl http://localhost:3000/health # Returns ok

# 5. Cloud Run
gcloud run services describe ai-dmos-api --region asia-southeast1
# Copy URL and test:
curl [CLOUD_RUN_URL]/health        # Returns ok

# 6. Documentation
cat README.md | wc -l              # > 50 lines
cat docs/SETUP.md | wc -l          # > 30 lines
```

**If all pass: SPRINT 0 COMPLETE ✅**

---

## NEXT PHASE

Once Sprint 0 complete:

**Tell Claude Code:**
> "Sprint 0 complete. Ready for Sprint 1 - Feature Development"

**Sprint 1 involves:**
1. Login / Register UI + API
2. Company Profile UI + API
3. Dashboard UI
4. Knowledge Loader
5. CEO Agent implementation
6. Content Agent implementation
7. History & Storage
8. Usage Stats

I'll provide comprehensive prompts for each feature.

---

## TROUBLESHOOTING QUICK REFERENCE

| Issue | Solution |
|-------|----------|
| npm install fails | `npm cache clean --force` then retry |
| Port 3000 in use | `lsof -i :3000` then kill process |
| Firebase emulator won't start | `firebase emulators:start --verbose` for logs |
| Docker build fails | Check file paths, ensure node_modules.gitignore exists |
| GitHub Actions fails | Check secrets are set, review workflow logs |
| Anthropic API fails | Verify ANTHROPIC_API_KEY in .env.local |
| Cloud Run deployment fails | Check `gcloud run logs` |

---

## ESTIMATED TIMELINE

```
Checkpoint #1 (GitHub):      45 mins  → Total:   45 mins
Checkpoint #2 (React):        2 hrs   → Total: 2:45
Checkpoint #3 (Express):      2 hrs   → Total: 4:45
Checkpoint #4 (Firebase):     2 hrs   → Total: 6:45
Checkpoint #5 (Firestore):    2 hrs   → Total: 8:45
Checkpoint #6 (Cloud Run):    2 hrs   → Total: 10:45
Checkpoint #7 (CI/CD):        1 hr    → Total: 11:45
Checkpoint #8 (Anthropic):   30 min   → Total: 12:15
Checkpoint #9 (Health):      30 min   → Total: 12:45
Checkpoint #10 (Docs):       30 min   → Total: 13:15

TOTAL SPRINT 0: ~13.5 hours (spread over 3-4 days)
```

---

**Status: READY TO BUILD SPRINT 0 🚀**

Start with Checkpoint #1. Let me know when ready for next checkpoint.
