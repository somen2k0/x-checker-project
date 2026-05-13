import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminPassword, setConfig } from "../_lib/admin-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed." }); return; }

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
}
