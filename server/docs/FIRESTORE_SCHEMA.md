# Firestore Schema — Meta Ads Agent (Sprint 2)

The source of truth for collection shapes is `server/src/utils/firestoreSchema.js`
(`FIRESTORE_SCHEMA` + `FIRESTORE_COLLECTIONS`). This doc explains the four
collections Sprint 2 added on top of the existing multi-tenant `companies/{companyId}/...`
structure (see `users`, `knowledge`, `content`, etc. already in that file).

> Note: the root-level `04-FIRESTORE-SCHEMA.md` describes an earlier, more elaborate
> `tenants/{tenantId}/workspaces/{workspaceId}/...` design from initial planning. The
> codebase actually implements a flatter `companies/{companyId}/...` tenancy model —
> everything below follows that existing, real convention rather than the planning doc.

## companies/{companyId}/meta_tokens/token_metadata

One document per company holding the encrypted Meta OAuth credential.

```
metaToken: {
  accessToken: string        // AES-256-CBC encrypted, see tokenEncryption.js
  refreshToken: string|null  // Meta long-lived tokens don't have a refresh token;
                              // reserved for future token-rotation strategies
  expiresAt: timestamp
  scopes: string[]
  metaUserId: string
  metaAdAccountId: string|null
  isValid: boolean
  lastRefreshed: timestamp
  lastUsed: timestamp|null
}
```

Never store the plaintext token. `storeMetaToken`/`getMetaToken`/`deleteMetaToken`
in `firebaseUtils.js` are the only functions that should touch this collection.

## companies/{companyId}/campaigns/{campaignId}

Sprint 2 could only write manual `status: "draft"` records via `POST /create-campaign`.
Sprint 3 adds the real flow: `POST /generate-campaign` writes a `status: "DRAFT"`
record with a full `aiGeneration` block (Claude's ad copy variations, audience
recommendations, budget allocation, projected metrics, recommendations), and
`POST /approve-campaign` pushes it to the real Meta Marketing API (Campaign +
AdSet, both `PAUSED`) and flips the record to `status: "ACTIVE"`, filling in
`metaCampaignId`/`metaAdSetId`/`metaAdId`/`metaAdAccountId` and the `approved` block.

Fields match the sprint spec plus Sprint 3 additions: `budget`, `audience`,
`creative`, `placements`, `productInfo`, `aiGeneration`, `approved`, `optimization`,
etc. — see `FIRESTORE_SCHEMA.campaigns` in `firestoreSchema.js` for the full field list.

Note the `status` enum is inconsistent across sprints: Sprint 2's manual
`POST /create-campaign` still writes lowercase `"draft"`; Sprint 3's AI flow
writes uppercase `"DRAFT"`/`"ACTIVE"` (matching the sprint brief). Not
normalized here to avoid touching the working Sprint 2 route - a future sprint
should pick one casing and migrate.

## companies/{companyId}/campaigns/{campaignId}/daily_performance/{date}

One document per campaign per day (`date` as `YYYY-MM-DD`). Written by the
nightly cron (`performanceMonitoringService.js`, scheduled in `server.js` via
`node-cron`, `0 0 * * *` Asia/Kuala_Lumpur) for every `ACTIVE` campaign with a
`metaCampaignId`, one company at a time so one company's Meta token/API
failure never blocks another's. `vs_yesterday` is computed against the
previous calendar day's stored doc, if any.

## companies/{companyId}/campaigns/{campaignId}/recommendations/{recommendationId}

AI-generated optimization suggestions (budget changes, pausing the ad set,
widening audience targeting, changing bid strategy, or flagging creative
refresh). Written by `POST /optimize` (Claude call via
`optimizationEngineService.js`), updated by `/apply-recommendation`,
`/reject-recommendation`, and `/undo-recommendation`
(`recommendationService.js` does the actual Meta API dispatch). See
`server/docs/OPTIMIZATION_ENGINE.md`.

## Security rules

No dedicated `firestore.rules` file exists in this repo yet (auth is enforced at the
Express layer via `verifyToken` + `req.user.uid`, and every read/write utility takes
an explicit `companyId`). If/when direct client-side Firestore access is introduced,
add rules scoping `companies/{companyId}/**` reads/writes to users whose custom claims
or `users/{uid}.tenantId` match `companyId` — mirroring the existing `users` collection
shape in `firestoreSchema.js`.
