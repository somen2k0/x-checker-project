import { Router } from "express";

const router = Router();

const BASE = "https://temp.tf/api";
const HEADERS = { "Content-Type": "application/json", "Accept": "application/json" };

// GET /api/temptf/generate
// Returns a fresh @gmail.com address using the dot trick.
router.get("/temptf/generate", async (req, res) => {
  const { type, providers } = req.query as { type?: string; providers?: string };

  // Supported providers: gmail, outlook, hotmail
  // Outlook/Hotmail only support plus trick; Gmail supports both dot and plus
  const validProviders = ["gmail", "outlook", "hotmail"];
  const provider = validProviders.includes(providers ?? "") ? (providers as string) : "gmail";
  const isGmail  = provider === "gmail";

  const usePlus = type === "plus" || !isGmail; // non-gmail always uses plus
  const useDot  = isGmail && !usePlus;

  const params  = new URLSearchParams({ providers: provider });
  if (useDot)  params.set("dot",  "1");
  if (usePlus) params.set("plus", "1");

  try {
    const r = await fetch(`${BASE}/account?${params.toString()}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(12000),
    });

    if (!r.ok) {
      if (r.status === 429) {
        res.status(429).json({ error: "Rate limited by temp.tf. Please wait a moment." });
        return;
      }
      req.log.warn({ status: r.status }, "temp.tf generate failed");
      res.status(502).json({ error: "Failed to generate address." });
      return;
    }

    const data = await r.json() as { email?: string };
    if (!data.email) {
      res.status(502).json({ error: "Invalid response from temp.tf." });
      return;
    }

    res.json({ email: data.email });
  } catch (err) {
    req.log.error({ err }, "temp.tf generate error");
    res.status(502).json({ error: "Network error reaching temp.tf." });
  }
});

// POST /api/temptf/messages
// Returns the full inbox for a temp.tf address. Message bodies are included.
router.post("/temptf/messages", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  try {
    const r = await fetch(`${BASE}/check`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(15000),
    });

    if (!r.ok) {
      if (r.status === 403) {
        // temp.tf only allows addresses it generated
        res.status(403).json({ error: "This address is not valid for this inbox service." });
        return;
      }
      if (r.status === 429) {
        res.status(429).json({ error: "Rate limited. Please wait a moment." });
        return;
      }
      if (r.status === 404) {
        // Address exists but inbox is empty / not found yet
        res.json({ messages: [], totalReceived: 0 });
        return;
      }
      req.log.warn({ status: r.status }, "temp.tf check failed");
      res.status(502).json({ error: "Inbox service temporarily unavailable." });
      return;
    }

    type TempTfMsg = {
      id: string;
      subject?: string;
      from?: string;
      date?: string;
      body?: string;
      bodyContentType?: "html" | "text";
      attachments?: { id: string; name: string; contentType: string; size: number }[];
    };
    type TempTfResponse = { data?: TempTfMsg[]; totalReceived?: number };

    const raw = await r.json() as TempTfResponse;
    const rawMessages = raw.data ?? [];

    const messages = rawMessages.map((m) => ({
      id:              m.id,
      from:            m.from ?? "",
      subject:         m.subject ?? "",
      date:            m.date ?? "",
      body:            m.body ?? "",
      bodyContentType: m.bodyContentType ?? "text",
      hasAttachments:  (m.attachments?.length ?? 0) > 0,
    }));

    res.json({ messages, totalReceived: raw.totalReceived ?? messages.length });
  } catch (err) {
    req.log.error({ err }, "temp.tf check error");
    res.status(502).json({ error: "Network error reaching temp.tf." });
  }
});

export default router;
