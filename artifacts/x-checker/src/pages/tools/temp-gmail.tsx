import { useState, useCallback, useRef, useEffect } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import {
  Mail, RefreshCw, Copy, Inbox, ArrowLeft,
  Clock, Loader2, MailOpen, AlertCircle, Shuffle,
  Plus, Hash, CheckCircle2, ExternalLink, ChevronDown,
  Zap, Settings2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

interface GuerrillaInbox {
  email: string; user: string; domain: string; sid_token: string; domains: string[];
}
interface GuerrillaMessage {
  mail_id: string; mail_from: string; mail_subject: string; mail_timestamp: string; mail_read: string; mail_exerpt?: string;
}
interface GuerrillaFullMessage { body: string; from?: string; subject?: string; }

interface GmailnatorMessage { mid: string; from?: string; subject?: string; date?: string; content?: string; }
interface GmailnatorFullMessage { content?: string; from?: string; subject?: string; date?: string; }

type Tab = "disposable" | "tempgmail" | "gmail";

// ── Domain lists used by UnifiedInboxSection ────────────────────────
const G_DOMAINS = [
  "guerrillamailblock.com", "sharklasers.com", "guerrillamail.info",
  "grr.la", "guerrillamail.biz", "guerrillamail.de",
  "guerrillamail.net", "guerrillamail.org", "spam4.me",
];
const O_DOMAINS = [
  "1secmail.com", "1secmail.net", "1secmail.org",
  "wwjmp.com", "esiix.com", "xojxe.com", "yoggm.com",
];
const F_DOMAINS = [
  "maildrop.cc",
  "inboxkitten.com",
  "getnada.com", "yomail.info", "zetmail.com", "mail2.io", "harakirimail.com",
  "dispostable.com",
];
const ALL_DOMAINS = [...G_DOMAINS, ...O_DOMAINS, ...F_DOMAINS];
type InboxProv = "guerrilla" | "onesecmail" | "freemail";

function pickRandomDomain(): { domain: string; prov: InboxProv } {
  const domain = ALL_DOMAINS[Math.floor(Math.random() * ALL_DOMAINS.length)];
  const prov: InboxProv = G_DOMAINS.includes(domain) ? "guerrilla"
    : O_DOMAINS.includes(domain) ? "onesecmail"
    : "freemail";
  return { domain, prov };
}
interface GSession { sid: string; user: string; domain: string; email: string }
interface OSession { login: string; domain: string; email: string; domains: string[] }
interface FSession { login: string; domain: string; email: string }
interface OMsg { id: number; from: string; subject: string; date: string }
interface OFullMsg extends OMsg { body?: string; htmlBody?: string; textBody?: string }
interface FMsg { id: string; from: string; subject: string; date: string }
interface FFullMsg extends FMsg { body?: string; htmlBody?: string; textBody?: string }

const REFRESH_MS = 15000;
const INBOX_STORAGE_KEY = "xt_inbox_session";

interface PersistedInbox {
  prov: InboxProv;
  email: string;
  user: string;
  domain: string;
  sid?: string;
  savedAt: number;
}

const SESSION_TTL = 3 * 60 * 60 * 1000;

function saveInboxSession(prov: InboxProv, session: GSession | OSession | FSession): void {
  try {
    const data: PersistedInbox = {
      prov,
      email: session.email,
      user: "user" in session ? session.user : session.login,
      domain: session.domain,
      sid: "sid" in session ? session.sid : undefined,
      savedAt: Date.now(),
    };
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadInboxSession(): PersistedInbox | null {
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedInbox;
    if (Date.now() - data.savedAt > SESSION_TTL) {
      localStorage.removeItem(INBOX_STORAGE_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function clearInboxSession(): void {
  try { localStorage.removeItem(INBOX_STORAGE_KEY); } catch {}
}

// ── Helpers ────────────────────────────────────────────────────────

function timeAgo(ts: string | number): string {
  const n = typeof ts === "number" ? ts * 1000 : new Date(ts).getTime();
  const diff = Date.now() - n;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  return new Date(n).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function dotVariants(name: string): string[] {
  const x = name.replace(/\./g, "").toLowerCase();
  if (x.length < 2) return [`${x}@gmail.com`];
  const results: string[] = [];
  const slots = x.length - 1;
  const total = Math.min(Math.pow(2, slots), 32);
  for (let mask = 0; mask < total; mask++) {
    let v = x[0];
    for (let i = 0; i < slots; i++) { if (mask & (1 << i)) v += "."; v += x[i + 1]; }
    results.push(`${v}@gmail.com`);
  }
  return results;
}

const PLUS_TAGS = ["newsletters","shopping","social","spam","work","promo","subscriptions","alerts","updates","receipts","travel","finance","health","gaming","news","jobs","events","school","personal","test","noreply","signup","deals","banking","govt","apps","temp","dev","backup","bulk"];

// ── FAQ / related ──────────────────────────────────────────────────

const faqs = [
  { q: "What is a disposable email address?", a: "A disposable email is a temporary inbox you can use for sign-ups, trials, or any situation where you don't want to give out your real email. It receives real emails but can be discarded at any time." },
  { q: "How long does the inbox last?", a: "Inboxes are session-based. If you reload without saving the address, the inbox is lost. Your session is saved automatically in your browser so you can refresh the page and return to the same inbox." },
  { q: "What is the Gmail dot trick?", a: "Gmail ignores dots in usernames — john.doe@gmail.com and johndoe@gmail.com deliver to the same inbox. You can use any dot variant to register on sites that check for duplicate emails." },
  { q: "What is the Gmail plus trick?", a: "Adding +anything after your Gmail username still delivers to your main inbox. john+spam@gmail.com reaches John's inbox. Use it to create Gmail filters and track who shares your address with advertisers." },
  { q: "Is my data private?", a: "The disposable inbox is not linked to your identity. However, anyone who knows the address can access it. Don't use it for sensitive communications." },
];

const relatedTools = [
  { title: "Email Validator", href: "/tools/email-validator", description: "Validate email address syntax instantly." },
  { title: "Email Signature Generator", href: "/tools/email-signature-generator", description: "Build a professional email signature." },
  { title: "Email Character Counter", href: "/tools/email-character-counter", description: "Count subject and body characters." },
];

// ── Tab 1: Unified inbox (all providers) ────────────────────────────

function UnifiedInboxSection() {
  const [gSession, setGSession] = useState<GSession | null>(null);
  const [oSession, setOSession] = useState<OSession | null>(null);
  const [fSession, setFSession] = useState<FSession | null>(null);
  const [activeProv, setActiveProv] = useState<InboxProv>("guerrilla");
  const [gMessages, setGMessages] = useState<GuerrillaMessage[]>([]);
  const [oMessages, setOMessages] = useState<OMsg[]>([]);
  const [fMessages, setFMessages] = useState<FMsg[]>([]);
  const [selectedG, setSelectedG] = useState<GuerrillaFullMessage | null>(null);
  const [selectedO, setSelectedO] = useState<OFullMsg | null>(null);
  const [selectedF, setSelectedF] = useState<FFullMsg | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000);
  const [copied, setCopied] = useState(false);
  const [showCustomUser, setShowCustomUser] = useState(false);
  const [customUser, setCustomUser] = useState("");
  const [showDomainDrop, setShowDomainDrop] = useState(false);
  const { toast } = useToast();
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialized = useRef(false);

  // ── refs to pass into setInterval without stale closures ──────────
  const gSessionRef = useRef<GSession | null>(null);
  const oSessionRef = useRef<OSession | null>(null);
  const fSessionRef = useRef<FSession | null>(null);
  const activeProvRef = useRef<InboxProv>("guerrilla");

  // ── fetch helpers ──────────────────────────────────────────────────
  const fetchGMsgs = useCallback(async (sid: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const r = await fetch(`/api/guerrilla/inbox?sid_token=${encodeURIComponent(sid)}`);
      if (r.ok) {
        const d = await r.json() as { messages?: unknown };
        const inc = Array.isArray(d.messages) ? (d.messages as GuerrillaMessage[]) : [];
        setGMessages((prev) => {
          const m = new Map(prev.map(x => [x.mail_id, x]));
          inc.forEach(x => m.set(x.mail_id, { ...m.get(x.mail_id), ...x }));
          return Array.from(m.values());
        });
      }
    } catch {} finally { if (!silent) setLoadingMsgs(false); }
  }, []);

  const fetchOMsgs = useCallback(async (login: string, domain: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const r = await fetch(`/api/onesecmail/inbox?login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`);
      if (r.ok) {
        const d = await r.json() as { messages?: OMsg[] };
        const inc = d.messages ?? [];
        setOMessages((prev) => {
          const m = new Map(prev.map(x => [x.id, x]));
          inc.forEach(x => m.set(x.id, x));
          return Array.from(m.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      }
    } catch {} finally { if (!silent) setLoadingMsgs(false); }
  }, []);

  const fetchFMsgs = useCallback(async (login: string, domain: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const r = await fetch(`/api/freemail/inbox?login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`);
      if (r.ok) {
        const d = await r.json() as { messages?: FMsg[] };
        const inc = d.messages ?? [];
        setFMessages((prev) => {
          const m = new Map(prev.map(x => [x.id, x]));
          inc.forEach(x => m.set(x.id, x));
          return Array.from(m.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      }
    } catch {} finally { if (!silent) setLoadingMsgs(false); }
  }, []);

  // ── polling ────────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setCountdown(REFRESH_MS / 1000);
    refreshTimer.current = setInterval(() => {
      if (activeProvRef.current === "guerrilla" && gSessionRef.current)
        fetchGMsgs(gSessionRef.current.sid, true);
      else if (activeProvRef.current === "onesecmail" && oSessionRef.current)
        fetchOMsgs(oSessionRef.current.login, oSessionRef.current.domain, true);
      else if (activeProvRef.current === "freemail" && fSessionRef.current)
        fetchFMsgs(fSessionRef.current.login, fSessionRef.current.domain, true);
      setCountdown(REFRESH_MS / 1000);
    }, REFRESH_MS);
    countdownTimer.current = setInterval(() => setCountdown(c => c <= 1 ? REFRESH_MS / 1000 : c - 1), 1000);
  }, [fetchGMsgs, fetchOMsgs, fetchFMsgs]);

  // ── init / new address ─────────────────────────────────────────────
  const createGInbox = useCallback(async (user?: string): Promise<GSession | null> => {
    try {
      const r = await fetch("/api/guerrilla/new");
      const d = await r.json() as GuerrillaInbox & { error?: string };
      if (!r.ok || !d.email) return null;
      // If a different user was requested, set it
      if (user && user !== d.user) {
        const sr = await fetch("/api/guerrilla/set-user", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user, domain: d.domain, sid_token: d.sid_token }),
        });
        if (sr.ok) {
          const sd = await sr.json() as GuerrillaInbox & { error?: string };
          if (sd.email) {
            const gs = { sid: sd.sid_token ?? d.sid_token, user: sd.user ?? user, domain: sd.domain ?? d.domain, email: sd.email };
            gSessionRef.current = gs; setGSession(gs); saveInboxSession("guerrilla", gs); return gs;
          }
        }
      }
      const gs = { sid: d.sid_token, user: d.user, domain: d.domain, email: d.email };
      gSessionRef.current = gs; setGSession(gs); saveInboxSession("guerrilla", gs); return gs;
    } catch { return null; }
  }, []);

  const createOInbox = useCallback(async (login?: string, domain?: string): Promise<OSession | null> => {
    try {
      const endpoint = login
        ? `/api/onesecmail/set-address`
        : `/api/onesecmail/new`;
      const r = login
        ? await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login, domain: domain ?? "1secmail.com" }) })
        : await fetch(endpoint);
      const d = await r.json() as OSession & { error?: string };
      if (!r.ok || !d.email) return null;
      const os = { login: d.login, domain: d.domain, email: d.email, domains: d.domains ?? O_DOMAINS };
      oSessionRef.current = os; setOSession(os); saveInboxSession("onesecmail", os); return os;
    } catch { return null; }
  }, []);

  const createFInbox = useCallback(async (login?: string, domain?: string): Promise<FSession | null> => {
    try {
      const targetDomain = domain ?? F_DOMAINS[0];
      const endpoint = login
        ? `/api/freemail/set-address`
        : `/api/freemail/new?domain=${encodeURIComponent(targetDomain)}`;
      const r = login
        ? await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login, domain: targetDomain }) })
        : await fetch(endpoint);
      const d = await r.json() as FSession & { error?: string };
      if (!r.ok || !d.email) return null;
      const fs: FSession = { login: d.login, domain: d.domain, email: d.email };
      fSessionRef.current = fs; setFSession(fs); saveInboxSession("freemail", fs); return fs;
    } catch { return null; }
  }, []);

  const createOnDomain = useCallback(async (domain: string, prov: InboxProv): Promise<boolean> => {
    if (prov === "guerrilla") {
      const gs = await createGInbox();
      if (!gs) return false;
      try {
        const r = await fetch("/api/guerrilla/set-user", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: gs.user, domain, sid_token: gs.sid }),
        });
        if (r.ok) {
          const d = await r.json() as GuerrillaInbox;
          if (d.email) {
            const updated = { sid: d.sid_token ?? gs.sid, user: d.user ?? gs.user, domain: d.domain ?? domain, email: d.email };
            gSessionRef.current = updated; setGSession(updated);
          }
        }
      } catch {}
      activeProvRef.current = "guerrilla"; setActiveProv("guerrilla");
      await fetchGMsgs(gSessionRef.current?.sid ?? gs.sid);
    } else if (prov === "onesecmail") {
      const os = await createOInbox(undefined, domain);
      if (!os) return false;
      activeProvRef.current = "onesecmail"; setActiveProv("onesecmail");
      await fetchOMsgs(os.login, os.domain);
    } else {
      const fs = await createFInbox(undefined, domain);
      if (!fs) return false;
      activeProvRef.current = "freemail"; setActiveProv("freemail");
      await fetchFMsgs(fs.login, fs.domain);
    }
    return true;
  }, [createGInbox, createOInbox, createFInbox, fetchGMsgs, fetchOMsgs, fetchFMsgs]);

  const initInbox = useCallback(async () => {
    // Try to restore a persisted session first
    const saved = loadInboxSession();
    if (saved) {
      if (saved.prov === "guerrilla" && saved.sid) {
        const gs: GSession = { sid: saved.sid, user: saved.user, domain: saved.domain, email: saved.email };
        gSessionRef.current = gs; setGSession(gs);
        activeProvRef.current = "guerrilla"; setActiveProv("guerrilla");
        setCreating(false);
        await fetchGMsgs(saved.sid);
        startPolling();
        return;
      } else if (saved.prov === "onesecmail") {
        const os: OSession = { login: saved.user, domain: saved.domain, email: saved.email, domains: O_DOMAINS };
        oSessionRef.current = os; setOSession(os);
        activeProvRef.current = "onesecmail"; setActiveProv("onesecmail");
        setCreating(false);
        await fetchOMsgs(saved.user, saved.domain);
        startPolling();
        return;
      } else if (saved.prov === "freemail") {
        const fs: FSession = { login: saved.user, domain: saved.domain, email: saved.email };
        fSessionRef.current = fs; setFSession(fs);
        activeProvRef.current = "freemail"; setActiveProv("freemail");
        setCreating(false);
        await fetchFMsgs(saved.user, saved.domain);
        startPolling();
        return;
      }
    }
    setCreating(true); setError(null);
    const { domain, prov } = pickRandomDomain();
    const ok = await createOnDomain(domain, prov);
    if (!ok) { setError("Could not create inbox. Please try again."); setCreating(false); return; }
    startPolling();
    setCreating(false);
  }, [createOnDomain, startPolling, fetchGMsgs, fetchOMsgs]);

  const newAddress = useCallback(async () => {
    clearInboxSession();
    setCreating(true); setError(null);
    setGMessages([]); setOMessages([]); setSelectedG(null); setSelectedO(null); setSelectedId(null);
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    const { domain, prov } = pickRandomDomain();
    const ok = await createOnDomain(domain, prov);
    if (!ok) { setError("Could not create new inbox."); setCreating(false); return; }
    startPolling();
    setCreating(false);
  }, [createOnDomain, startPolling]);

  // ── domain switching ───────────────────────────────────────────────
  const switchDomain = useCallback(async (newDomain: string) => {
    setShowDomainDrop(false);
    const isG = G_DOMAINS.includes(newDomain);
    const isO = O_DOMAINS.includes(newDomain);
    const newProv: InboxProv = isG ? "guerrilla" : isO ? "onesecmail" : "freemail";
    setSelectedG(null); setSelectedO(null); setSelectedF(null); setSelectedId(null);

    if (isG) {
      if (gSession) {
        try {
          const r = await fetch("/api/guerrilla/set-user", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: gSession.user, domain: newDomain, sid_token: gSession.sid }),
          });
          const d = await r.json() as GuerrillaInbox & { error?: string };
          if (r.ok && d.email) {
            const gs = { sid: d.sid_token ?? gSession.sid, user: d.user ?? gSession.user, domain: d.domain ?? newDomain, email: d.email };
            gSessionRef.current = gs; setGSession(gs); setGMessages([]);
            toast({ title: "Domain switched!", description: d.email });
          }
        } catch { toast({ title: "Network error", variant: "destructive" }); }
      } else {
        const gs = await createGInbox(oSession?.login ?? fSession?.login);
        if (!gs) { toast({ title: "Could not switch domain", variant: "destructive" }); return; }
      }
    } else if (isO) {
      const currentLogin = oSession?.login ?? gSession?.user ?? fSession?.login;
      try {
        const r = await fetch("/api/onesecmail/set-address", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: currentLogin, domain: newDomain }),
        });
        const d = await r.json() as OSession & { error?: string };
        if (r.ok && d.email) {
          const os = { login: d.login, domain: d.domain, email: d.email, domains: d.domains ?? O_DOMAINS };
          oSessionRef.current = os; setOSession(os); setOMessages([]);
          toast({ title: "Domain switched!", description: d.email });
        }
      } catch { toast({ title: "Network error", variant: "destructive" }); }
    } else {
      // Freemail domain — preserve username if possible
      const currentLogin = fSession?.login ?? oSession?.login ?? gSession?.user;
      try {
        const r = await fetch("/api/freemail/set-address", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: currentLogin, domain: newDomain }),
        });
        const d = await r.json() as FSession & { error?: string };
        if (r.ok && d.email) {
          const fs: FSession = { login: d.login, domain: d.domain, email: d.email };
          fSessionRef.current = fs; setFSession(fs); setFMessages([]);
          saveInboxSession("freemail", fs);
          toast({ title: "Domain switched!", description: d.email });
        } else {
          // Fallback: generate fresh login
          const fs = await createFInbox(undefined, newDomain);
          if (!fs) { toast({ title: "Could not switch domain", variant: "destructive" }); return; }
          setFMessages([]);
        }
      } catch { toast({ title: "Network error", variant: "destructive" }); }
    }

    activeProvRef.current = newProv;
    setActiveProv(newProv);
    startPolling();
  }, [gSession, oSession, fSession, createGInbox, createFInbox, toast, startPolling]);

  // ── custom username ────────────────────────────────────────────────
  const applyCustomUser = useCallback(async () => {
    const u = customUser.trim();
    if (!u) return;
    setShowCustomUser(false); setCustomUser("");

    if (activeProv === "guerrilla" && gSession) {
      try {
        const r = await fetch("/api/guerrilla/set-user", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: u, domain: gSession.domain, sid_token: gSession.sid }),
        });
        const d = await r.json() as GuerrillaInbox & { error?: string };
        if (r.ok && d.email) {
          const gs = { sid: d.sid_token ?? gSession.sid, user: d.user ?? u, domain: d.domain ?? gSession.domain, email: d.email };
          gSessionRef.current = gs; setGSession(gs); setGMessages([]); setSelectedG(null);
          toast({ title: "Username set!", description: d.email });
        } else { toast({ title: "Error", description: d.error ?? "Could not update username.", variant: "destructive" }); }
      } catch { toast({ title: "Network error", variant: "destructive" }); }
    } else if (activeProv === "onesecmail" && oSession) {
      try {
        const r = await fetch("/api/onesecmail/set-address", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: u, domain: oSession.domain }),
        });
        const d = await r.json() as OSession & { error?: string };
        if (r.ok && d.email) {
          const os = { login: d.login, domain: d.domain, email: d.email, domains: d.domains ?? O_DOMAINS };
          oSessionRef.current = os; setOSession(os); setOMessages([]); setSelectedO(null);
          toast({ title: "Username set!", description: d.email });
        } else { toast({ title: "Error", description: d.error ?? "Could not update username.", variant: "destructive" }); }
      } catch { toast({ title: "Network error", variant: "destructive" }); }
    } else if (activeProv === "freemail" && fSession) {
      try {
        const r = await fetch("/api/freemail/set-address", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: u, domain: fSession.domain }),
        });
        const d = await r.json() as FSession & { error?: string };
        if (r.ok && d.email) {
          const fs: FSession = { login: d.login, domain: d.domain, email: d.email };
          fSessionRef.current = fs; setFSession(fs); setFMessages([]); setSelectedF(null);
          saveInboxSession("freemail", fs);
          toast({ title: "Username set!", description: d.email });
        } else { toast({ title: "Error", description: d.error ?? "Could not update username.", variant: "destructive" }); }
      } catch { toast({ title: "Network error", variant: "destructive" }); }
    }
  }, [activeProv, gSession, oSession, fSession, customUser, toast]);

  // ── message opening ────────────────────────────────────────────────
  const openGMessage = async (msg: GuerrillaMessage) => {
    if (!gSession) return;
    setSelectedId(msg.mail_id); setLoadingMsg(true); setSelectedG(null); setSelectedO(null);
    try {
      const r = await fetch(`/api/guerrilla/message/${msg.mail_id}?sid_token=${encodeURIComponent(gSession.sid)}`);
      if (r.ok) {
        const d = await r.json() as GuerrillaFullMessage;
        setSelectedG(d);
        setGMessages(ms => ms.map(m => m.mail_id === msg.mail_id ? { ...m, mail_read: "1" } : m));
      } else { setSelectedG({ body: "", from: msg.mail_from, subject: msg.mail_subject }); }
    } catch { setSelectedG({ body: "", from: msg.mail_from, subject: msg.mail_subject }); }
    finally { setLoadingMsg(false); }
  };

  const openOMessage = async (msg: OMsg) => {
    if (!oSession) return;
    setSelectedId(String(msg.id)); setLoadingMsg(true); setSelectedG(null); setSelectedO(null);
    try {
      const r = await fetch(`/api/onesecmail/message/${msg.id}?login=${encodeURIComponent(oSession.login)}&domain=${encodeURIComponent(oSession.domain)}`);
      if (r.ok) setSelectedO(await r.json() as OFullMsg);
      else setSelectedO({ ...msg, body: "" });
    } catch { setSelectedO({ ...msg, body: "" }); }
    finally { setLoadingMsg(false); }
  };

  // ── message opening ────────────────────────────────────────────────
  const openFMessage = async (msg: FMsg) => {
    if (!fSession) return;
    setSelectedId(msg.id); setLoadingMsg(true); setSelectedG(null); setSelectedO(null); setSelectedF(null);
    try {
      const r = await fetch(`/api/freemail/message/${encodeURIComponent(msg.id)}?login=${encodeURIComponent(fSession.login)}&domain=${encodeURIComponent(fSession.domain)}`);
      if (r.ok) setSelectedF(await r.json() as FFullMsg);
      else setSelectedF({ ...msg, body: "" });
    } catch { setSelectedF({ ...msg, body: "" }); }
    finally { setLoadingMsg(false); }
  };

  const copyAddress = () => {
    const email = activeProv === "guerrilla" ? gSession?.email : activeProv === "onesecmail" ? oSession?.email : fSession?.email;
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: email });
  };

  const refresh = () => {
    if (activeProv === "guerrilla" && gSession) fetchGMsgs(gSession.sid);
    else if (activeProv === "onesecmail" && oSession) fetchOMsgs(oSession.login, oSession.domain);
    else if (activeProv === "freemail" && fSession) fetchFMsgs(fSession.login, fSession.domain);
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initInbox();
  }, [initInbox]);

  useEffect(() => () => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  }, []);

  // ── derived display values ─────────────────────────────────────────
  const currentEmail = activeProv === "guerrilla" ? gSession?.email : activeProv === "onesecmail" ? oSession?.email : fSession?.email;
  const currentUser  = activeProv === "guerrilla" ? gSession?.user  : activeProv === "onesecmail" ? oSession?.login : fSession?.login;
  const currentDomain = activeProv === "guerrilla" ? gSession?.domain : activeProv === "onesecmail" ? oSession?.domain : fSession?.domain;
  const currentPill  = { label: "Temp Mail", color: "text-cyan-400", ring: "focus:ring-cyan-400/30", btn: "bg-cyan-500 hover:bg-cyan-400 text-black", dot: "bg-cyan-400" };

  const gUnread = gMessages.filter(m => m.mail_read === "0").length;
  const unread = activeProv === "guerrilla" ? gUnread : 0;

  const activeMessages = activeProv === "guerrilla" ? gMessages : activeProv === "onesecmail" ? oMessages : fMessages;
  const selectedMsg = activeProv === "guerrilla" ? selectedG : activeProv === "onesecmail" ? selectedO : selectedF;
  const selectedFrom = activeProv === "guerrilla" ? selectedG?.from : activeProv === "onesecmail" ? (selectedO as OFullMsg | null)?.from : (selectedF as FFullMsg | null)?.from;
  const selectedSubject = activeProv === "guerrilla" ? selectedG?.subject : activeProv === "onesecmail" ? (selectedO as OFullMsg | null)?.subject : (selectedF as FFullMsg | null)?.subject;
  const selectedBody = activeProv === "guerrilla"
    ? (selectedG?.body ?? "")
    : activeProv === "onesecmail"
    ? (() => { const s = selectedO as OFullMsg | null; return s?.htmlBody ?? s?.textBody ?? s?.body ?? ""; })()
    : (() => { const s = selectedF as FFullMsg | null; return s?.htmlBody ?? s?.textBody ?? s?.body ?? ""; })();
  const selectedIsHtml = activeProv === "guerrilla"
    || !!(selectedO as OFullMsg | null)?.htmlBody
    || !!(selectedF as FFullMsg | null)?.htmlBody;

  // All domains for the unified picker
  const ALL_DOMAINS_GROUPED = [
    { group: "Group A", color: "text-cyan-400", domains: G_DOMAINS },
    { group: "Group B", color: "text-cyan-400", domains: O_DOMAINS },
    { group: "Group C", color: "text-cyan-400", domains: F_DOMAINS },
  ];

  return (
    <div className="space-y-4">
      {/* Address card */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-cyan-400/10 border border-cyan-400/20">
            <Mail className={`h-4 w-4 ${currentPill.color}`} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold flex items-center gap-1.5">
              Your temporary email
            </p>
            {currentEmail ? (
              <div className="flex flex-wrap items-center gap-0.5 font-mono text-base font-semibold">
                <span className="text-foreground">{currentUser}</span>
                <span className="text-muted-foreground">@</span>
                <span className={currentPill.color}>{currentDomain}</span>
              </div>
            ) : (
              <div className="h-6 bg-muted/60 rounded animate-pulse w-56 mt-1" />
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 mt-1">
            <Clock className="h-3 w-3" />{countdown}s
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={copyAddress} disabled={!currentEmail} size="sm"
            className={`text-xs gap-1.5 font-semibold ${currentPill.btn}`}>
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Address"}
          </Button>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loadingMsgs || !currentEmail} className="text-xs gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loadingMsgs ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={newAddress} disabled={creating} className="text-xs gap-1.5">
            <Shuffle className="h-3.5 w-3.5" />{creating ? "Creating…" : "New Address"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCustomUser(v => !v)} disabled={!currentEmail} className="text-xs gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />Custom Username
          </Button>

          {/* 16-domain picker */}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowDomainDrop(v => !v)} disabled={!currentEmail} className="text-xs gap-1.5">
              <Zap className={`h-3.5 w-3.5 ${currentPill.color}`} />
              {currentDomain ? `@${currentDomain}` : "Choose domain"}
              <ChevronDown className="h-3 w-3" />
            </Button>
            {showDomainDrop && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden min-w-60 max-h-80 overflow-y-auto">
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/30">Available domains</div>
                {ALL_DOMAINS_GROUPED.flatMap(grp => grp.domains).map(d => (
                  <button key={d} onClick={() => switchDomain(d)}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-muted/60 transition-colors font-mono border-b border-border/20 last:border-b-0 ${d === currentDomain ? "text-cyan-400 font-semibold bg-muted/20" : "text-foreground/80"}`}>
                    @{d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showCustomUser && (
          <div className="flex gap-2 items-center pt-1 border-t border-border/40">
            <input
              value={customUser}
              onChange={e => setCustomUser(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyCustomUser()}
              placeholder="Enter custom username…"
              className={`flex-1 min-w-0 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 ${currentPill.ring}`}
            />
            <Button size="sm" onClick={applyCustomUser} disabled={!customUser.trim()} className={`text-xs font-semibold shrink-0 ${currentPill.btn}`}>Set</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowCustomUser(false); setCustomUser(""); }} className="text-xs shrink-0">Cancel</Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <Button size="sm" variant="outline" onClick={initInbox} disabled={creating}
            className="text-xs gap-1.5 border-red-500/40 text-red-300 hover:bg-red-500/10 shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${creating ? "animate-spin" : ""}`} />Retry
          </Button>
        </div>
      )}

      {/* Split inbox view */}
      <div className="grid md:grid-cols-5 gap-3 min-h-[380px]">
        <div className="md:col-span-2 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Inbox</span>
              {unread > 0 && <span className={`h-4 min-w-4 px-1 text-[10px] rounded-full flex items-center justify-center font-bold ${currentPill.btn}`}>{unread}</span>}
            </div>
            <button onClick={refresh} disabled={loadingMsgs}
              className="h-7 w-7 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 flex items-center justify-center transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loadingMsgs ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingMsgs && activeMessages.length === 0 && (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking inbox…
              </div>
            )}
            {!loadingMsgs && activeMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                <MailOpen className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/60">No messages yet</p>
                <p className="text-xs text-muted-foreground/40">Send an email to this address</p>
              </div>
            )}
            {activeProv === "guerrilla" && gMessages.map(msg => (
              <button key={msg.mail_id} onClick={() => openGMessage(msg)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 border-b border-border/30 last:border-b-0 ${selectedId === msg.mail_id ? "bg-muted/20" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground/70 truncate">{msg.mail_from || "Unknown"}</p>
                    <p className={`text-sm truncate mt-0.5 ${msg.mail_read === "0" ? "font-semibold text-foreground" : "text-foreground/70"}`}>{msg.mail_subject || "(No subject)"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">{timeAgo(msg.mail_timestamp)}</span>
                </div>
              </button>
            ))}
            {activeProv === "onesecmail" && oMessages.map(msg => (
              <button key={msg.id} onClick={() => openOMessage(msg)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 border-b border-border/30 last:border-b-0 ${selectedId === String(msg.id) ? "bg-muted/20" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground/70 truncate">{msg.from || "Unknown"}</p>
                    <p className="text-sm truncate mt-0.5 font-semibold text-foreground">{msg.subject || "(No subject)"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">{timeAgo(msg.date)}</span>
                </div>
              </button>
            ))}
            {activeProv === "freemail" && fMessages.map(msg => (
              <button key={msg.id} onClick={() => openFMessage(msg)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 border-b border-border/30 last:border-b-0 ${selectedId === msg.id ? "bg-muted/20" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground/70 truncate">{msg.from || "Unknown"}</p>
                    <p className="text-sm truncate mt-0.5 font-semibold text-foreground">{msg.subject || "(No subject)"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">{timeAgo(msg.date)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
          {selectedMsg ? (
            <>
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 bg-muted/20">
                <button onClick={() => { setSelectedG(null); setSelectedO(null); setSelectedF(null); setSelectedId(null); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-semibold truncate">{selectedSubject || "(No subject)"}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedFrom}</p>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4" style={{ maxHeight: "360px" }}>
                {selectedBody ? (
                  selectedIsHtml
                    ? <div className="prose prose-invert prose-sm max-w-none text-sm" dangerouslySetInnerHTML={{ __html: selectedBody }} />
                    : <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{selectedBody}</pre>
                ) : <p className="text-sm text-muted-foreground">(Empty message)</p>}
              </div>
            </>
          ) : loadingMsg ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm flex-1">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-6 gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center">
                <Mail className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground/60">Select a message to read it</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Messages appear automatically when received</p>
              </div>
              {currentEmail && (
                <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Auto-refreshing every {REFRESH_MS / 1000}s
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: "24 domains total" },
          { label: "Session-persistent inbox" },
          { label: "Custom usernames supported" },
          { label: `Auto-refresh ${REFRESH_MS / 1000}s` },
        ].map(({ label }) => (
          <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
            <Mail className="h-3 w-3 text-cyan-400" />{label}
          </div>
        ))}
      </div>
    </div>
  );
}



// ── Tab 2: Temp Gmail (temp.tf — free, no API key) ─────────────────

const GMAIL_REFRESH_MS = 15000;

interface TempTfMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  bodyContentType: "html" | "text";
  hasAttachments: boolean;
}

function TempGmailTab() {
  const [email, setEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<TempTfMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(GMAIL_REFRESH_MS / 1000);
  const [gmailType, setGmailType] = useState<"dot" | "plus">("dot");
  const { toast } = useToast();
  const initialized = useRef(false);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailRef = useRef<string | null>(null);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const fetchMessages = useCallback(async (addr: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const r = await fetch("/api/temptf/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr }),
      });
      const d = await r.json() as { messages?: TempTfMessage[]; error?: string };
      if (r.ok) {
        const incoming = d.messages ?? [];
        setMessages((prev) => {
          const byId = new Map(prev.map((m) => [m.id, m]));
          incoming.forEach((m) => byId.set(m.id, m));
          return Array.from(byId.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
        setError(null);
      } else if (r.status === 429) {
        if (!silent) setError("Rate limited — please wait a moment.");
      } else {
        if (!silent) setError(d.error ?? "Inbox check failed. Please try again.");
      }
    } catch { if (!silent) setError("Network error. Please try again."); }
    finally { if (!silent) setLoadingMsgs(false); }
  }, []);

  const stopPolling = useCallback(() => {
    if (refreshTimer.current) { clearInterval(refreshTimer.current); refreshTimer.current = null; }
    if (countdownTimer.current) { clearInterval(countdownTimer.current); countdownTimer.current = null; }
  }, []);

  const startPolling = useCallback((addr: string) => {
    stopPolling();
    setCountdown(GMAIL_REFRESH_MS / 1000);
    refreshTimer.current = setInterval(() => {
      if (emailRef.current) fetchMessages(emailRef.current, true);
      setCountdown(GMAIL_REFRESH_MS / 1000);
    }, GMAIL_REFRESH_MS);
    countdownTimer.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? GMAIL_REFRESH_MS / 1000 : c - 1));
    }, 1000);
  }, [fetchMessages, stopPolling]);

  const generate = useCallback(async () => {
    stopPolling();
    setGenerating(true);
    setError(null);
    setEmail(null);
    setMessages([]);
    setSelectedId(null);
    emailRef.current = null;
    try {
      const r = await fetch(`/api/temptf/generate?type=${gmailType}`);
      const d = await r.json() as { email?: string; error?: string };
      if (!r.ok || !d.email) {
        setError(d.error ?? "Failed to generate address. Please try again.");
        return;
      }
      emailRef.current = d.email;
      setEmail(d.email);
      await fetchMessages(d.email);
      startPolling(d.email);
    } catch { setError("Network error. Please try again."); }
    finally { setGenerating(false); }
  }, [fetchMessages, startPolling, stopPolling, gmailType]);

  const copyAddress = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: email });
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    generate();
  }, [generate]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const unread = 0; // temp.tf doesn't track read state; all shown as read once visible

  return (
    <div className="space-y-4">
      {/* Address card */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="h-4 w-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Your temporary @gmail.com address</p>
            {generating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating address…
              </div>
            ) : email ? (
              <p className="font-mono text-base font-semibold text-foreground break-all">{email}</p>
            ) : (
              <p className="text-sm text-muted-foreground/60">—</p>
            )}
          </div>
          {email && (
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />{countdown}s
              </div>
            </div>
          )}
        </div>

        {/* Type selector + action buttons */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
          {/* Dot / Plus toggle */}
          <div className="flex rounded-lg border border-border/60 overflow-hidden text-xs">
            <button
              onClick={() => setGmailType("dot")}
              className={`px-3 py-1.5 font-medium transition-colors ${gmailType === "dot" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
            >
              Dot trick
            </button>
            <button
              onClick={() => setGmailType("plus")}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-border/60 ${gmailType === "plus" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
            >
              Plus alias
            </button>
          </div>

          <Button onClick={copyAddress} disabled={!email} size="sm" className="text-xs gap-1.5 bg-red-500 hover:bg-red-400 text-white font-semibold">
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => email && fetchMessages(email)} disabled={loadingMsgs || !email} className="text-xs gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loadingMsgs ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => generate()} disabled={generating} className="text-xs gap-1.5">
            <Shuffle className="h-3.5 w-3.5" />{generating ? "Generating…" : "New Address"}
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-400 shrink-0" />
          <p className="text-sm text-orange-300 flex-1">{error}</p>
          <Button size="sm" variant="outline"
            onClick={() => email ? fetchMessages(email) : generate()}
            disabled={loadingMsgs || generating}
            className="text-xs gap-1.5 border-orange-500/40 text-orange-300 hover:bg-orange-500/10 shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${loadingMsgs ? "animate-spin" : ""}`} />Retry
          </Button>
        </div>
      )}

      {/* Split inbox view */}
      {email && (
        <div className="grid md:grid-cols-5 gap-3 min-h-[340px]">
          {/* Message list */}
          <div className="md:col-span-2 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Inbox</span>
                {messages.length > 0 && (
                  <span className="h-4 min-w-4 px-1 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center font-bold">{messages.length}</span>
                )}
              </div>
              <button onClick={() => email && fetchMessages(email)} disabled={loadingMsgs}
                className="h-7 w-7 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 flex items-center justify-center transition-colors disabled:opacity-50">
                <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loadingMsgs ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingMsgs && messages.length === 0 && (
                <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking inbox…
                </div>
              )}
              {!loadingMsgs && messages.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
                  <MailOpen className="h-7 w-7 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground/60">No messages yet</p>
                  <p className="text-xs text-muted-foreground/40">Send an email here — auto-checks every {GMAIL_REFRESH_MS / 1000}s</p>
                </div>
              )}
              {messages.map((msg) => (
                <button key={msg.id} onClick={() => setSelectedId(selectedId === msg.id ? null : msg.id)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 border-b border-border/30 last:border-b-0 ${selectedId === msg.id ? "bg-muted/20" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground/70 truncate">{msg.from || "Unknown"}</p>
                      <p className="text-sm truncate mt-0.5 font-semibold text-foreground">{msg.subject || "(No subject)"}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">{timeAgo(msg.date)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message reader — body comes directly from inbox response */}
          <div className="md:col-span-3 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 bg-muted/20">
                  <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-semibold truncate">{selected.subject || "(No subject)"}</p>
                    <p className="text-xs text-muted-foreground truncate">{selected.from}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4" style={{ maxHeight: "340px" }}>
                  {selected.body ? (
                    selected.bodyContentType === "html" ? (
                      <div className="prose prose-invert prose-sm max-w-none text-sm" dangerouslySetInnerHTML={{ __html: selected.body }} />
                    ) : (
                      <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{selected.body}</pre>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground/60">(Empty message)</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-6 gap-3">
                <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground/60">Select a message to read it</p>
                {email && (
                  <div className="flex items-center gap-2 text-xs bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg px-3 py-2">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    Auto-refreshing every {GMAIL_REFRESH_MS / 1000}s
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: CheckCircle2, label: "No API key needed" },
          { icon: Mail,         label: "Real @gmail.com address" },
          { icon: Clock,        label: `Auto-refresh ${GMAIL_REFRESH_MS / 1000}s` },
          { icon: Zap,          label: "Full message body" },
        ].map(({ icon: Ic, label }) => (
          <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
            <Ic className="h-3 w-3 text-red-400" />{label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Gmail Tricks (pure client-side) ─────────────────────────

function GmailTricksTab() {
  const [inputEmail, setInputEmail] = useState("");
  const [username, setUsername] = useState("");
  const [dotVariantsList, setDotVariantsList] = useState<string[]>([]);
  const [plusTagsList, setPlusTagsList] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const { toast } = useToast();

  const generate = () => {
    const raw = inputEmail.trim().toLowerCase();
    if (!raw) return;
    const user = raw.includes("@") ? raw.split("@")[0] : raw;
    const clean = user.replace(/\./g, "");
    setUsername(clean);
    setDotVariantsList(dotVariants(clean));
    setPlusTagsList(PLUS_TAGS.map((tag) => `${clean}+${tag}@gmail.com`));
    setShowAll(false);
  };

  const copyOne = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(addr); setTimeout(() => setCopied(null), 1500);
    toast({ title: "Copied!", description: addr });
  };

  const displayedDots = showAll ? dotVariantsList : dotVariantsList.slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold mb-1">Enter your Gmail address</h2>
          <p className="text-xs text-muted-foreground">We'll generate all the dot-trick variants and plus-tag aliases that all deliver to the same inbox — useful for tracking signups or bypassing duplicate checks.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-muted/30 border border-border/60 rounded-lg px-3 py-2.5">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="yourname@gmail.com"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <Button onClick={generate} disabled={!inputEmail.trim()} className="gap-1.5 shrink-0 text-xs">
            <Hash className="h-4 w-4" />Generate
          </Button>
        </div>
      </div>

      {username && (
        <>
          {/* Dot Trick */}
          <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Hash className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Dot Trick</h3>
                  <p className="text-[11px] text-muted-foreground">Gmail ignores dots — all {dotVariantsList.length} variants deliver to <span className="font-mono text-foreground/70">{username}@gmail.com</span></p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-muted/60 border border-border/50 rounded-full px-2.5 py-0.5 font-semibold">{dotVariantsList.length} variants</span>
            </div>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {displayedDots.map((addr) => (
                <button key={addr} onClick={() => copyOne(addr)} className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/40 transition-all text-left">
                  <span className="font-mono text-xs text-foreground/80 truncate">{addr}</span>
                  <span className="shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors">
                    {copied === addr ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </span>
                </button>
              ))}
            </div>
            {dotVariantsList.length > 12 && (
              <div className="px-5 pb-4 text-center">
                <button onClick={() => setShowAll(!showAll)} className="text-xs text-primary/70 hover:text-primary underline underline-offset-2">
                  {showAll ? "Show less" : `Show all ${dotVariantsList.length} variants`}
                </button>
              </div>
            )}
          </div>

          {/* Plus Trick */}
          <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Plus className="h-3.5 w-3.5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Plus Trick</h3>
                  <p className="text-[11px] text-muted-foreground">Anything after + is ignored for delivery — all land in <span className="font-mono text-foreground/70">{username}@gmail.com</span></p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted/30 border border-border/60 rounded-lg px-3 py-2">
                  <span className="font-mono text-xs text-muted-foreground shrink-0">{username}+</span>
                  <input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value.replace(/[^a-z0-9._-]/gi, ""))}
                    placeholder="customtag"
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40 font-mono"
                  />
                  <span className="font-mono text-xs text-muted-foreground shrink-0">@gmail.com</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => customTag && copyOne(`${username}+${customTag.toLowerCase()}@gmail.com`)} disabled={!customTag} className="text-xs gap-1.5 border-border/60">
                  <Copy className="h-3.5 w-3.5" />Copy
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {plusTagsList.map((addr) => (
                  <button key={addr} onClick={() => copyOne(addr)} className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/40 transition-all text-left">
                    <span className="font-mono text-xs text-foreground/80 truncate">{addr}</span>
                    <span className="shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors">
                      {copied === addr ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              How Gmail tricks work
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground/70 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-blue-400" /> Dot Trick</p>
                <p>Gmail completely ignores periods in usernames. <span className="font-mono text-foreground/60">j.o.h.n@gmail.com</span> and <span className="font-mono text-foreground/60">john@gmail.com</span> are the same inbox.</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground/70 flex items-center gap-1.5"><Plus className="h-3.5 w-3.5 text-purple-400" /> Plus Trick</p>
                <p>Anything after a <span className="font-mono text-foreground/60">+</span> is ignored for delivery. <span className="font-mono text-foreground/60">john+spam@gmail.com</span> still lands in John's inbox.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {!username && (
        <div className="rounded-xl border border-dashed border-border/50 bg-card/20 p-12 flex flex-col items-center justify-center text-center gap-3">
          <Hash className="h-8 w-8 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground/60 font-medium">Enter a Gmail address above to generate tricks</p>
          <p className="text-xs text-muted-foreground/40">Dot variants and plus tags will appear here</p>
        </div>
      )}
    </div>
  );
}

// ── Per-tab page config ─────────────────────────────────────────────

const TAB_CONFIG: Record<Tab, { seoTitle: string; seoDescription: string; icon: typeof Inbox; title: string; description: string }> = {
  disposable: {
    seoTitle: "Temp Email — Free Throwaway Email Address",
    seoDescription: "Generate a free disposable email address instantly. No signup required. Switch domains and create custom usernames.",
    icon: Inbox,
    title: "Temp Email",
    description: "Instant throwaway email address with domain switching and custom usernames — no signup required.",
  },
  tempgmail: {
    seoTitle: "Temp Gmail — Temporary Gmail Address Generator",
    seoDescription: "Generate a real temporary Gmail address. Receive emails without giving out your real Gmail.",
    icon: Mail,
    title: "Temp Gmail",
    description: "Generate a real temporary Gmail address and check its inbox — no signup needed.",
  },
  gmail: {
    seoTitle: "Gmail Tricks — Dot & Plus-Tag Address Generator",
    seoDescription: "Generate Gmail dot trick and plus-tag variants from your address. Use them to filter and track emails.",
    icon: Hash,
    title: "Gmail Tricks",
    description: "Generate unlimited Gmail dot-trick and plus-tag variants from your real address — all land in the same inbox.",
  },
};

// ── Main Page ──────────────────────────────────────────────────────

export default function TempMail({ defaultTab = "disposable" }: { defaultTab?: Tab }) {
  useToolView("temp-mail");
  const cfg = TAB_CONFIG[defaultTab];

  return (
    <MiniToolLayout
      seoTitle={cfg.seoTitle}
      seoDescription={cfg.seoDescription}
      icon={cfg.icon}
      badge="Email Tool"
      title={cfg.title}
      description={cfg.description}
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      {defaultTab === "disposable" && <UnifiedInboxSection />}
      {defaultTab === "tempgmail" && <TempGmailTab />}
      {defaultTab === "gmail" && <GmailTricksTab />}
    </MiniToolLayout>
  );
}
