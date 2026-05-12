import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pickKey, rapidHeaders, RAPIDAPI_HOST } from "../_rapidapi-keys";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const { email, mid } = req.body as { email?: string; mid?: string };
  if (!email || !mid) { res.status(400).json({ error: "email and mid are required." }); return; }

  const key = pickKey();
  if (!key) { res.status(503).json({ error: "Gmailnator API not configured." }); return; }

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/getMessage`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email, mid }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) { res.status(502).json({ error: "Failed to fetch message." }); return; }

    const data = await response.json() as { content?: string; from?: string; subject?: string; date?: string };
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch message. Please try again." });
  }
}
