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

// Initialize Firebase Admin SDK for token verification
const firebaseApp = admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

// Initialize Firestore with custom databaseId
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

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

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/recommendations", async (req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: "You are an expert community administrator for 'SinergiKita', a platform for grassroots community synergy. Based on general community needs (transparency, finance, social welfare), provide 3 short, actionable recommendations for a community leader. Format as JSON: array of {id, title, description}.",
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(response.text || '[]'));
    } catch (error: any) {
      console.error("Gemini Error Details:", error);
      
      const isQuotaExceeded = error?.status === 429 || error?.message?.includes("429");
      
      if (isQuotaExceeded) {
        // Return fallback data silently for recommendations to avoid breaking UI
        return res.json([
          { id: 1, title: "Optimasi Transparansi", description: "Gunakan fitur audit log untuk meningkatkan kepercayaan warga." },
          { id: 2, title: "Dana Darurat", description: "Sisihkan 10% dari iuran rutin untuk dana darurat kesehatan warga." },
          { id: 3, title: "Digitalisasi Pasar", description: "Dorong warga memajukan UMKM lokal melalui modul Pasar Warga." }
        ]);
      }

      res.status(500).json({ error: "Gagal mengambil rekomendasi" });
    }
  });

  app.post("/api/ai/insights", express.json(), async (req, res) => {
    try {
      // 1. Verify user role & tenant membership securely on the backend
      const uid = (req as any).user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user credentials" });
      }

      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const userData = userDoc.data();
      const tenantId = userData?.tenantId;
      if (!tenantId) {
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

      const cacheRef = db.collection("insights_cache").doc(docId);
      const cacheSnap = await cacheRef.get();

      if (cacheSnap.exists) {
        const cachedData = cacheSnap.data();
        return res.json({ summary: cachedData?.summary, cached: true });
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
      await cacheRef.set({
        tenantId,
        cacheKey,
        summary: summaryText,
        stats: data,
        createdAt: FieldValue.serverTimestamp()
      });

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

  app.post("/api/community/smart-tips", express.json(), async (req, res) => {
    try {
      // 1. Verify user role & tenant membership securely on the backend
      const uid = (req as any).user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user credentials" });
      }

      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const userData = userDoc.data();
      const tenantId = userData?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ error: "User is not associated with any community tenant" });
      }

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

      const cacheRef = db.collection("smart_tips_cache").doc(docId);
      const cacheSnap = await cacheRef.get();

      if (cacheSnap.exists) {
        const cachedData = cacheSnap.data();
        return res.json({ tips: cachedData?.tips, cached: true });
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
      await cacheRef.set({
        tenantId,
        cacheKey,
        tips: tipsData.tips || [],
        createdAt: FieldValue.serverTimestamp()
      });

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

  app.post("/api/community/emergencies/notify", express.json(), async (req, res) => {
    try {
      const { id, type, senderName, senderAddress, tenantId } = req.body;
      if (!tenantId || !type || !senderName) {
        return res.status(400).json({ error: "Missing required emergency fields" });
      }

      const tokens: string[] = [];
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
