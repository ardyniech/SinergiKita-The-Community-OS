import { db } from "../init";
import { parseFirestoreFields, restGetDocument } from "../firestore-helpers";
import firebaseConfig from "../../firebase-applet-config.json";
import { isSuperAdminEmail } from "./superadmin";

export async function getUserProfile(uid: string, email?: string, idToken?: string) {
  // 1. Try standard Firestore Admin SDK
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data();
    }
  } catch (err: any) {
    console.warn("Firestore Admin SDK getUserProfile failed (falling back to REST API/Auth tokens):", err.message || err);
  }

  // 2. Try Firestore REST API using the user's ID token (bypasses service account permission issues)
  if (idToken) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/users/${uid}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const docData: any = await response.json();
        if (docData && docData.fields) {
          console.log("Successfully fetched user profile via REST API fallback.");
          return parseFirestoreFields(docData.fields);
        }
      } else {
        console.warn(`Firestore REST API returned non-OK status: ${response.status}`);
      }
    } catch (restErr: any) {
      console.error("Firestore REST API fallback failed:", restErr.message || restErr);
    }
  }

  // 3. Last fallback: If Firestore is unreachable, we trust the verified email from the ID token for SuperAdmin access
  if (isSuperAdminEmail(email)) {
    return {
      role: 'superadmin',
      displayName: email?.split('@')[0] || 'Admin',
      tenantId: null, // Global access
      isApproved: true
    };
  }
  return null;
}
