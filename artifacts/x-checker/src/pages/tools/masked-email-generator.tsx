import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { EyeOff, Copy, RefreshCw, CheckCircle2, Mail, Shield, Shuffle } from "lucide-react";

const ADJECTIVES = ["swift","quiet","bright","calm","safe","quick","cool","wise","bold","crisp","keen","neat","pure","sharp","smart","sleek","smooth","solid","steady","still"];
const NOUNS = ["inbox","mail","box","post","note","drop","relay","vault","proxy","shield","guard","filter","catch","gate","route","pass","link","node","port","bridge"];
const DOMAINS = ["protonmail.com","tutanota.com","fastmail.com","pm.me","duck.com","gmail.com","outlook.com","yahoo.com","icloud.com"];
const ALIAS_SERVICES = [
  { name: "SimpleLogin", url: "https://simplelogin.io", desc: "Open-source. Free tier: 10 aliases. Forwards to any inbox.", badge: "Open Source" },
  { name: "AnonAddy", url: "https://anonaddy.com", desc: "Open-source. Free tier: unlimited aliases. Self-hostable.", badge: "Free" },
  { name: "Apple Hide My Email", url: "https://support.apple.com/en-us/HT210425", desc: "Built into iCloud+. Creates random Apple-managed relay addresses.", badge: "iCloud+" },
  { name: "DuckDuckGo Email Protection", url: "https://duckduckgo.com/email/", desc: "Free @duck.com forwarding with tracker removal.", badge: "Free" },
  { name: "Firefox Relay", url: "https://relay.firefox.com", desc: "Mozilla-backed relay. Free tier: 5 aliases.", badge: "Free" },
];

function randomAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}.${noun}.${num}`;
}

function generateGmailPlus(base: string): string[] {
  const clean = base.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const tags = ["noreply","signup","shop","social","news","work","promo","alerts","temp","test"];
  return tags.map(t => `${clean}+${t}@gmail.com`).slice(0, 6);
}

const faqs = [
  { q: "What is a masked email address?", a: "A masked email is a forwarding address that hides your real inbox. When you give websites a masked address, they can't discover your true email. You receive messages at your real inbox through the relay, but can disable the alias at any time." },
  { q: "How is this different from a disposable email?", a: "Disposable emails are temporary and usually expire. Masked emails are permanent aliases that forward to your real inbox indefinitely — you just turn them off when you're done. They're better for services you actually want to use long-term without sharing your real address." },
  { q: "Do alias services read my emails?", a: "Reputable services like SimpleLogin and AnonAddy are open-source and privacy-focused. AnonAddy and SimpleLogin explicitly don't log email content. Always verify a service's privacy policy. Avoid closed-source services from advertising companies." },
  { q: "Can I reply from a masked address?", a: "Yes. Services like SimpleLogin and AnonAddy support replying through the alias, so the recipient never sees your real email. This is called two-way masking." },
  { q: "What is the Gmail + trick?", a: "You can append +anything to your Gmail username (e.g. you+shopping@gmail.com) and it still delivers to your inbox. This lets you create unlimited 'aliases' for filtering — but your base address is visible to the sender if they inspect the To header." },
];

const relatedTools = [
  { title: "Temp Mail", href: "/tools/temp-mail/tempemail", description: "Fully anonymous throwaway inbox — no account needed." },
  { title: "Email Privacy Checker", href: "/tools/email-privacy-checker", description: "Score your email address for privacy risks." },
  { title: "Email Validator", href: "/tools/email-validator", description: "Validate email address syntax and format." },
  { title: "Alias Email Explainer", href: "/tools/alias-email-explainer", description: "Complete guide to email aliasing services." },
];

export default function MaskedEmailGenerator() {
  const [alias, setAlias] = useState(randomAlias());
  const [domain, setDomain] = useState("protonmail.com");
  const [baseGmail, setBaseGmail] = useState("");
  const [gmailVariants, setGmailVariants] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const { toast } = useToast();
  useToolView("masked-email-generator");

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(key);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast({ title: "Copied!", description: text });
  }, [toast]);

  const regenerate = () => setAlias(randomAlias());

  const generateVariants = () => {
    if (!baseGmail.trim()) return;
    setGmailVariants(generateGmailPlus(baseGmail.trim()));
  };

  const fullAlias = `${alias}@${domain}`;

  return (
    <MiniToolLayout
      seoTitle="Masked Email Generator — Create Anonymous Email Aliases"
      seoDescription="Generate masked email aliases instantly. Protect your real inbox from spam, trackers, and data brokers. Free, no signup."
      icon={EyeOff}
      badge="Privacy Tool"
      title="Masked Email Generator"
      description="Generate anonymous email aliases that forward to your real inbox. Stop giving websites your actual email address."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-6">

        {/* Alias generator */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shuffle className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Random Alias Generator</h2>
          </div>
          <p className="text-xs text-muted-foreground">Generate a random alias pattern to use with an email aliasing service like SimpleLogin or AnonAddy.</p>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 font-mono text-sm text-foreground select-all break-all">
              {fullAlias}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={regenerate} className="gap-1.5 h-full">
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </Button>
              <Button size="sm" onClick={() => copy(fullAlias, "alias")} className="gap-1.5 h-full">
                {copiedIdx === "alias" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Choose forwarding domain</label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${domain === d ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
                >
                  @{d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gmail + variants */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Gmail Plus-Tag Variants</h2>
          </div>
          <p className="text-xs text-muted-foreground">Enter your Gmail username (without @gmail.com) to generate plus-tag variants for filtering. All deliver to your real inbox.</p>

          <div className="flex gap-2">
            <input
              value={baseGmail}
              onChange={e => setBaseGmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generateVariants()}
              placeholder="yourname"
              className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <Button onClick={generateVariants} size="sm" disabled={!baseGmail.trim()} className="shrink-0">
              Generate
            </Button>
          </div>

          {gmailVariants.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              {gmailVariants.map((v, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                  <span className="font-mono text-xs truncate text-foreground">{v}</span>
                  <button onClick={() => copy(v, `gv-${i}`)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {copiedIdx === `gv-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
          {gmailVariants.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Note: Gmail plus-tag addresses expose your base username to the sender. For true masking, use an aliasing service below.</p>
          )}
        </div>

        {/* Aliasing services */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Recommended Aliasing Services</h2>
          </div>
          <p className="text-xs text-muted-foreground">These services create real forwarding aliases. Your real inbox is never exposed to senders.</p>
          <div className="space-y-3">
            {ALIAS_SERVICES.map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 hover:border-primary/30 hover:bg-muted/40 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{s.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{s.badge}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 group-hover:text-primary transition-colors">Visit →</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </MiniToolLayout>
  );
}
