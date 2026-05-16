import { Router } from "express";
import { fetchWithGroqKeyRotation, hasGroqKeys } from "../lib/groq-keys";
import { AI_MAX_INPUT_CHARS } from "../middlewares/ai-protection";

const router = Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_TOKENS = 600;

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

  // Unique nonce embedded in the system message — makes every request
  // a distinct conversation so the model cannot return cached/identical output.
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const systemMessage = `You are an expert X (Twitter) bio copywriter known for producing wildly creative, memorable bios. Every set of 3 bios you write must be completely different from each other in angle, vocabulary, structure, and emotional tone. Never repeat phrasing across bios. Request ID: ${nonce}`;

  const userMessage = `Write 3 unique X (Twitter) bios for someone whose niche/topic is: "${topic.trim()}".
Tone style requested: ${toneText}.

Hard rules:
- Every bio must be 60–155 characters (not shorter, not longer)
- Each bio must take a completely different angle or hook (e.g., one bold statement, one question, one achievement-based)
- Use relevant emojis — but differently in each bio
- No two bios can share a sentence structure or opening word
- Do NOT write generic filler like "passionate about" or "lover of"

Return ONLY a raw JSON array of exactly 3 strings. No markdown, no explanation, no extra text.
Example: ["Bio one here", "Bio two here", "Bio three here"]`;

  const { res: apiRes, exhausted } = await fetchWithGroqKeyRotation((key) =>
    fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: MAX_TOKENS,
        temperature: 1.0,
        top_p: 0.95,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
      }),
      signal: AbortSignal.timeout(20000),
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
  const raw = (data.choices?.[0]?.message?.content ?? "").trim();

  let bios: string[] = [];
  try {
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    const jsonStr = jsonStart !== -1 && jsonEnd !== -1 ? raw.slice(jsonStart, jsonEnd + 1) : raw;
    bios = JSON.parse(jsonStr);
  } catch {
    const matches = raw.match(/"([^"]{10,200})"/g);
    bios = matches ? matches.map((m: string) => m.replace(/^"|"$/g, "")) : [raw];
  }

  res.json({ bios: bios.slice(0, 3) });
});

export default router;
