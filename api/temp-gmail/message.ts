import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasKeys, fetchWithRotation, rapidHeaders, BASE_URL } from "../_lib/rapidapi";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const body = req.body as { email?: string; mid?: string } | undefined;
  const { email, mid } = body ?? {};

  if (!email || !mid) {
    res.status(400).json({ error: "email and mid are required." });
    return;
  }

  if (!hasKeys()) {
    res.status(503).json({ error: "Gmailnator API not configured." });
    return;
  }

  const { res: apiRes, exhausted } = await fetchWithRotation((key) =>
    fetch(`${BASE_URL}/getMessage`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email, mid }),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (!apiRes.ok) {
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "Rate-limited across all keys. Please wait a moment." });
      return;
    }
    res.status(502).json({ error: "Failed to fetch message." });
    return;
  }

  const data = await apiRes.json() as { content?: string; from?: string; subject?: string; date?: string };
  res.status(200).json(data);
}
