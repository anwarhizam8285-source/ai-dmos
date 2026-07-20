import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Skip Firebase init for now - will setup after Firebase project created
// For development, we'll just export stubs

let authInstance = null;
let dbInstance = null;

try {
  // Only initialize if Firebase credentials available
  if (process.env.FIREBASE_CREDENTIALS) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    authInstance = admin.auth();
    dbInstance = admin.firestore();
  } else {
    console.log("Firebase not configured - skipping initialization");
    // Stub implementations for development
    authInstance = {
      createUser: async () => ({ uid: "test-uid" }),
      getUserByEmail: async () => ({ uid: "test-uid", email: "test@test.com" }),
      getUser: async () => ({ uid: "test-uid", email: "test@test.com" }),
    };
  }
} catch (error) {
  console.warn("Firebase init warning:", error.message);
}

export const auth = authInstance;
export const db = dbInstance;
export default admin;
