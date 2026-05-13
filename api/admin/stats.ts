import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminPassword, getStats } from "../_lib/admin-db";

async function checkAuth(req: VercelRequest): Promise<boolean> {
  const pw = await getAdminPassword();
  if (!pw) return false;
  return req.headers["x-admin-password"] === pw;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed." }); return; }

  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  const raw = await getStats();
  res.json({ stats: raw });
}
