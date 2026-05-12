import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE = "https://www.guerrillamail.com/ajax.php";
const DOMAINS = [
  "guerrillamailblock.com","sharklasers.com","guerrillamail.info",
  "grr.la","guerrillamail.biz","guerrillamail.de",
  "guerrillamail.net","guerrillamail.org","spam4.me",
];

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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const { user, domain, sid_token } = req.body as {
    user?: string; domain?: string; sid_token?: string;
  };

  if (!sid_token || typeof sid_token !== "string") {
    res.status(400).json({ error: "sid_token is required." });
    return;
  }

  try {
    const params: Record<string, string> = {
      f: "set_email_user",
      lang: "en",
      sid_token,
    };
    if (user && user.trim()) params.email_user = user.trim().toLowerCase();
    if (domain && domain.trim()) params.site = domain.trim();

    const r = await gGet(params);
    if (!r.ok) {
      res.status(502).json({ error: "Could not update address. Please try again." });
      return;
    }

    const d = await r.json() as { email_addr?: string; sid_token?: string };
    if (!d.email_addr) {
      res.status(502).json({ error: "Invalid response from mail provider." });
      return;
    }

    const parts = d.email_addr.split("@");
    res.status(200).json({
      email: d.email_addr,
      user: parts[0] ?? user ?? "",
      domain: parts[1] ?? domain ?? "",
      sid_token: d.sid_token ?? sid_token,
      domains: DOMAINS,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Failed to update address: ${msg}` });
  }
}
