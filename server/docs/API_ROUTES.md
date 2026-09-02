# Meta Ads Agent — API Routes (Sprint 2)

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

### `GET /campaigns?companyId=...`
Lists campaign drafts for a company from Firestore.
**200** `{ success: true, campaigns: [...] }`

### `GET /performance?campaignId=...&dateRange=30d`
**Placeholder** — returns a zeroed summary shape. Real Meta Insights aggregation
lands in Sprint 4.

### `POST /optimize`
Body: `{ campaignId, analysisDepth? }`. **Placeholder** — returns `recommendations: []`.
Real Claude-driven recommendations land in Sprint 4.

### `GET /analytics?companyId=...&dateRange=30d`
**Placeholder** — returns a zeroed summary shape. Real cross-campaign analytics
land in Sprint 5.

## Error codes

All routes follow the existing convention in this codebase: `{ "error": "message" }`
on failure, with `400` for missing/invalid input, `401`/`403` from `verifyToken` for
auth failures, `503` when Meta isn't configured, `500` for unexpected errors.
