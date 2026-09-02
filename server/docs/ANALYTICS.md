# Analytics (Sprint 5)

Base path: `/api/v1/analytics`. All routes require `Authorization: Bearer <JWT>`.

## Pre-existing (Sprint "feature-8"): AI usage/cost tracking

- `GET /usage?companyId=...&days=30` - raw daily usage records.
- `GET /summary?companyId=...&days=30` - totals + zero-filled daily breakdown
  of `tokensUsed`/`cost`/`contentGenerated`/`apiCallsCount`.

Unchanged in Sprint 5. Backs the "Usage Analytics" section of the Analytics
tab (token spend on Claude API calls - separate concern from campaign ad spend).

## New in Sprint 5: campaign ROI + billing

### `GET /overview?companyId=...&dateRange=30days`
Account-wide campaign performance, aggregated across every campaign's
`daily_performance` (`analyticsAggregationService.calculateBusinessMetrics`).
`dateRange`: `7days` | `30days` | `90days` | `all`.

```json
{
  "success": true,
  "data": {
    "period": "30days",
    "totals": { "spend": 0, "results": 0, "impressions": 0, "clicks": 0, "conversionValue": 0, "ctr": 0, "averageCpc": 0, "averageCostPerResult": 0, "averageRoas": 0 },
    "campaigns": [ { "campaignId": "...", "name": "...", "status": "...", "spend": 0, "...": "...", "hasPerformanceData": false } ],
    "daily": [ { "date": "2026-08-01", "spend": 0, "results": 0, "ctr": 0, "roas": 0 } ],
    "topPerformers": [ "...up to 3 campaigns, sorted by ROAS desc..." ],
    "bottomPerformers": [ "...up to 3 campaigns, sorted by ROAS asc..." ]
  }
}
```

`totals.averageRoas` is **spend-weighted** (total conversion value ÷ total
spend across every campaign), not a naive average of each campaign's own
ROAS - see `server/src/utils/analyticsMath.js` for why that distinction
matters (a RM1/day campaign's lucky 10x day shouldn't outweigh a
RM10,000/day campaign's steady 2x in the headline number). `topPerformers`/
`bottomPerformers` only include campaigns with `hasPerformanceData: true`
(i.e. actually launched on Meta and monitored at least once) - drafts and
never-launched campaigns don't clutter either list.

### `GET /billing?companyId=...`
Plan info + this-month usage - **display-only, not a real invoice**. See
`BILLING.md`.

```json
{
  "success": true,
  "data": {
    "plan": "professional",
    "label": "Professional",
    "priceRM": 599,
    "usage": { "campaignsCreatedThisMonth": 0, "totalCampaigns": 0, "tokensUsedThisMonth": 0, "apiCostThisMonthRM": 0, "contentGeneratedThisMonth": 0 },
    "paymentIntegration": "not_configured"
  }
}
```

### `GET /export?companyId=...&dateRange=30days&format=csv|json`
Same data as `/overview`. `format=csv` returns `text/csv` with a
`Content-Disposition: attachment` header (per-campaign rows only - the daily
time series and top/bottom lists aren't included in the CSV, since a
per-campaign table is what's actually useful to open in a spreadsheet).
`format=json` returns the same shape as `/overview`. **PDF export is not
implemented** - it would need a rendering dependency (`pdfkit`/`puppeteer`)
not currently in this codebase; deferred rather than half-built.

## Testing

`server/src/utils/analyticsMath.js` holds all the aggregation math as pure,
dependency-free functions (`computeCampaignTotals`, `rollUpTotals`,
`buildDailySeries`, `topPerformers`, `bottomPerformers`, `planInfo`) -
unit-tested in `server/tests/analyticsMath.test.js` (12 tests) without
touching Firestore. `analyticsAggregationService.js` is the thin
Firestore-calling orchestration layer around that math; live-verified via
the Sprint 5 smoke test (see `SPRINT-5-COMPLETION.md`) rather than unit
tested, same pattern as `performanceMonitoringService.js` in Sprint 4.
