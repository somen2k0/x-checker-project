import { Router } from "express";

const router = Router();
const MAIL_TM = "https://api.mail.tm";

function randomPass(): string {
  return Math.random().toString(36).slice(2) + "Xk9!" + Math.random().toString(36).slice(2);
}

// ── Temp Mail tab (mail.tm) ───────────────────────────────────────

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

// ── Disposable Inbox tab (Guerrilla Mail — free, no API key needed) ───

const GUERRILLA_BASE = "https://www.guerrillamail.com/ajax.php";
const GUERRILLA_DOMAINS = [
  "guerrillamailblock.com", "sharklasers.com", "guerrillamail.info",
  "grr.la", "guerrillamail.biz", "guerrillamail.de",
  "guerrillamail.net", "guerrillamail.org", "spam4.me",
];

async function gFetch(params: Record<string, string>, sid?: string): Promise<Response> {
  const url = new URL(GUERRILLA_BASE);
  if (sid) params.sid_token = sid;
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
}

router.get("/guerrilla/new", async (req, res) => {
  try {
    const r = await gFetch({ f: "get_email_address", lang: "en" });
    if (!r.ok) { res.status(502).json({ error: "Could not create inbox." }); return; }
    const d = await r.json() as { email_addr?: string; sid_token?: string };
    if (!d.email_addr || !d.sid_token) { res.status(502).json({ error: "Invalid provider response." }); return; }
    const [user, domain] = d.email_addr.split("@");
    res.json({ email: d.email_addr, user, domain, sid_token: d.sid_token, domains: GUERRILLA_DOMAINS });
  } catch (err) {
    req.log.error({ err }, "guerrilla new error");
    res.status(500).json({ error: "Failed to create inbox." });
  }
});

router.post("/guerrilla/set-user", async (req, res) => {
  const { user, domain, sid_token } = req.body as { user?: string; domain?: string; sid_token?: string };
  if (!sid_token) { res.status(400).json({ error: "sid_token required." }); return; }
  try {
    const params: Record<string, string> = { f: "set_email_user", lang: "en" };
    if (user) params.email_user = user;
    if (domain) params.site = domain;
    const r = await gFetch(params, sid_token);
    if (!r.ok) { res.status(502).json({ error: "Could not update address." }); return; }
    const d = await r.json() as { email_addr?: string; sid_token?: string };
    if (!d.email_addr) { res.status(502).json({ error: "Invalid provider response." }); return; }
    const [newUser, newDomain] = d.email_addr.split("@");
    res.json({ email: d.email_addr, user: newUser, domain: newDomain, sid_token: d.sid_token ?? sid_token, domains: GUERRILLA_DOMAINS });
  } catch (err) {
    req.log.error({ err }, "guerrilla set-user error");
    res.status(500).json({ error: "Failed to update address." });
  }
});

router.get("/guerrilla/inbox", async (req, res) => {
  const sid_token = req.query.sid_token as string | undefined;
  if (!sid_token) { res.status(400).json({ error: "sid_token required." }); return; }
  try {
    const r = await gFetch({ f: "check_email", seq: "0" }, sid_token);
    if (!r.ok) { res.json({ messages: [] }); return; }
    const d = await r.json() as { list?: unknown[] };
    res.json({ messages: d.list ?? [] });
  } catch (err) {
    req.log.error({ err }, "guerrilla inbox error");
    res.json({ messages: [] });
  }
});

router.get("/guerrilla/message/:id", async (req, res) => {
  const sid_token = req.query.sid_token as string | undefined;
  const { id } = req.params;
  if (!sid_token) { res.status(400).json({ error: "sid_token required." }); return; }
  try {
    const r = await gFetch({ f: "fetch_email", email_id: id }, sid_token);
    if (!r.ok) { res.status(r.status).json({ error: "Message not found." }); return; }
    const d = await r.json() as { mail_body?: string; mail_from?: string; mail_subject?: string };
    res.json({ body: d.mail_body ?? "", from: d.mail_from, subject: d.mail_subject });
  } catch (err) {
    req.log.error({ err }, "guerrilla fetch message error");
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

export default router;
