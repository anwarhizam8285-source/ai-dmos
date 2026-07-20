# SCOPE-LOCK v1.0

**Effective Date:** 15 July 2026  
**Status:** LOCKED (No changes without explicit written approval)  
**Rationale:** Prevent scope creep, focus on MVP 1 delivery  

---

## 1. ARCHITECTURE FREEZE v1.0

### What's Locked

**AI Agents (MVP 1):**
```
✅ ACTIVE
├─ CEO Agent (orchestrator)
├─ Knowledge Agent (context loader)
└─ Content Agent (caption generation)

⏸️ REGISTERED (Not implemented yet)
├─ Marketing Agent (Sprint 5)
├─ Planner Agent (Sprint 2)
├─ Analytics Agent (Sprint 3)
├─ Trend Agent (Sprint 2)
├─ Comment Agent (Sprint 5)
├─ Messenger Agent (Sprint 5)
├─ Automation Agent (Sprint 4)
└─ Image Agent (Sprint 6)
```

**No new agents** beyond these 10 until MVP 1 (Sprint 1) is live and validated.

**Tech Stack (Locked):**
- Frontend: React 19 + Vite + Tailwind
- Backend: Node.js + Express
- Database: Firebase Firestore (asia-southeast1)
- Auth: Firebase Auth
- Deployment: Cloud Run
- CI/CD: GitHub Actions
- AI: Claude Sonnet 4.6 (primary)
- Monitoring: Cloud Logging + Sentry

**No changes** to tech stack without 2-week evaluation period and documented business case.

---

## 2. SCOPE BOUNDARIES (MVP 1)

### What's IN

```
✅ Login / Register (Firebase Auth)
✅ Company Profile (setup + edit)
✅ Dashboard (welcome, stats, quick access)
✅ Knowledge Loader (Markdown → Firestore)
✅ CEO Agent (task planning only)
✅ Content Agent (caption generation)
✅ Content Output (caption, CTA, hashtags)
✅ History Panel (save & retrieve past outputs)
✅ Usage Stats (tokens, cost, agent calls)
✅ Export (Markdown, future: PDF)
✅ Error Handling (user-friendly messages)
```

### What's OUT (Explicitly Deferred)

```
❌ Calendar (→ Sprint 2)
❌ Analytics Dashboard (→ Sprint 3)
❌ Facebook Insights Import (→ Sprint 3)
❌ Auto-Publishing (→ Sprint 4)
❌ Meta Graph API Integration (→ Sprint 4)
❌ Marketing Agent (→ Sprint 5)
❌ Comment Management (→ Sprint 5)
❌ Messenger/Inbox (→ Sprint 5)
❌ Image Generation (→ Sprint 6)
❌ Team Collaboration (→ Future)
❌ Multi-language UI (→ Future)
❌ Advanced Analytics (→ Future)
❌ Billing/Subscription (→ Future)
```

### The Rule

**If a feature doesn't answer this question:**
> "Can an SME owner generate quality marketing content in < 2 minutes?"

**Then it's OUT of MVP 1.**

Everything else goes to **BACKLOG**.

---

## 3. KNOWLEDGE BASE SCOPE (Minimal)

**Total:** 6 files (not 100s)

```
knowledge/
├── company/
│   ├── brand.md                    (Logo, colors, tone, voice, CTA)
│   ├── products.md                 (Product features, benefits, pricing)
│   └── faq.md                      (Common Q&A)
├── marketing/
│   ├── copywriting.md              (Writing principles, hooks)
│   └── cta.md                      (CTA examples, psychology)
└── malaysia/
    ├── holidays.md                 (Hari Raya, CNY, Deepavali, etc)
    └── sme.md                      (SME context, local business challenges)
```

**Restrictions:**
- No company secrets or confidential data
- Max 5KB per file
- Plain Markdown only (no images, PDFs)
- Auto-loaded into Knowledge Agent context

**Growth Rule:**
- Knowledge expands only based on **actual usage** (not assumptions)
- Sprint 2+ decisions on new knowledge based on Dogfooding feedback
- Quarterly review of knowledge base usefulness

---

## 4. TEMPLATE SCOPE (Minimal)

**Total:** 5-6 templates (not dozens)

```
templates/
├── caption/
│   ├── tips.md                     (Educational tips format)
│   ├── promotion.md                (Promo/sales format)
│   └── announcement.md             (News/update format)
├── carousel/
│   └── educational.md              (Multi-slide educational content)
└── blog/
    └── how-to.md                   (How-to article format)
```

**Restrictions:**
- Max 10 templates in MVP 1
- Simple variable substitution only ({{company}}, {{tone}}, etc)
- No complex conditional logic
- Markdown format

**Growth Rule:**
- New templates only after Dogfooding shows demand
- Template library grows sprint-by-sprint, not upfront

---

## 5. AGENT CAPABILITY SCOPE

### CEO Agent (Sprint 1)
```
✅ Understand user input
✅ Decide which agent(s) to call
✅ Route to Content + Knowledge agents
✅ Consolidate outputs
✅ Return final response

❌ Generate content directly (delegate to Content Agent)
❌ Make decisions without Knowledge Agent input
❌ Implement feature flags (config-based, not agent logic)
```

### Knowledge Agent (Sprint 1)
```
✅ Load Markdown files from /knowledge folder
✅ Inject context into prompts
✅ Query specific documents (e.g., "Give me company info")
✅ Cache knowledge in memory (Phase 1)

❌ Perform semantic search (→ MVP 2: Embeddings)
❌ Vector database queries (→ MVP 4)
❌ Real-time web search (→ Future)
❌ Multi-language retrieval (→ Future)
```

### Content Agent (Sprint 1)
```
✅ Generate captions (using templates)
✅ Suggest CTAs (from CTA library)
✅ Generate hashtags (from hashtag templates)
✅ Create content variants (A/B options)
✅ Use Knowledge Agent for context

❌ Generate images (→ MVP 6)
❌ Publish directly to Facebook (→ MVP 4)
❌ Analyze past performance (→ MVP 3)
❌ Suggest optimal posting time (→ MVP 3)
```

---

## 6. BACKLOG PROCESS

### Preventing Scope Creep

**When someone suggests a new feature:**

1. **Document it** in `BACKLOG.md`
   ```markdown
   ## [Feature Name]
   
   **Requested by:** [name]
   **Date:** [date]
   **Why:** [business case]
   **Estimated effort:** [small/medium/large]
   **Priority:** [must/should/nice-to-have]
   **Target sprint:** [if known]
   ```

2. **Do NOT add to active roadmap**
   - MVP 1 scope is locked
   - Sprints 2-5 decided after Dogfooding

3. **Evaluate after Dogfooding (Week 2, Sprint 1)**
   - Is this critical for MVP success?
   - Does real usage demand this?
   - If yes → add to Sprint 2+
   - If no → defer to later

### Backlog Template

```
BACKLOG ITEMS (Waiting for Dogfooding Validation)

1. [ ] Instagram support
   Requested: Day 1, Priority: Nice-to-have
   Reason: Most SMEs use Insta too
   Status: Deferred, evaluate Sprint 2

2. [ ] Email campaign generator
   Requested: Day 2, Priority: Should-have
   Reason: SMEs need email list contact
   Status: Deferred, evaluate Sprint 3

3. [ ] Inventory sync from Shopee
   Requested: Day 3, Priority: Nice-to-have
   Reason: Auto-update product info
   Status: Deferred, evaluate Sprint 4
```

---

## 7. MVP 1 DEFINITION (ONE QUESTION)

**Success Criterion:**
> "Can a Malaysian SME owner generate quality marketing content in **less than 2 minutes** without technical knowledge?"

**How We Measure:**

1. **Time Test**
   - User logs in
   - Sets up company profile (1st time only, ~2 mins)
   - Generates first caption (repeat: < 1 minute)
   - **Pass if:** Average < 2 minutes per content piece

2. **Quality Test**
   - KIRA Senang marketing team rates output 8/10 or higher
   - Content is usable without major editing
   - Tone is consistent with brand
   - **Pass if:** 80%+ outputs usable as-is

3. **Usability Test**
   - No technical documentation needed
   - SME can figure out features by exploring
   - Error messages are clear
   - **Pass if:** First-time user success rate > 90%

4. **Reliability Test**
   - No data loss (all content saved)
   - No duplicate content
   - Export works without errors
   - **Pass if:** Zero critical bugs during 1-week Dogfooding

**If all 4 tests pass → MVP 1 success → Move to Dogfooding**

---

## 8. APPROVAL PROCESS FOR CHANGES

### To change Sprint 1 scope:

1. **Document the change request**
   ```
   Change request: [what]
   Justification: [why]
   Impact on timeline: [days delayed]
   Impact on Sprint 2: [what moves]
   Business value: [why worth the delay]
   ```

2. **Requires approval from:**
   - Technical Lead (feasibility)
   - Product Owner (business value)
   - Timeline must show trade-off explicitly

3. **If approved:**
   - Add to Sprint 1 checklist
   - Remove other feature of equal effort
   - Update CHANGELOG

### Example rejection:

```
Change request: Add Instagram support to MVP 1
Justification: "It's easy, just a different platform"
Response: 
  - Scope locked for MVP 1 (Facebook only)
  - Platform support is Sprint 4
  - Instagram added to backlog
  - Revisit after Dogfooding if priority changes
Status: REJECTED (per Architecture Freeze v1.0)
```

---

## 9. WHAT STAYS LOCKED UNTIL MVP 1 DONE

```
✅ LOCKED (No changes)
├─ Architecture (React + Express + Firestore)
├─ 3 active agents (CEO, Knowledge, Content)
├─ 6 knowledge files (company/, marketing/, malaysia/)
├─ 5-6 templates (caption/, carousel/, blog/)
├─ Sprint 0 checklist (10 items)
└─ Sprint 1 deliverables (login, profile, content generation)

⏸️ FLEXIBLE (After Dogfooding)
├─ Sprints 2-5 priorities (based on real usage)
├─ Knowledge expansion (when needed, not assumed)
├─ Template additions (when demanded, not preemptive)
└─ New agent enablement (when next sprint starts)
```

---

## 10. ENFORCEMENT

**This scope lock is enforced by:**

1. **Pull Request rules:**
   - Code outside Sprint 1 scope → automatically rejected
   - Feature flag required for out-of-scope features
   - Tests must verify feature boundary

2. **Daily standup:**
   - "Are we still on scope?"
   - Blockers escalated immediately
   - Scope creep mentioned = discussed in team

3. **Definition of Done:**
   - Feature = Code + Docs + Tests
   - No partial features considered "done"
   - Must pass checklist before merge

---

## 11. DECISION AUTHORITY

| Decision | Authority | Timeline |
|----------|-----------|----------|
| Sprint 1 scope change | Founder + Tech Lead | Same day decision |
| New agent in Registry | Founder | After Dogfooding review |
| Knowledge additions | Product Owner | After usage data |
| Template additions | Product Owner | After feedback |
| Tech stack change | Founder + Architecture | 2-week evaluation |
| Backlog prioritization | Founder | Weekly review |

---

## 12. POST-MVP 1 REVIEW (Week 2, Sprint 1)

**Timeline:** Day 10-14 of Sprint 1

**Decision Points:**
1. Is MVP 1 on schedule? (Yes/No)
2. Will MVP 1 meet success metrics? (Yes/No/Unclear)
3. Is Dogfooding ready to start? (Yes/No)
4. What should Sprint 2 prioritize? (based on usage data)

**If all Yes:**
- ✅ Proceed to 1-2 week Dogfooding
- ✅ Collect feedback
- ✅ Plan Sprint 2 based on data

**If No on any:**
- 🔄 Debug, fix, extend Sprint 1
- 🔄 Delay Dogfooding if needed
- 🔄 Adjust scope (only if critical blocker)

---

**Document Status:** LOCKED v1.0  
**Last Updated:** 15 July 2026  
**Next Review:** Day 10 of Sprint 1 (end of week 1)  

**Signature (metaphorical):**  
"We will not add features until MVP 1 proves the hypothesis. Build → Use → Measure → Improve."
