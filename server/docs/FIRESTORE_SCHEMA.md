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

Draft/skeleton campaign records. Sprint 2 only writes `status: "draft"` records via
`POST /create-campaign` — Sprint 3 pushes these to the real Meta Marketing API and
fills in `metaCampaignId`/`metaAdAccountId`.

Fields match the sprint spec: `budget`, `audience`, `creative`, `placements`,
`optimization`, etc. — see `FIRESTORE_SCHEMA.campaigns` for the full field list.

## companies/{companyId}/campaigns/{campaignId}/daily_performance/{date}

One document per campaign per day (`date` as `YYYY-MM-DD`). Not yet written by any
route — Sprint 4 will populate this from Meta Insights on a schedule.

## companies/{companyId}/campaigns/{campaignId}/recommendations/{recommendationId}

AI-generated optimization suggestions (budget changes, pausing underperforming ad
sets, creative refresh). Not yet written by any route — Sprint 4's `/optimize`
endpoint will generate and persist these via the CEO/Content agent pipeline.

## Security rules

No dedicated `firestore.rules` file exists in this repo yet (auth is enforced at the
Express layer via `verifyToken` + `req.user.uid`, and every read/write utility takes
an explicit `companyId`). If/when direct client-side Firestore access is introduced,
add rules scoping `companies/{companyId}/**` reads/writes to users whose custom claims
or `users/{uid}.tenantId` match `companyId` — mirroring the existing `users` collection
shape in `firestoreSchema.js`.
