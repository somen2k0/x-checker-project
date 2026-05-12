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

interface GmailnatorMessage { mid: string; from?: string; subject?: string; date?: string; }
interface GmailnatorFullMessage { content?: string; from?: string; subject?: string; date?: string; }

type GmailType = "any" | "dot" | "plus" | "googlemail";

type Tab = "disposable" | "tempgmail" | "gmail";

const REFRESH_MS = 15000;

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

// ── Tab 1: Disposable Inbox (Guerrilla Mail) ───────────────────────

function DisposableInboxTab() {
  const [inbox, setInbox] = useState<GuerrillaInbox | null>(null);
  const [messages, setMessages] = useState<GuerrillaMessage[]>([]);
  const [selected, setSelected] = useState<GuerrillaFullMessage | null>(null);
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

  const fetchInbox = useCallback(async (sid: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const r = await fetch(`/api/guerrilla/inbox?sid_token=${encodeURIComponent(sid)}`);
      if (r.ok) {
        const d = await r.json() as { messages: GuerrillaMessage[] };
        setMessages(d.messages ?? []);
      }
    } catch {} finally { if (!silent) setLoadingMsgs(false); }
  }, []);

  const startPolling = useCallback((sid: string) => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setCountdown(REFRESH_MS / 1000);
    refreshTimer.current = setInterval(() => { fetchInbox(sid, true); setCountdown(REFRESH_MS / 1000); }, REFRESH_MS);
    countdownTimer.current = setInterval(() => setCountdown((c) => (c <= 1 ? REFRESH_MS / 1000 : c - 1)), 1000);
  }, [fetchInbox]);

  const createInbox = useCallback(async () => {
    setCreating(true); setError(null); setMessages([]); setSelected(null); setSelectedId(null);
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    try {
      const r = await fetch("/api/guerrilla/new");
      const d = await r.json() as GuerrillaInbox & { error?: string };
      if (!r.ok || !d.email) { setError(d.error ?? "Could not create inbox."); return; }
      setInbox(d); setError(null);
      toast({ title: "Inbox ready!", description: d.email });
      await fetchInbox(d.sid_token);
      startPolling(d.sid_token);
    } catch { setError("Network error. Please try again."); }
    finally { setCreating(false); }
  }, [fetchInbox, startPolling, toast]);

  const setCustomUsername = useCallback(async () => {
    if (!inbox || !customUser.trim()) return;
    try {
      const r = await fetch("/api/guerrilla/set-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: customUser.trim(), domain: inbox.domain, sid_token: inbox.sid_token }),
      });
      const d = await r.json() as GuerrillaInbox & { error?: string };
      if (!r.ok || !d.email) { toast({ title: "Error", description: d.error ?? "Could not update address.", variant: "destructive" }); return; }
      setInbox(d); setMessages([]); setSelected(null); setCustomUser(""); setShowCustomUser(false);
      toast({ title: "Address updated!", description: d.email });
    } catch { toast({ title: "Network error", variant: "destructive" }); }
  }, [inbox, customUser, toast]);

  const switchDomain = useCallback(async (newDomain: string) => {
    if (!inbox) return;
    setShowDomainDrop(false);
    try {
      const r = await fetch("/api/guerrilla/set-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: inbox.user, domain: newDomain, sid_token: inbox.sid_token }),
      });
      const d = await r.json() as GuerrillaInbox & { error?: string };
      if (!r.ok || !d.email) { toast({ title: "Error", description: d.error ?? "Could not switch domain.", variant: "destructive" }); return; }
      setInbox(d); setMessages([]); setSelected(null);
      toast({ title: "Domain switched!", description: d.email });
    } catch { toast({ title: "Network error", variant: "destructive" }); }
  }, [inbox, toast]);

  const openMessage = async (msg: GuerrillaMessage) => {
    setSelectedId(msg.mail_id); setLoadingMsg(true); setSelected(null);
    try {
      if (!inbox) return;
      const r = await fetch(`/api/guerrilla/message/${msg.mail_id}?sid_token=${encodeURIComponent(inbox.sid_token)}`);
      if (r.ok) {
        const d = await r.json() as GuerrillaFullMessage;
        setSelected(d);
        setMessages((ms) => ms.map((m) => m.mail_id === msg.mail_id ? { ...m, mail_read: "1" } : m));
      }
    } catch {} finally { setLoadingMsg(false); }
  };

  const copyAddress = () => {
    if (!inbox) return;
    navigator.clipboard.writeText(inbox.email);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Email address copied to clipboard." });
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    createInbox();
  }, [createInbox]);

  useEffect(() => () => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  }, []);

  const unread = messages.filter((m) => m.mail_read === "0").length;

  return (
    <div className="space-y-4">
      {/* Address card */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Your temporary email address</p>
            {inbox ? (
              <div className="flex flex-wrap items-center gap-0.5 font-mono text-base font-semibold">
                <span className="text-foreground">{inbox.user}</span>
                <span className="text-muted-foreground">@</span>
                <span className="text-cyan-400">{inbox.domain}</span>
              </div>
            ) : (
              <div className="h-6 bg-muted/60 rounded animate-pulse w-56 mt-1" />
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 mt-1">
            <Clock className="h-3 w-3" />{countdown}s
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={copyAddress} disabled={!inbox} size="sm"
            className="text-xs gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Address"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => inbox && fetchInbox(inbox.sid_token)} disabled={loadingMsgs || !inbox} className="text-xs gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loadingMsgs ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={createInbox} disabled={creating} className="text-xs gap-1.5">
            <Shuffle className="h-3.5 w-3.5" />{creating ? "Creating…" : "New Address"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCustomUser((v) => !v)} disabled={!inbox} className="text-xs gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />Custom Username
          </Button>

          {/* Domain switcher */}
          {inbox && (
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowDomainDrop((v) => !v)} className="text-xs gap-1.5">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />@{inbox.domain}
                <ChevronDown className="h-3 w-3" />
              </Button>
              {showDomainDrop && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden min-w-52">
                  {inbox.domains.map((d) => (
                    <button key={d} onClick={() => switchDomain(d)}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-muted/60 transition-colors font-mono ${d === inbox.domain ? "text-cyan-400 font-semibold bg-cyan-400/5" : "text-foreground/80"}`}>
                      @{d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom username input */}
        {showCustomUser && (
          <div className="flex gap-2 items-center pt-1 border-t border-border/40">
            <input
              value={customUser}
              onChange={(e) => setCustomUser(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setCustomUsername()}
              placeholder="Enter custom username…"
              className="flex-1 min-w-0 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
            <Button size="sm" onClick={setCustomUsername} disabled={!customUser.trim()} className="text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shrink-0">Set</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowCustomUser(false); setCustomUser(""); }} className="text-xs shrink-0">Cancel</Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <Button size="sm" variant="outline" onClick={createInbox} disabled={creating}
            className="text-xs gap-1.5 border-red-500/40 text-red-300 hover:bg-red-500/10 shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${creating ? "animate-spin" : ""}`} />Retry
          </Button>
        </div>
      )}

      {/* Split view */}
      <div className="grid md:grid-cols-5 gap-3 min-h-[380px]">
        {/* Message list */}
        <div className="md:col-span-2 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Inbox</span>
              {unread > 0 && <span className="h-4 min-w-4 px-1 text-[10px] bg-cyan-500 text-black rounded-full flex items-center justify-center font-bold">{unread}</span>}
            </div>
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
              <button key={msg.mail_id} onClick={() => openMessage(msg)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 border-b border-border/30 last:border-b-0 ${selectedId === msg.mail_id ? "bg-muted/20" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground/70 truncate">{msg.mail_from || "Unknown"}</p>
                    <p className={`text-sm truncate mt-0.5 ${msg.mail_read === "0" ? "font-semibold text-foreground" : "text-foreground/70"}`}>
                      {msg.mail_subject || "(No subject)"}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">{timeAgo(msg.mail_timestamp)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message reader */}
        <div className="md:col-span-3 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 bg-muted/20">
                <button onClick={() => { setSelected(null); setSelectedId(null); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-semibold truncate">{selected.subject || "(No subject)"}</p>
                  <p className="text-xs text-muted-foreground truncate">{selected.from}</p>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4" style={{ maxHeight: "360px" }}>
                {selected.body ? (
                  <div className="prose prose-invert prose-sm max-w-none text-sm" dangerouslySetInnerHTML={{ __html: selected.body }} />
                ) : (
                  <p className="text-sm text-muted-foreground">(Empty message)</p>
                )}
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
              {inbox && (
                <div className="flex items-center gap-2 text-xs bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-lg px-3 py-2">
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
        {[
          { icon: Zap, label: "9 domains available" },
          { icon: Clock, label: `Auto-refresh ${REFRESH_MS / 1000}s` },
          { icon: Settings2, label: "Custom usernames" },
          { icon: Mail, label: "No signup needed" },
        ].map(({ icon: Ic, label }) => (
          <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
            <Ic className="h-3 w-3" />{label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Temp Gmail (Gmailnator via RapidAPI) ────────────────────

const GMAIL_TYPES: { key: GmailType; label: string }[] = [
  { key: "any", label: "Any (random)" },
  { key: "dot", label: "@gmail.com · dot trick" },
  { key: "plus", label: "@gmail.com · plus trick" },
  { key: "googlemail", label: "@googlemail.com" },
];

function TempGmailTab() {
  const [gmailType, setGmailType] = useState<GmailType>("any");
  const [email, setEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<GmailnatorMessage[]>([]);
  const [selected, setSelected] = useState<GmailnatorFullMessage | null>(null);
  const [selectedMid, setSelectedMid] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiMissing, setApiMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const initialized = useRef(false);

  const generate = useCallback(async (type: GmailType = gmailType) => {
    setGenerating(true); setError(null); setApiMissing(false); setEmail(null); setMessages([]); setSelected(null); setSelectedMid(null);
    try {
      const r = await fetch("/api/temp-gmail/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const d = await r.json() as { email?: string; error?: string };
      if (r.status === 503) { setApiMissing(true); setError(d.error ?? "Gmailnator API not configured."); return; }
      if (!r.ok || !d.email) { setError(d.error ?? "Failed to generate address."); return; }
      setEmail(d.email);
    } catch { setError("Network error. Please try again."); }
    finally { setGenerating(false); }
  }, [gmailType]);

  const fetchMessages = useCallback(async (addr: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const r = await fetch("/api/temp-gmail/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr }),
      });
      if (r.ok) {
        const d = await r.json() as { messages: GmailnatorMessage[] };
        setMessages(d.messages ?? []);
      }
    } catch {} finally { if (!silent) setLoadingMsgs(false); }
  }, []);

  const openMessage = async (msg: GmailnatorMessage) => {
    if (!email) return;
    setSelectedMid(msg.mid); setLoadingMsg(true); setSelected(null);
    try {
      const r = await fetch("/api/temp-gmail/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mid: msg.mid }),
      });
      if (r.ok) { setSelected(await r.json() as GmailnatorFullMessage); }
    } catch {} finally { setLoadingMsg(false); }
  };

  const copyAddress = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: email });
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    generate("any");
  }, [generate]);

  const switchType = (type: GmailType) => {
    setGmailType(type);
    generate(type);
  };

  return (
    <div className="space-y-4">
      {/* Address card */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="h-4 w-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Your temporary Gmail address</p>
            {generating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating address…
              </div>
            ) : email ? (
              <p className="font-mono text-base font-semibold text-foreground">{email}</p>
            ) : (
              <p className="text-sm text-muted-foreground/60">—</p>
            )}
          </div>
          {email && (
            <button onClick={() => generate(gmailType)} disabled={generating}
              className="h-8 w-8 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 flex items-center justify-center transition-colors shrink-0 mt-0.5 disabled:opacity-40">
              <Shuffle className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Domain type pills */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Domain</p>
          <div className="flex flex-wrap gap-2">
            {GMAIL_TYPES.map(({ key, label }) => (
              <button key={key} onClick={() => switchType(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${gmailType === key ? "bg-red-500/20 border-red-400/50 text-red-300" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-muted/20"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Copy + refresh buttons */}
        {email && !apiMissing && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
            <Button onClick={copyAddress} size="sm" className="text-xs gap-1.5 bg-red-500 hover:bg-red-400 text-white font-semibold">
              {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Address"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => email && fetchMessages(email)} disabled={loadingMsgs} className="text-xs gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingMsgs ? "animate-spin" : ""}`} />Check Inbox
            </Button>
          </div>
        )}
      </div>

      {/* API not configured error */}
      {apiMissing && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <Button size="sm" variant="outline" onClick={() => generate(gmailType)} disabled={generating}
            className="text-xs gap-1.5 border-red-500/40 text-red-300 hover:bg-red-500/10 shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />Retry
          </Button>
        </div>
      )}

      {/* Generic error */}
      {error && !apiMissing && (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-400 shrink-0" />
          <p className="text-sm text-orange-300 flex-1">{error}</p>
          <Button size="sm" variant="outline" onClick={() => generate(gmailType)} disabled={generating}
            className="text-xs gap-1.5 border-orange-500/40 text-orange-300 hover:bg-orange-500/10 shrink-0">
            Retry
          </Button>
        </div>
      )}

      {/* Inbox */}
      {email && !apiMissing && (
        <div className="grid md:grid-cols-5 gap-3 min-h-[320px]">
          {/* Message list */}
          <div className="md:col-span-2 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Inbox</span>
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
              {!loadingMsgs && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
                  <MailOpen className="h-7 w-7 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground/60">No messages yet</p>
                  <p className="text-xs text-muted-foreground/40">Click "Check Inbox" after sending an email</p>
                </div>
              )}
              {messages.map((msg) => (
                <button key={msg.mid} onClick={() => openMessage(msg)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 border-b border-border/30 last:border-b-0 ${selectedMid === msg.mid ? "bg-muted/20" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground/70 truncate">{msg.from || "Unknown"}</p>
                      <p className="text-sm truncate mt-0.5 font-semibold text-foreground">{msg.subject || "(No subject)"}</p>
                    </div>
                    {msg.date && <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">{msg.date}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reader */}
          <div className="md:col-span-3 rounded-xl border border-border/60 bg-card/30 overflow-hidden flex flex-col">
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 bg-muted/20">
                  <button onClick={() => { setSelected(null); setSelectedMid(null); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-semibold truncate">{selected.subject || "(No subject)"}</p>
                    <p className="text-xs text-muted-foreground truncate">{selected.from}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4" style={{ maxHeight: "300px" }}>
                  {selected.content ? (
                    <div className="prose prose-invert prose-sm max-w-none text-sm" dangerouslySetInnerHTML={{ __html: selected.content }} />
                  ) : (
                    <p className="text-sm text-muted-foreground">(Empty message)</p>
                  )}
                </div>
              </>
            ) : loadingMsg ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm flex-1">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-6 gap-3">
                <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground/60">Select a message to read it</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* About section */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-red-400" />About Temp Gmail
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Generates real Gmail addresses (dot trick or plus variations) via Gmailnator. Emails sent to these addresses will appear in your actual Gmail inbox. This tab shows messages received at your generated address.
        </p>
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

// ── Main Page ──────────────────────────────────────────────────────

export default function TempMail() {
  const [tab, setTab] = useState<Tab>("disposable");
  useToolView("temp-mail");

  const TABS = [
    { key: "disposable" as Tab, label: "Disposable Inbox", icon: Inbox, color: "text-cyan-400" },
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

        {tab === "disposable" && <DisposableInboxTab />}
        {tab === "tempgmail" && <TempGmailTab />}
        {tab === "gmail" && <GmailTricksTab />}
      </div>
    </MiniToolLayout>
  );
}
