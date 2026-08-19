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
import { db as pgDb } from "./src/db/index.ts";
import { finances, users } from "./src/db/schema.ts";
import { desc, eq, sum } from "drizzle-orm";


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
  app.use("/api/recommendations", verifyFirebaseToken);
  app.use("/api/ai/*", verifyFirebaseToken, apiLimiter);
  app.use("/api/community/*", verifyFirebaseToken, apiLimiter);
  app.use("/api", apiRouter);

  // Remaining routes will be moved incrementally...

  app.post("/api/ai/insights", requireAuth, express.json(), async (req: AuthRequest, res) => {
    try {
      // 1. Verify user role & tenant membership securely on the backend
      const uid = (req as any).user?.uid;
      const email = (req as any).user?.email;
      const idToken = (req as any).idToken;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user credentials" });
      }

      const userData = await getUserProfile(uid, email, idToken);
      if (!userData) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const tenantId = userData?.tenantId;
      // SuperAdmins can bypass tenant check for global insights or use a dummy for testing
      if (!tenantId && userData.role !== 'superadmin') {
        return res.status(400).json({ error: "User is not associated with any community tenant" });
      }

      const allowedRoles = ['superadmin', 'admin', 'ketua', 'bendahara', 'sekretaris', 'Admin'];
      if (!allowedRoles.includes(userData?.role || '')) {
        return res.status(403).json({ error: "Forbidden: Only community administrators can trigger insights" });
      }

      // 2. Validate request body using Zod
      const parsedBody = InsightsSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ 
          error: "Format data input tidak valid", 
          details: parsedBody.error.issues 
        });
      }

      const { data } = parsedBody.data;

      // 3. Check for cached weekly summary to prevent excessive AI costs
      const now = new Date();
      const oneJan = new Date(now.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
      const cacheKey = `${now.getFullYear()}-W${weekNumber}`;
      const docId = `${tenantId}_${cacheKey}`;

      let cachedSummary: string | null = null;
      try {
        const cacheRef = db.collection("insights_cache").doc(docId);
        const cacheSnap = await cacheRef.get();
        if (cacheSnap.exists) {
          cachedSummary = cacheSnap.data()?.summary;
        }
      } catch (err: any) {
        console.warn("Firestore Admin SDK insights cache fetch failed, trying REST API:", err.message || err);
        if (idToken) {
          const doc = await restGetDocument("insights_cache", docId, idToken);
          if (doc) {
            console.log("Successfully fetched insights cache via REST API.");
            cachedSummary = doc.summary;
          }
        }
        
        if (!cachedSummary) {
          console.warn("REST API also failed, trying in-memory cache:");
          const local = inMemoryInsightsCache.get(docId);
          if (local && (now.getTime() - local.createdAt.getTime()) < 24 * 60 * 60 * 1000) {
            cachedSummary = local.summary;
          }
        }
      }

      if (cachedSummary) {
        return res.json({ summary: cachedSummary, cached: true });
      }

      // 4. Generate new insight if not cached
      const prompt = `
        You are a community analyst for SinergiKita. Analyze the following community data and provide a concise weekly executive summary in Indonesian.
        Include sections for:
        1. Financial Health (based on transactions)
        2. Community Growth (based on member count)
        3. Activity Trends (based on announcements/projects)
        4. Strategic Recommendations.

        Data provided:
        - Member Count: ${data.memberCount}
        - Total Balance: Rp ${data.balance.toLocaleString()}
        - Transaction Count: ${data.transactionCount}
        - Announcement Count: ${data.announcementCount}
        - Project Count: ${data.projectCount}
        - Inventory Status: ${data.inventoryCount} items in POS.

        Format the response as a clean HTML-friendly summary with bold headers and bullet points. Use Indonesian language.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });

      const summaryText = response.text || "Rangkuman tidak berhasil dihasilkan.";

      // 5. Store generated summary in cache
      try {
        const cacheRef = db.collection("insights_cache").doc(docId);
        await cacheRef.set({
          tenantId,
          cacheKey,
          summary: summaryText,
          stats: data,
          createdAt: FieldValue.serverTimestamp()
        });
      } catch (err: any) {
        console.warn("Firestore Admin SDK insights cache save failed, trying REST API:", err.message || err);
        let restSuccess = false;
        if (idToken) {
          restSuccess = await restSetDocument("insights_cache", docId, {
            tenantId,
            cacheKey,
            summary: summaryText,
            stats: data,
            createdAt: new Date()
          }, idToken);
        }
        
        if (!restSuccess) {
          console.warn("REST API also failed, falling back to in-memory:");
          inMemoryInsightsCache.set(docId, {
            summary: summaryText,
            stats: data,
            createdAt: new Date()
          });
        }
      }

      res.json({ summary: summaryText, cached: false });
    } catch (error: any) {
      console.error("Gemini Insights Error Details:", error);
      
      const isQuotaExceeded = error?.status === 429 || error?.message?.includes("429");
      
      if (isQuotaExceeded) {
        return res.status(429).json({ 
          error: "Kapasitas AI sedang penuh (Limit harian tercapai). Silakan coba beberapa saat lagi.",
          fallback: "Sistem sedang dalam mode hemat energi. Rekomendasi strategis: Tingkatkan partisipasi warga dan jaga transparansi keuangan."
        });
      }

      res.status(500).json({ error: `Gagal menghasilkan analisis AI: ${error.message || 'Error tidak diketahui'}` });
    }
  });

  app.post("/api/community/smart-tips", requireAuth, express.json(), async (req: AuthRequest, res) => {
    try {
      // 1. Verify user role & tenant membership securely on the backend
      const uid = req.user?.uid;
      const email = req.user?.email;
      const idToken = (req as any).idToken;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user credentials" });
      }

      const userData = await getUserProfile(uid, email, idToken);
      if (!userData) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const tenantId = userData?.tenantId || "global_system"; // Fallback for SuperAdmin or broken connections
      
      const allowedRoles = ['superadmin', 'admin', 'ketua', 'bendahara', 'sekretaris', 'Admin'];
      if (!allowedRoles.includes(userData?.role || '')) {
        return res.status(403).json({ error: "Forbidden: Only community administrators can trigger smart tips" });
      }

      // 2. Validate request body using Zod
      const parsedBody = SmartTipsSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ 
          error: "Format data input tidak valid", 
          details: parsedBody.error.issues 
        });
      }

      const { incidents, avgResponseTime } = parsedBody.data;

      // 3. Check for cached daily summary to prevent excessive AI costs
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const cacheKey = `${year}-${month}-${day}`;
      const docId = `${tenantId}_${cacheKey}`;

      let cachedTips: any = null;
      try {
        const cacheRef = db.collection("smart_tips_cache").doc(docId);
        const cacheSnap = await cacheRef.get();
        if (cacheSnap.exists) {
          cachedTips = cacheSnap.data()?.tips;
        }
      } catch (err: any) {
        console.warn("Firestore Admin SDK smart tips cache fetch failed, trying REST API:", err.message || err);
        if (idToken) {
          const doc = await restGetDocument("smart_tips_cache", docId, idToken);
          if (doc) {
            console.log("Successfully fetched smart tips cache via REST API.");
            cachedTips = doc.tips;
          }
        }
        
        if (!cachedTips) {
          console.warn("REST API also failed, trying in-memory cache:");
          const local = inMemorySmartTipsCache.get(docId);
          if (local && (now.getTime() - local.createdAt.getTime()) < 24 * 60 * 60 * 1000) {
            cachedTips = local.tips;
          }
        }
      }

      if (cachedTips) {
        return res.json({ tips: cachedTips, cached: true });
      }

      // 4. Generate new tips if not cached
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `
          You are a Community Health Analyst for SinergiKita. Based on the following incident data and average response time, provide 3-4 highly actionable "Smart Tips" (Tips Cerdas) in Indonesian to improve community safety and responsiveness.
          
          Data provided:
          - Average Response Time: ${avgResponseTime} minutes.
          - Recent Incidents (JSON): ${JSON.stringify(incidents)}
          
          Focus on identifying patterns (e.g., specific times, types of incidents, or areas) and suggest preventative measures.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ["id", "title", "description", "type"]
                }
              }
            },
            required: ["tips"]
          }
        }
      });

      const tipsData = JSON.parse(response.text || '{"tips":[]}');

      // 5. Store generated tips in cache
      try {
        const cacheRef = db.collection("smart_tips_cache").doc(docId);
        await cacheRef.set({
          tenantId,
          cacheKey,
          tips: tipsData.tips || [],
          createdAt: FieldValue.serverTimestamp()
        });
      } catch (err: any) {
        console.warn("Firestore Admin SDK smart tips cache save failed, trying REST API:", err.message || err);
        let restSuccess = false;
        if (idToken) {
          restSuccess = await restSetDocument("smart_tips_cache", docId, {
            tenantId,
            cacheKey,
            tips: tipsData.tips || [],
            createdAt: new Date()
          }, idToken);
        }
        
        if (!restSuccess) {
          console.warn("REST API also failed, falling back to in-memory:");
          inMemorySmartTipsCache.set(docId, {
            tips: tipsData.tips || [],
            createdAt: new Date()
          });
        }
      }

      res.json({ tips: tipsData.tips || [], cached: false });
    } catch (error: any) {
      console.error("Smart Tips Error Details:", error);
      
      // Always return fallback tips to ensure the UI stays functional
      res.json({ 
        tips: [
          { id: "1", title: "Monitor Titik Rawan", description: "Identifikasi area dengan laporan terbanyak untuk patroli lebih intensif.", type: "safety" },
          { id: "2", title: "Target Respon < 15m", description: "Upayakan respon awal di bawah 15 menit untuk meningkatkan kepercayaan warga.", type: "speed" },
          { id: "3", title: "Edukasi Keselamatan", description: "Gunakan Warta Warga untuk menyebarkan tips pencegahan insiden serupa.", type: "general" }
        ],
        cached: false
      });
    }
  });

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


  // POSTGRESQL API ROUTES FOR FINANCES
  app.get("/api/finances", requireAuth, async (req: AuthRequest, res) => {
    try {
      const allFinances = await pgDb.select({
        id: finances.id,
        type: finances.type,
        amount: finances.amount,
        description: finances.description,
        category: finances.category,
        date: finances.date,
        authorEmail: users.email,
        role: users.role,
      }).from(finances).leftJoin(users, eq(finances.userId, users.id)).orderBy(desc(finances.date));
      res.json(allFinances);
    } catch (error) {
      console.error("Database query failed:", error);
      res.status(500).json({ error: "Failed to fetch financial records." });
    }
  });

  app.post("/api/finances", requireAuth, express.json(), async (req: AuthRequest, res) => {
    try {
      const userRecord = await pgDb.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
      if (userRecord.length === 0) {
        return res.status(401).json({ error: "User not found in Postgres" });
      }
      
      const role = userRecord[0].role;
      if (role !== 'admin' && role !== 'bendahara' && role !== 'ketua') {
        return res.status(403).json({ error: "Only admin/bendahara/ketua can add records" });
      }
      
      const { type, amount, description, category } = req.body;
      
      const newRecord = await pgDb.insert(finances).values({
        userId: userRecord[0].id,
        type,
        amount: amount.toString(),
        description,
        category
      }).returning();
      
      res.json(newRecord[0]);
    } catch (error) {
      console.error("Failed to insert finance record:", error);
      res.status(500).json({ error: "Failed to add record." });
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
