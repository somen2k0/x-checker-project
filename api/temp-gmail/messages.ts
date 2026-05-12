import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pickKey, rapidHeaders, RAPIDAPI_HOST } from "../_rapidapi-keys";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const { email } = req.body as { email?: string };
  if (!email || !email.includes("@")) { res.status(400).json({ error: "Valid email address is required." }); return; }

  const key = pickKey();
  if (!key) { res.status(503).json({ error: "Gmailnator API not configured." }); return; }

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/getMessages`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) { res.status(502).json({ error: "Failed to fetch messages." }); return; }

    const data = await response.json() as Array<{ mid?: string; from?: string; subject?: string; date?: string }>;
    res.json({ messages: Array.isArray(data) ? data : [] });
  } catch {
    res.status(500).json({ error: "Failed to fetch messages. Please try again." });
  }
}
