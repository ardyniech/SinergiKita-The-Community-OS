import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import firebaseConfig from "./firebase-applet-config.json";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { apiRouter } from "./server/routes/api";
import { financeRouter } from "./server/routes/finance";
import { aiRouter } from "./server/routes/ai";
import { db as pgDb } from "./src/db/index.ts";
import { finances, users } from "./src/db/schema.ts";
import { desc, eq } from "drizzle-orm";


// Initialize Firebase Admin SDK
const firebaseApp = admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

// Initialize Firestore
// In AI Studio, we use the specific databaseId provisioned for the applet
console.log("Initializing Firestore with Project ID:", firebaseConfig.projectId, "and Database ID:", firebaseConfig.firestoreDatabaseId);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// In-Memory cache fallbacks if Firestore connectivity/IAM issues prevent server-side writes
const inMemoryInsightsCache = new Map<string, { summary: string; stats: any; createdAt: Date }>();
const inMemorySmartTipsCache = new Map<string, { tips: any; createdAt: Date }>();

// Helpers to parse Firestore REST API response fields
function parseFirestoreValue(valueObj: any): any {
  if (!valueObj) return undefined;
  if ('stringValue' in valueObj) return valueObj.stringValue;
  if ('booleanValue' in valueObj) return valueObj.booleanValue;
  if ('integerValue' in valueObj) return parseInt(valueObj.integerValue, 10);
  if ('doubleValue' in valueObj) return parseFloat(valueObj.doubleValue);
  if ('nullValue' in valueObj) return null;
  if ('arrayValue' in valueObj) {
    const values = valueObj.arrayValue.values || [];
    return values.map((v: any) => parseFirestoreValue(v));
  }
  if ('mapValue' in valueObj) {
    const mapFields = valueObj.mapValue.fields || {};
    const parsedMap: any = {};
    for (const key of Object.keys(mapFields)) {
      parsedMap[key] = parseFirestoreValue(mapFields[key]);
    }
    return parsedMap;
  }
  return valueObj;
}

function parseFirestoreFields(fieldsObj: any) {
  if (!fieldsObj) return {};
  const parsed: any = {};
  for (const key of Object.keys(fieldsObj)) {
    parsed[key] = parseFirestoreValue(fieldsObj[key]);
  }
  return parsed;
}

// Convert JS objects to Firestore REST API typed fields format
function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (val instanceof Date) return { stringValue: val.toISOString() };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(v => toFirestoreValue(v))
      }
    };
  }
  if (typeof val === 'object') {
    const fields: any = {};
    for (const key of Object.keys(val)) {
      fields[key] = toFirestoreValue(val[key]);
    }
    return {
      mapValue: { fields }
    };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj: any) {
  const fields: any = {};
  for (const key of Object.keys(obj)) {
    fields[key] = toFirestoreValue(obj[key]);
  }
  return { fields };
}

// REST API wrapper to GET a single Firestore document
async function restGetDocument(collectionName: string, docId: string, idToken: string) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/${collectionName}/${docId}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (response.ok) {
      const data: any = await response.json();
      if (data && data.fields) {
        return parseFirestoreFields(data.fields);
      }
    }
  } catch (err: any) {
    console.error(`REST GET failed for ${collectionName}/${docId}:`, err.message || err);
  }
  return null;
}

// REST API wrapper to PATCH (upsert/set) a single Firestore document
async function restSetDocument(collectionName: string, docId: string, data: any, idToken: string) {
  try {
    const fieldsPayload = toFirestoreFields(data);
    const queryParams = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/${collectionName}/${docId}?${queryParams}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fieldsPayload)
    });
    if (!response.ok) {
      const errMsg = await response.text();
      console.warn(`REST PATCH non-OK for ${collectionName}/${docId}: ${response.status} - ${errMsg}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`REST PATCH failed for ${collectionName}/${docId}:`, err.message || err);
    return false;
  }
}

// REST API wrapper to query community admins by tenantId
async function restQueryAdmins(tenantId: string, idToken: string): Promise<any[]> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents:runQuery`;
    const payload = {
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "tenantId" },
                  op: "EQUAL",
                  value: { stringValue: tenantId }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: "role" },
                  op: "IN",
                  value: {
                    arrayValue: {
                      values: [
                        { stringValue: "superadmin" },
                        { stringValue: "admin" },
                        { stringValue: "ketua" },
                        { stringValue: "bendahara" },
                        { stringValue: "sekretaris" },
                        { stringValue: "Admin" }
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const results: any = await response.json();
      if (Array.isArray(results)) {
        const admins: any[] = [];
        for (const item of results) {
          if (item.document && item.document.fields) {
            admins.push(parseFirestoreFields(item.document.fields));
          }
        }
        return admins;
      }
    } else {
      const errText = await response.text();
      console.warn(`runQuery non-OK status: ${response.status} - ${errText}`);
    }
  } catch (err: any) {
    console.error("Firestore REST API runQuery failed:", err.message || err);
  }
  return [];
}

// Helper to get user profile with fallback for identity verification if Firestore connection is unstable
async function getUserProfile(uid: string, email?: string, idToken?: string) {
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
  const superAdmins = ['ardy.syafii@gmail.com', 'ardy.syafii@sinergikita.id'];
  if (email && superAdmins.includes(email.toLowerCase())) {
    return {
      role: 'superadmin',
      displayName: email.split('@')[0],
      tenantId: null, // Global access
      isApproved: true
    };
  }
  return null;
}

// Zod schemas for input validation
const InsightsSchema = z.object({
  data: z.object({
    memberCount: z.number(),
    balance: z.number(), // balance can be negative or positive
    transactionCount: z.number(),
    announcementCount: z.number(),
    projectCount: z.number(),
    inventoryCount: z.number(),
  }),
});

const SmartTipsSchema = z.object({
  incidents: z.array(z.object({
    title: z.string().min(1),
    severity: z.string(),
    createdAt: z.string(),
  })),
  avgResponseTime: z.number(), // checks numeric type
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Authentication middleware: verifikasi Firebase ID token
  const verifyFirebaseToken: express.RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      (req as any).user = decodedToken;
      (req as any).idToken = idToken;
      next();
    } catch (error: any) {
      console.error("Firebase ID Token Verification Failed:", error);
      return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
    }
  };

  // Rate limiter to prevent API abuse (maximum 20 requests per minute per user based on verified Firebase UID)
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 20, // Limit each user/UID to 20 requests per minute
    validate: { ip: false },
    keyGenerator: (req) => {
      // Use verified Firebase uid from token, or fallback to IP/anonymous
      return (req as any).user?.uid || req.ip || "anonymous";
    },
    handler: (req, res) => {
      res.status(429).json({
        error: "Terlalu banyak permintaan (maksimal 20 request per menit per user). Silakan coba lagi nanti."
      });
    },
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });

  

  // Protect all /api/ai/* and /api/community/* routes, and /api/recommendations
  app.use("/api/recommendations", verifyFirebaseToken, apiLimiter);
  app.use("/api/ai/*", verifyFirebaseToken, apiLimiter);
  app.use("/api/community/*", verifyFirebaseToken, apiLimiter);
  app.use("/api", apiRouter);
  app.use("/api/finances", verifyFirebaseToken, apiLimiter, financeRouter);
  app.use("/api/ai", verifyFirebaseToken, apiLimiter, aiRouter);
  app.use("/api/community", verifyFirebaseToken, apiLimiter, aiRouter);

  app.post("/api/community/emergencies/notify", requireAuth, express.json(), async (req: AuthRequest, res) => {
    try {
      const { id, type, senderName, senderAddress, tenantId } = req.body;
      const idToken = (req as any).idToken;
      if (!tenantId || !type || !senderName) {
        return res.status(400).json({ error: "Missing required emergency fields" });
      }

      const tokens: string[] = [];
      try {
        const adminsSnapshot = await db.collection("users")
          .where("tenantId", "==", tenantId)
          .where("role", "in", ['superadmin', 'admin', 'ketua', 'bendahara', 'sekretaris', 'Admin'])
          .get();

        adminsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.fcmToken) {
            tokens.push(data.fcmToken);
          }
        });
      } catch (dbErr: any) {
        console.warn("Firestore Admin SDK failed to query emergency recipient admin tokens, trying REST API:", dbErr.message || dbErr);
        if (idToken) {
          const admins = await restQueryAdmins(tenantId, idToken);
          console.log(`Successfully fetched ${admins.length} admin records via REST API runQuery.`);
          for (const adminDoc of admins) {
            if (adminDoc.fcmToken) {
              tokens.push(adminDoc.fcmToken);
            }
          }
        }
      }

      console.log(`Sending emergency FCM push notifications to ${tokens.length} admins for tenant ${tenantId}`);

      if (tokens.length > 0) {
        const message = {
          notification: {
            title: `🚨 SOS DARURAT: ${type.toUpperCase()}`,
            body: `${senderName} membutuhkan bantuan di ${senderAddress || 'Lokasi Komunitas'}`
          },
          data: {
            emergencyId: id || '',
            type: type,
            senderName: senderName,
            senderAddress: senderAddress || ''
          },
          tokens: tokens
        };

        try {
          const response = await admin.messaging().sendEachForMulticast(message);
          console.log(`FCM Multicast delivery completed. Success: ${response.successCount}, Failure: ${response.failureCount}`);
          return res.json({ success: true, sentCount: tokens.length, successCount: response.successCount });
        } catch (fcmErr: any) {
          console.warn("FCM Dispatch failed, falling back to standard notification channels:", fcmErr);
          return res.json({ 
            success: true, 
            sentCount: tokens.length, 
            message: `FCM dispatch unavailable (${fcmErr.message}). Notifications routed via real-time channels.` 
          });
        }
      }

      return res.json({ success: true, sentCount: 0, message: "No registered FCM admin tokens found, notifications routed via standard real-time channels." });
    } catch (error: any) {
      console.error("FCM Emergency Notify Error Details:", error);
      return res.status(500).json({ error: `Failed to dispatch push notification: ${error.message}` });
    }
  });




  app.get("/api/me/role", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await pgDb.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
      if (userRecord.length === 0) {
        return res.json({ role: 'member' });
      }
      res.json({ role: userRecord[0].role });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role." });
    }
  });

  // Vite middleware for development

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
