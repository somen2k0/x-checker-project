import { Router } from "express";

const router = Router();
const MAIL_TM = "https://api.mail.tm";

const TM_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

function randomPass(): string {
  return "P" + Math.random().toString(36).slice(2, 10) + "!x" + Math.random().toString(36).slice(2, 6) + "9Z";
}

function randomUser(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 4; i++) s += digits[Math.floor(Math.random() * digits.length)];
  return s;
}

// Domain cache: refreshed every 5 minutes
let domainCache: string[] = [];
let domainCacheAt = 0;
const DOMAIN_TTL = 5 * 60 * 1000;

async function getTmDomains(): Promise<string[]> {
  if (domainCache.length > 0 && Date.now() - domainCacheAt < DOMAIN_TTL) return domainCache;
  try {
    const r = await fetch(`${MAIL_TM}/domains?page=1`, {
      headers: TM_HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    if (r.ok) {
      const data = await r.json() as { "hydra:member"?: Array<{ domain: string; isActive?: boolean }> };
      const list = (data["hydra:member"] ?? []).filter(d => d.isActive !== false).map(d => d.domain);
      if (list.length > 0) { domainCache = list; domainCacheAt = Date.now(); return list; }
    }
  } catch { /* fall through to fallback */ }
  return domainCache.length > 0 ? domainCache : ["mailto.plus", "fexbox.org", "txcct.com"];
}

// ── Temp Mail tab (mail.tm) ───────────────────────────────────────

router.get("/temp-mail/domains", async (_req, res) => {
  res.json({ domains: await getTmDomains() });
});

router.post("/temp-mail/create", async (req, res) => {
  const { username, domain } = req.body as { username?: string; domain?: string };

  try {
    const domains = await getTmDomains();
    const targetDomain = domain || domains[0];
    if (!targetDomain) { res.status(502).json({ error: "No mail.tm domains available right now." }); return; }

    // Retry up to 4 times with different usernames (address may already be taken)
    for (let attempt = 0; attempt < 4; attempt++) {
      const user = attempt === 0 && username?.trim()
        ? username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "")
        : randomUser();
      const address = `${user}@${targetDomain}`;
      const password = randomPass();

      let cr: Response;
      try {
        cr = await fetch(`${MAIL_TM}/accounts`, {
          method: "POST",
          headers: TM_HEADERS,
          body: JSON.stringify({ address, password }),
          signal: AbortSignal.timeout(12000),
        });
      } catch { continue; }

      if (cr.status === 422 || cr.status === 409) continue; // username taken — retry

      if (!cr.ok) {
        const txt = await cr.text().catch(() => "");
        req.log.warn({ status: cr.status, body: txt.slice(0, 200) }, "mail.tm create failed");
        if (cr.status === 429) { res.status(429).json({ error: "mail.tm is rate-limiting this server. Please try again in a moment." }); return; }
        if (cr.status >= 500) { res.status(502).json({ error: "mail.tm is temporarily unavailable. Please try again." }); return; }
        continue;
      }

      const account = await cr.json() as { id: string; address: string };

      let tr: Response;
      try {
        tr = await fetch(`${MAIL_TM}/token`, {
          method: "POST",
          headers: TM_HEADERS,
          body: JSON.stringify({ address, password }),
          signal: AbortSignal.timeout(10000),
        });
      } catch { res.status(502).json({ error: "Could not authenticate inbox. Please try again." }); return; }

      if (!tr.ok) { res.status(502).json({ error: "Could not authenticate inbox. Please try again." }); return; }
      const tokenData = await tr.json() as { token: string };
      res.json({ id: account.id, address: account.address, token: tokenData.token });
      return;
    }

    res.status(502).json({ error: "Could not create inbox after several attempts. Please try again." });
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

// ── USA full name data (all backend, never sent to client) ───────────────────
const USA_FIRST = [
  "james","john","robert","michael","william","david","richard","joseph","thomas","charles",
  "christopher","daniel","matthew","anthony","mark","donald","steven","paul","andrew","joshua",
  "kevin","brian","george","timothy","ronald","edward","jason","jeffrey","ryan","jacob",
  "gary","nicholas","eric","jonathan","stephen","larry","justin","scott","brandon","benjamin",
  "samuel","raymond","frank","gregory","alexander","patrick","jack","dennis","jerry","tyler",
  "mary","patricia","jennifer","linda","barbara","elizabeth","susan","jessica","sarah","karen",
  "lisa","nancy","betty","margaret","sandra","ashley","dorothy","kimberly","emily","donna",
  "michelle","carol","amanda","melissa","deborah","stephanie","rebecca","sharon","laura","cynthia",
  "kathleen","amy","angela","shirley","anna","brenda","pamela","emma","nicole","helen",
  "samantha","katherine","christine","rachel","carolyn","janet","catherine","maria","heather","diane",
];
const USA_LAST = [
  "smith","johnson","williams","brown","jones","garcia","miller","davis","rodriguez","martinez",
  "hernandez","lopez","gonzalez","wilson","anderson","thomas","taylor","moore","jackson","martin",
  "lee","perez","thompson","white","harris","sanchez","clark","ramirez","lewis","robinson",
  "walker","young","allen","king","wright","scott","torres","nguyen","hill","flores",
  "green","adams","nelson","baker","hall","rivera","campbell","mitchell","carter","roberts",
  "phillips","evans","turner","parker","collins","edwards","stewart","morris","rogers","reed",
  "cook","morgan","bell","gomez","kelly","howard","ward","cox","diaz","richardson",
  "wood","watson","brooks","bennett","gray","james","reyes","cruz","hughes","price",
  "myers","long","foster","sanders","ross","morales","powell","sullivan","russell","ortiz",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsaUsername(): string {
  const first = randomItem(USA_FIRST);
  const last = randomItem(USA_LAST);
  const style = Math.floor(Math.random() * 4);
  const num = Math.floor(Math.random() * 900) + 100;
  switch (style) {
    case 0: return `${first}.${last}`;
    case 1: return `${first}${last}`;
    case 2: return `${first}_${last}`;
    default: return `${first}${last}${num}`;
  }
}

async function gFetch(params: Record<string, string>, sid?: string): Promise<Response> {
  const url = new URL(GUERRILLA_BASE);
  if (sid) params.sid_token = sid;
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url.toString(), {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(10000),
  });
}

router.get("/guerrilla/new", async (req, res) => {
  try {
    // Step 1: get a fresh session
    const initRes = await gFetch({ f: "get_email_address", lang: "en" });
    if (!initRes.ok) { res.status(502).json({ error: "Could not reach Guerrilla Mail. Please try again." }); return; }
    const initData = await initRes.json() as { email_addr?: string; sid_token?: string };
    if (!initData.sid_token) { res.status(502).json({ error: "Invalid provider response." }); return; }

    // Step 2: set a USA full name as the username
    const sid = initData.sid_token;
    const usaUsername = generateUsaUsername();
    const setRes = await gFetch({ f: "set_email_user", email_user: usaUsername, lang: "en" }, sid);

    let finalEmail = initData.email_addr ?? "";
    let finalUser = usaUsername;
    let finalDomain = "guerrillamail.com";
    let finalSid = sid;

    if (setRes.ok) {
      const setData = await setRes.json() as { email_addr?: string; sid_token?: string };
      if (setData.email_addr) {
        finalEmail = setData.email_addr;
        const parts = finalEmail.split("@");
        finalUser = parts[0] ?? usaUsername;
        finalDomain = parts[1] ?? finalDomain;
        finalSid = setData.sid_token ?? sid;
      }
    } else {
      const parts = finalEmail.split("@");
      finalUser = parts[0] ?? usaUsername;
      finalDomain = parts[1] ?? finalDomain;
    }

    res.json({ email: finalEmail, user: finalUser, domain: finalDomain, sid_token: finalSid, domains: GUERRILLA_DOMAINS });
  } catch (err) {
    req.log.error({ err }, "guerrilla new error");
    res.status(500).json({ error: "Failed to create inbox." });
  }
});

router.post("/guerrilla/set-user", async (req, res) => {
  const { user, domain, sid_token } = req.body as { user?: string; domain?: string; sid_token?: string };
  if (!sid_token) { res.status(400).json({ error: "sid_token required." }); return; }
  try {
    // All Guerrilla Mail domains are aliases of the same inbox — the API does not
    // accept a domain parameter. Only send the username, then substitute the
    // user-selected domain ourselves in the response.
    const params: Record<string, string> = { f: "set_email_user", lang: "en" };
    if (user) params.email_user = user;
    const r = await gFetch(params, sid_token);
    if (!r.ok) { res.status(502).json({ error: "Could not update address." }); return; }
    const d = await r.json() as { email_addr?: string; sid_token?: string };
    if (!d.email_addr) { res.status(502).json({ error: "Invalid provider response." }); return; }
    const actualUser = d.email_addr.split("@")[0] ?? user ?? "";
    const targetDomain = domain?.trim() || d.email_addr.split("@")[1] || "guerrillamailblock.com";
    const finalEmail = `${actualUser}@${targetDomain}`;
    res.json({ email: finalEmail, user: actualUser, domain: targetDomain, sid_token: d.sid_token ?? sid_token, domains: GUERRILLA_DOMAINS });
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
    const d = await r.json() as { list?: unknown };
    const raw = Array.isArray(d.list) ? d.list : [];
    // Filter out the Guerrilla Mail placeholder entry (mail_id "0") which is
    // always present when the inbox is empty and has blank/invalid fields.
    const messages = raw.filter((m: unknown) => {
      const msg = m as Record<string, unknown>;
      return msg.mail_id && String(msg.mail_id) !== "0";
    });
    res.json({ messages });
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
