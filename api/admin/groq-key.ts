import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminPassword, getConfig, setConfig, deleteConfig, maskKey } from "../_lib/admin-db";

async function checkAuth(req: VercelRequest): Promise<boolean> {
  const pw = await getAdminPassword();
  if (!pw) return false;
  return req.headers["x-admin-password"] === pw;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  if (req.method === "GET") {
    const key = await getConfig("groq_api_key");
    res.json({ set: !!key, masked: key ? maskKey(key) : null });
    return;
  }

  if (req.method === "PUT") {
    const { key } = req.body as { key?: string };
    if (!key || key.trim().length === 0) {
      res.status(400).json({ error: "key is required." });
      return;
    }
    await setConfig("groq_api_key", key.trim());
    res.json({ ok: true });
    return;
  }

  if (req.method === "DELETE") {
    await deleteConfig("groq_api_key");
    res.json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed." });
}
