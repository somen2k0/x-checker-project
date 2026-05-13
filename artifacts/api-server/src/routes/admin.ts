import { Router } from "express";
import { getConfig, setConfig, deleteConfig } from "../lib/config-db";

const router = Router();

const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";

// ── Auth helpers ─────────────────────────────────────────────────────────────

async function getAdminPassword(): Promise<string | null> {
  const dbPw = await getConfig("admin_password");
  return dbPw ?? process.env.ADMIN_PASSWORD ?? null;
}

async function checkAuth(
  req: { headers: Record<string, string | string[] | undefined> },
): Promise<boolean> {
  const adminPassword = await getAdminPassword();
  if (!adminPassword) return false;
  const provided = req.headers["x-admin-password"];
  return provided === adminPassword;
}

function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return key.slice(0, 6) + "••••••••••••" + key.slice(-4);
}

// ── Status / bootstrap ───────────────────────────────────────────────────────

router.get("/admin/status", async (_req, res) => {
  const pw = await getAdminPassword();
  res.json({ adminEnabled: !!pw, needsSetup: !pw });
});

// First-time setup: set admin password when none exists
router.post("/admin/setup", async (req, res) => {
  const existing = await getAdminPassword();
  if (existing) {
    res.status(409).json({ error: "Admin password already set. Use /admin/password to change it." });
    return;
  }
  const { password } = req.body as { password?: string };
  if (!password || password.trim().length < 4) {
    res.status(400).json({ error: "Password must be at least 4 characters." });
    return;
  }
  await setConfig("admin_password", password.trim());
  res.json({ ok: true });
});

// ── Change admin password ────────────────────────────────────────────────────

router.post("/admin/password", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const { newPassword } = req.body as { newPassword?: string };
  if (!newPassword || newPassword.trim().length < 4) {
    res.status(400).json({ error: "New password must be at least 4 characters." });
    return;
  }
  await setConfig("admin_password", newPassword.trim());
  res.json({ ok: true });
});

// ── RapidAPI key management ──────────────────────────────────────────────────

async function getRapidApiKeysFromDb(): Promise<string[]> {
  const stored = await getConfig("rapidapi_keys");
  if (!stored) return [];
  return stored.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
}

router.get("/admin/keys", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const dbKeys = await getRapidApiKeysFromDb();
  const envKeys = (process.env.RAPIDAPI_KEYS ?? "")
    .split(",").map((k) => k.trim()).filter((k) => k.length > 0);

  const keys = [
    ...dbKeys.map((k, i) => ({ masked: maskKey(k), source: "db" as const, index: i })),
    ...envKeys.map((k, i) => ({ masked: maskKey(k), source: "env" as const, index: i })),
  ];

  res.json({
    keys,
    total: keys.length,
    dbKeyCount: dbKeys.length,
    envKeyCount: envKeys.length,
    envVarSet: envKeys.length > 0,
  });
});

router.post("/admin/keys/add", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const { key } = req.body as { key?: string };
  if (!key || key.trim().length === 0) {
    res.status(400).json({ error: "key is required." });
    return;
  }
  const existing = await getRapidApiKeysFromDb();
  const trimmed = key.trim();
  if (existing.includes(trimmed)) {
    res.status(409).json({ error: "Key already exists." });
    return;
  }
  const updated = [...existing, trimmed];
  await setConfig("rapidapi_keys", updated.join(","));
  res.json({ ok: true, count: updated.length });
});

router.delete("/admin/keys/:index", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const { source } = req.query as { source?: string };
  const index = parseInt(req.params.index ?? "");
  if (isNaN(index)) {
    res.status(400).json({ error: "Invalid index." });
    return;
  }
  if (source === "env") {
    res.status(400).json({ error: "Cannot delete environment variable keys from the admin panel. Remove them from the Replit Secrets panel." });
    return;
  }
  const existing = await getRapidApiKeysFromDb();
  if (index < 0 || index >= existing.length) {
    res.status(404).json({ error: "Key not found." });
    return;
  }
  const updated = existing.filter((_, i) => i !== index);
  if (updated.length === 0) {
    await deleteConfig("rapidapi_keys");
  } else {
    await setConfig("rapidapi_keys", updated.join(","));
  }
  res.json({ ok: true, count: updated.length });
});

// ── RapidAPI key testing ──────────────────────────────────────────────────────

async function testRapidApiKey(key: string): Promise<{ status: string; httpStatus: number }> {
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
    if (apiRes.status === 429) return { status: "rate_limited", httpStatus: 429 };
    if (apiRes.status === 401 || apiRes.status === 403) return { status: "invalid", httpStatus: apiRes.status };
    if (!apiRes.ok) return { status: "error", httpStatus: apiRes.status };
    return { status: "ok", httpStatus: apiRes.status };
  } catch {
    return { status: "error", httpStatus: 0 };
  }
}

router.post("/admin/keys", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const body = req.body as { key?: string; action?: string; source?: string; index?: number };

  if (body.action === "test-server") {
    const dbKeys = await getRapidApiKeysFromDb();
    const envKeys = (process.env.RAPIDAPI_KEYS ?? "").split(",").map((k) => k.trim()).filter((k) => k.length > 0);
    const pool = body.source === "env" ? envKeys : dbKeys;
    const key = typeof body.index === "number" ? pool[body.index] : undefined;
    if (!key) { res.status(404).json({ error: "Key not found." }); return; }
    res.json(await testRapidApiKey(key));
    return;
  }

  if (body.key && typeof body.key === "string") {
    res.json(await testRapidApiKey(body.key.trim()));
    return;
  }

  res.status(400).json({ error: "Provide { key } or { action: 'test-server', source, index }." });
});

// ── Groq API key ─────────────────────────────────────────────────────────────

router.get("/admin/groq-key", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const key = await getConfig("groq_api_key");
  res.json({ set: !!key, masked: key ? maskKey(key) : null });
});

router.put("/admin/groq-key", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const { key } = req.body as { key?: string };
  if (!key || key.trim().length === 0) {
    res.status(400).json({ error: "key is required." });
    return;
  }
  await setConfig("groq_api_key", key.trim());
  res.json({ ok: true });
});

router.delete("/admin/groq-key", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  await deleteConfig("groq_api_key");
  res.json({ ok: true });
});

router.post("/admin/groq-key/test", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const key = await getConfig("groq_api_key");
  if (!key) {
    res.status(404).json({ error: "No Groq API key configured." });
    return;
  }
  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (r.status === 401) { res.json({ status: "invalid", httpStatus: 401 }); return; }
    if (r.status === 429) { res.json({ status: "rate_limited", httpStatus: 429 }); return; }
    if (!r.ok) { res.json({ status: "error", httpStatus: r.status }); return; }
    res.json({ status: "ok", httpStatus: 200 });
  } catch {
    res.json({ status: "error", httpStatus: 0 });
  }
});

// ── Twitter Bearer Token ──────────────────────────────────────────────────────

router.get("/admin/twitter-token", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const token = await getConfig("twitter_bearer_token");
  const envToken = process.env.TWITTER_BEARER_TOKEN;
  res.json({
    set: !!(token || envToken),
    source: token ? "db" : envToken ? "env" : "default",
    masked: token ? maskKey(token) : envToken ? maskKey(envToken) : "Using built-in default",
  });
});

router.put("/admin/twitter-token", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  const { token } = req.body as { token?: string };
  if (!token || token.trim().length === 0) {
    res.status(400).json({ error: "token is required." });
    return;
  }
  await setConfig("twitter_bearer_token", token.trim());
  res.json({ ok: true });
});

router.delete("/admin/twitter-token", async (req, res) => {
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }
  await deleteConfig("twitter_bearer_token");
  res.json({ ok: true });
});

export default router;
