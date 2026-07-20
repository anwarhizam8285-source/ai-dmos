# CLAUDE CODE PROMPT - AI-DMOS SPRINT 0 SETUP

**Copy this entire prompt into Claude Code and follow along.**

---

## CONTEXT

**Project:** AI Digital Marketing Operating System (AI-DMOS)  
**Phase:** Sprint 0 (Infrastructure Setup)  
**Duration:** 3-4 days  
**Goal:** Setup boilerplate, deploy to Cloud Run, all infrastructure ready

**Reference Docs Available:**
- `/docs/01-PRODUCT-REQUIREMENTS.md` (Product vision)
- `/docs/02-SYSTEM-ARCHITECTURE.md` (Architecture)
- `/docs/04-FIRESTORE-SCHEMA.md` (Database schema)
- `/docs/13-ENGINEERING-STANDARDS.md` (Code standards)
- `SPRINT-0-CHECKLIST.md` (10-point verification)
- `SPRINT-1-CHECKLIST.md` (Feature specifications)

---

## TASK: SPRINT 0 CHECKPOINT #1 - GITHUB MONOREPO SETUP

**Status:** Starting Sprint 0

**Your role:** Code assistant for AI-DMOS development

**Instructions:**

1. **Verify Prerequisites**
   ```bash
   # Check these are installed:
   node --version          # Should be 18+
   npm --version           # Should be 9+
   git --version           # Should be installed
   ```

2. **GitHub Repository Structure**
   
   The user already has:
   - [ ] GitHub account created
   - [ ] Private repo `ai-dmos` cloned locally
   - [ ] All 9 .md docs copied to repo
   - [ ] Initial commit pushed

   Now create folder structure:
   ```
   ai-dmos/
   ├── client/                          (React 19 + Vite)
   ├── server/                          (Express API)
   ├── shared/                          (Shared types, constants)
   ├── firebase/                        (Firebase config, rules)
   ├── docs/                            (Already has foundation docs)
   ├── prompts/                         (AI agent prompts)
   ├── knowledge/                       (Knowledge base files)
   ├── templates/                       (Content templates)
   ├── tests/                           (Test suite)
   ├── deployment/                      (Cloud Run, Docker config)
   ├── .github/workflows/               (CI/CD pipelines)
   ├── .gitignore                       (Node, React, secrets)
   ├── README.md                        (Project documentation)
   ├── CONTRIBUTING.md                  (Development guidelines)
   ├── CHANGELOG.md                     (Version history)
   └── package.json                     (Monorepo root)
   ```

3. **Create Root package.json (Monorepo)**

   Create `package.json` in root with:
   ```json
   {
     "name": "ai-dmos",
     "version": "1.0.0-alpha",
     "description": "AI Digital Marketing Operating System",
     "private": true,
     "workspaces": [
       "client",
       "server"
     ],
     "scripts": {
       "dev": "npm run dev --workspace=client & npm run dev --workspace=server",
       "build": "npm run build --workspace=client && npm run build --workspace=server",
       "test": "npm test --workspace=client && npm test --workspace=server",
       "lint": "npm run lint --workspace=client && npm run lint --workspace=server",
       "predeploy": "npm run build",
       "deploy": "npm run deploy --workspace=server"
     },
     "keywords": ["ai", "marketing", "saas", "malaysia", "sme"],
     "author": "Anwar",
     "license": "PROPRIETARY"
   }
   ```

4. **Create .gitignore**

   Create `.gitignore` with:
   ```
   # Dependencies
   node_modules/
   npm-debug.log
   yarn-debug.log
   yarn-error.log
   pnpm-debug.log

   # Environment
   .env
   .env.local
   .env.*.local

   # Build
   dist/
   build/
   out/

   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo
   *~
   .DS_Store

   # OS
   Thumbs.db
   .DS_Store

   # Logs
   *.log
   logs/

   # Testing
   coverage/
   .nyc_output/

   # Firebase
   .firebase/
   .firebaserc

   # Docker
   .dockerignore

   # Temporary
   .tmp/
   *.tmp
   ```

5. **Create README.md (Root)**

   Create `README.md` with:
   ```markdown
   # AI-DMOS (AI Digital Marketing Operating System)

   AI-powered marketing platform for Malaysian SMEs.

   ## Quick Start

   ### Prerequisites
   - Node.js 18+
   - Firebase account
   - Google Cloud account (Cloud Run)
   - Anthropic API key

   ### Setup

   ```bash
   # Install dependencies (both workspaces)
   npm install

   # Run development servers
   npm run dev
   # Frontend: http://localhost:5173
   # Backend: http://localhost:3000

   # Run tests
   npm test

   # Build for production
   npm run build

   # Deploy to Cloud Run
   npm run deploy
   ```

   ## Architecture

   - **Frontend:** React 19 + Vite + Tailwind
   - **Backend:** Node.js + Express
   - **Database:** Firebase Firestore (asia-southeast1)
   - **AI:** Claude Sonnet 4.6
   - **Deployment:** Cloud Run + Firebase Hosting

   ## Documentation

   - [Product Requirements](./docs/01-PRODUCT-REQUIREMENTS.md)
   - [System Architecture](./docs/02-SYSTEM-ARCHITECTURE.md)
   - [Database Schema](./docs/04-FIRESTORE-SCHEMA.md)
   - [Engineering Standards](./docs/13-ENGINEERING-STANDARDS.md)
   - [Scope Lock](./SCOPE-LOCK.md)
   - [Sprint 0 Checklist](./SPRINT-0-CHECKLIST.md)
   - [Sprint 1 Checklist](./SPRINT-1-CHECKLIST.md)

   ## Contributing

   See [CONTRIBUTING.md](./CONTRIBUTING.md)

   ## License

   Proprietary - KIRA Senang Solutions
   ```

6. **Create CONTRIBUTING.md**

   Create `CONTRIBUTING.md` with:
   ```markdown
   # Contributing to AI-DMOS

   ## Git Workflow

   1. Branch naming:
      - `feature/auth-setup`
      - `bugfix/rate-limiter-error`
      - `hotfix/critical-bug`

   2. Commit messages (Conventional Commits):
      - `feat(content-agent): add caption generation`
      - `fix(auth): correct token expiry logic`
      - `docs(firestore): update schema`

   3. Pull requests:
      - Require 1 reviewer
      - All tests must pass
      - No console.log() in production code

   ## Code Standards

   See [Engineering Standards](./docs/13-ENGINEERING-STANDARDS.md)

   - Naming conventions
   - Testing requirements (> 80% coverage)
   - Performance budgets
   - Security checklist

   ## Testing

   ```bash
   npm test                    # Run all tests
   npm run test -- --coverage  # With coverage report
   ```

   ## Before Commit

   - [ ] Tests pass
   - [ ] Linting passes
   - [ ] No secrets in code
   - [ ] Documentation updated
   ```

7. **Verify Folder Structure**

   Run this to confirm:
   ```bash
   find . -maxdepth 2 -type d | grep -v node_modules | sort
   ```

   Should show all folders created.

8. **Commit This Progress**

   ```bash
   git add .
   git commit -m "chore: setup monorepo structure and root configuration"
   git push origin main
   ```

---

## NEXT STEPS

Once this checkpoint is complete (✅):

**Next:** Move to SPRINT-0-CHECKPOINT #2 - REACT + VITE SETUP

---

## REFERENCE

**Monorepo Best Practices:**
- Each workspace (client/, server/) has own package.json
- Dependencies managed per workspace
- Shared types in shared/ folder
- Root npm install installs all workspaces

**Git Config (should already be done):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

---

## CURRENT CHECKPOINT STATUS

```
✅ 1. GitHub monorepo setup        ← YOU ARE HERE
⏳ 2. React + Vite frontend
⏳ 3. Express API server
⏳ 4. Firebase authentication
⏳ 5. Firestore schema & rules
⏳ 6. Cloud Run deployment
⏳ 7. GitHub Actions CI/CD
⏳ 8. Anthropic API integration
⏳ 9. Health check endpoint
⏳ 10. README & documentation
```

**Success Criteria for Checkpoint #1:**
- [ ] All 9 docs copied to repo
- [ ] Folder structure created
- [ ] Root package.json created
- [ ] .gitignore created
- [ ] README.md created
- [ ] CONTRIBUTING.md created
- [ ] First commit pushed to GitHub
- [ ] `git log --oneline` shows commits

---

## TROUBLESHOOTING

**Issue:** "permission denied" when pushing
→ Check GitHub SSH key or use HTTPS auth

**Issue:** "file already exists"
→ Files already in repo? Check `git status`

**Issue:** Folders not created
→ Run: `mkdir -p client server shared firebase docs prompts knowledge templates tests deployment .github/workflows`

---

## WHEN READY FOR NEXT CHECKPOINT

Tell Claude Code:
> "Sprint 0 Checkpoint #1 complete. Move to Checkpoint #2 - React + Vite Setup"

I'll provide the next prompt for React setup.

---

**Duration of Checkpoint #1:** ~30-45 minutes

**When done:** Commit message will show "setup monorepo structure"

**Ready? Let's go! 🚀**
