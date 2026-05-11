import { Router } from "express";

const router = Router();

const FORMSUBMIT_EMAIL = "careergrowthremotely@gmail.com";

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

  try {
    const formRes = await fetch(
      `https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name?.trim() || "Anonymous",
          email: email?.trim() || "no-reply@x-toolkit.app",
          message: message.trim(),
          _subject: "New feedback — X Toolkit",
          _captcha: "false",
          _template: "table",
        }),
      }
    );

    const text = await formRes.text();
    let data: { success?: string; message?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      // Formsubmit.co returns HTML on first activation — treat any 2xx as success
    }

    const success = data?.success === "true" || formRes.ok;

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
