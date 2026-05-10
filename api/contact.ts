import type { VercelRequest, VercelResponse } from "@vercel/node";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessKey = process.env.WEB3FORMS_KEY;

  if (!accessKey) {
    return res.status(500).json({
      error: "WEB3FORMS_KEY missing",
    });
  }

  try {
    const { name, email, message } = req.body;

    const response = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: name || "Anonymous",
        email: email || "no-reply@xtoolkit.live",
        message,
        subject: "New feedback — X Toolkit",
      }),
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
    });
  }
}
