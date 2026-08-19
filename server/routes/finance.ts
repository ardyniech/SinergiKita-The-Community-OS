import express from 'express';
import { AuthRequest, requireAuth } from '../../src/middleware/auth';
import { db as pgDb } from '../../src/db/index';
import { finances, users } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUserProfile } from '../utils/user';
import { isSuperAdminEmail } from '../utils/superadmin';

export const financeRouter = express.Router();

financeRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    const profile = await getUserProfile(req.user.uid, req.user.email, idToken);
    
    const isSuper = profile?.role === 'superadmin' || isSuperAdminEmail(req.user.email);
    const tenantId = profile?.tenantId;

    let targetTenantId = tenantId;
    if (isSuper && req.query.tenantId) {
      targetTenantId = req.query.tenantId as string;
    }

    if (!isSuper && !targetTenantId) {
      return res.status(403).json({ error: "Tenant context required." });
    }

    let query = pgDb.select({
      id: finances.id,
      tenantId: finances.tenantId,
      type: finances.type,
      amount: finances.amount,
      description: finances.description,
      category: finances.category,
      date: finances.date,
      authorEmail: users.email,
      role: users.role,
    }).from(finances).leftJoin(users, eq(finances.userId, users.id));

    if (targetTenantId) {
      query = query.where(eq(finances.tenantId, targetTenantId)) as any;
    }

    const allFinances = await query.orderBy(desc(finances.date));
    res.json(allFinances);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Failed to fetch financial records." });
  }
});

financeRouter.post("/", requireAuth, express.json(), async (req: AuthRequest, res) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    const profile = await getUserProfile(req.user.uid, req.user.email, idToken);
    
    let userRecord = await pgDb.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
    if (userRecord.length === 0) {
      const inserted = await pgDb.insert(users).values({
        uid: req.user.uid,
        email: req.user.email || 'user@sinergikita.id',
        role: profile?.role || 'member'
      }).returning();
      userRecord = inserted;
    }
    
    const role = userRecord[0].role || profile?.role;
    const isSuper = role === 'superadmin' || isSuperAdminEmail(req.user.email);

    // Tenant ID security enforcement: Non-super users strictly use profile.tenantId
    let targetTenantId = profile?.tenantId;
    if (isSuper) {
      targetTenantId = req.body.tenantId || profile?.tenantId || 'global';
    }

    if (!isSuper && role !== 'admin' && role !== 'bendahara' && role !== 'ketua') {
      return res.status(403).json({ error: "Only admin/bendahara/ketua can add records" });
    }

    if (!targetTenantId) {
      return res.status(400).json({ error: "Tenant ID required for financial records" });
    }
    
    const { type, amount, description, category } = req.body;
    
    const newRecord = await pgDb.insert(finances).values({
      tenantId: targetTenantId,
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
