# Meta Ads Agent — API Routes (Sprint 2 + Sprint 3 + Sprint 4)

Base path: `/api/v1/agents/meta-ads`

All routes except `callback` require `Authorization: Bearer <JWT>` (see
`authMiddleware.js`). `companyId` is the tenant id used throughout the rest of the
app (`companies/{companyId}/...`).

## Auth (`server/src/routes/metaAuth.js`)

### `GET /auth-url?companyId=...`
Generates a Meta OAuth authorization URL and a one-time CSRF `state` token.

**200**
```json
{ "success": true, "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?...", "state": "..." }
```
**400** missing `companyId`. **503** `FACEBOOK_APP_ID` not configured.

### `GET /callback?code=...&state=...`
Called by Meta's redirect, not by the frontend directly. No auth header (state
token recovers the company). On success/failure it **redirects** the browser to
`${FRONTEND_URL}/dashboard?meta_connected=true` or `?meta_error=<reason>`.

### `GET /status?companyId=...`
**200**
```json
{ "success": true, "connected": true, "metaUserId": "...", "metaAdAccountId": "...", "scopes": [...], "expiresAt": "...", "lastRefreshed": "..." }
```
or `{ "success": true, "connected": false }`.

### `POST /disconnect`
Body: `{ "companyId": "..." }`. Deletes the stored token.
**200** `{ "success": true, "message": "Meta account disconnected" }`

## Campaigns (`server/src/routes/metaAds.js`)

### `POST /create-campaign`
Body: `{ companyId, campaignName, objective?, budget?, audience?, creative? }`.
**Skeleton** — persists a `status: "draft"` record to Firestore. Does **not** call
the Meta Marketing API yet (that's Sprint 3).
**201** `{ success: true, campaignId, message }`

### `POST /generate-campaign` (Sprint 3)
Body: `{ companyId, campaignInput }` — see `CAMPAIGN_CREATION.md` for the full
`campaignInput` shape. Validates the input, asks Claude to draft a full campaign
(3 ad copy variations, audience recommendations, budget allocation, projected
metrics, recommendations), and saves it as a Firestore `status: "DRAFT"` record.
Nothing is sent to Meta at this step.
**201** `{ success: true, campaignId, generatedCampaign, usage, cost, message }`
**400** validation failure — `{ error, errors: [...] }` with every problem found.

### `POST /approve-campaign` (Sprint 3)
Body: `{ companyId, campaignId, selections: { copyVariation, audience }, creative?, pageId? }`.
Pushes an approved `DRAFT` to the **real** Meta Marketing API: creates a real
Campaign (budget via Campaign Budget Optimization) + AdSet (age/geo/interest
targeting, interests resolved to Meta IDs via `/search`), both created `PAUSED`.
An Ad (with creative) is only created if `pageId` (a Facebook Page ID) is
supplied — this codebase has no Page-connection flow yet, so by default only
Campaign + AdSet are real. Marks the Firestore record `ACTIVE` on success.
**200** `{ success: true, campaignId, metaCampaignId, metaAdSetId, metaAdId, adCreated, message }`
**404** campaign not found. **409** campaign not `DRAFT`, or Meta not connected.

### `GET /campaigns?companyId=...`
Lists campaign drafts for a company from Firestore.
**200** `{ success: true, campaigns: [...] }`

### `GET /performance?companyId=...&campaignId=...&dateRange=30d` (Sprint 4)
Real daily_performance history, written by the nightly monitoring cron
(`performanceMonitoringService.js`). `dateRange` is a number of days (e.g. `30`).
**200** `{ success: true, campaignId, summary: { spend, impressions, clicks, results, ctr, cpc, roas }, daily: [...] }`

### `POST /optimize` (Sprint 4)
Body: `{ companyId, campaignId }`. Claude analyzes up to 30 days of stored
`daily_performance` and generates 1-5 saved, `PENDING` recommendations. Requires
the campaign to have `metaCampaignId` set (i.e. actually launched) and at least
one day of monitored performance.
**200** `{ success: true, campaignId, avgMetrics, trends, recommendations: [...], usage, cost, message }`
**409** not launched on Meta yet, or no performance data yet.

### `GET /recommendations?companyId=...&campaignId=...&status=PENDING` (Sprint 4)
`status` is optional (omit for all statuses).
**200** `{ success: true, campaignId, recommendations: [...], count }`

### `POST /apply-recommendation` (Sprint 4)
Body: `{ companyId, campaignId, recommendationId }`. Applies one `PENDING`
recommendation to the real campaign/ad set on Meta (`recommendationService.js`
dispatches by `type`; see `OPTIMIZATION_ENGINE.md`). `REFRESH_CREATIVE` always
fails — it requires a human to supply new creative assets.
**200** `{ success: true, campaignId, recommendationId, message, result }`
**409** already applied/rejected, or Meta not connected.

### `POST /reject-recommendation` (Sprint 4)
Body: `{ companyId, campaignId, recommendationId, reason? }`. Firestore-only,
no Meta call.
**200** `{ success: true, campaignId, recommendationId, message }`

### `POST /undo-recommendation` (Sprint 4)
Body: `{ companyId, campaignId, recommendationId }`. Reverses an `APPLIED`
recommendation using the `action.previousValue` captured at apply time — only
within a 24-hour window.
**200** `{ success: true, campaignId, recommendationId, message }`
**400** not APPLIED, window expired, or no previousValue recorded.
**409** Meta not connected.

### `GET /analytics?companyId=...&dateRange=30d`
**Placeholder** — returns a zeroed summary shape. Real cross-campaign analytics
land in Sprint 5.

## Error codes

All routes follow the existing convention in this codebase: `{ "error": "message" }`
on failure, with `400` for missing/invalid input, `401`/`403` from `verifyToken` for
auth failures, `503` when Meta isn't configured, `500` for unexpected errors.
