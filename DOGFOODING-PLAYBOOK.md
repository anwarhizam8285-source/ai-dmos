# DOGFOODING PLAYBOOK

**Timeline:** 1-2 weeks after Sprint 1 deployment (3-16 August 2026)  
**Participants:** KIRA Senang marketing team (primary users)  
**Goal:** Validate MVP 1 hypothesis + collect data for Sprint 2 planning  

---

## DOGFOODING HYPOTHESIS

**We believe:**
> "A Malaysian SME can generate quality marketing content in less than 2 minutes using AI-DMOS, without technical knowledge."

**We will know we're right when:**
1. ✅ Time test: Average 90 seconds per content piece
2. ✅ Quality test: 80%+ output usable without editing
3. ✅ Reliability test: Zero critical bugs
4. ✅ Cost test: Cost stays within forecast (< RM 0.10 per content)

---

## WEEK 1: INTENSIVE TESTING (Days 1-7)

### Day 1: Onboarding (2 hours)

**What the team does:**

```
1. Install app on desktop + mobile
   - Visit app.aidmos.my
   - Login with test account
   - Complete company profile (Kira Senang info)

2. 15-minute tutorial
   - Walk through dashboard
   - Generate first caption together
   - Show export & history features

3. Generate 3 test posts
   - Promo content
   - Tips/educational
   - Announcement
   - Use actual content, not test data

4. Feedback form (Google Form)
   - "Was setup easy?" (1-5)
   - "Any issues?" (open)
   - "What's missing?" (open)
```

**Success Criteria:**
- [ ] All team members logged in
- [ ] Company profile filled
- [ ] First 3 posts generated
- [ ] Feedback form filled

**Watch for:**
- Any login errors
- Time to first content generation
- Confusion with UI/flows

---

### Days 2-4: Light Testing (30 mins per day)

**What the team does:**

```
Each team member generates 1-2 content pieces daily using actual briefs:

Day 2: Monday
- 2 promotional captions
- 1 product tip
- Post 1 to Facebook (if they want)

Day 3: Tuesday
- 1 announcement (weekly update)
- 2 promotional variations
- Save all to history

Day 4: Wednesday
- 1 blog post intro
- 2 carousel captions
- Export to Markdown
```

**What we measure:**

```
For each piece of content:
├─ Input: [brief from team]
├─ Output: [generated caption]
├─ Metrics:
│   ├─ Time to generate (seconds)
│   ├─ Tokens used
│   ├─ Cost
│   ├─ Quality rating (1-5: unusable/needs edits/good/very good/perfect)
│   └─ Edit count (0-2: no edits/minor/major)
└─ Usability (1-5: confusing/okay/good/very good/excellent)
```

**Data collection:**

```
Create spreadsheet:

Date | Brief | Time (s) | Tokens | Cost | Quality | Edits | Usable | Notes
-----|-------|---------|--------|------|---------|-------|--------|--------
8/2  | Promo | 8.2     | 1200   | 0.06 | 4       | 1     | Yes    | "Great, just reworded"
8/2  | Tips  | 7.5     | 1100   | 0.055| 5       | 0     | Yes    | "Perfect, posted as-is"
...
```

**Daily standup (10 mins):**
- "How's it working?"
- "Any bugs?"
- "Any ideas for next sprint?"

---

### Days 5-7: Stress Testing (Extended use)

**What the team does:**

```
Generate content for full week ahead (7 days):
- Mon: 2 posts
- Tue: 2 posts
- Wed: 2 posts
- Thu: 1 post
- Fri: 2 posts
- Sat: 1 post
- Sun: 1 post
Total: 11 posts in 3 days

Track:
- Total time spent
- Total cost
- Any API timeouts
- Any data loss
- Any duplicate content
- Quality of bulk output
```

**Watch for:**

```
✓ Does rate limiting work?
✓ Does cost tracking work?
✓ Is there data loss?
✓ Are there duplicates?
✓ Does performance degrade?
✓ Can knowledge handle high load?
```

### End of Week 1: Debrief (1 hour)

**Team meeting:**

```
1. Share experiences (30 mins)
   - What worked well?
   - What didn't work?
   - Frustrations?
   - Surprises?

2. Data review (20 mins)
   - Average time per post
   - Average quality rating
   - Cost per post
   - Bugs encountered

3. Prioritization (10 mins)
   - What should we fix?
   - What should we add?
   - What's not important?
```

---

## WEEK 2: LIGHT TESTING + BUG FIXING

### Days 8-10: Bug Fixes

**What happens:**

```
If critical bugs found:
- Hotfix deployed immediately (same day)
- Test fix (team confirms)
- Update dogfooding notes

If minor bugs found:
- Log in backlog
- Prioritize for Sprint 2
- Continue using (work around if needed)
```

**Types of bugs to watch for:**

```
CRITICAL (fix immediately):
├─ Data loss (content disappears)
├─ Duplicate content (same post twice)
├─ API crashes (500 errors)
└─ Security issue (data accessible to others)

HIGH (fix by end of week):
├─ UI crashes (React error)
├─ Export fails
├─ Login fails intermittently
└─ Cost calculation wrong

MEDIUM (defer to Sprint 2):
├─ Slow API response (>10s)
├─ UI awkward
├─ Prompt could be better
└─ Knowledge missing

LOW (backlog):
├─ Minor UI bug
├─ Wording issue
├─ Feature request
└─ Nice-to-have
```

### Days 11-14: Measurement + Analysis

**What we measure:**

```
PERFORMANCE:
├─ Average time per post: [time] seconds
├─ P95 time (worst case): [time] seconds
├─ Total posts generated: [count]
├─ Total tokens used: [count]
├─ Total cost: RM [amount]
└─ Cost per post: RM [amount]

RELIABILITY:
├─ Uptime: [%] (target: 99.5%)
├─ Critical bugs: [count]
├─ Data loss incidents: [count]
├─ Duplicate content: [count]
└─ Failed API calls: [count]

QUALITY:
├─ Average quality rating: [1-5]
├─ % of posts usable as-is: [%]
├─ % that needed minor edits: [%]
├─ % that needed major edits: [%]
└─ % that were rejected: [%]

USABILITY:
├─ Average UX rating: [1-5]
├─ Time to learn: [minutes]
├─ Support requests: [count]
├─ Confusion points: [list]
└─ Feature requests: [count]
```

**Analysis spreadsheet:**

```
Metric                          Target    Actual   Pass?
────────────────────────────────────────────────────────
Avg time per post               < 2 min   [time]   ✓/✗
P95 response time               < 10s     [time]   ✓/✗
Uptime                          > 99%     [%]      ✓/✗
Critical bugs                   0         [count]  ✓/✗
Quality rating (avg)            > 4/5     [rating] ✓/✗
Usable as-is                    > 80%     [%]      ✓/✗
Cost per post                   < 0.10    RM[amt]  ✓/✗
```

---

## END OF WEEK 2: DECISION POINT

### Final Debrief Meeting (2 hours)

**Attendees:** Founder, Marketing Manager, Tech Lead, Product Owner

**Agenda:**

```
1. MVP 1 SUCCESS VALIDATION (30 mins)
   Question: "Did we prove the hypothesis?"
   
   ✓ If YES: All tests passed, ready for market
   ✗ If NO: Which metric failed? Why?
   
2. CRITICAL ISSUES (20 mins)
   - Any showstoppers?
   - Any data loss?
   - Any security issues?
   
   If any: Fix immediately, delay launch if needed
   
3. PROMPT/KNOWLEDGE ISSUES (20 mins)
   - Did output quality meet expectations?
   - Were there recurring issues?
   - What knowledge is missing?
   
4. SPRINT 2 PRIORITIZATION (30 mins)
   Based on actual usage data:
   
   HIGH PRIORITY (user demand):
   - Calendar (for scheduling)
   - Analytics (for performance)
   - More agents (for variety)
   
   MEDIUM PRIORITY (nice-to-have):
   - Better templates
   - Multi-language
   - Team collaboration
   
   LOW PRIORITY (defer):
   - Advanced features
   - Integrations
   - Custom branding
   
5. GO/NO-GO DECISION (10 mins)
   - Is MVP 1 ready for customers?
   - Or do we need another week?
   - What's the launch timeline?
```

---

## DECISION FRAMEWORK

### ✅ MVP 1 PASSES (Launch to customers)

**Conditions:**
```
✓ Time test: Avg < 2 minutes per post
✓ Quality test: > 80% usable as-is
✓ Reliability test: Zero critical bugs, > 99% uptime
✓ Cost test: < RM 0.10 per post
✓ Team confidence: Founder + Manager say "YES"
```

**Next steps:**
1. Fix any high-priority issues
2. Launch to limited beta (10-20 customers)
3. Gather paid feedback
4. Plan Sprint 2 with real customer data

---

### ⚠️ MVP 1 PASSES WITH RESERVATIONS (Launch but monitor)

**Conditions:**
```
✓ Most tests pass
⚠️ Some metrics slightly off (e.g., 75% usable vs 80%)
⚠️ No critical bugs, but several high-priority
✗ Team has concerns but not showstoppers
```

**Next steps:**
1. Fix high-priority issues by end of week
2. Launch to beta with heavy monitoring
3. Daily metrics review
4. Ready to hotfix if needed
5. Decide on Sprint 2 after data stabilizes

---

### ❌ MVP 1 FAILS (Go back to development)

**Conditions:**
```
✗ Time test: Still > 5 minutes per post
✗ Quality test: Only 50% usable (needs heavy editing)
✗ Reliability test: Crashes, data loss, or > 10% errors
✗ Cost test: > RM 0.50 per post (too expensive)
✗ Prompts: Consistently bad output
✗ Team lacks confidence
```

**Next steps:**
1. Identify root causes
2. Plan fixes (Sprint 1.5)
3. Repeat dogfooding after fixes
4. Cannot launch until tests pass

---

## FEEDBACK COLLECTION TEMPLATE

**Daily Feedback Form (Google Form):**

```
1. Today's usage:
   [ ] I generated content using AI-DMOS
   [ ] I just observed
   
2. Time to generate first post: __ minutes
   
3. Number of posts generated today: __ posts
   
4. Quality of today's output (1-5):
   1 = Unusable
   2 = Needs major editing
   3 = Needs minor editing
   4 = Good, minor tweaks
   5 = Perfect, use as-is
   
5. Any bugs today?
   [ ] Yes → describe:
   [ ] No
   
6. What's frustrating?
   [Open text]
   
7. What should we add?
   [Open text]
   
8. Overall satisfaction (1-5):
   [1 = terrible, 5 = excellent]
```

**Weekly 1-on-1 (15 mins each):**

```
1. What went well this week?
2. What didn't go well?
3. Would you recommend this to other SMEs?
4. What's the #1 thing we should fix?
5. What's the #1 thing we should add?
```

---

## KNOWLEDGE/PROMPT IMPROVEMENT DURING DOGFOODING

**If output quality is low:**

```
Issue: "Generated captions don't sound like KIRA Senang"
→ Action: Review content-agent.md prompt
  - Adjust tone instructions
  - Add brand voice examples
  - Redeploy (same day)

Issue: "Hashtags not relevant to our audience"
→ Action: Update /knowledge/company/brand.md
  - Add more context
  - Provide hashtag examples
  - Reload knowledge

Issue: "Missing knowledge about X"
→ Action: Create new knowledge file
  - knowledge/marketing/x.md
  - Upload via Knowledge Loader
  - Agents use immediately
```

**Example flow:**

```
Day 1: "Captions don't sound right"
  ↓
Day 2: Analyze 10 examples, identify issue
  ↓
Day 3: Update prompt/knowledge
  ↓
Day 4: Regenerate 5 examples with new version
  ↓
Day 5: Team feedback: "Better! 80% improvement"
```

---

## METRICS DASHBOARD (OPTIONAL)

**Real-time monitoring during dogfooding:**

```
Cloud Monitoring dashboard shows:

Top row:
├─ Total posts generated (running counter)
├─ Average time per post
├─ Cost today (RM)
└─ Uptime (%)

Middle:
├─ Token usage trend (chart)
├─ Cost per post (chart)
├─ Quality ratings (chart)
└─ Error rate (%)

Bottom:
├─ API response time
├─ Firestore read latency
├─ Claude API latency
└─ CPU/Memory usage
```

---

## RISK MITIGATION

**If MVP 1 is slow:**

```
Problem: Posts taking > 5 mins to generate
Cause: Claude API latency or prompt too complex
Quick fix:
- Reduce max_tokens in prompt
- Simplify template
- Add caching for knowledge
- Test with shorter briefs
```

**If MVP 1 has bugs:**

```
Problem: Data loss (content disappears)
Cause: Firestore write failure or race condition
Quick fix:
- Check Firestore logs
- Enable transaction writes
- Add retry logic
- Hotdeploy same day
```

**If cost is too high:**

```
Problem: Generating 10 posts costs > RM 1.00
Cause: Prompt too verbose or inefficient
Quick fix:
- Reduce context size
- Use cached results
- Switch to Haiku for simple tasks
- Adjust temperature
```

---

## DOCUMENTATION DURING DOGFOODING

**Keep these docs updated in real-time:**

```
SPRINT-1-VALIDATION.md
├─ Daily summary (2 paragraphs)
├─ Metrics snapshot
├─ Issues found
├─ Fixes applied
└─ Next day plan

ISSUES-LOG.md
├─ Each issue logged
├─ Severity level
├─ Status (open/fixed/deferred)
└─ Owner

PROMPTS-CHANGELOG.md
├─ Each prompt change logged
├─ Date + who changed it
├─ Why (problem it solved)
└─ Impact (before/after)
```

---

## LAUNCH READINESS CHECKLIST

**Before going to market, verify:**

```
✓ MVP 1 passed all dogfooding tests
✓ No critical bugs in 1 week
✓ Quality > 80% usable as-is
✓ Cost < RM 0.10 per post
✓ Performance: < 2 mins per post
✓ Team trained and confident
✓ Documentation complete
✓ Monitoring/alerting ready
✓ Onboarding process tested
✓ Support process defined
✓ Pricing decided (for future)
✓ Terms of service updated (for future)
```

**If all checked:**
→ **READY TO LAUNCH**

---

## SUCCESS CELEBRATION

**When MVP 1 is validated:**

```
🎉 Celebrate! You've:

✅ Built an AI-powered marketing platform
✅ Deployed to production
✅ Validated with real users (KIRA Senang)
✅ Collected real feedback
✅ Ready for customers

Next: Iterate on Sprint 2 based on actual data, not assumptions.
```

---

**Dogfooding Duration:** 1-2 weeks  
**Decision Point:** End of Week 2  
**Next Phase:** Beta launch OR Sprint 1.5 fixes (depending on results)  

**Remember:** The goal isn't perfection. The goal is learning. Every bug, every complaint, every suggestion is data that will make Sprint 2 better.

**GO DOGFOOD! 🚀**
