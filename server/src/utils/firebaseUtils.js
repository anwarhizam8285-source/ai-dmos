import { db } from "../services/firebaseService.js";
import { FIRESTORE_COLLECTIONS } from "./firestoreSchema.js";

// User operations
export async function createUser(uid, userData) {
  return await db.collection(FIRESTORE_COLLECTIONS.USERS).doc(uid).set({
    uid,
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function getUser(uid) {
  const doc = await db.collection(FIRESTORE_COLLECTIONS.USERS).doc(uid).get();
  return doc.exists ? doc.data() : null;
}

export async function updateUser(uid, updates) {
  return await db.collection(FIRESTORE_COLLECTIONS.USERS).doc(uid).update({
    ...updates,
    updatedAt: new Date(),
  });
}

// Company operations
export async function createCompany(companyId, companyData) {
  return await db.collection(FIRESTORE_COLLECTIONS.COMPANIES).doc(companyId).set({
    companyId,
    ...companyData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function getCompany(companyId) {
  const doc = await db.collection(FIRESTORE_COLLECTIONS.COMPANIES).doc(companyId).get();
  return doc.exists ? doc.data() : null;
}

export async function updateCompany(companyId, updates) {
  return await db.collection(FIRESTORE_COLLECTIONS.COMPANIES).doc(companyId).update({
    ...updates,
    updatedAt: new Date(),
  });
}

// Knowledge operations
export async function createKnowledge(companyId, documentId, knowledgeData) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.KNOWLEDGE(companyId))
    .doc(documentId)
    .set({
      documentId,
      companyId,
      ...knowledgeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
}

export async function getKnowledge(companyId, documentId) {
  const doc = await db
    .collection(FIRESTORE_COLLECTIONS.KNOWLEDGE(companyId))
    .doc(documentId)
    .get();
  return doc.exists ? doc.data() : null;
}

export async function updateKnowledge(companyId, documentId, updates) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.KNOWLEDGE(companyId))
    .doc(documentId)
    .update({
      ...updates,
      updatedAt: new Date(),
    });
}

export async function listKnowledge(companyId, filters = {}) {
  let query = db.collection(FIRESTORE_COLLECTIONS.KNOWLEDGE(companyId));

  if (filters.category) {
    query = query.where("category", "==", filters.category);
  }
  if (filters.isPublished !== undefined) {
    query = query.where("isPublished", "==", filters.isPublished);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => doc.data());
}

// Agent operations
export async function createAgent(companyId, agentId, agentData) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.AGENTS(companyId))
    .doc(agentId)
    .set({
      agentId,
      companyId,
      ...agentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
}

export async function getAgent(companyId, agentId) {
  const doc = await db
    .collection(FIRESTORE_COLLECTIONS.AGENTS(companyId))
    .doc(agentId)
    .get();
  return doc.exists ? doc.data() : null;
}

export async function listAgents(companyId) {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.AGENTS(companyId))
    .where("status", "==", "active")
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

// Content operations
export async function createContent(companyId, contentId, contentData) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.CONTENT(companyId))
    .doc(contentId)
    .set({
      contentId,
      companyId,
      ...contentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
}

export async function getContent(companyId, contentId) {
  const doc = await db
    .collection(FIRESTORE_COLLECTIONS.CONTENT(companyId))
    .doc(contentId)
    .get();
  return doc.exists ? doc.data() : null;
}

export async function listContent(companyId, filters = {}) {
  let query = db.collection(FIRESTORE_COLLECTIONS.CONTENT(companyId));

  if (filters.type) {
    query = query.where("type", "==", filters.type);
  }
  if (filters.platform) {
    query = query.where("platform", "==", filters.platform);
  }
  if (filters.status) {
    query = query.where("status", "==", filters.status);
  }

  const snapshot = await query.orderBy("createdAt", "desc").limit(20).get();
  return snapshot.docs.map((doc) => doc.data());
}

export async function updateContent(companyId, contentId, updates) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.CONTENT(companyId))
    .doc(contentId)
    .update({
      ...updates,
      updatedAt: new Date(),
    });
}

// Template operations
export async function listTemplates(companyId) {
  const snapshot = await db.collection(FIRESTORE_COLLECTIONS.TEMPLATES(companyId)).get();
  return snapshot.docs.map((doc) => doc.data());
}

// Usage tracking
export async function logUsage(companyId, date, usageData) {
  const docRef = db.collection(FIRESTORE_COLLECTIONS.USAGE(companyId)).doc(date);
  const doc = await docRef.get();

  if (doc.exists) {
    const existing = doc.data();
    return await docRef.update({
      tokensUsed: (existing.tokensUsed || 0) + (usageData.tokensUsed || 0),
      cost: (existing.cost || 0) + (usageData.cost || 0),
      requestsCount: (existing.requestsCount || 0) + (usageData.requestsCount || 0),
      contentGenerated: (existing.contentGenerated || 0) + (usageData.contentGenerated || 0),
      apiCallsCount: (existing.apiCallsCount || 0) + (usageData.apiCallsCount || 0),
      updatedAt: new Date(),
    });
  }

  return await docRef.set({
    date,
    companyId,
    tokensUsed: usageData.tokensUsed || 0,
    cost: usageData.cost || 0,
    requestsCount: usageData.requestsCount || 0,
    contentGenerated: usageData.contentGenerated || 0,
    apiCallsCount: usageData.apiCallsCount || 0,
    createdAt: new Date(),
  });
}

export async function getUsageStats(companyId, startDate, endDate) {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.USAGE(companyId))
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

// Meta Ads token operations
export async function storeMetaToken(companyId, tokenData) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.META_TOKENS(companyId))
    .doc("token_metadata")
    .set({ metaToken: tokenData }, { merge: true });
}

export async function getMetaToken(companyId) {
  const doc = await db
    .collection(FIRESTORE_COLLECTIONS.META_TOKENS(companyId))
    .doc("token_metadata")
    .get();
  return doc.exists ? doc.data().metaToken : null;
}

export async function deleteMetaToken(companyId) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.META_TOKENS(companyId))
    .doc("token_metadata")
    .delete();
}

// Campaign operations (Sprint 2 skeleton)
export async function createCampaign(companyId, campaignId, campaignData) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.CAMPAIGNS(companyId))
    .doc(campaignId)
    .set({
      campaignId,
      companyId,
      ...campaignData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
}

export async function getCampaign(companyId, campaignId) {
  const doc = await db
    .collection(FIRESTORE_COLLECTIONS.CAMPAIGNS(companyId))
    .doc(campaignId)
    .get();
  return doc.exists ? doc.data() : null;
}

export async function listCampaigns(companyId) {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.CAMPAIGNS(companyId))
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

export async function updateCampaign(companyId, campaignId, updates) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.CAMPAIGNS(companyId))
    .doc(campaignId)
    .update({
      ...updates,
      updatedAt: new Date(),
    });
}

// Daily performance snapshots (Sprint 4)
export async function saveDailyPerformance(companyId, campaignId, date, data) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.DAILY_PERFORMANCE(companyId, campaignId))
    .doc(date)
    .set({ ...data, updatedAt: new Date() }, { merge: true });
}

export async function getDailyPerformance(companyId, campaignId, date) {
  const doc = await db
    .collection(FIRESTORE_COLLECTIONS.DAILY_PERFORMANCE(companyId, campaignId))
    .doc(date)
    .get();
  return doc.exists ? doc.data() : null;
}

// Returns oldest-first, capped at `limitDays` most recent days.
export async function listPerformanceHistory(companyId, campaignId, limitDays = 30) {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.DAILY_PERFORMANCE(companyId, campaignId))
    .orderBy("date", "desc")
    .limit(limitDays)
    .get();
  return snapshot.docs.map((doc) => doc.data()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

// Optimization recommendations (Sprint 4)
export async function createRecommendation(companyId, campaignId, recommendationId, data) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.RECOMMENDATIONS(companyId, campaignId))
    .doc(recommendationId)
    .set({ recommendationId, campaignId, ...data });
}

export async function getRecommendation(companyId, campaignId, recommendationId) {
  const doc = await db
    .collection(FIRESTORE_COLLECTIONS.RECOMMENDATIONS(companyId, campaignId))
    .doc(recommendationId)
    .get();
  return doc.exists ? doc.data() : null;
}

// Sorted by priority (desc) in-memory rather than via Firestore orderBy, so
// filtering by status never requires a composite index.
export async function listRecommendations(companyId, campaignId, filters = {}) {
  let query = db.collection(FIRESTORE_COLLECTIONS.RECOMMENDATIONS(companyId, campaignId));
  if (filters.status) {
    query = query.where("status", "==", filters.status);
  }
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data()).sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

export async function updateRecommendation(companyId, campaignId, recommendationId, updates) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.RECOMMENDATIONS(companyId, campaignId))
    .doc(recommendationId)
    .update(updates);
}

// Cross-company helpers for the daily performance monitoring job (Sprint 4)
export async function listCompanies() {
  const snapshot = await db.collection(FIRESTORE_COLLECTIONS.COMPANIES).get();
  return snapshot.docs.map((doc) => doc.data());
}

export async function listActiveCampaignsWithMeta(companyId) {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.CAMPAIGNS(companyId))
    .where("status", "==", "ACTIVE")
    .get();
  return snapshot.docs.map((doc) => doc.data()).filter((c) => c.metaCampaignId);
}

// Delete Knowledge document
export async function deleteKnowledge(companyId, documentId) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.KNOWLEDGE(companyId))
    .doc(documentId)
    .delete();
}

// Delete Content document
export async function deleteContent(companyId, contentId) {
  return await db
    .collection(FIRESTORE_COLLECTIONS.CONTENT(companyId))
    .doc(contentId)
    .delete();
}
