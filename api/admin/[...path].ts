import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getConfig, setConfig, deleteConfig,
  getStats, getRecentActivity,
  getAdminPassword, maskKey,
} from "../_lib/admin-db";

const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";

async function checkAuth(req: VercelRequest): Promise<boolean> {
  const pw = await getAdminPassword();
  if (!pw) return false;
  return req.headers["x-admin-password"] === pw;
}

async function getDbKeys(): Promise<string[]> {
  const stored = await getConfig("rapidapi_keys");
  if (!stored) return [];
  return stored.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
}

async function testRapidKey(key: string): Promise<{ status: string; httpStatus: number }> {
  try {
    const r = await fetch(`https://${RAPIDAPI_HOST}/api/emails/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-rapidapi-key": key, "x-rapidapi-host": RAPIDAPI_HOST },
      body: JSON.stringify({ eType: [1, 2, 3, 4] }),
      signal: AbortSignal.timeout(10000),
    });
    if (r.status === 429) return { status: "rate_limited", httpStatus: 429 };
    if (r.status === 401 || r.status === 403) return { status: "invalid", httpStatus: r.status };
    if (!r.ok) return { status: "error", httpStatus: r.status };
    return { status: "ok", httpStatus: r.status };
  } catch {
    return { status: "error", httpStatus: 0 };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  const segments = Array.isArray(req.query["path"]) ? req.query["path"] : [req.query["path"] ?? ""];
  const route = segments.join("/");
  const method = req.method ?? "GET";

  // ── /admin/status — no auth required ────────────────────────────────────────
  if (route === "status" && method === "GET") {
    const pw = await getAdminPassword();
    res.json({ adminEnabled: !!pw, needsSetup: !pw });
    return;
  }

  // ── /admin/setup — no auth required (only works when no password exists) ────
  if (route === "setup" && method === "POST") {
    const existing = await getAdminPassword();
    if (existing) { res.status(409).json({ error: "Admin password already set. Use /admin/password to change it." }); return; }
    const { password } = req.body as { password?: string };
    if (!password || password.trim().length < 4) { res.status(400).json({ error: "Password must be at least 4 characters." }); return; }
    await setConfig("admin_password", password.trim());
    res.json({ ok: true });
    return;
  }

  // ── All routes below require auth ────────────────────────────────────────────
  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  // ── /admin/password ──────────────────────────────────────────────────────────
  if (route === "password" && method === "POST") {
    const { newPassword } = req.body as { newPassword?: string };
    if (!newPassword || newPassword.trim().length < 4) { res.status(400).json({ error: "New password must be at least 4 characters." }); return; }
    await setConfig("admin_password", newPassword.trim());
    res.json({ ok: true });
    return;
  }

  // ── /admin/stats ─────────────────────────────────────────────────────────────
  if (route === "stats" && method === "GET") {
    const raw = await getStats();
    res.json({ stats: raw });
    return;
  }

  // ── /admin/activity ──────────────────────────────────────────────────────────
  if (route === "activity" && method === "GET") {
    const limit = Math.min(Number((req.query as Record<string, string>)["limit"] ?? 50), 200);
    const entries = await getRecentActivity(limit);
    res.json({ entries });
    return;
  }

  // ── /admin/groq-key ──────────────────────────────────────────────────────────
  if (route === "groq-key") {
    if (method === "GET") {
      const key = await getConfig("groq_api_key");
      res.json({ set: !!key, masked: key ? maskKey(key) : null });
      return;
    }
    if (method === "PUT") {
      const { key } = req.body as { key?: string };
      if (!key || key.trim().length === 0) { res.status(400).json({ error: "key is required." }); return; }
      await setConfig("groq_api_key", key.trim());
      res.json({ ok: true });
      return;
    }
    if (method === "DELETE") {
      await deleteConfig("groq_api_key");
      res.json({ ok: true });
      return;
    }
  }

  // ── /admin/groq-key/test ─────────────────────────────────────────────────────
  if (route === "groq-key/test" && method === "POST") {
    const key = await getConfig("groq_api_key");
    if (!key) { res.status(404).json({ error: "No Groq API key configured." }); return; }
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
    return;
  }

  // ── /admin/twitter-token ─────────────────────────────────────────────────────
  if (route === "twitter-token") {
    if (method === "GET") {
      const token = await getConfig("twitter_bearer_token");
      const envToken = process.env.TWITTER_BEARER_TOKEN;
      res.json({
        set: !!(token || envToken),
        source: token ? "db" : envToken ? "env" : "default",
        masked: token ? maskKey(token) : envToken ? maskKey(envToken) : "Using built-in default",
      });
      return;
    }
    if (method === "PUT") {
      const { token } = req.body as { token?: string };
      if (!token || token.trim().length === 0) { res.status(400).json({ error: "token is required." }); return; }
      await setConfig("twitter_bearer_token", token.trim());
      res.json({ ok: true });
      return;
    }
    if (method === "DELETE") {
      await deleteConfig("twitter_bearer_token");
      res.json({ ok: true });
      return;
    }
  }

  // ── /admin/web3forms-status ──────────────────────────────────────────────────
  if (route === "web3forms-status" && method === "GET") {
    const dbKey = await getConfig("web3forms_key");
    const envKey = process.env.WEB3FORMS_KEY;
    const active = dbKey ?? envKey ?? null;
    res.json({ source: dbKey ? "db" : envKey ? "env" : "none", masked: active ? maskKey(active) : null });
    return;
  }

  // ── /admin/web3forms-key ─────────────────────────────────────────────────────
  if (route === "web3forms-key") {
    if (method === "PUT") {
      const { key } = req.body as { key?: string };
      if (!key || key.trim().length === 0) { res.status(400).json({ error: "key is required." }); return; }
      await setConfig("web3forms_key", key.trim());
      res.json({ ok: true });
      return;
    }
    if (method === "DELETE") {
      await deleteConfig("web3forms_key");
      res.json({ ok: true });
      return;
    }
  }

  // ── /admin/keys ──────────────────────────────────────────────────────────────
  if (route === "keys") {
    if (method === "GET") {
      const dbKeys = await getDbKeys();
      const envKeys = (process.env.RAPIDAPI_KEYS ?? "").split(",").map((k) => k.trim()).filter((k) => k.length > 0);
      const keys = [
        ...dbKeys.map((k, i) => ({ masked: maskKey(k), source: "db" as const, index: i })),
        ...envKeys.map((k, i) => ({ masked: maskKey(k), source: "env" as const, index: i })),
      ];
      res.json({ keys, total: keys.length, dbKeyCount: dbKeys.length, envKeyCount: envKeys.length, envVarSet: envKeys.length > 0 });
      return;
    }
    if (method === "POST") {
      const body = req.body as { key?: string; action?: string; source?: string; index?: number };
      if (body.action === "test-server") {
        const dbKeys = await getDbKeys();
        const envKeys = (process.env.RAPIDAPI_KEYS ?? "").split(",").map((k) => k.trim()).filter((k) => k.length > 0);
        const pool = body.source === "env" ? envKeys : dbKeys;
        const key = typeof body.index === "number" ? pool[body.index] : undefined;
        if (!key) { res.status(404).json({ error: "Key not found." }); return; }
        res.json(await testRapidKey(key));
        return;
      }
      if (body.key && typeof body.key === "string") {
        res.json(await testRapidKey(body.key.trim()));
        return;
      }
      res.status(400).json({ error: "Provide { key } or { action: 'test-server', source, index }." });
      return;
    }
  }

  // ── /admin/keys/add ──────────────────────────────────────────────────────────
  if (route === "keys/add" && method === "POST") {
    const { key } = req.body as { key?: string };
    if (!key || key.trim().length === 0) { res.status(400).json({ error: "key is required." }); return; }
    const existing = await getDbKeys();
    const trimmed = key.trim();
    if (existing.includes(trimmed)) { res.status(409).json({ error: "Key already exists." }); return; }
    const updated = [...existing, trimmed];
    await setConfig("rapidapi_keys", updated.join(","));
    res.json({ ok: true, count: updated.length });
    return;
  }

  // ── /admin/keys/:index ───────────────────────────────────────────────────────
  if (segments[0] === "keys" && segments[1] && segments[1] !== "add" && method === "DELETE") {
    const { source } = req.query as { source?: string };
    const index = parseInt(segments[1]);
    if (isNaN(index)) { res.status(400).json({ error: "Invalid index." }); return; }
    if (source === "env") { res.status(400).json({ error: "Cannot delete environment variable keys from the admin panel. Remove them from your Vercel environment variables." }); return; }
    const existing = await getDbKeys();
    if (index < 0 || index >= existing.length) { res.status(404).json({ error: "Key not found." }); return; }
    const updated = existing.filter((_, i) => i !== index);
    if (updated.length === 0) { await deleteConfig("rapidapi_keys"); } else { await setConfig("rapidapi_keys", updated.join(",")); }
    res.json({ ok: true, count: updated.length });
    return;
  }

  res.status(404).json({ error: "Not found." });
}
