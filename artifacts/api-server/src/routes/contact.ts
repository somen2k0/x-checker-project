import { Router } from "express";

const router = Router();

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

interface FeedbackEntry {
  ts: string;
  name: string;
  email: string;
  message: string;
}

export const feedbackStore: FeedbackEntry[] = [];

// Returns the Web3Forms access key so the browser can submit directly (client-side only)
router.get("/contact/token", (_req, res) => {
  const key = process.env.WEB3FORMS_KEY;
  if (!key) {
    res.status(503).json({ error: "Contact form not configured." });
    return;
  }
  res.json({ key });
});

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  const entry: FeedbackEntry = {
    ts: new Date().toISOString(),
    name: name?.trim() || "Anonymous",
    email: email?.trim() || "",
    message: message.trim(),
  };

  feedbackStore.push(entry);
  req.log.info({ entry }, "Feedback received (stored locally)");

  res.status(200).json({ ok: true });
});

router.get("/contact/messages", (_req, res) => {
  res.json({ count: feedbackStore.length, messages: feedbackStore });
});

export default router;
