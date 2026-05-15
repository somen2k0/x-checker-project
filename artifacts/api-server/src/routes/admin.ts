import { Router } from "express";
import { getStats } from "../lib/request-stats";

const router = Router();

function checkAuth(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const provided = req.headers["x-admin-password"];
  return provided === adminPassword;
}

router.get("/admin/status", (_req, res) => {
  res.json({ adminEnabled: !!process.env.ADMIN_PASSWORD });
});

router.get("/admin/stats", (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin panel disabled." });
    return;
  }
  if (!checkAuth(req)) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  res.json(getStats());
});

export default router;
