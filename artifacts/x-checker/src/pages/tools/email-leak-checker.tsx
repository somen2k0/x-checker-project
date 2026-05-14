import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { useToolView } from "@/hooks/use-track";
import { AlertOctagon, ShieldCheck, ExternalLink, Clock, Mail, Database, Eye, Lock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const LEAK_SOURCES = [
  { name: "Data Breaches", icon: Database, desc: "Companies you've signed up with are hacked. Hackers publish databases containing email addresses, passwords, and personal data. Your email ends up on spam lists and dark-web marketplaces.", frequency: "Billions of records exposed annually" },
  { name: "Email Harvesting", icon: Eye, desc: "Bots crawl websites, forums, and social media to collect email addresses posted publicly. Any email you've ever posted on a public page is likely in a harvesting database.", frequency: "Constant, automated" },
  { name: "List Selling", icon: Mail, desc: "Some services you sign up for sell or share your email with 'partners'. Always read the privacy policy for mentions of 'third-party sharing' or 'marketing partners'.", frequency: "Very common, often legal" },
  { name: "Phishing Confirmation", icon: AlertOctagon, desc: "If you click links in phishing emails, you confirm your address is active. Active addresses are worth more to spammers and are shared further.", frequency: "Each click = 10x more spam" },
  { name: "Public WHOIS Records", icon: ExternalLink, desc: "Historically, domain WHOIS records included the registrant's email. While most are now hidden, older registrations may still expose your address.", frequency: "Legacy issue, still affects older domains" },
  { name: "Forum & Comment Posts", icon: Clock, desc: "Old forum registrations, comment sections, and early social networks often exposed emails. Even deleted accounts may appear in historical archives.", frequency: "Historical data persists forever" },
];

const PROTECTION_STEPS = [
  { step: "1", title: "Check HaveIBeenPwned", desc: "Visit haveibeenpwned.com and enter your email. Troy Hunt's database tracks over 12 billion accounts from known breaches. Free and trustworthy.", href: "https://haveibeenpwned.com", cta: "Check now" },
  { step: "2", title: "Enable breach alerts", desc: "HaveIBeenPwned offers free email notifications when your address appears in a new breach. Enable these for every email you own.", href: "https://haveibeenpwned.com/NotifyMe", cta: "Set up alerts" },
  { step: "3", title: "Use unique aliases per service", desc: "If each website gets a different alias (via SimpleLogin or AnonAddy), you can instantly trace which service leaked your address and disable just that alias.", href: "/tools/masked-email-generator", cta: "Generate alias", internal: true },
  { step: "4", title: "Change breached passwords immediately", desc: "If your email is found in a breach, assume the associated password is compromised. Change it on that service and any others where you reused it.", href: null, cta: null },
  { step: "5", title: "Enable two-factor authentication", desc: "Even if your password is leaked, 2FA prevents attackers from accessing your accounts. Use an authenticator app (Google Authenticator, Authy) rather than SMS if possible.", href: null, cta: null },
  { step: "6", title: "Use a password manager", desc: "Password managers like Bitwarden (free, open-source) generate and store unique passwords per site. This limits damage when any single service is breached.", href: "https://bitwarden.com", cta: "Get Bitwarden" },
];

const KNOWN_BREACHES = [
  { name: "Adobe (2013)", records: "153M accounts", data: "Email, encrypted passwords, password hints" },
  { name: "LinkedIn (2012/2021)", records: "700M accounts", data: "Email, hashed passwords, phone numbers, professional data" },
  { name: "Facebook (2019)", records: "533M accounts", data: "Phone numbers, emails, full names, location" },
  { name: "Canva (2019)", records: "137M accounts", data: "Email, names, city, passwords (bcrypt)" },
  { name: "Twitch (2021)", records: "2.7M accounts", data: "Email, hashed passwords, IP addresses" },
  { name: "Twitter/X (2022)", records: "235M emails", data: "Email addresses, public profile data" },
];

const faqs = [
  { q: "What is an email leak?", a: "An email leak occurs when your email address is exposed without your consent — through data breaches (company hacks), email harvesting bots, list selling by services you signed up for, or phishing. Once leaked, your address spreads across spam networks and is nearly impossible to fully remove." },
  { q: "How do I find out if my email was leaked?", a: "The most reliable free resource is HaveIBeenPwned.com (haveibeenpwned.com), maintained by security researcher Troy Hunt. It tracks over 12 billion accounts from known public breaches. Enter your email and it shows which breaches included it." },
  { q: "Can I remove my email from breach databases?", a: "No — data from public breaches is already distributed across thousands of servers and dark web markets. You cannot remove it. The only effective approach is to stop using the compromised address, change associated passwords, and use unique aliases for new signups going forward." },
  { q: "Does this tool check if my email was leaked?", a: "No. This is an educational guide explaining how leaks happen and what to do about them. To actually check your email, use HaveIBeenPwned.com — it's free, trustworthy, and used by governments and security professionals worldwide." },
  { q: "What should I do if my email was in a breach?", a: "Immediately change the password on the breached service. Change it on any other services where you used the same password. Enable two-factor authentication where available. Monitor your other accounts for unusual activity. Consider switching to a fresh email address for important services." },
];

const relatedTools = [
  { title: "Masked Email Generator", href: "/tools/masked-email-generator", description: "Create anonymous aliases so future leaks are traceable." },
  { title: "Email Privacy Checker", href: "/tools/email-privacy-checker", description: "Score your email's privacy characteristics." },
  { title: "Spam Risk Checker", href: "/tools/spam-risk-checker", description: "Check if your email pattern attracts spam bots." },
  { title: "Temp Mail", href: "/tools/temp-mail/tempemail", description: "Use a throwaway address instead of your real one." },
];

export default function EmailLeakChecker() {
  useToolView("email-leak-checker");

  return (
    <MiniToolLayout
      seoTitle="Email Leak Checker — How to Check if Your Email Was Leaked"
      seoDescription="Learn how email leaks happen, where to check if your address was exposed in a breach, and exactly what to do about it. Free educational guide."
      icon={AlertOctagon}
      badge="Privacy Guide"
      title="Email Leak Checker"
      description="Understand how email leaks happen, where to check if your address was exposed, and exactly what steps to take to protect yourself."
      faqs={faqs}
      relatedTools={relatedTools}
    >
      <div className="space-y-6">

        {/* Check CTA */}
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
          <div className="flex items-start gap-3">
            <AlertOctagon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Want to check right now?</h2>
              <p className="text-sm text-muted-foreground mb-3">Use <strong className="text-foreground">HaveIBeenPwned.com</strong> — it tracks 12+ billion accounts from known breaches. Free, trusted by security professionals worldwide.</p>
              <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer">
                <button className="inline-flex items-center gap-2 bg-amber-400 text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors">
                  Check HaveIBeenPwned <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* How leaks happen */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> How Email Leaks Happen</h2>
          <div className="grid gap-3">
            {LEAK_SOURCES.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium uppercase tracking-wide">{s.frequency}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protection steps */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> What to Do About It</h2>
          <div className="space-y-3">
            {PROTECTION_STEPS.map(s => (
              <div key={s.step} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 text-xs font-bold text-primary">{s.step}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-0.5">{s.title}</p>
                  <p className="text-xs text-muted-foreground mb-2">{s.desc}</p>
                  {s.cta && s.href && (
                    s.internal ? (
                      <Link href={s.href}>
                        <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                          {s.cta} <CheckCircle2 className="h-3 w-3" />
                        </button>
                      </Link>
                    ) : (
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                        {s.cta} <ExternalLink className="h-3 w-3" />
                      </a>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notable breaches */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Notable Breaches You May Be In</h2>
          <p className="text-xs text-muted-foreground">If you've used these services, your email address may have been exposed. Check HaveIBeenPwned to confirm.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Service</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Records</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Data Exposed</th>
                </tr>
              </thead>
              <tbody>
                {KNOWN_BREACHES.map((b, i) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-medium">{b.name}</td>
                    <td className="py-2.5 px-3 text-red-400">{b.records}</td>
                    <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">{b.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MiniToolLayout>
  );
}
