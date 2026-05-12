import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasKeys, fetchWithRotation, rapidHeaders, BASE_URL } from "../_lib/rapidapi";

// eType mapping: 1=random, 2=dot trick, 3=plus trick, 4=googlemail
const ETYPE_MAP: Record<string, number[]> = {
  dot:        [2],
  plus:       [3],
  googlemail: [4],
  any:        [1, 2, 3],
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  if (!hasKeys()) {
    res.status(503).json({ error: "Gmailnator API not configured. Please add RAPIDAPI_KEY_1 (and optionally RAPIDAPI_KEY_2 … RAPIDAPI_KEY_N) in Vercel environment variables." });
    return;
  }

  const body = req.body as { type?: string } | undefined;
  const type = body?.type ?? "any";
  const eType = ETYPE_MAP[type] ?? [1, 2, 3];

  const { res: apiRes, exhausted } = await fetchWithRotation((key) =>
    fetch(`${BASE_URL}/generateEmail`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ prefixList: [], eType }),
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

  res.status(200).json({ email: data.email, type });
}
