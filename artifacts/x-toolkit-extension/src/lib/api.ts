const API_BASE = "https://xtoolkit.live";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Guerrilla Mail ─────────────────────────────────────────────────────────

export async function guerrillaNew() {
  return apiFetch<{ email: string; user: string; domain: string; sid_token: string; domains: string[] }>("/api/guerrilla/new");
}

export async function guerrillaSetUser(user: string, domain: string, sid_token: string) {
  return apiFetch<{ email: string; user: string; domain: string; sid_token: string; domains: string[] }>("/api/guerrilla/set-user", {
    method: "POST",
    body: JSON.stringify({ user, domain, sid_token }),
  });
}

export async function guerrillaInbox(sid_token: string) {
  return apiFetch<{ messages: RawGuerrillaMessage[] }>(`/api/guerrilla/inbox?sid_token=${encodeURIComponent(sid_token)}`);
}

export async function guerrillaMessage(id: string, sid_token: string) {
  return apiFetch<{ body: string; from: string; subject: string }>(`/api/guerrilla/message/${id}?sid_token=${encodeURIComponent(sid_token)}`);
}

interface RawGuerrillaMessage {
  mail_id: string;
  mail_from?: string;
  mail_subject?: string;
  mail_date?: string;
  mail_excerpt?: string;
  mail_body?: string;
}

export function normaliseGuerrilla(m: RawGuerrillaMessage) {
  return {
    id: String(m.mail_id),
    from: m.mail_from ?? "",
    subject: m.mail_subject ?? "(no subject)",
    date: m.mail_date ?? "",
    body: m.mail_body ?? "",
    bodyContentType: "html" as const,
    intro: m.mail_excerpt ?? "",
  };
}

// ── 1secmail ───────────────────────────────────────────────────────────────

export async function onesecmailNew() {
  return apiFetch<{ email: string; login: string; domain: string; domains: string[] }>("/api/onesecmail/new");
}

export async function onesecmailInbox(login: string, domain: string) {
  return apiFetch<{ messages: RawOnesecMessage[] }>(`/api/onesecmail/inbox?login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`);
}

export async function onesecmailMessage(id: string, login: string, domain: string) {
  return apiFetch<{ body: string; htmlBody?: string; textBody?: string; from: string; subject: string; date: string }>(
    `/api/onesecmail/message/${id}?login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`
  );
}

interface RawOnesecMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
}

export function normaliseOnesec(m: RawOnesecMessage) {
  return {
    id: String(m.id),
    from: m.from ?? "",
    subject: m.subject ?? "(no subject)",
    date: m.date ?? "",
    body: "",
    bodyContentType: "html" as const,
    intro: "",
  };
}

// ── TempTF / Gmail ─────────────────────────────────────────────────────────

export async function temptfGenerate(providers = "gmail", type = "dot") {
  return apiFetch<{ email: string }>(`/api/temptf/generate?providers=${providers}&type=${type}`);
}

export async function temptfMessages(email: string) {
  return apiFetch<{ messages: RawTempTfMessage[]; totalReceived: number }>("/api/temptf/messages", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

interface RawTempTfMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  bodyContentType: "html" | "text";
  hasAttachments: boolean;
}

export function normaliseTemptf(m: RawTempTfMessage) {
  return {
    id: m.id,
    from: m.from ?? "",
    subject: m.subject ?? "(no subject)",
    date: m.date ?? "",
    body: m.body ?? "",
    bodyContentType: m.bodyContentType ?? "text",
    intro: "",
  };
}
