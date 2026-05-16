import { Router } from "express";

const router = Router();

// ── Domain registry ────────────────────────────────────────────────────────
const MAILDROP_DOMAINS    = ["maildrop.cc"];
const INBOXKITTEN_DOMAINS = ["inboxkitten.com"];
const NADA_DOMAINS        = ["getnada.com", "yomail.info", "zetmail.com", "mail2.io", "harakirimail.com"];
const DISPOSTABLE_DOMAINS = ["dispostable.com"];

export const FREEMAIL_DOMAINS = [
  ...MAILDROP_DOMAINS,
  ...INBOXKITTEN_DOMAINS,
  ...NADA_DOMAINS,
  ...DISPOSTABLE_DOMAINS,
];

type FmService = "maildrop" | "inboxkitten" | "nada" | "dispostable";

function getService(domain: string): FmService | null {
  if (MAILDROP_DOMAINS.includes(domain))    return "maildrop";
  if (INBOXKITTEN_DOMAINS.includes(domain)) return "inboxkitten";
  if (NADA_DOMAINS.includes(domain))        return "nada";
  if (DISPOSTABLE_DOMAINS.includes(domain)) return "dispostable";
  return null;
}

// ── Username generator ─────────────────────────────────────────────────────
const FM_FIRST = [
  "james","john","robert","michael","william","david","richard","joseph","thomas","charles",
  "christopher","daniel","matthew","anthony","mark","donald","steven","paul","andrew","joshua",
  "kevin","brian","george","timothy","ronald","edward","jason","jeffrey","ryan","jacob",
  "mary","patricia","jennifer","linda","barbara","elizabeth","susan","jessica","sarah","karen",
  "lisa","nancy","betty","margaret","sandra","ashley","dorothy","kimberly","emily","donna",
  "michelle","carol","amanda","melissa","deborah","stephanie","rebecca","sharon","laura","cynthia",
];
const FM_LAST = [
  "smith","johnson","williams","brown","jones","garcia","miller","davis","rodriguez","martinez",
  "hernandez","lopez","gonzalez","wilson","anderson","thomas","taylor","moore","jackson","martin",
  "lee","perez","thompson","white","harris","sanchez","clark","ramirez","lewis","robinson",
  "walker","young","allen","king","wright","scott","torres","nguyen","hill","flores",
  "green","adams","nelson","baker","hall","rivera","campbell","mitchell","carter","roberts",
];
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomLogin(): string {
  const sep = pick([".", "_", ""]);
  const suffix = Math.random() < 0.4 ? String(Math.floor(Math.random() * 90 + 10)) : "";
  return `${pick(FM_FIRST)}${sep}${pick(FM_LAST)}${suffix}`;
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

// ── Maildrop (GraphQL — maildrop.cc) ──────────────────────────────────────
type MdRawMsg = { id: string; mailfrom: string; origfrom: string; date: string; headersubject: string; body: string };

async function maildropInbox(mailbox: string): Promise<NormMsg[]> {
  const query = `{ inbox(mailbox:"${mailbox.toLowerCase()}") { id mailfrom origfrom date headersubject body } }`;
  const r = await fetch("https://maildrop.cc/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) return [];
  const d = await r.json() as { data?: { inbox?: MdRawMsg[] } };
  return (d.data?.inbox ?? []).map(m => ({
    id: String(m.id),
    from: m.origfrom || m.mailfrom || "",
    subject: m.headersubject || "(no subject)",
    date: m.date || "",
    htmlBody: m.body || "",
  }));
}

async function maildropMessage(id: string): Promise<NormMsg | null> {
  const query = `{ message(id:"${id}") { id mailfrom origfrom date headersubject body } }`;
  const r = await fetch("https://maildrop.cc/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) return null;
  const d = await r.json() as { data?: { message?: MdRawMsg } };
  const m = d.data?.message;
  if (!m) return null;
  return {
    id: String(m.id),
    from: m.origfrom || m.mailfrom || "",
    subject: m.headersubject || "(no subject)",
    date: m.date || "",
    htmlBody: m.body || "",
  };
}

// ── Inboxkitten (REST — inboxkitten.com) ──────────────────────────────────
type IkRawMsg = {
  uid?: number | string;
  from?: string | string[];
  to?: string | string[];
  subject?: string | string[];
  date?: string | string[];
  body?: string;
  htmlBody?: string;
  textBody?: string;
};
function ikStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

async function inboxkittenInbox(mailbox: string): Promise<NormMsg[]> {
  const r = await fetch(
    `https://inboxkitten.com/api/v1/inbox/list?mailbox=${encodeURIComponent(mailbox.toLowerCase())}&domain=inboxkitten.com`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!r.ok) return [];
  const raw = await r.json() as unknown;
  if (!Array.isArray(raw)) return [];
  return (raw as IkRawMsg[]).map(m => ({
    id: String(m.uid ?? ""),
    from: ikStr(m.from),
    subject: ikStr(m.subject) || "(no subject)",
    date: ikStr(m.date),
  }));
}

async function inboxkittenMessage(uid: string, mailbox: string): Promise<NormMsg | null> {
  const r = await fetch(
    `https://inboxkitten.com/api/v1/inbox/get?mailbox=${encodeURIComponent(mailbox.toLowerCase())}&domain=inboxkitten.com&uid=${encodeURIComponent(uid)}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!r.ok) return null;
  const m = await r.json() as IkRawMsg;
  return {
    id: String(m.uid ?? uid),
    from: ikStr(m.from),
    subject: ikStr(m.subject) || "(no subject)",
    date: ikStr(m.date),
    htmlBody: m.htmlBody || m.body || "",
    textBody: m.textBody || "",
  };
}

// ── Nada (getnada.com) ────────────────────────────────────────────────────
type NadaRawMsg = { uid?: string; id?: string; fc?: string; from?: string; s?: string; subject?: string; d?: string; date?: string; html?: string; text?: string; body?: string };

async function nadaInbox(email: string): Promise<NormMsg[]> {
  const r = await fetch(`https://getnada.com/api/v1/inboxes/${encodeURIComponent(email)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) return [];
  const raw = await r.json() as unknown;
  const msgs: NadaRawMsg[] = Array.isArray(raw)
    ? (raw as NadaRawMsg[])
    : ((raw as { msgs?: NadaRawMsg[] })?.msgs ?? (raw as { messages?: NadaRawMsg[] })?.messages ?? []);
  return msgs.map(m => ({
    id: m.uid ?? m.id ?? "",
    from: m.fc ?? m.from ?? "",
    subject: m.s ?? m.subject ?? "(no subject)",
    date: m.d ?? m.date ?? "",
  }));
}

async function nadaMessage(id: string): Promise<NormMsg | null> {
  const r = await fetch(`https://getnada.com/api/v1/messages/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) return null;
  const m = await r.json() as NadaRawMsg;
  return {
    id: m.uid ?? m.id ?? id,
    from: m.fc ?? m.from ?? "",
    subject: m.s ?? m.subject ?? "(no subject)",
    date: m.d ?? m.date ?? "",
    htmlBody: m.html ?? "",
    textBody: m.text ?? m.body ?? "",
  };
}

// ── Dispostable (dispostable.com) ─────────────────────────────────────────
type DispRawMsg = { id?: number | string; sender?: string; from?: string; subject?: string; message_date?: string; date?: string; message?: string };

async function dispostableInbox(address: string): Promise<NormMsg[]> {
  const r = await fetch(`https://www.dispostable.com/api/v1/inbox/${encodeURIComponent(address)}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) return [];
  const d = await r.json() as { messages?: DispRawMsg[] } | null;
  return (d?.messages ?? []).map(m => ({
    id: String(m.id ?? ""),
    from: m.sender ?? m.from ?? "",
    subject: m.subject ?? "(no subject)",
    date: m.message_date ?? m.date ?? "",
    textBody: m.message ?? "",
  }));
}

// ── Routes ─────────────────────────────────────────────────────────────────

router.get("/freemail/domains", (_req, res) => {
  res.json({ domains: FREEMAIL_DOMAINS });
});

router.get("/freemail/new", (req, res) => {
  const domain = (req.query.domain as string | undefined)?.toLowerCase().trim();
  if (!domain || !FREEMAIL_DOMAINS.includes(domain)) {
    res.status(400).json({ error: "Invalid or unsupported domain." });
    return;
  }
  const login = randomLogin();
  res.json({ login, domain, email: `${login}@${domain}` });
});

router.post("/freemail/set-address", (req, res) => {
  const { login: rawLogin, domain: rawDomain } = req.body as { login?: string; domain?: string };
  if (!rawLogin || !rawDomain) { res.status(400).json({ error: "login and domain required." }); return; }
  const domain = rawDomain.toLowerCase().trim();
  if (!FREEMAIL_DOMAINS.includes(domain)) { res.status(400).json({ error: "Unsupported domain." }); return; }
  const login = rawLogin.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (!login) { res.status(400).json({ error: "Invalid login." }); return; }
  res.json({ login, domain, email: `${login}@${domain}` });
});

router.get("/freemail/inbox", async (req, res) => {
  const { login, domain } = req.query as { login?: string; domain?: string };
  if (!login || !domain) { res.status(400).json({ error: "login and domain required." }); return; }
  const svc = getService(domain.toLowerCase());
  if (!svc) { res.status(400).json({ error: "Unsupported domain." }); return; }
  try {
    const email = `${login}@${domain}`;
    let messages: NormMsg[] = [];
    if (svc === "maildrop")    messages = await maildropInbox(login);
    else if (svc === "inboxkitten") messages = await inboxkittenInbox(login);
    else if (svc === "nada")   messages = await nadaInbox(email);
    else if (svc === "dispostable") messages = await dispostableInbox(email);
    res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "freemail inbox error");
    res.json({ messages: [] });
  }
});

router.get("/freemail/message/:id", async (req, res) => {
  const { login, domain } = req.query as { login?: string; domain?: string };
  const { id } = req.params;
  if (!login || !domain) { res.status(400).json({ error: "login and domain required." }); return; }
  const svc = getService(domain.toLowerCase());
  if (!svc) { res.status(400).json({ error: "Unsupported domain." }); return; }
  try {
    const email = `${login}@${domain}`;
    let msg: NormMsg | null = null;
    if (svc === "maildrop")         msg = await maildropMessage(id);
    else if (svc === "inboxkitten") msg = await inboxkittenMessage(id, login);
    else if (svc === "nada")        msg = await nadaMessage(id);
    else if (svc === "dispostable") {
      const msgs = await dispostableInbox(email);
      msg = msgs.find(m => m.id === id) ?? null;
    }
    if (!msg) { res.status(404).json({ error: "Message not found." }); return; }
    res.json(msg);
  } catch (err) {
    req.log.error({ err }, "freemail message error");
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

export default router;
