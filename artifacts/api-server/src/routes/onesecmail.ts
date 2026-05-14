import { Router } from "express";

const router = Router();
const BASE = "https://www.1secmail.com/api/v1/";

const FALLBACK_DOMAINS = [
  "1secmail.com", "1secmail.net", "1secmail.org",
  "wwjmp.com", "esiix.com", "xojxe.com", "yoggm.com",
];

async function getDomains(): Promise<string[]> {
  try {
    const r = await fetch(`${BASE}?action=getDomainList`, {
      signal: AbortSignal.timeout(6000),
    });
    if (r.ok) {
      const data = await r.json() as string[];
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return FALLBACK_DOMAINS;
}

function randomLogin(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

router.get("/onesecmail/new", async (req, res) => {
  try {
    const domains = await getDomains();
    const login = randomLogin();
    const domain = domains[Math.floor(Math.random() * Math.min(3, domains.length))];
    res.json({ login, domain, email: `${login}@${domain}`, domains });
  } catch (err) {
    req.log.error({ err }, "onesecmail new error");
    res.status(500).json({ error: "Failed to create inbox." });
  }
});

router.get("/onesecmail/domains", async (req, res) => {
  try {
    res.json({ domains: await getDomains() });
  } catch {
    res.json({ domains: FALLBACK_DOMAINS });
  }
});

router.post("/onesecmail/set-address", async (req, res) => {
  const { login, domain } = req.body as { login?: string; domain?: string };
  if (!login || !domain) {
    res.status(400).json({ error: "login and domain are required." });
    return;
  }
  const domains = await getDomains();
  const clean = login.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (!clean) { res.status(400).json({ error: "Invalid login." }); return; }
  res.json({ login: clean, domain, email: `${clean}@${domain}`, domains });
});

router.get("/onesecmail/inbox", async (req, res) => {
  const { login, domain } = req.query as { login?: string; domain?: string };
  if (!login || !domain) {
    res.status(400).json({ error: "login and domain are required." });
    return;
  }
  try {
    const r = await fetch(
      `${BASE}?action=getMessages&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!r.ok) { res.json({ messages: [] }); return; }
    const data = await r.json() as Array<{ id: number; from: string; subject: string; date: string }>;
    res.json({ messages: Array.isArray(data) ? data : [] });
  } catch {
    res.json({ messages: [] });
  }
});

router.get("/onesecmail/message/:id", async (req, res) => {
  const { login, domain } = req.query as { login?: string; domain?: string };
  const { id } = req.params;
  if (!login || !domain) {
    res.status(400).json({ error: "login and domain are required." });
    return;
  }
  try {
    const r = await fetch(
      `${BASE}?action=readMessage&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}&id=${id}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!r.ok) { res.status(r.status).json({ error: "Message not found." }); return; }
    res.json(await r.json());
  } catch {
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

export default router;
