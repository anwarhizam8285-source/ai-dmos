# Meta Marketing API — Campaign Launch (Sprint 3)

What `launchCampaignOnMeta()` (`server/src/services/metaCampaignLaunchService.js`)
actually creates on Meta's Graph API when a `DRAFT` campaign is approved.

## Object graph created

```
Campaign (act_{adAccountId}/campaigns)
  status: PAUSED
  objective: CONVERSIONS | LEADS | TRAFFIC | AWARENESS
  daily_budget or lifetime_budget: campaign.budget.amount in cents (Campaign Budget Optimization)
  special_ad_categories: []
       │
       ▼
AdSet (act_{adAccountId}/adsets)
  status: PAUSED
  campaign_id: <from above>
  optimization_goal: mapped from objective (OFFSITE_CONVERSIONS | LEAD_GENERATION | LINK_CLICKS | REACH)
  bid_strategy: LOWEST_COST_WITHOUT_CAP
  targeting: { age_min, age_max, geo_locations: { countries }, flexible_spec: [{ interests }] }
       │
       ▼ (only if `pageId` was supplied to /approve-campaign)
AdCreative (act_{adAccountId}/adcreatives) + Ad (act_{adAccountId}/ads)
  status: PAUSED
  object_story_spec.link_data: { message, link, name, description, call_to_action }
```

## Why Campaign-level budget (CBO)

Meta's Campaign object accepts `daily_budget`/`lifetime_budget` directly when
using Campaign Budget Optimization, which matches this feature's simplified
one-campaign-one-budget model from the form. This avoids having to split the
form's single RM budget across multiple ad sets.

## Interest targeting resolution

The form collects free-text interest names (`audience.interests`). Meta's
`targeting.flexible_spec[].interests` requires `{id, name}` objects, not plain
strings. `MetaApiClient.resolveInterests()` calls `GET /search?type=adinterest`
for each name and keeps only what Meta recognizes - an unmatched interest is
dropped rather than failing the whole launch. `buildTargeting()` in
`metaCampaignLaunchService.js` only adds `flexible_spec` if at least one
interest resolved.

## Why no Ad is created by default

A real Meta Ad's creative (`object_story_spec`) requires `page_id` - the
Facebook Page the ad is posted from. Sprint 2's OAuth flow connects an **ad
account**, not a **Page**; no Page-picker UI exists yet. Rather than fake a
Page ID or skip Campaign/AdSet creation entirely, `launchCampaignOnMeta()`
always creates the real Campaign + AdSet (these don't need a Page) and only
attempts the Ad + AdCreative step when the caller supplies `pageId` -
currently only reachable by passing it directly in the `/approve-campaign`
request body, since there's no UI for it. This is the same "ship the graph
that's actually testable, document the rest" approach Sprint 2 took with the
Meta OAuth flow.

## Safety: everything created PAUSED

Every object above is created with `status: "PAUSED"`. Meta starts billing
the moment a Campaign is `ACTIVE`; this integration never sets that itself.
The user activates from Meta Ads Manager (or a future "activate" endpoint)
once they've reviewed what was created.

## `MetaApiClient` additions (Sprint 3)

`server/src/services/metaAdsApiClient.js` — added to the Sprint 2 client:

- `createCampaign()` - extended to accept `dailyBudgetCents`/`lifetimeBudgetCents`/`specialAdCategories`.
- `resolveInterests(names)` - `GET /search?type=adinterest`, best-effort.
- `createAdSet(adSetData)` - `POST /act_{id}/adsets`.
- `createAdCreative({...})` - `POST /act_{id}/adcreatives` (`object_story_spec`/`link_data`).
- `createAd({...})` - `POST /act_{id}/ads`.

All go through the same retry/backoff `request()` helper as the Sprint 2 methods.
