import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

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
      const { data } = req.body;
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

      res.json({ summary: response.text });
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
      const { incidents, avgResponseTime } = req.body;
      
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

      res.json(JSON.parse(response.text || '{"tips":[]}'));
    } catch (error: any) {
      console.error("Smart Tips Error Details:", error);
      
      // Always return fallback tips to ensure the UI stays functional
      res.json({ 
        tips: [
          { id: "1", title: "Monitor Titik Rawan", description: "Identifikasi area dengan laporan terbanyak untuk patroli lebih intensif.", type: "safety" },
          { id: "2", title: "Target Respon < 15m", description: "Upayakan respon awal di bawah 15 menit untuk meningkatkan kepercayaan warga.", type: "speed" },
          { id: "3", title: "Edukasi Keselamatan", description: "Gunakan Warta Warga untuk menyebarkan tips pencegahan insiden serupa.", type: "general" }
        ] 
      });
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
