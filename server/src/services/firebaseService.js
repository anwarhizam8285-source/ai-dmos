import { initializeApp, getApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { cert } from "firebase-admin/app";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let authInstance = null;
let dbInstance = null;

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_CREDENTIALS_BASE64) {
    serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, "base64").toString("utf8")
    );
  } else {
    const keyPath = path.resolve(__dirname, "../../firebase-key.json");
    if (fs.existsSync(keyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    }
  }

  if (!serviceAccount) {
    console.warn("⚠️ No Firebase credentials found (set FIREBASE_CREDENTIALS_BASE64 or provide firebase-key.json)");
  } else {
    if (!getApps?.length) {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("✅ Firebase initialized successfully!");
    }

    authInstance = getAuth();
    dbInstance = getFirestore();
    console.log("✅ Auth and Firestore ready");
  }
} catch (err) {
  console.error("❌ Firebase error:", err.message);
}

export { authInstance as auth, dbInstance as db };
