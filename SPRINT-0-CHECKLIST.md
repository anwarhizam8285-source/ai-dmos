# SPRINT 0 CHECKLIST

**Duration:** 3-4 days (Next: 16-19 July 2026)  
**Goal:** Infrastructure ready, boilerplate deployed, team can start coding Sprint 1  
**Success Condition:** All 10 checkpoints VERIFIED ✓  

---

## BEFORE YOU START

**Prerequisites:**
- [ ] GitHub account ready (with private repo access)
- [ ] Firebase account (Google Cloud project admin)
- [ ] Cloud Run quotas verified (willing to use Cloud resources)
- [ ] Git + Node.js + npm installed locally
- [ ] 40+ hours available for infrastructure setup

---

## 10-POINT SPRINT 0 CHECKLIST

### ✓ 1. GITHUB MONOREPO SETUP

**Verification:** GitHub private repo `ai-dmos` exists and accessible

**Checklist:**

```
[ ] Create repo: https://github.com/yourname/ai-dmos
[ ] Clone to local: git clone https://github.com/yourname/ai-dmos.git
[ ] Folder structure created:
    ai-dmos/
    ├── client/
    ├── server/
    ├── shared/
    ├── firebase/
    ├── docs/
    ├── prompts/
    ├── knowledge/
    ├── templates/
    ├── .github/workflows/
    ├── deployment/
    ├── tests/
    ├── .gitignore (Node + React)
    ├── README.md
    ├── CONTRIBUTING.md
    ├── CHANGELOG.md
    └── package.json (monorepo root)

[ ] .gitignore configured:
    - node_modules/
    - .env*
    - .DS_Store
    - *.log
    - build/
    - dist/

[ ] CODEOWNERS configured:
    * @yourname

[ ] Initial commit:
    git add .
    git commit -m "chore: initialize monorepo structure"
    git push origin main
```

**Verification Test:**
```bash
cd ai-dmos
git log --oneline  # Should show initial commit
ls -la             # Should show all folders
cat .gitignore     # Should show proper exclusions
```

**Pass Condition:** ✅ Repo is live, folders created, initial commit pushed

---

### ✓ 2. REACT + VITE FRONTEND SETUP

**Verification:** React app runs locally on `http://localhost:5173`

**Checklist:**

```bash
cd client/
[ ] npm create vite@latest . -- --template react
[ ] npm install
[ ] npm install -D tailwindcss postcss autoprefixer
[ ] npx tailwindcss init -p
[ ] npm install react-router-dom zustand axios
[ ] npm install -D @testing-library/react @testing-library/jest-dom vitest

[ ] Create folder structure:
    client/src/
    ├── components/
    ├── pages/
    ├── hooks/
    ├── stores/
    ├── services/
    ├── utils/
    ├── App.jsx
    └── main.jsx

[ ] Configure Vite (vite.config.js):
    - API proxy: /api → http://localhost:3000/api
    - Source map enabled (dev)
    - Minify enabled (prod)

[ ] Tailwind configured (src/index.css)
[ ] ESLint configured (.eslintrc.json)
[ ] package.json scripts:
    "dev": "vite"
    "build": "vite build"
    "preview": "vite preview"
    "test": "vitest"
    "lint": "eslint src --ext jsx"
```

**Verification Test:**
```bash
cd client
npm run dev
# Visit http://localhost:5173
# Should see Vite + React welcome page

npm run build
# Should create dist/ folder without errors

npm run lint
# Should pass with no major issues
```

**Pass Condition:** ✅ App runs on port 5173, builds without errors, linting passes

---

### ✓ 3. EXPRESS API SERVER SETUP

**Verification:** API server runs on `http://localhost:3000` and responds to requests

**Checklist:**

```bash
cd server/
[ ] npm init -y
[ ] npm install express cors helmet dotenv winston zod
[ ] npm install -D nodemon jest supertest @types/jest

[ ] Create folder structure:
    server/src/
    ├── routes/
    │   ├── auth.js
    │   ├── agents.js
    │   ├── company.js
    │   └── index.js
    ├── middlewares/
    │   ├── auth.js
    │   ├── errorHandler.js
    │   └── logger.js
    ├── services/
    │   ├── firestore.js
    │   ├── anthropic.js
    │   └── index.js
    ├── utils/
    │   └── validators.js
    ├── app.js
    └── server.js

[ ] Create server/src/app.js (Express app setup):
    - Middleware: helmet, cors, logger
    - Routes: /health, /api/v1/*
    - Error handler

[ ] Create server/src/server.js (server startup):
    - Listen on port 3000
    - Log startup message

[ ] .env.local configured:
    PORT=3000
    NODE_ENV=development
    FIREBASE_PROJECT_ID=aidmos-production
    ANTHROPIC_API_KEY=[will add later]

[ ] package.json scripts:
    "start": "node src/server.js"
    "dev": "nodemon src/server.js"
    "test": "jest"
```

**Verification Test:**
```bash
cd server
npm run dev
# Should log "Server running on http://localhost:3000"

# In another terminal:
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}

npm test
# Should run without crashing (even if no tests yet)
```

**Pass Condition:** ✅ Server starts, /health endpoint responds, npm test runs

---

### ✓ 4. FIREBASE AUTHENTICATION SETUP

**Verification:** Firebase Auth is configured, emulator works locally

**Checklist:**

```bash
[ ] Create Firebase project:
    - Project name: aidmos-production
    - Region: asia-southeast1
    - Enable: Firestore, Storage, Hosting, Cloud Functions

[ ] Download Firebase Admin SDK:
    cd server/
    npm install firebase-admin

[ ] Create server/src/services/firebaseService.js:
    - Initialize Firebase Admin SDK
    - Export auth, firestore, storage
    - Error handling

[ ] Enable Authentication methods:
    Firebase Console → Auth → Sign-in method
    [✓] Email/Password
    [✓] Anonymous (for testing)

[ ] Create test user in Firebase:
    Email: test@kirasenang.com
    Password: testpass123

[ ] Setup Firebase emulator (local development):
    npm install -D firebase-tools
    firebase init emulators
    - Emulator suite enabled
    - Auth emulator (port 9099)
    - Firestore emulator (port 8080)

[ ] Configure emulator (.env.local):
    FIREBASE_USE_EMULATOR=true
    FIREBASE_EMULATOR_PORT=9099
    FIRESTORE_EMULATOR_HOST=localhost:8080

[ ] Firestore default database created:
    - Region: asia-southeast1
    - Type: Native mode
    - Rules updated (see section 5)
```

**Verification Test:**
```bash
# Start emulator
firebase emulators:start

# In another terminal, test auth:
curl -X POST http://localhost:9099/... [auth endpoint]
# Should respond (even if error)

# Test Firestore connection:
curl -X GET http://localhost:8080/...
# Should respond
```

**Pass Condition:** ✅ Firebase project created, emulator runs, test user created

---

### ✓ 5. FIRESTORE SCHEMA & SECURITY RULES

**Verification:** Firestore collection structure matches 04-FIRESTORE-SCHEMA.md, security rules applied

**Checklist:**

```
[ ] Firestore collections created (can be empty):
    - tenants/{tenantId}/company
    - tenants/{tenantId}/workspaces
    - tenants/{tenantId}/workspaces/{workspaceId}/brands
    - tenants/{tenantId}/workspaces/{workspaceId}/brands/{brandId}/social_accounts
    - tenants/{tenantId}/workspaces/{workspaceId}/knowledge_base
    - tenants/{tenantId}/workspaces/{workspaceId}/content
    - tenants/{tenantId}/workspaces/{workspaceId}/agent_logs
    - tenants/{tenantId}/workspaces/{workspaceId}/usage_logs
    - users/{uid}
    - audit_logs

[ ] Security rules deployed:
    firebase/firestore.rules → Firebase Console
    [✓] Multi-tenant isolation enforced
    [✓] User-level access control
    [✓] Immutable log collections

[ ] Firestore indexes created:
    Firebase Console → Firestore → Indexes
    [✓] content: status (Asc) + createdAt (Desc)
    [✓] agent_logs: agentName (Asc) + timestamp (Desc)
    [✓] usage_logs: month (Desc)

[ ] Test data inserted for MVP 1:
    - Tenant: TENANT_0001 (KIRA Senang)
    - Company: KIRA Senang Sdn Bhd
    - User: test@kirasenang.com
    - Brand: BRAND_001
```

**Verification Test:**
```bash
# Using Firebase CLI:
firebase firestore:query 'tenants/TENANT_0001/company'
# Should return test data (or empty if not yet inserted)

# Check rules deployed:
firebase firestore:rules:list
# Should show custom rules, not defaults
```

**Pass Condition:** ✅ Collections exist, security rules deployed, test data inserted

---

### ✓ 6. CLOUD RUN DEPLOYMENT SETUP

**Verification:** Dockerfile builds, Cloud Run service created, deployment pipeline configured

**Checklist:**

```bash
cd server/

[ ] Create Dockerfile:
    - Base: node:18-alpine
    - Copy package.json
    - npm ci (clean install)
    - Copy src/
    - Expose port 3000
    - CMD node src/server.js

[ ] Create deployment/cloud-run-config.yaml:
    - Service name: ai-dmos-api
    - Region: asia-southeast1
    - Memory: 1GB
    - CPU: 1
    - Max instances: 100
    - Min instances: 1
    - Timeout: 3600s
    - Environment variables linked to Secret Manager

[ ] Create .dockerignore:
    - node_modules/
    - npm-debug.log
    - .git/
    - .env*

[ ] Test Docker build locally:
    docker build -t ai-dmos-api .
    docker run -p 3000:3000 ai-dmos-api
    curl http://localhost:3000/health
    # Should respond

[ ] Enable Cloud Run API (Google Cloud Console):
    gcloud services enable run.googleapis.com
    gcloud services enable cloudbuild.googleapis.com

[ ] Create Cloud Run service:
    gcloud run create ai-dmos-api \
      --source . \
      --region asia-southeast1 \
      --allow-unauthenticated \
      --memory 1Gi \
      --cpu 1

[ ] Note Cloud Run URL: https://ai-dmos-[hash].asia-southeast1.run.app

[ ] Configure Secret Manager:
    gcloud secrets create ANTHROPIC_API_KEY --replication-policy="automatic"
    gcloud secrets add-iam-policy-binding ANTHROPIC_API_KEY \
      --member=serviceAccount:[PROJECT]@appspot.gserviceaccount.com \
      --role=roles/secretmanager.secretAccessor

[ ] Cloud Run service linked to secrets (in gcloud run deploy)
```

**Verification Test:**
```bash
# Get Cloud Run URL
gcloud run services describe ai-dmos-api --region asia-southeast1

# Test the endpoint
curl https://ai-dmos-[hash].asia-southeast1.run.app/health
# Should respond with {"status":"ok"}

# Check logs
gcloud run logs read ai-dmos-api --region asia-southeast1
```

**Pass Condition:** ✅ Docker builds, Cloud Run deployed, /health accessible

---

### ✓ 7. GITHUB ACTIONS CI/CD PIPELINE

**Verification:** `.github/workflows/ci-cd.yml` created, pipeline runs on push to main

**Checklist:**

```bash
[ ] Create .github/workflows/ci-cd.yml:
    - Trigger: on push to main branch
    - Jobs:
      1. Lint (ESLint on client)
      2. Test (npm test on server)
      3. Build Docker image
      4. Deploy to Cloud Run

[ ] Workflow steps:
    1. Checkout code
    2. Setup Node.js
    3. npm ci (both client & server)
    4. npm run lint
    5. npm run test
    6. gcloud auth
    7. docker build
    8. docker push to Google Container Registry
    9. gcloud run deploy

[ ] GitHub secrets configured:
    - GCP_PROJECT_ID: aidmos-production
    - GCP_SERVICE_ACCOUNT_KEY: [downloaded JSON]

[ ] Test workflow:
    - Push code to main
    - GitHub Actions runs automatically
    - All checks pass (lint, test, build)

[ ] Deployment completes:
    - Cloud Run URL updated
    - Health check passes
    - Slack notification (optional)
```

**Verification Test:**
```bash
# Make a dummy commit and push to main
git commit --allow-empty -m "test: trigger CI/CD"
git push origin main

# Check GitHub Actions tab
# Should see workflow running
# Wait for completion (should take < 5 minutes)

# Verify deployment
curl [CLOUD_RUN_URL]/health
# Should respond
```

**Pass Condition:** ✅ Workflow runs, builds successfully, deploys to Cloud Run

---

### ✓ 8. ANTHROPIC API INTEGRATION

**Verification:** Anthropic SDK installed, API key stored in Secret Manager, test API call succeeds

**Checklist:**

```bash
cd server/

[ ] npm install @anthropic-ai/sdk

[ ] Create server/src/services/anthropicService.js:
    - Initialize Anthropic client
    - Create generateText() function
    - Error handling for rate limits
    - Token counting

[ ] Store API key:
    - Add ANTHROPIC_API_KEY to Secret Manager (step 6)
    - Server retrieves from environment

[ ] Create test endpoint server/src/routes/test-anthropic.js:
    GET /api/v1/test-anthropic
    → calls Anthropic API
    → returns response + token count

[ ] Test locally:
    export ANTHROPIC_API_KEY=sk-...
    npm run dev
    curl http://localhost:3000/api/v1/test-anthropic
    # Should return Claude's response

[ ] Test on Cloud Run:
    gcloud run deploy ... --set-env-vars ANTHROPIC_API_KEY=[value]
    curl https://[cloud-run-url]/api/v1/test-anthropic
    # Should return Claude's response
```

**Verification Test:**
```bash
# Local test
npm run dev &
curl -X POST http://localhost:3000/api/v1/test-anthropic \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, how are you?"}'

# Should return:
{
  "response": "I'm doing well...",
  "inputTokens": 10,
  "outputTokens": 25,
  "cost": 0.00045
}
```

**Pass Condition:** ✅ SDK installed, API key stored securely, test API call works

---

### ✓ 9. HEALTH CHECK API (`/health`)

**Verification:** `GET /health` endpoint responds with system status, all dependencies checked

**Checklist:**

```
[ ] Create server/src/routes/health.js:
    Endpoint: GET /health
    
    Checks performed:
    - Node.js version
    - Environment (production/development)
    - Firebase Firestore connectivity
    - Firebase Auth status
    - Anthropic API key present
    - Cloud environment (Cloud Run vs local)
    
    Response format:
    {
      "status": "ok" or "degraded" or "error",
      "timestamp": "2026-07-15T10:30:00Z",
      "version": "1.0.0",
      "environment": "production",
      "checks": {
        "database": "connected",
        "auth": "ok",
        "anthropic_api": "configured",
        "storage": "connected"
      }
    }

[ ] Route registered in server/src/app.js
[ ] Health check passes on startup
[ ] Health check monitored by Cloud Run
[ ] Liveness probe configured in Cloud Run
```

**Verification Test:**
```bash
# Local
curl http://localhost:3000/health
# Returns: {"status":"ok",...}

# Cloud Run
curl https://[cloud-run-url]/health
# Returns: {"status":"ok",...}

# Verify all checks pass
# status should be "ok" (not "degraded" or "error")
```

**Pass Condition:** ✅ /health endpoint returns 200 with all checks passing

---

### ✓ 10. README & DOCUMENTATION

**Verification:** README.md complete, setup instructions clear, new developer can run the project in 15 minutes

**Checklist:**

```markdown
[ ] README.md contains:

## AI-DMOS
One-line description of the platform

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Anthropic API key

### Local Setup
1. Clone repo
2. Install dependencies
3. Configure .env.local
4. npm run dev (frontend)
5. npm run dev (backend)
6. Visit http://localhost:5173

### Deployment
- GitHub Actions CI/CD (see .github/workflows/)
- Cloud Run auto-deploys on push to main
- Health check: https://[url]/health

## Architecture
[Link to docs/02-SYSTEM-ARCHITECTURE.md]

## Testing
- npm test (server)
- npm test (client)

## Contributing
See CONTRIBUTING.md and docs/13-ENGINEERING-STANDARDS.md

## Troubleshooting
[Common issues & solutions]

[ ] CONTRIBUTING.md contains:
    - Branch naming rules
    - Commit message format
    - Pull request checklist
    - Code review guidelines

[ ] deployment/SETUP.md:
    - Firebase project setup
    - Cloud Run configuration
    - Secret Manager setup
    - Local emulator setup

[ ] All docs linked from README
[ ] No broken links
[ ] README tested by another person (clear enough?)
```

**Verification Test:**
```bash
# Remove node_modules/
rm -rf client/node_modules server/node_modules

# Follow README instructions exactly
# Should be able to:
# 1. npm install (both)
# 2. npm run dev (both)
# 3. Visit http://localhost:5173
# 4. Call http://localhost:3000/health
# Within 15 minutes
```

**Pass Condition:** ✅ README is clear, a stranger can setup project in 15 mins

---

## FINAL VERIFICATION (Day 4, Sprint 0)

**Run this checklist to confirm Sprint 0 is complete:**

```bash
# 1. GitHub
git log --oneline | head -5        # At least 1 commit
ls -la                             # All folders present

# 2. Frontend
cd client && npm run build         # No errors
npm run lint                       # No major issues

# 3. Backend
cd ../server && npm run test       # All pass (even if 0 tests)
npm run lint                       # No major issues

# 4. Deployment
npm run dev &                      # Server starts
curl http://localhost:3000/health # Returns ok

# 5. Emulator
firebase emulators:start &         # Emulators start
curl http://localhost:8080/...    # Firestore responds

# 6. Cloud
gcloud run describe ai-dmos-api --region asia-southeast1
curl [CLOUD_RUN_URL]/health        # Returns ok

# 7. Documentation
cat README.md | wc -l              # > 50 lines
cat deployment/SETUP.md | wc -l   # > 30 lines
```

**All checks passing?**

### ✅ SPRINT 0 COMPLETE

**Celebration moment:** Infrastructure is ready. Next: Sprint 1 (Features).

---

## IF ANY CHECK FAILS

| Checkpoint | Issue | Solution |
|-----------|-------|----------|
| 1. GitHub | Can't clone | Check SSH keys, permissions |
| 2. React | npm install fails | Clear cache: `npm cache clean --force` |
| 3. Express | Port 3000 conflict | `lsof -i :3000`, kill process |
| 4. Firebase | SDK auth fails | Check .env.local, credentials |
| 5. Firestore | Emulator won't start | `firebase emulators:start --verbose` |
| 6. Cloud Run | Deployment fails | Check `gcloud run logs` for errors |
| 7. CI/CD | Workflow fails | Check `.github/workflows/ci-cd.yml` syntax |
| 8. Anthropic | API fails | Verify ANTHROPIC_API_KEY in Secret Manager |
| 9. Health | Returns error | Check all services are running |
| 10. README | Outdated | Re-read docs, update with new info |

**If stuck > 30 mins on any item:** Escalate, don't hack around it.

---

**Sprint 0 Status:** LOCKED  
**Next:** Sprint 1 Checklist (feature development)  
**Estimated completion:** 3-4 days (19 July 2026)
