import { Router } from "express";
import { getStats } from "../lib/request-stats";

const router = Router();

const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";

function checkAuth(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const provided = req.headers["x-admin-password"];
  return provided === adminPassword;
}

function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return key.slice(0, 6) + "••••••••••••" + key.slice(-4);
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

router.get("/admin/keys", (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin panel disabled. Set ADMIN_PASSWORD environment variable to enable it." });
    return;
  }
  if (!checkAuth(req)) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  const envKeys = (process.env.RAPIDAPI_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const keys = [
    ...envKeys.map((k, i) => ({ masked: maskKey(k), source: "env" as const, index: i })),
  ];

  res.json({
    keys,
    total: keys.length,
    envKeyCount: envKeys.length,
    hardcodedKeyCount: 0,
    envVarSet: envKeys.length > 0,
  });
});

router.post("/admin/keys/test-server", async (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin panel disabled." });
    return;
  }
  if (!checkAuth(req)) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  const { source, index } = req.body as { source?: string; index?: number };
  if (source == null || index == null) {
    res.status(400).json({ error: "source and index are required." });
    return;
  }

  const envKeys = (process.env.RAPIDAPI_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const pool = envKeys;
  const key = pool[index];
  if (!key) {
    res.status(404).json({ error: "Key not found at that index." });
    return;
  }

  try {
    const apiRes = await fetch(`https://${RAPIDAPI_HOST}/api/emails/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": key,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      body: JSON.stringify({ eType: [1, 2, 3, 4] }),
      signal: AbortSignal.timeout(10000),
    });

    if (apiRes.status === 429) { res.json({ status: "rate_limited", httpStatus: 429 }); return; }
    if (apiRes.status === 401 || apiRes.status === 403) { res.json({ status: "invalid", httpStatus: apiRes.status }); return; }
    if (!apiRes.ok) { res.json({ status: "error", httpStatus: apiRes.status }); return; }
    res.json({ status: "ok", httpStatus: apiRes.status });
  } catch {
    res.json({ status: "error", httpStatus: 0 });
  }
});

router.post("/admin/keys", async (req, res) => {
  if (!process.env.ADMIN_PASSWORD) { res.status(503).json({ error: "Admin panel disabled." }); return; }
  if (!checkAuth(req)) { res.status(401).json({ error: "Invalid password." }); return; }

  const body = req.body as { key?: string; action?: string; source?: string; index?: number };

  async function doTest(key: string) {
    try {
      const apiRes = await fetch(`https://${RAPIDAPI_HOST}/api/emails/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-rapidapi-key": key, "x-rapidapi-host": RAPIDAPI_HOST },
        body: JSON.stringify({ eType: [1, 2, 3, 4] }),
        signal: AbortSignal.timeout(10000),
      });
      if (apiRes.status === 429) return { status: "rate_limited", httpStatus: 429 };
      if (apiRes.status === 401 || apiRes.status === 403) return { status: "invalid", httpStatus: apiRes.status };
      if (!apiRes.ok) return { status: "error", httpStatus: apiRes.status };
      return { status: "ok", httpStatus: apiRes.status };
    } catch { return { status: "error", httpStatus: 0 }; }
  }

  if (body.action === "test-server") {
    const envKeys = (process.env.RAPIDAPI_KEYS ?? "").split(",").map((k) => k.trim()).filter((k) => k.length > 0);
    const pool = envKeys;
    const key = typeof body.index === "number" ? pool[body.index] : undefined;
    if (!key) { res.status(404).json({ error: "Key not found." }); return; }
    res.json(await doTest(key));
    return;
  }

  if (body.key && typeof body.key === "string") {
    res.json(await doTest(body.key.trim()));
    return;
  }

  res.status(400).json({ error: "Provide { key } or { action: 'test-server', source, index }." });
});

router.post("/admin/keys/test", async (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin panel disabled." });
    return;
  }
  if (!checkAuth(req)) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  const { key } = req.body as { key?: string };
  if (!key || typeof key !== "string" || key.trim().length === 0) {
    res.status(400).json({ error: "key is required." });
    return;
  }

  try {
    const apiRes = await fetch(`https://${RAPIDAPI_HOST}/api/emails/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": key.trim(),
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      body: JSON.stringify({ eType: [1, 2, 3, 4] }),
      signal: AbortSignal.timeout(10000),
    });

    if (apiRes.status === 429) {
      res.json({ status: "rate_limited", httpStatus: 429 });
      return;
    }
    if (apiRes.status === 401 || apiRes.status === 403) {
      res.json({ status: "invalid", httpStatus: apiRes.status });
      return;
    }
    if (!apiRes.ok) {
      res.json({ status: "error", httpStatus: apiRes.status });
      return;
    }
    res.json({ status: "ok", httpStatus: apiRes.status });
  } catch {
    res.json({ status: "error", httpStatus: 0 });
  }
});

export default router;
