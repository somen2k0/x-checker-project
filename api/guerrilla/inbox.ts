import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE = "https://www.guerrillamail.com/ajax.php";

async function gGet(params: Record<string, string>): Promise<Response> {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url.toString(), {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(10000),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const sid_token = req.query.sid_token as string | undefined;
  if (!sid_token) {
    res.status(400).json({ error: "sid_token query param is required." });
    return;
  }

  try {
    const r = await gGet({ f: "check_email", seq: "0", sid_token });
    if (!r.ok) {
      res.status(200).json({ messages: [] });
      return;
    }
    const d = await r.json() as { list?: unknown[] };
    res.status(200).json({ messages: Array.isArray(d.list) ? d.list : [] });
  } catch {
    res.status(200).json({ messages: [] });
  }
}
