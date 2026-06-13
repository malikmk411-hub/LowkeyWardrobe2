import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { productsTable, newsletterSubscribersTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "ahsan";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ahsanahsanahsan";
const JWT_SECRET = process.env.SESSION_SECRET || "aurum-secret-key";

function verifyAdmin(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = auth.slice(7);
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/admin/login", (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, username });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

router.get("/admin/stats", verifyAdmin, async (req, res) => {
  try {
    const [productCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
    const [subscriberCount] = await db.select({ count: sql<number>`count(*)::int` }).from(newsletterSubscribersTable);

    let orderCount = 0;
    let totalRevenue = 0;
    let recentOrders: any[] = [];
    try {
      const ordersResult = await db.execute(sql`SELECT COUNT(*)::int as count, COALESCE(SUM(total),0)::numeric as revenue FROM orders`);
      orderCount = (ordersResult.rows[0] as any)?.count || 0;
      totalRevenue = parseFloat((ordersResult.rows[0] as any)?.revenue || 0);
      const recentResult = await db.execute(sql`SELECT id, order_number, email, first_name, last_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`);
      recentOrders = recentResult.rows as any[];
    } catch {
      // orders table may be empty
    }

    res.json({
      products: productCount.count,
      subscribers: subscriberCount.count,
      orders: orderCount,
      revenue: totalRevenue,
      recentOrders,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/admin/products", verifyAdmin, async (req, res) => {
  try {
    const all = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
    res.json(all);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.put("/admin/products/:id", verifyAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, originalPrice, badge, description, stock, isActive } = req.body as any;
  try {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (originalPrice !== undefined) updates.originalPrice = originalPrice;
    if (badge !== undefined) updates.badge = badge;
    if (description !== undefined) updates.description = description;
    if (stock !== undefined) updates.stock = stock;
    if (isActive !== undefined) updates.isActive = isActive;
    updates.updatedAt = new Date();

    const [updated] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.get("/admin/newsletter", verifyAdmin, async (req, res) => {
  try {
    const subs = await db.select().from(newsletterSubscribersTable).orderBy(desc(newsletterSubscribersTable.createdAt));
    res.json(subs);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

router.get("/admin/orders", verifyAdmin, async (req, res) => {
  try {
    const result = await db.execute(sql`SELECT * FROM orders ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch {
    res.json([]);
  }
});

router.put("/admin/orders/:id/status", verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const { status } = req.body as { status: string };
  try {
    const result = await db.execute(sql`UPDATE orders SET status=${status}, updated_at=now() WHERE id=${parseInt(id)} RETURNING *`);
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
