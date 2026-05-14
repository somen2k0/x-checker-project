import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToolView } from "@/hooks/use-track";
import { MailWarning, Shield, CheckCircle2, XCircle, AlertTriangle, Info, TrendingDown } from "lucide-react";

interface SpamFactor {
  label: string;
  risk: "low" | "medium" | "high";
  info: string;
  score: number;
}

const SPAM_TRIGGER_WORDS = ["free","win","winner","cash","prize","click","offer","deal","discount","urgent","limited","act now","guaranteed","no risk","subscribe","newsletter","promo","sale","buy","purchase","order","cheap","affordable","special","exclusive","congratulation","selected","chosen","claim","reply","unsubscribe","optout","remove","email marketing","bulk","list","campaign","broadcast","mass","commercial","advertise","promotion","marketing","contact list","opt in","permission","consent","double opt"];
const GENERIC_USERNAMES = ["info","admin","contact","hello","support","noreply","no-reply","sales","marketing","newsletter","mail","email","webmaster","postmaster","abuse","security","help","enquiries","enquiry","office","team","staff","hr","billing","accounts","accounting","finance","legal","compliance","service","services","orders","booking","reservations","feedback","survey","career","careers","jobs","recruitment","press","media","pr","communications","partnerships","business","corporate","general","main","primary"];
const RISKY_DOMAINS = ["gmail.com","yahoo.com","hotmail.com","aol.com","outlook.com"];
const DISPOSABLE_DOMAINS = ["mailinator.com","guerrillamail.com","10minutemail.com","tempmail.com","throwam.com","sharklasers.com","guerrillamail.info","grr.la","1secmail.com","1secmail.org","1secmail.net","esiix.com","xojxe.com","yoggm.com","wwjmp.com"];

function analyzeSpamRisk(email: string): { score: number; level: string; color: string; factors: SpamFactor[] } {
  const lower = email.toLowerCase().trim();
  const [localPart = "", domainPart = ""] = lower.split("@");
  const factors: SpamFactor[] = [];

  // 1. Disposable domain
  const isDisposable = DISPOSABLE_DOMAINS.some(d => domainPart === d || domainPart.endsWith("." + d));
  factors.push({
    label: "Disposable/temporary domain",
    risk: isDisposable ? "high" : "low",
    info: isDisposable ? "This domain is associated with temporary email services. Most spam filters will reject or deprioritize messages to/from it." : "Domain is not a known temporary email provider.",
    score: isDisposable ? 35 : 0,
  });

  // 2. Generic username
  const isGeneric = GENERIC_USERNAMES.some(u => localPart === u || localPart.startsWith(u + ".") || localPart.startsWith(u + "_") || localPart.startsWith(u + "-"));
  factors.push({
    label: "Generic/role-based username",
    risk: isGeneric ? "high" : "low",
    info: isGeneric ? "Generic addresses like info@, admin@, and contact@ receive extremely high volumes of spam and are common targets for harvesting." : "Username appears to be personal rather than role-based.",
    score: isGeneric ? 30 : 0,
  });

  // 3. Numbers suggesting bulk/auto-generated
  const hasBulkNumbers = /\d{5,}/.test(localPart);
  factors.push({
    label: "Numeric patterns suggesting auto-generation",
    risk: hasBulkNumbers ? "medium" : "low",
    info: hasBulkNumbers ? "Long numeric strings in usernames are common in auto-generated bulk email accounts and may be flagged by spam systems." : "No long numeric patterns detected.",
    score: hasBulkNumbers ? 15 : 0,
  });

  // 4. Mass-market email provider
  const isMassMarket = RISKY_DOMAINS.includes(domainPart);
  factors.push({
    label: "High-volume mass-market provider",
    risk: isMassMarket ? "medium" : "low",
    info: isMassMarket ? "Free webmail providers (Gmail, Yahoo, Outlook) are heavily used for spam. Many anti-spam filters apply stricter rules to these domains." : "Domain is not a major free webmail provider.",
    score: isMassMarket ? 10 : 0,
  });

  // 5. Very short username
  const isTooShort = localPart.length < 3;
  factors.push({
    label: "Username too short",
    risk: isTooShort ? "medium" : "low",
    info: isTooShort ? "Very short usernames (under 3 characters) are uncommon for legitimate personal use and are often associated with spammers testing harvested lists." : "Username length appears normal.",
    score: isTooShort ? 10 : 0,
  });

  // 6. Spam-trigger keywords in username
  const hasTriggerWord = SPAM_TRIGGER_WORDS.some(w => localPart.includes(w.replace(/\s/g, "")));
  factors.push({
    label: "Spam-trigger keywords in username",
    risk: hasTriggerWord ? "high" : "low",
    info: hasTriggerWord ? "Your username contains words commonly associated with spam (e.g. 'promo', 'deal', 'free', 'newsletter'). These trigger spam filters." : "No common spam-trigger keywords detected in the username.",
    score: hasTriggerWord ? 25 : 0,
  });

  const total = factors.reduce((s, f) => s + f.score, 0);
  const capped = Math.min(total, 100);

  let level = "Low Risk";
  let color = "text-emerald-400";
  if (capped >= 60) { level = "High Risk"; color = "text-red-400"; }
  else if (capped >= 30) { level = "Medium Risk"; color = "text-amber-400"; }

  return { score: capped, level, color, factors };
}

const TIPS = [
  { title: "Use a unique address for each service", desc: "Email aliasing tools like SimpleLogin create a unique address per site, so you can trace where spam comes from and turn it off." },
  { title: "Avoid generic role-based addresses for personal use", desc: "If you must use info@ or contact@, make sure your mail client has strong spam filtering configured." },
  { title: "Use a catch-all domain", desc: "Setting up a custom domain with catch-all means you can use unique sub-addresses without managing individual inboxes." },
  { title: "Check breach databases", desc: "Use HaveIBeenPwned.com to check if your email has appeared in known data breaches — breached emails get significantly more spam." },
];

const faqs = [
  { q: "What is spam risk for an email address?", a: "Spam risk describes how likely your email address is to be targeted by bulk senders, harvested by data brokers, or flagged by anti-spam systems. Addresses with generic names, disposable domains, or trigger keywords in the username have higher risk." },
  { q: "Why do generic email addresses get more spam?", a: "Addresses like info@, admin@, and contact@ are typically guessed by spam bots rather than harvested from leaks. They're publicly expected to exist at any domain, so bots try them systematically." },
  { q: "Does a low spam risk mean I won't get spam?", a: "No. Spam depends on many factors beyond the address itself — whether it's been exposed in breaches, shared with advertisers, or scraped from websites. This checker evaluates structural risk only." },
  { q: "Is this the same as an email deliverability checker?", a: "No. Deliverability (whether your outbound emails reach the inbox) is a separate concern. This tool evaluates inbound spam risk for the address you entered." },
  { q: "How can I reduce spam?", a: "Use unique aliases per service (SimpleLogin, AnonAddy), avoid using your real email on public websites, use unsubscribe links only for legitimate services, and enable your email provider's spam filtering." },
];

const relatedTools = [
  { title: "Email Privacy Checker", href: "/tools/email-privacy-checker", description: "Score your email address privacy across 7 factors." },
  { title: "Masked Email Generator", href: "/tools/masked-email-generator", description: "Generate anonymous forwarding aliases." },
  { title: "Email Leak Checker", href: "/tools/email-leak-checker", description: "Learn how email leaks happen and how to check." },
  { title: "Temp Mail", href: "/tools/temp-mail/tempemail", description: "Get a throwaway inbox for one-time signups." },
];

export default function SpamRiskChecker() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeSpamRisk> | null>(null);
  useToolView("spam-risk-checker");

  const check = useCallback(() => {
    if (!email.trim()) return;
    setResult(analyzeSpamRisk(email.trim()));
  }, [email]);

  return (
    <MiniToolLayout
      seoTitle="Email Spam Risk Checker — Check Your Inbox's Spam Vulnerability"
      seoDescription="Check your email address for spam risk patterns. Understand why certain addresses attract more spam and how to protect your inbox. Free, browser-based."
      icon={MailWarning}
      badge="Privacy Tool"
      title="Spam Risk Checker"
      description="Analyze your email address for patterns that attract spam bots, data harvesters, and bulk senders. Understand your risk and how to reduce it."
      faqs={faqs}
      relatedTools={relatedTools}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex gap-2">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              placeholder="your@email.com"
              type="email"
              className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono"
            />
            <Button onClick={check} disabled={!email.trim()}>Check Risk</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Fully browser-based — your email is never sent to any server.
          </p>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/40 p-5 flex items-center gap-5">
              <div className={`h-20 w-20 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${result.score >= 60 ? "border-red-400/30 bg-red-400/10" : result.score >= 30 ? "border-amber-400/30 bg-amber-400/10" : "border-emerald-400/30 bg-emerald-400/10"}`}>
                <span className={`text-2xl font-bold ${result.color}`}>{result.score}</span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-0.5 ${result.color}`}>{result.level}</div>
                <p className="text-sm text-muted-foreground">
                  {result.score >= 60 ? "This address has several characteristics that attract spam. Review the factors below." :
                   result.score >= 30 ? "Moderate risk. Some patterns may attract spam bots or harvesters." :
                   "This address has low structural spam risk based on its pattern."}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-3">
              <h3 className="font-semibold text-sm mb-4">Risk Factors</h3>
              {result.factors.map((f, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${f.risk === "low" ? "border-emerald-400/20 bg-emerald-400/5" : f.risk === "medium" ? "border-amber-400/20 bg-amber-400/5" : "border-red-400/20 bg-red-400/5"}`}>
                  {f.risk === "low" ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> : f.risk === "medium" ? <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className={`text-sm font-medium ${f.risk === "low" ? "text-emerald-400" : f.risk === "medium" ? "text-amber-400" : "text-red-400"}`}>{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && (
          <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center">
            <TrendingDown className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Enter your email address above to check its spam risk profile.</p>
          </div>
        )}

        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Tips to Reduce Spam Risk</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIPS.map((t, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">This tool checks structural patterns only. To check if your email appeared in a data breach, use <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">HaveIBeenPwned.com</a>.</p>
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
