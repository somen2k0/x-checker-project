import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pickKey, rapidHeaders, RAPIDAPI_HOST } from "../_rapidapi-keys";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const key = pickKey();
  if (!key) { res.status(503).json({ error: "Gmailnator API not configured. Please add your RapidAPI keys." }); return; }

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/generateEmail`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ prefixList: [], eType: [3] }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 429) { res.status(429).json({ error: "Rate limited. Try again in a moment." }); return; }
      res.status(502).json({ error: "Failed to generate email address." }); return;
    }

    const data = await response.json() as { email?: string };
    if (!data.email) { res.status(502).json({ error: "Invalid response from Gmailnator API." }); return; }
    res.json({ email: data.email });
  } catch {
    res.status(500).json({ error: "Failed to generate email. Please try again." });
  }
}
