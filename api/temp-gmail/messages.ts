import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchWithRotation, rapidHeaders, BASE_URL } from "../_lib/rapidapi";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const body = req.body as { email?: string } | undefined;
  const email = body?.email;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  const doFetch = () => fetchWithRotation((key) =>
    fetch(`${BASE_URL}/api/inbox`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(12000),
    })
  );

  let { res: apiRes, exhausted } = await doFetch();

  // Retry once on transient server errors
  if (!apiRes.ok && !exhausted && apiRes.status >= 500) {
    await new Promise((r) => setTimeout(r, 1200));
    ({ res: apiRes, exhausted } = await doFetch());
  }

  if (!apiRes.ok) {
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "API quota reached for today — inbox will work again tomorrow. Your address is still valid." });
      return;
    }
    res.status(502).json({ error: "The inbox service is temporarily unavailable. Please try again in a moment." });
    return;
  }

  type RawMsg = {
    id?: string; message_id?: string; mid?: string;
    from?: string; sender?: string;
    subject?: string;
    date?: string; timestamp?: number | string; time_ago?: string;
    content?: string; body?: string; text?: string;
  };
  type InboxResponse = {
    status?: string;
    messages?: RawMsg[];
    message_count?: number;
  };

  let raw: InboxResponse | RawMsg[];
  try {
    raw = await apiRes.json() as InboxResponse | RawMsg[];
  } catch {
    res.status(502).json({ error: "Invalid response from inbox API." });
    return;
  }

  const rawMessages: RawMsg[] = Array.isArray(raw) ? raw : (raw.messages ?? []);
  const messages = rawMessages.map((m) => ({
    mid:     m.id ?? m.message_id ?? m.mid ?? "",
    from:    m.from ?? m.sender ?? "",
    subject: m.subject ?? "",
    date:    m.time_ago ?? (m.date ?? (m.timestamp ? String(m.timestamp) : "")),
    content: m.content ?? m.body ?? m.text ?? "",
  }));

  res.status(200).json({ messages });
}
