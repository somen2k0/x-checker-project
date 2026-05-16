import { useSearch } from "wouter";
import { Copy, RefreshCw, Mail, History, ExternalLink, Bell, Shield, Zap, Key } from "lucide-react";

function BrowserFrame({ children, url = "https://xtoolkit.live" }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="w-[1280px] h-[800px] bg-[#202124] flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Chrome title bar */}
      <div className="h-9 bg-[#35363a] flex items-center px-3 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
      </div>

      {/* Chrome toolbar */}
      <div className="h-10 bg-[#35363a] flex items-center px-2 gap-2 shrink-0 border-t border-black/20">
        {/* Back/Fwd/Refresh */}
        <div className="flex items-center gap-0.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#9aa0a6]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#3c4043]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#9aa0a6]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </div>
        </div>

        {/* Omnibox */}
        <div className="flex-1 h-7 bg-[#202124] rounded-full flex items-center gap-2 px-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34a853" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="text-[#e8eaed] text-xs">{url}</span>
        </div>

        {/* Extension icons in toolbar */}
        <div className="flex items-center gap-1 pl-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#9aa0a6]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v3.8h1.5c1.5 0 2.7 1.2 2.7 2.7s-1.2 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.5 1.2-2.7 2.7-2.7 1.5 0 2.7 1.2 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z"/></svg>
          </div>
          {/* X Toolkit icon — highlighted (popup open) */}
          <div className="w-7 h-7 rounded-md bg-[#6366f1] flex items-center justify-center shadow-md shadow-[#6366f1]/40 ring-2 ring-[#6366f1]/40">
            <svg width="14" height="14" viewBox="0 0 180 180" fill="none"><line x1="54" y1="54" x2="126" y2="126" stroke="white" strokeWidth="20" strokeLinecap="round"/><line x1="126" y1="54" x2="54" y2="126" stroke="white" strokeWidth="20" strokeLinecap="round"/><circle cx="137" cy="137" r="10" fill="white" fillOpacity="0.5"/></svg>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#9aa0a6]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </div>
        </div>
      </div>

      {/* Browser content area */}
      <div className="flex-1 relative overflow-hidden">
        {children}

        {/* Popup anchor — top right */}
        <div className="absolute top-0 right-[38px]">
          {/* Caret */}
          <div className="ml-auto mr-2 w-3 h-2 overflow-hidden">
            <div className="w-3 h-3 bg-[#080c14] border border-[#1e2a3a] rotate-45 -translate-y-1.5 mx-auto" />
          </div>
          {/* Popup shadow glow */}
          <div className="absolute inset-0 rounded-2xl blur-xl bg-[#6366f1]/10" />
        </div>
      </div>
    </div>
  );
}

function PopupShell({ activeTab, children }: { activeTab: 0 | 1 | 2; children: React.ReactNode }) {
  const tabs = [
    { label: "Temp Mail", icon: Mail },
    { label: "Gmail", icon: Mail },
    { label: "History", icon: History },
  ];
  return (
    <div className="absolute top-0 right-[6px] w-[340px] rounded-2xl border border-[#1e2a3a] bg-[#080c14] shadow-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15)" }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#1e2a3a] bg-[#080c14]">
        <div className="w-5 h-5 rounded-md bg-[#6366f1] flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 180 180" fill="none"><line x1="54" y1="54" x2="126" y2="126" stroke="white" strokeWidth="24" strokeLinecap="round"/><line x1="126" y1="54" x2="54" y2="126" stroke="white" strokeWidth="24" strokeLinecap="round"/></svg>
        </div>
        <span className="font-bold text-white text-xs">X Toolkit</span>
        <span className="text-[10px] text-[#71767b]">Temp Email</span>
        <div className="flex-1" />
        <ExternalLink className="w-3 h-3 text-[#71767b]" />
      </div>
      {/* Content */}
      <div className="flex flex-col" style={{ height: 420 }}>
        {children}
      </div>
      {/* Tab bar */}
      <div className="flex border-t border-[#1e2a3a]">
        {tabs.map(({ label, icon: Icon }, i) => (
          <div key={label} className={`flex-1 flex flex-col items-center py-2 text-[9px] font-medium gap-1 border-t-2 transition-colors ${i === activeTab ? "border-[#6366f1] text-[#6366f1]" : "border-transparent text-[#71767b]"}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SCREENSHOT 1: Temp Email with inbox ─────────────────────────────────── */
function Screenshot1() {
  return (
    <BrowserFrame url="https://xtoolkit.live/tools/temp-mail/tempemail">
      {/* Background website */}
      <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-start pt-12 px-8">
        <div className="text-center mb-8">
          <div className="text-4xl font-black text-white mb-2">Temp Mail</div>
          <div className="text-[#71767b] text-base">Instant disposable email — no signup needed</div>
        </div>
        <div className="w-full max-w-lg h-48 rounded-2xl border border-[#1e2a3a] bg-[#0f1623] flex items-center justify-center opacity-40">
          <Mail className="w-12 h-12 text-[#6366f1]" />
        </div>
      </div>

      {/* Popup */}
      <PopupShell activeTab={0}>
        {/* Provider tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-[#1e2a3a] shrink-0">
          {["Guerrilla", "1secmail"].map((p, i) => (
            <div key={p} className={`flex-1 text-center py-1 rounded-md text-[10px] font-medium border ${i === 0 ? "border-[#6366f1]/60 bg-[#6366f1]/10 text-[#6366f1]" : "border-[#1e2a3a] text-[#71767b]"}`}>
              {p}
            </div>
          ))}
        </div>

        {/* Email address row */}
        <div className="px-3 py-2.5 border-b border-[#1e2a3a] bg-[#0a1020] shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#0f1623] border border-[#1e2a3a] rounded-lg px-3 py-1.5">
              <span className="text-[#6366f1] font-mono text-xs font-semibold">swift.inbox</span>
              <span className="text-[#71767b] font-mono text-xs">@mailto.plus</span>
            </div>
            <div className="w-7 h-7 bg-[#0f1623] border border-[#1e2a3a] rounded-lg flex items-center justify-center">
              <Copy className="w-3 h-3 text-[#71767b]" />
            </div>
            <div className="w-7 h-7 bg-[#0f1623] border border-[#1e2a3a] rounded-lg flex items-center justify-center">
              <RefreshCw className="w-3 h-3 text-[#71767b]" />
            </div>
          </div>
        </div>

        {/* OTP card */}
        <div className="mx-3 mt-2.5 p-2.5 bg-[#0c2a1e] border border-[#00ba7c44] rounded-xl flex items-center gap-2.5 shrink-0">
          <span className="text-base">🔑</span>
          <div className="flex-1">
            <div className="text-[9px] text-[#71767b] uppercase tracking-wider mb-0.5">OTP Code Detected</div>
            <div className="text-lg font-black text-[#00ba7c] font-mono tracking-widest">482916</div>
            <div className="text-[9px] text-[#71767b]">noreply@accounts.google.com</div>
          </div>
          <div className="px-2 py-1 bg-[#1a3a2a] border border-[#00ba7c66] rounded-md text-[#00ba7c] text-[10px] font-bold cursor-pointer hover:bg-[#1f4a33] transition-colors">
            Copy
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e2a3a] mx-0 mt-2">
          {[
            { from: "noreply@accounts.google.com", subj: "Your verification code is 482916", time: "just now", verify: true },
            { from: "no-reply@github.com", subj: "Confirm your email address", time: "4m ago", verify: true },
            { from: "hello@notion.so", subj: "Welcome to Notion! Get started →", time: "18m ago", verify: false },
            { from: "support@vercel.com", subj: "Your deployment is live", time: "1h ago", verify: false },
          ].map((m, i) => (
            <div key={i} className="flex items-start gap-2 py-2 px-3 hover:bg-[#0f1623] cursor-pointer transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#1e2a3a] flex items-center justify-center text-[10px] font-bold text-[#71767b] shrink-0 mt-0.5">
                {m.from[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-white truncate">{m.from}</span>
                  {m.verify && <span className="text-[8px] font-bold px-1 py-px rounded-full bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 shrink-0">OTP</span>}
                  <span className="text-[10px] text-[#71767b] ml-auto shrink-0">{m.time}</span>
                </div>
                <div className="text-[11px] text-[#b0b8c1] truncate">{m.subj}</div>
              </div>
            </div>
          ))}
        </div>
      </PopupShell>
    </BrowserFrame>
  );
}

/* ── SCREENSHOT 2: OTP Detection focused ────────────────────────────────── */
function Screenshot2() {
  return (
    <BrowserFrame url="https://accounts.google.com/signup">
      {/* Background: Google signup page */}
      <div className="w-full h-full bg-white flex flex-col items-center justify-center">
        <div className="w-96 bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <svg viewBox="0 0 48 48" fill="none"><path d="M43.6 20.5H24v7h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8.1 3.1l5.3-5.3C34.2 7 29.3 4.8 24 4.8 12.3 4.8 2.8 14.3 2.8 26S12.3 47.2 24 47.2c11 0 20.8-8 20.8-21.2 0-1.4-.1-2.4-.3-3.5h-.9z" fill="#4285F4"/><path d="M6.3 15.5l6.2 4.5C14.1 16.6 18.7 14 24 14c3.1 0 5.9 1.2 8.1 3.1l5.3-5.3C34.2 7 29.3 4.8 24 4.8c-7.6 0-14.2 4.4-17.7 10.7z" fill="#EA4335"/></svg>
          </div>
          <div className="text-2xl font-semibold text-gray-800 mb-1">Create your Google Account</div>
          <div className="text-gray-500 text-sm mb-6">Enter verification code</div>
          <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-400 text-sm mb-4">Enter 6-digit code...</div>
          <div className="text-xs text-gray-400 mb-4">We sent a verification code to s****@mailto.plus</div>
          <div className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium">Verify</div>
        </div>
      </div>

      {/* Popup — OTP focused */}
      <PopupShell activeTab={0}>
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-[#1e2a3a] bg-[#0a1020] shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#0f1623] border border-[#1e2a3a] rounded-lg px-3 py-1.5">
              <span className="text-[#6366f1] font-mono text-xs font-semibold">swift.inbox</span>
              <span className="text-[#71767b] font-mono text-xs">@mailto.plus</span>
            </div>
            <div className="w-7 h-7 bg-[#0f1623] border border-[#1e2a3a] rounded-lg flex items-center justify-center">
              <Copy className="w-3 h-3 text-[#71767b]" />
            </div>
          </div>
        </div>

        {/* Big OTP highlight */}
        <div className="mx-3 mt-3 p-4 bg-[#0c2a1e] border-2 border-[#00ba7c] rounded-2xl shrink-0" style={{ boxShadow: "0 0 20px rgba(0,186,124,0.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔑</span>
            <div>
              <div className="text-[10px] text-[#00ba7c] font-bold uppercase tracking-wider">Code detected — click to copy</div>
              <div className="text-[10px] text-[#71767b]">Google Account Security</div>
            </div>
          </div>
          <div className="text-4xl font-black text-[#00ba7c] font-mono tracking-[0.3em] text-center my-3">482916</div>
          <div className="w-full py-2 bg-[#00ba7c] rounded-xl text-[#080c14] text-sm font-black text-center cursor-pointer">
            ⚡ Copy Code
          </div>
          <div className="text-[9px] text-[#71767b] text-center mt-2">From noreply@accounts.google.com · just now</div>
        </div>

        {/* Remaining messages */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e2a3a] mt-2">
          {[
            { from: "no-reply@github.com", subj: "Confirm your email address", time: "4m ago" },
            { from: "hello@notion.so", subj: "Welcome to Notion!", time: "20m ago" },
          ].map((m, i) => (
            <div key={i} className="flex items-start gap-2 py-2 px-3">
              <div className="w-6 h-6 rounded-full bg-[#1e2a3a] flex items-center justify-center text-[10px] font-bold text-[#71767b] shrink-0 mt-0.5">
                {m.from[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-white truncate">{m.from}</span>
                  <span className="text-[10px] text-[#71767b] ml-auto shrink-0">{m.time}</span>
                </div>
                <div className="text-[11px] text-[#b0b8c1] truncate">{m.subj}</div>
              </div>
            </div>
          ))}
        </div>
      </PopupShell>
    </BrowserFrame>
  );
}

/* ── SCREENSHOT 3: Gmail Tab ─────────────────────────────────────────────── */
function Screenshot3() {
  return (
    <BrowserFrame url="https://xtoolkit.live">
      {/* Website background */}
      <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 px-12">
        <div className="text-center">
          <div className="text-5xl font-black text-white mb-3 leading-tight">Free online tools<br /><span className="text-[#6366f1]">for SEO, creators & devs</span></div>
          <div className="text-[#71767b] text-base">X account checker · AI bio generator · JSON formatter · Temp email · and 50+ more</div>
        </div>
        <div className="flex gap-4">
          {["X Tools", "Dev Tools", "SEO Tools", "Email Tools"].map(cat => (
            <div key={cat} className="px-4 py-2 rounded-full border border-[#1e2a3a] text-[#71767b] text-sm">{cat}</div>
          ))}
        </div>
      </div>

      {/* Popup — Gmail tab */}
      <PopupShell activeTab={1}>
        <div className="flex-1 overflow-y-auto">
          {/* Gmail tab description */}
          <div className="px-3 py-3 border-b border-[#1e2a3a] bg-[#0a1020] shrink-0">
            <div className="text-[10px] text-[#71767b] leading-relaxed">
              Generate Gmail addresses that deliver to a real temporary inbox — no new account needed.
            </div>
          </div>

          {/* Base address input */}
          <div className="px-3 py-2.5 border-b border-[#1e2a3a] shrink-0">
            <div className="text-[9px] text-[#71767b] uppercase tracking-wider mb-1.5">Base Gmail address</div>
            <div className="bg-[#0f1623] border border-[#1e2a3a] rounded-lg px-3 py-1.5">
              <span className="text-white font-mono text-xs">yourname</span>
              <span className="text-[#71767b] font-mono text-xs">@gmail.com</span>
            </div>
          </div>

          {/* Generated variants */}
          <div className="px-3 py-2 flex-1">
            <div className="text-[9px] text-[#71767b] uppercase tracking-wider mb-2">Generated variants</div>
            <div className="space-y-1.5">
              {[
                { addr: "your.name@gmail.com", type: "Dot trick", note: "Forwards to same inbox" },
                { addr: "yourname+shop1@gmail.com", type: "Plus trick", note: "Label as 'shop1'" },
                { addr: "yourname+trial23@gmail.com", type: "Plus trick", note: "Label as 'trial23'" },
                { addr: "y.o.u.r.n.a.m.e@gmail.com", type: "Dot trick", note: "Max dots variation" },
                { addr: "yourname+verify@gmail.com", type: "Plus trick", note: "Label as 'verify'" },
              ].map((v, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#0f1623] border border-[#1e2a3a] rounded-lg px-2.5 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-white truncate">{v.addr}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[8px] px-1 py-px rounded border border-[#1e2a3a] text-[#71767b]">{v.type}</span>
                      <span className="text-[9px] text-[#71767b]">{v.note}</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-[#1e2a3a] rounded-md flex items-center justify-center shrink-0">
                    <Copy className="w-2.5 h-2.5 text-[#71767b]" />
                  </div>
                </div>
              ))}
            </div>

            {/* temp.tf link */}
            <div className="mt-3 flex items-center gap-2 p-2.5 bg-[#0c1a2e] border border-[#1e3a5a] rounded-xl">
              <span className="text-base">📧</span>
              <div className="flex-1">
                <div className="text-[10px] text-[#4da6ff] font-semibold">Open temp Gmail inbox</div>
                <div className="text-[9px] text-[#71767b]">temp.tf — receive emails at your Gmail address</div>
              </div>
              <ExternalLink className="w-3 h-3 text-[#4da6ff]" />
            </div>
          </div>
        </div>
      </PopupShell>
    </BrowserFrame>
  );
}

/* ── Router ───────────────────────────────────────────────────────────────── */
export default function CwsScreenshots() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const n = params.get("n") ?? "1";

  const screens: Record<string, React.ReactNode> = {
    "1": <Screenshot1 />,
    "2": <Screenshot2 />,
    "3": <Screenshot3 />,
  };

  return (
    <div style={{ width: 1280, height: 800, overflow: "hidden", background: "#000" }}>
      {screens[n] ?? <Screenshot1 />}
    </div>
  );
}
