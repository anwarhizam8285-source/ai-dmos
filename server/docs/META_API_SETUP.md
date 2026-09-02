# Meta Ads API Setup (Sprint 2)

## 1. Create a Meta App

1. Go to https://developers.facebook.com/apps
2. Create an app of type **Business**, name it e.g. `ai-dmos-meta-ads`.
3. Add the **Marketing API** product to the app.
4. Under **App Settings > Basic**, copy the **App ID** and **App Secret**.

## 2. Configure OAuth redirect

1. Add the **Facebook Login** product.
2. Under **Facebook Login > Settings**, add this Valid OAuth Redirect URI:
   ```
   http://localhost:3000/api/v1/agents/meta-ads/callback
   ```
   (use your deployed backend URL in production, not localhost).

## 3. Scopes requested

AI-DMOS requests:
- `ads_management` — create/update campaigns
- `ads_read` — read performance/insights
- `pages_manage_ads` — run ads on connected Pages

These require App Review before they work for accounts other than the app's own developers/testers. For local development, add yourself as a **Test User** or **Developer** on the app so you can complete the OAuth flow without review.

## 4. Ad account access

Get your Ad Account ID from https://business.facebook.com under Business Settings > Ad Accounts (the numeric ID after `act_`). The OAuth flow automatically discovers the first ad account the connected user has access to via `/me/adaccounts` and stores it — no manual entry needed for the MVP.

## 5. Environment variables

Set these in `server/.env.local` (already scaffolded by Sprint 2):

```
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_API_VERSION=v18.0
META_OAUTH_REDIRECT_URI=http://localhost:3000/api/v1/agents/meta-ads/callback
META_OAUTH_SCOPE=ads_management,ads_read,pages_manage_ads
FRONTEND_URL=http://localhost:5173
TOKEN_ENCRYPTION_KEY=<64-char hex, already generated for local dev>
```

`FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` are left blank — fill them in from step 1. Until they're set, `GET /api/v1/agents/meta-ads/auth-url` returns `503`.

`TOKEN_ENCRYPTION_KEY` must be 32 bytes as hex (64 characters). Generate a new one with:
```js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
or call `generateEncryptionKey()` from `server/src/utils/tokenEncryption.js`.

## 6. OAuth flow (how it works here)

1. Frontend calls `GET /api/v1/agents/meta-ads/auth-url?companyId=...` (authenticated) → gets a Meta authorization URL and a one-time `state` token (kept server-side in memory, tied to the requesting user + company, expires after 10 minutes).
2. Browser is redirected to Meta, user logs in and approves the requested scopes.
3. Meta redirects the browser to `GET /api/v1/agents/meta-ads/callback?code=...&state=...` (no auth header — the `state` is what recovers which company the token belongs to).
4. The backend exchanges `code` for a short-lived token, exchanges that for a 60-day long-lived token, fetches `/me` and `/me/adaccounts`, encrypts the access token (AES-256-CBC, see `tokenEncryption.js`), and stores it at `companies/{companyId}/meta_tokens/token_metadata`.
5. The browser is redirected back to `${FRONTEND_URL}/dashboard?meta_connected=true` (or `?meta_error=...` on failure).

## 7. Troubleshooting

- **`auth-url` returns 503** — `FACEBOOK_APP_ID` isn't set.
- **Callback redirects with `meta_error=invalid_or_expired_state`** — more than 10 minutes passed between requesting the auth URL and completing login, or the backend process restarted in between (state is in-memory, not persisted). Just reconnect.
- **Callback redirects with a Meta error message** — usually a scope not yet approved for non-test users, or a redirect URI mismatch with what's registered in the Meta App dashboard.
- **Token exchange fails with `190`/`OAuthException`** — app secret or redirect URI is wrong, or the authorization code was already used/expired (codes are single-use, short-lived).
