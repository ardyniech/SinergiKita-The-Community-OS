const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const imports = `import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db as pgDb } from "./src/db/index.ts";
import { finances, users } from "./src/db/schema.ts";
import { desc, eq, sum } from "drizzle-orm";
`;

content = content.replace('import firebaseConfig from "./firebase-applet-config.json";', 'import firebaseConfig from "./firebase-applet-config.json";\n' + imports);

const apiRoutes = `
  // POSTGRESQL API ROUTES FOR FINANCES
  app.get("/api/finances", requireAuth, async (req, res) => {
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

  app.post("/api/finances", requireAuth, async (req, res) => {
    try {
      const userRecord = await pgDb.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
      if (userRecord.length === 0) {
        return res.status(401).json({ error: "User not found in Postgres" });
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

  // Vite middleware for development
`;

content = content.replace('  // Vite middleware for development', apiRoutes);
fs.writeFileSync('server.ts', content);
