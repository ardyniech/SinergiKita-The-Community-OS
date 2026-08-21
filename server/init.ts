import admin from "firebase-admin";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import firebaseConfig from "../firebase-applet-config.json";

let dbInstance: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (dbInstance) return dbInstance;
  const app = admin.apps.length 
    ? admin.app()
    : admin.initializeApp({
        projectId: firebaseConfig.projectId
      });
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  return dbInstance;
}

// Proxy wrapper for backward compatibility
export const db = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    const realDb = getAdminDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(realDb);
    }
    return value;
  }
});

export const inMemoryInsightsCache = new Map<string, { summary: string; stats: any; createdAt: Date }>();
export const inMemorySmartTipsCache = new Map<string, { tips: any; createdAt: Date }>();
