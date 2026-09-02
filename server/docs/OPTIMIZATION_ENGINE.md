# AI Optimization Engine (Sprint 4)

## How it works

1. **User clicks "Analyze & Generate Recommendations"** (or calls
   `POST /optimize`) on a campaign that's `ACTIVE` and has at least one day of
   `daily_performance` history.
2. `optimizationEngineService.generateOptimizationRecommendations(campaign, performanceHistory)`:
   - Averages the performance history (`averageMetrics()`) and computes a
     first-vs-last-day trend (`calculateTrends()`) - both pure, guarded
     against division by zero.
   - Sends one Claude call with the campaign's real Meta ad set ID, current
     budget, and those computed metrics/trends, asking for a JSON array of up
     to 5 recommendations.
   - Validates the shape (`validateRecommendations()`) before anything is
     persisted or returned - an invalid type, missing `action`/`expectedImpact`,
     or out-of-range `priority` fails the request rather than saving a broken
     recommendation.
3. Each recommendation is saved as `status: "PENDING"` under
   `companies/{companyId}/campaigns/{campaignId}/recommendations/{recommendationId}`,
   expiring after 7 days.
4. The user reviews each card and clicks **Apply** or **Reject**.
   `REFRESH_CREATIVE` recommendations only show a Reject button - see below.
5. Applying calls `POST /apply-recommendation`, which dispatches by `type`
   (`recommendationService.applyRecommendation()`) to the real Meta API and
   captures whatever's needed to reverse it into `action.previousValue`.
6. Within 24 hours of applying, the card shows an **Undo** button
   (`POST /undo-recommendation`), which reverses the change using that
   captured `previousValue`.

## Recommendation types and what "Apply" actually does

This campaign structure (from Sprint 3) is always exactly one Campaign
(using Campaign Budget Optimization) + one AdSet, so every action targets
those two objects - there's no "wrong ad set" ambiguity to resolve.

| Type | Apply does | Undo restores |
|---|---|---|
| `BUDGET_INCREASE` / `BUDGET_DECREASE` | Sets the **Campaign's** `daily_budget`/`lifetime_budget` (CBO - not the ad set, since budget lives on the campaign) to `action.suggestedValue` (RM, converted to cents) | Previous campaign budget (RM) |
| `PAUSE_ADSET` | Sets the ad set's `status` to `PAUSED` | Ad set status back to `ACTIVE` |
| `EXPAND_AUDIENCE` | Reads the ad set's current `targeting`, widens `age_min`/`age_max` by 5 years each side (clamped 13-65), writes it back | The exact previous `{ age_min, age_max }` |
| `CHANGE_BIDDING` | Reads the ad set's current `bid_strategy`, sets it to `action.suggestedValue` (a Meta bid strategy string Claude proposes, e.g. `COST_CAP`) | Previous `bid_strategy` |
| `REFRESH_CREATIVE` | **Always throws** - creative refresh needs new assets a human must supply. The recommendation stays actionable only via Reject. | n/a |

`applyRecommendation`/`undoRecommendation` (`server/src/services/recommendationService.js`)
take a `MetaApiClient` instance as a parameter rather than constructing one
internally - this is what makes them unit-testable with a fake client double
(`server/tests/recommendationService.test.js`) without live Meta credentials.

## Undo window

24 hours from `appliedAt`, enforced server-side in `undoRecommendation()` -
not just a UI affordance. Reversing after the window (or a recommendation
that isn't `APPLIED`, or one with no recorded `previousValue`) fails with a
clear error rather than silently no-opping.

## Audit trail

Every recommendation carries a `logs` array (`GENERATED` at creation,
`APPLIED`/`REJECTED`/`UNDONE` appended via Firestore `FieldValue.arrayUnion`
as those actions happen), plus `appliedBy` (the acting user's uid) and
`appliedAt`/`undoneAt` timestamps.

## Cost

Each `/optimize` call is one Claude request, logged through the same
`logUsage()` usage-tracking collection as Content Agent generations and
campaign generation (Sprint 3) - visible in the dashboard's token/cost stats.
Recommendations aren't auto-generated on a schedule; generating them is
always an explicit, user-triggered action, so this cost is opt-in per click
rather than an unbounded background spend.

## Known limitations

- **Not live-verified against Meta's servers** for the actual apply/undo
  Meta API calls - `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` are still blank in
  this environment (same gap Sprint 2/3 flagged), so no company here has a
  real Meta connection. `applyRecommendation`/`undoRecommendation`'s dispatch
  logic is unit-tested against a fake `MetaApiClient`; the real HTTP calls
  are code-reviewed against Meta's documented Marketing API, not
  live-verified. `/optimize` itself (the Claude call + Firestore
  read/write/validation path) *is* live-verified - see `SPRINT-4-COMPLETION.md`.
- **`EXPAND_AUDIENCE` only widens age range**, even though Claude's rationale
  text sometimes also suggests a lookalike audience - actually creating a
  Custom/Lookalike Audience is a separate Meta API surface not implemented
  here. The applied change is real (age range), the lookalike part of the
  recommendation is informational only.
- **No per-ad-set performance breakdown** feeds the prompt - only
  campaign-level `daily_performance`. Fine while every campaign has exactly
  one ad set (true today); would need revisiting if Sprint 5+ ever creates
  multiple ad sets per campaign.
