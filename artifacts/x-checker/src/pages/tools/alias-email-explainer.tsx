import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { useToolView } from "@/hooks/use-track";
import { ArrowRight, Shield, CheckCircle2, XCircle, Zap, ExternalLink, Mail, EyeOff, Settings } from "lucide-react";
import { Link } from "wouter";

const SERVICES = [
  {
    name: "SimpleLogin",
    url: "https://simplelogin.io",
    free: "10 aliases",
    paid: "$30/year for unlimited",
    openSource: true,
    twoWay: true,
    selfHost: true,
    encryption: false,
    highlights: ["Open source & audited", "2-way reply support", "Browser extension", "Custom domains", "Based in France (GDPR)"],
    verdict: "Best overall for privacy-conscious users.",
  },
  {
    name: "AnonAddy",
    url: "https://anonaddy.com",
    free: "Unlimited aliases",
    paid: "$12/year for more features",
    openSource: true,
    twoWay: true,
    selfHost: true,
    encryption: true,
    highlights: ["Unlimited free aliases", "PGP encryption support", "Self-hostable", "Custom domains", "Open source"],
    verdict: "Best free option. Unlimited aliases on the free plan.",
  },
  {
    name: "Apple Hide My Email",
    url: "https://support.apple.com/en-us/HT210425",
    free: "Included in iCloud+ ($0.99/mo)",
    paid: "Part of iCloud+ subscription",
    openSource: false,
    twoWay: false,
    selfHost: false,
    encryption: false,
    highlights: ["Built into iPhone/Mac", "Works with Sign in with Apple", "Managed in Settings", "Integrated with Safari autofill"],
    verdict: "Best for Apple ecosystem users. Zero setup required.",
  },
  {
    name: "DuckDuckGo Email Protection",
    url: "https://duckduckgo.com/email/",
    free: "Unlimited @duck.com aliases",
    paid: "Completely free",
    openSource: false,
    twoWay: false,
    selfHost: false,
    encryption: false,
    highlights: ["Completely free", "Removes email trackers", "@duck.com addresses", "Works in DDG browser"],
    verdict: "Best free no-setup option. Strips trackers from forwarded email.",
  },
  {
    name: "Firefox Relay",
    url: "https://relay.firefox.com",
    free: "5 aliases",
    paid: "$1.99/month for unlimited",
    openSource: true,
    twoWay: false,
    selfHost: false,
    encryption: false,
    highlights: ["Mozilla-backed", "Browser extension", "Phone masking in paid tier", "Open source"],
    verdict: "Good for Firefox users. Limited free tier.",
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "You create an alias", desc: "Instead of giving a website your real email, you create an alias like xyz123@simplelogin.com through your aliasing service." },
  { step: "2", title: "Website sends to the alias", desc: "Emails sent to xyz123@simplelogin.com are received by SimpleLogin's servers." },
  { step: "3", title: "Alias forwards to your inbox", desc: "SimpleLogin forwards the email to your real inbox. You receive it normally, but the sender never learns your real address." },
  { step: "4", title: "You can reply anonymously", desc: "With two-way aliases, replies are routed back through the alias — the recipient still only sees xyz123@simplelogin.com." },
  { step: "5", title: "Disable when done", desc: "If a service starts spamming you, turn off that alias. The emails stop. Your real inbox stays clean. No unsubscribing needed." },
];

const USE_CASES = [
  { title: "Sign up for newsletters", desc: "Give each newsletter a unique alias. If they sell your address, you'll know exactly which one — and you can turn it off." },
  { title: "Online shopping", desc: "Never give retailers your real email. They typically share it with 'marketing partners'. Use a unique alias per store." },
  { title: "Free trials & demos", desc: "Use a fresh alias for every free trial. Avoid the follow-up sales sequences without unsubscribing." },
  { title: "Public profiles & forums", desc: "Any email you post publicly will be harvested. Use an alias so you can shut it down later." },
  { title: "App sign-ups", desc: "Mobile apps often sell email data to advertisers. An alias per app means you keep control." },
];

const faqs = [
  { q: "What is an email alias?", a: "An email alias is a forwarding address that routes emails to your real inbox. The sender only ever sees the alias address — your real email stays hidden. Unlike disposable emails, aliases are permanent (until you turn them off) and you can reply through them." },
  { q: "How is an alias different from a + tag?", a: "Gmail plus tags (you+tag@gmail.com) are simple username extensions that still reveal your base email (you@gmail.com) to anyone who inspects the message headers. A real alias completely hides your actual address — the sender only sees the alias domain, never your real one." },
  { q: "Are email aliases safe?", a: "Reputable aliasing services (SimpleLogin, AnonAddy) are open-source and privacy-audited. They don't read your email content. AnonAddy supports PGP encryption so emails are encrypted in transit to your inbox. Always choose an open-source service with a clear privacy policy." },
  { q: "Can I use aliases on mobile?", a: "Yes. SimpleLogin and AnonAddy have browser extensions and mobile apps. Apple Hide My Email is built into iOS and works across all Apple apps. DuckDuckGo Email Protection works within the DuckDuckGo browser on mobile." },
  { q: "What happens if the alias service shuts down?", a: "Self-hosted solutions (SimpleLogin and AnonAddy both support self-hosting) mean you're never dependent on a third party. For hosted services, your emails would stop forwarding — but your real inbox and its existing emails are unaffected. This is why open-source, self-hostable options are preferred." },
];

const relatedTools = [
  { title: "Masked Email Generator", href: "/tools/masked-email-generator", description: "Generate random alias patterns instantly." },
  { title: "Email Privacy Checker", href: "/tools/email-privacy-checker", description: "Score your current email's privacy level." },
  { title: "Temp Mail", href: "/tools/temp-mail/tempemail", description: "Fully anonymous throwaway inbox — no signup needed." },
  { title: "Disposable Email Guide", href: "/tools/disposable-email-guide", description: "Guide to disposable vs permanent alias emails." },
];

export default function AliasEmailExplainer() {
  useToolView("alias-email-explainer");

  return (
    <MiniToolLayout
      seoTitle="Email Aliasing Explained — Best Alias Email Services Compared"
      seoDescription="Complete guide to email aliasing: what it is, how it works, best services (SimpleLogin, AnonAddy, Apple Hide My Email) compared side by side. Free."
      icon={EyeOff}
      badge="Privacy Guide"
      title="Alias Email Explainer"
      description="Everything you need to know about email aliasing — how it protects your inbox, the best free services, and how to get started in under 5 minutes."
      faqs={faqs}
      relatedTools={relatedTools}
    >
      <div className="space-y-6">

        {/* How it works */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> How Email Aliasing Works</h2>
          <div className="space-y-3">
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 text-xs font-bold text-primary mt-0.5">{s.step}</div>
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> When to Use Email Aliases</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {USE_CASES.map(u => (
              <div key={u.title} className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
                <p className="text-sm font-medium flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{u.title}</p>
                <p className="text-xs text-muted-foreground">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services comparison */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-5">
          <h2 className="font-semibold flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Best Alias Email Services</h2>
          <div className="space-y-4">
            {SERVICES.map(s => (
              <div key={s.name} className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{s.name}</span>
                    {s.openSource && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-medium">Open Source</span>}
                    {s.twoWay && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20 font-medium">2-Way</span>}
                  </div>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /><strong className="text-foreground">Free:</strong> {s.free}</span>
                  {s.selfHost && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Self-hostable</span>}
                  {!s.selfHost && <span className="flex items-center gap-1 text-muted-foreground/60"><XCircle className="h-3 w-3" /> Cloud only</span>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.highlights.map(h => (
                    <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 border border-border/50 text-muted-foreground">{h}</span>
                  ))}
                </div>
                <p className="text-xs text-foreground font-medium border-t border-border/40 pt-2 mt-1 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 text-primary shrink-0" /> {s.verdict}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick start CTA */}
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5">
          <h3 className="font-semibold mb-2 text-cyan-400">Not ready to set up an alias service?</h3>
          <p className="text-sm text-muted-foreground mb-3">Use our <strong className="text-foreground">Temp Mail</strong> tool for one-time signups — no account or setup needed. Get a throwaway inbox in seconds.</p>
          <Link href="/tools/temp-mail/tempemail">
            <button className="inline-flex items-center gap-2 bg-cyan-500 text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors">
              Open Temp Mail <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

      </div>
    </MiniToolLayout>
  );
}
