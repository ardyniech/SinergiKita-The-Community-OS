import express from 'express';
import { GoogleGenAI } from "@google/genai";
import { AuthRequest } from "../../src/middleware/auth";
import { db, inMemoryInsightsCache, inMemorySmartTipsCache } from "../init";
import { restGetDocument, restSetDocument } from "../firestore-helpers";
import { getUserProfile } from "../utils/user";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const InsightsSchema = z.object({
  data: z.object({
    memberCount: z.number(),
    balance: z.number(),
    transactionCount: z.number(),
    announcementCount: z.number(),
    projectCount: z.number(),
    inventoryCount: z.number()
  })
});

const SmartTipsSchema = z.object({
  incidents: z.number().optional(),
  avgResponseTime: z.number().optional(),
  topic: z.string().optional()
});

export const aiRouter = express.Router();

aiRouter.post("/insights", express.json(), async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user credentials" });
    }

    const userData = await getUserProfile(uid, email, idToken);
    if (!userData) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const tenantId = userData?.tenantId;
    if (!tenantId && userData.role !== 'superadmin') {
      return res.status(400).json({ error: "User is not associated with any community tenant" });
    }

    const allowedRoles = ['superadmin', 'admin', 'ketua', 'bendahara', 'sekretaris'];
    if (!allowedRoles.includes(userData?.role || '')) {
      return res.status(403).json({ error: "Forbidden: Only community administrators can trigger insights" });
    }

    const parsedBody = InsightsSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
        error: "Format data input tidak valid", 
        details: parsedBody.error.issues 
      });
    }

    const { data } = parsedBody.data;

    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    const cacheKey = `${now.getFullYear()}-W${weekNumber}`;
    const docId = `${tenantId || 'global'}_${cacheKey}`;

    let cachedSummary: string | null = null;
    try {
      const cacheRef = db.collection("insights_cache").doc(docId);
      const cacheSnap = await cacheRef.get();
      if (cacheSnap.exists) {
        cachedSummary = cacheSnap.data()?.summary;
      }
    } catch (err: any) {
      if (idToken) {
        const doc = await restGetDocument("insights_cache", docId, idToken);
        if (doc) {
          cachedSummary = doc.summary;
        }
      }
      
      if (!cachedSummary) {
        const local = inMemoryInsightsCache.get(docId);
        if (local && (now.getTime() - local.createdAt.getTime()) < 24 * 60 * 60 * 1000) {
          cachedSummary = local.summary;
        }
      }
    }

    if (cachedSummary) {
      return res.json({ summary: cachedSummary, cached: true });
    }

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
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const summaryText = response.text || "Rangkuman tidak berhasil dihasilkan.";

    try {
      const cacheRef = db.collection("insights_cache").doc(docId);
      await cacheRef.set({
        tenantId: tenantId || 'global',
        cacheKey,
        summary: summaryText,
        stats: data,
        createdAt: FieldValue.serverTimestamp()
      });
    } catch (err: any) {
      if (idToken) {
        await restSetDocument("insights_cache", docId, {
          tenantId: tenantId || 'global',
          cacheKey,
          summary: summaryText,
          stats: data,
          createdAt: new Date()
        }, idToken);
      } else {
        inMemoryInsightsCache.set(docId, {
          summary: summaryText,
          stats: data,
          createdAt: now
        });
      }
    }

    res.json({ summary: summaryText, cached: false });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ error: "Gagal menghasilkan analisis AI: " + (error.message || 'Internal error') });
  }
});

aiRouter.post("/smart-tips", express.json(), async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userData = await getUserProfile(uid, email, idToken);
    const tenantId = userData?.tenantId || "global_system";

    const parsed = SmartTipsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Format data input tidak valid", details: parsed.error.issues });
    }

    const { incidents = 0, avgResponseTime = 0, topic } = parsed.data;

    const now = new Date();
    const cacheKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const docId = `${tenantId}_${cacheKey}`;

    let cachedTips: any = null;
    try {
      const snap = await db.collection("smart_tips_cache").doc(docId).get();
      if (snap.exists) cachedTips = snap.data()?.tips;
    } catch (e) {
      if (idToken) {
        const doc = await restGetDocument("smart_tips_cache", docId, idToken);
        if (doc) cachedTips = doc.tips;
      }
    }

    if (cachedTips) {
      return res.json({ tips: cachedTips, cached: true });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Berikan 3-4 tips praktis (Smart Tips) untuk pengurus komunitas dalam bahasa Indonesia mengenai penanganan insiden (insiden: ${incidents}, waktu tanggap: ${avgResponseTime} menit, topik: ${topic || 'umum'}). Format sebagai JSON array of objects dengan struktur: [{title, description, priority}].`,
      config: { responseMimeType: "application/json" }
    });

    const tips = JSON.parse(response.text || '[]');

    try {
      await db.collection("smart_tips_cache").doc(docId).set({ tenantId, tips, createdAt: FieldValue.serverTimestamp() });
    } catch (e) {
      if (idToken) {
        await restSetDocument("smart_tips_cache", docId, { tenantId, tips, createdAt: new Date() }, idToken);
      }
    }

    res.json({ tips, cached: false });
  } catch (error: any) {
    console.error("Smart Tips Error:", error);
    res.json({ 
      tips: [
        { title: "Respon Cepat Darurat", description: "Pastikan petugas siaga 24 jam merespon tombol SOS dalam waktu < 5 menit.", priority: "high" },
        { title: "Patroli Warga Rutin", description: "Jadwalkan ronda malam berkala untuk menekan potensi gangguan keamanan.", priority: "medium" }
      ],
      cached: false 
    });
  }
});
