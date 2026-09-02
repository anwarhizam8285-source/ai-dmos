# SPRINT 5 COMPLETION — ANALYTICS & PUBLIC LAUNCH PREP

**Duration:** 2 weeks (16–27 September 2026), executed 2026-09-02/03
**Goal:** Analytics dashboard with campaign ROI + billing snapshot, email
automation infrastructure, customer onboarding flow, public marketing
website, and an honest launch-readiness checklist.
**Foundation:** Sprints 1–4 complete ✅

**This sprint is scoped down from the brief in several deliberate,
documented ways** - see "Deliberate deviations" below and `LAUNCH_CHECKLIST.md`.
The brief's title ("Public Launch") oversold what a single sprint of code
changes can responsibly deliver: real payment processing, real outbound
marketing email, and an actual public launch are business/legal decisions
requiring the account owner, not something to execute autonomously just
because the sprint brief asked for it.

---

## What was built

**Backend**
- `server/src/utils/analyticsMath.js` — pure aggregation math
  (`computeCampaignTotals`, `rollUpTotals` with **spend-weighted** ROAS,
  `buildDailySeries`, `topPerformers`/`bottomPerformers`, `planInfo`) -
  dependency-free, same reasoning as Sprint 4's `performanceMetrics.js`.
- `server/src/services/analyticsAggregationService.js` — Firestore
  orchestration: `calculateBusinessMetrics()` (account-wide campaign ROI)
  and `calculateBillingSnapshot()` (plan + real this-month usage - no
  fabricated fields).
- `server/src/utils/csv.js` — minimal CSV serializer for the export route.
- `server/src/routes/analytics.js` — added `GET /overview`, `GET /billing`,
  `GET /export` (csv/json). Existing `/usage` and `/summary` (AI cost
  tracking) untouched.
- `server/src/services/emailService.js` — three pure, HTML-escaped template
  renderers + send wrappers over nodemailer/Gmail SMTP, no-op safely without
  credentials. Wired to fire once at company creation (`company.js`); the
  recurring daily/weekly digest jobs exist as callable functions but are
  **not** scheduled - see `EMAIL_AUTOMATION.md`.
- `server/tests/analyticsMath.test.js` (12 tests), `csv.test.js` (4 tests),
  `emailService.test.js` (9 tests) — all passing.

**Frontend**
- `client/src/components/analytics/CampaignPerformance.jsx` — KPI cards,
  a hand-rolled bar chart (daily spend) and a small inline-SVG line chart
  (ROAS trend, no charting library), top/bottom performer lists, CSV export
  button. Added to the existing `Analytics.jsx` alongside the pre-existing
  usage-tracking section (not a duplicate tab).
- `client/src/components/analytics/BillingSnapshot.jsx` — plan, list price,
  this-month usage, and an explicit "not an invoice" note; disabled
  "Upgrade Plan (coming soon)" button.
- `client/src/components/onboarding/OnboardingFlow.jsx` — 5-step guided
  walkthrough shown once after company setup (gated by a localStorage flag),
  with a "Take me there →" action per step that jumps straight to the
  relevant Dashboard tab rather than re-implementing those features inline.
- `client/src/App.jsx` / `Dashboard.jsx` — wired the onboarding flow in
  between company setup and the dashboard; `Dashboard` now accepts an
  `initialTab` prop so onboarding can deep-link into it.

**Marketing website** (`website/`, static HTML/CSS, no build step)
- `index.html`, `features.html`, `pricing.html`, `faq.html`, `css/main.css`.
- No fabricated testimonials (see deviations below). Pricing matches the
  backend's `PRICING_TIERS`. FAQ is honest about manual billing and paused
  campaign launches.
- `blog.html` was in the brief's file list but not in the sprint's success
  criteria (only site/pricing/FAQ are) - deferred.

**Docs**
- `server/docs/ANALYTICS.md`, `BILLING.md`, `EMAIL_AUTOMATION.md`.
- `LAUNCH_CHECKLIST.md` at the repo root — an honestly-filled-in checklist
  (not a blank template), reflecting real current status per item.

## Deliberate deviations from the original sprint brief

- **No payment processor integrated.** The brief's `calculateBillingMetrics()`
  invented fields (`company.tokensUsed`, `company.paymentMethod`,
  `company.subscriptionStatus`, a fabricated per-campaign overage charge)
  that don't exist anywhere in this codebase. Building a "billing" feature
  that fabricates charge amounts would be actively misleading. The real
  billing snapshot only reports numbers that are genuinely tracked
  elsewhere (plan, real usage). See `BILLING.md` for what a real
  integration would need and why that's an account-owner decision.
- **No recurring email cron job.** The brief's daily-8am recommendation
  digest and weekly report emails exist as ready-to-call functions but
  aren't scheduled. Auto-arming a recurring job that emails every company
  in the database indefinitely is a standing-automation decision the
  account owner should make explicitly (cadence, content, opt-out), not
  something to wire up just because credentials might someday exist. Also,
  no Gmail credentials are configured, so nothing would send yet regardless.
- **No live outbound email was sent from this session.** Sending real email
  requires explicit permission per this assistant's operating rules; testing
  used unit tests against pure template-rendering functions instead of
  calling `sendMail` against a real inbox.
- **No fabricated marketing testimonials.** The brief's landing-page sample
  copy included invented customer quotes attributed to named people
  ("Ahmad, CEO at TechStartup"). Presenting fake testimonials as genuine
  customer feedback is deceptive marketing content regardless of how low-risk
  the audience is; the built site has zero testimonials instead of fake ones.
- **No heavy charting library.** The brief's sample used `recharts`. The
  pre-existing Sprint "feature-8" Usage Analytics section already
  established a hand-rolled, dependency-free chart convention (CSS bar
  chart) in this codebase - Sprint 5 extended that same convention (bar
  chart + a small inline-SVG line chart) rather than introducing a new
  ~500KB dependency for one dashboard.
- **PDF export not implemented.** Would need a rendering dependency
  (`pdfkit`/`puppeteer`) not currently in this codebase. CSV and JSON export
  are implemented and tested; PDF is documented as deferred rather than
  half-built.
- **The "public launch" itself did not happen.** Nothing was deployed
  publicly, no domain was registered/pointed anywhere, no real customers
  were emailed or charged. `LAUNCH_CHECKLIST.md` documents, honestly, what's
  actually ready vs. not - most business/legal/marketing infrastructure a
  real launch needs isn't built, and several remaining items are explicitly
  outside what this assistant should do autonomously (see that file's final
  section).

## Verification performed

- `npm test` (server): 81/81 passing (25 new Sprint 5 tests: 12 analytics
  math, 4 CSV, 9 email templates + 56 pre-existing).
- `eslint` (client): all new/changed files (`CampaignPerformance.jsx`,
  `BillingSnapshot.jsx`, `Analytics.jsx`, `OnboardingFlow.jsx`, `App.jsx`,
  `Dashboard.jsx`) are clean; same 4 pre-existing errors elsewhere,
  untouched.
- **Live end-to-end smoke test** against the running dev servers: registered
  a throwaway user/company (exercising the new welcome-email hook - safely
  no-opped, no crash), seeded 3 synthetic campaigns (2 with performance data,
  1 unlaunched draft) directly in Firestore, then verified `GET /overview`
  (correct spend-weighted ROAS: 992/410 = 2.42x; correct top/bottom
  ranking; draft correctly excluded from rankings but present in the
  campaign list), `GET /billing` (real plan + usage numbers), `GET /export`
  for both `csv` (correct header/rows) and an invalid format (400 with a
  clear message). All test data deleted afterward.
- **Live browser test** on the real "Kira Senang Solution Enterprise"
  account: seeded 2 synthetic campaigns with performance history, reloaded
  the app to see the onboarding flow trigger naturally (first load without
  the new `onboardingComplete` flag), stepped through it, used "Take me
  there →" to confirm it correctly deep-links into the Knowledge tab, then
  navigated to Analytics and confirmed the Campaign Performance section
  (KPI cards, bar chart, SVG line chart, correctly-ranked top/bottom
  performer cards) and Billing Snapshot section (plan, price, real usage,
  disabled upgrade button) all render correctly with real Firestore data.
  Seeded test campaigns deleted afterward; the account's real data and its
  now-completed onboarding state were left as the natural end state (not
  "cleaned up" - that's the correct final state for a real user).
- Verified the local static website (`website/*.html`) renders correctly by
  serving it locally and checking `index.html` and `pricing.html` in-browser.

## Known limitations / what's NOT done

- Everything under "What would actually need to happen before this launches"
  in `LAUNCH_CHECKLIST.md` - payment processing, legal docs, real Meta OAuth
  verification, deployment/CI verification, email automation activation,
  end-user documentation.
- Mobile/cross-browser testing was not performed (Chrome-only, desktop
  viewport, this session).
- `winston` is a declared dependency that's never actually used - all
  logging is still `console.log`/`console.error`. Flagged, not fixed (out
  of this sprint's scope; a structured-logging pass would touch every route
  file).
- No rate limiting exists on any route.

Ready for whatever comes after Sprint 5 - but that "whatever" should start
with the account owner's decisions on `LAUNCH_CHECKLIST.md`'s open items,
not another autonomous sprint.
