import { Router } from "express";
import { fetchWithKeyRotation } from "../lib/rapidapi-keys";

const router = Router();

const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

function rapidHeaders(key: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

// Verified eType mappings against the live Gmailnator API:
// [2] = dot trick  (@gmail.com with dots)
// [4] = plus trick (@gmail.com with +tag)
// [3] = googlemail (@googlemail.com)
// [1,2,3,4] = any  (random from all types)
const ETYPE_MAP: Record<string, number[]> = {
  dot:        [2],
  plus:       [4],
  googlemail: [3],
  any:        [1, 2, 3, 4],
};

router.post("/temp-gmail/generate", async (req, res) => {
  const { type } = req.body as { type?: string };
  const resolvedType = type ?? "any";
  const eType = ETYPE_MAP[resolvedType] ?? ETYPE_MAP["any"];

  const { res: apiRes, exhausted } = await fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/api/emails/generate`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ eType }),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (!apiRes.ok) {
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "All RapidAPI keys are rate-limited. Please wait a moment or add more keys." });
      return;
    }
    req.log.warn({ status: apiRes.status }, "Gmailnator generate failed");
    res.status(502).json({ error: "Failed to generate email address." });
    return;
  }

  const data = await apiRes.json() as { email?: string; status?: string };
  if (!data.email) {
    res.status(502).json({ error: "Invalid response from Gmailnator API." });
    return;
  }

  res.json({ email: data.email, type: resolvedType });
});

router.post("/temp-gmail/messages", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  const { res: apiRes, exhausted } = await fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/api/inbox`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (!apiRes.ok) {
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "Rate-limited across all keys. Please wait a moment." });
      return;
    }
    req.log.warn({ status: apiRes.status }, "Gmailnator inbox failed");
    res.status(502).json({ error: "Failed to fetch messages." });
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
    res.status(502).json({ error: "Invalid response from Gmailnator API." });
    return;
  }

  const rawMessages: RawMsg[] = Array.isArray(raw) ? raw : (raw.messages ?? []);
  const messages = rawMessages.map((m) => ({
    mid:      m.id ?? m.message_id ?? m.mid ?? "",
    from:     m.from ?? m.sender ?? "",
    subject:  m.subject ?? "",
    date:     m.time_ago ?? (m.date ?? (m.timestamp ? String(m.timestamp) : "")),
    content:  m.content ?? m.body ?? m.text ?? "",
  }));

  res.json({ messages });
});

// Attempt to fetch individual message content by calling /api/inbox with the
// message id — Gmailnator may return the full body for a single message this way.
router.post("/temp-gmail/message", async (req, res) => {
  const { email, mid } = req.body as { email?: string; mid?: string };
  if (!email || !mid) {
    res.status(400).json({ error: "email and mid are required." });
    return;
  }

  const { res: apiRes, exhausted } = await fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/api/inbox`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email, id: mid }),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (!apiRes.ok) {
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "Rate-limited. Please wait a moment." });
      return;
    }
    res.status(502).json({ error: "Failed to fetch message content." });
    return;
  }

  type InboxResp = { status?: string; messages?: Array<{ content?: string; body?: string; from?: string; subject?: string; time_ago?: string }> };
  let data: InboxResp | null = null;
  try { data = await apiRes.json() as InboxResp; } catch { /**/ }

  const msgs = Array.isArray(data) ? data : (data?.messages ?? []);
  const first = (msgs as Array<{ content?: string; body?: string; from?: string; subject?: string; time_ago?: string }>)[0];
  const content = first?.content ?? first?.body ?? "";

  res.json({ content, from: first?.from, subject: first?.subject });
});

export default router;
