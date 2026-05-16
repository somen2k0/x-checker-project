import { Router } from "express";

const router = Router();
const MAILGW_BASE = "https://api.mail.gw";

// ── Domain cache (10-min TTL) ──────────────────────────────────────────────
let cachedDomains: string[] = [];
let cacheExpiry = 0;

async function getMailgwDomains(): Promise<string[]> {
  if (Date.now() < cacheExpiry && cachedDomains.length > 0) return cachedDomains;
  try {
    const r = await fetch(`${MAILGW_BASE}/domains`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return cachedDomains.length ? cachedDomains : ["oakon.com"];
    const d = await r.json() as { "hydra:member"?: Array<{ domain: string; isActive: boolean }> };
    const domains = (d["hydra:member"] ?? []).filter(x => x.isActive).map(x => x.domain);
    if (domains.length > 0) {
      cachedDomains = domains;
      cacheExpiry = Date.now() + 10 * 60 * 1000;
    }
    return cachedDomains.length ? cachedDomains : ["oakon.com"];
  } catch {
    return cachedDomains.length ? cachedDomains : ["oakon.com"];
  }
}

// ── Username generator ─────────────────────────────────────────────────────
const FM_FIRST = [
  "james","john","robert","michael","william","david","richard","joseph","thomas","charles",
  "christopher","daniel","matthew","anthony","mark","donald","steven","paul","andrew","joshua",
  "kevin","brian","george","timothy","ronald","edward","jason","jeffrey","ryan","jacob",
  "mary","patricia","jennifer","linda","barbara","elizabeth","susan","jessica","sarah","karen",
  "lisa","nancy","betty","margaret","sandra","ashley","dorothy","kimberly","emily","donna",
];
const FM_LAST = [
  "smith","johnson","williams","brown","jones","garcia","miller","davis","rodriguez","martinez",
  "hernandez","lopez","gonzalez","wilson","anderson","thomas","taylor","moore","jackson","martin",
  "lee","perez","thompson","white","harris","sanchez","clark","ramirez","lewis","robinson",
  "walker","young","allen","king","wright","scott","torres","nguyen","hill","flores",
];
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomLogin(): string {
  const sep = pick([".", "_", ""]);
  const suffix = Math.random() < 0.4 ? String(Math.floor(Math.random() * 90 + 10)) : "";
  return `${pick(FM_FIRST)}${sep}${pick(FM_LAST)}${suffix}`;
}
function randomPassword(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) + "Aa1!";
}

// ── Normalized message type ────────────────────────────────────────────────
interface NormMsg {
  id: string;
  from: string;
  subject: string;
  date: string;
  body?: string;
  htmlBody?: string;
  textBody?: string;
}

// ── mail.gw API helpers ────────────────────────────────────────────────────
async function mailgwCreateAccount(address: string, password: string): Promise<boolean> {
  try {
    const r = await fetch(`${MAILGW_BASE}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
      signal: AbortSignal.timeout(10000),
    });
    return r.ok || r.status === 422;
  } catch { return false; }
}

async function mailgwGetToken(address: string, password: string): Promise<string | null> {
  try {
    const r = await fetch(`${MAILGW_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const d = await r.json() as { token?: string };
    return d.token ?? null;
  } catch { return null; }
}

async function mailgwInbox(token: string): Promise<NormMsg[]> {
  try {
    const r = await fetch(`${MAILGW_BASE}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return [];
    const d = await r.json() as {
      "hydra:member"?: Array<{
        id: string;
        from: { address: string; name?: string };
        subject: string;
        createdAt: string;
        intro?: string;
      }>;
    };
    return (d["hydra:member"] ?? []).map(m => ({
      id: m.id,
      from: m.from?.address ?? "",
      subject: m.subject || "(no subject)",
      date: m.createdAt,
      textBody: m.intro ?? "",
    }));
  } catch { return []; }
}

async function mailgwMessage(id: string, token: string): Promise<NormMsg | null> {
  try {
    const r = await fetch(`${MAILGW_BASE}/messages/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const m = await r.json() as {
      id: string;
      from: { address: string; name?: string };
      subject: string;
      createdAt: string;
      html?: string[];
      text?: string;
    };
    return {
      id: m.id,
      from: m.from?.address ?? "",
      subject: m.subject || "(no subject)",
      date: m.createdAt,
      htmlBody: m.html?.[0] ?? "",
      textBody: m.text ?? "",
    };
  } catch { return null; }
}

// ── Routes ─────────────────────────────────────────────────────────────────

router.get("/freemail/domains", async (_req, res) => {
  const domains = await getMailgwDomains();
  res.json({ domains });
});

router.get("/freemail/new", async (req, res) => {
  const domains = await getMailgwDomains();
  const reqDomain = (req.query.domain as string | undefined)?.toLowerCase().trim();
  const domain = (reqDomain && domains.includes(reqDomain))
    ? reqDomain
    : domains[Math.floor(Math.random() * domains.length)];

  if (!domain) { res.status(503).json({ error: "No domains available." }); return; }

  const login = randomLogin();
  const address = `${login}@${domain}`;
  const password = randomPassword();

  const created = await mailgwCreateAccount(address, password);
  if (!created) { res.status(503).json({ error: "Failed to create mailbox." }); return; }

  const token = await mailgwGetToken(address, password);
  if (!token) { res.status(503).json({ error: "Failed to authenticate." }); return; }

  res.json({ login, domain, email: address, token });
});

router.post("/freemail/set-address", async (req, res) => {
  const { login: rawLogin, domain: rawDomain } = req.body as { login?: string; domain?: string };
  const domains = await getMailgwDomains();
  const domain = (rawDomain && domains.includes(rawDomain.toLowerCase()))
    ? rawDomain.toLowerCase()
    : domains[Math.floor(Math.random() * domains.length)];

  if (!domain) { res.status(503).json({ error: "No domains available." }); return; }

  const login = rawLogin
    ? rawLogin.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30) || randomLogin()
    : randomLogin();

  const address = `${login}@${domain}`;
  const password = randomPassword();

  const created = await mailgwCreateAccount(address, password);
  if (!created) { res.status(503).json({ error: "Failed to create mailbox." }); return; }

  const token = await mailgwGetToken(address, password);
  if (!token) { res.status(503).json({ error: "Failed to authenticate." }); return; }

  res.json({ login, domain, email: address, token });
});

router.get("/freemail/inbox", async (req, res) => {
  const { token } = req.query as { token?: string };
  if (!token) { res.status(400).json({ error: "token required." }); return; }
  try {
    const messages = await mailgwInbox(token);
    res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "mailgw inbox error");
    res.json({ messages: [] });
  }
});

router.get("/freemail/message/:id", async (req, res) => {
  const { token } = req.query as { token?: string };
  const { id } = req.params;
  if (!token) { res.status(400).json({ error: "token required." }); return; }
  try {
    const msg = await mailgwMessage(id, token);
    if (!msg) { res.status(404).json({ error: "Message not found." }); return; }
    res.json(msg);
  } catch (err) {
    req.log.error({ err }, "mailgw message error");
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

export default router;
