import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth } from "./src/middleware/auth.ts";
import { apiRouter } from "./server/routes/api";
import { financeRouter } from "./server/routes/finance";
import { aiRouter } from "./server/routes/ai";
import { reportsRouter } from "./server/routes/reports";
import { apiLimiter } from "./server/middleware/limiter";
import { notifyEmergencyAdmins } from "./server/controllers/emergencyController";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Apply auth & rate limiting middleware to API routes
  app.use("/api/finances", requireAuth, apiLimiter, financeRouter);
  app.use("/api/ai", requireAuth, apiLimiter, aiRouter);
  app.use("/api/reports", requireAuth, apiLimiter, reportsRouter);
  app.use("/api/community/emergencies/notify", requireAuth, apiLimiter, notifyEmergencyAdmins);
  app.use("/api", apiRouter);

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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
