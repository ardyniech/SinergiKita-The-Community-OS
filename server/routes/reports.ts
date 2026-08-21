// OVER_LIMIT_JUSTIFIED: Ekstraksi logika integrasi Gemini dan validasi input ke dalam satu rute untuk kohesi security.
import express from 'express';
import { GoogleGenAI } from "@google/genai";
import { AuthRequest } from "../../src/middleware/auth";
import { db } from "../init";
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

export const reportsRouter = express.Router();

reportsRouter.post("/generate", express.json(), async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userData = await getUserProfile(uid, email, idToken);
    if (!userData) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const tenantId = userData?.tenantId;
    if (!tenantId && userData.role !== 'superadmin') {
      return res.status(400).json({ error: "No tenant context found" });
    }

    const allowedRoles = ['superadmin', 'admin', 'ketua', 'bendahara', 'sekretaris'];
    if (!allowedRoles.includes(userData.role || '')) {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const { period = "weekly" } = req.body;
    const queryTenant = userData.role === 'superadmin' ? (req.body.tenantId || tenantId) : tenantId;

    // Fetch raw data for the period
    const now = new Date();
    const startDate = new Date();
    if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    // Since we're in the admin SDK, we can query easily
    // Note: To simplify, we fetch some aggregated data. In a real system we'd aggregate first.
    let transactionsRef = db.collection('transactions');
    let fundingRef = db.collection('funding_projects');
    let alertsRef = db.collection('social_alerts');

    if (queryTenant && queryTenant !== 'global_system') {
      transactionsRef = transactionsRef.where('tenantId', '==', queryTenant) as any;
      fundingRef = fundingRef.where('tenantId', '==', queryTenant) as any;
    }

    // Basic fetches
    const txSnap = await transactionsRef.limit(100).get();
    let totalIncome = 0;
    let totalExpense = 0;
    txSnap.forEach(doc => {
      const data = doc.data();
      if (data.type === 'credit') totalIncome += data.amount || 0;
      if (data.type === 'debit') totalExpense += data.amount || 0;
    });

    const fundSnap = await fundingRef.limit(50).get();
    let totalFundTarget = 0;
    let totalFundCollected = 0;
    let fundedCount = 0;
    fundSnap.forEach(doc => {
      const data = doc.data();
      totalFundTarget += data.targetAmount || 0;
      totalFundCollected += data.collectedAmount || 0;
      if (data.status === 'funded' || data.status === 'completed') fundedCount++;
    });

    const alertsSnap = await alertsRef.limit(50).get();
    let highSeverity = 0;
    alertsSnap.forEach(doc => {
      const data = doc.data();
      if (data.severity === 'high') highSeverity++;
    });

    const prompt = `
      As SinergiKita's AI Data Analyst, generate a comprehensive ${period} report for the community administrators.
      
      Raw Data:
      - Period: ${period}
      - Total Income: Rp ${totalIncome.toLocaleString()}
      - Total Expense: Rp ${totalExpense.toLocaleString()}
      - Net Balance: Rp ${(totalIncome - totalExpense).toLocaleString()}
      - Funding Campaigns: ${fundSnap.size} active, ${fundedCount} fully funded.
      - Total Fund Target: Rp ${totalFundTarget.toLocaleString()}, Collected: Rp ${totalFundCollected.toLocaleString()}
      - Social/Emergency Alerts: ${alertsSnap.size} total, ${highSeverity} high severity.

      Requirements:
      1. Analyze the financial health (income vs expense).
      2. Evaluate funding success rates.
      3. Analyze social aid distribution / emergency alerts.
      4. Highlight key trends and potential risks.
      5. Provide actionable areas for improvement.
      
      Output the report in professional Indonesian. Use clear Markdown headings (H3), bullet points, and bold text for metrics. Do NOT wrap the entire response in a markdown block, just return the raw markdown text.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const reportContent = response.text;

    // Optionally save the report
    const reportRef = db.collection('ai_reports').doc();
    await reportRef.set({
      tenantId: queryTenant,
      period,
      content: reportContent,
      createdAt: FieldValue.serverTimestamp(),
      generatedBy: uid
    });

    res.json({ id: reportRef.id, content: reportContent });

  } catch (error: any) {
    console.error("Generate Report Error:", error);
    res.status(500).json({ error: error.message });
  }
});
