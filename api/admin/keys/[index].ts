import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminPassword, getConfig, setConfig, deleteConfig } from "../../_lib/admin-db";

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
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "DELETE") { res.status(405).json({ error: "Method not allowed." }); return; }

  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  const { source } = req.query as { source?: string };
  const index = parseInt((req.query as Record<string, string>)["index"] ?? "");
  if (isNaN(index)) {
    res.status(400).json({ error: "Invalid index." });
    return;
  }

  if (source === "env") {
    res.status(400).json({ error: "Cannot delete environment variable keys from the admin panel. Remove them from your Vercel environment variables." });
    return;
  }

  const existing = await getDbKeys();
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
}
