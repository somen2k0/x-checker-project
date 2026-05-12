import { Router } from "express";
import { hasRapidApiKeys, fetchWithKeyRotation } from "../lib/rapidapi-keys";

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

// eType mapping: 1=random, 2=dot trick, 3=plus trick, 4=googlemail
const ETYPE_MAP: Record<string, number[]> = {
  dot:        [2],
  plus:       [3],
  googlemail: [4],
  any:        [1, 2, 3],
};

router.post("/temp-gmail/generate", async (req, res) => {
  if (!hasRapidApiKeys()) {
    res.status(503).json({ error: "Gmailnator API not configured. Please add RAPIDAPI_KEY_1 (and optionally RAPIDAPI_KEY_2 … RAPIDAPI_KEY_N) as environment variables." });
    return;
  }

  const { type } = req.body as { type?: string };
  const eType = ETYPE_MAP[type ?? "any"] ?? [1, 2, 3];

  const { res: apiRes, exhausted } = await fetchWithKeyRotation((key) =>
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
    req.log.warn({ status: apiRes.status }, "Gmailnator generateEmail failed");
    res.status(502).json({ error: "Failed to generate email address." });
    return;
  }

  const data = await apiRes.json() as { email?: string };
  if (!data.email) {
    res.status(502).json({ error: "Invalid response from Gmailnator API." });
    return;
  }

  res.json({ email: data.email, type: type ?? "any" });
});

router.post("/temp-gmail/messages", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  if (!hasRapidApiKeys()) {
    res.status(503).json({ error: "Gmailnator API not configured." });
    return;
  }

  const { res: apiRes, exhausted } = await fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/getMessages`, {
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
    req.log.warn({ status: apiRes.status }, "Gmailnator getMessages failed");
    res.status(502).json({ error: "Failed to fetch messages." });
    return;
  }

  const data = await apiRes.json() as Array<{ mid?: string; from?: string; subject?: string; date?: string }>;
  res.json({ messages: Array.isArray(data) ? data : [] });
});

router.post("/temp-gmail/message", async (req, res) => {
  const { email, mid } = req.body as { email?: string; mid?: string };

  if (!email || !mid) {
    res.status(400).json({ error: "email and mid are required." });
    return;
  }

  if (!hasRapidApiKeys()) {
    res.status(503).json({ error: "Gmailnator API not configured." });
    return;
  }

  const { res: apiRes, exhausted } = await fetchWithKeyRotation((key) =>
    fetch(`${BASE_URL}/getMessage`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email, mid }),
      signal: AbortSignal.timeout(12000),
    })
  );

  if (!apiRes.ok) {
    if (exhausted || apiRes.status === 429) {
      res.status(429).json({ error: "Rate-limited across all keys. Please wait a moment." });
      return;
    }
    req.log.warn({ status: apiRes.status }, "Gmailnator getMessage failed");
    res.status(502).json({ error: "Failed to fetch message." });
    return;
  }

  const data = await apiRes.json() as { content?: string; from?: string; subject?: string; date?: string };
  res.json(data);
});

export default router;
