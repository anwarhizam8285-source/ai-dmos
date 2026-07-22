import admin from "firebase-admin";
import { FIRESTORE_COLLECTIONS } from "./server/src/utils/firestoreSchema.js";

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS || "{}");

if (Object.keys(serviceAccount).length > 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.log("Firebase credentials not set - using emulator");
}

const db = admin.firestore();

// Sample data for testing
const SAMPLE_COMPANY = {
  companyId: "company-001",
  name: "KIRA Senang",
  email: "team@kirasenang.my",
  website: "https://kirasenang.my",
  description: "Digital marketing for Malaysian SMEs",
  industry: "Marketing Tech",
  country: "Malaysia",
  state: "Selangor",
  employees: 5,
  plan: "pro",
  status: "active",
  maxUsers: 10,
  maxAgents: 5,
  createdBy: "user-001",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const SAMPLE_USER = {
  uid: "user-001",
  email: "anwar@kirasenang.my",
  displayName: "Anwar Hizam",
  photoUrl: null,
  role: "admin",
  tenantId: "company-001",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const SAMPLE_KNOWLEDGE = [
  {
    documentId: "knowledge-001",
    companyId: "company-001",
    title: "Brand Guidelines",
    content: "# KIRA Senang Brand Guidelines\n\n## Mission\n...",
    category: "brand",
    tags: ["brand", "guidelines", "core"],
    version: 1,
    createdBy: "user-001",
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    documentId: "knowledge-002",
    companyId: "company-001",
    title: "Product Features",
    content: "# KIRA Senang Features\n\n## AI Agents\n...",
    category: "products",
    tags: ["products", "features"],
    version: 1,
    createdBy: "user-001",
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function initializeDatabase() {
  try {
    console.log("🔄 Initializing Firestore database...");

    // Create company
    await db.collection("companies").doc(SAMPLE_COMPANY.companyId).set(SAMPLE_COMPANY);
    console.log("✅ Created sample company");

    // Create user
    await db.collection("users").doc(SAMPLE_USER.uid).set(SAMPLE_USER);
    console.log("✅ Created sample user");

    // Create knowledge documents
    for (const knowledge of SAMPLE_KNOWLEDGE) {
      await db
        .collection("companies")
        .doc(SAMPLE_COMPANY.companyId)
        .collection("knowledge")
        .doc(knowledge.documentId)
        .set(knowledge);
    }
    console.log("✅ Created sample knowledge documents");

    // Create default agents
    const agents = [
      {
        agentId: "agent-ceo",
        companyId: "company-001",
        name: "CEO Agent",
        type: "ceo",
        status: "active",
        config: { role: "orchestrator" },
        templates: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agentId: "agent-knowledge",
        companyId: "company-001",
        name: "Knowledge Agent",
        type: "knowledge",
        status: "active",
        config: { retrievalModel: "semantic" },
        templates: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        agentId: "agent-content",
        companyId: "company-001",
        name: "Content Agent",
        type: "content",
        status: "active",
        config: { model: "claude-sonnet-4.6" },
        templates: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const agent of agents) {
      await db
        .collection("companies")
        .doc(SAMPLE_COMPANY.companyId)
        .collection("agents")
        .doc(agent.agentId)
        .set(agent);
    }
    console.log("✅ Created default agents");

    console.log("✅ Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
