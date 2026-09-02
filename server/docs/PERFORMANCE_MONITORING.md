# Performance Monitoring (Sprint 4)

## Schedule

`server/src/server.js` schedules `runDailyPerformanceMonitoring()`
(`performanceMonitoringService.js`) via `node-cron`, `0 0 * * *`, timezone
`Asia/Kuala_Lumpur`. It runs once a day, in-process — no separate worker or
queue. If the server process isn't running at midnight MYT, that day's run
simply doesn't happen (there's no catch-up/backfill).

## What it does

For every company with a valid (decryptable) Meta token, and every campaign
in that company with `status: "ACTIVE"` and a `metaCampaignId` (i.e. actually
launched on Meta):

1. Pulls one day of Meta Insights via `MetaApiClient.getCampaignPerformance(metaCampaignId, { since, until })`.
2. Derives `ctr`, `cpc`, `costPerResult`, `roas` from the raw spend/impressions/clicks/results
   (`computePerformanceMetrics()` in `server/src/utils/performanceMetrics.js` -
   every division is guarded, so a zero-impression or zero-click day never
   produces `NaN`/`Infinity`).
3. Reads the previous calendar day's stored doc (if any) and computes
   `vs_yesterday` percent changes (`computeTrend()`, same file).
4. Writes the result to `companies/{companyId}/campaigns/{campaignId}/daily_performance/{date}`.

One campaign failing (Meta rate limit, revoked token, deleted campaign on
Meta's side) is caught and logged - it never stops the rest of that company's
campaigns or the rest of the companies. `runDailyPerformanceMonitoring()`
returns a summary (`{ monitored, skippedCompanies, failed, errors: [...] }`)
that's logged to the console; nothing pages anyone on failure yet.

## Metrics collected

See `FIRESTORE_SCHEMA.dailyPerformance` in `firestoreSchema.js` for the full
field list. Notably: **`qualityScore` is always `null`** - Meta's
campaign-level insights fields this codebase requests (`spend,impressions,
clicks,ctr,cpc,frequency,reach,actions`) don't include a quality/relevance
score. The field is reserved in the schema for a future sprint that requests
`quality_ranking`/`engagement_rate_ranking` from Meta, rather than faked with
a constant.

## Data retention

No TTL or cleanup job exists - `daily_performance` docs accumulate forever.
`listPerformanceHistory()` caps reads at a `limitDays` parameter (default 30,
used by `/performance` and `/optimize`), so unbounded history doesn't slow
those routes down, but nothing deletes old docs. Worth adding a retention
policy (e.g. Firestore TTL field) once real usage data exists to reason about.

## Troubleshooting

- **A campaign never gets a `daily_performance` doc**: check it has
  `status: "ACTIVE"` and a non-null `metaCampaignId` in Firestore, and that
  the company's `meta_tokens/token_metadata` doc has `isValid: true` and a
  decryptable `accessToken`.
- **To run it manually** (there's no HTTP endpoint for this on purpose - it
  makes real Meta API calls across every company, so it isn't exposed as a
  route): `node -e "import('./src/services/performanceMonitoringService.js').then(m => m.runDailyPerformanceMonitoring().then(console.log))"`
  from `server/`.
- **Known limitation**: not live-verified against Meta's servers in this
  environment - `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` are still blank (see
  Sprint 2/3's completion docs), so no company here has a real Meta
  connection to pull real Insights from. The Firestore read/write path,
  metric derivation, and cross-company/cross-campaign loop were verified with
  a seeded synthetic campaign - see `SPRINT-4-COMPLETION.md`.
