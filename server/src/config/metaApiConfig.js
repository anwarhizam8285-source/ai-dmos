export const META_API_VERSION = process.env.FACEBOOK_API_VERSION || "v18.0";
export const META_GRAPH_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;
export const META_OAUTH_DIALOG_URL = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth`;

export const META_OAUTH_SCOPES = (
  process.env.META_OAUTH_SCOPE || "ads_management,ads_read,pages_manage_ads"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const META_OAUTH_REDIRECT_URI =
  process.env.META_OAUTH_REDIRECT_URI ||
  "http://localhost:3000/api/v1/agents/meta-ads/callback";
