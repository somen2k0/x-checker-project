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
  req.log.info({ entry }, "Feedback received");

  const accessKey = process.env.WEB3FORMS_KEY;
  if (accessKey) {
    fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name: entry.name,
        email: entry.email || "no-reply@xtoolkit.live",
        message: entry.message,
        subject: "New feedback — X Toolkit",
      }),
    }).catch((err) => {
      req.log.warn({ err }, "Web3Forms delivery failed (message already stored locally)");
    });
  }

  res.status(200).json({ ok: true });
});

router.get("/contact/messages", (_req, res) => {
  res.json({ count: feedbackStore.length, messages: feedbackStore });
});

export default router;
