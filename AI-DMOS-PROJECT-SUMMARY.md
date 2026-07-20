# AI-DMOS PROJECT SUMMARY

**Project:** AI Digital Marketing Operating System (SaaS Platform)  
**Start Date:** 15 July 2026  
**Target Launch:** 2 August 2026 (MVP 1)  
**First Customer:** KIRA Senang (Tenant #0001)  
**Founder:** Anwar (Penang, Malaysia)  

---

## 🎯 VISION

Build an **AI-powered marketing platform** that helps Malaysian SMEs generate quality content in < 2 minutes, without technical knowledge.

**Slogan:** Build → Use → Measure → Improve

---

## ✅ KEY DECISIONS (LOCKED)

### 1. Architecture Freeze v1.0
- Multi-tenant design (companies as tenants)
- CEO Agent orchestrates all tasks
- Knowledge Agent provides context (RAG progressive: Markdown → Firestore → Embeddings → Vector DB)
- **No changes to architecture until MVP 1 complete**

### 2. Scope Lock (MVP 1 ONLY)
**Active Agents:**
- CEO Agent (orchestrator)
- Knowledge Agent (context loader)
- Content Agent (caption generation)

**Other agents registered but NOT implemented:**
- Marketing, Planner, Analytics, Trend, Comment, Messenger, Automation, Image (Sprints 2-5)

### 3. Knowledge Base (Minimal)
Only 6 knowledge files for MVP 1:
```
knowledge/
├── company/ (brand.md, products.md, faq.md)
├── marketing/ (copywriting.md, cta.md)
└── malaysia/ (holidays.md, sme.md)
```

### 4. Templates (Minimal)
Only 5-6 templates for MVP 1:
```
templates/
├── caption/ (tips.md, promotion.md, announcement.md)
├── carousel/ (educational.md)
└── blog/ (how-to.md)
```

### 5. Engineering Rule
**Every feature = Code + Documentation + Tests**
- Unit tests > 80% coverage
- Integration tests for flows
- E2E tests for user journeys
- No feature complete without all three

### 6. Backlog Process
New ideas → BACKLOG.md, NOT roadmap
- Backlog reviewed after dogfooding
- Sprint 2+ planned based on real usage data, not assumptions

### 7. Definition of MVP 1 Success
**One question:** "Can a Malaysian SME generate quality content in < 2 minutes?"
- ✅ Time test: Avg < 2 mins per post
- ✅ Quality test: > 80% usable without editing
- ✅ Reliability test: Zero critical bugs, > 99% uptime
- ✅ Cost test: < RM 0.10 per post

### 8. Dogfooding Strategy
KIRA Senang team uses platform for 1-2 weeks (real marketing)
- Collect bugs, UX issues, prompt issues
- Measure: time, cost, quality, reliability
- Data drives Sprint 2+ priorities (NOT assumptions)

---

## 📁 DELIVERABLES CREATED

### Foundation Documents (8 files)

```
docs/
├── 01-PRODUCT-REQUIREMENTS.md (Bahasa Melayu)
│   └── 6 MVPs, user stories, success metrics, timeline
│
├── 02-SYSTEM-ARCHITECTURE.md (English + diagrams)
│   └── CEO orchestration flow, multi-tenant design, security layers
│
├── 04-FIRESTORE-SCHEMA.md (English + security rules)
│   └── Collection hierarchy, field schemas, indexes, rules
│
└── 13-ENGINEERING-STANDARDS.md (English)
    └── Naming conventions, git rules, testing standards, performance budget

SCOPE-LOCK.md
└── Architecture frozen, backlog process, approval workflow

SPRINT-0-CHECKLIST.md
└── 10-point infrastructure verification (GitHub, React, Express, Firebase, Cloud Run, CI/CD, Anthropic, Health, Docs)

SPRINT-1-CHECKLIST.md
└── 8 features with Code + Docs + Tests requirement (Login, Company, Dashboard, Knowledge Loader, CEO Agent, Content Agent, History, Usage)

DOGFOODING-PLAYBOOK.md
└── 1-2 week real-world testing protocol, measurement framework, decision tree (Go/No-Go)
```

---

## 🏗️ TECH STACK

**Frontend:**
- React 19 + Vite
- TailwindCSS
- React Router
- Zustand (state)
- TanStack Query (data fetching)
- React Hook Form

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- Anthropic SDK
- Zod (validation)
- Winston (logging)

**Database:**
- Firebase Firestore (asia-southeast1)
- Firebase Auth
- Firebase Storage
- Cloud Secret Manager (API keys)

**Deployment:**
- Cloud Run (serverless)
- Firebase Hosting
- GitHub Actions (CI/CD)
- Docker

**AI:**
- Claude Sonnet 4.6 (primary)
- Model Abstraction Layer (switch providers)

---

## 📊 SPRINT TIMELINE

### Sprint 0 (16-19 July, 3-4 days)
**Goal:** Infrastructure ready, boilerplate deployed

Deliverables:
- [ ] GitHub monorepo setup
- [ ] React + Vite running
- [ ] Express API running
- [ ] Firebase Auth working
- [ ] Firestore connected
- [ ] Cloud Run deployed
- [ ] GitHub Actions CI/CD passing
- [ ] Anthropic API integration
- [ ] /health endpoint working
- [ ] README complete

**Success:** All 10 checkpoints ✓

---

### Sprint 1 (20 July - 2 August, 2 weeks)
**Goal:** MVP 1 complete & deployed to production

**8 Features to build:**

1. **Login / Register**
   - Firebase Auth
   - JWT tokens
   - Session management
   - Tests: > 80%

2. **Company Profile**
   - Setup form
   - Logo upload
   - Brand info (tone, colors, CTA)
   - Data persistence
   - Tests: > 80%

3. **Dashboard**
   - Welcome message
   - Quick stats (tokens, cost, posts)
   - Quick action buttons
   - Recent activity
   - Tests: > 80%

4. **Knowledge Loader**
   - Upload Markdown files
   - Cache in memory
   - Agents access knowledge
   - 6 initial knowledge files
   - Tests: > 80%

5. **CEO Agent**
   - Understand user input
   - Route to Knowledge + Content agents
   - Consolidate outputs
   - Log execution
   - Tests: > 80%

6. **Content Agent**
   - Generate captions
   - Suggest CTAs
   - Generate hashtags
   - Use templates + knowledge
   - Tests: > 80%

7. **History & Storage**
   - Save content to Firestore
   - Retrieve past content
   - Export to Markdown
   - No data loss
   - Tests: > 80%

8. **Usage Stats**
   - Track tokens per day
   - Calculate cost
   - Display dashboard
   - Monthly summary
   - Tests: > 80%

**Definition of Done:** Code + Documentation + Tests for each feature

---

### Dogfooding (3-16 August, 1-2 weeks)
**Goal:** Validate MVP 1 hypothesis with real users (KIRA Senang marketing team)

**Week 1:**
- Day 1: Onboarding (2 hours)
- Days 2-4: Light testing (30 mins/day)
- Days 5-7: Stress testing (extended use)
- Debrief: Data analysis

**Week 2:**
- Days 8-10: Bug fixes
- Days 11-14: Measurement + analysis
- Final debrief: Go/No-Go decision

**Success Metrics:**
- Avg time per post: < 2 minutes
- Quality rating: > 4/5
- Usable as-is: > 80%
- Cost per post: < RM 0.10
- Uptime: > 99%
- Critical bugs: 0

---

## 🎯 FEATURES TIMELINE

```
Sprint 1 (2 weeks)
├─ Week 1: Login, Company, Dashboard, Knowledge Loader
└─ Week 2: CEO Agent, Content Agent, History, Usage

Dogfooding (1-2 weeks)
├─ Real usage by KIRA Senang marketing team
├─ Data collection: time, cost, quality, bugs
└─ Decision: Launch or fix

Sprint 2+ (Planned after dogfooding)
├─ Planner Agent (calendar)
├─ Trend Agent (seasonal content)
├─ Analytics Agent (performance)
└─ Other features based on real usage data
```

---

## 📋 SETUP INSTRUCTIONS (FOR NEXT SESSION)

### Prerequisites
- [ ] GitHub account created
- [ ] Private repo `ai-dmos` created
- [ ] Git configured locally
- [ ] Node.js 18+ installed
- [ ] 40+ hours/week available

### Quick Start
```bash
# 1. Clone repo
git clone https://github.com/[your-username]/ai-dmos.git
cd ai-dmos

# 2. Create folder structure
mkdir -p client server shared firebase docs prompts knowledge templates tests deployment .github/workflows

# 3. Copy all docs
cp ~/claude/*.md docs/
cp ~/claude/SCOPE-LOCK.md .
cp ~/claude/SPRINT-*.md .
cp ~/claude/DOGFOODING-*.md .

# 4. First commit
git add .
git commit -m "chore: initialize monorepo with foundation docs"
git push origin main

# 5. Follow SPRINT-0-CHECKLIST.md for infrastructure setup
```

---

## 🔐 IMPORTANT REMINDERS

### Scope Lock
- ✅ **FROZEN:** Architecture, agent list, knowledge base, templates
- ❌ **NOT ALLOWED:** New agents, new features, new knowledge (until MVP 1 done)
- 📋 **BACKLOG:** Ideas captured but not added to roadmap

### Backlog Process
If someone asks for a feature:
1. Write it in BACKLOG.md
2. Do NOT add to Sprint 1
3. Review after dogfooding
4. Prioritize for Sprint 2+ based on real usage

### Definition of Done
Every feature must have:
1. ✅ Code (functional)
2. ✅ Documentation (clear)
3. ✅ Tests (> 80% coverage)

**No shortcuts.** No feature is "done" without all three.

---

## 🚨 CRITICAL PATHS

### If MVP 1 is slower than expected:
1. Check SPRINT-1-CHECKLIST.md
2. Identify which feature is blocking
3. Escalate immediately
4. Adjust scope (remove feature, not quality)

### If bugs found during Sprint 1:
1. Critical bug (data loss, crash) → Fix immediately
2. High bug (UI broken) → Fix within 24 hours
3. Medium bug (slow, awkward) → Fix by end of week
4. Low bug → Log to backlog

### If dogfooding shows MVP 1 is not ready:
1. Do NOT launch
2. Fix issues (Sprint 1.5)
3. Repeat dogfooding
4. Cannot launch until tests pass

---

## 📊 SUCCESS METRICS (END OF DOGFOODING)

**Performance:**
- Time per post: Avg < 2 mins
- P95 response time: < 10s
- Uptime: > 99%

**Quality:**
- Quality rating: > 4/5 average
- Usable as-is: > 80%
- Need edits: < 20%

**Reliability:**
- Critical bugs: 0
- Data loss: 0 incidents
- Duplicate content: 0

**Cost:**
- Cost per post: < RM 0.10
- Monthly budget: < RM 50 (for testing)

**User Satisfaction:**
- Dogfooding team confidence: Go/No-Go vote
- Support requests: < 3 per day
- NPS (if surveyed): > 7/10

---

## 💡 PRINCIPLES TO REMEMBER

### Build → Use → Measure → Improve
Don't plan endlessly. Build fast → use immediately → measure results → improve based on data.

### MVP > Perfection
MVP 1 doesn't need to be perfect. It needs to work and teach us what matters.

### Real data > Assumptions
Sprint 2+ priorities come from dogfooding data, not founder hunches.

### Code + Docs + Tests
Every feature is only complete when all three exist. This saves time later.

### Scope = Power
Saying NO to features (and keeping them in backlog) lets you say YES to launching on time.

---

## 📞 NEXT STEPS

1. **Today/Tomorrow:**
   - [ ] Create GitHub account + repo
   - [ ] Configure git locally
   - [ ] Verify Node.js installed
   - [ ] Clone repo
   - [ ] Copy all docs
   - [ ] First commit

2. **Sprint 0 (3-4 days):**
   - [ ] Follow SPRINT-0-CHECKLIST.md
   - [ ] 10 checkpoints = infrastructure ready

3. **Sprint 1 (2 weeks):**
   - [ ] Follow SPRINT-1-CHECKLIST.md
   - [ ] 8 features = MVP 1 complete
   - [ ] Deploy to production

4. **Dogfooding (1-2 weeks):**
   - [ ] Follow DOGFOODING-PLAYBOOK.md
   - [ ] KIRA Senang team uses platform
   - [ ] Collect data + decide next steps

---

## 📁 FILE LOCATIONS

All files ready in `/home/claude/`:

```
/home/claude/
├── 01-PRODUCT-REQUIREMENTS.md
├── 02-SYSTEM-ARCHITECTURE.md
├── 04-FIRESTORE-SCHEMA.md
├── 13-ENGINEERING-STANDARDS.md
├── SCOPE-LOCK.md
├── SPRINT-0-CHECKLIST.md
├── SPRINT-1-CHECKLIST.md
├── DOGFOODING-PLAYBOOK.md
└── AI-DMOS-PROJECT-SUMMARY.md (this file)
```

**Copy to GitHub repo in `/docs` and root folders.**

---

## 🎓 LEARNING RESOURCES

**If you need reference during development:**

- System Architecture: `02-SYSTEM-ARCHITECTURE.md`
- Database queries: `04-FIRESTORE-SCHEMA.md`
- Code standards: `13-ENGINEERING-STANDARDS.md`
- Infrastructure setup: `SPRINT-0-CHECKLIST.md`
- Feature specs: `SPRINT-1-CHECKLIST.md`
- Testing protocol: `DOGFOODING-PLAYBOOK.md`

---

## ✍️ AUTHOR NOTES

**Built during:** 15 July 2026 planning session with Claude

**Approach:** Documentation-first, scope-locked, MVP-focused

**Philosophy:** Build small, measure real usage, improve based on data

**Key insight:** The difference between products that launch and products that plan forever is **discipline about scope and commitment to dogfooding with real users.**

---

**Status:** READY TO BUILD 🚀

**Next:** Start Sprint 0 infrastructure setup.

---

*Last Updated: 15 July 2026*  
*Next Review: End of Sprint 0 (19 July 2026)*
