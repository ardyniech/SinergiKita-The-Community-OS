
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

// Initialize Firebase Admin SDK without explicit projectId to use environment default
const firebaseApp = admin.initializeApp();

async function test() {
  const configs = [
    { name: "DatabaseId as ProjectId", projectId: firebaseConfig.firestoreDatabaseId, databaseId: "(default)" },
    { name: "DatabaseId as ProjectId and DatabaseId", projectId: firebaseConfig.firestoreDatabaseId, databaseId: firebaseConfig.firestoreDatabaseId }
  ];

  for (const config of configs) {
    try {
      console.log(`Testing ${config.name}`);
      const app = admin.initializeApp({ projectId: config.projectId }, config.name);
      const db = getFirestore(app, config.databaseId === "(default)" ? undefined : config.databaseId);
      const snap = await db.collection("users").limit(1).get();
      console.log(`✅ Success for ${config.name}! Found ${snap.size} users.`);
      return;
    } catch (err: any) {
      console.error(`❌ Failed for ${config.name}:`, err.message || err);
    }
  }
}

test();
