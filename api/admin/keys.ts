import type { VercelRequest, VercelResponse } from "@vercel/node";

const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";

const HARDCODED_KEYS = [
  "bbea6a9443mshdfc8d058f9d97efp1571dajsndb43135538fa",
  "894c8f0b44msh483bb59b42c084ap15db0bjsne64fe8ccbbd4",
  "e9b0fdba6bmsh970f41e51594567p178216jsn8158f0ea5df7",
];

function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return key.slice(0, 6) + "••••••••••••" + key.slice(-4);
}

function checkAuth(req: VercelRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return req.headers["x-admin-password"] === adminPassword;
}

async function testKey(key: string): Promise<{ status: string; httpStatus: number }> {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin panel disabled. Set ADMIN_PASSWORD environment variable to enable it." });
    return;
  }
  if (!checkAuth(req)) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  // GET — list configured keys (masked)
  if (req.method === "GET") {
    const envKeys = (process.env.RAPIDAPI_KEYS ?? "")
      .split(",").map((k) => k.trim()).filter((k) => k.length > 0);

    const keys = [
      ...envKeys.map((k, i) => ({ masked: maskKey(k), source: "env" as const, index: i })),
      ...HARDCODED_KEYS.map((k, i) => ({ masked: maskKey(k), source: "hardcoded" as const, index: i })),
    ];

    res.json({ keys, total: keys.length, envKeyCount: envKeys.length, hardcodedKeyCount: HARDCODED_KEYS.length, envVarSet: envKeys.length > 0 });
    return;
  }

  // POST — test a key
  if (req.method === "POST") {
    const body = req.body as { key?: string; action?: string; source?: string; index?: number };

    if (body.action === "test-server") {
      const envKeys = (process.env.RAPIDAPI_KEYS ?? "")
        .split(",").map((k) => k.trim()).filter((k) => k.length > 0);
      const pool = body.source === "env" ? envKeys : HARDCODED_KEYS;
      const key = typeof body.index === "number" ? pool[body.index] : undefined;
      if (!key) { res.status(404).json({ error: "Key not found." }); return; }
      res.json(await testKey(key));
      return;
    }

    if (body.key && typeof body.key === "string") {
      res.json(await testKey(body.key.trim()));
      return;
    }

    res.status(400).json({ error: "Provide { key } or { action: 'test-server', source, index }." });
    return;
  }

  res.status(405).json({ error: "Method not allowed." });
}
