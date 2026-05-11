import type { VercelRequest, VercelResponse } from "@vercel/node";

const FORMSUBMIT_EMAIL = "careergrowthremotely@gmail.com";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ ok: false, error: "Message is required." });
    }

    const formRes = await fetch(
      `https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name || "Anonymous",
          email: email || "no-reply@xtoolkit.live",
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
      return res.status(502).json({
        ok: false,
        error: data?.message ?? "Failed to send message.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
}
