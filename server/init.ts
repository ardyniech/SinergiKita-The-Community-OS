import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "../firebase-applet-config.json";

export const firebaseApp = admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

export const inMemoryInsightsCache = new Map<string, { summary: string; stats: any; createdAt: Date }>();
export const inMemorySmartTipsCache = new Map<string, { tips: any; createdAt: Date }>();
