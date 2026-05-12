import { Router } from "express";
import { getNextRapidApiKey, hasRapidApiKeys } from "../lib/rapidapi-keys";

const router = Router();

const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

function rapidHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

router.post("/temp-gmail/generate", async (req, res) => {
  if (!hasRapidApiKeys()) {
    res.status(503).json({ error: "Gmailnator API not configured. Please add your RapidAPI keys." });
    return;
  }

  const key = getNextRapidApiKey();
  if (!key) {
    res.status(503).json({ error: "No valid RapidAPI keys available." });
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/generateEmail`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ prefixList: [], eType: [3] }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      req.log.warn({ status: response.status, body: text }, "Gmailnator generateEmail failed");
      if (response.status === 429) {
        res.status(429).json({ error: "Rate limited. Retrying with another key." });
        return;
      }
      res.status(502).json({ error: "Failed to generate email address." });
      return;
    }

    const data = await response.json() as { email?: string };
    if (!data.email) {
      res.status(502).json({ error: "Invalid response from Gmailnator API." });
      return;
    }

    res.json({ email: data.email });
  } catch (err) {
    req.log.error({ err }, "temp-gmail generate error");
    res.status(500).json({ error: "Failed to generate email. Please try again." });
  }
});

router.post("/temp-gmail/messages", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email address is required." });
    return;
  }

  if (!hasRapidApiKeys()) {
    res.status(503).json({ error: "Gmailnator API not configured." });
    return;
  }

  const key = getNextRapidApiKey();
  if (!key) {
    res.status(503).json({ error: "No valid RapidAPI keys available." });
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/getMessages`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      req.log.warn({ status: response.status }, "Gmailnator getMessages failed");
      res.status(502).json({ error: "Failed to fetch messages." });
      return;
    }

    const data = await response.json() as Array<{ mid?: string; from?: string; subject?: string; date?: string }>;
    res.json({ messages: Array.isArray(data) ? data : [] });
  } catch (err) {
    req.log.error({ err }, "temp-gmail messages error");
    res.status(500).json({ error: "Failed to fetch messages. Please try again." });
  }
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

  const key = getNextRapidApiKey();
  if (!key) {
    res.status(503).json({ error: "No valid RapidAPI keys available." });
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/getMessage`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email, mid }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      req.log.warn({ status: response.status }, "Gmailnator getMessage failed");
      res.status(502).json({ error: "Failed to fetch message." });
      return;
    }

    const data = await response.json() as { content?: string; from?: string; subject?: string; date?: string };
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "temp-gmail message error");
    res.status(500).json({ error: "Failed to fetch message. Please try again." });
  }
});

export default router;
