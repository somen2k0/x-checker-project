import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Bio generator is not configured yet." });
    return;
  }

  const body = req.body as { topic?: string; tone?: string } | undefined;
  const topic = body?.topic;
  const tone = body?.tone;

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  const toneClause = tone?.trim() ? ` The tone should be ${tone.trim()}.` : "";
  const prompt = `Generate exactly 3 distinct Twitter/X bios for someone whose niche or description is: "${topic.trim()}".${toneClause}

Rules:
- Each bio must be 160 characters or fewer (strict limit)
- Make each bio feel different (vary structure, tone, and emphasis)
- No hashtags
- Output ONLY the 3 bios, each on its own line, with no numbering, labels, or extra text`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.85,
      }),
    });

    if (groqRes.status === 401) {
      res.status(503).json({ error: "Invalid API key — check your GROQ_API_KEY in Vercel settings." });
      return;
    }

    if (groqRes.status === 429) {
      res.status(429).json({ error: "Too many requests. Please try again in a moment." });
      return;
    }

    if (!groqRes.ok) {
      let detail = `Groq API error (HTTP ${groqRes.status})`;
      try {
        const errBody = await groqRes.json() as { error?: { message?: string } };
        if (errBody?.error?.message) detail = errBody.error.message;
      } catch { /* ignore parse errors */ }
      res.status(502).json({ error: detail });
      return;
    }

    const data = await groqRes.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const raw = data.choices?.[0]?.message?.content ?? "";
    const bios = raw
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .slice(0, 3);

    res.status(200).json({ bios });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Something went wrong: ${message}` });
  }
}
