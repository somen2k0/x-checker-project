import { Router } from "express";
import { recordPageView, getAnalytics } from "../lib/analytics";

const router = Router();

function checkAuth(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return req.headers["x-admin-password"] === adminPassword;
}

/** Public — called by the frontend on every route change. */
router.post("/track", (req, res) => {
  const { path } = req.body as { path?: unknown };
  if (typeof path !== "string" || !path.startsWith("/")) {
    res.status(400).json({ error: "path must be a string starting with /" });
    return;
  }
  recordPageView(path.slice(0, 200));
  res.json({ ok: true });
});

/** Protected — admin analytics summary. */
router.get("/admin/analytics", (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin panel disabled." });
    return;
  }
  if (!checkAuth(req)) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  res.json(getAnalytics());
});

export default router;
