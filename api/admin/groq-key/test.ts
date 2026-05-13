import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminPassword, getConfig } from "../../_lib/admin-db";

async function checkAuth(req: VercelRequest): Promise<boolean> {
  const pw = await getAdminPassword();
  if (!pw) return false;
  return req.headers["x-admin-password"] === pw;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed." }); return; }

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
}
