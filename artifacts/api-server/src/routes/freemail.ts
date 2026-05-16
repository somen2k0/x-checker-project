import { Router } from "express";

const router = Router();

// ── Provider base URLs ─────────────────────────────────────────────────────
const PROVIDERS = [
  { prefix: "mgw", base: "https://api.mail.gw", fallback: ["oakon.com"] },
] as const;
type Prefix = "mgw";

// ── Domain cache (10-min TTL per provider) ────────────────────────────────
const domainCache: Record<Prefix, { domains: string[]; expiry: number }> = {
  mgw: { domains: [], expiry: 0 },
};

async function fetchProviderDomains(prefix: Prefix, base: string, fallback: readonly string[]): Promise<string[]> {
  const cache = domainCache[prefix];
  if (Date.now() < cache.expiry && cache.domains.length > 0) return cache.domains;
  try {
    const r = await fetch(`${base}/domains`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return cache.domains.length ? cache.domains : [...fallback];
    const d = await r.json() as { "hydra:member"?: Array<{ domain: string; isActive: boolean; isPrivate?: boolean }> };
    const domains = (d["hydra:member"] ?? [])
      .filter(x => x.isActive && !x.isPrivate)
      .map(x => x.domain);
    if (domains.length > 0) {
      cache.domains = domains;
      cache.expiry = Date.now() + 10 * 60 * 1000;
    }
    return cache.domains.length ? cache.domains : [...fallback];
  } catch {
    return cache.domains.length ? cache.domains : [...fallback];
  }
}

async function getAllDomains(): Promise<{ domain: string; prefix: Prefix }[]> {
  const results = await Promise.allSettled(
    PROVIDERS.map(p => fetchProviderDomains(p.prefix, p.base, p.fallback).then(ds => ds.map(d => ({ domain: d, prefix: p.prefix }))))
  );
  return results.flatMap(r => r.status === "fulfilled" ? r.value : []);
}

function baseForPrefix(prefix: Prefix): string {
  return PROVIDERS.find(p => p.prefix === prefix)?.base ?? PROVIDERS[0].base;
}

function prefixForDomain(domain: string, tagged: { domain: string; prefix: Prefix }[]): Prefix {
  return tagged.find(x => x.domain === domain)?.prefix ?? "mgw";
}

// ── Token encoding — prefix:JWT ───────────────────────────────────────────
function encodeToken(prefix: Prefix, jwt: string): string { return `${prefix}:${jwt}`; }
function decodeToken(raw: string): { prefix: Prefix; jwt: string } | null {
  const colon = raw.indexOf(":");
  if (colon < 0) return null;
  const prefix = raw.slice(0, colon) as Prefix;
  if (!PROVIDERS.find(p => p.prefix === prefix)) return null;
  return { prefix, jwt: raw.slice(colon + 1) };
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

// ── Shared API helpers (both providers use identical REST shape) ───────────
async function createAccount(base: string, address: string, password: string): Promise<boolean> {
  try {
    const r = await fetch(`${base}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
      signal: AbortSignal.timeout(10000),
    });
    return r.ok; // only true on 2xx — 422 means taken, password unknown
  } catch { return false; }
}

async function getJwt(base: string, address: string, password: string): Promise<string | null> {
  try {
    const r = await fetch(`${base}/token`, {
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

async function fetchInbox(base: string, jwt: string): Promise<NormMsg[]> {
  const r = await fetch(`${base}/messages`, {
    headers: { Authorization: `Bearer ${jwt}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`Inbox fetch failed: ${r.status}`);
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
}

async function fetchMessage(base: string, id: string, jwt: string): Promise<NormMsg | null> {
  try {
    const r = await fetch(`${base}/messages/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${jwt}` },
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
  const tagged = await getAllDomains();
  res.json({ domains: tagged.map(x => x.domain) });
});

router.get("/freemail/new", async (req, res) => {
  const tagged = await getAllDomains();
  if (tagged.length === 0) { res.status(503).json({ error: "No domains available." }); return; }

  const reqDomain = (req.query.domain as string | undefined)?.toLowerCase().trim();
  const entry = (reqDomain && tagged.find(x => x.domain === reqDomain))
    ?? tagged[Math.floor(Math.random() * tagged.length)];

  const { domain, prefix } = entry;
  const base = baseForPrefix(prefix);
  const password = randomPassword();

  let login = randomLogin();
  let jwt: string | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) login = randomLogin();
    const created = await createAccount(base, `${login}@${domain}`, password);
    if (!created) continue;
    jwt = await getJwt(base, `${login}@${domain}`, password);
    if (jwt) break;
  }

  if (!jwt) { res.status(503).json({ error: "Failed to create mailbox — all attempts failed." }); return; }

  res.json({ login, domain, email: `${login}@${domain}`, token: encodeToken(prefix, jwt) });
});

router.post("/freemail/set-address", async (req, res) => {
  const { login: rawLogin, domain: rawDomain } = req.body as { login?: string; domain?: string };
  const tagged = await getAllDomains();
  if (tagged.length === 0) { res.status(503).json({ error: "No domains available." }); return; }

  const entry = (rawDomain && tagged.find(x => x.domain === rawDomain.toLowerCase()))
    ?? tagged[Math.floor(Math.random() * tagged.length)];

  const { domain, prefix } = entry;
  const base = baseForPrefix(prefix);
  const password = randomPassword();
  const requestedLogin = rawLogin
    ? rawLogin.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30) || null
    : null;

  let login = requestedLogin ?? randomLogin();
  let jwt: string | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) login = randomLogin(); // fall back to random if requested name is taken
    const created = await createAccount(base, `${login}@${domain}`, password);
    if (!created) continue;
    jwt = await getJwt(base, `${login}@${domain}`, password);
    if (jwt) break;
  }

  if (!jwt) { res.status(503).json({ error: "Failed to create mailbox — all attempts failed." }); return; }

  res.json({ login, domain, email: `${login}@${domain}`, token: encodeToken(prefix, jwt) });
});

router.get("/freemail/inbox", async (req, res) => {
  const { token } = req.query as { token?: string };
  if (!token) { res.status(400).json({ error: "token required." }); return; }
  const decoded = decodeToken(token);
  if (!decoded) { res.status(400).json({ error: "Invalid token format." }); return; }
  try {
    const messages = await fetchInbox(baseForPrefix(decoded.prefix), decoded.jwt);
    res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "freemail inbox error");
    res.status(502).json({ error: "Failed to fetch inbox. Please try again." });
  }
});

router.get("/freemail/message/:id", async (req, res) => {
  const { token } = req.query as { token?: string };
  const { id } = req.params;
  if (!token) { res.status(400).json({ error: "token required." }); return; }
  const decoded = decodeToken(token);
  if (!decoded) { res.status(400).json({ error: "Invalid token format." }); return; }
  try {
    const msg = await fetchMessage(baseForPrefix(decoded.prefix), id, decoded.jwt);
    if (!msg) { res.status(404).json({ error: "Message not found." }); return; }
    res.json(msg);
  } catch (err) {
    req.log.error({ err }, "freemail message error");
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

// ── Helper used by domain picker display (prefix per domain) ──────────────
router.get("/freemail/domains-tagged", async (_req, res) => {
  const tagged = await getAllDomains();
  res.json({ domains: tagged });
});

export default router;
