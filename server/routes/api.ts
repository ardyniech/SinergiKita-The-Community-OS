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

export const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

apiRouter.get("/recommendations", async (req: AuthRequest, res) => {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
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
      return res.json([
        { id: 1, title: "Optimasi Transparansi", description: "Gunakan fitur audit log untuk meningkatkan kepercayaan warga." },
        { id: 2, title: "Dana Darurat", description: "Sisihkan 10% dari iuran rutin untuk dana darurat kesehatan warga." },
        { id: 3, title: "Digitalisasi Pasar", description: "Dorong warga memajukan UMKM lokal melalui modul Pasar Warga." }
      ]);
    }

    res.status(500).json({ error: "Gagal mengambil rekomendasi" });
  }
});
