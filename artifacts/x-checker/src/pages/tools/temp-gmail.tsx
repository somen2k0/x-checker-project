import { useState, useCallback, useRef, useEffect } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import {
  Mail, RefreshCw, Copy, Inbox, ChevronRight, ArrowLeft,
  Clock, Loader2, MailOpen, AlertCircle, Sparkles, Shuffle,
  Plus, Hash, CheckCircle2, ExternalLink, AtSign,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

interface MailTmAccount { id: string; address: string; token: string; }
interface MailTmMessage { id: string; from: { address: string; name?: string }; subject: string; seen: boolean; createdAt: string; text?: string; html?: { content: string }[] | string; intro?: string; }
interface GuerrillaInbox { email: string; user: string; domain: string; sid_token: string; domains: string[]; }
interface GuerrillaMessage { mail_id: string; mail_from: string; mail_subject: string; mail_excerpt: string; mail_timestamp: string; mail_read: string; }

type Tab = "inbox" | "tempgmail" | "gmail";

const STORAGE_KEY = "tempmail_account_v2";
const REFRESH_MS = 15000;
const GMAIL_REFRESH_MS = 20000;

// ── Helpers ────────────────────────────────────────────────────────

function saveAccount(a: MailTmAccount) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch {} }
function loadAccount(): MailTmAccount | null { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) as MailTmAccount : null; } catch { return null; } }
function clearAccount() { try { localStorage.removeItem(STORAGE_KEY); } catch {} }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
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

// ── Guerrilla Mail message row ─────────────────────────────────────

function GuerrillaMessageRow({ msg, sid_token }: { msg: GuerrillaMessage; sid_token: string }) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (body !== null) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/guerrilla/message/${msg.mail_id}?sid_token=${encodeURIComponent(sid_token)}`);
      if (r.ok) { const d = await r.json() as { body?: string }; setBody(d.body ?? ""); }
    } catch { setBody(""); } finally { setLoading(false); }
  };

  const ts = msg.mail_timestamp
    ? new Date(parseInt(msg.mail_timestamp) * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div>
      <button onClick={toggle} className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 ${expanded ? "bg-muted/20" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground/70 truncate">{msg.mail_from || "Unknown"}</p>
            <p className={`text-sm truncate mt-0.5 ${msg.mail_read === "0" ? "font-semibold text-foreground" : "text-foreground/70"}`}>
              {msg.mail_subject || "(No subject)"}
            </p>
          </div>
          {ts && <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">{ts}</span>}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/40 bg-muted/10">
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : body ? (
            <div className="text-xs leading-relaxed mt-3 max-h-72 overflow-y-auto prose prose-invert prose-xs max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
          ) : (
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{msg.mail_excerpt}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab 1: Disposable Inbox (Guerrilla Mail — free, no API key) ────

const GUERRILLA_REFRESH_MS = 15000;
const GUERRILLA_STORAGE_KEY = "guerrilla_inbox_v1";

function saveGuerrilla(ib: GuerrillaInbox) { try { localStorage.setItem(GUERRILLA_STORAGE_KEY, JSON.stringify(ib)); } catch {} }
function loadGuerrilla(): GuerrillaInbox | null { try { const s = localStorage.getItem(GUERRILLA_STORAGE_KEY); return s ? JSON.parse(s) as GuerrillaInbox : null; } catch { return null; } }
function clearGuerrilla() { try { localStorage.removeItem(GUERRILLA_STORAGE_KEY); } catch {} }

function DisposableInbox() {
  const [inbox, setInbox] = useState<GuerrillaInbox | null>(null);
  const [messages, setMessages] = useState<GuerrillaMessage[]>([]);
  const [creating, setCreating] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(GUERRILLA_REFRESH_MS / 1000);
  const [showCustom, setShowCustom] = useState(false);
  const [customUser, setCustomUser] = useState("");
  const [settingUser, setSettingUser] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const stopTimers = () => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  };

  const startTimers = useCallback((ib: GuerrillaInbox) => {
    stopTimers();
    setCountdown(GUERRILLA_REFRESH_MS / 1000);
    refreshTimer.current = setInterval(() => {
      fetchInbox(ib, true);
      setCountdown(GUERRILLA_REFRESH_MS / 1000);
    }, GUERRILLA_REFRESH_MS);
    countdownTimer.current = setInterval(() => setCountdown((c) => (c <= 1 ? GUERRILLA_REFRESH_MS / 1000 : c - 1)), 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInbox = useCallback(async (ib: GuerrillaInbox, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const r = await fetch(`/api/guerrilla/inbox?sid_token=${encodeURIComponent(ib.sid_token)}`);
      if (r.ok) { const d = await r.json() as { messages: GuerrillaMessage[] }; setMessages(d.messages ?? []); }
    } catch {} finally { if (!silent) setLoadingMsgs(false); }
  }, []);

  const createInbox = useCallback(async () => {
    setCreating(true); setError(null); setMessages([]); setShowCustom(false); setCustomUser("");
    stopTimers();
    try {
      const r = await fetch("/api/guerrilla/new");
      const d = await r.json() as GuerrillaInbox & { error?: string };
      if (!r.ok || !d.email) { setError(d.error ?? "Could not create inbox. Please try again."); clearGuerrilla(); return; }
      setInbox(d); saveGuerrilla(d);
      toast({ title: "Inbox ready!", description: d.email });
      await fetchInbox(d);
      startTimers(d);
    } catch { setError("Network error. Please try again."); }
    finally { setCreating(false); }
  }, [fetchInbox, startTimers, toast]);

  const applyCustomUser = async () => {
    if (!inbox || !customUser.trim()) return;
    setSettingUser(true);
    try {
      const r = await fetch("/api/guerrilla/set-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: customUser.trim(), sid_token: inbox.sid_token }),
      });
      const d = await r.json() as GuerrillaInbox & { error?: string };
      if (!r.ok || !d.email) { toast({ title: "Error", description: d.error ?? "Could not set username.", variant: "destructive" }); return; }
      setInbox(d); saveGuerrilla(d); setShowCustom(false); setCustomUser("");
      toast({ title: "Username set!", description: d.email });
      fetchInbox(d, true);
    } catch { toast({ title: "Network error", description: "Please try again.", variant: "destructive" }); }
    finally { setSettingUser(false); }
  };

  const switchDomain = async (domain: string) => {
    if (!inbox) return;
    try {
      const r = await fetch("/api/guerrilla/set-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: inbox.user, domain, sid_token: inbox.sid_token }),
      });
      const d = await r.json() as GuerrillaInbox & { error?: string };
      if (r.ok && d.email) { setInbox(d); saveGuerrilla(d); fetchInbox(d, true); }
    } catch {}
  };

  useEffect(() => {
    const saved = loadGuerrilla();
    if (saved) {
      fetch(`/api/guerrilla/inbox?sid_token=${encodeURIComponent(saved.sid_token)}`)
        .then((r) => { if (r.ok) { setInbox(saved); fetchInbox(saved, true); startTimers(saved); } else createInbox(); })
        .catch(() => createInbox());
    } else {
      createInbox();
    }
    return stopTimers;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const copyAddress = () => {
    if (!inbox) return;
    navigator.clipboard.writeText(inbox.email);
    toast({ title: "Copied!", description: inbox.email });
  };

  const unread = messages.filter((m) => m.mail_read === "0").length;

  return (
    <div className="space-y-4">
      {/* Address card */}
      <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
        {/* Top: icon + address + timer */}
        <div className="px-4 py-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Your Temporary Email Address</p>
            {inbox ? (
              <div className="font-mono text-base font-semibold flex flex-wrap items-center">
                <span className="text-foreground">{inbox.user}</span>
                <span className="text-muted-foreground">@</span>
                <span className="text-cyan-400">{inbox.domain}</span>
              </div>
            ) : (
              <div className="h-6 bg-muted/60 rounded animate-pulse w-56 mt-1" />
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 mt-1">
            <Clock className="h-3 w-3" />{countdown}s
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 pb-3 flex flex-wrap gap-2 items-center">
          <Button size="sm" onClick={copyAddress} disabled={!inbox}
            className="text-xs gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-sm shadow-cyan-500/20">
            <Copy className="h-3.5 w-3.5" /> Copy Address
          </Button>
          <Button variant="outline" size="sm" onClick={() => inbox && fetchInbox(inbox)} disabled={!inbox || loadingMsgs} className="text-xs gap-1.5 border-border/60">
            <RefreshCw className={`h-3.5 w-3.5 ${loadingMsgs ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={createInbox} disabled={creating} className="text-xs gap-1.5 border-border/60">
            <Shuffle className="h-3.5 w-3.5" /> {creating ? "Creating…" : "New Address"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCustom((v) => !v)} disabled={!inbox}
            className={`text-xs gap-1.5 border-border/60 ${showCustom ? "bg-muted/50" : ""}`}>
            <AtSign className="h-3.5 w-3.5" /> Custom Username
          </Button>
          {inbox && inbox.domains.length > 1 && (
            <select value={inbox.domain} onChange={(e) => switchDomain(e.target.value)}
              className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30">
              {inbox.domains.map((d) => <option key={d} value={d}>@{d}</option>)}
            </select>
          )}
        </div>

        {/* Custom username input (inline) */}
        {showCustom && (
          <div className="px-4 pb-4 pt-1 border-t border-border/40 flex gap-2 items-center">
            <input
              value={customUser}
              onChange={(e) => setCustomUser(e.target.value.replace(/[^a-z0-9._-]/gi, ""))}
              onKeyDown={(e) => e.key === "Enter" && applyCustomUser()}
              placeholder="Enter custom username…"
              autoFocus
              className="flex-1 min-w-0 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button size="sm" onClick={applyCustomUser} disabled={!customUser.trim() || settingUser} className="text-xs shrink-0">
              {settingUser ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Set"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowCustom(false); setCustomUser(""); }} className="text-xs shrink-0">Cancel</Button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <Button size="sm" variant="ghost" onClick={createInbox} className="text-xs shrink-0">Retry</Button>
        </div>
      )}

      {/* Inbox */}
      <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inbox</span>
            {unread > 0 && (
              <span className="h-4 min-w-4 px-1 text-[10px] bg-cyan-500 text-black rounded-full flex items-center justify-center font-bold">{unread}</span>
            )}
          </div>
          <button onClick={() => inbox && fetchInbox(inbox)} disabled={loadingMsgs || !inbox}
            className="h-7 w-7 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 flex items-center justify-center transition-colors disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loadingMsgs ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loadingMsgs && messages.length === 0 && (
          <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking inbox…
          </div>
        )}
        {!loadingMsgs && messages.length === 0 && inbox && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
            <MailOpen className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/60">No messages yet</p>
            <p className="text-xs text-muted-foreground/40">Send an email to <span className="font-mono">{inbox.email}</span> and it will appear here</p>
          </div>
        )}
        <div className="divide-y divide-border/40">
          {messages.map((msg) => (
            <GuerrillaMessageRow key={msg.mail_id} msg={msg} sid_token={inbox?.sid_token ?? ""} />
          ))}
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: Mail, label: "9 domains available" },
          { icon: RefreshCw, label: `Auto-refresh ${GUERRILLA_REFRESH_MS / 1000}s` },
          { icon: AtSign, label: "Custom usernames" },
          { icon: CheckCircle2, label: "No signup needed" },
        ].map(({ icon: Ic, label }) => (
          <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
            <Ic className="h-3 w-3" />{label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Temp Gmail (via mail.tm) ───────────────────────────────

function TempGmailTab() {
  const [account, setAccount] = useState<MailTmAccount | null>(null);
  const [messages, setMessages] = useState<MailTmMessage[]>([]);
  const [selected, setSelected] = useState<MailTmMessage | null>(null);
  const [creating, setCreating] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [username, setUsername] = useState("");
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialized = useRef(false);
  const domainRef = useRef("");

  const fetchMessages = useCallback(async (acc: MailTmAccount, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const r = await fetch("/api/temp-mail/messages", { headers: { Authorization: `Bearer ${acc.token}` } });
      if (r.ok) { const d = await r.json() as { messages: MailTmMessage[] }; setMessages(d.messages ?? []); }
    } catch {} finally { if (!silent) setLoadingMsgs(false); }
  }, []);

  const startPolling = useCallback((acc: MailTmAccount) => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setCountdown(REFRESH_MS / 1000);
    refreshTimer.current = setInterval(() => { fetchMessages(acc, true); setCountdown(REFRESH_MS / 1000); }, REFRESH_MS);
    countdownTimer.current = setInterval(() => setCountdown((c) => (c <= 1 ? REFRESH_MS / 1000 : c - 1)), 1000);
  }, [fetchMessages]);

  const createInbox = useCallback(async (opts?: { username?: string; domain?: string }) => {
    setCreating(true); setError(null); setMessages([]); setSelected(null);
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    try {
      const r = await fetch("/api/temp-mail/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(opts ?? {}) });
      const d = await r.json() as { id?: string; address?: string; token?: string; error?: string };
      if (!r.ok || !d.token) { setError(d.error ?? "Could not create inbox. Please try again."); clearAccount(); return; }
      const acc: MailTmAccount = { id: d.id!, address: d.address!, token: d.token! };
      setAccount(acc); saveAccount(acc); setError(null);
      toast({ title: "Inbox ready!", description: acc.address });
      await fetchMessages(acc);
      startPolling(acc);
    } catch { setError("Network error. Please try again."); }
    finally { setCreating(false); }
  }, [fetchMessages, startPolling, toast]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch("/api/temp-mail/domains")
      .then((r) => r.json())
      .then((d: { domains: string[] }) => {
        const firstDomain = d.domains?.[0] ?? "";
        if (firstDomain) { setDomains(d.domains); setDomain(firstDomain); domainRef.current = firstDomain; }

        const saved = loadAccount();
        if (saved) {
          fetch("/api/temp-mail/messages", { headers: { Authorization: `Bearer ${saved.token}` } })
            .then((r) => {
              if (r.ok) { setAccount(saved); fetchMessages(saved, true); startPolling(saved); }
              else { clearAccount(); createInbox({ domain: firstDomain || undefined }); }
            })
            .catch(() => { setAccount(saved); startPolling(saved); });
        } else {
          createInbox({ domain: firstDomain || undefined });
        }
      })
      .catch(() => { createInbox(); });
  }, [createInbox, fetchMessages, startPolling]);

  useEffect(() => () => { if (refreshTimer.current) clearInterval(refreshTimer.current); if (countdownTimer.current) clearInterval(countdownTimer.current); }, []);

  const openMessage = async (msg: MailTmMessage) => {
    if (!account) return;
    if (msg.html || msg.text) { setSelected(msg); return; }
    setLoadingMsg(true);
    try {
      const r = await fetch(`/api/temp-mail/messages/${msg.id}`, { headers: { Authorization: `Bearer ${account.token}` } });
      if (r.ok) { const d = await r.json() as MailTmMessage; setSelected(d); setMessages((ms) => ms.map((m) => m.id === msg.id ? { ...m, seen: true } : m)); }
    } catch {} finally { setLoadingMsg(false); }
  };

  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Email address copied to clipboard." });
  };

  const [localPart, domainPart] = account ? account.address.split("@") : ["", ""];
  const unread = messages.filter((m) => !m.seen).length;

  const getHtml = (msg: MailTmMessage): string | null => {
    if (!msg.html) return null;
    if (typeof msg.html === "string") return msg.html;
    if (Array.isArray(msg.html)) return msg.html.map((h) => (typeof h === "string" ? h : (h as { content: string }).content ?? "")).join("");
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Address bar */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="h-4 w-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Your temporary email address</p>
            {account ? (
              <div className="flex flex-wrap items-center gap-0.5 font-mono text-base font-semibold">
                <span className="text-foreground">{localPart}</span>
                <span className="text-muted-foreground">@</span>
                <span className="text-red-400">{domainPart}</span>
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
          <Button onClick={copyAddress} disabled={!account} size="sm" className="text-xs gap-1.5 bg-red-500 hover:bg-red-400 text-white font-semibold">
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Address"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => createInbox({ username: username || undefined, domain: domain || undefined })} disabled={creating} className="text-xs gap-1.5 shrink-0">
            <Shuffle className="h-3.5 w-3.5" />{creating ? "Creating…" : "New Inbox"}
          </Button>
        </div>

        {/* Custom options */}
        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-border/40">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Custom username (optional)"
            className="flex-1 min-w-32 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {domains.length > 0 && (
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {domains.map((d) => <option key={d} value={d}>@{d}</option>)}
            </select>
          )}
        </div>
      </div>

      {error && !account && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-300">Could not create inbox</p>
            <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => createInbox()} disabled={creating} className="text-xs gap-1.5 border-red-500/40 text-red-300 hover:bg-red-500/10 shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${creating ? "animate-spin" : ""}`} />Try Again
          </Button>
        </div>
      )}

      {/* Split view: list + reader */}
      <div className="grid md:grid-cols-5 gap-3 min-h-[400px]">
        {/* Message list */}
        <div className="md:col-span-2 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Inbox</span>
              {unread > 0 && <span className="h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">{unread}</span>}
            </div>
            <button onClick={() => account && fetchMessages(account)} disabled={loadingMsgs} className="h-7 w-7 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 flex items-center justify-center transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loadingMsgs ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingMsgs && messages.length === 0 && (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking inbox…
              </div>
            )}
            {!loadingMsgs && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                <MailOpen className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/60">No messages yet</p>
                <p className="text-xs text-muted-foreground/40">Send an email to this address and it will appear here</p>
              </div>
            )}
            {messages.map((msg) => (
              <button key={msg.id} onClick={() => openMessage(msg)} className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 border-b border-border/30 last:border-b-0 ${selected?.id === msg.id ? "bg-muted/20" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground/70 truncate">{msg.from?.address ?? "Unknown"}</p>
                    <p className={`text-sm truncate mt-0.5 ${!msg.seen ? "font-semibold text-foreground" : "text-foreground/70"}`}>{msg.subject || "(No subject)"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">{timeAgo(msg.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message reader */}
        <div className="md:col-span-3 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-3 bg-muted/20">
                <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-semibold truncate">{selected.subject || "(No subject)"}</p>
                  <p className="text-xs text-muted-foreground truncate">{selected.from?.address}</p>
                </div>
              </div>
              {loadingMsg ? (
                <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm flex-1">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-4" style={{ maxHeight: "360px" }}>
                  {getHtml(selected) ? (
                    <div className="prose prose-invert prose-sm max-w-none text-sm" dangerouslySetInnerHTML={{ __html: getHtml(selected)! }} />
                  ) : (
                    <pre className="text-xs font-sans text-muted-foreground leading-relaxed whitespace-pre-wrap">{selected.text ?? selected.intro ?? "(Empty message)"}</pre>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-6 gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center">
                <Mail className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground/60">Select a message to read it</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Messages appear automatically when received</p>
              </div>
              {account && (
                <div className="flex items-center gap-2 text-xs bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg px-3 py-2">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Auto-refreshing every {REFRESH_MS / 1000}s
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2">
        {[{ icon: Mail, label: "No signup required" }, { icon: RefreshCw, label: `Auto-refresh ${REFRESH_MS / 1000}s` }, { icon: CheckCircle2, label: "Session saved" }, { icon: Shuffle, label: "Multiple domains" }].map(({ icon: Ic, label }) => (
          <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
            <Ic className="h-3 w-3" />{label}
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
      {/* Input */}
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
              {/* Custom tag */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted/30 border border-border/60 rounded-lg px-3 py-2">
                  <span className="font-mono text-xs text-muted-foreground shrink-0">{username}+</span>
                  <input
                    id="custom-tag-input"
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

          {/* Explanation */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              How Gmail tricks work
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground/70 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-blue-400" /> Dot Trick</p>
                <p>Gmail completely ignores periods in usernames. <span className="font-mono text-foreground/60">j.o.h.n@gmail.com</span> and <span className="font-mono text-foreground/60">john@gmail.com</span> are the same inbox. Useful for registering on sites that reject duplicate addresses.</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground/70 flex items-center gap-1.5"><Plus className="h-3.5 w-3.5 text-purple-400" /> Plus Trick</p>
                <p>Anything after a <span className="font-mono text-foreground/60">+</span> is ignored for delivery. <span className="font-mono text-foreground/60">john+spam@gmail.com</span> still lands in John's inbox. Use it to create Gmail filters and track who shares your address.</p>
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

// ── Main Page ──────────────────────────────────────────────────────

export default function TempMail() {
  const [tab, setTab] = useState<Tab>("inbox");
  useToolView("temp-mail");

  const TABS = [
    { key: "inbox" as Tab, label: "Disposable Inbox", icon: Inbox, color: "text-cyan-400" },
    { key: "tempgmail" as Tab, label: "Temp Gmail", icon: Mail, color: "text-red-400" },
    { key: "gmail" as Tab, label: "Gmail Tricks", icon: Hash, color: "" },
  ];

  return (
    <MiniToolLayout
      seoTitle="Temp Mail — Disposable Email & Gmail Tricks"
      seoDescription="Free temporary email with domain switching and custom usernames. Plus Gmail dot trick and plus-tag generator — all free, no signup required."
      icon={Inbox}
      badge="Email Tool"
      title="Temp Mail"
      description="Disposable inbox with domain switching and custom usernames. Plus Gmail dot & plus-tag tricks — all free, no signup."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-muted/40 border border-border/60 rounded-xl w-fit flex-wrap">
          {TABS.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${tab === key ? "bg-background border border-border/60 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              {label}
            </button>
          ))}
        </div>

        {tab === "inbox" && <DisposableInbox />}
        {tab === "tempgmail" && <TempGmailTab />}
        {tab === "gmail" && <GmailTricksTab />}
      </div>
    </MiniToolLayout>
  );
}
