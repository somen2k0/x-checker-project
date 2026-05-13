import { Router } from "express";
import { increment } from "../lib/stats";

const router = Router();

router.post("/generate-bio", async (req, res) => {
  const { topic, tone, apiKey } = req.body as {
    topic?: string;
    tone?: string;
    apiKey?: string;
  };

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    res.status(400).json({ error: "no_api_key" });
    return;
  }

  const toneText =
    tone && tone.trim().length > 0 ? tone.trim() : "professional and engaging";

  const prompt = `Generate 3 unique X (Twitter) bios based on the following topic: "${topic.trim()}".
The tone should be: ${toneText}.
Rules:
- Each bio must be under 160 characters
- Make them catchy, punchy and suited for X/Twitter
- Include relevant emojis where appropriate
- Return ONLY a JSON array of 3 strings, no extra text, no markdown, no explanation.
Example format: ["Bio one here", "Bio two here", "Bio three here"]`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 512,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      const errData = (await response
        .json()
        .catch(() => ({}))) as { error?: { message?: string } };
      if (response.status === 401) {
        res.status(401).json({ error: "invalid_api_key" });
        return;
      }
      if (response.status === 429) {
        res.status(429).json({ error: "rate_limited" });
        return;
      }
      res
        .status(500)
        .json({ error: errData?.error?.message ?? "Groq API error" });
      return;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content ?? "[]";

    let bios: string[] = [];
    try {
      bios = JSON.parse(raw);
    } catch {
      const matches = raw.match(/"([^"]{1,200})"/g);
      bios = matches
        ? matches.map((m: string) => m.replace(/^"|"$/g, ""))
        : [raw];
    }

    void increment("bio:requests");
    res.json({ bios: bios.slice(0, 3) });
  } catch (err) {
    req.log.error({ err }, "Bio generation failed");
    res.status(500).json({ error: "Failed to generate bio. Please try again." });
  }
});

export default router;
