# Campaign Creation Flow (Sprint 3)

## Flow

1. **Draft** — user fills out the campaign form (`CampaignForm.jsx`) and submits.
   `POST /api/v1/agents/meta-ads/generate-campaign` validates the input
   (`campaignValidation.js`), asks Claude to draft a full campaign
   (`campaignGeneratorService.js`), and saves the result as a Firestore
   `status: "DRAFT"` record. **No Meta account is required for this step.**
2. **Review** — the frontend shows `CampaignPreview.jsx`: 3 ad copy variations
   to pick from, audience options, an optional creative image upload, projected
   metrics, and Claude's free-text recommendations.
3. **Approve** — user picks a copy variation + audience and clicks "Launch
   Campaign". `POST /api/v1/agents/meta-ads/approve-campaign` requires a
   connected Meta Ads account (`GET /status` → `connected: true`); if not
   connected, the button is disabled client-side and the server also enforces
   it (409). On success it creates a **real** Campaign + AdSet on Meta
   (`metaCampaignLaunchService.js`), both `PAUSED`, and flips the Firestore
   record to `status: "ACTIVE"`.

## `campaignInput` shape (form → `/generate-campaign`)

```json
{
  "campaignName": "Q4 Product Launch",
  "budget": { "amount": 5000, "type": "DAILY" },
  "audience": {
    "country": "MY",
    "ageMin": 25,
    "ageMax": 45,
    "interests": ["technology", "business", "entrepreneurship"],
    "customAudienceId": null
  },
  "placement": { "facebook": true, "instagram": true, "audience_network": false, "messenger": false },
  "productInfo": {
    "name": "New SaaS Tool",
    "description": "Cloud-based project management for teams",
    "landingPageUrl": "https://product.com/launch",
    "targetAction": "CONVERSIONS"
  }
}
```

Validated by `validateCampaignInput()` in `server/src/validation/campaignValidation.js`:
budget RM100–RM1,000,000; age 13–65 with `ageMin <= ageMax`; 1–10 interests;
at least one placement; product description ≥20 chars; a parseable landing
page URL. All failures are collected and returned together as `errors: [...]`,
not just the first one.

## Claude generation prompt

`campaignGeneratorService.js` sends a system + user prompt asking for a single
JSON object (ad copy x3, audience recommendations, budget allocation, expected
metrics, campaign structure, recommendations) and validates the shape
(`validateGeneratedCampaign()`) before it's ever persisted or returned - a
malformed or incomplete Claude response fails the request rather than saving
a broken draft. Uses the same model as the rest of this codebase's Claude
calls (`anthropicService.js`'s `claude-opus-4-6`).

Token usage is logged via the existing `logUsage()` usage-tracking collection,
same as the Content Agent.

## Approval workflow

`server/src/routes/metaAds.js` → `POST /approve-campaign`:

1. Loads the `DRAFT` record, rejects if it's not `DRAFT` (409) or the selected
   copy variation ID doesn't exist (400).
2. Checks Meta connection status (`metaAuthService.getConnectionStatus`); 409
   if not connected.
3. Decrypts the stored Meta access token and builds a `MetaApiClient`.
4. Calls `launchCampaignOnMeta()` (see `META_CAMPAIGN_API.md` for what that
   actually creates on Meta's side).
5. Updates Firestore: `status: "ACTIVE"`, `approved`, `metaCampaignId`,
   `metaAdSetId`, `metaAdId`, `metaAdAccountId`.

## Known limitations

- **No Ad/creative is created unless `pageId` is supplied.** A real Meta Ad
  creative requires `object_story_spec.page_id` (a connected Facebook Page),
  and this codebase has no Facebook Page connection flow yet (only the ad
  account, via the Sprint 2 OAuth flow). `approve-campaign` accepts an
  optional `pageId` in the request body for when that flow exists; without
  it, Campaign + AdSet are still created for real, `adCreated: false` is
  returned, and the user is told to add an Ad from Meta Ads Manager.
- **Interest targeting is best-effort.** Free-text interest names from the
  form are resolved to Meta interest IDs via the Graph API `/search` endpoint
  at approval time (`MetaApiClient.resolveInterests`); an interest Meta
  doesn't recognize is silently dropped rather than failing the launch.
- Everything is created `PAUSED` on Meta - nothing auto-activates and spends
  money. The user must activate from Meta Ads Manager.
- End-to-end tested with a real `ANTHROPIC_API_KEY` (Claude generation is
  live-verified), but `approve-campaign`'s real Meta API calls are
  code-reviewed and unit-testable-in-shape only, not live-verified - Sprint 2
  already noted `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` are blank in this
  environment, so no Meta account can actually be connected here yet.
