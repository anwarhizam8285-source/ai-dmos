import crypto from "crypto";
import axios from "axios";
import {
  META_GRAPH_BASE_URL,
  META_OAUTH_DIALOG_URL,
  META_OAUTH_REDIRECT_URI,
  META_OAUTH_SCOPES,
} from "../config/metaApiConfig.js";
import { encryptToken, decryptToken } from "../utils/tokenEncryption.js";
import { storeMetaToken, getMetaToken, deleteMetaToken } from "../utils/firebaseUtils.js";
import { MetaApiClient } from "./metaAdsApiClient.js";

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const pendingStates = new Map();

function cleanupExpiredStates() {
  const now = Date.now();
  for (const [state, entry] of pendingStates) {
    if (entry.expiresAt < now) {
      pendingStates.delete(state);
    }
  }
}

export function generateAuthUrl({ uid, companyId }) {
  cleanupExpiredStates();

  const state = crypto.randomBytes(32).toString("hex");
  pendingStates.set(state, { uid, companyId, expiresAt: Date.now() + STATE_TTL_MS });

  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID || "",
    redirect_uri: META_OAUTH_REDIRECT_URI,
    scope: META_OAUTH_SCOPES.join(","),
    state,
    response_type: "code",
  });

  return { authUrl: `${META_OAUTH_DIALOG_URL}?${params.toString()}`, state };
}

export function consumeState(state) {
  const entry = pendingStates.get(state);
  if (!entry) return null;
  pendingStates.delete(state);
  if (entry.expiresAt < Date.now()) return null;
  return entry;
}

async function exchangeCodeForToken(code) {
  const response = await axios.get(`${META_GRAPH_BASE_URL}/oauth/access_token`, {
    params: {
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: META_OAUTH_REDIRECT_URI,
      code,
    },
  });

  return response.data; // { access_token, token_type, expires_in }
}

async function exchangeForLongLivedToken(shortLivedToken) {
  const response = await axios.get(`${META_GRAPH_BASE_URL}/oauth/access_token`, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      fb_exchange_token: shortLivedToken,
    },
  });

  return response.data; // { access_token, token_type, expires_in }
}

export async function completeConnection({ code, companyId }) {
  const shortLived = await exchangeCodeForToken(code);
  const longLived = await exchangeForLongLivedToken(shortLived.access_token);

  const accessToken = longLived.access_token;
  const client = new MetaApiClient(accessToken);

  const [me, adAccounts] = await Promise.all([client.getMe(), client.getAdAccounts()]);
  const primaryAdAccount = adAccounts[0]?.account_id || null;

  const expiresInMs = (longLived.expires_in || 60 * 24 * 60 * 60) * 1000;

  const tokenData = {
    accessToken: encryptToken(accessToken),
    refreshToken: null,
    expiresAt: new Date(Date.now() + expiresInMs),
    scopes: META_OAUTH_SCOPES,
    metaUserId: me.id,
    metaAdAccountId: primaryAdAccount,
    isValid: true,
    lastRefreshed: new Date(),
    lastUsed: null,
  };

  await storeMetaToken(companyId, tokenData);

  return {
    metaUserId: me.id,
    metaUserName: me.name,
    metaAdAccountId: primaryAdAccount,
    expiresAt: tokenData.expiresAt,
  };
}

export async function getConnectionStatus(companyId) {
  const token = await getMetaToken(companyId);
  if (!token || !token.isValid) {
    return { connected: false };
  }

  return {
    connected: true,
    metaUserId: token.metaUserId,
    metaAdAccountId: token.metaAdAccountId,
    scopes: token.scopes,
    expiresAt: token.expiresAt,
    lastRefreshed: token.lastRefreshed,
  };
}

export async function getDecryptedAccessToken(companyId) {
  const token = await getMetaToken(companyId);
  if (!token || !token.isValid) {
    return null;
  }
  return decryptToken(token.accessToken);
}

export async function disconnect(companyId) {
  await deleteMetaToken(companyId);
  return { success: true };
}
