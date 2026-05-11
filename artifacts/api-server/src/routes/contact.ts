import { Router } from "express";

const router = Router();

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

router.post("/contact", async (req, res) => {
  const accessKey = process.env.WEB3FORMS_KEY;
  if (!accessKey) {
    res.status(503).json({ error: "Contact form is not configured." });
    return;
  }

  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  try {
    const web3Res = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name: name?.trim() || "Anonymous",
        email: email?.trim() || "no-reply@x-toolkit.app",
        message: message.trim(),
        subject: "New feedback — X Toolkit",
      }),
    });

    const data = (await web3Res.json()) as { success?: boolean; message?: string };
    const success =
      typeof data?.success === "boolean" ? data.success : web3Res.ok;

    if (!success) {
      res.status(502).json({ error: data?.message ?? "Failed to send message." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Contact form submission failed");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
