import { Router } from "express";
import { AI_MAX_INPUT_CHARS } from "../middlewares/ai-protection";

const router = Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_TOKENS = 500;

function getGroqKeys(): string[] {
  const raw = process.env.GROQ_API_KEY ?? "";
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

router.post("/generate-bio", async (req, res) => {
  const { topic, tone } = req.body as { topic?: string; tone?: string };

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  // AI protection middleware already enforces AI_MAX_INPUT_CHARS, but we
  // validate explicitly here too so the route is self-documenting.
  if (topic.trim().length > AI_MAX_INPUT_CHARS) {
    res.status(400).json({
      error: `topic must be ${AI_MAX_INPUT_CHARS} characters or fewer.`,
    });
    return;
  }

  const keys = getGroqKeys();
  if (keys.length === 0) {
    res.status(503).json({ error: "Service not configured. Please contact the administrator." });
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

  for (let i = 0; i < keys.length; i++) {
    let response: Response;
    try {
      response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keys[i]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: MAX_TOKENS,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(15000),
      });
    } catch (err) {
      req.log.error({ err }, "Bio generation network error");
      res.status(500).json({ error: "Network error. Please try again." });
      return;
    }

    if (response.status === 429 && i < keys.length - 1) continue;

    if (!response.ok) {
      const errData = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      if (response.status === 429) {
        res.status(429).json({ error: "Service is rate-limited. Please try again in a moment." });
        return;
      }
      if (response.status === 401) {
        res.status(503).json({ error: "Service misconfigured. Please contact the administrator." });
        return;
      }
      res.status(500).json({ error: errData?.error?.message ?? "Groq API error" });
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
      bios = matches ? matches.map((m: string) => m.replace(/^"|"$/g, "")) : [raw];
    }

    res.json({ bios: bios.slice(0, 3) });
    return;
  }

  res.status(429).json({ error: "Service is rate-limited. Please try again in a moment." });
});

export default router;
