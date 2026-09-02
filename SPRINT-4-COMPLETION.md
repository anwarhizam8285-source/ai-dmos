# SPRINT 4 COMPLETION — META ADS AGENT OPTIMIZATION ENGINE

**Duration:** 2 weeks (2–13 September 2026), executed 2026-09-02
**Goal:** AI daily performance monitoring + Claude-driven optimization
recommendations + one-click apply (real Meta API) + undo + audit log +
optimization dashboard UI.
**Foundation:** Sprint 2 + Sprint 3 complete ✅

---

## What was built

**Backend**
- `server/src/utils/performanceMetrics.js` — pure metric math
  (`computePerformanceMetrics`, `computeTrend`, `previousDateString`),
  deliberately dependency-free so importing it (for tests) never pulls in
  `firebase-admin/auth` (see "Toolchain issue" below).
- `server/src/services/performanceMonitoringService.js` — pulls one day of
  Meta Insights per `ACTIVE`/launched campaign and writes `daily_performance`
  docs; `runDailyPerformanceMonitoring()` loops every company, catching
  per-campaign failures so one bad token/campaign never stops the rest.
- `server/src/services/optimizationEngineService.js` — Claude call that
  turns performance history into 1-5 validated recommendations
  (`averageMetrics`, `calculateTrends`, `validateRecommendations` are pure
  and unit-tested).
- `server/src/services/recommendationService.js` — `applyRecommendation()` /
  `undoRecommendation()`, dispatching by recommendation `type` to the real
  Meta Campaign/AdSet, with a `MetaApiClient` passed in as a parameter (not
  constructed internally) specifically so the dispatch logic is unit-testable
  with a fake client double.
- `server/src/services/metaAdsApiClient.js` — added `getAdSet`, `updateAdSet`.
- `server/src/utils/currency.js` — extracted `centsFromRM`/`rmFromCents`
  (was a private helper inside `metaCampaignLaunchService.js`; now shared
  with `recommendationService.js`).
- `server/src/utils/firebaseUtils.js` — added `saveDailyPerformance`,
  `getDailyPerformance`, `listPerformanceHistory`, `createRecommendation`,
  `getRecommendation`, `listRecommendations`, `updateRecommendation`,
  `listCompanies`, `listActiveCampaignsWithMeta`.
- `server/src/routes/metaAds.js` — `GET /performance` and `POST /optimize`
  upgraded from Sprint 2/3 placeholders to real implementations; added
  `GET /recommendations`, `POST /apply-recommendation`,
  `POST /reject-recommendation`, `POST /undo-recommendation`.
- `server/src/server.js` — schedules `runDailyPerformanceMonitoring()` via
  `node-cron`, `0 0 * * *` Asia/Kuala_Lumpur.
- `server/tests/performanceMonitoring.test.js` (8 tests),
  `optimizationEngine.test.js` (12 tests), `recommendationService.test.js`
  (14 tests) — all passing.

**Frontend**
- `client/src/components/metaads/OptimizationDashboard.jsx` — performance
  snapshot, pending/applied stats, "Analyze & Generate Recommendations"
  button, recommendation cards (priority badge, current/suggested/change,
  expected impact, rationale, Apply/Reject/Undo), and a collapsed history
  section for non-pending recommendations.
- `client/src/components/metaads/MetaAdsAgent.jsx` — added an `optimize` view
  and a "📊 Optimize" link on each `ACTIVE`, Meta-launched campaign row.
- `client/src/components/metaads/MetaAds.css` — optimization dashboard styles.

## Deliberate deviations from the original sprint brief

- **Budget recommendations target the Campaign, not an AdSet.** Sprint 3
  launched every campaign with Campaign Budget Optimization (budget set on
  the Campaign object), so there's no per-ad-set budget to change. The brief's
  sample code assumed ad-set-level budgets; `BUDGET_INCREASE`/`BUDGET_DECREASE`
  correctly update `campaign.metaCampaignId`'s `daily_budget`/`lifetime_budget`
  instead - documented in `OPTIMIZATION_ENGINE.md`.
- **Recommendations are generated on explicit user action, not automatically
  on dashboard load.** The brief's `OptimizationDashboard` just "loads"
  recommendations as if they already exist. Every Claude call costs money;
  auto-firing one on every page visit would be an unbounded background spend.
  The dashboard shows what's already been generated and offers an
  "Analyze & Generate Recommendations" button to trigger a new Claude call
  on demand - same cost-conscious pattern as Sprint 3's campaign generation.
- **`REFRESH_CREATIVE` cannot be one-click applied.** It requires new
  creative assets a human must supply; the brief's generic `applyRecommendation`
  dispatch would have silently no-opped or thrown an opaque error. It's
  clearly labeled in the UI ("Requires a manual creative update") and the
  Apply button is omitted entirely for that type.
- **No `/run-monitoring` HTTP endpoint.** The brief's cron job triggers real
  Meta API calls across every company; exposing that as a callable route
  would be a real attack surface for no product benefit. Testable manually
  via a one-line Node script (documented in `PERFORMANCE_MONITORING.md`) or
  by waiting for the schedule.
- **`qualityScore` is always `null`, never a fabricated constant.** The
  brief's sample code defaulted it to `85` for every campaign, which would
  look like real data while being a hardcoded lie. Meta's campaign-level
  insights fields this codebase requests don't expose a quality score;
  left `null` and documented as reserved rather than faked.
- **Interest/audience expansion is age-range only**, not a full
  interests/lookalike rewrite - see `OPTIMIZATION_ENGINE.md`'s known
  limitations.

## Toolchain issue found and fixed

Importing `performanceMonitoringService.js` in a test (as the brief's sample
`performanceMonitoring.test.js` would) transitively pulls in
`firebase-admin/auth` → `jwks-rsa` → `jose`, which fails to load under Jest's
`--experimental-vm-modules` ESM mode (`Must use import to load ES Module`).
Fixed by extracting the pure, testable functions
(`computePerformanceMetrics`, `computeTrend`, `previousDateString`) into a
new dependency-free `server/src/utils/performanceMetrics.js`, and having the
service import from there. The service itself (which does need
firebase-admin) stays untested directly, consistent with how
`metaAuthService.js`'s OAuth flow and `metaCampaignLaunchService.js`'s launch
flow are handled - live-verified via smoke test, not unit tested.

## Verification performed

- `npm test` (server): 56/56 passing (34 new Sprint 4 tests: 8 performance
  metrics, 12 optimization engine, 14 recommendation apply/undo dispatch
  against a fake Meta client + 22 pre-existing).
- `eslint` (client): the 4 changed/new `metaads` files are clean; same 4
  pre-existing errors elsewhere in the repo, untouched.
- **Live end-to-end smoke test** against the running dev servers with a real
  `ANTHROPIC_API_KEY`: registered a throwaway user/company, seeded a
  synthetic `ACTIVE` campaign with a fake `metaCampaignId`/`metaAdSetId` and
  5 days of performance history directly in Firestore (since no company here
  can complete real Meta OAuth - see below), then exercised the full route
  surface: `GET /performance` (real aggregation), `POST /optimize` (real
  Claude call, produced 5 well-reasoned, correctly-typed recommendations
  referencing the actual ad set ID), `GET /recommendations`,
  `POST /reject-recommendation` (+ idempotency 409 on double-reject),
  `POST /apply-recommendation` (correctly 409s - "Connect a Meta Ads account" -
  since Meta isn't connected), and manually invoked
  `runDailyPerformanceMonitoring()` (0 monitored / 4 skipped companies / 0
  failures - correct, since no company has a Meta connection, and it didn't
  crash). All test data deleted afterward.
- **Live browser test** on the project owner's real "Kira Senang Solution
  Enterprise" account: seeded one synthetic `ACTIVE` campaign the same way,
  clicked into the new "📊 Optimize" link, confirmed the performance snapshot
  rendered real Firestore data, clicked "Analyze & Generate Recommendations"
  (real Claude call, ~10s), and confirmed all 5 recommendation cards rendered
  correctly - including `REFRESH_CREATIVE` showing only a Reject button with
  its explanatory note. **Found and fixed a bug during this test**: the
  Apply/Undo buttons weren't actually disabled when Meta wasn't connected
  (only a banner showed) - now properly `disabled` client-side, matching the
  pattern already used in Sprint 3's `CampaignPreview`. Seeded test data
  deleted afterward; the real Kira Senang account and its other data were
  untouched.

## Known limitations / what's NOT done

- **Meta launch/apply/undo API calls are not live-verified against Meta's
  servers** - `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` are still blank in this
  environment (same gap flagged in Sprint 2 and Sprint 3), so no company can
  complete real Meta OAuth to test against. The dispatch logic is unit-tested
  with a fake client; the real HTTP calls are code-reviewed against Meta's
  documented Marketing API, not live-verified end-to-end.
- **Daily monitoring cron is unverified against a real midnight trigger** in
  this environment (verified via manual invocation instead - see above).
- **No retention/cleanup for `daily_performance` docs** - they accumulate
  forever; fine at current scale, worth a TTL policy later.
- **KIRA Senang has not run a real campaign for a week** to measure an actual
  ROAS improvement, since no Meta account can be connected here yet - the
  "10%+ ROAS improvement" success criterion can't be measured until Meta
  OAuth is configured with real credentials.
- `analytics` route is still Sprint 2's zeroed placeholder, unchanged -
  explicitly scoped to Sprint 5.

Ready for Sprint 5 (Analytics) once Meta OAuth has real credentials to
unblock live end-to-end verification of Sprints 3 and 4's Meta-touching paths.
