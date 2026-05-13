import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminPassword } from "../_lib/admin-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed." }); return; }

  const pw = await getAdminPassword();
  res.json({ adminEnabled: !!pw, needsSetup: !pw });
}
