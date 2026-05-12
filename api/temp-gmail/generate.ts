import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchWithRotation, rapidHeaders, BASE_URL } from "../_lib/rapidapi";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const { res: apiRes, exhausted } = await fetchWithRotation((key) =>
    fetch(`${BASE_URL}/api/emails/generate`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (!apiRes.ok) {
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "All RapidAPI keys are rate-limited. Please wait a moment or add more keys." });
      return;
    }
    res.status(502).json({ error: `Gmailnator API error (HTTP ${apiRes.status}).` });
    return;
  }

  const data = await apiRes.json() as { email?: string };
  if (!data.email) {
    res.status(502).json({ error: "Invalid response from Gmailnator API." });
    return;
  }

  res.status(200).json({ email: data.email });
}
