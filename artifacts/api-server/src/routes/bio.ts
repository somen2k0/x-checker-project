import { Router } from "express";
import { fetchWithGroqKeyRotation, hasGroqKeys } from "../lib/groq-keys";
import { AI_MAX_INPUT_CHARS } from "../middlewares/ai-protection";

const router = Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_TOKENS = 500;

router.post("/generate-bio", async (req, res) => {
  const { topic, tone } = req.body as { topic?: string; tone?: string };

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  if (topic.trim().length > AI_MAX_INPUT_CHARS) {
    res.status(400).json({ error: `topic must be ${AI_MAX_INPUT_CHARS} characters or fewer.` });
    return;
  }

  if (!hasGroqKeys()) {
    res.status(503).json({ error: "Service not configured. Please contact the administrator." });
    return;
  }

  const toneText =
    tone && tone.trim().length > 0 ? tone.trim() : "professional and engaging";

  const seed = Math.random().toString(36).slice(2, 8);

  const prompt = `Generate 3 unique X (Twitter) bios based on the following topic: "${topic.trim()}".
The tone should be: ${toneText}.
Rules:
- Each bio must be under 160 characters
- Make them catchy, punchy and suited for X/Twitter
- Include relevant emojis where appropriate
- All 3 bios must be distinct from each other in wording and structure
- Return ONLY a JSON array of 3 strings, no extra text, no markdown, no explanation.
Example format: ["Bio one here", "Bio two here", "Bio three here"]
Variation: ${seed}`;

  const { res: apiRes, exhausted } = await fetchWithGroqKeyRotation((key) =>
    fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: MAX_TOKENS,
        temperature: 1.0,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    }),
  );

  if (exhausted || !apiRes.ok) {
    if (apiRes.status === 503) {
      res.status(503).json({ error: "Service not configured. Please contact the administrator." });
      return;
    }
    if (apiRes.status === 429) {
      res.status(429).json({ error: "Service is rate-limited. Please try again in a moment." });
      return;
    }
    if (apiRes.status === 401) {
      res.status(503).json({ error: "Service misconfigured. Please contact the administrator." });
      return;
    }
    const errData = (await apiRes.json().catch(() => ({}))) as { error?: { message?: string } };
    res.status(500).json({ error: errData?.error?.message ?? "Groq API error" });
    return;
  }

  const data = (await apiRes.json()) as {
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
});

export default router;
