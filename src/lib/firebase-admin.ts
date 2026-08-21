import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let adminAuthInstance: Auth | null = null;

export function getAdminAuth(): Auth | null {
  if (adminAuthInstance) return adminAuthInstance;
  try {
    if (!getApps().length) {
      initializeApp({
        credential: applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
    }
    adminAuthInstance = getAuth();
    return adminAuthInstance;
  } catch (error) {
    console.warn('[FirebaseAdmin] Failed to initialize Firebase Admin Auth lazily:', error);
    return null;
  }
}

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const auth = getAdminAuth();
    if (!auth) {
      // In local dev without credentials, gracefully handle
      throw new Error('Firebase Admin Auth not initialized');
    }
    return auth.verifyIdToken(token);
  }
};
