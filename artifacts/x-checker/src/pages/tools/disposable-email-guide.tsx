import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { useToolView } from "@/hooks/use-track";
import { BookOpen, CheckCircle2, XCircle, ArrowRight, Shield, AlertTriangle, Inbox, EyeOff, Zap } from "lucide-react";
import { Link } from "wouter";

const PROS = [
  { title: "Protect your real inbox from spam", desc: "Any email that starts to spam you gets thrown away with the address — no unsubscribing needed." },
  { title: "Maintain anonymity online", desc: "Sites can't link your disposable email to your real identity, reducing your trackable digital footprint." },
  { title: "Bypass single-use verification walls", desc: "Register for services requiring email verification without handing over a permanent address." },
  { title: "Test email integrations as a developer", desc: "Instantly create as many test inboxes as you need without a real provider or setup." },
  { title: "Avoid 'email capture' friction", desc: "Access gated content without feeding your real address into a marketing funnel." },
];

const CONS = [
  { title: "No long-term account recovery", desc: "If you lose access to the service requiring the disposable email, you can't recover the account." },
  { title: "Many services block disposable domains", desc: "Banks, government services, and some apps maintain blocklists of known disposable domains." },
  { title: "Not end-to-end encrypted", desc: "Disposable email providers can see message content. Never use them for sensitive communications." },
  { title: "Public inboxes exist", desc: "On some providers, anyone who knows your address can read your inbox. Don't use them for passwords or private messages." },
  { title: "Messages may expire", desc: "Emails older than 1–24 hours are typically deleted automatically. Not suitable for reference storage." },
];

const WHEN_TO_USE = [
  { title: "✓ Sign up for a forum or community", level: "good" },
  { title: "✓ Download a whitepaper or ebook", level: "good" },
  { title: "✓ Try a free SaaS trial", level: "good" },
  { title: "✓ Register for a one-time webinar", level: "good" },
  { title: "✓ Testing your own email flows", level: "good" },
  { title: "✓ Avoid a marketing drip campaign", level: "good" },
  { title: "✗ Banking or financial services", level: "bad" },
  { title: "✗ Government or official accounts", level: "bad" },
  { title: "✗ Services you'll need long-term", level: "bad" },
  { title: "✗ Any sensitive communications", level: "bad" },
  { title: "✗ Password resets for important accounts", level: "bad" },
  { title: "✗ Identity verification (KYC)", level: "bad" },
];

const PROVIDERS_TABLE = [
  { name: "X Toolkit Temp Mail", desc: "16 domains, Guerrilla Mail + 1secMail, browser-persistent session, no signup", bestFor: "All general use", internal: true, href: "/tools/temp-mail/tempemail" },
  { name: "Guerrilla Mail", desc: "Custom usernames, multiple domains, reply support, 1 hour lifetime", bestFor: "Development & testing", href: "https://www.guerrillamail.com" },
  { name: "10MinuteMail", desc: "Self-destructing inbox, simple UI, 10-minute default lifetime", bestFor: "Ultra-quick one-time use", href: "https://10minutemail.com" },
  { name: "Mailinator", desc: "Unlimited public inboxes, no creation needed, powerful API for devs", bestFor: "Developers & QA teams", href: "https://mailinator.com" },
];

const faqs = [
  { q: "What is a disposable email address?", a: "A disposable (temporary) email address is a throwaway inbox you can use once or for a short time. It receives real emails like any normal inbox, but you abandon it afterward — taking the spam with it. Your real email address remains clean and private." },
  { q: "Is it legal to use a disposable email?", a: "Yes, completely. Using a disposable email is no different from having two email accounts. The only edge case: some services' terms of service prohibit creating multiple accounts, and using a new temp address to create a second account might violate those terms (not the use of the temp email itself)." },
  { q: "How long do disposable emails last?", a: "It depends on the provider. Some (like 10MinuteMail) expire after 10 minutes. Others (like our Temp Mail tool) persist for your browser session. Guerrilla Mail inboxes last about 1 hour, while 1secmail addresses are available as long as the session is active." },
  { q: "Can someone else read my temporary inbox?", a: "On providers using shared inboxes (like Mailinator), anyone who knows your address can access it. On providers using session-based addresses (like Guerrilla Mail), only someone with your specific session token can access it. Never send sensitive information to a temporary inbox." },
  { q: "What's the difference between disposable email and alias email?", a: "Disposable emails are temporary and tied to no real account — you abandon them. Alias emails are permanent forwarding addresses that relay mail to your real inbox indefinitely, with the ability to disable specific aliases. For permanent privacy, use aliases. For one-time signups, use disposable." },
];

const relatedTools = [
  { title: "Temp Mail", href: "/tools/temp-mail/tempemail", description: "Get a disposable inbox instantly — no signup, 16 domains." },
  { title: "Alias Email Explainer", href: "/tools/alias-email-explainer", description: "When to use permanent aliases instead of disposable email." },
  { title: "Masked Email Generator", href: "/tools/masked-email-generator", description: "Generate permanent anonymous email aliases." },
  { title: "Email Privacy Checker", href: "/tools/email-privacy-checker", description: "Score your real email's privacy characteristics." },
];

export default function DisposableEmailGuide() {
  useToolView("disposable-email-guide");

  return (
    <MiniToolLayout
      seoTitle="Disposable Email Guide — What It Is, When to Use It, Best Providers"
      seoDescription="Complete guide to disposable email addresses: pros, cons, when to use them, best free providers compared, and when to use an alias instead. Free."
      icon={BookOpen}
      badge="Privacy Guide"
      title="Disposable Email Guide"
      description="Everything about disposable email addresses — when they protect you, when they backfire, and which provider to use in each situation."
      faqs={faqs}
      relatedTools={relatedTools}
    >
      <div className="space-y-6">

        {/* Quick start */}
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-cyan-400 mb-1">Need a temp email right now?</h2>
            <p className="text-sm text-muted-foreground">Open a throwaway inbox in one click — no account, no signup, 16 domains.</p>
          </div>
          <Link href="/tools/temp-mail/tempemail">
            <button className="inline-flex items-center gap-2 bg-cyan-500 text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-cyan-400 transition-colors shrink-0 whitespace-nowrap">
              <Inbox className="h-4 w-4" /> Open Temp Mail
            </button>
          </Link>
        </div>

        {/* Pros */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Advantages of Disposable Email</h2>
          <div className="space-y-2">
            {PROS.map(p => (
              <div key={p.title} className="flex items-start gap-3 p-3 rounded-lg border border-emerald-400/15 bg-emerald-400/5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cons */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Limitations & Risks</h2>
          <div className="space-y-2">
            {CONS.map(c => (
              <div key={c.title} className="flex items-start gap-3 p-3 rounded-lg border border-amber-400/15 bg-amber-400/5">
                <XCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* When to use / not use */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> When to Use (and When Not to)</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {WHEN_TO_USE.map((w, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border ${w.level === "good" ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" : "border-red-400/20 bg-red-400/5 text-red-300"}`}>
                {w.title}
              </div>
            ))}
          </div>
        </div>

        {/* Providers */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Best Disposable Email Providers</h2>
          <div className="space-y-3">
            {PROVIDERS_TABLE.map(p => (
              <div key={p.name} className="flex items-start justify-between gap-3 p-4 rounded-lg border border-border/50 bg-muted/20 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{p.name}</span>
                    {p.internal && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-medium">This site</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{p.desc}</p>
                  <p className="text-xs text-primary font-medium">Best for: {p.bestFor}</p>
                </div>
                {p.internal ? (
                  <Link href={p.href}>
                    <button className="shrink-0 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
                      Open <ArrowRight className="h-3 w-3" />
                    </button>
                  </Link>
                ) : (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs border border-border/60 px-3 py-1.5 rounded-lg hover:bg-muted/60 transition-colors flex items-center gap-1 text-muted-foreground">
                    Visit <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* When alias is better */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">When a permanent alias is better</h3>
              <p className="text-sm text-muted-foreground mb-3">For services you'll use long-term — subscriptions, accounts, apps — a permanent email alias is better than disposable. You get the same privacy protection but the address never expires, and you can reply anonymously.</p>
              <Link href="/tools/alias-email-explainer">
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  Learn about alias email services <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </MiniToolLayout>
  );
}
