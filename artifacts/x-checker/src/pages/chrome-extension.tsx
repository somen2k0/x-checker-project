import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/SeoHead";
import {
  Download, Star, Shield, Zap, Bell, Clock, Mail, Smartphone,
  Copy, RefreshCw, History, Key, ChevronRight, ExternalLink, Check,
} from "lucide-react";

const STORE_URL = "https://chrome.google.com/webstore"; // replace with actual CWS URL after publishing
const VERSION = "1.0.0";

const features = [
  {
    icon: Zap,
    title: "Instant inbox generation",
    desc: "Opens to a ready-to-use temp email the moment you click the icon. Three providers: mail.tm, Guerrilla Mail, and 1secmail.",
  },
  {
    icon: Key,
    title: "OTP & verification code detection",
    desc: "Automatically detects 4–8 digit codes in emails and shows a 1-click copy button so you never have to manually scan through messages.",
  },
  {
    icon: Bell,
    title: "Desktop notifications",
    desc: "Get alerted the moment a new email arrives — even when the popup is closed. Works in the background without draining resources.",
  },
  {
    icon: RefreshCw,
    title: "Auto-refresh every 15 seconds",
    desc: "Your inbox polls continuously in the background via a lightweight service worker. No manual refreshing needed.",
  },
  {
    icon: Mail,
    title: "Temp Gmail addresses",
    desc: "Generate Gmail dot-trick and plus-trick addresses that deliver to a real temporary inbox. Also supports Outlook and Hotmail.",
  },
  {
    icon: History,
    title: "Inbox history",
    desc: "All your generated addresses are saved locally and survive browser restarts. Easily copy or revisit any past inbox.",
  },
  {
    icon: Shield,
    title: "Zero tracking, zero accounts",
    desc: "No login, no data collection, no telemetry. Everything is stored locally on your device using Chrome's storage API.",
  },
  {
    icon: Copy,
    title: "Keyboard shortcut",
    desc: "Press Alt+Shift+C anywhere to instantly copy your active temp email address to the clipboard — no popup needed.",
  },
];

const steps = [
  {
    n: "1",
    title: "Install from Chrome Web Store",
    desc: "Click the button below to open the Chrome Web Store listing and click \"Add to Chrome\".",
  },
  {
    n: "2",
    title: "Pin it to your toolbar",
    desc: "Click the puzzle-piece icon (🧩) → find X Toolkit → click the pin icon so it's always one click away.",
  },
  {
    n: "3",
    title: "Click the icon to open",
    desc: "Click the X Toolkit icon in your toolbar. A temp inbox is generated automatically — ready to copy and use.",
  },
];

const faqs = [
  {
    q: "Is the X Toolkit Chrome extension free?",
    a: "Yes, completely free. There are no premium tiers, no subscriptions, and no feature limits. The extension connects to the same free API that powers xtoolkit.live.",
  },
  {
    q: "Which browsers does it work on?",
    a: "The extension is built for Chromium-based browsers: Chrome, Brave, Edge, Arc, and Opera. Firefox support is planned for a future release.",
  },
  {
    q: "What data does the extension collect?",
    a: "None. The extension stores your active inbox credentials and history locally using Chrome's storage API. Nothing is sent to our servers beyond the API calls needed to generate and check your inbox.",
  },
  {
    q: "What permissions does it need and why?",
    a: "storage (to remember your inbox across sessions), notifications (to alert you of new emails), alarms (for background polling every 15 seconds), contextMenus (for the right-click \"Copy active email\" option), and clipboardWrite (to copy addresses and OTP codes). It only connects to xtoolkit.live.",
  },
  {
    q: "Does it work when the popup is closed?",
    a: "Yes. A Manifest V3 service worker polls your inbox every 15 seconds in the background and sends a desktop notification when new mail arrives.",
  },
  {
    q: "Can I use it alongside xtoolkit.live?",
    a: "They are independent. The extension manages its own inbox state locally; the website runs fresh sessions. Use whichever is more convenient — both connect to the same backend.",
  },
];

export default function ChromeExtensionPage() {
  return (
    <Layout>
      <SeoHead
        title="X Toolkit Chrome Extension — Free Temp Email in Your Browser"
        description="Install the free X Toolkit Chrome Extension to generate disposable email inboxes, auto-detect OTP codes, and get notified of new emails — directly from your browser toolbar."
        path="/chrome-extension"
        keywords="temp email chrome extension, disposable email extension, temp mail browser extension, temporary email chrome, otp detector extension, guerrilla mail extension"
        faqs={faqs}
        extraSchemas={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "X Toolkit – Temp Email",
            applicationCategory: "BrowserApplication",
            operatingSystem: "Chrome",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description:
              "A free Chrome extension for generating and monitoring disposable email inboxes directly from the browser toolbar. Supports mail.tm, Guerrilla Mail, 1secmail, and temp Gmail addresses.",
            author: { "@type": "Organization", name: "X Toolkit", url: "https://xtoolkit.live" },
          },
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/8 border border-primary/20 rounded-full px-3 py-1 mb-6">
            <Download className="w-3 h-3" /> Chrome Extension · v{VERSION} · Free
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Temp Email,{" "}
            <span className="text-primary">right in your toolbar</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            The X Toolkit Chrome Extension gives you instant disposable email inboxes, automatic OTP
            detection, and background notifications — without opening any website.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full text-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Add to Chrome — It's Free
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <Link href="/tools/temp-mail/tempemail" className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors">
              Use the web version instead <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { label: "Completely free", icon: Star },
              { label: "Zero accounts needed", icon: Shield },
              { label: "3 email providers", icon: Mail },
              { label: "Manifest V3", icon: Zap },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Extension preview mockup ──────────────────────────────────────── */}
      <section className="border-b border-border/40 py-14 bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-[#080c14] shadow-2xl overflow-hidden font-sans text-[13px]">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#1e2a3a] bg-[#080c14]">
                <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center text-white font-black text-xs">X</div>
                <span className="font-bold text-white text-xs">Toolkit</span>
                <span className="text-[10px] text-[#71767b]">Temp Email</span>
                <div className="flex-1" />
                <ExternalLink className="w-3 h-3 text-[#71767b]" />
              </div>

              {/* Provider tabs */}
              <div className="flex gap-1 px-3 py-2 border-b border-[#1e2a3a]">
                {["mail.tm", "Guerrilla", "1secmail"].map((p, i) => (
                  <div key={p} className={`flex-1 text-center py-1 rounded-md text-[10px] font-medium border ${i === 0 ? "border-primary/60 bg-primary/10 text-primary" : "border-[#1e2a3a] text-[#71767b]"}`}>
                    {p}
                  </div>
                ))}
              </div>

              {/* Email address row */}
              <div className="px-3 py-2.5 border-b border-[#1e2a3a] bg-[#0a1020]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#0f1623] border border-[#1e2a3a] rounded-lg px-3 py-1.5">
                    <span className="text-primary font-mono text-xs font-semibold">swift.inbox</span>
                    <span className="text-[#71767b] font-mono text-xs">@mailto.plus</span>
                  </div>
                  <div className="w-7 h-7 bg-[#0f1623] border border-[#1e2a3a] rounded-lg flex items-center justify-center">
                    <Copy className="w-3 h-3 text-[#71767b]" />
                  </div>
                  <div className="w-7 h-7 bg-[#0f1623] border border-[#1e2a3a] rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-3 h-3 text-[#71767b]" />
                  </div>
                  <div className="h-7 px-2.5 bg-[#1d2e42] border border-primary/60 rounded-lg flex items-center gap-1 text-primary text-[10px] font-semibold">
                    + New
                  </div>
                </div>
              </div>

              {/* OTP card */}
              <div className="mx-3 mt-2.5 p-2.5 bg-[#0c2a1e] border border-[#00ba7c44] rounded-xl flex items-center gap-2.5">
                <span className="text-base">🔑</span>
                <div className="flex-1">
                  <div className="text-[9px] text-[#71767b] uppercase tracking-wider mb-0.5">Latest Code</div>
                  <div className="text-lg font-black text-[#00ba7c] font-mono tracking-widest">482916</div>
                  <div className="text-[10px] text-[#71767b]">From noreply@accounts.google.com</div>
                </div>
                <div className="px-2 py-1 bg-[#1a3a2a] border border-[#00ba7c66] rounded-md text-[#00ba7c] text-[10px] font-semibold">
                  Copy
                </div>
              </div>

              {/* Message rows */}
              <div className="mt-2 px-3 pb-3 space-y-0 divide-y divide-[#1e2a3a]">
                {[
                  { from: "noreply@accounts.google.com", subj: "Your verification code", time: "just now", verify: true },
                  { from: "no-reply@github.com", subj: "Confirm your email address", time: "2m ago", verify: true },
                  { from: "hello@notion.so", subj: "Welcome to Notion!", time: "18m ago", verify: false },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-2 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#1e2a3a] flex items-center justify-center text-[10px] font-bold text-[#71767b] shrink-0">
                      {m.from[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-white truncate">{m.from}</span>
                        {m.verify && <span className="text-[8px] font-bold px-1 py-px rounded-full bg-primary/10 text-primary border border-primary/20">Verify</span>}
                        <span className="text-[10px] text-[#71767b] ml-auto shrink-0">{m.time}</span>
                      </div>
                      <div className="text-[11px] text-[#b0b8c1] truncate">{m.subj}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tab bar */}
              <div className="flex border-t border-[#1e2a3a]">
                {[{ label: "Temp Mail", active: true }, { label: "Gmail", active: false }, { label: "History", active: false }].map(({ label, active }) => (
                  <div key={label} className={`flex-1 flex flex-col items-center py-2 text-[9px] font-medium gap-1 border-t-2 ${active ? "border-primary text-primary" : "border-transparent text-[#71767b]"}`}>
                    <Mail className="w-3.5 h-3.5" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Everything you need, nothing you don't</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built lean and fast. The extension adds under 220 KB to Chrome and uses a background service worker with a minimal memory footprint.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/3 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to install ───────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border/40 bg-muted/10">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Install in 60 seconds</h2>
            <p className="text-muted-foreground">Works on Chrome, Brave, Edge, and Arc.</p>
          </div>
          <div className="space-y-4">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex gap-4 items-start p-4 rounded-xl border border-border/60 bg-card">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full text-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Add to Chrome — Free
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Permissions explained ─────────────────────────────────────────── */}
      <section className="py-16 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Permissions explained</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">Minimal permissions. Each one has a clear reason.</p>
          <div className="divide-y divide-border/60 rounded-xl border border-border/60 overflow-hidden">
            {[
              { perm: "storage", why: "Saves your active inbox and history locally — nothing is sent to our servers." },
              { perm: "notifications", why: "Alerts you when a new email arrives, even when the popup is closed." },
              { perm: "alarms", why: "Runs a background timer to check your inbox every 15 seconds." },
              { perm: "contextMenus", why: "Adds a right-click option to copy your active temp email instantly." },
              { perm: "clipboardWrite", why: "Copies email addresses and OTP codes to your clipboard on click." },
            ].map(({ perm, why }) => (
              <div key={perm} className="flex items-start gap-3 px-4 py-3 bg-card">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-mono text-xs font-semibold text-foreground">{perm}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {why}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Host permission: <code className="font-mono">https://xtoolkit.live/*</code> only. No other domains.
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border/40 bg-muted/10">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="p-4 rounded-xl border border-border/60 bg-card">
                <h3 className="font-semibold text-sm mb-2">{q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to stop giving out your real email?</h2>
          <p className="text-muted-foreground mb-8">
            Install the extension and never manually visit a temp mail site again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full text-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Add to Chrome — It's Free
            </a>
            <Link href="/tools/temp-mail/tempemail" className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Use web version <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
