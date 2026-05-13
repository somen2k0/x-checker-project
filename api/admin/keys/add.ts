import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminPassword, getConfig, setConfig } from "../../_lib/admin-db";

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

  const { key } = req.body as { key?: string };
  if (!key || key.trim().length === 0) {
    res.status(400).json({ error: "key is required." });
    return;
  }

  const existing = await getDbKeys();
  const trimmed = key.trim();
  if (existing.includes(trimmed)) {
    res.status(409).json({ error: "Key already exists." });
    return;
  }

  const updated = [...existing, trimmed];
  await setConfig("rapidapi_keys", updated.join(","));
  res.json({ ok: true, count: updated.length });
}
