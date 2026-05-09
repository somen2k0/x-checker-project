import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const accessKey = process.env.WEB3FORMS_KEY;
  if (!accessKey) {
    res.status(503).json({ error: "Contact form is not configured." });
    return;
  }

  const body = req.body as { name?: string; email?: string; message?: string } | undefined;
  const message = body?.message?.trim();

  if (!message) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  try {
    const web3Res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name: body?.name?.trim() || "Anonymous",
        email: body?.email?.trim() || "no-reply@x-toolkit.app",
        message,
        subject: "New feedback — X Toolkit",
      }),
    });

    const data = await web3Res.json() as { success?: boolean; message?: string };

    if (!web3Res.ok || !data.success) {
      res.status(502).json({ error: data.message ?? "Failed to send message." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Something went wrong: ${msg}` });
  }
}
