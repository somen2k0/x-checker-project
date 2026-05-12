import { Router } from "express";

const router = Router();
const MAIL_TM = "https://api.mail.tm";
const GMAILNATOR = "https://gmailnator.p.rapidapi.com";

function randomPass(): string {
  return Math.random().toString(36).slice(2) + "Xk9!" + Math.random().toString(36).slice(2);
}

function rapidHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": "gmailnator.p.rapidapi.com",
  };
}

// ── Temp Gmail tab (mail.tm) ──────────────────────────────────────

router.get("/temp-mail/domains", async (req, res) => {
  try {
    const r = await fetch(`${MAIL_TM}/domains`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) { res.json({ domains: [] }); return; }
    const data = await r.json() as { "hydra:member"?: Array<{ domain: string }> };
    res.json({ domains: (data["hydra:member"] ?? []).map((d) => d.domain) });
  } catch {
    res.json({ domains: [] });
  }
});

router.post("/temp-mail/create", async (req, res) => {
  const { username, domain } = req.body as { username?: string; domain?: string };

  try {
    let targetDomain = domain;
    if (!targetDomain) {
      try {
        const dr = await fetch(`${MAIL_TM}/domains`, {
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
          signal: AbortSignal.timeout(8000),
        });
        if (dr.status === 200) {
          const dd = await dr.json() as { "hydra:member"?: Array<{ domain: string }> };
          targetDomain = dd["hydra:member"]?.[0]?.domain;
        }
      } catch { /* fall through */ }
    }
    // Hard fallback so a stale cache never blocks creation
    if (!targetDomain) targetDomain = "wshu.net";
    if (!targetDomain) { res.status(502).json({ error: "Could not get domain." }); return; }

    const user = username?.trim().toLowerCase() || Math.random().toString(36).slice(2, 10);
    const address = `${user}@${targetDomain}`;
    const password = randomPass();

    const cr = await fetch(`${MAIL_TM}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ address, password }),
      signal: AbortSignal.timeout(12000),
    });

    if (!cr.ok) {
      const txt = await cr.text().catch(() => "");
      req.log.warn({ status: cr.status, body: txt }, "mail.tm create failed");
      res.status(502).json({ error: "Could not create inbox. The username may be taken — try again." });
      return;
    }
    const account = await cr.json() as { id: string; address: string };

    const tr = await fetch(`${MAIL_TM}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ address, password }),
      signal: AbortSignal.timeout(10000),
    });
    if (!tr.ok) { res.status(502).json({ error: "Could not authenticate inbox." }); return; }
    const tokenData = await tr.json() as { token: string; id: string };

    res.json({ id: account.id, address: account.address, token: tokenData.token });
  } catch (err) {
    req.log.error({ err }, "temp-mail create error");
    res.status(500).json({ error: "Could not create inbox. Please try again." });
  }
});

router.get("/temp-mail/messages", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const r = await fetch(`${MAIL_TM}/messages?page=1`, {
      headers: { Authorization: auth, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) { res.json({ messages: [] }); return; }
    const data = await r.json() as { "hydra:member"?: unknown[] };
    res.json({ messages: data["hydra:member"] ?? [] });
  } catch {
    res.json({ messages: [] });
  }
});

router.get("/temp-mail/messages/:id", async (req, res) => {
  const auth = req.headers.authorization;
  const { id } = req.params;
  if (!auth) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const r = await fetch(`${MAIL_TM}/messages/${id}`, {
      headers: { Authorization: auth, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) { res.status(r.status).json({ error: "Message not found." }); return; }
    res.json(await r.json());
  } catch {
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

// ── Disposable Inbox tab (Gmailnator via RapidAPI) ────────────────

// ── RapidAPI key pool (supports RAPIDAPI_KEY, RAPIDAPI_KEY_1 … RAPIDAPI_KEY_10) ──
function buildKeyPool(): string[] {
  const candidates = [
    process.env.RAPIDAPI_KEY,
    ...Array.from({ length: 10 }, (_, i) => process.env[`RAPIDAPI_KEY_${i + 1}`]),
  ];
  return candidates.filter(Boolean) as string[];
}

let _keyPool: string[] = [];
let _keyIndex = 0;

function getKey(): string | null {
  // Rebuild pool lazily (picks up keys added at runtime without restart)
  _keyPool = buildKeyPool();
  if (!_keyPool.length) return null;

  // Fisher-Yates shuffle on first use so all instances start at different offsets
  if (_keyIndex === 0 && _keyPool.length > 1) {
    for (let i = _keyPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [_keyPool[i], _keyPool[j]] = [_keyPool[j], _keyPool[i]];
    }
  }

  // Round-robin through the pool
  const key = _keyPool[_keyIndex % _keyPool.length];
  _keyIndex = (_keyIndex + 1) % _keyPool.length;
  return key;
}

const ETYPE_MAP: Record<string, number[]> = {
  dot: [2],
  plus: [2],
  googlemail: [3],
  any: [3],
};

router.post("/gmailnator/generate", async (req, res) => {
  const key = getKey();
  if (!key) {
    res.status(503).json({ error: "Gmailnator API not configured. Add RAPIDAPI_KEY to env vars." });
    return;
  }
  const { type } = req.body as { type?: string };
  const eType = ETYPE_MAP[type ?? "any"] ?? [3];

  try {
    const response = await fetch(`${GMAILNATOR}/generateEmail`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ prefixList: [], eType }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      req.log.warn({ status: response.status, body: text }, "gmailnator generate failed");
      res.status(502).json({ error: "Failed to generate Gmail address." });
      return;
    }
    const data = await response.json() as { email?: string };
    if (!data.email) { res.status(502).json({ error: "Invalid response from Gmailnator." }); return; }
    res.json({ email: data.email, type: type ?? "any" });
  } catch (err) {
    req.log.error({ err }, "gmailnator generate error");
    res.status(500).json({ error: "Failed to generate email. Please try again." });
  }
});

router.post("/gmailnator/inbox", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || !email.includes("@")) { res.status(400).json({ error: "Valid email required." }); return; }

  const key = getKey();
  if (!key) { res.status(503).json({ error: "Gmailnator API not configured." }); return; }

  try {
    const response = await fetch(`${GMAILNATOR}/getMessages`, {
      method: "POST",
      headers: rapidHeaders(key),
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) { res.status(502).json({ error: "Failed to fetch inbox." }); return; }
    const data = await response.json() as Array<{ mid?: string; from?: string; subject?: string; date?: string; content?: string }>;
    const messages = Array.isArray(data) ? data.map((m) => ({
      mid: m.mid,
      from: m.from,
      subject: m.subject,
      date: m.date,
      html: m.content,
    })) : [];
    res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "gmailnator inbox error");
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

export default router;
