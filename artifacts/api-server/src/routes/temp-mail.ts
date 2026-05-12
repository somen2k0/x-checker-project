import { Router } from "express";

const router = Router();
const MAIL_TM = "https://api.mail.tm";

function randomPass(): string {
  return Math.random().toString(36).slice(2) + "Xk9!" + Math.random().toString(36).slice(2);
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

export default router;
