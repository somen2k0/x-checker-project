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
    const body = await apiRes.json().catch(() => ({})) as { error?: string };
    if (body.error === "no_keys" || apiRes.status === 503) {
      res.status(503).json({ error: "no_keys" });
      return;
    }
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "All RapidAPI keys are rate-limited. Please wait a moment." });
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

  const doFetch = () => fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/api/inbox`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(12000),
    })
  );

  let { res: apiRes, exhausted } = await doFetch();

  // Retry once on transient server errors from the upstream API
  if (!apiRes.ok && !exhausted && apiRes.status >= 500) {
    await new Promise((r) => setTimeout(r, 1200));
    ({ res: apiRes, exhausted } = await doFetch());
  }

  if (!apiRes.ok) {
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "Rate-limited across all keys. Please wait a moment." });
      return;
    }
    req.log.warn({ status: apiRes.status }, "Gmailnator inbox failed");
    res.status(502).json({ error: "The inbox service is temporarily unavailable. Please try again in a moment." });
    return;
  }

  type RawMsg = {
    id?: string; message_id?: string; mid?: string; msgid?: string;
    from?: string; sender?: string;
    subject?: string;
    date?: string; timestamp?: number | string; time_ago?: string;
    content?: string; body?: string; text?: string; snippet?: string; preview?: string; excerpt?: string;
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
    mid:     m.id ?? m.message_id ?? m.mid ?? m.msgid ?? "",
    from:    m.from ?? m.sender ?? "",
    subject: m.subject ?? "",
    date:    m.time_ago ?? (m.date ?? (m.timestamp ? String(m.timestamp) : "")),
    content: m.content ?? m.body ?? m.text ?? m.snippet ?? m.preview ?? m.excerpt ?? "",
  }));

  res.json({ messages });
});

// Fetch individual message content using the correct Gmailnator endpoint: POST /api/messageid
// Falls back to /api/inbox with id if the primary endpoint returns nothing.
router.post("/temp-gmail/message", async (req, res) => {
  const { email, mid } = req.body as { email?: string; mid?: string };
  if (!email || !mid) {
    res.status(400).json({ error: "email and mid are required." });
    return;
  }

  type MsgBody = {
    content?: string; body?: string; text?: string; html?: string; message?: string;
    from?: string; sender?: string;
    subject?: string;
    msgid?: string; id?: string;
  };

  // --- Strategy 1: POST /api/messageid (correct Gmailnator endpoint for full body) ---
  const { res: r1, exhausted: ex1 } = await fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/api/messageid`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ msgid: mid }),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (r1.ok && !ex1) {
    let d1: MsgBody | MsgBody[] | { messages?: MsgBody[] } | null = null;
    try { d1 = await r1.json() as typeof d1; } catch { /**/ }

    const item1: MsgBody | undefined = Array.isArray(d1)
      ? d1[0]
      : (d1 as { messages?: MsgBody[] })?.messages?.[0] ?? (d1 as MsgBody) ?? undefined;

    const content1 = item1?.content ?? item1?.body ?? item1?.text ?? item1?.html ?? item1?.message ?? "";
    if (content1) {
      res.json({
        content: content1,
        from: item1?.from ?? item1?.sender ?? "",
        subject: item1?.subject ?? "",
      });
      return;
    }
  }

  // --- Strategy 2: POST /api/messageid with id parameter ---
  const { res: r2 } = await fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/api/messageid`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ id: mid }),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (r2.ok) {
    let d2: MsgBody | MsgBody[] | { messages?: MsgBody[] } | null = null;
    try { d2 = await r2.json() as typeof d2; } catch { /**/ }

    const item2: MsgBody | undefined = Array.isArray(d2)
      ? d2[0]
      : (d2 as { messages?: MsgBody[] })?.messages?.[0] ?? (d2 as MsgBody) ?? undefined;

    const content2 = item2?.content ?? item2?.body ?? item2?.text ?? item2?.html ?? item2?.message ?? "";
    if (content2) {
      res.json({
        content: content2,
        from: item2?.from ?? item2?.sender ?? "",
        subject: item2?.subject ?? "",
      });
      return;
    }
  }

  // --- Strategy 3: POST /api/inbox with email + id (legacy fallback) ---
  const { res: r3 } = await fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/api/inbox`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email, id: mid }),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (r3.ok) {
    type InboxResp = { status?: string; messages?: MsgBody[] };
    let d3: InboxResp | MsgBody[] | null = null;
    try { d3 = await r3.json() as typeof d3; } catch { /**/ }

    const msgs3: MsgBody[] = Array.isArray(d3) ? d3 : ((d3 as InboxResp)?.messages ?? []);
    const first3 = msgs3[0];
    const content3 = first3?.content ?? first3?.body ?? first3?.text ?? first3?.html ?? first3?.message ?? "";

    res.json({
      content: content3,
      from: first3?.from ?? first3?.sender ?? "",
      subject: first3?.subject ?? "",
    });
    return;
  }

  if (ex1) {
    res.status(429).json({ error: "Rate-limited. Please wait a moment." });
    return;
  }

  res.status(502).json({ error: "Failed to fetch message content." });
});

export default router;
