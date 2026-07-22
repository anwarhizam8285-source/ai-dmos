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
  return await db
    .collection(FIRESTORE_COLLECTIONS.USAGE(companyId))
    .doc(date)
    .set({
      date,
      companyId,
      ...usageData,
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
